#!/usr/bin/env python3
"""PF1-M1 development audio generator — every committed sound in ui/public/audio.

Generated-for-project only: no sample libraries, no downloads, no third-party audio.
Everything below is synthesized from arithmetic (python stdlib `wave` + `math`), so
the committed files carry no licence obligation beyond this repository's own.

Determinism: the only randomness is python's Mersenne Twister seeded with the fixed
literal SEED. Re-running this script reproduces byte-identical WAVs. (This is an
OFFLINE tool under scripts/ — the shipping UI takes no random draws at all, which is
what ui/src/hygiene.test.tsx enforces.)

Register (the charter's calm-morning law): a quiet studio is allowed to sound quiet.
Ambience is a place, not a casino; cues are warm and woody, never modern-app bleeps.

Usage:  python3 scripts/audio/generate_pf1_audio.py
Requires macOS `afconvert` for the WAV -> .m4a conversion.
"""

from __future__ import annotations

import math
import os
import random
import subprocess
import sys
import tempfile
import wave
from array import array

SR = 44100
SEED = 19480415  # fixed literal: determinism, not taste
OUT_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "ui", "public", "audio")
)

Signal = "array[float]"


# ── primitives ────────────────────────────────────────────────────────────────

def silence(seconds: float) -> array:
    return array("d", bytes(8 * int(seconds * SR)))


def white(rng: random.Random, n: int) -> array:
    return array("d", [rng.uniform(-1.0, 1.0) for _ in range(n)])


def one_pole_lp(sig: array, cutoff: float) -> array:
    """Single-pole low pass. Distance and warmth are both just missing treble."""
    a = math.exp(-2.0 * math.pi * cutoff / SR)
    out = array("d", bytes(8 * len(sig)))
    y = 0.0
    for i, x in enumerate(sig):
        y = (1.0 - a) * x + a * y
        out[i] = y
    return out


def one_pole_hp(sig: array, cutoff: float) -> array:
    lp = one_pole_lp(sig, cutoff)
    return array("d", [x - y for x, y in zip(sig, lp)])


def band(sig: array, low: float, high: float) -> array:
    return one_pole_hp(one_pole_lp(sig, high), low)


def mix_into(dst: array, src: array, start_sample: int, gain: float = 1.0) -> None:
    n = len(dst)
    for i, v in enumerate(src):
        j = start_sample + i
        if 0 <= j < n:
            dst[j] += v * gain


def scale(sig: array, gain: float) -> array:
    return array("d", [x * gain for x in sig])


def peak(sig: array) -> float:
    return max((abs(x) for x in sig), default=0.0)


def rms(sig: array) -> float:
    if not sig:
        return 0.0
    return math.sqrt(sum(x * x for x in sig) / len(sig))


def db(x: float) -> float:
    return -120.0 if x <= 1e-6 else 20.0 * math.log10(x)


def normalize(channels: list, target_peak: float) -> list:
    p = max(peak(c) for c in channels)
    if p <= 1e-9:
        return channels
    g = target_peak / p
    return [scale(c, g) for c in channels]


def soft_clip(sig: array) -> array:
    """Never let a rounding sum leave the rails; tanh is inaudible below -6 dBFS."""
    return array("d", [math.tanh(x) if abs(x) > 0.9 else x for x in sig])


# ── voices ────────────────────────────────────────────────────────────────────

def note_freq(semitones_from_a4: float) -> float:
    return 440.0 * (2.0 ** (semitones_from_a4 / 12.0))


def damped_partials(freq: float, seconds: float, partials: list, attack: float = 0.004) -> array:
    """A struck-wood / mallet body: a few inharmonic partials, each with its own decay."""
    n = int(seconds * SR)
    out = array("d", bytes(8 * n))
    for ratio, amp, tau in partials:
        w = 2.0 * math.pi * freq * ratio / SR
        for i in range(n):
            t = i / SR
            env = math.exp(-t / tau) * (1.0 - math.exp(-t / attack))
            out[i] += amp * env * math.sin(w * i)
    return out


