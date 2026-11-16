/* Part 4 — Models: build each one by hand first, then with scikit-learn. */
(function(){
const TEMPS = `import numpy as np
temp = np.array([14, 16, 19, 21, 23, 26, 28, 31])    # afternoon temperature, in degrees C
iced = np.array([8, 11, 15, 18, 24, 27, 33, 38])     # iced drinks sold that afternoon`;

const LINE = TEMPS + `
slope, intercept = np.polyfit(temp, iced, 1)          # the best-fit line, already found for you`;

const LOYAL = `import numpy as np
visits = np.array([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12])    # visits last month
joined = np.array([0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1])      # 1 = joined the loyalty club`;

const LOYAL_SIG = LOYAL + `

def sigmoid(z):
    return 1 / (1 + np.exp(-z))`;

const PASTRY = `import numpy as np
hour   = np.array([7, 8, 9, 10, 11, 13, 14, 15, 16, 17])    # hour of the day of each order
pastry = np.array([1, 1, 1, 1, 0, 0, 0, 1, 0, 0])           # 1 = the customer added a pastry`;

const PASTRY_GINI = PASTRY + `

def gini(labels):
    p = np.mean(labels)
    return 1 - p**2 - (1 - p)**2`;

const REVIEWS = `reviews = [
    ("great coffee", "happy"),
    ("lovely staff great latte", "happy"),
    ("great muffin", "happy"),
    ("friendly staff", "happy"),
    ("cold coffee", "grumpy"),
    ("slow service cold latte", "grumpy"),
    ("rude staff", "grumpy"),
    ("slow slow service", "grumpy"),
]
# every word seen in each kind of review, and the full vocabulary
words = {"happy": [], "grumpy": []}
for text, label in reviews:
    words[label] += text.split()
vocab = set(words["happy"] + words["grumpy"])`;

const REVIEWS_WP = REVIEWS + `

def word_prob(word, label):
    return (words[label].count(word) + 1) / (len(words[label]) + len(vocab))`;

const REVIEWS_SK = `texts  = ["great coffee", "lovely staff great latte", "great muffin", "friendly staff",
          "cold coffee", "slow service cold latte", "rude staff", "slow slow service"]
labels = ["happy", "happy", "happy", "happy", "grumpy", "grumpy", "grumpy", "grumpy"]`;

const RUSH = `import numpy as np
from sklearn.model_selection import train_test_split
rng = np.random.default_rng(42)
hour    = rng.integers(7, 19, 300)       # hour of the day
weekend = rng.integers(0, 2, 300)        # 1 = Saturday or Sunday
busy    = ((hour < 10) | ((weekend == 1) & (hour > 13))).astype(int)
X = np.column_stack([hour, weekend])     # two features per row
y = busy
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)`;

CHAPTERS.push(
{part:'Part 4 · Models', name:'Building models', blurb:'Four classic models — built by hand, then with scikit-learn',
 terms:[['Model','A rule learned from examples that turns inputs into a prediction.'],['Features (X) and target (y)','The inputs you know, and the thing you want to predict.'],['Regression vs classification','Predicting a number vs predicting a category.'],['Training and test sets','Fit the model on one part of the data; judge it on a part it has never seen.'],['Overfitting','Memorizing the training data, noise and all, and then doing badly on new data.'],['Linear regression','Fits the straight line that makes the squared prediction errors as small as possible.'],['Slope and intercept','How much y changes per unit of x, and the value of y when x is 0.'],['Logistic regression','Predicts the probability of yes/no by passing a straight-line score through the sigmoid.'],['Sigmoid','The S-shaped function 1 / (1 + e^−z) that squeezes any number into the range 0 to 1.'],['Gradient descent','Learning by repetition: nudge the model\'s numbers a little in the direction that reduces the error.'],['Decision tree','A flowchart of yes/no questions learned from data.'],['Gini impurity','How mixed a group is: 0 means all one class, 0.5 means a 50/50 split.'],['Naive Bayes','Scores each class by multiplying how common the class is by how likely each feature is in that class.'],['Laplace smoothing','Adding 1 to every count so that an unseen word doesn\'t wipe a probability out to zero.'],['fit / predict','The two scikit-learn verbs: learn from data, then apply what was learned.']],
 levels:[
 {name:'What is a model?', finding:'You can now judge any model the honest way: on data it has never seen.', steps:[
  L('Learning from examples','<div class="case">📋 <b>The case.</b> Rosa is impressed. “You\'ve told me what <i>happened</i>. Can the data tell me what <i>will</i> happen?”</div><p>A <b>model</b> is a rule learned from examples. You show it <b>features</b> (what you know, called <code>X</code>) and a <b>target</b> (what you want to predict, called <code>y</code>).</p><p><b>Regression</b> predicts a number. <b>Classification</b> predicts a category.</p><p>The golden rule: <b>never grade a model on the data it learned from</b>. Hold back a <b>test set</b>. A model that aces its training data but flops on the test set has <b>overfit</b> — it memorized instead of learning.</p>'),
  MC('Predicting tomorrow\'s sales in dollars is a…',null,['Regression problem','Classification problem','Clustering problem','Cleaning problem'],'The answer is a number on a continuous scale, so it is regression.'),
  MC('Predicting whether a customer will leave a tip (yes or no) is a…',null,['Classification problem','Regression problem','Sorting problem','Correlation problem'],'The answer is one of a fixed set of categories.'),
  MC('Why do we keep a test set that the model never trains on?',null,['To see how it performs on data it has not seen','To make training faster','To give the model more examples','To remove outliers'],'New data is what the model will face in real life. The test set is a rehearsal for that.'),
  MC('A model scores 100% on its training data and 60% on the test data. What happened?',null,['It overfit: it memorized the training data','It underfit: it is too simple','The test set is broken','Nothing — that is the ideal result'],'A big gap between training and test scores is the signature of overfitting.'),
  CODE('The simplest score for a classifier is <b>accuracy</b>: the share of predictions that are right. Create <code>accuracy</code> for these predictions.',`import numpy as np
y_true = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1])
y_pred = np.array([1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
`,{tests:`_close("accuracy", accuracy, 0.8)`,need:['==']},'(y_true == y_pred) is a mask. Its .mean() is the fraction that are True.',`import numpy as np
y_true = np.array([1, 0, 1, 1, 0, 1, 0, 0, 1, 1])
y_pred = np.array([1, 0, 0, 1, 0, 1, 1, 0, 1, 1])
accuracy = (y_true == y_pred).mean()
print(accuracy)`),
 ]},
 {name:'Linear regression', finding:'Each extra degree sells about 1.8 more iced drinks. For a 25° afternoon, prepare about 27 of them.', steps:[
  P(TEMPS, L('The best straight line','<div class="case">📋 <b>The case.</b> “Tomorrow will be 25 degrees. How many iced drinks should I prepare?”</div><p><b>Linear regression</b> draws the straight line <code>y = slope × x + intercept</code> that sits as close to the dots as possible — “close” meaning the <b>squared errors</b> are as small as they can be.</p><p>There is an exact recipe. With x̄ and ȳ the means:</p><p><code>slope = sum((x − x̄) × (y − ȳ)) / sum((x − x̄)²)</code><br><code>intercept = ȳ − slope × x̄</code></p>',`chart.scatter(temp, iced, title="Temperature vs iced drinks")`)),
  MC('A fitted line has slope 1.8. What does that tell Rosa?',null,['Each extra degree goes with about 1.8 more iced drinks','She sells 1.8 iced drinks per day','Temperature explains 1.8% of sales','At 0 degrees she sells 1.8 drinks'],'The slope is the change in y for one more unit of x. The value at x = 0 is the intercept.'),
  MC('A model is y = 2x + 1. What does it predict for x = 4?',null,['9','8','7','24'],'2 × 4 + 1 = 9.'),
  P(TEMPS, CODE('Build it by hand. Using the recipe, create <code>slope</code> and <code>intercept</code> for predicting <code>iced</code> from <code>temp</code>. The last line of the starter draws your line.',`x_bar = temp.mean()
y_bar = iced.mean()


chart.scatter(temp, iced, line=(slope, intercept), title="My regression line")
`,{tests:`_m, _b = np.polyfit(temp, iced, 1)
_close("slope", slope, _m, 0.001)
_close("intercept", intercept, _b, 0.001)`},'slope = ((temp - x_bar) * (iced - y_bar)).sum() / ((temp - x_bar) ** 2).sum()  then  intercept = y_bar - slope * x_bar',`x_bar = temp.mean()
y_bar = iced.mean()
slope = ((temp - x_bar) * (iced - y_bar)).sum() / ((temp - x_bar) ** 2).sum()
intercept = y_bar - slope * x_bar
print(slope, intercept)
chart.scatter(temp, iced, line=(slope, intercept), title="My regression line")`)),
  P(LINE, CODE('Use the line. Create <code>forecast</code>, the predicted iced drinks for a 25° afternoon. Then create <code>mse</code>, the <b>mean squared error</b>: the average of (prediction − actual)² over the eight days you have.','',{tests:`_close("forecast", forecast, slope * 25 + intercept, 0.001)
_close("mse", mse, float(((slope * temp + intercept - iced) ** 2).mean()), 0.001)`},'forecast = slope * 25 + intercept. For the error: predictions = slope * temp + intercept, then ((predictions - iced) ** 2).mean()',`forecast = slope * 25 + intercept
predictions = slope * temp + intercept
mse = ((predictions - iced) ** 2).mean()
print(forecast, mse)`)),
  P(TEMPS, L('The scikit-learn way','<p>In real projects you let <b>scikit-learn</b> do the fitting. Every model in it follows the same two steps:</p><p><code>model.fit(X, y)</code> — learn · <code>model.predict(X_new)</code> — use</p><p>One catch: <code>X</code> must be a <b>table</b> (rows and columns), even with a single feature. <code>temp.reshape(-1, 1)</code> turns the flat array into one column.</p>',`from sklearn.linear_model import LinearRegression
X = temp.reshape(-1, 1)
model = LinearRegression().fit(X, iced)
print(model.coef_[0], model.intercept_)
print(model.predict([[25]]))`)),
  FILL('Train the model.',`model = LinearRegression()
model.___(X, y)`,['fit'],'fit learns from the data; predict uses what was learned.'),
  P(TEMPS, CODE('Do it with scikit-learn. Fit a <code>LinearRegression</code> called <code>model</code> on the temperatures and iced-drink sales, then create <code>forecast</code>: its prediction for 25° as a single number.',`from sklearn.linear_model import LinearRegression
X = temp.reshape(-1, 1)
`,{tests:`_m, _b = np.polyfit(temp, iced, 1)
assert hasattr(model, "coef_"), "model has not been fitted yet — call model.fit(X, iced)"
_close("forecast", float(np.ravel(forecast)[0]), _m * 25 + _b, 0.01)`},'model = LinearRegression().fit(X, iced). predict returns an array, so take the first element: model.predict([[25]])[0]',`from sklearn.linear_model import LinearRegression
X = temp.reshape(-1, 1)
model = LinearRegression().fit(X, iced)
forecast = model.predict([[25]])[0]
print(forecast)`)),
 ]},
 {name:'Logistic regression', finding:'Around four to five visits a month is the tipping point: beyond it, a customer is more likely than not to join the club. That is who the flyer should target.', steps:[
  P(LOYAL, L('Predicting yes or no','<div class="case">📋 <b>The case.</b> “Who should I invite to the loyalty club? I don\'t want to pester people who\'ll say no.”</div><p>The target is now yes/no (1/0). A straight line would happily predict 1.7 or −0.3, which makes no sense.</p><p><b>Logistic regression</b> fixes that: compute a straight-line score <code>z = w × x + b</code>, then squeeze it through the <b>sigmoid</b>:</p><p><code>p = 1 / (1 + e^(−z))</code></p><p>The result is always between 0 and 1 — a <b>probability</b>. Predict “yes” when p is at least 0.5.</p>',`z = np.linspace(-6, 6, 50)
chart.line(z, 1 / (1 + np.exp(-z)), title="The sigmoid")`)),
  MC('What is sigmoid(0)?',null,['0.5','0','1','It is undefined'],'1 / (1 + e⁰) = 1 / 2. A score of zero means “could go either way.”'),
  MC('What does the sigmoid do to a very large positive score, like 20?',null,['Gives a value very close to 1','Gives exactly 20','Gives a value very close to 0','Gives 0.5'],'Big positive scores mean “almost certainly yes”; big negative ones mean “almost certainly no”.'),
  CODE('Write the function <code>sigmoid(z)</code>. It should work on a single number and on a whole array. (<code>np.exp(x)</code> computes e to the power x.)',`import numpy as np

`,{tests:`_close("sigmoid(0)", sigmoid(0), 0.5, 0.0001)
_close("sigmoid(2)", sigmoid(2), 0.8808, 0.001)
_eq("sigmoid on an array", np.round(sigmoid(np.array([-2.0, 0.0])), 4), [0.1192, 0.5])`},'def sigmoid(z): return 1 / (1 + np.exp(-z))',`import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

print(sigmoid(0), sigmoid(2))`),
  P(LOYAL_SIG, L('Learning by nudging','<p>How do we find good values for <code>w</code> and <code>b</code>? There is no neat formula this time. Instead we use <b>gradient descent</b>:</p><p>1. Start with w = 0 and b = 0.<br>2. Predict a probability for everyone.<br>3. Look at the errors (prediction − truth).<br>4. Nudge w and b a little in the direction that shrinks the errors.<br>5. Repeat a few thousand times.</p><p>The size of each nudge is the <b>learning rate</b> (0.1 below).</p>',`w, b = 0.0, 0.0
for step in range(5000):
    p = sigmoid(w * visits + b)
    error = p - joined
    w -= 0.1 * (error * visits).mean()
    b -= 0.1 * error.mean()
print(round(w, 2), round(b, 2))`)),
  P(LOYAL_SIG, CODE('Train it by hand. The loop is started for you: fill in the two nudges. Then create <code>p5</code>, the model\'s probability that a customer with 5 visits joins.',`w, b = 0.0, 0.0
for step in range(5000):
    p = sigmoid(w * visits + b)
    error = p - joined
    # nudge w: subtract 0.1 times the mean of (error * visits)
    # nudge b: subtract 0.1 times the mean of error

`,{tests:`assert w > 0.3, f"w should have grown clearly positive (more visits, more likely to join), but it is {w}"
assert b < 0, f"b should have become negative, but it is {b}"
_close("p5", p5, float(sigmoid(w * 5 + b)), 0.0001)
assert 0.3 < p5 < 0.9, f"p5 should be a middling probability, but yours is {p5}"`},'w -= 0.1 * (error * visits).mean() and b -= 0.1 * error.mean() inside the loop. After it: p5 = sigmoid(w * 5 + b)',`w, b = 0.0, 0.0
for step in range(5000):
    p = sigmoid(w * visits + b)
    error = p - joined
    w -= 0.1 * (error * visits).mean()
    b -= 0.1 * error.mean()
p5 = sigmoid(w * 5 + b)
print(w, b, p5)`)),
  P(LOYAL, CODE('Now with scikit-learn. Fit a <code>LogisticRegression</code> called <code>model</code>. Create <code>prob</code>, the probability that a customer with 5 visits joins (<code>predict_proba</code> gives [P(no), P(yes)] for each row), and <code>guess</code>, the model\'s yes/no prediction for a customer with 9 visits.',`from sklearn.linear_model import LogisticRegression
X = visits.reshape(-1, 1)
`,{tests:`assert hasattr(model, "coef_"), "model has not been fitted yet — call model.fit(X, joined)"
_close("prob", prob, float(model.predict_proba([[5]])[0, 1]), 0.0001)
_eq("guess", int(guess), 1)`},'model = LogisticRegression().fit(X, joined). Then prob = model.predict_proba([[5]])[0, 1] and guess = model.predict([[9]])[0]',`from sklearn.linear_model import LogisticRegression
X = visits.reshape(-1, 1)
model = LogisticRegression().fit(X, joined)
prob = model.predict_proba([[5]])[0, 1]
guess = model.predict([[9]])[0]
print(prob, guess)`)),
 ]},
 {name:'Decision trees', finding:'One question does most of the work: “Is it before 11 o\'clock?” Morning customers add a pastry; afternoon ones mostly don\'t. Bake early.', steps:[
  P(PASTRY, L('Twenty questions, learned from data','<div class="case">📋 <b>The case.</b> “When should the pastry case be full? I keep throwing croissants away.”</div><p>A <b>decision tree</b> is a flowchart of yes/no questions: “Is the hour before 11?” → yes: predict pastry.</p><p>How does it pick a question? It tries many and keeps the one that leaves the two resulting groups <b>purest</b>. Purity is measured by <b>Gini impurity</b>:</p><p><code>gini = 1 − p² − (1 − p)²</code> &nbsp; where p is the share of 1s in the group.</p><p><b>0</b> = everyone in the group is the same. <b>0.5</b> = a 50/50 mix, as impure as it gets.</p>',`chart.scatter(hour, pastry, title="Hour of day vs pastry (1 = yes)")`)),
  MC('A group contains only customers who bought a pastry. What is its Gini impurity?',null,['0','0.5','1','It depends on the size of the group'],'p = 1, so 1 − 1² − 0² = 0. A pure group has zero impurity.'),
  MC('A group has 5 pastry buyers and 5 non-buyers. What is its Gini impurity?',null,['0.5','0','0.25','1'],'p = 0.5, so 1 − 0.25 − 0.25 = 0.5. That is the worst case for two classes.'),
  CODE('Write <code>gini(labels)</code>. It receives a list or array of 0s and 1s and returns the Gini impurity.',`import numpy as np

`,{tests:`_close("gini([1, 1, 1, 1])", gini([1, 1, 1, 1]), 0.0, 0.0001)
_close("gini([1, 0])", gini([1, 0]), 0.5, 0.0001)
_close("gini([1, 1, 1, 0])", gini([1, 1, 1, 0]), 0.375, 0.0001)
_close("gini(np.array([0, 0, 0]))", gini(np.array([0, 0, 0])), 0.0, 0.0001)`},'p = np.mean(labels) gives the share of 1s. Then return 1 - p**2 - (1 - p)**2',`import numpy as np

def gini(labels):
    p = np.mean(labels)
    return 1 - p**2 - (1 - p)**2

print(gini([1, 1, 1, 0]))`),
  P(PASTRY_GINI, CODE('Find the best question by hand. For each candidate hour <code>t</code>, split the orders into <code>left</code> (hour &lt; t) and <code>right</code> (the rest), and compute the <b>weighted</b> impurity: each side\'s gini times the share of orders on that side. Create <code>best_t</code>, the hour with the lowest score.',`best_t = None
best_score = 1.0
for t in hour[1:]:
    left = pastry[hour < t]
    right = pastry[hour >= t]
    # score = share on the left * gini(left) + share on the right * gini(right)
    # if score is lower than best_score, remember it and remember t

print(best_t, best_score)
`,{tests:`_eq("best_t", int(best_t), 11)`},'score = len(left) / len(pastry) * gini(left) + len(right) / len(pastry) * gini(right). Then: if score < best_score: best_score = score and best_t = t',`best_t = None
best_score = 1.0
for t in hour[1:]:
    left = pastry[hour < t]
    right = pastry[hour >= t]
    score = len(left) / len(pastry) * gini(left) + len(right) / len(pastry) * gini(right)
    if score < best_score:
        best_score = score
        best_t = t
print(best_t, best_score)`)),
  P(PASTRY, L('Growing a whole tree','<p>A full tree repeats that search inside each new group, again and again. scikit-learn does it in one line — and <code>export_text</code> prints the flowchart it learned.</p><p><code>max_depth</code> limits how many questions deep it may go. Unlimited trees keep splitting until they have memorized every training example: classic <b>overfitting</b>.</p>',`from sklearn.tree import DecisionTreeClassifier, export_text
X = hour.reshape(-1, 1)
tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X, pastry)
print(export_text(tree, feature_names=["hour"]))`)),
  MC('Why do we usually limit <code>max_depth</code>?',null,['A very deep tree memorizes the training data and predicts new data badly','Deep trees cannot be printed','scikit-learn only allows a depth of 2','Shallow trees are always more accurate on training data'],'Depth is the tree\'s capacity to memorize. Limiting it forces the tree to keep only the patterns that matter.'),
  P(PASTRY, CODE('Fit a <code>DecisionTreeClassifier</code> with <code>max_depth=1</code> called <code>tree</code> — a single question. Create <code>guess8</code> and <code>guess16</code>: its predictions for an order at 8 o\'clock and at 16 o\'clock.',`from sklearn.tree import DecisionTreeClassifier
X = hour.reshape(-1, 1)
`,{tests:`assert hasattr(tree, "tree_"), "tree has not been fitted yet — call .fit(X, pastry)"
_eq("the depth of your tree", tree.get_depth(), 1)
_eq("guess8", int(guess8), 1)
_eq("guess16", int(guess16), 0)`},'tree = DecisionTreeClassifier(max_depth=1).fit(X, pastry). Then tree.predict([[8]])[0]',`from sklearn.tree import DecisionTreeClassifier
X = hour.reshape(-1, 1)
tree = DecisionTreeClassifier(max_depth=1).fit(X, pastry)
guess8 = tree.predict([[8]])[0]
guess16 = tree.predict([[16]])[0]
print(guess8, guess16)`)),
 ]},
 {name:'Naive Bayes', finding:'The words “cold” and “slow” mark a grumpy review; “great” marks a happy one. Rosa now gets an alert the moment a grumpy review lands.', steps:[
  P(REVIEWS, L('Counting your way to a prediction','<div class="case">📋 <b>The case.</b> Reviews are piling up online. “Can the computer tell me which ones are complaints, so I can answer those first?”</div><p><b>Naive Bayes</b> classifies by counting. For each class it multiplies:</p><p><b>how common the class is</b> × <b>how likely each word is in that class</b></p><p>…and picks the class with the bigger score. It is called <b>naive</b> because it pretends every word is independent of the others. That is false — and it works surprisingly well anyway.</p><p>One trick: a word never seen in a class would have probability 0 and wipe out the whole product. So we add 1 to every count (<b>Laplace smoothing</b>):</p><p><code>P(word | class) = (count in class + 1) / (words in class + vocabulary size)</code></p>',`print(words["happy"])
print(words["grumpy"])
print(len(vocab), "different words")`)),
  MC('3 of 10 reviews are grumpy. Before reading a single word, what is P(grumpy)?',null,['0.3','0.7','3','0.03'],'This starting belief is called the prior: 3 out of 10.'),
  MC('“cold” appears in 4 of 5 grumpy reviews and 1 of 5 happy ones. A new review says “cold”. Which class does that word favour?',null,['Grumpy','Happy','Neither','It cannot be known'],'The word is four times as likely in grumpy reviews, so it pushes the score that way.'),
  MC('Why is the method called <b>naive</b>?',null,['It assumes the features are independent of each other within a class','It only works on small datasets','It ignores how common each class is','It cannot handle text'],'Treating “slow” and “service” as unrelated is naive — but it makes the maths a simple multiplication.'),
  P(REVIEWS, CODE('Write <code>word_prob(word, label)</code> using the smoothing formula. <code>words[label]</code> is the list of all words seen in that kind of review, and <code>vocab</code> is the set of all different words.','',{tests:`_close('word_prob("great", "happy")', word_prob("great", "happy"), 4 / 21, 0.0001)
_close('word_prob("great", "grumpy")', word_prob("great", "grumpy"), 1 / 22, 0.0001)
_close('word_prob("cold", "grumpy")', word_prob("cold", "grumpy"), 3 / 22, 0.0001)`},'A list can count: words[label].count(word). The result is (that count + 1) / (len(words[label]) + len(vocab))',`def word_prob(word, label):
    return (words[label].count(word) + 1) / (len(words[label]) + len(vocab))

print(word_prob("great", "happy"), word_prob("great", "grumpy"))`)),
  P(REVIEWS_WP, CODE('Finish the classifier. Write <code>score(text, label)</code>: start at 0.5 (half the reviews are in each class) and multiply by <code>word_prob</code> for every word in the text. Then write <code>classify(text)</code>, which returns "happy" or "grumpy" — whichever scores higher.','',{tests:`_close('score("great", "happy")', score("great", "happy"), 0.5 * 4 / 21, 0.0001)
_eq('classify("great latte")', classify("great latte"), "happy")
_eq('classify("cold slow coffee")', classify("cold slow coffee"), "grumpy")
_eq('classify("friendly staff")', classify("friendly staff"), "happy")`},'In score: result = 0.5, then for word in text.split(): result *= word_prob(word, label). In classify: compare score(text, "happy") with score(text, "grumpy").',`def score(text, label):
    result = 0.5
    for word in text.split():
        result *= word_prob(word, label)
    return result

def classify(text):
    if score(text, "happy") > score(text, "grumpy"):
        return "happy"
    return "grumpy"

print(classify("cold slow coffee"))`)),
  P(REVIEWS_SK, L('The scikit-learn way','<p>Two pieces work together. <code>CountVectorizer</code> turns each text into a row of word counts. <code>MultinomialNB</code> is the naive Bayes model that learns from those counts — with the same add-one smoothing you just wrote.</p>',`from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
vec = CountVectorizer()
X = vec.fit_transform(texts)
model = MultinomialNB().fit(X, labels)
print(model.predict(vec.transform(["great staff"])))`)),
  P(REVIEWS_SK, CODE('Build the review alarm with scikit-learn. Fit <code>vec</code> and <code>model</code> on the texts and labels, then create <code>verdict</code>: the predicted label (as text) for the review "cold coffee and slow service".',`from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
vec = CountVectorizer()
X = vec.fit_transform(texts)
`,{tests:`assert hasattr(model, "classes_"), "model has not been fitted yet — call .fit(X, labels)"
_eq("verdict", str(verdict), "grumpy")`},'model = MultinomialNB().fit(X, labels). Then model.predict(vec.transform(["cold coffee and slow service"]))[0]',`from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
vec = CountVectorizer()
X = vec.fit_transform(texts)
model = MultinomialNB().fit(X, labels)
verdict = model.predict(vec.transform(["cold coffee and slow service"]))[0]
print(verdict)`)),
 ]},
 {name:'The final case', finding:'Your tree calls every rush hour correctly on shifts it never saw. Rosa prints the staff rota from it. One thing is left: learning to say what results really mean.', steps:[
  L('Choose your tool','<div class="case">📋 <b>The final case.</b> “I need to know when we\'ll be slammed, so I can schedule staff. Pick whatever model you think is right — and prove it works.”</div><p>You have four models. A quick guide:</p><p><b>Linear regression</b> — predict a number from a roughly straight-line trend.<br><b>Logistic regression</b> — predict yes/no with a probability, when the effect grows steadily.<br><b>Decision tree</b> — yes/no (or a number) from rules and thresholds; easy to explain.<br><b>Naive Bayes</b> — fast classification from many small clues, such as words.</p>'),
  MC('Rosa wants to predict the <b>dollar amount</b> of next week\'s milk bill from the number of lattes sold. Which model fits best?',null,['Linear regression','Logistic regression','Naive Bayes','A decision tree with max_depth=1'],'The target is a number that should rise steadily with lattes sold: a straight-line job.'),
  MC('She wants rules a new manager can read off a single page, like “weekend and after 1 pm → busy”. Which model?',null,['Decision tree','Linear regression','Naive Bayes','Logistic regression'],'A tree is literally a set of readable if-then rules.'),
  MC('She wants to sort incoming emails into “order”, “complaint” and “spam” from the words in them. Which model is the classic first choice?',null,['Naive Bayes','Linear regression','A single if statement','Correlation'],'Many small word clues, multiplied together: exactly what naive Bayes is built for.'),
  P(RUSH, CODE('The full workflow. 300 past shifts are loaded and already split into training and test sets. Fit a <code>DecisionTreeClassifier</code> called <code>model</code> with <code>max_depth=3</code> on the <b>training</b> data. Then create <code>acc</code>: its accuracy on the <b>test</b> data.',`from sklearn.tree import DecisionTreeClassifier, export_text

`,{tests:`assert hasattr(model, "tree_"), "model has not been fitted yet — call .fit(X_train, y_train)"
assert model.get_depth() <= 3, "Limit the tree with max_depth=3"
_close("acc", acc, float((model.predict(X_test) == y_test).mean()), 0.0001)
assert acc > 0.85, f"A depth-3 tree should score above 0.85 here, but yours scored {acc}"`},'model = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train). Then acc = (model.predict(X_test) == y_test).mean() — or model.score(X_test, y_test).',`from sklearn.tree import DecisionTreeClassifier, export_text

model = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, y_train)
acc = (model.predict(X_test) == y_test).mean()
print(acc)
print(export_text(model, feature_names=["hour", "weekend"]))`)),
 ]},
]}
);
})();
