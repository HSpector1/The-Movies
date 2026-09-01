#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { link, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const foundryRoot = path.resolve(appRoot, '..');
const sourceCataloguePath = path.join(foundryRoot, '11_return-package', 'audition-app-catalogue.provisional.json');
const radioRoot = path.join(foundryRoot, '06_radio', 'demos-v2');
const publicRoot = path.join(appRoot, 'public');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash('sha256').update(bytes).digest('hex');
}

async function verifyFile(filePath, expectedHash) {
  const info = await stat(filePath);
  assert(info.isFile(), `not a file: ${filePath}`);
  const actualHash = await sha256(filePath);
  assert(actualHash === expectedHash, `hash mismatch: ${filePath}`);
  return { bytes: info.size, sha256: actualHash };
}

async function linkVerified(sourcePath, destinationPath, expectedHash) {
  assert(!sourcePath.includes('/02_raw/'), `raw audio may not enter the audition app: ${sourcePath}`);
  assert(
    sourcePath.startsWith(path.join(foundryRoot, '04_processed') + path.sep)
      || sourcePath.startsWith(radioRoot + path.sep),
    `source is outside the authorized derivative roots: ${sourcePath}`,
  );
  const source = await verifyFile(sourcePath, expectedHash);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  try {
    await link(sourcePath, destinationPath);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const existingHash = await sha256(destinationPath);
    assert(existingHash === expectedHash, `refusing to overwrite non-matching asset: ${destinationPath}`);
  }
  const destination = await verifyFile(destinationPath, expectedHash);
  return { ...destination, sourcePath, destinationPath, sourceBytes: source.bytes };
}

