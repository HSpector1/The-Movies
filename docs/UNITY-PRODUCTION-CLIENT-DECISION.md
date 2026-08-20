# Unity Production Client Decision

Recorded on 2026-08-20 from `docs/unity-production-client-decision`.

## Approved architecture

This is the approved architecture for the current game adoption path.

- TypeScript remains the sole authoritative simulation engine.
- Unity becomes the intended production visual and interaction client.
- Unity must never own or duplicate gameplay formulas, legality, economy, production rules, RNG, saves, migrations, time, or stable game identities.
- Unity submits intents; TypeScript accepts or rejects them and returns authoritative projections.
- Three.js is retained as a proven reference implementation, fallback, regression oracle, and visual-design donor.
- Three.js is no longer the primary destination for major production-art or animation investment.
- Do not delete the Three.js implementation.

This is an architecture decision, not authorization to rewrite the simulation in Unity.

## Exact adoption proof

- TypeScript: `adoption/current-game-unity-gate-ts @ f6606ac9db67dc70b12a7d247d74206571d12d2c`
- Unity: `adoption/current-game-unity-gate-client @ d970b81c2b17383ee71c3c66a5622ecc140473b3`

## What the gate proved

- current-game bridge compatibility
- Movie #2 end-to-end through Unity
- stale-revision rejection
- deterministic save/load/reconnect
- byte-identical bridge/headless saves
- no gameplay logic duplicated in C#
- full TypeScript and Unity validation passed

## Required production follow-ups

- generated C# DTOs from the authoritative TypeScript protocol/schema
- durable launcher-managed bridge lifecycle/storage/restart handling

## Boundary

This decision preserves Three.js as a living reference and fallback path. It does not remove the existing Three.js implementation, and it does not authorize replacing the authoritative TypeScript simulation with a Unity-authored simulation layer.
