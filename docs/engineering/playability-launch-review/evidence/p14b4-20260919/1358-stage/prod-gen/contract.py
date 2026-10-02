#!/usr/bin/env python3
"""Emulates scripts/generate-bridge-contract.ts for the projection-57 step. Reads and prints only.

Usage: contract.py <tree> verify | schema | csharp | manifest
  verify    proves the emulation on the checked-in projection-56 artifacts (prints PASS/FAIL lines)
  schema    prints the projection-57 bridge/schema/project-studio-bridge.schema.json
  csharp    prints the projection-57 generated/unity/StudioBridgeDtos.Generated.cs
  manifest  prints the projection-57 generated/unity/project-studio-bridge.contract-manifest.json
The new $defs and row fields mirror bridge/schema/bridge-schema.ts at step 4; the C# for them
mirrors scripts/bridge-contract-csharp.ts (emitVocabulary, emitClass, emitCanonicalSchemaConstants).
"""
import copy, hashlib, json, re, struct, sys

TREE = sys.argv[1]
MODE = sys.argv[2]
SCHEMA_PATH = f'{TREE}/bridge/schema/project-studio-bridge.schema.json'
CSHARP_PATH = f'{TREE}/generated/unity/StudioBridgeDtos.Generated.cs'
MANIFEST_PATH = f'{TREE}/generated/unity/project-studio-bridge.contract-manifest.json'
CHUNK = 3000
SOURCES = ['bridge/schema/bridge-schema.ts', 'bridge/schema/industry-schema.ts', 'bridge/schema/intent-schema.ts',
           'bridge/schema/canonical.ts', 'bridge/schema/dsl.ts', 'package-lock.json', 'package.json',
           'scripts/bridge-contract-csharp.ts', 'scripts/generate-bridge-contract.ts']


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        return f.read()


def pretty(value):  # canonicalJsonPretty: sorted keys, indent 2, trailing newline
    return json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + '\n'


def compact(value):  # canonicalJson
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def identity(value):
    return 'sha256:' + hashlib.sha256(compact(value).encode('utf-8')).hexdigest()


def cs_string(value):  # csharpString: JSON.stringify plus three escapes
    return json.dumps(value, ensure_ascii=False).replace('\u0085', '\\u0085').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


def schema_constants(schema_json):  # emitCanonicalSchemaConstants
    chunks = [schema_json[i:i + CHUNK] for i in range(0, len(schema_json), CHUNK)]
    lines = [f'        private const string CanonicalSchemaJsonPart{i} = {cs_string(c)};' for i, c in enumerate(chunks)]
    lines += ['', '        public static readonly string CanonicalSchemaJson =']
    lines += [f'            CanonicalSchemaJsonPart{i}{";" if i == len(chunks) - 1 else " +"}' for i in range(len(chunks))]
    return lines


def bundle_sha256():  # sourceBundleSha256
    data = b'PROJECT_STUDIO_CF09_SOURCE_BUNDLE_V1' + b'\x00' + struct.pack('>I', len(SOURCES))
    for path in sorted(SOURCES):
        raw = open(f'{TREE}/{path}', 'rb').read()
        p = path.encode('utf-8')
        data += struct.pack('>I', len(p)) + p + struct.pack('>Q', len(raw)) + raw
    return hashlib.sha256(data).hexdigest()


def constants_block(text):
    """The lines of the existing CanonicalSchemaJson block (Part0 .. the final '...;')."""
    lines = text.split('\n')
    start = next(i for i, l in enumerate(lines) if l.startswith('        private const string CanonicalSchemaJsonPart0 = '))
    head = next(i for i, l in enumerate(lines) if l == '        public static readonly string CanonicalSchemaJson =')
    end = head + 1
    while not lines[end].endswith(';'):
        end += 1
    return lines, start, end


def text_string():
    return {'minLength': 1, 'type': 'string'}


