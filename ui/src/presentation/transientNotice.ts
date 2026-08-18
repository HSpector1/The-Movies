// ── The transient notice lifecycle (PF1-M2) ──────────────────────────────────
//
// A receipt is news, and news has a shelf life. Before this milestone the Lot's receipt
// strip had none: "Screenplay commissioned: …" could sit under the world for the rest of
// the session, still announcing a thing the player did forty weeks ago.
//
// The rule, in one sentence: A NOTICE SURVIVES THE ACTION THAT PRODUCED IT AND EXPIRES ON
// THE NEXT ONE.
//
// The mechanism is an EPOCH owned by App — a plain counter bumped every time the studio's
// authoritative state is replaced. It is presentation state: it is not in `GameState`, it
// is never saved, and nothing in the engine can see it.
//
// DISMISSAL IS NOT A JOURNAL. Nothing is written down when a notice expires. History is
// the clippings and the Chronicle; a notice that has expired is simply gone.
//
// The identity/epoch pair is what makes this correct in both orderings, which matters
// because the Lot announces in two different ways:
//
//   - SAME COMMIT as the action (a publicity acceptance announces inside the click, after
//     App has already bumped the epoch). Identity changed, so the notice adopts the new
//     epoch instead of being expired by it.
//   - A LATER COMMIT (a commission receipt is published only once App has committed and
//     autosaved its successor). The old notice expires on the action's epoch; the new one
//     arrives afterwards with an identity of its own.
//
// Comparing "did a new notice land?" BEFORE "has the epoch moved on?" is the whole trick,
// and it is why this is a shared hook rather than a condition copied into two components.

import { useEffect, useRef } from 'react'

/**
 * Expire `onExpire()` once the epoch advances past the epoch the current notice arrived in.
 *
 * @param identity changes exactly when a NEW notice lands (a serial, or the text itself)
 * @param present  is a notice actually showing right now
 * @param epoch    App's notice epoch
 * @param onExpire must be referentially stable (a `useCallback` or a state setter wrapper)
 */
export function useTransientNotice(
  identity: unknown,
  present: boolean,
  epoch: number,
  onExpire: () => void,
): void {
  const seen = useRef<{ identity: unknown; epoch: number }>({ identity, epoch })
  useEffect(() => {
    const previous = seen.current
    if (identity !== previous.identity) {
      // A new notice landed in this commit. It belongs to whatever epoch is current now —
      // including the epoch its own action just bumped to.
      seen.current = { identity, epoch }
      return
    }
    if (!present || epoch === previous.epoch) return
    seen.current = { identity, epoch }
    onExpire()
  }, [identity, present, epoch, onExpire])
}
