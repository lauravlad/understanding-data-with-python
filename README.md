# Understanding Data with Python

A free practice app that teaches Python for data work as a game: short lessons, quick puzzles and real code
that runs on your own device. No account, no tracking; progress is saved only in your browser.

- **Part 1 · Python warm-up** — values, decisions, loops, lists, functions, dictionaries
- **Part 2 · Working with data** — importing libraries, NumPy, pandas tables, cleaning and reshaping
- **Part 3 · Statistics** — averages, spread, bell curves, correlation, sampling, hypothesis tests
- **Part 4 · Models** — linear regression, logistic regression, decision trees and naive Bayes, built by hand first
- **Part 5 · Interpreting data** — rates, Simpson's paradox, bias, significance vs importance, honest conclusions

## How it works

It is a static site with no build step. `index.html` loads the lesson files in `js/` and runs Python in the
browser with [Pyodide](https://pyodide.org) (bundled in `pyodide/` together with NumPy and pandas, all under
their own open-source licences). `js/sklearn-lite.js` is a small built-in stand-in for scikit-learn covering
the models the course teaches.

Run it locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
Add `?selftest` to the address to run every exercise's reference solution through the grader.

## iPhone app

`ios/` holds an Xcode project that wraps these same files as a native app that works fully offline.
