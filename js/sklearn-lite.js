/* A small built-in stand-in for scikit-learn, written in Python on top of NumPy.
   It offers the same names and the same fit / predict interface for the models this course
   teaches, so the real library (and its ~40 MB download) is not needed on a phone.
   Keep this source free of backticks and of dollar-brace sequences: it lives in a JS template. */
window.SKLEARN_LITE = String.raw`
import sys, types, re
import numpy as np

_NAME = globals().get("_SK_NAME", "sklearn")

def _X(X):
    X = np.asarray(X, dtype=float)
    if X.ndim == 1:
        raise ValueError("Expected 2D array, got 1D array instead. Reshape your data using array.reshape(-1, 1) if your data has a single feature.")
    if X.ndim != 2:
        raise ValueError("Expected a 2D array of features (rows and columns).")
    return X

def _check_fitted(model, attr):
    if not hasattr(model, attr):
        raise ValueError("This " + type(model).__name__ + " instance is not fitted yet. Call 'fit' first.")

class _Base:
    def __repr__(self):
        return type(self).__name__ + "()"

class _ClassifierScore:
    def score(self, X, y):
        return float(np.mean(self.predict(X) == np.asarray(y)))

# ---------------------------------------------------------------- linear regression
class LinearRegression(_Base):
    def __init__(self, fit_intercept=True):
        self.fit_intercept = fit_intercept
    def fit(self, X, y):
        X = _X(X); y = np.asarray(y, dtype=float)
        A = np.column_stack([X, np.ones(len(X))]) if self.fit_intercept else X
        w = np.linalg.lstsq(A, y, rcond=None)[0]
        if self.fit_intercept:
            self.coef_ = w[:-1]; self.intercept_ = float(w[-1])
        else:
            self.coef_ = w; self.intercept_ = 0.0
        self.n_features_in_ = X.shape[1]
        return self
    def predict(self, X):
        _check_fitted(self, "coef_")
        return _X(X) @ self.coef_ + self.intercept_
    def score(self, X, y):
        y = np.asarray(y, dtype=float); p = self.predict(X)
        return float(1 - np.sum((y - p) ** 2) / np.sum((y - y.mean()) ** 2))

# ---------------------------------------------------------------- logistic regression
class LogisticRegression(_Base, _ClassifierScore):
    def __init__(self, C=1.0, max_iter=100, **kwargs):
        self.C = C; self.max_iter = max_iter
    def fit(self, X, y):
        X = _X(X); y = np.asarray(y)
        self.classes_ = np.unique(y)
        if len(self.classes_) != 2:
            raise ValueError("The built-in LogisticRegression handles exactly two classes.")
        t = (y == self.classes_[1]).astype(float)
        n, d = X.shape
        A = np.column_stack([X, np.ones(n)])
        theta = np.zeros(d + 1)
        reg = np.ones(d + 1); reg[-1] = 0.0          # the intercept is not penalised
        C = float(self.C)
        def loss(th):
            z = A @ th
            return C * np.sum(np.logaddexp(0, z) - t * z) + 0.5 * np.sum(reg * th * th)
        for _ in range(200):
            z = np.clip(A @ theta, -500, 500)
            p = 1 / (1 + np.exp(-z))
            g = C * (A.T @ (p - t)) + reg * theta
            H = C * ((A.T * (p * (1 - p))) @ A) + np.diag(reg) + 1e-10 * np.eye(d + 1)
            step = np.linalg.solve(H, g)
            s = 1.0; base = loss(theta)
            while s > 1e-8 and loss(theta - s * step) > base:
                s /= 2
            theta = theta - s * step
            if np.max(np.abs(s * step)) < 1e-10:
                break
        self.coef_ = theta[:-1].reshape(1, -1); self.intercept_ = theta[-1:].copy()
        self.n_features_in_ = d
        return self
    def decision_function(self, X):
        _check_fitted(self, "coef_")
        return _X(X) @ self.coef_[0] + self.intercept_[0]
    def predict_proba(self, X):
        p = 1 / (1 + np.exp(-np.clip(self.decision_function(X), -500, 500)))
        return np.column_stack([1 - p, p])
    def predict(self, X):
        return self.classes_[(self.decision_function(X) > 0).astype(int)]

# ---------------------------------------------------------------- decision tree
class _Node:
    __slots__ = ("f", "t", "l", "r", "counts")

def _gini(counts):
    n = counts.sum()
    return 1.0 - float(np.sum((counts / n) ** 2))

class DecisionTreeClassifier(_Base, _ClassifierScore):
    def __init__(self, max_depth=None, min_samples_split=2, random_state=None, criterion="gini", **kwargs):
        self.max_depth = max_depth; self.min_samples_split = min_samples_split; self.random_state = random_state
    def fit(self, X, y):
        X = _X(X); y = np.asarray(y)
        self.classes_, yi = np.unique(y, return_inverse=True)
        k = len(self.classes_); self.n_features_in_ = X.shape[1]
        stats = {"depth": 0, "nodes": 0}
        def build(idx, depth):
            node = _Node(); node.f = None; node.t = None; node.l = None; node.r = None
            node.counts = np.bincount(yi[idx], minlength=k)
            stats["nodes"] += 1; stats["depth"] = max(stats["depth"], depth)
            if (self.max_depth is not None and depth >= self.max_depth) or np.count_nonzero(node.counts) == 1 or len(idx) < self.min_samples_split:
                return node
            best = None
            for f in range(X.shape[1]):
                col = X[idx, f]
                vals = np.unique(col)
                for a, b in zip(vals[:-1], vals[1:]):
                    thr = (a + b) / 2
                    mask = col <= thr
                    cl = np.bincount(yi[idx[mask]], minlength=k); cr = node.counts - cl
                    score = (cl.sum() * _gini(cl) + cr.sum() * _gini(cr)) / len(idx)
                    if best is None or score < best[0] - 1e-12:
                        best = (score, f, thr, mask)
            if best is None:
                return node
            node.f = best[1]; node.t = float(best[2])
            node.l = build(idx[best[3]], depth + 1); node.r = build(idx[~best[3]], depth + 1)
            return node
        self._root = build(np.arange(len(X)), 0)
        self.tree_ = types.SimpleNamespace(max_depth=stats["depth"], node_count=stats["nodes"])
        return self
    def get_depth(self):
        _check_fitted(self, "tree_")
        return self.tree_.max_depth
    def _leaf(self, row):
        node = self._root
        while node.f is not None:
            node = node.l if row[node.f] <= node.t else node.r
        return node
    def predict(self, X):
        _check_fitted(self, "tree_")
        return self.classes_[[int(np.argmax(self._leaf(row).counts)) for row in _X(X)]]
    def predict_proba(self, X):
        _check_fitted(self, "tree_")
        return np.array([self._leaf(row).counts / self._leaf(row).counts.sum() for row in _X(X)])

def export_text(decision_tree, feature_names=None, decimals=2):
    _check_fitted(decision_tree, "tree_")
    lines = []
    def name(f):
        return str(feature_names[f]) if feature_names is not None else "feature_" + str(f)
    def walk(node, depth):
        indent = "|   " * depth
        if node.f is None:
            lines.append(indent + "|--- class: " + str(decision_tree.classes_[int(np.argmax(node.counts))]))
        else:
            lines.append(indent + "|--- " + name(node.f) + " <= " + format(node.t, "." + str(decimals) + "f"))
            walk(node.l, depth + 1)
            lines.append(indent + "|--- " + name(node.f) + " >  " + format(node.t, "." + str(decimals) + "f"))
            walk(node.r, depth + 1)
    walk(decision_tree._root, 0)
    return "\n".join(lines) + "\n"

# ---------------------------------------------------------------- text + naive Bayes
class _Counts(np.ndarray):
    def toarray(self):
        return np.asarray(self)

class CountVectorizer(_Base):
    def __init__(self, lowercase=True, **kwargs):
        self.lowercase = lowercase
    def _tokens(self, text):
        text = str(text)
        if self.lowercase:
            text = text.lower()
        return re.findall(r"(?u)\b\w\w+\b", text)
    def fit(self, texts):
        words = sorted({w for t in texts for w in self._tokens(t)})
        self.vocabulary_ = {w: i for i, w in enumerate(words)}
        return self
    def transform(self, texts):
        _check_fitted(self, "vocabulary_")
        if isinstance(texts, str):
            raise ValueError("Iterable over raw text documents expected, string object received. Wrap your text in a list: [text]")
        out = np.zeros((len(texts), len(self.vocabulary_)), dtype=int)
        for i, t in enumerate(texts):
            for w in self._tokens(t):
                j = self.vocabulary_.get(w)
                if j is not None:
                    out[i, j] += 1
        return out.view(_Counts)
    def fit_transform(self, texts):
        return self.fit(texts).transform(texts)
    def get_feature_names_out(self):
        _check_fitted(self, "vocabulary_")
        return np.array(sorted(self.vocabulary_), dtype=object)

class MultinomialNB(_Base, _ClassifierScore):
    def __init__(self, alpha=1.0, **kwargs):
        self.alpha = alpha
    def fit(self, X, y):
        X = _X(X); y = np.asarray(y)
        self.classes_ = np.unique(y)
        counts = np.array([X[y == c].sum(axis=0) for c in self.classes_]) + self.alpha
        self.feature_log_prob_ = np.log(counts / counts.sum(axis=1, keepdims=True))
        self.class_log_prior_ = np.log(np.array([np.mean(y == c) for c in self.classes_]))
        self.n_features_in_ = X.shape[1]
        return self
    def _joint(self, X):
        _check_fitted(self, "classes_")
        return _X(X) @ self.feature_log_prob_.T + self.class_log_prior_
    def predict(self, X):
        return self.classes_[np.argmax(self._joint(X), axis=1)]
    def predict_proba(self, X):
        j = self._joint(X); j = j - j.max(axis=1, keepdims=True)
        p = np.exp(j)
        return p / p.sum(axis=1, keepdims=True)

# ---------------------------------------------------------------- helpers
def train_test_split(*arrays, test_size=None, train_size=None, random_state=None, shuffle=True):
    n = len(arrays[0])
    if test_size is None:
        test_size = 0.25 if train_size is None else (1 - train_size if isinstance(train_size, float) else n - train_size)
    n_test = int(np.ceil(test_size * n)) if isinstance(test_size, float) else int(test_size)
    n_train = n - n_test
    if shuffle:
        perm = np.random.RandomState(random_state).permutation(n)
        test_idx = perm[:n_test]; train_idx = perm[n_test:n_test + n_train]
    else:
        train_idx = np.arange(n_train); test_idx = np.arange(n_train, n)
    out = []
    for a in arrays:
        if hasattr(a, "iloc"):
            out += [a.iloc[train_idx], a.iloc[test_idx]]
        else:
            a = np.asarray(a); out += [a[train_idx], a[test_idx]]
    return out

def accuracy_score(y_true, y_pred):
    return float(np.mean(np.asarray(y_true) == np.asarray(y_pred)))

def mean_squared_error(y_true, y_pred):
    return float(np.mean((np.asarray(y_true, dtype=float) - np.asarray(y_pred, dtype=float)) ** 2))

# ---------------------------------------------------------------- register as importable modules
def _module(name, **members):
    m = types.ModuleType(name); m.__path__ = []
    for k, v in members.items():
        setattr(m, k, v)
    sys.modules[name] = m
    return m

_root = _module(_NAME, __version__="lite (built into this app)")
_root.linear_model = _module(_NAME + ".linear_model", LinearRegression=LinearRegression, LogisticRegression=LogisticRegression)
_root.tree = _module(_NAME + ".tree", DecisionTreeClassifier=DecisionTreeClassifier, export_text=export_text)
_root.naive_bayes = _module(_NAME + ".naive_bayes", MultinomialNB=MultinomialNB)
_root.model_selection = _module(_NAME + ".model_selection", train_test_split=train_test_split)
_root.metrics = _module(_NAME + ".metrics", accuracy_score=accuracy_score, mean_squared_error=mean_squared_error)
_root.feature_extraction = _module(_NAME + ".feature_extraction")
_root.feature_extraction.text = _module(_NAME + ".feature_extraction.text", CountVectorizer=CountVectorizer)
`;
