# /// script
# requires-python = ">=3.12"
# dependencies = ["marimo>=0.23.16", "mlphd-bootcamp"]
# ///

"""Probability and statistics concepts for data scientist interviews."""

import marimo

__generated_with = "0.23.16"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    from mlphd_bootcamp import assertion, execute_submission, problem

    return assertion, execute_submission, mo, problem


@app.cell
def _(mo):
    mo.md(r"""
    # Probability and statistics for data scientist interviews

    **Prerequisites:** Python arithmetic and basic algebra.

    These units focus on the reasoning, calculations, assumptions, and concise
    explanations commonly expected in data scientist interviews. Every unit is
    independently executable.
    """)
    return


# === MLPHD UNIT START ===
# id: stats-probability-conditional-independence
# title: Probability, conditioning, and independence
# kind: exposition
# difficulty: easy
# teaches: stats-probability-conditional-independence
# assesses: stats-probability-conditional-independence
# requires:
# ===

@app.cell
def _(mo):
    mo.md(r"""
    ## 1. Probability, conditioning, and independence

    **Motivation:** Interview probability questions test whether you can reason
    correctly when events overlap or new information changes the sample space.

    **Goal:** Apply complements, unions, conditional probability, and the formal
    test for independence.

    Use $P(A^c)=1-P(A)$, $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$, and
    $P(A|B)=P(A\\cap B)/P(B)$. Events are independent exactly when
    $P(A\\cap B)=P(A)P(B)$; mutually exclusive nonempty events are not independent.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_01_description = mo.md("""
    ### Exercise

    Implement `conditional(intersection, given)` and
    `are_independent(p_a, p_b, p_both)`.
    """)
    stats_exercise_01_starter = mo.ui.code_editor(
        value='def conditional(intersection, given):\n    return intersection / given\n\ndef are_independent(p_a, p_b, p_both):\n    return abs(p_both - p_a * p_b) < 1e-12',
        language="python", label="Your Python answer", min_height=180,
    )
    stats_exercise_01_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_01_description, stats_exercise_01_starter, stats_exercise_01_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_01_description, stats_exercise_01_starter, stats_exercise_01_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["conditional"](0.2, 0.5) - 0.4) < 1e-12
        assert _ns["are_independent"](0.5, 0.4, 0.2) is True
        assert _ns["are_independent"](0.5, 0.4, 0.1) is False
        return _ns

    problem(mo, stats_exercise_01_description, stats_exercise_01_starter, _submission, stats_exercise_01_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-bayes-base-rates
# title: Bayes' theorem and base rates
# kind: exposition
# difficulty: medium
# teaches: stats-bayes-base-rates
# assesses: stats-bayes-base-rates
# requires: stats-probability-conditional-independence
# ===

@app.cell
def _(mo):
    mo.md(r"""
    ## 2. Bayes' theorem and base rates

    **Motivation:** A seemingly accurate detector may produce mostly false alarms
    when the event it detects is rare.

    **Goal:** Update a prior probability using evidence and explain why prevalence
    matters to precision.

    For a binary test, posterior precision is
    $P(D|+)=P(+|D)P(D)/(P(+|D)P(D)+P(+|D^c)P(D^c))$. Sensitivity supplies the
    first likelihood; the false-positive rate is one minus specificity.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_02_description = mo.md("""
    ### Exercise

    Implement `positive_predictive_value(prevalence, sensitivity, specificity)`.
    """)
    stats_exercise_02_starter = mo.ui.code_editor(
        value='def positive_predictive_value(prevalence, sensitivity, specificity):\n    true_positive = sensitivity * prevalence\n    false_positive = (1 - specificity) * (1 - prevalence)\n    return true_positive / (true_positive + false_positive)',
        language="python", label="Your Python answer", min_height=170,
    )
    stats_exercise_02_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_02_description, stats_exercise_02_starter, stats_exercise_02_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_02_description, stats_exercise_02_starter, stats_exercise_02_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["positive_predictive_value"]
        assert abs(_fn(0.01, 0.99, 0.95) - (0.0099 / 0.0594)) < 1e-12
        assert abs(_fn(0.5, 1.0, 1.0) - 1.0) < 1e-12
        return _ns

    problem(mo, stats_exercise_02_description, stats_exercise_02_starter, _submission, stats_exercise_02_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-random-variables-distributions
# title: Random variables and distributions
# kind: exposition
# difficulty: medium
# teaches: stats-random-variables-distributions
# assesses: stats-random-variables-distributions
# requires: stats-bayes-base-rates
# ===

@app.cell
def _(mo):
    mo.md(r"""
    ## 3. Random variables and distributions

    **Motivation:** Choosing a distribution encodes the data-generating process
    and determines which summaries and likelihoods are appropriate.

    **Goal:** Match Bernoulli, binomial, Poisson, exponential, and normal models
    to common interview scenarios.

    Bernoulli models one binary trial; binomial counts successes in fixed
    independent trials; Poisson counts events in an interval; exponential models
    waiting time under a constant event rate; normal models symmetric continuous
    variation and often approximates aggregate noise.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_03_description = mo.md("""
    ### Exercise

    Implement `distribution_for(scenario)` for `"binary"`, `"fixed_trials"`,
    `"event_count"`, `"waiting_time"`, and `"symmetric_measurement"`.
    """)
    stats_exercise_03_starter = mo.ui.code_editor(
        value='def distribution_for(scenario):\n    choices = {\n        "binary": "bernoulli",\n        "fixed_trials": "binomial",\n        "event_count": "poisson",\n        "waiting_time": "exponential",\n        "symmetric_measurement": "normal",\n    }\n    return choices[scenario]',
        language="python", label="Your Python answer", min_height=210,
    )
    stats_exercise_03_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_03_description, stats_exercise_03_starter, stats_exercise_03_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_03_description, stats_exercise_03_starter, stats_exercise_03_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["distribution_for"]
        _expected = {"binary": "bernoulli", "fixed_trials": "binomial", "event_count": "poisson", "waiting_time": "exponential", "symmetric_measurement": "normal"}
        assert all(_fn(_key) == _value for _key, _value in _expected.items())
        return _ns

    problem(mo, stats_exercise_03_description, stats_exercise_03_starter, _submission, stats_exercise_03_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-expectation-variance-covariance
# title: Expectation, variance, and covariance
# kind: exposition
# difficulty: medium
# teaches: stats-expectation-variance-covariance
# assesses: stats-expectation-variance-covariance
# requires: stats-random-variables-distributions
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 4. Expectation, variance, and covariance

    **Motivation:** These quantities summarize center, uncertainty, and linear
    co-movement and underpin estimation and modeling.

    **Goal:** Compute population mean, variance, covariance, and distinguish
    covariance from correlation.

    Expectation is linear even for dependent variables. Variance is expected
    squared deviation. Covariance has units; correlation standardizes covariance
    to $[-1,1]$. Neither correlation nor zero covariance generally proves
    independence or causation.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_04_description = mo.md("""
    ### Exercise

    Implement population `mean(values)` and `variance(values)`.
    """)
    stats_exercise_04_starter = mo.ui.code_editor(
        value='def mean(values):\n    return sum(values) / len(values)\n\ndef variance(values):\n    center = mean(values)\n    return sum((value - center) ** 2 for value in values) / len(values)',
        language="python", label="Your Python answer", min_height=190,
    )
    stats_exercise_04_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_04_description, stats_exercise_04_starter, stats_exercise_04_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_04_description, stats_exercise_04_starter, stats_exercise_04_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert abs(_ns["mean"]([1, 2, 3, 4]) - 2.5) < 1e-12
        assert abs(_ns["variance"]([1, 2, 3, 4]) - 1.25) < 1e-12
        assert abs(_ns["variance"]([7, 7, 7])) < 1e-12
        return _ns

    problem(mo, stats_exercise_04_description, stats_exercise_04_starter, _submission, stats_exercise_04_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-sampling-clt
# title: Sampling distributions and the central limit theorem
# kind: exposition
# difficulty: medium
# teaches: stats-sampling-clt
# assesses: stats-sampling-clt
# requires: stats-expectation-variance-covariance
# ===

@app.cell
def _(mo):
    mo.md(r"""
    ## 5. Sampling distributions and the central limit theorem

    **Motivation:** Statistical uncertainty concerns how an estimator changes
    across repeated samples, not merely how individual observations vary.

    **Goal:** Explain sampling distributions, standard error, and when the CLT
    justifies a normal approximation for a sample mean.

    For iid observations with finite variance, the sample mean has standard error
    $\\sigma/\\sqrt{n}$ and becomes approximately normal as sample size grows.
    Dependence, heavy tails, and selection bias can invalidate naive conclusions.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_05_description = mo.md("""
    ### Exercise

    Implement `standard_error(std_dev, sample_size)`.
    """)
    stats_exercise_05_starter = mo.ui.code_editor(
        value='import math\n\ndef standard_error(std_dev, sample_size):\n    return std_dev / math.sqrt(sample_size)',
        language="python", label="Your Python answer", min_height=150,
    )
    stats_exercise_05_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_05_description, stats_exercise_05_starter, stats_exercise_05_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_05_description, stats_exercise_05_starter, stats_exercise_05_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _fn = _ns["standard_error"]
        assert abs(_fn(10, 100) - 1) < 1e-12
        assert abs(_fn(10, 400) - 0.5) < 1e-12
        return _ns

    problem(mo, stats_exercise_05_description, stats_exercise_05_starter, _submission, stats_exercise_05_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-estimation-confidence-intervals
# title: Estimation and confidence intervals
# kind: exposition
# difficulty: medium
# teaches: stats-estimation-confidence-intervals
# assesses: stats-estimation-confidence-intervals
# requires: stats-sampling-clt
# ===

@app.cell
def _(mo):
    mo.md(r"""
    ## 6. Estimation and confidence intervals

    **Motivation:** A point estimate without uncertainty can make small, noisy
    differences look decisive.

    **Goal:** Distinguish estimators from estimates and correctly interpret a
    frequentist confidence interval.

    A 95% confidence procedure covers the fixed true parameter in 95% of repeated
    samples under its assumptions. It does not assign a 95% probability to the
    parameter after this one interval is observed. Approximate mean intervals use
    estimate $\\pm$ critical value $\\times$ standard error.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_06_description = mo.md("""
    ### Exercise

    Implement `confidence_interval(estimate, standard_error, critical=1.96)`.
    """)
    stats_exercise_06_starter = mo.ui.code_editor(
        value='def confidence_interval(estimate, standard_error, critical=1.96):\n    margin = critical * standard_error\n    return estimate - margin, estimate + margin',
        language="python", label="Your Python answer", min_height=160,
    )
    stats_exercise_06_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_06_description, stats_exercise_06_starter, stats_exercise_06_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_06_description, stats_exercise_06_starter, stats_exercise_06_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _low, _high = _ns["confidence_interval"](10, 2)
        assert abs(_low - 6.08) < 1e-12 and abs(_high - 13.92) < 1e-12
        assert _ns["confidence_interval"](5, 1, 2) == (3, 7)
        return _ns

    problem(mo, stats_exercise_06_description, stats_exercise_06_starter, _submission, stats_exercise_06_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-hypothesis-testing-power
# title: Hypothesis tests, errors, and power
# kind: exposition
# difficulty: hard
# teaches: stats-hypothesis-testing-power
# assesses: stats-hypothesis-testing-power
# requires: stats-estimation-confidence-intervals
# ===

@app.cell
def _(mo):
    mo.md(r"""
    ## 7. Hypothesis tests, errors, and power

    **Motivation:** Interviews often probe whether you can separate statistical
    evidence from practical importance and avoid common p-value mistakes.

    **Goal:** Interpret p-values, Type I and Type II errors, power, and multiple
    testing tradeoffs.

    A p-value is the probability, assuming the null and model are true, of a test
    statistic at least as extreme as observed. Alpha controls the Type I error
    rate; beta is the Type II error rate; power is $1-\\beta$. Larger samples,
    larger effects, lower noise, or a larger alpha usually increase power.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_07_description = mo.md("""
    ### Exercise

    Implement `decision(p_value, alpha=0.05)` returning `"reject"` or
    `"fail_to_reject"`, and `bonferroni_alpha(alpha, tests)`.
    """)
    stats_exercise_07_starter = mo.ui.code_editor(
        value='def decision(p_value, alpha=0.05):\n    return "reject" if p_value < alpha else "fail_to_reject"\n\ndef bonferroni_alpha(alpha, tests):\n    return alpha / tests',
        language="python", label="Your Python answer", min_height=180,
    )
    stats_exercise_07_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_07_description, stats_exercise_07_starter, stats_exercise_07_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_07_description, stats_exercise_07_starter, stats_exercise_07_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        assert _ns["decision"](0.01) == "reject"
        assert _ns["decision"](0.05) == "fail_to_reject"
        assert abs(_ns["bonferroni_alpha"](0.05, 10) - 0.005) < 1e-12
        return _ns

    problem(mo, stats_exercise_07_description, stats_exercise_07_starter, _submission, stats_exercise_07_submit)
    return

# === MLPHD UNIT END ===


# === MLPHD UNIT START ===
# id: stats-experimentation-ab-tests
# title: Experimentation and A/B tests
# kind: exposition
# difficulty: hard
# teaches: stats-experimentation-ab-tests
# assesses: stats-experimentation-ab-tests
# requires: stats-hypothesis-testing-power
# ===

@app.cell
def _(mo):
    mo.md("""
    ## 8. Experimentation and A/B tests

    **Motivation:** Product data scientists must connect causal identification,
    experimental design, and business decisions—not merely calculate p-values.

    **Goal:** Explain randomization, units of assignment and analysis, guardrails,
    sample-ratio mismatch, practical significance, and common experiment threats.

    Randomization balances confounders in expectation. Analyze at a level that
    respects assignment and dependence. Define one primary metric and guardrails
    before launch, check instrumentation and sample-ratio mismatch, and report
    effect sizes with uncertainty. Peeking or testing many metrics needs correction.
    """)
    return


@app.cell
def _(mo):
    stats_exercise_08_description = mo.md("""
    ### Exercise

    Implement `absolute_and_relative_lift(control, treatment)` returning both
    lifts, and raise `ValueError` when the control rate is zero.
    """)
    stats_exercise_08_starter = mo.ui.code_editor(
        value='def absolute_and_relative_lift(control, treatment):\n    if control == 0:\n        raise ValueError("relative lift is undefined")\n    absolute = treatment - control\n    return absolute, absolute / control',
        language="python", label="Your Python answer", min_height=170,
    )
    stats_exercise_08_submit = mo.ui.run_button(label="Submit answer")
    return stats_exercise_08_description, stats_exercise_08_starter, stats_exercise_08_submit


@app.cell
def _(assertion, execute_submission, mo, problem, stats_exercise_08_description, stats_exercise_08_starter, stats_exercise_08_submit):
    @assertion(lambda _ns: None)
    def _submission(source):
        _ns = execute_submission(source)
        _absolute, _relative = _ns["absolute_and_relative_lift"](0.10, 0.12)
        assert abs(_absolute - 0.02) < 1e-12 and abs(_relative - 0.20) < 1e-12
        try:
            _ns["absolute_and_relative_lift"](0, 0.1)
        except ValueError:
            pass
        else:
            raise AssertionError("zero control must raise ValueError")
        return _ns

    problem(mo, stats_exercise_08_description, stats_exercise_08_starter, _submission, stats_exercise_08_submit)
    return

# === MLPHD UNIT END ===


if __name__ == "__main__":
    app.run()
