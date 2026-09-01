"""Build the screenshot-derived Python algorithm interview problem bank."""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .common import rebuild_database

DATABASE_PATH = Path(__file__).resolve().parents[1] / "python_algorithm_problem_bank.sqlite"


@dataclass(frozen=True)
class Question:
    company: str
    title: str
    difficulty: str
    question: str
    starter: str
    answer: str
    tests: tuple[dict[str, Any], ...]
    source_images: tuple[str, ...]
    notes: str = ""


def _case(
    label: str,
    expression: str,
    expected: Any,
    *,
    setup: str = "",
    comparison: str = "equal",
    tolerance: float | None = None,
) -> dict[str, Any]:
    return {
        "label": label,
        "setup": setup,
        "expression": expression,
        "expected": expected,
        "comparison": comparison,
        "tolerance": tolerance,
    }


QUESTIONS: tuple[Question, ...] = (
    Question(
        "Amazon",
        "Array intersection",
        "easy",
        "Given two arrays, return their distinct intersection.",
        "def intersection(a, b):\n    # Return a list of shared distinct values.\n    pass",
        """def intersection(a, b):
    return sorted(set(a) & set(b))""",
        (
            _case("example", "intersection([1, 2, 3, 4, 5], [0, 1, 3, 7])", [1, 3]),
            _case("duplicates", "intersection([2, 2, 1], [2, 2, 3])", [2]),
            _case("disjoint", "intersection([], [1, 2])", []),
        ),
        ("A01", "A04", "A05"),
        "Canonical output is sorted to make the otherwise unordered set result deterministic.",
    ),
    Question(
        "D. E. Shaw",
        "Maximum product of three",
        "easy",
        "Return the maximum product obtainable from any three integers in the array.",
        "def max_product_of_three(values):\n    pass",
        """def max_product_of_three(values):
    if len(values) < 3:
        raise ValueError("at least three values are required")
    ordered = sorted(values)
    return max(ordered[-1] * ordered[-2] * ordered[-3], ordered[0] * ordered[1] * ordered[-1])""",
        (
            _case("positive", "max_product_of_three([1, 3, 4, 5])", 60),
            _case("negative pair", "max_product_of_three([-2, -4, 5, 3])", 40),
            _case("all negative", "max_product_of_three([-5, -4, -3, -2])", -24),
        ),
        ("A01", "A05"),
    ),
    Question(
        "Facebook",
        "K closest points to the origin",
        "easy",
        "Return the k points with smallest Euclidean distance to the origin.",
        "def k_closest(points, k):\n    pass",
        """import heapq

def k_closest(points, k):
    if k < 0 or k > len(points):
        raise ValueError("k must be between 0 and len(points)")
    if k == 0:
        return []
    heap = []
    for point in points:
        x, y = point
        item = (-(x * x + y * y), -x, -y, (x, y))
        if len(heap) < k:
            heapq.heappush(heap, item)
        elif item > heap[0]:
            heapq.heapreplace(heap, item)
    return sorted((item[3] for item in heap), key=lambda point: (point[0] ** 2 + point[1] ** 2, point))""",
        (
            _case(
                "example",
                "k_closest([(2, -1), (3, 2), (4, 1), (-1, -1), (-2, 2)], 3)",
                [[-1, -1], [2, -1], [-2, 2]],
            ),
            _case("none", "k_closest([(1, 1)], 0)", []),
            _case("ties", "k_closest([(1, 0), (0, 1), (2, 0)], 2)", [[0, 1], [1, 0]]),
        ),
        ("A01", "A05", "A06"),
        "Uses a bounded heap so the implementation actually has O(n log k) time and O(k) space.",
    ),
    Question(
        "Google",
        "K-th smallest in a sorted matrix",
        "easy",
        "In a square matrix sorted ascending by rows and columns, return the k-th smallest value.",
        "def kth_smallest(matrix, k):\n    pass",
        """import heapq

def kth_smallest(matrix, k):
    if not matrix or not matrix[0] or k < 1 or k > sum(len(row) for row in matrix):
        raise ValueError("k is outside the matrix")
    heap = [(row[0], row_index, 0) for row_index, row in enumerate(matrix) if row]
    heapq.heapify(heap)
    value = None
    for _ in range(k):
        value, row_index, column_index = heapq.heappop(heap)
        next_column = column_index + 1
        if next_column < len(matrix[row_index]):
            heapq.heappush(heap, (matrix[row_index][next_column], row_index, next_column))
    return value""",
        (
            _case("example", "kth_smallest([[1, 4, 7], [3, 5, 9], [6, 8, 11]], 4)", 5),
            _case("first", "kth_smallest([[1, 2], [1, 3]], 1)", 1),
            _case("duplicates", "kth_smallest([[1, 2], [2, 3]], 3)", 2),
        ),
        ("A01", "A06"),
    ),
    Question(
        "Akuna Capital",
        "Maximum contiguous subarray sum",
        "easy",
        "Return the largest contiguous-subarray sum; return 0 when every value is negative.",
        "def max_subarray_sum(values):\n    pass",
        """def max_subarray_sum(values):
    best = 0
    current = 0
    for value in values:
        current = max(0, current + value)
        best = max(best, current)
    return best""",
        (
            _case("example", "max_subarray_sum([-1, -3, 5, -4, 3, -6, 9, 2])", 11),
            _case("all negative", "max_subarray_sum([-8, -2, -5])", 0),
            _case("empty", "max_subarray_sum([])", 0),
        ),
        ("A01", "A06", "A07"),
        "Corrects the printed implementation so the explicit all-negative requirement is met.",
    ),
    Question(
        "Facebook",
        "Symmetric binary tree",
        "easy",
        "Define TreeNode and return whether a binary tree is a mirror image of itself.",
        "class TreeNode:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\n\ndef is_symmetric(root):\n    pass",
        """class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def is_symmetric(root):
    def mirror(left, right):
        if left is None or right is None:
            return left is right
        return left.value == right.value and mirror(left.left, right.right) and mirror(left.right, right.left)
    return root is None or mirror(root.left, root.right)""",
        (
            _case("empty", "is_symmetric(None)", True),
            _case(
                "symmetric",
                "is_symmetric(root)",
                True,
                setup="root=TreeNode(1); root.left=TreeNode(2); root.right=TreeNode(2); root.left.left=TreeNode(3); root.right.right=TreeNode(3)",
            ),
            _case(
                "asymmetric",
                "is_symmetric(root)",
                False,
                setup="root=TreeNode(1); root.left=TreeNode(2); root.right=TreeNode(2); root.left.right=TreeNode(3); root.right.right=TreeNode(3)",
            ),
        ),
        ("A01", "A07", "A08"),
    ),
    Question(
        "Google",
        "Find a peak element",
        "medium",
        "Return the index of any element greater than both existing neighbors.",
        "def find_peak(values):\n    pass",
        """def find_peak(values):
    if not values:
        raise ValueError("values must not be empty")
    low, high = 0, len(values) - 1
    while low < high:
        middle = (low + high) // 2
        if values[middle] < values[middle + 1]:
            low = middle + 1
        else:
            high = middle
    return low""",
        (
            _case("example", "(lambda i: 0 <= i < 5 and (i == 0 or [3,5,2,4,1][i] > [3,5,2,4,1][i-1]) and (i == 4 or [3,5,2,4,1][i] > [3,5,2,4,1][i+1]))(find_peak([3,5,2,4,1]))", True),
            _case("ascending", "find_peak([1, 2, 3, 4])", 3),
            _case("single", "find_peak([9])", 0),
        ),
        ("A01", "A08"),
        "Treats absent boundary neighbors as negative infinity.",
    ),
    Question(
        "AQR",
        "Pearson correlation",
        "medium",
        "Return the Pearson correlation coefficient of equal-length numeric sequences X and Y.",
        "def correlation(x, y):\n    pass",
        """import math

def correlation(x, y):
    if len(x) != len(y) or not x:
        raise ValueError("x and y must be non-empty and equal length")
    mean_x = sum(x) / len(x)
    mean_y = sum(y) / len(y)
    centered_x = [value - mean_x for value in x]
    centered_y = [value - mean_y for value in y]
    denominator = math.sqrt(sum(value * value for value in centered_x) * sum(value * value for value in centered_y))
    if denominator == 0:
        raise ValueError("correlation is undefined for zero variance")
    return sum(a * b for a, b in zip(centered_x, centered_y)) / denominator""",
        (
            _case("perfect positive", "correlation([1, 2, 3], [2, 4, 6])", 1.0, comparison="approx", tolerance=1e-9),
            _case("perfect negative", "correlation([1, 2, 3], [6, 4, 2])", -1.0, comparison="approx", tolerance=1e-9),
            _case("known value", "correlation([1, 2, 4], [1, 3, 2])", 0.32732683535398854, comparison="approx", tolerance=1e-9),
        ),
        ("A01", "A08", "A09"),
        "Adds input and zero-variance validation.",
    ),
    Question(
        "Amazon",
        "Binary-tree diameter",
        "medium",
        "Define TreeNode and return the longest path between two nodes, measured in edges.",
        "class TreeNode:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\n\ndef tree_diameter(root):\n    pass",
        """class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def tree_diameter(root):
    diameter = 0
    def depth(node):
        nonlocal diameter
        if node is None:
            return 0
        left = depth(node.left)
        right = depth(node.right)
        diameter = max(diameter, left + right)
        return 1 + max(left, right)
    depth(root)
    return diameter""",
        (
            _case("empty", "tree_diameter(None)", 0),
            _case("single", "tree_diameter(TreeNode(1))", 0),
            _case("branched", "tree_diameter(root)", 5, setup="root=TreeNode(1); root.left=TreeNode(2); root.right=TreeNode(3); root.left.left=TreeNode(4); root.left.left.left=TreeNode(5); root.right.right=TreeNode(6)"),
        ),
        ("A01", "A09", "A10"),
        "The canonical answer defines diameter as an edge count.",
    ),
    Question(
        "D. E. Shaw",
        "Constrained random integer sample",
        "medium",
        "Generate n integers that sum to target, each within sigma times the absolute mean of the mean. Accept an optional seed.",
        "def constrained_sample(target, n, sigma, seed=0):\n    pass",
        """import math
import random

def constrained_sample(target, n, sigma, seed=0):
    if n <= 0 or sigma < 0:
        raise ValueError("n must be positive and sigma non-negative")
    mean = target / n
    radius = sigma * abs(mean)
    lower = math.ceil(mean - radius)
    upper = math.floor(mean + radius)
    if n * lower > target or n * upper < target:
        raise ValueError("no feasible integer sample")
    values = [lower] * n
    remaining = target - n * lower
    rng = random.Random(seed)
    available = list(range(n))
    while remaining:
        index = rng.choice(available)
        values[index] += 1
        remaining -= 1
        if values[index] == upper:
            available.remove(index)
    return values""",
        (
            _case("constraints", "(lambda values: (len(values), sum(values), all(5 <= value <= 15 for value in values)))(constrained_sample(100, 10, 0.5, seed=7))", [10, 100, True]),
            _case("exact mean", "constrained_sample(12, 4, 0, seed=2)", [3, 3, 3, 3]),
            _case("deterministic", "constrained_sample(17, 5, 0.5, seed=11) == constrained_sample(17, 5, 0.5, seed=11)", True),
        ),
        ("A01", "A10", "A11"),
        "Adds explicit feasibility validation and a seed so automated grading is deterministic.",
    ),
    Question(
        "Facebook",
        "Shortest friendship path",
        "medium",
        "Given an adjacency-list social graph and two users, return the minimum number of friendship edges between them; return -1 when disconnected.",
        "def friendship_distance(graph, start, end):\n    pass",
        """from collections import deque

def friendship_distance(graph, start, end):
    if start == end:
        return 0
    queue = deque([(start, 0)])
    visited = {start}
    while queue:
        user, distance = queue.popleft()
        for friend in graph.get(user, []):
            if friend == end:
                return distance + 1
            if friend not in visited:
                visited.add(friend)
                queue.append((friend, distance + 1))
    return -1""",
        (
            _case("example", "friendship_distance({'A':['B','C'],'B':['A','D'],'C':['A'],'D':['B','E'],'E':['D']}, 'A', 'E')", 3),
            _case("same user", "friendship_distance({'A': []}, 'A', 'A')", 0),
            _case("disconnected", "friendship_distance({'A':['B'],'B':['A'],'C':[]}, 'A', 'C')", -1),
        ),
        ("A01", "A11"),
    ),
    Question(
        "LinkedIn",
        "Anagram start indices",
        "medium",
        "Return every start index where a substring of A is an anagram of B.",
        "def anagram_indices(text, pattern):\n    pass",
        """from collections import Counter

def anagram_indices(text, pattern):
    width = len(pattern)
    if width == 0 or width > len(text):
        return []
    target = Counter(pattern)
    window = Counter(text[:width])
    result = []
    for start in range(len(text) - width + 1):
        if window == target:
            result.append(start)
        if start + width < len(text):
            outgoing = text[start]
            window[outgoing] -= 1
            if window[outgoing] == 0:
                del window[outgoing]
            window[text[start + width]] += 1
    return result""",
        (
            _case("example", "anagram_indices('abcdcbac', 'abc')", [0, 4, 5]),
            _case("overlapping", "anagram_indices('abab', 'ab')", [0, 1, 2]),
            _case("too long", "anagram_indices('a', 'ab')", []),
        ),
        ("A01", "A02", "A11", "A12"),
    ),
    Question(
        "Yelp",
        "Minimum interval removals",
        "medium",
        "Return the minimum number of intervals to remove so the remaining intervals do not overlap. Touching endpoints are allowed.",
        "def min_interval_removals(intervals):\n    pass",
        """def min_interval_removals(intervals):
    removals = 0
    previous_end = float("-inf")
    for start, end in sorted(intervals, key=lambda interval: (interval[1], interval[0])):
        if start < previous_end:
            removals += 1
        else:
            previous_end = end
    return removals""",
        (
            _case("example", "min_interval_removals([(1,3),(3,5),(2,4),(6,8)])", 1),
            _case("all overlap", "min_interval_removals([(1,5),(2,6),(3,7)])", 2),
            _case("touching", "min_interval_removals([(1,2),(2,3),(3,4)])", 0),
        ),
        ("A02", "A12", "A13"),
    ),
    Question(
        "Goldman Sachs",
        "Group anagrams",
        "medium",
        "Group strings that are anagrams of one another.",
        "def group_anagrams(words):\n    pass",
        """from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        groups[tuple(sorted(word))].append(word)
    return [sorted(group) for group in groups.values()]""",
        (
            _case("example", "group_anagrams(['abc','abd','cab','bad','bca','acd'])", [["abc","bca","cab"],["abd","bad"],["acd"]], comparison="nested_unordered"),
            _case("empty strings", "group_anagrams(['', '', 'a'])", [["", ""], ["a"]], comparison="nested_unordered"),
            _case("none", "group_anagrams([])", [], comparison="nested_unordered"),
        ),
        ("A02", "A13", "A14"),
    ),
    Question(
        "Two Sigma",
        "Count friend groups",
        "medium",
        "Given an n-by-n friendship adjacency matrix, return the number of directly or indirectly connected friend groups.",
        "def friend_group_count(matrix):\n    pass",
        """def friend_group_count(matrix):
    visited = set()
    def visit(person):
        visited.add(person)
        for friend, connected in enumerate(matrix[person]):
            if connected and friend not in visited:
                visit(friend)
    groups = 0
    for person in range(len(matrix)):
        if person not in visited:
            groups += 1
            visit(person)
    return groups""",
        (
            _case("two groups", "friend_group_count([[1,1,0],[1,1,0],[0,0,1]])", 2),
            _case("one group", "friend_group_count([[1,1,0],[1,1,1],[0,1,1]])", 1),
            _case("empty", "friend_group_count([])", 0),
        ),
        ("A02", "A14", "A15"),
    ),
    Question(
        "Workday",
        "Remove K-th node from the end",
        "medium",
        "Define Node and remove the k-th node from the end of a singly linked list, returning the head.",
        "class Node:\n    def __init__(self, value, next_node=None):\n        self.value = value\n        self.next = next_node\n\ndef remove_kth_from_end(head, k):\n    pass",
        """class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

def remove_kth_from_end(head, k):
    if k <= 0:
        raise ValueError("k must be positive")
    dummy = Node(None, head)
    fast = dummy
    for _ in range(k):
        fast = fast.next
        if fast is None:
            raise ValueError("k exceeds list length")
    slow = dummy
    while fast.next is not None:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next""",
        (
            _case("example", "values(remove_kth_from_end(head, 3))", [3,2,1,4], setup="head=Node(3,Node(2,Node(5,Node(1,Node(4))))); values=lambda node: [] if node is None else [node.value]+values(node.next)"),
            _case("remove head", "values(remove_kth_from_end(head, 3))", [2,3], setup="head=Node(1,Node(2,Node(3))); values=lambda node: [] if node is None else [node.value]+values(node.next)"),
            _case("remove tail", "values(remove_kth_from_end(head, 1))", [1,2], setup="head=Node(1,Node(2,Node(3))); values=lambda node: [] if node is None else [node.value]+values(node.next)"),
        ),
        ("A02", "A15", "A16"),
        "Uses a one-pass two-pointer implementation instead of the source's O(n)-space node dictionary.",
    ),
    Question(
        "Goldman Sachs",
        "Estimate pi with Monte Carlo",
        "medium",
        "Estimate pi by sampling points uniformly inside a unit square. Accept an optional seed.",
        "def estimate_pi(samples, seed=0):\n    pass",
        """import random

def estimate_pi(samples, seed=0):
    if samples <= 0:
        raise ValueError("samples must be positive")
    rng = random.Random(seed)
    inside = sum(rng.random() ** 2 + rng.random() ** 2 <= 1 for _ in range(samples))
    return 4 * inside / samples""",
        (
            _case("approximation", "estimate_pi(20000, seed=7)", math.pi, comparison="approx", tolerance=0.04),
            _case("bounded", "0 <= estimate_pi(100, seed=2) <= 4", True),
            _case("deterministic", "estimate_pi(1000, seed=9) == estimate_pi(1000, seed=9)", True),
        ),
        ("A02", "A16"),
        "Adds sample-count and seed parameters for a reusable, deterministic interface.",
    ),
    Question(
        "Palantir",
        "Remove invalid parentheses",
        "medium",
        "Remove the minimum number of parentheses needed to make the string valid while preserving all other characters.",
        "def remove_invalid_parentheses(text):\n    pass",
        """def remove_invalid_parentheses(text):
    characters = list(text)
    opens = []
    remove = set()
    for index, character in enumerate(characters):
        if character == "(":
            opens.append(index)
        elif character == ")":
            if opens:
                opens.pop()
            else:
                remove.add(index)
    remove.update(opens)
    return "".join(character for index, character in enumerate(characters) if index not in remove)""",
        (
            _case("source example", "remove_invalid_parentheses(')a(b((cd)e(f)g)')", "ab((cd)e(f)g)"),
            _case("extra opens", "remove_invalid_parentheses('a((b)')", "a(b)"),
            _case("already valid", "remove_invalid_parentheses('(a)(b)')", "(a)(b)"),
        ),
        ("A02", "A16", "A17"),
    ),
    Question(
        "Citadel",
        "Generate integer permutations",
        "medium",
        "Return every permutation of a list of distinct integers.",
        "def permutations(values):\n    pass",
        """def permutations(values):
    if not values:
        return [[]]
    result = []
    for index, value in enumerate(values):
        for suffix in permutations(values[:index] + values[index + 1:]):
            result.append([value, *suffix])
    return result""",
        (
            _case("three values", "permutations([2,3,4])", [[2,3,4],[2,4,3],[3,2,4],[3,4,2],[4,2,3],[4,3,2]], comparison="unordered"),
            _case("one value", "permutations([7])", [[7]], comparison="unordered"),
            _case("empty", "permutations([])", [[]], comparison="unordered"),
        ),
        ("A02", "A17"),
    ),
    Question(
        "Two Sigma",
        "Weighted category sampling",
        "medium",
        "Implement a reusable WeightedSampler that samples categories in proportion to positive relative weights. sample() accepts an optional random-number generator.",
        "class WeightedSampler:\n    def __init__(self, categories, weights):\n        pass\n\n    def sample(self, rng=None):\n        pass",
        """import bisect
import itertools
import random

class WeightedSampler:
    def __init__(self, categories, weights):
        if len(categories) != len(weights) or not categories or any(weight <= 0 for weight in weights):
            raise ValueError("categories and positive weights must have matching non-zero lengths")
        self.categories = list(categories)
        self.cumulative = list(itertools.accumulate(weights))

    def sample(self, rng=None):
        generator = rng or random
        draw = generator.random() * self.cumulative[-1]
        return self.categories[bisect.bisect_right(self.cumulative, draw)]""",
        (
            _case("valid categories", "(lambda draws: len(draws) == 100 and set(draws) <= {'A','B','C','D'})([sampler.sample(rng) for _ in range(100)])", True, setup="sampler=WeightedSampler(['A','B','C','D'],[5,10,15,20]); rng=__import__('random').Random(7)"),
            _case("deterministic RNG", "[sampler.sample(__import__('random').Random(seed)) for seed in range(8)]", ["D","B","D","B","B","D","D","C"], setup="sampler=WeightedSampler(['A','B','C','D'],[5,10,15,20])"),
            _case("weight ordering", "(lambda draws: draws.count('D') > draws.count('C') > draws.count('B') > draws.count('A'))([sampler.sample(rng) for _ in range(6000)])", True, setup="sampler=WeightedSampler(['A','B','C','D'],[5,10,15,20]); rng=__import__('random').Random(17)"),
        ),
        ("A02", "A17", "A18", "A19"),
        "Defines a reusable API and seeded tests for the source's cumulative-weight/binary-search method.",
    ),
    Question(
        "Amazon",
        "Longest common subarray",
        "medium",
        "Return the maximum length of a contiguous subarray appearing in both integer arrays.",
        "def longest_common_subarray(a, b):\n    pass",
        """def longest_common_subarray(a, b):
    previous = [0] * (len(b) + 1)
    best = 0
    for left in a:
        current = [0] * (len(b) + 1)
        for column, right in enumerate(b, 1):
            if left == right:
                current[column] = previous[column - 1] + 1
                best = max(best, current[column])
        previous = current
    return best""",
        (
            _case("example", "longest_common_subarray([1,3,5,6,7],[2,4,3,5,6])", 3),
            _case("duplicates", "longest_common_subarray([1,1,1],[1,1])", 2),
            _case("disjoint", "longest_common_subarray([1,2],[3,4])", 0),
        ),
        ("A02", "A19"),
        "Uses a one-row dynamic-programming table while preserving O(mn) time.",
    ),
    Question(
        "Uber",
        "Maximum-sum increasing subsequence",
        "medium",
        "Return the largest sum among strictly increasing subsequences.",
        "def max_increasing_subsequence_sum(values):\n    pass",
        """def max_increasing_subsequence_sum(values):
    if not values:
        return 0
    best_ending = list(values)
    for index, value in enumerate(values):
        for previous in range(index):
            if values[previous] < value:
                best_ending[index] = max(best_ending[index], best_ending[previous] + value)
    return max(best_ending)""",
        (
            _case("example", "max_increasing_subsequence_sum([3,2,5,7,6])", 15),
            _case("decreasing", "max_increasing_subsequence_sum([5,4,3,2,1])", 5),
            _case("mixed", "max_increasing_subsequence_sum([1,101,2,3,100,4,5])", 106),
        ),
        ("A02", "A19", "A20"),
    ),
    Question(
        "Palantir",
        "Minimum perfect-square count",
        "medium",
        "For a non-negative integer n, return the smallest number of perfect squares that sum to n.",
        "def min_square_count(n):\n    pass",
        """def min_square_count(n):
    if n < 0:
        raise ValueError("n must be non-negative")
    counts = list(range(n + 1))
    for value in range(1, n + 1):
        square = 1
        while square * square <= value:
            counts[value] = min(counts[value], counts[value - square * square] + 1)
            square += 1
    return counts[n]""",
        (
            _case("seven", "min_square_count(7)", 4),
            _case("thirteen", "min_square_count(13)", 2),
            _case("zero", "min_square_count(0)", 0),
        ),
        ("A02", "A20", "A21"),
    ),
    Question(
        "Facebook",
        "Combinations from 1 through n",
        "medium",
        "Return every combination of k distinct numbers chosen from 1 through n.",
        "def combinations(n, k):\n    pass",
        """def combinations(n, k):
    if k < 0 or k > n:
        return []
    result = []
    def backtrack(start, current):
        if len(current) == k:
            result.append(current.copy())
            return
        remaining = k - len(current)
        for value in range(start, n - remaining + 2):
            current.append(value)
            backtrack(value + 1, current)
            current.pop()
    backtrack(1, [])
    return result""",
        (
            _case("example", "combinations(3,2)", [[1,2],[1,3],[2,3]], comparison="unordered"),
            _case("choose none", "combinations(4,0)", [[]], comparison="unordered"),
            _case("impossible", "combinations(2,3)", [], comparison="unordered"),
        ),
        ("A03", "A21"),
    ),
    Question(
        "Citadel",
        "Longest valid-parentheses substring",
        "hard",
        "Return the length of the longest contiguous well-formed parentheses substring.",
        "def longest_valid_parentheses(text):\n    pass",
        """def longest_valid_parentheses(text):
    stack = [-1]
    best = 0
    for index, character in enumerate(text):
        if character == "(":
            stack.append(index)
        else:
            stack.pop()
            if stack:
                best = max(best, index - stack[-1])
            else:
                stack.append(index)
    return best""",
        (
            _case("example", "longest_valid_parentheses(')(())')", 4),
            _case("prefix", "longest_valid_parentheses('(()')", 2),
            _case("multiple", "longest_valid_parentheses(')()())')", 4),
        ),
        ("A03", "A21", "A22"),
    ),
    Question(
        "Bloomberg",
        "Longest increasing matrix path",
        "hard",
        "Return the length of the longest orthogonally adjacent strictly increasing path in a matrix.",
        "def longest_increasing_path(matrix):\n    pass",
        """from functools import lru_cache

def longest_increasing_path(matrix):
    if not matrix or not matrix[0]:
        return 0
    rows, columns = len(matrix), len(matrix[0])
    @lru_cache(None)
    def visit(row, column):
        best = 1
        for row_delta, column_delta in ((1,0),(-1,0),(0,1),(0,-1)):
            next_row, next_column = row + row_delta, column + column_delta
            if 0 <= next_row < rows and 0 <= next_column < columns and matrix[next_row][next_column] > matrix[row][column]:
                best = max(best, 1 + visit(next_row, next_column))
        return best
    return max(visit(row, column) for row in range(rows) for column in range(columns))""",
        (
            _case("source matrix", "longest_increasing_path([[1,2,3],[4,5,6],[7,8,9]])", 5),
            _case("classic", "longest_increasing_path([[9,9,4],[6,6,8],[2,1,1]])", 4),
            _case("empty", "longest_increasing_path([])", 0),
        ),
        ("A03", "A22", "A23"),
    ),
    Question(
        "Google",
        "Consecutive positive-integer sums",
        "hard",
        "Return the number of sequences of one or more consecutive positive integers that sum to n.",
        "def consecutive_sum_count(n):\n    pass",
        """def consecutive_sum_count(n):
    if n <= 0:
        return 0
    count = 0
    length = 1
    while length * (length + 1) // 2 <= n:
        remainder = n - length * (length - 1) // 2
        if remainder % length == 0 and remainder // length > 0:
            count += 1
        length += 1
    return count""",
        (
            _case("nine", "consecutive_sum_count(9)", 3),
            _case("fifteen", "consecutive_sum_count(15)", 4),
            _case("power of two", "consecutive_sum_count(8)", 1),
        ),
        ("A03", "A23", "A24"),
        "Counts positive-start sequences only and uses the derived O(sqrt(n)) length bound.",
    ),
    Question(
        "Citadel",
        "Streaming median",
        "hard",
        "Implement MedianFinder with add_num(value) and find_median() for a continuous stream.",
        "class MedianFinder:\n    def __init__(self):\n        pass\n\n    def add_num(self, value):\n        pass\n\n    def find_median(self):\n        pass",
        """import heapq

class MedianFinder:
    def __init__(self):
        self.lower = []
        self.upper = []

    def add_num(self, value):
        heapq.heappush(self.lower, -value)
        heapq.heappush(self.upper, -heapq.heappop(self.lower))
        if len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def find_median(self):
        if not self.lower:
            raise ValueError("no values have been added")
        if len(self.lower) > len(self.upper):
            return float(-self.lower[0])
        return (-self.lower[0] + self.upper[0]) / 2""",
        (
            _case("odd stream", "(finder.add_num(1),finder.add_num(5),finder.add_num(3),finder.find_median())[-1]", 3.0, setup="finder=MedianFinder()", comparison="approx", tolerance=1e-9),
            _case("even stream", "(finder.add_num(1),finder.add_num(2),finder.find_median())[-1]", 1.5, setup="finder=MedianFinder()", comparison="approx", tolerance=1e-9),
            _case("incremental", "medians", [2.0,6.0,4.0,3.5], setup="finder=MedianFinder(); medians=[]\nfor value in [2,10,4,3]:\n    finder.add_num(value)\n    medians.append(finder.find_median())"),
        ),
        ("A03", "A24", "A25"),
    ),
    Question(
        "Two Sigma",
        "Wildcard matching",
        "hard",
        "Return whether the full lowercase input matches a wildcard pattern where ? matches one character and * matches zero or more characters.",
        "def wildcard_match(text, pattern):\n    pass",
        """def wildcard_match(text, pattern):
    previous = [True] + [False] * len(pattern)
    for column, token in enumerate(pattern, 1):
        previous[column] = previous[column - 1] and token == "*"
    for character in text:
        current = [False] * (len(pattern) + 1)
        for column, token in enumerate(pattern, 1):
            if token == "*":
                current[column] = current[column - 1] or previous[column]
            elif token == "?" or token == character:
                current[column] = previous[column - 1]
        previous = current
    return previous[-1]""",
        (
            _case("source true", "wildcard_match('abcdba','a*c?*')", True),
            _case("source false", "wildcard_match('abcdba','b*c?*')", False),
            _case("empty", "wildcard_match('', '*')", True),
            _case("single wildcard", "wildcard_match('abc', 'a?c')", True),
        ),
        ("A03", "A25", "A26", "A27"),
        "Uses the question's wildcard/glob semantics rather than regular-expression semantics.",
    ),
    Question(
        "Citadel",
        "Optimal fire-station location",
        "hard",
        "Return coordinates minimizing the sum of Euclidean distances to all house coordinates (the geometric median).",
        "def geometric_median(points, tolerance=1e-7):\n    pass",
        """import math

def geometric_median(points, tolerance=1e-7):
    if not points:
        raise ValueError("at least one point is required")
    if len(points) == 1:
        return tuple(map(float, points[0]))
    x = sum(point[0] for point in points) / len(points)
    y = sum(point[1] for point in points) / len(points)
    for _ in range(10000):
        distances = [math.hypot(x - px, y - py) for px, py in points]
        if any(distance <= tolerance for distance in distances):
            index = distances.index(min(distances))
            return tuple(map(float, points[index]))
        denominator = sum(1 / distance for distance in distances)
        next_x = sum(px / distance for (px, _), distance in zip(points, distances)) / denominator
        next_y = sum(py / distance for (_, py), distance in zip(points, distances)) / denominator
        if math.hypot(next_x - x, next_y - y) <= tolerance:
            return next_x, next_y
        x, y = next_x, next_y
    return x, y""",
        (
            _case("square", "geometric_median([(0,0),(2,0),(0,2),(2,2)])", [1.0,1.0], comparison="approx", tolerance=1e-5),
            _case("single", "geometric_median([(3,-2)])", [3.0,-2.0], comparison="approx", tolerance=1e-9),
            _case("collinear", "geometric_median([(0,0),(2,0),(10,0)])", [2.0,0.0], comparison="approx", tolerance=1e-4),
        ),
        ("A03", "A27", "A28", "A29"),
        "The objective is the geometric median (sum of Euclidean distances), despite source prose that briefly calls it a sum of squares.",
    ),
)


