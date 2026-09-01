# Python algorithm screenshot reconciliation

This inventory reconciles the 29 uploaded screenshots into 30 unique interview problems.
The source uses printed numbers 9.1–9.30. No duplicate captures were found. Creation order
is authoritative for continuations when a sentence or code block crosses an image boundary.

## Image ledger

| Capture | Filename | Role and covered source material |
|---|---|---|
| A01 | `Screenshot 2026-08-20 at 12.47.48 PM.png` | Questions 9.1–9.11 and first fragment of 9.12 |
| A02 | `Screenshot 2026-08-20 at 12.47.56 PM.png` | End of question 9.12; questions 9.13–9.23 |
| A03 | `Screenshot 2026-08-20 at 12.48.03 PM.png` | Questions 9.24–9.30 |
| A04 | `Screenshot 2026-08-20 at 12.48.09 PM.png` | Solution 9.1, fragment 1 |
| A05 | `Screenshot 2026-08-20 at 12.48.15 PM.png` | Solution 9.1 end; 9.2; 9.3 start |
| A06 | `Screenshot 2026-08-20 at 12.48.22 PM.png` | Solution 9.3 end; 9.4; 9.5 start |
| A07 | `Screenshot 2026-08-20 at 12.48.29 PM.png` | Solution 9.5 end; 9.6 start |
| A08 | `Screenshot 2026-08-20 at 12.48.41 PM.png` | Solution 9.6 end; 9.7; 9.8 start |
| A09 | `Screenshot 2026-08-20 at 12.48.47 PM.png` | Solution 9.8 end; 9.9 start |
| A10 | `Screenshot 2026-08-20 at 12.48.53 PM.png` | Solution 9.9 end; 9.10 start |
| A11 | `Screenshot 2026-08-20 at 12.49.00 PM.png` | Solution 9.10 end; 9.11; 9.12 start |
| A12 | `Screenshot 2026-08-20 at 12.49.06 PM.png` | Solution 9.12 end; 9.13 start |
| A13 | `Screenshot 2026-08-20 at 12.49.12 PM.png` | Solution 9.13 end; 9.14 start |
| A14 | `Screenshot 2026-08-20 at 12.49.18 PM.png` | Solution 9.14 end; 9.15 start |
| A15 | `Screenshot 2026-08-20 at 12.49.25 PM.png` | Solution 9.15 end; 9.16 start |
| A16 | `Screenshot 2026-08-20 at 12.49.32 PM.png` | Solution 9.16 end; 9.17; 9.18 start |
| A17 | `Screenshot 2026-08-20 at 12.49.37 PM.png` | Solution 9.18 end; 9.19; 9.20 start |
| A18 | `Screenshot 2026-08-20 at 12.49.43 PM.png` | Solution 9.20 continuation |
| A19 | `Screenshot 2026-08-20 at 12.49.49 PM.png` | Solution 9.20 end; 9.21; 9.22 start |
| A20 | `Screenshot 2026-08-20 at 12.49.56 PM.png` | Solution 9.22 end; 9.23 start |
| A21 | `Screenshot 2026-08-20 at 12.50.04 PM.png` | Solution 9.23 end; 9.24; 9.25 start |
| A22 | `Screenshot 2026-08-20 at 12.50.13 PM.png` | Solution 9.25 end; 9.26 start |
| A23 | `Screenshot 2026-08-20 at 12.50.20 PM.png` | Solution 9.26 end; 9.27 start |
| A24 | `Screenshot 2026-08-20 at 12.50.28 PM.png` | Solution 9.27 end; 9.28 start |
| A25 | `Screenshot 2026-08-20 at 12.50.34 PM.png` | Solution 9.28 end; 9.29 start |
| A26 | `Screenshot 2026-08-20 at 12.50.42 PM.png` | Solution 9.29 continuation |
| A27 | `Screenshot 2026-08-20 at 12.50.57 PM.png` | Solution 9.29 end; 9.30 start |
| A28 | `Screenshot 2026-08-20 at 12.51.04 PM.png` | Solution 9.30 continuation |
| A29 | `Screenshot 2026-08-20 at 12.51.11 PM.png` | Solution 9.30 end |

## Canonical problem map

