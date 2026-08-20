# 3D Asset Provenance Reconciliation

All 26 production files were introduced in The Movies commit `fc31e127d38ad47c438cbcdc16af844d8b359b4a` and are byte-identical to the exact local Asset Lab source file cited below. File hashes and complete generation evidence are in `ui/public/spike3d/PROVENANCE-lab05h.json`.

`VERIFIED_PROJECT_GENERATED` means a procedural Blender export from the named Asset Lab commit. “License yes; adoption unproven” separates established legal source/license evidence from a production-adoption decision, which the evidence does not establish.

| Path | Classification | Source | License | Evidence | Ship status |
| --- | --- | --- | --- | --- | --- |
| `arch/Arch_M01_StageWall.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M02_ElephantDoor.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M03_BarrelRoof.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M04_StageCorner.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M10_BoundaryWall.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M11_MarqueeGate.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M13_WaterTower.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/Arch_M14_GroundTile.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` architecture | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `arch/studio_hero_set.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` scene | Project-original / owner-owned | `make_hero_scene.py`; byte match | License yes; adoption unproven |
| `characters/Char_CameraDP_Standard.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_Carpenter_Heavy.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_Director_Standard.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_Electric_Heavy.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_Grip_Standard.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_Maintenance_Heavy.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_Office_Standard.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `characters/Char_PA_Standard.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `ff9837f` character | Project geometry + UAL rig CC0 | `build_characters05b.py`; byte match | License yes; adoption unproven |
| `props/Prop_AppleBox_Full.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_Boom_attach_hand_r.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_CStand.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_CableReel.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_DirectorsChair.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_Fresnel.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_Megaphone_attach_hand_r.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_Slate_attach_hand_l.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |
| `props/Prop_StudioCamera.glb` | VERIFIED_PROJECT_GENERATED | Asset Lab `f4f60b4` props | Project-original / owner-owned | `build_all.py`; byte match | License yes; adoption unproven |

The audit is green because every file has legitimate file-level source and license evidence. It does not certify production adoption. The underlying Asset Lab records explicitly leave adoption unapproved or pending, so none of these files should be treated as authorized shipping assets until an owner decision is recorded.
