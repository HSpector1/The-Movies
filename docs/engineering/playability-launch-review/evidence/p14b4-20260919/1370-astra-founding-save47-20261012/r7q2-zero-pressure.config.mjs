// ONE bounded counterfactual; original assertions/timeouts unchanged; parent scheduled after UI.
export default {
  root: '/Users/zacheryspector/The-Movies-headless-program',
  test: {
    environment: 'node', fileParallelism: false,
    include: ['tests/bridge-p14b5-relationships.test.ts', 'tests/p14b4-rival-seating-preference.test.ts'],
    setupFiles: ['/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/r7q2-zero-pressure.setup.ts'],
    testNamePattern: new RegExp("^(?:family\\ 12\\ \u2014\\ the\\ R\\-D5\\ natural\\-chain\\ LEDGER\\ \\(measured;\\ the\\ frozen\\ controls\\ MUST\\ NOT\\ move\\ at\\ T2;\\ after\\ T2\\ every\\ settlement\\ is\\ checked\\ against\\ the\\ D5\\ receipt\\ facts\\)\\ p13\\-public\\-commercial\\-adoption:\\ chain\\ digests,\\ row\\ counts,\\ churn\\ rosters\\ empty\\ under\\ D1,\\ zero\\ exposed\\ rows\\ through\\ 416;\\ the\\ nine\\ frozen\\ drop\\ templates\\ only|family\\ 12\\ \u2014\\ the\\ R\\-D5\\ natural\\-chain\\ LEDGER\\ \\(measured;\\ the\\ frozen\\ controls\\ MUST\\ NOT\\ move\\ at\\ T2;\\ after\\ T2\\ every\\ settlement\\ is\\ checked\\ against\\ the\\ D5\\ receipt\\ facts\\)\\ seed\\-b:\\ chain\\ digests,\\ row\\ counts,\\ churn\\ rosters\\ empty\\ under\\ D1,\\ zero\\ exposed\\ rows\\ through\\ 416;\\ the\\ nine\\ frozen\\ drop\\ templates\\ only|P14B4\\ final\\ seating\\ preference\\ \u2014\\ no\\-preference\\ path\\ and\\ viability\\ gates\\ \\(plan\\ :223\\-225\\)\\ seed\\-b:\\ every\\ real\\ film\\ decision\\ without\\ members\\ equals\\ the\\ pre\\-existing\\ choice\\ and\\ pool;\\ every\\ decision\\ seats\\ the\\ law\\ pick\\ over\\ the\\ pool\\ the\\ seam\\ law\\ derives;\\ a\\ null\\ choice\\ only\\ when\\ no\\ permutation\\ is\\ viable)$"),
  },
}