def projection57(schema):
    s = copy.deepcopy(schema)
    s['$id'] = s['$id'].replace('projection-56', 'projection-57')
    assert s['$id'].endswith(':projection-57')
    assert s['x-project-studio']['projectionVersion'] == 56
    s['x-project-studio']['projectionVersion'] = 57
    moved = 0
    for name, d in s['$defs'].items():
        sv = d.get('properties', {}).get('snapshotVersion')
        if sv is not None and sv.get('const') == 56:
            sv['const'] = 57
            moved += 1
    assert moved == 5, moved
    defs = s['$defs']
    assert 'StudioRelationshipLabel' not in defs and 'StudioRelationshipRomance' not in defs
    defs['StudioRelationshipLabel'] = {
        'additionalProperties': False,
        'properties': {'evidence': text_string(), 'label': {'enum': ['Mentor', 'Professional Rivals'], 'type': 'string'}},
        'required': ['evidence', 'label'], 'type': 'object', 'x-csharp-name': 'StudioRelationshipLabel'}
    defs['StudioRelationshipRomance'] = {
        'additionalProperties': False,
        'properties': {'endedLabel': {'anyOf': [text_string(), {'type': 'null'}]}, 'sinceLabel': text_string(),
                       'status': {'enum': ['partners', 'ended'], 'type': 'string'}},
        'required': ['endedLabel', 'sinceLabel', 'status'], 'type': 'object', 'x-csharp-name': 'StudioRelationshipRomance'}
    row = defs['StudioRelationshipRow']
    assert set(row['properties']) == {'counterpartId', 'counterpartName', 'drivers', 'sharedPictures', 'sign', 'tierLabel'}
    row['properties']['labels'] = {'items': {'$ref': '#/$defs/StudioRelationshipLabel'}, 'type': 'array'}
    row['properties']['romance'] = {'anyOf': [{'$ref': '#/$defs/StudioRelationshipRomance'}, {'type': 'null'}]}
    row['required'] = sorted(row['required'] + ['labels', 'romance'])
    return s


def pascal_case(value):  # pascalCase
    normalized = re.sub(r'[^A-Za-z0-9]+(.)', lambda m: m.group(1).upper(), value)
    normalized = re.sub(r'^[a-z]', lambda m: m.group(0).upper(), normalized)
    return 'Value' + normalized if re.match(r'^[0-9]', normalized) else normalized


def class_name(defs, key):  # definitionClassName
    return defs[key].get('x-csharp-name', key)


def storage(node, defs):  # analyzeStorage, the parts an ordinary object property can reach
    alternatives = node.get('anyOf')
    if isinstance(alternatives, list) and {'type': 'null'} in alternatives:
        assert len(alternatives) == 2
        inner = storage(next(a for a in alternatives if a != {'type': 'null'}), defs)
        return dict(inner, nullable=True)
    if '$ref' in node:
        return {'kind': 'reference', 'type': class_name(defs, node['$ref'][len('#/$defs/'):]), 'value': False, 'nullable': False}
    if isinstance(alternatives, list):
        return {'kind': 'union', 'type': class_name(defs, node['x-csharp-name']), 'value': False, 'nullable': False}
    kind = node.get('type')
    if kind is None and 'const' in node:
        c = node['const']
        kind = 'boolean' if isinstance(c, bool) else 'integer' if isinstance(c, int) else 'number' if isinstance(c, float) else 'string'
    if kind == 'array':
        item = storage(node['items'], defs)
        return {'kind': 'array', 'type': emitted_storage(item) + '[]', 'item': item, 'value': False, 'nullable': False}
    primitive = {'string': ('string', False), 'boolean': ('bool', True), 'integer': ('int', True), 'number': ('double', True)}[kind]
    return {'kind': 'primitive', 'type': primitive[0], 'value': primitive[1], 'nullable': False}


def emitted_storage(s):  # emittedStorageType
    return s['type'] + ('?' if s['value'] and s['nullable'] else '')


