#!/usr/bin/env python3
"""Reproduce the bounded P13B Post-onset correction. Standard library only.

Inputs: paper at commit 15b45afd36ada15ed51e3ba656de6a4a3befb5e7,
03-PAPER-ECONOMICS.md; onset corroborated by companion sections 6 and 7.
This is paper arithmetic, not a runtime, benchmark, or gameplay test.
The script writes nothing; JSON is printed to stdout.
"""
from __future__ import annotations
import json
from fractions import Fraction
from math import ceil

DOCUMENT_COMMIT = "15b45afd36ada15ed51e3ba656de6a4a3befb5e7"

def operation_cost(end: int, completed: int, rate: int) -> int:
    if rate < 0 or end < 0 or completed < 0:
        raise ValueError("Nonnegative weeks and rates are required")
    return max(0, end - completed) * rate

def calculate() -> dict:
    # name, sound knowledge, light knowledge, published operation, published
    # department/deployment cash, published whole-fixture cash.
    inputs = [
        ("cooperate sound then light", 787, 794, 166000, 4694760, 5474760),
        ("split sound and light", 791, 791, 153000, 4441760, 5221760),
        ("cooperate sound then residual light", 787, 789, 171000, 4299760, 5079760),
        ("split sound and residual light", 791, 782, 162000, 4090760, 4870760),
    ]
    rows = []
    for name, sound, light, old_op, old_department, old_whole in inputs:
        post_done, stage_done, light_done = sound + 6, sound + 12, light + 4
        post = operation_cost(832, post_done, 2000)
        stage = operation_cost(832, stage_done, 2000)
        lighting = operation_cost(832, light_done, 1000)
        corrected = post + stage + lighting
        change = corrected - old_op
        assert change == 12000, (name, change)
        rows.append({
            "route": name,
            "post_operational_week": post_done,
            "stage_operational_week": stage_done,
            "lighting_operational_week": light_done,
            "post_opex": post, "stage_opex": stage, "lighting_opex": lighting,
            "published_operation_delta": old_op,
            "corrected_operation_delta": corrected,
            "correction": change,
            "published_department_deployment_cash": old_department,
            "corrected_department_deployment_cash": old_department + change,
            "published_whole_fixture_cash": old_whole,
            "corrected_whole_fixture_cash": old_whole + change,
        })
    post = operation_cost(468, 309, 2000)
    stage = operation_cost(468, 315, 2000)
    startup_correction = post + stage - 612000
    assert (post, stage, startup_correction) == (318000, 306000, 12000)
    # Same missing interval in all four allocation rows: differences unchanged.
    for a, b in ((0, 1), (2, 3)):
        assert (rows[a]["corrected_whole_fixture_cash"] - rows[b]["corrected_whole_fixture_cash"]
                == rows[a]["published_whole_fixture_cash"] - rows[b]["published_whole_fixture_cash"])
    # Independent checks of unchanged, specifically selected arithmetic.
    staffing = []
    for people, labs in ((1, 1), (4, 1), (8, 2)):
        output = Fraction(people * 3, 2) * (Fraction(13, 16) if labs == 2 else 1)
        weeks = ceil(Fraction(64, 1) / output)
        staffing.append({"people": people, "labs": labs, "output": str(output),
                         "weeks": weeks, "rd": weeks * people * 10000,
                         "salary": weeks * people * 2000,
                         "employment_overhead": weeks * people * 1500,
                         "signing": people * 18720})
    assert [r["weeks"] for r in staffing] == [43, 11, 7]
    near_release_common = 74880 + 416000 + 312000 + 364000
    research_near_release = near_release_common + 440000 + 100000 + 37000
    buy_near_release = near_release_common + 400000 + 46000
    assert research_near_release - buy_near_release == 131000
    rival = 900000 + 350000 + 74880 + 120000 + 70000 + 280000 + 210000 + 440000 + 100000 + 20000
    assert rival == 2564880
    return {
        "classification": "PAPER ARITHMETIC ONLY; no runtime or native tests",
        "document_commit": DOCUMENT_COMMIT,
        "horizon_convention": "[start,end); charge each body from its own operational week",
        "allocation_rows": rows,
        "startup": {
            "horizon_end": 468, "post_operational": 309, "stage_operational": 315,
            "post_opex": post, "stage_opex": stage,
            "published_sound_opex": 612000, "corrected_sound_opex": post + stage,
            "published_department_deployment_cash": 5068720,
            "corrected_department_deployment_cash": 5068720 + startup_correction,
            "published_whole_fixture_cash": 8443720,
            "corrected_whole_fixture_cash": 8443720 + startup_correction,
        },
        "unchanged_selected_checks": {"staffing": staffing,
            "near_release_waiting_advantage": research_near_release - buy_near_release,
            "rival_incremental_cash": rival,
            "capability_budget_sum": sum((10, 16, 12, 10, 12, 16, 8)),
            "reserve_budget_sum": sum((14, 6, 10, 6))},
        "not_claimed": ["full original archive integrity", "all source-excerpt hashes",
            "runtime verification", "all economics independently certified", "game balance or ROI"],
    }

if __name__ == "__main__":
    print(json.dumps(calculate(), indent=2, ensure_ascii=False))