def wood_click(freq: float, seconds: float = 0.13, bright: float = 1.0) -> array:
    return damped_partials(
        freq,
        seconds,
        [(1.0, 0.60, 0.030), (2.04, 0.28 * bright, 0.020), (3.11, 0.12 * bright, 0.013)],
        attack=0.0018,
    )


def mallet(freq: float, seconds: float = 0.9, warmth: float = 1.0) -> array:
    return damped_partials(
        freq,
        seconds,
        [
            (1.0, 0.70, 0.42 * seconds),
            (2.0, 0.22 / warmth, 0.26 * seconds),
            (3.01, 0.09 / warmth, 0.16 * seconds),
            (4.16, 0.04 / warmth, 0.10 * seconds),
        ],
        attack=0.006,
    )


def brass_swell(freq: float, seconds: float, attack: float, harmonics: int = 8) -> array:
    """Soft brass-ish body: a harmonic stack that opens slowly. Never a fanfare."""
    n = int(seconds * SR)
    out = array("d", bytes(8 * n))
    release = seconds * 0.55
    for h in range(1, harmonics + 1):
        amp = 1.0 / (h ** 1.35)
        w = 2.0 * math.pi * freq * h / SR
        for i in range(n):
            t = i / SR
            if t < attack:
                env = 0.5 - 0.5 * math.cos(math.pi * t / attack)
            else:
                env = math.exp(-(t - attack) / release)
            vib = 1.0 + 0.0025 * math.sin(2.0 * math.pi * 4.6 * t)
            out[i] += amp * env * math.sin(w * i * vib)
    return one_pole_lp(out, 2600.0)


def low_thud(freq: float = 92.0, seconds: float = 0.45) -> array:
    n = int(seconds * SR)
    out = array("d", bytes(8 * n))
    for i in range(n):
        t = i / SR
        env = math.exp(-t / 0.11) * (1.0 - math.exp(-t / 0.006))
        # A slight downward glide reads as weight settling, not as a synth drop.
        f = freq * (1.0 - 0.18 * (1.0 - math.exp(-t / 0.08)))
        out[i] = env * (0.85 * math.sin(2.0 * math.pi * f * t) + 0.15 * math.sin(2.0 * math.pi * f * 1.51 * t))
    return one_pole_lp(out, 420.0)


def chirp(rng: random.Random, f0: float, f1: float, seconds: float) -> array:
    """One bird syllable: a fast sine sweep with a soft edge."""
    n = int(seconds * SR)
    out = array("d", bytes(8 * n))
    phase = 0.0
    for i in range(n):
        t = i / SR
        frac = t / seconds
        f = f0 + (f1 - f0) * frac
        phase += 2.0 * math.pi * f / SR
        env = math.sin(math.pi * frac) ** 1.6
        out[i] = env * (math.sin(phase) + 0.18 * math.sin(2.0 * phase))
    return scale(out, 0.9 + 0.2 * rng.random())


def hammer(rng: random.Random) -> array:
    """One distant hammer blow: transient plus a little board resonance, far away."""
    n = int(0.32 * SR)
    noise = white(rng, n)
    body = array("d", bytes(8 * n))
    for i in range(n):
        t = i / SR
        body[i] = noise[i] * math.exp(-t / 0.012)
    body = band(body, 300.0, 3200.0)
    res = damped_partials(
        318.0 * (0.94 + 0.12 * rng.random()),
        0.32,
        [(1.0, 0.5, 0.055), (1.97, 0.2, 0.035), (3.4, 0.08, 0.02)],
        attack=0.002,
    )
    out = array("d", [0.55 * b + 0.45 * r for b, r in zip(body, res)])
    return one_pole_lp(out, 1500.0)  # distance


