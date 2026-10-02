#!/usr/bin/env python3
"""1358-J: the closed-form derivedEndWeek (step 3, relationships.ts:191-195) against the week-by-week
read of currentRomanceValue (:181-186), for every value 0..100. Python floats are IEEE doubles, the
same arithmetic as the JS expressions, evaluated in the same order. Prints only."""
import math
from fractions import Fraction

GRACE, DECAY, EXIT = 104, 260, 40


def current(value, anchor, week):  # currentRomanceValue
    dormant = week - anchor
    if dormant <= GRACE:
        return value
    span = min(dormant - GRACE, DECAY)
    return value - math.trunc(value * span / DECAY)


def closed(value, anchor):  # derivedEndWeek
    if value < EXIT:
        return anchor
    return anchor + GRACE + math.ceil(DECAY * (value - EXIT + 1) / value)


def walk(value, anchor):  # the first week the read drops below EXIT, or None
    for week in range(anchor, anchor + GRACE + DECAY + 2):
        if current(value, anchor, week) < EXIT:
            return week
    return None


def exact(value):  # the same law over exact rationals, as an independent oracle
    if value < EXIT:
        return 0
    for span in range(1, DECAY + 1):
        if value - math.floor(Fraction(value * span, DECAY)) < EXIT:
            return GRACE + span
    return None


bad = []
for anchor in (0, 7, 1000):
    for value in range(0, 101):
        c, w = closed(value, anchor), walk(value, anchor)
        e = exact(value)
        if c != w or (e is not None and w != anchor + e):
            bad.append((anchor, value, c, w, e))
print('mismatches:', bad if bad else 'none', '(values 0..100, anchors 0, 7, 1000)')
print('offsets:', {v: closed(v, 0) for v in (39, 40, 41, 52, 65, 75, 78, 80, 90, 96, 100)})
# Monotone: a higher stored value never ends earlier; and an open bond at value >= 40 ends after its anchor.
print('monotone in value:', all(closed(v, 0) <= closed(v + 1, 0) for v in range(40, 100)))
print('value >= 40 ends after the grace window:', all(closed(v, 0) > GRACE for v in range(40, 101)))