def _canonical(value: Any) -> Any:
    if isinstance(value, tuple):
        return [_canonical(item) for item in value]
    if isinstance(value, list):
        return [_canonical(item) for item in value]
    return value


def _approximately_equal(actual: Any, expected: Any, tolerance: float) -> bool:
    if isinstance(expected, list):
        return isinstance(actual, (list, tuple)) and len(actual) == len(expected) and all(
            _approximately_equal(left, right, tolerance)
            for left, right in zip(actual, expected)
        )
    return math.isclose(float(actual), float(expected), rel_tol=tolerance, abs_tol=tolerance)


def _matches(actual: Any, test: dict[str, Any]) -> bool:
    expected = test["expected"]
    comparison = test["comparison"]
    if comparison == "approx":
        return _approximately_equal(actual, expected, test["tolerance"] or 1e-8)
    if comparison == "unordered":
        return sorted(map(repr, _canonical(actual))) == sorted(map(repr, expected))
    if comparison == "nested_unordered":
        actual_groups = [sorted(map(repr, group)) for group in _canonical(actual)]
        expected_groups = [sorted(map(repr, group)) for group in expected]
        return sorted(map(repr, actual_groups)) == sorted(map(repr, expected_groups))
    return _canonical(actual) == expected


def validate_reference(question: Question) -> None:
    namespace: dict[str, Any] = {"__name__": "__reference__"}
    exec(  # noqa: S102 - executes repository-owned canonical reference code.
        compile(question.answer, f"<{question.title}>", "exec"), namespace, namespace
    )
    for test in question.tests:
        test_namespace = dict(namespace)
        if test["setup"]:
            exec(test["setup"], test_namespace, test_namespace)  # noqa: S102
        actual = eval(  # noqa: S307 - evaluates repository-owned test specifications.
            test["expression"], test_namespace, test_namespace
        )
        if not _matches(actual, test):
            raise AssertionError(
                f"{question.title} / {test['label']}: {actual!r} != {test['expected']!r}"
            )