def reverb(sig: array, taps: list, tail: float = 0.9) -> array:
    """A handful of damped taps. Enough to place a sound outdoors; not a hall."""
    n = len(sig) + int(tail * SR)
    out = array("d", bytes(8 * n))
    mix_into(out, sig, 0, 1.0)
    for delay_s, gain, cutoff in taps:
        wet = one_pole_lp(sig, cutoff)
        mix_into(out, wet, int(delay_s * SR), gain)
    return out


# ── loop assembly ─────────────────────────────────────────────────────────────

def seamless(channels: list, loop_seconds: float, fade_seconds: float) -> list:
    """Fold `fade` seconds of the over-rendered tail back over the head, equal power.

    The render is loop+fade long; the result is exactly loop long and wraps without a
    seam, because the last fade window and the first fade window are the same audio
    faded through each other.
    """
    n = int(loop_seconds * SR)
    f = int(fade_seconds * SR)
    out = []
    for ch in channels:
        res = array("d", ch[:n])
        for i in range(f):
            x = i / f
            a = math.cos(0.5 * math.pi * x)  # tail out
            b = math.sin(0.5 * math.pi * x)  # head in
            res[i] = ch[n + i] * a + ch[i] * b
        out.append(res)
    return out


def fold_tail(channels: list, loop_seconds: float) -> list:
    """Let a decaying tail ring over the loop point (music), rather than cutting it."""
    n = int(loop_seconds * SR)
    out = []
    for ch in channels:
        res = array("d", ch[:n])
        for i in range(len(ch) - n):
            if i < n:
                res[i] += ch[n + i]
        out.append(res)
    return out


# ── the assets ────────────────────────────────────────────────────────────────

AMBIENCE_SECONDS = 30.0
AMBIENCE_FADE = 3.0
CONSTRUCTION_SECONDS = 24.0
CONSTRUCTION_FADE = 2.0
MUSIC_SECONDS = 32.0
MUSIC_TAIL = 4.0


def build_ambience_lot() -> list:
    """1948 lot at rest: a low wind bed and a few distant birds. Deliberately sparse."""
    rng = random.Random(SEED + 1)
    total = AMBIENCE_SECONDS + AMBIENCE_FADE
    n = int(total * SR)
    chans = []
    for ch in range(2):
        bed_low = one_pole_lp(one_pole_lp(white(rng, n), 190.0), 190.0)
        bed_air = band(white(rng, n), 500.0, 1800.0)
        out = array("d", bytes(8 * n))
        for i in range(n):
            t = i / SR
            # Two slow gusts at incommensurate periods so the bed never pulses in time.
            gust = 1.0 + 0.42 * math.sin(2.0 * math.pi * t / 11.0 + ch) + 0.22 * math.sin(2.0 * math.pi * t / 6.5)
            out[i] = bed_low[i] * 1.0 * max(0.15, gust) + bed_air[i] * 0.055 * max(0.2, gust)
        chans.append(out)

    # Birds: sparse, distant, and never in the crossfade window (so the seam stays clean).
    events = []
    t = AMBIENCE_FADE + 1.2
    while t < AMBIENCE_SECONDS - 2.0:
        events.append(t)
        t += rng.uniform(3.4, 6.8)
    for start in events:
        syllables = rng.choice([1, 2, 2, 3])
        group = silence(1.6)
        at = 0.0
        for _ in range(syllables):
            f0 = rng.uniform(2100.0, 3300.0)
            f1 = f0 * rng.uniform(0.72, 1.45)
            mix_into(group, chirp(rng, f0, f1, rng.uniform(0.055, 0.095)), int(at * SR), 1.0)
            at += rng.uniform(0.11, 0.24)
        wet = reverb(group, [(0.09, 0.30, 2400.0), (0.17, 0.20, 1600.0), (0.29, 0.12, 1100.0)], tail=0.6)
        pan = rng.uniform(0.2, 0.8)
        level = rng.uniform(0.030, 0.055)
        mix_into(chans[0], wet, int(start * SR), level * (1.0 - pan))
        mix_into(chans[1], wet, int(start * SR), level * pan)

    chans = seamless(chans, AMBIENCE_SECONDS, AMBIENCE_FADE)
    return normalize(chans, 0.22)


