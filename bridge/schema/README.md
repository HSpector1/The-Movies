# Unity bridge contract

`bridge-schema.ts` is the TypeScript-owned source of truth for the local Unity wire
contract. It declares exact JSON types, required and optional properties, nullability,
closed enums, and `additionalProperties: false` on every DTO object.

The authoritative simulation still produces the broader browser lot snapshot.
`projectStudioLotSnapshot()` walks this schema to validate and select the narrower
Unity presentation projection. It drops browser-only fields; it does not derive rules
or mutate simulation state.

Run:

```sh
npm run generate:bridge-contract
npm run check:bridge-contract
npm run check:bridge-contract -- --unity-project '/path/to/Unity/project'
```

Generation writes two checked-in artifacts:

- `project-studio-bridge.schema.json`, the canonical Draft 2020-12 schema.
- `generated/unity/StudioBridgeDtos.Generated.cs`, strict Newtonsoft-compatible DTOs,
  version constants, schema hash, string vocabularies, and embedded canonical schema.

`SCHEMA_ID` is SHA-256 over recursively ordinal-sorted canonical JSON. Formatting and
object insertion order cannot change it. Arrays retain order because enum and union
order are contract data. Any wire-shape change updates the hash; a projection-shape
change must also increment `PROJECTION_VERSION`.

The generated C# is an integration artifact in this repository. Unity adoption should
copy or generate it into the client rather than hand-maintain a second DTO mirror. The
`--unity-project` check verifies the checked-in TypeScript artifact and the Unity copy
in one command.