def seed_python_algorithm_problem_bank(connection: Any) -> None:
    connection.executescript(
        """
        CREATE TABLE questions (
          question_id TEXT PRIMARY KEY,
          source_number TEXT NOT NULL UNIQUE,
          company TEXT NOT NULL,
          title TEXT NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
          question TEXT NOT NULL,
          starter TEXT NOT NULL,
          answer TEXT NOT NULL,
          answer_type TEXT NOT NULL CHECK (answer_type = 'python'),
          checker_spec TEXT NOT NULL,
          source_images TEXT NOT NULL,
          notes TEXT NOT NULL
        );
        """
    )
    for number, question in enumerate(QUESTIONS, 1):
        validate_reference(question)
        question_id = f"q{number:02d}"
        connection.execute(
            "INSERT INTO questions VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'python', ?, ?, ?)",
            (
                question_id,
                f"9.{number}",
                question.company,
                question.title,
                question.difficulty,
                question.question,
                question.starter,
                question.answer,
                json.dumps(question.tests, separators=(",", ":")),
                json.dumps(question.source_images),
                question.notes,
            ),
        )
        view_sql = f"""
            CREATE VIEW {question_id} AS
            SELECT question_id, source_number, company, title, difficulty, question,
                   starter, answer, answer_type, checker_spec, source_images, notes
            FROM questions
            WHERE question_id = '{question_id}'
            """  # noqa: S608 - identifier comes from a bounded counter.
        connection.execute(view_sql)


def build_python_algorithm_problem_bank(target: Path = DATABASE_PATH) -> Path:
    return rebuild_database(target, seed_python_algorithm_problem_bank)


if __name__ == "__main__":
    print(f"Built {build_python_algorithm_problem_bank()}.")