def build_ambience_construction() -> list:
    """Work texture: bursts of distant hammering with long silences between them."""
    rng = random.Random(SEED + 2)
    total = CONSTRUCTION_SECONDS + CONSTRUCTION_FADE
    n = int(total * SR)
    chans = [array("d", bytes(8 * n)), array("d", bytes(8 * n))]

    t = CONSTRUCTION_FADE + 0.8
    while t < CONSTRUCTION_SECONDS - 1.5:
        blows = rng.choice([3, 4, 4, 5])
        at = t
        pan = rng.uniform(0.25, 0.75)
        for _ in range(blows):
            wet = reverb(hammer(rng), [(0.11, 0.34, 1400.0), (0.21, 0.22, 1000.0), (0.35, 0.13, 700.0)], tail=0.7)
            level = rng.uniform(0.55, 1.0)
            mix_into(chans[0], wet, int(at * SR), level * (1.0 - pan))
            mix_into(chans[1], wet, int(at * SR), level * pan)
            at += rng.uniform(0.28, 0.44)
        t = at + rng.uniform(2.6, 4.4)

    chans = seamless(chans, CONSTRUCTION_SECONDS, CONSTRUCTION_FADE)
    return normalize(chans, 0.20)


def build_music_1948() -> list:
    """Development music: a slow, restrained period-flavoured bed. Clearly replaceable."""
    rng = random.Random(SEED + 3)
    total = MUSIC_SECONDS + MUSIC_TAIL
    n = int(total * SR)
    chans = [array("d", bytes(8 * n)), array("d", bytes(8 * n))]

    bar = MUSIC_SECONDS / 8.0  # 8 bars, 4 seconds each — roughly 60 BPM in 4/4
    # F major, plain trade-paper harmony. Semitones relative to A4.
    progression = [
        ([-16, -12, -9, -5], -28),   # Fmaj7
        ([-19, -16, -12, -9], -31),  # Dm7
        ([-23, -19, -16, -12], -35), # Bbmaj7
        ([-21, -17, -14, -11], -33), # C7
        ([-16, -12, -9, -5], -28),   # Fmaj7
        ([-24, -21, -17, -14], -36), # Am7
        ([-26, -23, -19, -16], -38), # Gm7
        ([-21, -17, -14, -11], -33), # C7
    ]
    melody = [-5, -9, -12, -11, -5, -2, -4, -5]

    for b, (chord, bass) in enumerate(progression):
        start = b * bar
        # The chord, struck softly, voices staggered like a hand rolling the keys.
        for k, semi in enumerate(chord):
            v = mallet(note_freq(semi), seconds=3.2, warmth=1.3)
            pan = 0.32 + 0.12 * k
            at = int((start + 0.018 * k) * SR)
            lvl = 0.30 * (0.92 + 0.16 * rng.random())
            mix_into(chans[0], v, at, lvl * (1.0 - pan))
            mix_into(chans[1], v, at, lvl * pan)
        # Bass on the downbeat.
        bv = one_pole_lp(mallet(note_freq(bass), seconds=2.6, warmth=1.6), 900.0)
        mix_into(chans[0], bv, int(start * SR), 0.24)
        mix_into(chans[1], bv, int(start * SR), 0.24)
        # One melody note on beat 3 — the single line of personality per bar.
        mv = mallet(note_freq(melody[b]), seconds=2.2, warmth=1.1)
        at = int((start + bar * 0.5) * SR)
        mix_into(chans[0], mv, at, 0.115)
        mix_into(chans[1], mv, at, 0.155)

    chans = [one_pole_lp(c, 5200.0) for c in chans]
    chans = fold_tail(chans, MUSIC_SECONDS)
    return normalize(chans, 0.30)