def vocabulary_values(node):  # vocabulary
    alternatives = node.get('anyOf')
    if isinstance(alternatives, list) and {'type': 'null'} in alternatives:
        node = next(a for a in alternatives if a != {'type': 'null'})
    if isinstance(node.get('enum'), list) and all(isinstance(v, str) for v in node['enum']):
        return node['enum']
    return [node['const']] if isinstance(node.get('const'), str) else []


def emit_object(defs, key):
    """emitVocabulary for each property, then emitClass, for an ordinary (non-union-member) object."""
    name = class_name(defs, key)
    d = defs[key]
    required = set(d.get('required', []))
    vocabularies, lines = [], ['    [Serializable]', '    [JsonObject(MemberSerialization.OptIn)]',
                               f'    public sealed partial class {name}', '    {']
    for wire in sorted(d['properties']):
        node = d['properties'][wire]
        values = vocabulary_values(node)
        if values:
            vocabularies += [f'    public static class {name}{pascal_case(wire)}Values', '    {']
            vocabularies += [f'        public const string {pascal_case(v)} = {cs_string(v)};' for v in values]
            vocabularies += ['    }', '']
        s = storage(node, defs)
        is_required = wire in required
        mode = ('AllowNull' if s['nullable'] else 'Always') if is_required else ('Default' if s['nullable'] else 'DisallowNull')
        handling = ', NullValueHandling = NullValueHandling.Include' if is_required and s['nullable'] \
            else ', NullValueHandling = NullValueHandling.Ignore' if not is_required else ''
        kind = emitted_storage(s) + ('?' if s['value'] and not s['nullable'] and not is_required else '')
        init = f' = Array.Empty<{emitted_storage(s["item"])}>();' if is_required and s['kind'] == 'array' else ';'
        lines += [f'        [JsonProperty({cs_string(wire)}, Required = Required.{mode}{handling})]',
                  f'        public {kind} {wire}{init}', '']
    if lines[-1] == '':
        lines.pop()
    return vocabularies, lines + ['    }', '']


def block_at(lines, first, stop):
    """lines[first:] up to and including the first line equal to `stop`, plus the blank after it."""
    end = lines.index(stop, first)
    return lines[first:end + 2]


def verify_emitter(text, schema):
    """emit_object reproduces every ordinary object class and its vocabularies in the checked-in C#."""
    lines = text.split('\n')
    defs = schema['$defs']
    checked = skipped = 0
    for key in sorted(defs):
        d = defs[key]
        if d.get('type') != 'object' or 'anyOf' in d:
            continue
        declaration = f'    public sealed partial class {class_name(defs, key)}'
        if declaration not in lines:
            skipped += 1  # a discriminated-union member (declared with ` : Base`)
            continue
        vocabularies, emitted = emit_object(defs, key)
        at = lines.index(declaration) - 2
        if block_at(lines, at, '    }') != emitted:
            return f'class {key} differs', checked, skipped
        i = 0
        while i < len(vocabularies):
            head = lines.index(vocabularies[i])
            size = vocabularies.index('', i) - i + 1
            if lines[head:head + size] != vocabularies[i:i + size]:
                return f'vocabulary {vocabularies[i]} differs', checked, skipped
            i += size
        checked += 1
    return None, checked, skipped


