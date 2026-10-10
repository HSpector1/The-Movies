Source-only controls; no runtime result is claimed.

A syntactically valid return17 typo tested another thrown ReferenceError instead of the intended swallowed-error normal return. Both actual return paths now say return 17; static syntax alone cannot verify that distinction.

Cleanup precedence needs separate reset, end, and body cases, including falsy thrown values. Reset-only failures could conceal an incorrect end/body implementation.

Decoder structural refusals use a direct large native tuple, not an encoder text that fails its earlier byte limit. Exact own-key controls include symbols and nonenumerable keys; known-no-fit sink controls prove getters and codec are not touched.

Physical native row accounting and the complete transient legacy projection are distinct, explicitly adopted contracts. Controls prove exact full tuples, Unicode byte counts, original digest preimages, context/order/multiplicity, and the actual shared matcher; they do not prove fixture fit or gameplay.
