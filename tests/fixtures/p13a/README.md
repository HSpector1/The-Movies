`accepted-v19.json.gz` is a generated test campaign, never a user campaign.

It was emitted by an isolated archive of accepted TypeScript product commit
`592e926bfbf4574df94b38fc8dd594fc5df2ac8d`, using:

```ts
exportSave(makeSave(beginFounding(generateWorld('p13a-accepted-v19-migration'))))
```

The original canonical Save V19 JSON is 327,141 bytes. Its SHA-256 is
`dc76a253e706090bb177d1d54c0d1c7742cf1d3c37ff4d13cb5ec559a1e1ad81`.
Gzip is storage only; the test verifies the original bytes before import.

`accepted-v19-hired.json.gz` is the same generated campaign after the accepted
engine signs its first founding applicant to an ordinary 104-week contract:

```ts
const founding = beginFounding(generateWorld('p13a-accepted-v19-migration'))
exportSave(makeSave(applyActions(founding, [{ kind: 'signContract',
  talentId: founding.founding!.applicantIds[0]!, termWeeks: 104 }])))
```

Its original canonical JSON is 327,822 bytes, SHA-256
`f6ed3c0cdb81371f523d6d6dc37678d9a70926b649493871dd8fcd606a696244`.
The P12 checkpoint migration regression uses these two distinct accepted V19
slots to prove that the current and saved employment/cash states stay distinct.
