# Machine-learning screenshot reconciliation

This inventory reconciles the 22 uploaded screenshots into 35 unique interview problems.
The source uses printed numbers 7.1–7.35. No duplicate captures were found. Creation order
is authoritative for continuations when prose or equations cross an image boundary.

## Image ledger

| Capture | Filename | Role and covered source material |
|---|---|---|
| M01 | `Screenshot 2026-08-20 at 12.57.06 PM.png` | Questions 7.1–7.7 |
| M02 | `Screenshot 2026-08-20 at 12.57.13 PM.png` | Questions 7.8–7.26 |
| M03 | `Screenshot 2026-08-20 at 12.57.38 PM.png` | Questions 7.27–7.35 |
| M04 | `Screenshot 2026-08-20 at 12.57.44 PM.png` | Solution 7.1, fragment 1 |
| M05 | `Screenshot 2026-08-20 at 12.57.51 PM.png` | Solution 7.1 end; 7.2; 7.3 start |
| M06 | `Screenshot 2026-08-20 at 12.58.01 PM.png` | Solution 7.3 end; 7.4 start |
| M07 | `Screenshot 2026-08-20 at 12.58.10 PM.png` | Solution 7.4 end; 7.5; 7.6; 7.7 start |
| M08 | `Screenshot 2026-08-20 at 12.58.16 PM.png` | Solution 7.7 continuation/end |
| M09 | `Screenshot 2026-08-20 at 12.58.24 PM.png` | Solutions 7.8, 7.9, and 7.10 start |
| M10 | `Screenshot 2026-08-20 at 12.58.32 PM.png` | Solution 7.10 end; 7.11 start |
| M11 | `Screenshot 2026-08-20 at 12.58.40 PM.png` | Solution 7.11 end; 7.12 start |
| M12 | `Screenshot 2026-08-20 at 12.58.47 PM.png` | Solution 7.12 end; 7.13; 7.14; 7.15 start |
| M13 | `Screenshot 2026-08-20 at 12.58.53 PM.png` | Solution 7.15 end; 7.16 |
| M14 | `Screenshot 2026-08-20 at 12.59.03 PM.png` | Solution 7.16 end; 7.17 |
| M15 | `Screenshot 2026-08-20 at 12.59.10 PM.png` | Solution 7.17 end; 7.18; 7.19 start |
| M16 | `Screenshot 2026-08-20 at 12.59.17 PM.png` | Solution 7.19 end; 7.20; 7.21 start |
| M17 | `Screenshot 2026-08-20 at 12.59.24 PM.png` | Solution 7.21 end; 7.22; 7.23 start |
| M18 | `Screenshot 2026-08-20 at 12.59.33 PM.png` | Solution 7.23 end; 7.24; 7.25 |
| M19 | `Screenshot 2026-08-20 at 12.59.40 PM.png` | Solution 7.25 end; 7.26; 7.27 start |
| M20 | `Screenshot 2026-08-20 at 12.59.47 PM.png` | Solution 7.27 end; 7.28 |
| M21 | `Screenshot 2026-08-20 at 12.59.52 PM.png` | Solutions 7.29 and 7.30 start |
| M22 | `Screenshot 2026-08-20 at 12.59.58 PM.png` | Solution 7.30 continuation/end |

## Canonical problem map