| ID | Source | Difficulty | Company | Canonical title | Question capture | Solution captures |
|---|---:|---|---|---|---|---|
| q01 | 9.1 | easy | Amazon | Array intersection | A01 | A04–A05 |
| q02 | 9.2 | easy | D. E. Shaw | Maximum product of three | A01 | A05 |
| q03 | 9.3 | easy | Facebook | K closest points to the origin | A01 | A05–A06 |
| q04 | 9.4 | easy | Google | K-th smallest in a sorted matrix | A01 | A06 |
| q05 | 9.5 | easy | Akuna Capital | Maximum contiguous subarray sum | A01 | A06–A07 |
| q06 | 9.6 | easy | Facebook | Symmetric binary tree | A01 | A07–A08 |
| q07 | 9.7 | medium | Google | Find a peak element | A01 | A08 |
| q08 | 9.8 | medium | AQR | Pearson correlation | A01 | A08–A09 |
| q09 | 9.9 | medium | Amazon | Binary-tree diameter | A01 | A09–A10 |
| q10 | 9.10 | medium | D. E. Shaw | Constrained random integer sample | A01 | A10–A11 |
| q11 | 9.11 | medium | Facebook | Shortest friendship path | A01 | A11 |
| q12 | 9.12 | medium | LinkedIn | Anagram start indices | A01–A02 | A11–A12 |
| q13 | 9.13 | medium | Yelp | Minimum interval removals | A02 | A12–A13 |
| q14 | 9.14 | medium | Goldman Sachs | Group anagrams | A02 | A13–A14 |
| q15 | 9.15 | medium | Two Sigma | Count friend groups | A02 | A14–A15 |
| q16 | 9.16 | medium | Workday | Remove K-th node from the end | A02 | A15–A16 |
| q17 | 9.17 | medium | Goldman Sachs | Estimate pi with Monte Carlo | A02 | A16 |
| q18 | 9.18 | medium | Palantir | Remove invalid parentheses | A02 | A16–A17 |
| q19 | 9.19 | medium | Citadel | Generate integer permutations | A02 | A17 |
| q20 | 9.20 | medium | Two Sigma | Weighted category sampling | A02 | A17–A19 |
| q21 | 9.21 | medium | Amazon | Longest common subarray | A02 | A19 |
| q22 | 9.22 | medium | Uber | Maximum-sum increasing subsequence | A02 | A19–A20 |
| q23 | 9.23 | medium | Palantir | Minimum perfect-square count | A02 | A20–A21 |
| q24 | 9.24 | medium | Facebook | Combinations from 1 through n | A03 | A21 |
| q25 | 9.25 | hard | Citadel | Longest valid-parentheses substring | A03 | A21–A22 |
| q26 | 9.26 | hard | Bloomberg | Longest increasing matrix path | A03 | A22–A23 |
| q27 | 9.27 | hard | Google | Consecutive positive-integer sums | A03 | A23–A24 |
| q28 | 9.28 | hard | Citadel | Streaming median | A03 | A24–A25 |
| q29 | 9.29 | hard | Two Sigma | Wildcard matching | A03 | A25–A27 |
| q30 | 9.30 | hard | Citadel | Optimal fire-station location | A03 | A27–A29 |

## Reconciliation and correction notes

- OCR confused brackets, indentation, operators, `__init__`, `False`, infinity signs, and
  mathematical symbols. Canonical code is reconstructed from the visible algorithm rather
  than copied from OCR.
- q03 uses a bounded heap so its documented `O(n log k)` behavior is actually achieved.
- q05 follows the question's explicit all-negative requirement and returns `0`; the printed
  code initialized the maximum from the first element and contradicted that requirement.
- q07 treats a missing boundary neighbor as negative infinity; the printed/OCR fragment used
  an inconsistent infinity sign.
- q08 adds equal-length and zero-variance validation.
- q09 defines diameter consistently as an edge count.
- q10 receives an explicit seeded interface and validates feasibility so grading is
  deterministic and cannot loop forever.
- q18 preserves non-parenthesis characters and removes the minimum number of parentheses.
- q20 receives an explicit reusable sampler API and seeded randomness for deterministic tests.
- q27 counts positive-start sequences only and uses the derived square-root bound.
- q29 is interpreted as wildcard/glob matching: `?` matches one character and `*` matches
  zero or more characters.
- q30 minimizes the sum of Euclidean distances (the geometric median), not the sum of squared
  distances. The canonical implementation uses a numerically guarded geometric-median
  method and tests the objective/tolerance rather than exact floating-point text.

## Invariants

- Screenshot count: **29**.
- Unique problems: **30**, contiguous `q01`–`q30` / source 9.1–9.30.
- Duplicate captures: **0**.
- Missing source questions: **0**.
- Missing source solutions: **0**.
- Every screenshot appears exactly once in the image ledger; range rows in the problem map
  identify every problem fragment carried by that screenshot.
