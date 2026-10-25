// STATIC-UNRUN optional focused wrapper; the original cases may call these helpers directly.
import { it } from 'vitest'
import { assertAuthenticBidTieAndLowerBid, assertAuthenticLaterLotFallback, assertAuthenticWarningFallback } from './helpers/p16-authentic-bidders.js'

it('equal bids use identity order despite reverse submission, and the lower bid loses', assertAuthenticBidTieAndLowerBid)
it('a paid public campaign makes an earlier win consume the later bid cash, so the next funded bidder wins', assertAuthenticLaterLotFallback)
it('a genuinely warned high bidder is disqualified and the lower eligible bid wins', assertAuthenticWarningFallback)
