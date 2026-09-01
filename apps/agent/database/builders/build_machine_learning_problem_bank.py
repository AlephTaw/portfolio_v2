"""Build the screenshot-derived machine-learning interview problem bank."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from .common import rebuild_database

DATABASE_PATH = Path(__file__).resolve().parents[1] / "machine_learning_problem_bank.sqlite"


@dataclass(frozen=True)
class Question:
    company: str
    title: str
    difficulty: str
    question: str
    answer: str
    checker_groups: tuple[tuple[str, ...], ...]
    source_images: tuple[str, ...]
    notes: str = ""
    source_solution_status: str = "captured"


QUESTIONS: tuple[Question, ...] = (
    Question(
        "Robinhood",
        "Imbalanced binary classification",
        "easy",
        "You are building a binary classifier where the classes occur at roughly 1% and 99%. How do you handle the imbalance?",
        "Start with the business cost of false positives and false negatives and use stratified splits plus precision, recall, PR-AUC, ROC-AUC, and calibrated probabilities rather than raw accuracy. Establish an untouched test set, then apply class weights or focal/cost-sensitive loss, minority oversampling (including carefully validated synthetic methods such as SMOTE), or majority undersampling only inside each training fold. Tune the decision threshold against the business objective, compare with an unmodified baseline, check probability calibration and subgroup performance, and seek more representative minority examples when possible.",
        (("precision", "recall", "pr-auc", "f1"), ("class weight", "cost-sensitive", "focal"), ("oversampl", "undersampl", "smote"), ("threshold",), ("stratified", "fold", "validation")),
        ("M01", "M04", "M05"),
    ),
    Question(
        "Square",
        "Squared versus absolute error",
        "easy",
        "Compare models minimizing squared error and absolute error. When is each objective appropriate?",
        "Squared error magnifies large residuals, is smooth and easy to optimize, and under a conditional model targets the mean; minimizing it corresponds to Gaussian noise assumptions. Absolute error grows linearly, is more robust to outliers, is non-differentiable at zero (though subgradients are available), and targets the conditional median; it corresponds to Laplace-like noise. Use squared error when large misses deserve disproportionate cost and tails are well behaved, and absolute or Huber loss when robustness is more important.",
        (("outlier", "robust"), ("mean",), ("median",), ("gaussian",), ("smooth", "differentiat")),
        ("M01", "M05"),
    ),
    Question(
        "Facebook",
        "Choosing k for k-means",
        "easy",
        "How do you choose the number of clusters k for k-means?",
        "Fit a range of k values with repeated initializations and inspect within-cluster sum of squares for an elbow. Compare silhouette score, gap statistic, held-out stability, and sensitivity to seeds or resampling. Then require clusters to be interpretable, sufficiently sized, stable, and useful for the downstream business decision. There is no universally correct k: scaling, distance choice, non-spherical structure, and domain constraints can dominate any single diagnostic.",
        (("elbow", "within-cluster", "inertia"), ("silhouette", "gap statistic"), ("stability", "seed", "resampl"), ("business", "domain", "interpret")),
        ("M01", "M05", "M06"),
    ),
    Question(
        "Salesforce",
        "Robustness to outliers",
        "easy",
        "How can you make models more robust to outliers?",
        "First determine whether extreme values are measurement errors, valid rare cases, distribution shift, or the target behavior. Repair data errors and use train-only robust scaling, transformations, winsorization, or explicit missing/outlier indicators when justified. Prefer robust objectives such as MAE or Huber loss, regularization, quantile methods, or models less sensitive to magnitude such as trees. Compare performance with and without treatment across relevant slices; delete observations only with a defensible data-quality reason.",
        (("investigat", "measurement", "valid"), ("winsor", "cap", "transform"), ("mae", "huber", "robust loss"), ("tree", "regularization"), ("remove", "delete", "drop")),
        ("M01", "M06", "M07"),
    ),
    Question(
        "AQR",
        "Multicollinearity in linear regression",
        "easy",
        "Several predictors in a multiple linear regression may be correlated. How does this affect the regression, and how would you address it?",
        "Multicollinearity does not inherently bias OLS predictions, but it makes individual coefficients weakly identified: estimates and signs become unstable, standard errors widen, p-values become unreliable, and extrapolation is fragile. Diagnose it with correlation structure, condition numbers, or VIF while considering the data-generating process. Remove redundant variables, combine them using domain knowledge, collect more informative data, use PCA/partial least squares, or apply ridge regularization. Choose the remedy according to whether prediction or coefficient interpretation is the goal.",
        (("unstable", "variance", "standard error"), ("p-value", "significance"), ("vif", "condition number", "correlation"), ("remove", "combine", "pca"), ("ridge", "regularization")),
        ("M01", "M07"),
    ),
    Question(
        "Point72",
        "Random-forest motivation",
        "easy",
        "Describe the motivation behind random forests and two ways they improve on individual decision trees.",
        "A deep decision tree has low bias but high variance. A random forest trains many trees on bootstrap samples and averages their predictions, so bagging reduces variance. It also samples only a subset of features at each split, decorrelating the trees so averaging is more effective. Out-of-bag evaluation and aggregated feature diagnostics are useful side benefits, although impurity importance can be biased.",
        (("bootstrap", "bagging"), ("average", "vote"), ("feature subset", "subset of feature", "random feature"), ("decorrelat",), ("variance", "overfit")),
        ("M01", "M07"),
    ),
    Question(
        "PayPal",
        "Missing values in fraud data",
        "easy",
        "A large payment-transaction dataset has missing values in many columns. How would you handle them when predicting fraud?",
        "Profile missingness by feature, time, merchant, device, and label, and determine whether it is MCAR, MAR, or plausibly MNAR; missingness itself may be predictive of fraud. Establish a baseline, add missing-value indicators, and fit imputers only on each training fold to avoid leakage. Use type-appropriate median/mode, model-based, or nearest-neighbor imputation, or models with native missing handling, then compare cross-validated discrimination, calibration, and operational cost. Investigate upstream collection and external enrichment rather than blindly dropping rows.",
        (("mcar", "mar", "mnar", "missing at random"), ("indicator", "missingness"), ("imput",), ("leakage", "training fold", "pipeline"), ("baseline", "cross-valid")),
        ("M01", "M07", "M08"),
    ),
    Question(
        "Airbnb",
        "Improving logistic regression",
        "easy",
        "A simple logistic regression is unsatisfactory. How might you improve it, and what alternatives would you consider?",
        "First diagnose whether the issue is leakage, label quality, imbalance, calibration, threshold choice, missing features, or a nonlinear relationship. Standardize numeric features, encode categoricals safely, add domain features, interactions, splines or polynomial terms, handle outliers, and tune L1/L2 regularization under cross-validation. If residual structure remains nonlinear, compare trees, random forests, gradient boosting, SVMs, or neural networks using the same leakage-safe splits and business metric. Prefer the simplest model that meets accuracy, calibration, latency, and interpretability needs.",
        (("feature", "interaction", "polynomial", "spline"), ("regularization", "l1", "l2"), ("cross-valid", "tuning"), ("tree", "boost", "svm", "neural"), ("threshold", "calibration", "metric")),
        ("M02", "M09"),
    ),
    Question(
        "Two Sigma",
        "Duplicating regression observations",
        "easy",
        "If every observation in a linear-regression dataset is duplicated, what happens to the OLS beta coefficients?",
        "Duplicating every row once multiplies both XᵀX and Xᵀy by two, so β̂=(XᵀX)⁻¹Xᵀy is unchanged, as are fitted values and residual patterns. But the duplicate rows are not new independent information. Software that treats them as independent can report artificially small standard errors, confidence intervals, and p-values because the nominal sample size doubled. Cluster/weight the duplicates appropriately or remove them for inference.",
        (("unchanged", "same coefficient"), ("x", "beta", "matrix"), ("standard error", "confidence interval", "p-value"), ("independent", "information")),
        ("M02", "M09"),
        "Adds the inferential consequence omitted by the source's coefficient-only derivation.",
    ),
    Question(
        "PwC",
        "Gradient boosting versus random forests",
        "easy",
        "Compare and contrast gradient boosting and random forests.",
        "Both combine decision trees. Random forests fit largely independent deep trees in parallel on bootstrap samples with random feature subsets and average them, primarily reducing variance. Gradient boosting fits shallow weak learners sequentially to residuals or negative gradients, primarily reducing bias. Forests are robust defaults with fewer sensitive hyperparameters; boosting often achieves higher tabular accuracy but is more sensitive to learning rate, depth, rounds, noise, and overfitting. Compare them with identical validation splits, calibration, latency, and interpretability constraints.",
        (("bootstrap", "bagging"), ("parallel", "independent"), ("sequential", "residual", "gradient"), ("variance",), ("bias",), ("learning rate", "tuning")),
        ("M02", "M09", "M10"),
    ),
    Question(
        "DoorDash",
        "ETA modeling with 10,000 deliveries",
        "easy",
        "DoorDash has 10,000 beta deliveries in Singapore. Is that enough data to build an accurate ETA model?",
        "The row count alone cannot answer this. Define when the prediction is made, the acceptable under/over-estimation costs, geography and time coverage, and the required metric. Build a simple route/time baseline, use temporal or geographic holdouts, and plot learning curves as training data grows. Check effective coverage across restaurants, zones, traffic, weather, courier supply, and rare delays; 10,000 may be ample for a narrow baseline or inadequate for sparse interactions. Improve features, transfer from related markets carefully, launch with safeguards, collect data, and monitor calibration and drift.",
        (("cannot", "depends", "not enough information"), ("baseline",), ("learning curve",), ("coverage", "segment", "geograph", "time"), ("metric", "business", "underestimate", "overestimate")),
        ("M02", "M10", "M11"),
    ),
    Question(
        "Affirm",
        "Reasons for loan rejection",
        "medium",
        "A binary loan model must provide rejected applicants with reasons. Without simply reading raw feature weights, how would you produce them?",
        "Generate local, case-specific explanations: use controlled feature perturbations or counterfactuals, SHAP values, and monotonic partial-dependence/ALE diagnostics to identify factors that materially lowered this applicant's approval score. Map validated factors to stable, human-readable reason codes and select the top actionable adverse factors. Test fidelity, stability, protected-class and proxy behavior, and consistency; involve legal/compliance review and retain an auditable mapping from model version to notice. Global feature importance or raw weights alone are not applicant-specific reasons.",
        (("local", "applicant", "case-specific"), ("shap", "counterfactual", "perturb"), ("reason code", "human-readable"), ("compliance", "audit", "fairness"), ("protected", "proxy")),
        ("M02", "M11", "M12"),
        "Expands the source partial-dependence idea into faithful local explanations and compliance controls.",
    ),
    Question(
        "Stitch Fix", "Detecting synonyms", "medium",
        "How would you identify whether two words are synonyms?",
        "Represent words with contextual or distributional embeddings learned from large corpora, then compare candidate senses with cosine similarity or nearest-neighbor retrieval. Static embeddings are a useful baseline, but contextual embeddings handle polysemy better. Add lexical resources such as WordNet and supervised synonym pairs when available. Distributional similarity alone can confuse antonyms and related words, so evaluate on sense-aware labeled pairs and use human review for the target domain.",
        (("embedding", "vector"), ("cosine", "nearest"), ("context", "polysemy", "sense"), ("wordnet", "lexical"), ("antonym", "human", "evaluat")),
        ("M02", "M12"),
    ),
    Question(
        "General", "Bias-variance decomposition", "medium",
        "Explain the bias-variance tradeoff and its relationship to model complexity.",
        "For squared prediction error, expected test error decomposes into irreducible noise plus squared bias plus variance. Simple, strongly constrained models often have high bias and low variance; increasingly flexible models usually reduce bias but increase sensitivity to the training sample. Cross-validation, regularization, ensembling, and more representative data help choose a useful balance. Training error alone cannot reveal that balance.",
        (("noise", "irreducible"), ("bias",), ("variance",), ("complex", "flexib"), ("cross-valid", "regulariz", "ensemble")),
        ("M02", "M12", "M13"),
    ),
    Question(
        "General", "Cross-validation", "medium",
        "Describe cross-validation, including important variants and common leakage mistakes.",
        "In k-fold cross-validation, partition the training data into k folds, train on k-1 and score the held-out fold, then aggregate the fold metrics. Use stratification for imbalanced labels, grouped folds when entities repeat, and forward or rolling temporal splits for time-dependent data. To prevent leakage, fit every learned preprocessing step, feature selector, imputer, and resampler inside each training fold. Keep a final untouched test set; use nested cross-validation when both tuning and unbiased performance estimation matter.",
        (("k-fold", "fold"), ("stratif", "group", "time", "temporal"), ("preprocess", "imput", "inside"), ("leak",), ("nested", "test set")),
        ("M02", "M13"),
    ),
    Question(
        "Salesforce", "Lead scoring", "medium",
        "Design a model that scores sales leads by their likelihood of converting.",
        "Define conversion and a prediction horizon first, and construct point-in-time labels so future sales activity cannot leak into features. Combine firmographic, acquisition, product, marketing-engagement, and prior contact features available at scoring time. Compare calibrated logistic and tree-boosting baselines with temporal validation, ranking and calibration metrics, and business lift at the sales team's capacity. Deploy scores with reason codes, test the workflow experimentally, and monitor drift, feedback loops, and segment fairness.",
        (("label", "horizon", "conversion"), ("point-in-time", "leak"), ("firmographic", "engagement", "marketing"), ("calibrat", "lift", "ranking"), ("temporal", "drift", "experiment")),
        ("M03", "M13", "M14"),
    ),
    Question(
        "Spotify", "Music recommendation", "medium",
        "How would you build a personalized music recommender?",
        "Treat plays, skips, saves, follows, and repeats as weighted implicit feedback. Use collaborative filtering or matrix factorization for retrieval, content/audio/text embeddings for similarity and cold start, and a hybrid ranker with user, track, context, novelty, freshness, and diversity features. Train with time-aware negatives, prevent leakage, and evaluate recall/NDCG plus coverage and diversity offline. Validate long-term listening and satisfaction through guarded A/B tests while monitoring popularity bias and feedback loops.",
        (("implicit", "play", "skip"), ("collaborative", "matrix factor"), ("content", "embedding", "hybrid"), ("cold start",), ("ndcg", "recall", "a/b", "divers")),
        ("M03", "M14"),
    ),
    Question(
        "General", "Convexity and neural networks", "medium",
        "What is a convex function, and why is neural-network training generally non-convex?",
        "A function f is convex when f(tx+(1-t)y) is at most t f(x)+(1-t)f(y) for every x, y and t in [0,1]; equivalently its epigraph is convex. A differentiable convex objective has no suboptimal local minima. Neural networks compose nonlinear layers and contain parameter symmetries and multiplicative interactions, producing a non-convex loss surface with saddles and many equivalent minima. Gradient methods can still work well without a global-optimum guarantee.",
        (("f(tx", "line segment", "epigraph"), ("local", "global"), ("nonlinear", "composition"), ("symmetr", "saddle", "equivalent"), ("gradient", "guarantee")),
        ("M03", "M14"),
    ),
    Question(
        "General", "Entropy and information gain", "medium",
        "Define entropy and information gain, and explain how decision trees use them.",
        "For class probabilities p_k, entropy is H=-sum_k p_k log2(p_k); it is zero for a pure node and largest for a uniform distribution. A split's information gain is parent entropy minus the sample-weighted entropy of its children. For example, a balanced binary parent has entropy 1 bit, and a split into two pure children has weighted entropy 0 and gain 1. A tree selects the candidate split with the greatest impurity reduction, subject to its regularization constraints.",
        (("-sum", "log2", "log"), ("pure", "uniform"), ("parent", "weighted", "child"), ("gain", "reduction"), ("decision tree", "split")),
        ("M03", "M14", "M15"),
    ),
    Question(
        "General", "L1 versus L2 regularization", "medium",
        "Compare L1 and L2 regularization.",
        "L1 adds lambda times the sum of absolute coefficients. Its corners and non-differentiability at zero encourage exact zeros and sparse feature selection, though the selected member of a correlated group can be unstable. L2 adds lambda times the sum of squared coefficients; it is smooth, shrinks coefficients continuously, and tends to share weight among correlated predictors. Tune lambda using validation, standardize features, and consider elastic net when both sparsity and grouped shrinkage are useful.",
        (("absolute", "l1"), ("sparse", "zero", "feature selection"), ("squared", "l2"), ("shrink",), ("correlated", "elastic net", "standardiz")),
        ("M03", "M15"),
    ),
    Question(
        "General", "Gradient descent versus SGD", "medium",
        "Compare batch gradient descent with stochastic gradient descent.",
        "Batch gradient descent computes the gradient over the full training set before each update, giving stable but potentially expensive steps. SGD updates from one randomly sampled example, while mini-batch SGD uses a small batch; these are noisy, approximately unbiased gradient estimates that are cheaper and can escape shallow regions. Shuffle data, tune a learning-rate schedule, and use momentum or adaptive optimizers when appropriate. Mini-batches usually provide the best hardware-efficiency tradeoff.",
        (("full", "batch"), ("sample", "mini-batch", "stochastic"), ("noisy", "unbiased"), ("learning rate", "schedule"), ("momentum", "adaptive", "shuffle")),
        ("M03", "M15"),
    ),
    Question(
        "General", "Monotone score transformations", "medium",
        "What happens to a classifier's ROC curve and AUC if every nonnegative score is replaced by its square root?",
        "Square root is strictly increasing on nonnegative values, so it preserves every score ordering. Sweeping corresponding thresholds therefore gives the same ROC curve and AUC, apart from possible numerical tie handling. The numeric threshold and probability calibration do change: square-rooted probabilities are not calibrated probabilities without a new calibration map. A non-monotone transformation, clipping, or newly introduced ties can change ranking metrics.",
        (("strictly increasing", "monotonic"), ("ordering", "rank"), ("same", "unchanged"), ("roc", "auc"), ("calibrat", "threshold", "ties")),
        ("M03", "M15", "M16"),
    ),
    Question(
        "General", "Gaussian entropy", "medium",
        "What is the differential entropy of a univariate Gaussian distribution?",
        "For X distributed as N(mu, sigma squared), differential entropy is one half times ln(2*pi*e*sigma squared) nats, or the same expression with log base 2 in bits. It depends on variance, not the mean, and increases by ln|a| when X is scaled by a nonzero constant. Unlike discrete entropy, differential entropy can be negative.",
        (("0.5", "one half"), ("2*pi", "2π", "pi"), ("variance", "sigma"), ("mean", "mu", "not"), ("nats", "bits", "differential")),
        ("M03", "M16"),
    ),
    Question(
        "Amazon", "Purchase propensity", "medium",
        "Design a model that predicts whether a user will purchase an item.",
        "Define the decision moment and purchase horizon, then create point-in-time user-item impressions with positives and carefully sampled or exposure-aware negatives. Use user history, item attributes, price, availability, context, and interaction features that existed at prediction time. Start with calibrated classification and ranking baselines, use temporal/user holdouts, and measure PR-AUC, ranking quality, calibration, and value at serving capacity. Deploy with exploration, monitor drift and selection bias, and confirm impact with an online experiment.",
        (("horizon", "label"), ("negative", "exposure", "impression"), ("user", "item", "context"), ("temporal", "holdout", "leak"), ("calibrat", "ranking", "experiment")),
        ("M03", "M16", "M17"),
    ),
    Question(
        "General", "Gaussian naive Bayes versus logistic regression", "medium",
        "Compare Gaussian naive Bayes and logistic regression.",
        "Gaussian naive Bayes is generative: it estimates class priors and a Gaussian distribution for each feature conditional on the class, usually assuming conditional independence, then applies Bayes' rule. Logistic regression is discriminative: it models log odds directly as a linear function. Naive Bayes can learn quickly with little data but its probabilities suffer when features are correlated; logistic regression often has lower asymptotic error with enough data. Under shared Gaussian covariance assumptions both induce linear boundaries.",
        (("generative",), ("conditional", "independ"), ("bayes", "prior"), ("discriminative", "log odds"), ("correlat", "linear boundary")),
        ("M03", "M17"),
    ),
    Question(
        "General", "K-means gradient updates", "medium",
        "Write the k-means objective and derive batch and stochastic updates for a centroid.",
        "With assignments C_k, J is sum over k and points i in C_k of ||x_i-mu_k|| squared. Holding assignments fixed, the gradient for mu_k is 2 sum_{i in C_k}(mu_k-x_i), whose zero gives the cluster mean. A batch step is mu_k <- mu_k - eta times that gradient (often normalized by cluster size). For an assigned sample x_i, an SGD step is mu_k <- mu_k + eta(x_i-mu_k). Then assignments and centroids are alternated.",
        (("sum", "norm", "squared"), ("gradient", "mu", "x"), ("cluster mean", "average"), ("batch", "eta", "learning rate"), ("sgd", "stochastic", "assigned")),
        ("M03", "M17", "M18"),
    ),
    Question(
        "General", "Kernel trick", "hard",
        "Explain the kernel trick and how you would choose a kernel.",
        "A kernel computes K(x,z)=phi(x) dot phi(z), an inner product in a possibly high-dimensional feature space, without explicitly constructing phi. Algorithms expressible through pairwise inner products can therefore learn nonlinear boundaries; common choices include polynomial and radial-basis-function kernels. A valid kernel is positive semidefinite. Choose and tune the kernel with domain knowledge, scaling, leakage-safe cross-validation, and computational constraints; kernel methods scale poorly with very large sample counts.",
        (("inner product", "dot product"), ("feature space", "phi"), ("rbf", "radial", "polynomial"), ("positive semidefinite", "psd", "valid kernel"), ("cross-valid", "scale", "comput")),
        ("M03", "M18"),
    ),
    Question(
        "General", "Gaussian maximum likelihood", "hard",
        "Derive the maximum-likelihood estimates of a Gaussian mean and variance.",
        "For independent x_i from N(mu,sigma squared), maximize the summed log likelihood. Setting its derivative in mu to zero gives mu-hat=(1/n)sum x_i. Substituting that estimate and differentiating with respect to sigma squared gives sigma-squared-hat_MLE=(1/n)sum(x_i-mu-hat)^2. The familiar denominator n-1 is the unbiased sample-variance correction, not the maximum-likelihood estimator.",
        (("log likelihood", "likelihood"), ("mean", "mu-hat", "average"), ("variance", "squared"), ("1/n", "denominator n"), ("n-1", "unbiased")),
        ("M03", "M18", "M19"),
    ),
    Question(
        "PayPal", "Fraud detection with a Gaussian mixture", "hard",
        "How could a Gaussian mixture model be used for fraud detection?",
        "Fit a mixture p(x)=sum_k pi_k N(x|mu_k,Sigma_k), usually with EM: compute posterior responsibilities in the E-step and update weights, means, and covariances in the M-step. For anomaly detection, flag observations with low total fitted density or poor likelihood under a model of legitimate behavior, using a threshold calibrated on labeled validation data. If a component is interpreted as fraud, its posterior can be used only after that component is identified with labels. Scale features, regularize covariances, choose k carefully, and monitor drift.",
        (("mixture", "component"), ("em", "e-step", "m-step"), ("responsibil", "posterior"), ("density", "likelihood", "anomal"), ("threshold", "validation", "covariance")),
        ("M03", "M19"),
    ),
    Question(
        "General", "Customer churn system", "hard",
        "Design an end-to-end model for predicting customer churn.",
        "Define churn, the observation window, prediction horizon, and intervention before labeling point-in-time snapshots; handle right censoring and prevent post-churn leakage. Build tenure, usage level and trend, support, billing, contract, engagement, and product features. Compare interpretable calibrated baselines with survival or boosting models using temporal splits and metrics tied to retention capacity and incremental value. Deliver reason codes and treatment policies, test interventions rather than scores alone, and monitor calibration, drift, fairness, and feedback loops.",
        (("define", "horizon", "window"), ("point-in-time", "leak", "censor"), ("usage", "tenure", "billing", "support"), ("temporal", "calibrat", "survival"), ("intervention", "experiment", "drift")),
        ("M03", "M19", "M20"),
    ),
    Question(
        "General", "OLS as Gaussian maximum likelihood", "hard",
        "Show why ordinary least squares is the maximum-likelihood estimator under Gaussian errors.",
        "Assume y=X beta+epsilon with independent Gaussian errors epsilon_i distributed N(0,sigma squared). The log likelihood equals a constant minus (1/(2 sigma squared)) times sum_i(y_i-x_i^T beta)^2. For fixed sigma squared, maximizing likelihood is therefore exactly minimizing residual sum of squares. Setting the gradient -2X^T(y-X beta) to zero gives beta-hat=(X^T X)^(-1)X^T y when X has full column rank.",
        (("gaussian", "normal"), ("log likelihood", "likelihood"), ("sum of squares", "sse", "residual"), ("gradient", "normal equation"), ("inverse", "x^t x", "full rank")),
        ("M03", "M20"),
        "The screenshot set contains the question but no source solution; this canonical solution was authored during reconciliation.",
        "missing",
    ),
    Question(
        "General", "Principal-component derivation", "hard",
        "Derive the first principal component and explain how subsequent components are obtained.",
        "Center the data and let S be its covariance matrix. The variance of projections onto a unit vector v is v^T S v, so PCA maximizes that Rayleigh quotient subject to v^T v=1. The Lagrangian condition gives S v=lambda v; the maximum is attained by the eigenvector with the largest eigenvalue. Subsequent components maximize remaining variance subject to orthogonality, yielding the remaining eigenvectors in descending eigenvalue order. Equivalently, use the right singular vectors of centered X.",
        (("center",), ("covariance",), ("maximize", "variance", "rayleigh"), ("eigenvector", "eigenvalue"), ("orthogonal", "svd", "singular")),
        ("M03", "M20", "M21"),
        "The screenshot set contains the question but no source solution; this canonical solution was authored during reconciliation.",
        "missing",
    ),
    Question(
        "General", "Logistic-regression likelihood", "hard",
        "Derive the logistic-regression objective and its gradient.",
        "Let p_i=sigma(x_i^T beta). The Bernoulli likelihood is the product of p_i^{y_i}(1-p_i)^{1-y_i}, so the log likelihood is sum_i[y_i log p_i+(1-y_i)log(1-p_i)]. Its gradient is X^T(y-p), and its Hessian is -X^T W X, making the unregularized log likelihood concave. Solve with gradient ascent, Newton/IRLS, or minimize the negative log likelihood; add L1 or L2 penalties when appropriate.",
        (("sigmoid", "sigma"), ("bernoulli", "likelihood"), ("log likelihood", "cross-entropy"), ("x^t", "y-p", "gradient"), ("hessian", "irls", "newton", "regulariz")),
        ("M03", "M21"),
        "The screenshot set contains the question but no source solution; this canonical solution was authored during reconciliation.",
        "missing",
    ),
    Question(
        "Spotify", "Discover Weekly system design", "hard",
        "Design a system like Spotify Discover Weekly.",
        "Use a two-stage hybrid recommender. Retrieve candidates from collaborative embeddings, similar listeners and playlists, followed artists, and audio/text content; then rank with recent sequential context, affinity, freshness, novelty, skip risk, and quality. Apply constraints for artist diversity, deduplication, safety, and a coherent weekly experience. Handle cold start with onboarding and content signals, train with exposure-aware implicit feedback, and evaluate ranking, discovery, diversity, retention, and satisfaction in long-running A/B tests while controlling popularity and feedback loops.",
        (("two-stage", "retriev", "rank"), ("collaborative", "embedding", "content"), ("fresh", "novel", "divers"), ("cold start",), ("implicit", "a/b", "feedback loop")),
        ("M03", "M21", "M22"),
        "The screenshot set contains the question but no source solution; this canonical solution was authored during reconciliation.",
        "missing",
    ),
    Question(
        "General", "Variance of OLS coefficients", "hard",
        "Derive the variance-covariance matrix of the OLS coefficient estimator.",
        "Under y=X beta+epsilon with fixed full-rank X, E[epsilon|X]=0 and Var(epsilon|X)=sigma squared I, beta-hat-beta=(X^T X)^(-1)X^T epsilon. Therefore Var(beta-hat|X)=(X^T X)^(-1)X^T(sigma squared I)X(X^T X)^(-1)=sigma squared(X^T X)^(-1). Estimate sigma squared by SSE/(n-p). With heteroskedastic or correlated errors use robust, clustered, or generalized least-squares covariance estimators instead.",
        (("beta", "epsilon", "error"), ("variance", "covariance"), ("sigma", "x^t x", "inverse"), ("sse", "n-p"), ("heteroskedastic", "robust", "cluster", "generalized")),
        ("M03", "M22"),
        "The screenshot set contains the question but no source solution; this canonical solution was authored during reconciliation.",
        "missing",
    ),
)


def seed_machine_learning_problem_bank(connection) -> None:
    """Populate a connection with the canonical machine-learning question bank."""
    connection.executescript(
        """
        CREATE TABLE questions (
            question_id TEXT PRIMARY KEY,
            source_number TEXT NOT NULL UNIQUE,
            company TEXT NOT NULL,
            title TEXT NOT NULL,
            difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            answer_type TEXT NOT NULL DEFAULT 'text' CHECK (answer_type = 'text'),
            checker_spec TEXT NOT NULL,
            source_images TEXT NOT NULL,
            notes TEXT NOT NULL DEFAULT '',
            source_solution_status TEXT NOT NULL CHECK (source_solution_status IN ('captured', 'missing'))
        );
        """
    )
    for number, question in enumerate(QUESTIONS, start=1):
        question_id = f"q{number:02d}"
        connection.execute(
            """
            INSERT INTO questions (
                question_id, source_number, company, title, difficulty, question,
                answer, checker_spec, source_images, notes, source_solution_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                question_id,
                f"7.{number}",
                question.company,
                question.title,
                question.difficulty,
                question.question,
                question.answer,
                json.dumps({"required_concept_groups": question.checker_groups}),
                json.dumps(question.source_images),
                question.notes,
                question.source_solution_status,
            ),
        )
        view_sql = (
            f"CREATE VIEW {question_id} AS SELECT * FROM questions "  # noqa: S608
            f"WHERE question_id = '{question_id}'"
        )
        connection.execute(view_sql)


def build_machine_learning_problem_bank(path: Path = DATABASE_PATH) -> Path:
    """Build and return the canonical SQLite database path."""
    rebuild_database(path, seed_machine_learning_problem_bank)
    return path


if __name__ == "__main__":
    print(build_machine_learning_problem_bank())