def build_cues() -> dict:
    """The eleven cue families. Warm, short, and quiet enough to live with."""
    rng = random.Random(SEED + 4)
    cues = {}

    # select — a soft woody click. The most-heard sound in the product; the smallest.
    sel = wood_click(760.0, 0.13, bright=0.85)
    cues["cue-select"] = normalize([reverb(sel, [(0.021, 0.16, 3000.0)], tail=0.2)], 0.34)

    # commit — two warm mallet notes rising a fourth: the studio has decided.
    n = int(0.85 * SR)
    buf = array("d", bytes(8 * n))
    mix_into(buf, mallet(note_freq(-9), 0.7, 1.2), 0, 0.75)          # C4
    mix_into(buf, mallet(note_freq(-2), 0.75, 1.2), int(0.11 * SR), 0.70)  # G4
    cues["cue-commit"] = normalize([reverb(buf, [(0.05, 0.20, 2400.0), (0.11, 0.12, 1600.0)], tail=0.4)], 0.40)

    # cancel — the same shape, falling, and shorter. Nothing was lost.
    n = int(0.6 * SR)
    buf = array("d", bytes(8 * n))
    mix_into(buf, mallet(note_freq(-2), 0.45, 1.4), 0, 0.62)
    mix_into(buf, mallet(note_freq(-9), 0.5, 1.4), int(0.085 * SR), 0.55)
    cues["cue-cancel"] = normalize([reverb(buf, [(0.04, 0.14, 2000.0)], tail=0.3)], 0.32)

    # refusal — a low, flat thud. A closed door, not a buzzer.
    thud = low_thud(96.0, 0.5)
    cues["cue-refusal"] = normalize([reverb(thud, [(0.06, 0.18, 500.0)], tail=0.4)], 0.42)

    # construction-started — two wooden knocks and a small lift: work begins.
    n = int(1.0 * SR)
    buf = array("d", bytes(8 * n))
    mix_into(buf, wood_click(430.0, 0.22), 0, 0.85)
    mix_into(buf, wood_click(430.0, 0.22), int(0.155 * SR), 0.70)
    mix_into(buf, mallet(note_freq(-14), 0.6, 1.5), int(0.30 * SR), 0.34)
    cues["cue-construction-started"] = normalize(
        [reverb(buf, [(0.08, 0.24, 1600.0), (0.15, 0.14, 1100.0)], tail=0.5)], 0.40
    )

    # completion — three ascending mallet notes. Warm, unhurried, finished.
    n = int(1.4 * SR)
    buf = array("d", bytes(8 * n))
    for k, semi in enumerate([-9, -5, 0]):  # C4 E4 A4
        mix_into(buf, mallet(note_freq(semi), 1.0, 1.15), int(0.13 * k * SR), 0.62 - 0.06 * k)
    cues["cue-completion"] = normalize([reverb(buf, [(0.06, 0.22, 2600.0), (0.13, 0.13, 1700.0)], tail=0.6)], 0.42)

    # positive — one gentle rising third. The smallest good news the studio has.
    n = int(0.8 * SR)
    buf = array("d", bytes(8 * n))
    mix_into(buf, mallet(note_freq(-5), 0.55, 1.2), 0, 0.6)
    mix_into(buf, mallet(note_freq(-1), 0.6, 1.2), int(0.095 * SR), 0.55)
    cues["cue-positive"] = normalize([reverb(buf, [(0.05, 0.18, 2400.0)], tail=0.4)], 0.36)

    # warning — two muted low-mid taps. Attention, not alarm.
    n = int(1.0 * SR)
    buf = array("d", bytes(8 * n))
    tap = one_pole_lp(mallet(note_freq(-22), 0.6, 2.0), 1200.0)  # B2-ish, dull
    mix_into(buf, tap, 0, 0.7)
    mix_into(buf, tap, int(0.26 * SR), 0.55)
    cues["cue-warning"] = normalize([reverb(buf, [(0.07, 0.2, 900.0)], tail=0.5)], 0.38)

    # stings — soft brass-ish swells. Three chords, three different pieces of news.
    def sting(semis, seconds, attack, extra=None):
        n = int((seconds + 0.6) * SR)
        buf = array("d", bytes(8 * n))
        for k, semi in enumerate(semis):
            mix_into(buf, brass_swell(note_freq(semi), seconds, attack), int(0.02 * k * SR), 0.30)
        if extra is not None:
            semi, delay, secs = extra
            mix_into(buf, brass_swell(note_freq(semi), secs, attack * 0.6), int(delay * SR), 0.24)
        return reverb(buf, [(0.09, 0.26, 2200.0), (0.19, 0.16, 1500.0), (0.33, 0.09, 1000.0)], tail=0.9)

    cues["cue-sting-release"] = normalize([sting([-17, -10, -5, -1], 1.5, 0.38)], 0.46)          # C major, open
    cues["cue-sting-greenlight"] = normalize(
        [sting([-17, -10, -5], 1.5, 0.34, extra=(2, 0.55, 1.0))], 0.46                            # …with a rising voice
    )
    cues["cue-sting-completion"] = normalize([sting([-19, -12, -7, -3], 1.6, 0.42)], 0.44)        # Bb major, settled

    for name in cues:
        cues[name] = [soft_clip(cues[name][0])]
    del rng
    return cues


