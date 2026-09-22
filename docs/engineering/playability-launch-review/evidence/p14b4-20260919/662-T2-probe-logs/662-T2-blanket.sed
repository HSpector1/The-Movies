s/saveVersion: 31 }/saveVersion: 32 }/g
s/saveVersion: 31\b/saveVersion: 32/g
s/unknown saveVersion 31/unknown saveVersion 32/g
s/versions 1 through 30 only/versions 1 through 31 only/g
s/"1 through 30 only"/"1 through 31 only"/g
s/migrateToV30/migrateToV31/g
s/validateSaveV30/validateSaveV31/g
s/SaveFileV30/SaveFileV31/g
s/saveVersion)\.toBe(30)/saveVersion).toBe(31)/g
s/LIVE_SAVE_VERSION)\.toBe(30)/LIVE_SAVE_VERSION).toBe(31)/g
s/LIVE_SAVE_VERSION as number)\.toBe(30)/LIVE_SAVE_VERSION as number).toBe(31)/g
s/saveVersion !== 30\b/saveVersion !== 31/g
s/saveVersion: 30\b/saveVersion: 31/g
s/saveVersion:30\b/saveVersion:31/g
s/PROJECTION_VERSION)\.toBe(47)/PROJECTION_VERSION).toBe(48)/g
s/snapshotVersion)\.toBe(47)/snapshotVersion).toBe(48)/g
s/SNAPSHOT_VERSION)\.toBe(47)/SNAPSHOT_VERSION).toBe(48)/g
s/projectionVersion)\.toBe(47)/projectionVersion).toBe(48)/g
s/projection-47/projection-48/g
s/projectionVersion: 47,/projectionVersion: 48,/g
s/ProjectionVersion = 47;/ProjectionVersion = 48;/g
s/expected literal 47/expected literal 48/g
s/canonical V30 save bytes/canonical V31 save bytes/g
s/cannot downgrade SaveFileV31/cannot downgrade SaveFileV31/g
s#// live writer (P14B.4): SaveFileV31\.#// live writer (P14B.5): SaveFileV31.#g
s#// Current writer (P14B.4): SaveFileV31\.#// Current writer (P14B.5): SaveFileV31.#g
s#// P14B.4: live saves are SaveFileV31\.#// P14B.5: live saves are SaveFileV31.#g