def csharp57(old_text, old_schema, new_schema):
    old_id, new_id = identity(old_schema), identity(new_schema)
    text = old_text
    for before, after in [
        (f'// Schema identity: {old_id}\n', f'// Schema identity: {new_id}\n'),
        ('        public const int ProjectionVersion = 56;\n', '        public const int ProjectionVersion = 57;\n'),
        (f'        public const string SchemaId = "{old_id}";\n', f'        public const string SchemaId = "{new_id}";\n'),
    ]:
        assert text.count(before) == 1, before
        text = text.replace(before, after)
    lines, start, end = constants_block(text)
    lines[start:end + 1] = schema_constants(pretty(new_schema).rstrip())
    defs = new_schema['$defs']
    keys = sorted(defs)
    # The sorted $defs order puts the two new definitions directly before StudioRelationshipRow,
    # after StudioRelationshipBlock, which emits no vocabulary.
    assert keys[keys.index('StudioRelationshipRow') - 3:keys.index('StudioRelationshipRow') + 1] == [
        'StudioRelationshipBlock', 'StudioRelationshipLabel', 'StudioRelationshipRomance', 'StudioRelationshipRow']
    label_vocab, label_class = emit_object(defs, 'StudioRelationshipLabel')
    romance_vocab, romance_class = emit_object(defs, 'StudioRelationshipRomance')
    row_vocab, row_class = emit_object(defs, 'StudioRelationshipRow')
    vocab_at = lines.index('    public static class StudioRelationshipRowTierLabelValues')
    assert block_at(lines, vocab_at, '    }') == row_vocab
    lines[vocab_at:vocab_at] = label_vocab + romance_vocab
    row_at = lines.index('    public sealed partial class StudioRelationshipRow') - 2
    old_row = block_at(lines, row_at, '    }')
    lines[row_at:row_at + len(old_row)] = label_class + romance_class + row_class
    return '\n'.join(lines)


def manifest_text(old_manifest, csharp, schema):
    m = dict(old_manifest)
    digest = hashlib.sha256(csharp.encode('utf-8')).hexdigest()
    m.update(projectionVersion=57, schemaId=identity(schema), generatorSourceSha256=bundle_sha256(),
             typescriptGeneratedContractSha256=digest, unityGeneratedContractSha256=digest)
    return pretty(m)


old_schema_text = read(SCHEMA_PATH)
old_schema = json.loads(old_schema_text)
old_csharp = read(CSHARP_PATH)
old_manifest = json.loads(read(MANIFEST_PATH))

if MODE == 'verify':
    def check(name, ok):
        print(('PASS ' if ok else 'FAIL ') + name)
    check('schema JSON round-trips byte for byte', pretty(old_schema) == old_schema_text)
    check('schema JSON is ASCII-safe for UTF-16 chunking', all(ord(c) < 0x10000 for c in old_schema_text))
    check('schemaId equals the manifest', identity(old_schema) == old_manifest['schemaId'])
    check('C# header names the manifest schemaId', f'// Schema identity: {old_manifest["schemaId"]}\n' in old_csharp)
    lines, start, end = constants_block(old_csharp)
    check('C# canonical-schema block regenerates byte for byte', lines[start:end + 1] == schema_constants(pretty(old_schema).rstrip()))
    check('C# file hash equals the manifest', hashlib.sha256(old_csharp.encode('utf-8')).hexdigest() == old_manifest['typescriptGeneratedContractSha256'])
    check('manifest JSON round-trips byte for byte', pretty(old_manifest) == read(MANIFEST_PATH))
    check('manifest unity hash equals its typescript hash', old_manifest['unityGeneratedContractSha256'] == old_manifest['typescriptGeneratedContractSha256'])
    failure, checked, skipped = verify_emitter(old_csharp, old_schema)
    check(f'object emitter reproduces {checked} checked-in classes and their vocabularies ({skipped} union members skipped)' + ('' if failure is None else f': {failure}'), failure is None and checked > 0)
    print('source bundle sha256 (current tree):', bundle_sha256(), ' manifest:', old_manifest['generatorSourceSha256'])
    print('outgoing schemaId:', old_manifest['schemaId'])
    if old_manifest['projectionVersion'] == 56:
        print('new schemaId:', identity(projection57(old_schema)))
elif MODE == 'schema':
    sys.stdout.write(pretty(projection57(old_schema)))
elif MODE == 'csharp':
    sys.stdout.write(csharp57(old_csharp, old_schema, projection57(old_schema)))
elif MODE == 'manifest':
    new_schema = projection57(old_schema)
    sys.stdout.write(manifest_text(old_manifest, csharp57(old_csharp, old_schema, new_schema), new_schema))
else:
    raise SystemExit(f'unknown mode {MODE}')