# ── output ────────────────────────────────────────────────────────────────────

def write_wav(path: str, channels: list) -> None:
    n = len(channels[0])
    frames = array("h", bytes(2 * n * len(channels)))
    idx = 0
    for i in range(n):
        for ch in channels:
            v = int(max(-1.0, min(1.0, ch[i])) * 32767.0)
            frames[idx] = v
            idx += 1
    with wave.open(path, "wb") as w:
        w.setnchannels(len(channels))
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames.tobytes())


def to_m4a(wav_path: str, m4a_path: str, bitrate: int) -> None:
    subprocess.run(
        [
            "afconvert",
            "-f", "m4af",
            "-d", "aac",
            "-b", str(bitrate),
            "-s", "2",           # constrained VBR
            "-q", "127",         # best converter quality
            wav_path, m4a_path,
        ],
        check=True,
        capture_output=True,
    )


def main() -> int:
    os.makedirs(OUT_DIR, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="pf1-audio-")

    jobs = []  # (basename, channels, seconds, bitrate)
    print("rendering ambience-lot-1948 …", flush=True)
    jobs.append(("ambience-lot-1948", build_ambience_lot(), AMBIENCE_SECONDS, 96000))
    print("rendering ambience-construction …", flush=True)
    jobs.append(("ambience-construction", build_ambience_construction(), CONSTRUCTION_SECONDS, 96000))
    print("rendering music-1948 …", flush=True)
    jobs.append(("music-1948", build_music_1948(), MUSIC_SECONDS, 112000))
    print("rendering cues …", flush=True)
    for name, chans in build_cues().items():
        jobs.append((name, chans, len(chans[0]) / SR, 64000))

    rows = []
    for name, chans, seconds, bitrate in jobs:
        wav_path = os.path.join(tmp, name + ".wav")
        m4a_path = os.path.join(OUT_DIR, name + ".m4a")
        write_wav(wav_path, chans)
        to_m4a(wav_path, m4a_path, bitrate)
        size = os.path.getsize(m4a_path)
        rows.append((name, seconds, len(chans), size, db(peak(chans[0])), db(rms(chans[0]))))

    print()
    print(f"{'file':32} {'sec':>6} {'ch':>3} {'bytes':>9}  {'peak dBFS':>9} {'rms dBFS':>9}")
    total = 0
    for name, seconds, nch, size, pk, rm in rows:
        total += size
        print(f"{name + '.m4a':32} {seconds:6.2f} {nch:3d} {size:9d}  {pk:9.1f} {rm:9.1f}")
    print(f"{'TOTAL':32} {'':6} {'':3} {total:9d}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