async function main() {
  const source = await readJson(sourceCataloguePath);
  assert(source.schema === 'project-studio-audition-catalogue-provisional/v1', 'unexpected source catalogue schema');
  assert(source.status === 'PROTOTYPE_READY_FOR_OWNER_AUDITION', 'unexpected catalogue status');
  assert(source.blind_protocol?.reveal_rule === 'AFTER_RATING_SUBMITTED', 'blind reveal rule changed');
  assert(source.blind_protocol?.network_required === false, 'catalogue unexpectedly requires a network');
  assert(source.blind_protocol?.telemetry === false, 'catalogue unexpectedly enables telemetry');
  assert(source.public_entries.length === 54, 'expected 54 music audition entries');
  assert(Object.keys(source.hidden_reveal_index).length === 54, 'expected 54 hidden reveal records');

  const items = [];
  const reveal = {};
  const assets = [];
  const seenCandidates = new Set();

  for (const entry of source.public_entries) {
    const hidden = source.hidden_reveal_index[entry.audition_id];
    assert(hidden, `missing reveal record for ${entry.audition_id}`);
    assert(hidden.unlock_rule === 'AFTER_RATING_SUBMITTED', `unexpected reveal rule for ${entry.audition_id}`);
    assert(!seenCandidates.has(hidden.candidate_id), `duplicate candidate: ${hidden.candidate_id}`);
    seenCandidates.add(hidden.candidate_id);

    await verifyFile(hidden.metadata_path, hidden.metadata_sha256);
    const metadata = await readJson(hidden.metadata_path);
    assert(metadata.candidate_id === hidden.candidate_id, `metadata candidate mismatch for ${entry.audition_id}`);
    assert(metadata.family_id === hidden.family_id, `metadata family mismatch for ${entry.audition_id}`);
    assert(metadata.rights_status === 'PROTOTYPE_READY_FOR_OWNER_AUDITION', `rights status mismatch for ${entry.audition_id}`);
    assert(metadata.derivatives.aac_preview.path === entry.preview.path, `preview binding mismatch for ${entry.audition_id}`);
    assert(metadata.derivatives.aac_preview.sha256 === entry.preview.sha256, `preview hash binding mismatch for ${entry.audition_id}`);

    const tier = hidden.shortlist_role.startsWith('PROVISIONAL PICK') ? 'primary' : 'alternate';
    const epochCode = `E${String(entry.epoch_order).padStart(2, '0')}`;
    const audioRelative = `audio/music/${entry.audition_id}.m4a`;
    assets.push(await linkVerified(entry.preview.path, path.join(publicRoot, audioRelative), entry.preview.sha256));

    let seam;
    if (tier === 'primary') {
      const seamRecord = metadata.derivatives.seam_audition;
      assert(seamRecord, `primary is missing seam audition: ${entry.audition_id}`);
      const seamRelative = `audio/music/${entry.audition_id}-seam.wav`;
      assets.push(await linkVerified(seamRecord.path, path.join(publicRoot, seamRelative), seamRecord.sha256));
      seam = `/${seamRelative}`;
    }

    items.push({
      id: entry.audition_id,
      kind: 'music',
      tier,
      epoch: entry.epoch_alias,
      epochCode,
      blindCode: entry.blind_label,
      title: `Music candidate ${entry.blind_label}`,
      audio: `/${audioRelative}`,
      ...(seam ? { seam } : {}),
      durationSeconds: entry.preview.duration_seconds,
      status: entry.prototype_status,
    });
    reveal[entry.audition_id] = {
      candidateId: hidden.candidate_id,
      familyId: hidden.family_id,
      family: hidden.prompt_family,
      title: `${hidden.shortlist_role} · ${hidden.candidate_id}`,
      shortlistRole: hidden.shortlist_role,
      machineLabel: hidden.machine_label,
      stableTrackId: hidden.stable_track_id,
      seed: hidden.seed,
    };
  }

  const radioPrograms = [
    ['EARLY-STUDIO', 'RAD-01'],
    ['POSTWAR', 'RAD-02'],
    ['DIGITAL-ERA', 'RAD-03'],
  ];
  for (const [slug, blindCode] of radioPrograms) {
    const programRoot = path.join(radioRoot, slug);
    const metadata = await readJson(path.join(programRoot, 'METADATA.json'));
    assert(metadata.program_slug === slug, `radio slug mismatch: ${slug}`);
    assert(metadata.status === 'RADIO CONCEPT PROTOTYPE', `radio status mismatch: ${slug}`);
    assert(metadata.rights_status === 'PROTOTYPE_ONLY', `radio rights mismatch: ${slug}`);
    const previewRecord = metadata.artifacts.find((entry) => entry.relative_path.endsWith('-BROADCAST-PREVIEW.m4a'));
    assert(previewRecord, `radio metadata does not register a broadcast preview: ${slug}`);
    const previewName = previewRecord.relative_path;
    const sourcePath = path.join(programRoot, previewName);
    const audioRelative = `audio/radio/${slug}.m4a`;
    assets.push(await linkVerified(sourcePath, path.join(publicRoot, audioRelative), previewRecord.sha256));
    const id = `RADIO-${slug}`;
    items.push({
      id,
      kind: 'radio',
      tier: 'radio-demo',
      epoch: metadata.epoch_alias,
      epochCode: metadata.epoch_code,
      blindCode,
      title: `Radio reel ${blindCode}`,
      audio: `/${audioRelative}`,
      durationSeconds: metadata.preview_probe.duration_seconds,
      status: 'RADIO_CONCEPT_PROTOTYPE',
    });
    reveal[id] = {
      family: `Radio concept program · ${metadata.voice_anchor}`,
      title: metadata.title,
      stableTrackId: `RADIO-${slug}`,
      shortlistRole: 'RADIO CONCEPT PROTOTYPE',
    };
  }

  assert(items.filter((item) => item.tier === 'primary').length === 27, 'expected 27 primary entries');
  assert(items.filter((item) => item.tier === 'alternate').length === 27, 'expected 27 alternate entries');
  assert(items.filter((item) => item.tier === 'radio-demo').length === 3, 'expected 3 radio entries');
  assert(assets.length === 84, 'expected 54 previews, 27 seam checks, and 3 radio previews');

  const sourceCatalogueHash = await sha256(sourceCataloguePath);
  const generatedUtc = new Date().toISOString();
  const publicCatalogue = {
    schemaVersion: '1.1.0',
    generatedUtc,
    status: 'PROTOTYPE_READY_FOR_OWNER_AUDITION',
    blindProtocol: {
      revealRule: 'AFTER_RATING_SUBMITTED',
      identitiesSeparated: true,
      networkRequired: false,
      telemetry: false,
    },
    sourceCatalogueSha256: sourceCatalogueHash,
    items,
  };
  const revealCatalogue = {
    schemaVersion: '1.0.0',
    generatedUtc,
    status: 'LOCAL_REVEAL_INDEX_AFTER_RATING',
    sourceCatalogueSha256: sourceCatalogueHash,
    reveal,
  };
  const manifest = {
    schemaVersion: '1.0.0',
    generatedUtc,
    counts: {
      musicPreviews: 54,
      primarySeamChecks: 27,
      radioPreviews: 3,
      totalAssets: assets.length,
    },
    policy: 'AUDITION_DERIVATIVES_ONLY; NO_RAW_AUDIO; HARDLINK_WHEN_NEW; NO_OVERWRITE',
    sourceCatalogue: {
      filename: path.basename(sourceCataloguePath),
      sha256: sourceCatalogueHash,
    },
    assets: assets.map(({ destinationPath, bytes, sha256: hash }) => ({
      relativePath: path.relative(publicRoot, destinationPath),
      bytes,
      sha256: hash,
    })),
  };

  await mkdir(path.join(publicRoot, 'data'), { recursive: true });
  await writeFile(path.join(publicRoot, 'data', 'catalogue.json'), `${JSON.stringify(publicCatalogue, null, 2)}\n`);
  await writeFile(path.join(publicRoot, 'data', 'reveal.json'), `${JSON.stringify(revealCatalogue, null, 2)}\n`);
  await writeFile(path.join(publicRoot, 'data', 'asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({
    catalogue: path.join(publicRoot, 'data', 'catalogue.json'),
    reveal: path.join(publicRoot, 'data', 'reveal.json'),
    manifest: path.join(publicRoot, 'data', 'asset-manifest.json'),
    counts: manifest.counts,
  }, null, 2));
}

await main();
