# 1370 r12 E0G adoption clean capture — stage32 evidence

This capture uses source commit `b995a83e5363a3843f9b902e08c2df4dd95840cb` and source tree `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`, arm E0G, seed `p13-public-commercial-adoption`, run `r12-e0g-adoption-clean-20261007-1850`. It ran all 416 weeks and produced 417 complete Save46 boundary members under the **exploratory** 720-second child / 750-second recorder limits. The observed capture receipt SHA-256 `3f833354bf9eeff08a8c4e82cd235b85a0875c323b7e30f68e8eafd9b489f8c7` and independent full readback receipt SHA-256 `0a672b38e5d9c810cb82aa24fa26c47b2e5b1071b02a8daa3e9157bd0cc9196d` admit this leaf only. The original 300/330 route and earlier exploratory results retain their original labels. This is no 1363 ledger or native acceptance claim.

The complete target, outer and lane source inventory has 232 members and 146,623,440 regular bytes, SHA-256 `325267be4a4c325e212a6651348183848904f38f8119b0b887c4142880cd73ac`. The reviewed archive PIN SHA-256 is `728d3358b820529dfb477e6d99855d74016c6f2c04138276c66fa841395f2101`; independent PIN review receipt SHA-256 `b4a188ab4491103b4b3eef186e37f9de605a2cb24e905c2ae28adf203a32f776`.

The r3 archiver and verifier ran in separate recorded lanes and passed local byte preservation. The archive manifest SHA-256 is `9e81b3c46d94e962f658ca4203865a866e311dcb661a8623f073e0ad13b91e54`, carrying a 146,800,640-byte tar SHA-256 `aadf488705d932179b2298dddd754d17a6bfa8640752f7e868401a340ab835fa` in three parts:

- `capture.tar.part-001`: 50,331,648 bytes, SHA-256 `8b36819dc2ec2fa1c01f1a18d39b81435e2f569116f7018f7ec838c6c7f13f45`
- `capture.tar.part-002`: 50,331,648 bytes, SHA-256 `f17f41341988cbcbbfbf4d0238dc3727ab429fc71abf375b6eb69dbeecbd8676`
- `capture.tar.part-003`: 46,137,344 bytes, SHA-256 `1bde4c12f857eae1c88df39764b10394d895b13240592154038ed0d6fa5c2a62`

The independent local archive receipt SHA-256 `3036a444aa4b894c7dc4d82e3c52d205a54586b70530bd2e0e4763ba670f624a` accepts all 232 source members against retained bytes. The r3 archive code was already published and reviewed in stage31 under `thirty-first-verification/archive-code-r3/` (`package.py` SHA-256 `7368b59185d9818c7fb286dbb39a91cbc98582752f75a560393a34d05a3efc46`; `verify.py` SHA-256 `75b13e206a46d223b2230ea7fde510b0acf36517ae3d944661f3346f5845c4b9`).

Publication and fresh GitHub byte readback are separate subsequent gates. Retained raw source and local archive must remain until a new remote audit and independent observed review accept all published bytes; this README does not authorize cleanup.