| ID | Source | Difficulty | Company | Canonical title | Question | Source solution |
|---|---:|---|---|---|---|---|
| q01 | 7.1 | easy | Robinhood | Imbalanced binary classification | M01 | M04–M05 |
| q02 | 7.2 | easy | Square | Squared versus absolute error | M01 | M05 |
| q03 | 7.3 | easy | Facebook | Choosing k for k-means | M01 | M05–M06 |
| q04 | 7.4 | easy | Salesforce | Robustness to outliers | M01 | M06–M07 |
| q05 | 7.5 | easy | AQR | Multicollinearity in linear regression | M01 | M07 |
| q06 | 7.6 | easy | Point72 | Random-forest motivation | M01 | M07 |
| q07 | 7.7 | easy | PayPal | Missing values in fraud data | M01 | M07–M08 |
| q08 | 7.8 | easy | Airbnb | Improving logistic regression | M02 | M09 |
| q09 | 7.9 | easy | Two Sigma | Duplicating regression observations | M02 | M09 |
| q10 | 7.10 | easy | PwC | Gradient boosting versus random forests | M02 | M09–M10 |
| q11 | 7.11 | easy | DoorDash | ETA modeling with 10,000 deliveries | M02 | M10–M11 |
| q12 | 7.12 | medium | Affirm | Reasons for loan rejection | M02 | M11–M12 |
| q13 | 7.13 | medium | Google | Identifying synonyms in a corpus | M02 | M12 |
| q14 | 7.14 | medium | Facebook | Bias–variance trade-off | M02 | M12 |
| q15 | 7.15 | medium | Uber | Cross-validation | M02 | M12–M13 |
| q16 | 7.16 | medium | Salesforce | Enterprise lead scoring | M02 | M13–M14 |
| q17 | 7.17 | medium | Spotify | Music recommendation | M02 | M14–M15 |
| q18 | 7.18 | medium | Amazon | Convexity and a non-convex ML example | M02 | M15 |
| q19 | 7.19 | medium | Microsoft | Entropy and information gain | M02 | M15–M16 |
| q20 | 7.20 | medium | Uber | L1 versus L2 regularization | M02 | M16 |
| q21 | 7.21 | medium | Amazon | Gradient descent and SGD | M02 | M16–M17 |
| q22 | 7.22 | medium | Affirm | Monotone score transforms and ROC | M02 | M17 |
| q23 | 7.23 | medium | IBM | Entropy of a Gaussian | M02 | M17–M18 |
| q24 | 7.24 | medium | Stitch Fix | Item-purchase propensity | M02 | M18 |
| q25 | 7.25 | medium | Citadel | Gaussian naive Bayes versus logistic regression | M02 | M18–M19 |
| q26 | 7.26 | hard | Walmart | K-means loss and gradient updates | M02 | M19 |
| q27 | 7.27 | hard | Two Sigma | SVM kernel trick | M03 | M19–M20 |
| q28 | 7.28 | hard | Morgan Stanley | Gaussian maximum-likelihood estimates | M03 | M20 |
| q29 | 7.29 | hard | Stripe | GMM anomaly detection | M03 | M21 |
| q30 | 7.30 | hard | Robinhood | Churn-model design | M03 | M21–M22 |
| q31 | 7.31 | hard | Two Sigma | Gaussian regression MLE and least squares | M03 | **missing** |
| q32 | 7.32 | hard | Uber | PCA derivation and constrained maximization | M03 | **missing** |
| q33 | 7.33 | hard | Citadel | Logistic-regression likelihood | M03 | **missing** |
| q34 | 7.34 | hard | Spotify | Discover Weekly recommendation system | M03 | **missing** |
| q35 | 7.35 | hard | Google | OLS variance–covariance derivation | M03 | **missing** |

## Reconciliation and correction notes

- OCR confused Greek letters, superscripts, subscripts, summation bounds, minus signs, and
  equation grouping. Formulas are reconstructed from the visible mathematics and checked
  independently.
- The uploaded solution sequence ends after 7.30. No solution fragments for 7.31–7.35 are
  present in the directory. Canonical answers for q31–q35 are therefore newly authored and
  explicitly marked `source_solution_missing` in the problem bank.
- q03 presents elbow and silhouette methods as diagnostics, with business constraints and
  stability checks rather than implying a universally correct k.
- q09 distinguishes unchanged OLS coefficients from invalidly overconfident standard errors
  if duplicated rows are incorrectly treated as independent observations.
- q12 uses reason codes derived from model behavior (for example SHAP or controlled feature
  perturbations) and requires compliance/fairness review; a raw weight ranking is not enough.
- q22 states the precise invariant: strictly monotone increasing transforms preserve ranking
  and therefore the empirical ROC/AUC; non-monotone transforms can change it.
- q29 distinguishes component-membership posterior probability from anomaly likelihood;
  low density or a dedicated fraud component must be calibrated on validation data.
- q31–q35 include complete derivations/system-design answers created during reconciliation,
  not falsely attributed to the absent source pages.

## Invariants

- Screenshot count: **22**.
- Unique problems: **35**, contiguous `q01`–`q35` / source 7.1–7.35.
- Duplicate captures: **0**.
- Missing source questions: **0**.
- Missing source solutions: **5** (7.31–7.35), documented and replaced with newly authored
  canonical answers.
- Every screenshot appears exactly once in the image ledger; range rows in the problem map
  identify every problem fragment carried by that screenshot.
