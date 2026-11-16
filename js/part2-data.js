/* Part 2 — Working with data: NumPy, pandas tables, cleaning and reshaping.
   Story: you are the first data analyst at the Bean & Byte café. Rosa, the owner, asks the questions. */
(function(){
const CUPS = `import numpy as np
cups = np.array([120, 135, 128, 160, 210])   # cups sold Mon to Fri`;

const ORDERS = `import pandas as pd
orders = pd.DataFrame({
    "day":   ["Mon", "Mon", "Mon", "Tue", "Tue", "Wed", "Wed", "Wed", "Thu", "Fri", "Fri", "Fri"],
    "item":  ["latte", "muffin", "tea", "latte", "espresso", "muffin", "latte", "tea", "espresso", "latte", "muffin", "latte"],
    "kind":  ["drink", "food", "drink", "drink", "drink", "food", "drink", "drink", "drink", "drink", "food", "drink"],
    "price": [4.5, 3.0, 2.5, 4.5, 3.0, 3.0, 4.5, 2.5, 3.0, 4.5, 3.0, 4.5],
    "qty":   [2, 1, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1],
})`;

const MENU = ORDERS + `
menu = pd.DataFrame({
    "item": ["latte", "muffin", "tea", "espresso"],
    "cost": [1.5, 1.0, 0.5, 0.8],     # what each one costs the cafe to make
})`;

const RAW = `import pandas as pd
import numpy as np
raw = pd.DataFrame({
    "customer": ["Ana", "ben ", "Chloe", "Ana", "DEV", "Eli", "ben "],
    "spent":    ["12.50", "8.00", None, "12.50", "20.00", "5.50", "9.00"],
    "visits":   [3, 1, 4, 3, np.nan, 2, 2],
    "city":     ["Riverton", "riverton", "Oakdale", "Riverton", "Oakdale", None, "Riverton"],
})`;

CHAPTERS.push(
/* ------------------------------------------------------------------ NumPy */
{part:'Part 2 · Working with data', name:'NumPy: numbers in bulk', blurb:'Do math on a whole column at once',
 terms:[['Library','A collection of ready-made tools. It must be imported before use.'],['import … as …','Loads a library under a nickname: import numpy as np, import pandas as pd.'],['from … import …','Takes one tool out of a library so you can use it by its bare name.'],['Array','NumPy\'s container for many numbers of the same type. Math on an array happens to every element at once.'],['Vectorized','Working on a whole array in one expression, with no loop: cups * 2.'],['Boolean mask','An array of True/False made by a comparison, used to pick out matching elements: cups[cups > 130].'],['Aggregation','Boiling many values down to one: sum, mean, max, min.'],['axis','Which direction to aggregate in a 2-D array. axis=0 goes down the columns, axis=1 goes across the rows.'],['argmax','The position of the largest value (not the value itself).']],
 levels:[
 {name:'Importing libraries', finding:'You can open any toolbox now. Every data program you will ever read starts with the same few import lines.', steps:[
  L('Borrowing other people\'s tools','<div class="case">📋 <b>Before the first case.</b> Nobody does data work in “bare” Python. The real power comes from <b>libraries</b>: collections of ready-made tools that other people wrote and tested.</div><p>A library has to be <b>imported</b> before you can use it. Imports go at the very top of a program.</p><p>After <code>import math</code>, everything inside the library is reached with a dot: <code>math.sqrt</code>, <code>math.pi</code>. Read the dot as “from”: <i>sqrt, from math</i>.</p>',`import math
print(math.sqrt(16))
print(math.pi)`),
  MC('What does this print?',`import math
print(math.sqrt(16))`,['4.0','16','sqrt(16)','An error'],'math.sqrt is the square-root tool from the math library. It always answers with a decimal number.'),
  MC('What happens if you forget the import line?',`print(math.sqrt(16))`,['NameError: name \'math\' is not defined','It prints 4.0 anyway','It prints 16','Python imports math for you'],'Python only knows a library after you import it. This NameError is the most common error in data work — the cure is an import at the top.'),
  L('Three ways to import','<p>You will see three styles. They all load a library; they differ in <b>what name you type afterwards</b>.</p><p><code>import statistics</code> — use the full name: <code>statistics.mean(...)</code><br><code>import numpy as np</code> — give it a <b>nickname</b>: <code>np.array(...)</code><br><code>from math import sqrt</code> — take <b>one tool</b> out: just <code>sqrt(...)</code></p><p>The nicknames are traditions everyone follows: <b>numpy is np</b> and <b>pandas is pd</b>. Use them and your code will look like everyone else\'s.</p>',`import statistics
import numpy as np
from math import sqrt

print(statistics.mean([3, 4, 8]))
print(np.array([1, 2, 3]) * 10)
print(sqrt(81))`),
  MC('What does this print?',`import numpy as np
print(np.sqrt(9))`,['3.0','9','np.sqrt(9)','An error'],'After “as np”, the library answers to the name np. NumPy has its own sqrt tool.'),
  BUG('This program crashes with a NameError.',['import numpy as np','prices = numpy.array([3, 4, 8])','print(prices)'],1,'The library was imported under the nickname np, so the name numpy does not exist here. It should be np.array(...).'),
  FILL('Take just the value pi out of the math library.',`from math ___ pi
print(pi)`,['import'],'from library import tool — afterwards you use the tool\'s name on its own, with no dot.'),
  ORD('Build a program that prints the average price.',['import statistics','prices = [3, 4, 8]','print(statistics.mean(prices))'],'The import comes first: a library must be loaded before any line uses it.'),
  CODE('Import <code>math</code>, and import <code>numpy</code> with its usual nickname. Then create <code>root</code>, the square root of 144 (using math), and <code>arr</code>, a NumPy array of the numbers 1, 2, 3.','',{tests:`_close("root", root, 12.0, 0.0001)
assert type(arr).__name__ == "ndarray", "arr should be a NumPy array: np.array([1, 2, 3])"
_eq("arr", arr, [1, 2, 3])`,need:['import math|from math','import numpy as np']},'Two import lines at the top: import math and import numpy as np. Then math.sqrt(144) and np.array([1, 2, 3]).',`import math
import numpy as np

root = math.sqrt(144)
arr = np.array([1, 2, 3])
print(root, arr)`),
 ]},
 {name:'Arrays', finding:'Five days of coffee came to $2,635.50 — worked out in one line, with no loop.', steps:[
  L('Your first day at Bean & Byte','<div class="case">📋 <b>The case.</b> Rosa, the owner, hands you a sticky note: cups sold each day this week. “What did we make if every cup is $3.50?”</div><p>You could loop over a list. But data people use <b>NumPy arrays</b>: do math on the array and it happens to <i>every</i> number at once.</p><p>By tradition NumPy is imported as <code>np</code>.</p>',`import numpy as np
cups = np.array([120, 135, 128, 160, 210])
print(cups + 10)
print(cups * 2)
print(cups.sum(), cups.mean())`),
  MC('What does this print?',`import numpy as np
print(np.array([1, 2, 3]) * 2)`,['[2 4 6]','[1 2 3 1 2 3]','[1, 2, 3, 2]','An error'],'Multiplying an array multiplies every element. (Arrays print without commas.)'),
  MC('And this one — a plain Python list, no NumPy?',`print([1, 2, 3] * 2)`,['[1, 2, 3, 1, 2, 3]','[2, 4, 6]','[1, 2, 3, 2]','An error'],'A list times 2 is the list repeated. That difference is exactly why we use arrays for numbers.'),
  FILL('Turn the list into a NumPy array.',`import numpy as np
cups = np.___([120, 135, 128])`,['array'],'np.array(...) builds an array from a list.'),
  P(CUPS, CODE('Every cup sells for $3.50. Create <code>revenue</code>, an array with the money made each day, and <code>total</code>, the money for the whole week.','',{tests:`_eq("revenue", revenue, [420.0, 472.5, 448.0, 560.0, 735.0])
_close("total", total, 2635.5)`},'revenue = cups * 3.5 — then revenue.sum()',`revenue = cups * 3.5
total = revenue.sum()
print(revenue)
print(total)`)),
 ]},
 {name:'Masks', finding:'Three of the five days were busy. Thursday and Friday need a second barista.', steps:[
  L('Asking an array a question','<div class="case">📋 <b>The case.</b> “Which days were busy? I call it busy when we sell more than 130 cups.”</div><p>Compare an array and you get an array of <code>True</code>/<code>False</code> — a <b>mask</b>.</p><p>Put the mask inside square brackets to keep only the True positions. And because True counts as 1, <code>.sum()</code> on a mask <i>counts</i> the matches.</p>',`import numpy as np
cups = np.array([120, 135, 128, 160, 210])
print(cups > 130)
print(cups[cups > 130])
print((cups > 130).sum())`),
  MC('What does this print?',`import numpy as np
a = np.array([5, 12, 8, 20])
print(a[a > 10])`,['[12 20]','[False True False True]','[5 8]','2'],'The mask keeps only the elements where the comparison is True.'),
  MC('What does this print?',`import numpy as np
a = np.array([5, 12, 8, 20])
print((a > 10).sum())`,['2','32','[12 20]','4'],'Two elements pass the test. Summing a mask counts the Trues.'),
  BUG('This should keep the <b>busy</b> days (more than 130 cups), but it returns the quiet ones.',['import numpy as np','cups = np.array([120, 135, 128, 160, 210])','busy = cups[cups < 130]','print(busy)'],2,'The comparison points the wrong way: it should be cups > 130.'),
  P(CUPS, CODE('Create <code>busy</code>, an array of the cup counts above 130, and <code>n_busy</code>, how many busy days there were.','',{tests:`_eq("busy", busy, [135, 160, 210])
_eq("n_busy", n_busy, 3)`},'busy = cups[cups > 130]. For the count, use len(busy) or (cups > 130).sum().',`busy = cups[cups > 130]
n_busy = len(busy)
print(busy, n_busy)`)),
 ]},
 {name:'Summaries', finding:'Lattes outsell muffins more than two to one, and Tuesday was the busiest of the three days.', steps:[
  L('Rows, columns and axis','<div class="case">📋 <b>The case.</b> Rosa now tracks two items per day. “Totals per item, please. And which day was biggest?”</div><p>A 2-D array is a grid. Here each <b>row</b> is a day and each <b>column</b> is an item.</p><p><code>axis=0</code> squashes <i>down the columns</i> (one answer per column). <code>axis=1</code> squashes <i>across the rows</i> (one answer per row). <code>argmax()</code> gives the <i>position</i> of the biggest value.</p>',`import numpy as np
#                lattes muffins
week = np.array([[30, 12],
                 [45, 20],
                 [38, 15]])
print(week.shape)
print(week.sum(axis=0))   # per item
print(week.sum(axis=1))   # per day
print(week.sum(axis=1).argmax())`),
  MC('What does this print?',`import numpy as np
m = np.array([[1, 2],
              [3, 4]])
print(m.sum(axis=0))`,['[4 6]','[3 7]','10','[1 2 3 4]'],'axis=0 adds down each column: 1+3 and 2+4.'),
  MC('What does this print?',`import numpy as np
m = np.array([[1, 2],
              [3, 4]])
print(m.sum(axis=1))`,['[3 7]','[4 6]','10','[1 2 3 4]'],'axis=1 adds across each row: 1+2 and 3+4.'),
  FILL('Get the <b>position</b> of the largest value.',`import numpy as np
cups = np.array([120, 135, 128, 160, 210])
print(cups.___())`,['argmax'],'argmax() returns 4 here — the position of 210 — while max() would return 210 itself.'),
  P(`import numpy as np
#                lattes muffins
week = np.array([[30, 12],     # Monday
                 [45, 20],     # Tuesday
                 [38, 15]])    # Wednesday`, CODE('Create <code>per_item</code>, the total sold of each item (one number per column), and <code>best_day</code>, the row position of the day with the most items sold in total.','',{tests:`_eq("per_item", per_item, [113, 47])
_eq("best_day", best_day, 1)`},'per_item = week.sum(axis=0). For the day: week.sum(axis=1).argmax()',`per_item = week.sum(axis=0)
best_day = week.sum(axis=1).argmax()
print(per_item, best_day)`)),
 ]},
]},

/* ------------------------------------------------------------------ pandas */
{part:'Part 2 · Working with data', name:'pandas: tables', blurb:'Load, look at, pick from and sort a table',
 terms:[['DataFrame','A pandas table: rows and named columns.'],['Series','One column of a DataFrame (or any labelled list of values).'],['.shape','A (rows, columns) pair telling you how big the table is.'],['.head(n)','The first n rows. The first thing to run on any new table.'],['value_counts()','Counts how many times each different value appears in a column.'],['Filtering','Keeping only the rows that pass a test: df[df["qty"] > 2].'],['& and |','“and” and “or” for filters. Each condition needs its own brackets.'],['sort_values()','Reorders rows by a column. ascending=False puts the largest first.']],
 levels:[
 {name:'Meet the table', finding:'The order book has 12 orders and 5 columns. You know what you\'re working with.', steps:[
  P(ORDERS, L('The café\'s order book','<div class="case">📋 <b>The case.</b> Rosa exports this week\'s orders from the till. Before any analysis, a good analyst <i>looks</i> at the data.</div><p><b>pandas</b> (imported as <code>pd</code>) stores a table as a <b>DataFrame</b>. Three things to run on any new table:</p><p><code>.head()</code> — the first rows · <code>.shape</code> — (rows, columns) · <code>.columns</code> — the column names</p>',`print(orders.head(4))
print(orders.shape)
print(orders.columns.tolist())`)),
  P(ORDERS, MC('What does this print for the café table?',`print(orders.shape)`,['(12, 5)','(5, 12)','12','60'],'Rows first, then columns: 12 orders, 5 columns.')),
  MC('What does <code>orders.head(3)</code> show?',null,['The first 3 rows','The last 3 rows','The first 3 columns','3 rows picked at random'],'head(n) gives the first n rows. tail(n) gives the last n.'),
  FILL('Print the number of rows and columns.',`print(orders.___)`,['shape'],'shape is a property, not a method — no brackets after it.'),
  MC('What does this print?',`import pandas as pd
df = pd.DataFrame({"a": [1, 2], "b": [3, 4]})
print(df["b"].sum())`,['7','3','10','[3, 4]'],'A DataFrame is built from a dictionary: each key is a column. df["b"] is the column 3, 4.'),
  P(ORDERS, CODE('Create <code>n_rows</code>, the number of orders in the table, and <code>cols</code>, a plain list of its column names.','',{tests:`_eq("n_rows", n_rows, 12)
assert isinstance(cols, list), "cols should be a plain list — add .tolist() or wrap it in list(...)"
_eq("cols", cols, ["day", "item", "kind", "price", "qty"])`},'len(orders) or orders.shape[0] for the rows. orders.columns.tolist() for the names.',`n_rows = len(orders)
cols = orders.columns.tolist()
print(n_rows, cols)`)),
 ]},
 {name:'Pick columns', finding:'Latte is the most-ordered item, and the average price on the menu board is about $3.54.', steps:[
  P(ORDERS, L('One column, many answers','<div class="case">📋 <b>The case.</b> “What do people order most? And what\'s our average price?”</div><p>Square brackets with a column name give you that column as a <b>Series</b>. A Series has methods that answer questions instantly:</p><p><code>.sum()</code> <code>.mean()</code> <code>.max()</code> <code>.nunique()</code> <code>.value_counts()</code></p><p>Want several columns? Pass a <i>list</i> of names — which means double brackets.</p>',`print(orders["qty"].sum())
print(orders["item"].value_counts())
print(orders[["item", "price"]].head(3))`)),
  P(ORDERS, MC('What does this print?',`print(orders["qty"].sum())`,['20','12','5','qty'],'It adds up the whole qty column: 20 items were sold.')),
  P(ORDERS, MC('What does this print?',`print(orders["item"].nunique())`,['4','12','5','latte'],'nunique() counts the different values: latte, muffin, tea, espresso.')),
  FILL('Count how many times each item was ordered.',`print(orders["item"].___())`,['value_counts'],'value_counts() returns each value with its count, most common first.'),
  BUG('This should select two columns, but it crashes with a KeyError.',['import pandas as pd','df = pd.DataFrame({"item": ["tea"], "price": [2.5], "qty": [1]})','small = df["item", "price"]','print(small)'],2,'Several columns need a list inside the brackets: df[["item", "price"]].'),
  P(ORDERS, CODE('Create <code>top_item</code>, the item that appears in the most orders, and <code>avg_price</code>, the mean of the price column.','',{tests:`_eq("top_item", top_item, "latte")
_close("avg_price", avg_price, 3.5417)`},'value_counts() puts the most common first, so .index[0] (or .idxmax()) gives its name. For the average: orders["price"].mean()',`top_item = orders["item"].value_counts().index[0]
avg_price = orders["price"].mean()
print(top_item, avg_price)`)),
 ]},
 {name:'Filter rows', finding:'Friday had three orders, and only two orders all week were for three or more of one item.', steps:[
  P(ORDERS, L('Keep only the rows you want','<div class="case">📋 <b>The case.</b> “Show me just Friday. And which orders were big ones?”</div><p>Filtering works like NumPy masks: a comparison on a column gives True/False per row, and putting it in brackets keeps the True rows.</p><p>Combine conditions with <code>&amp;</code> (and) or <code>|</code> (or) — and wrap <b>each condition in brackets</b>. <code>.isin([...])</code> tests against several values.</p>',`lattes = orders[orders["item"] == "latte"]
print(len(lattes))
print(orders[(orders["kind"] == "food") & (orders["qty"] >= 2)])`)),
  P(ORDERS, MC('How many rows does this keep?',`print(len(orders[orders["item"] == "latte"]))`,['5','12','4','1'],'Five of the twelve orders are lattes.')),
  P(ORDERS, MC('How many rows does this keep?',`busy = orders[(orders["kind"] == "drink") & (orders["qty"] >= 2)]
print(len(busy))`,['4','9','6','2'],'Both conditions must hold: a drink, and at least 2 of it. Four orders qualify.')),
  BUG('This filter should keep Friday orders with more than one item. It raises a ValueError.',['fri = orders["day"] == "Fri"','big = orders["qty"] > 1','result = orders[fri and big]','print(result)'],2,'Python\'s “and” can\'t compare whole columns. Use & between masks: orders[fri & big].'),
  FILL('Keep the orders from Monday or Friday.',`ends = orders[orders["day"].___(["Mon", "Fri"])]`,['isin'],'isin([...]) is True for rows whose value is anywhere in the list.'),
  P(ORDERS, CODE('Create <code>friday</code>, a DataFrame with only Friday\'s orders, and <code>big</code>, a DataFrame with the orders where qty is 3 or more.','',{tests:`_eq("number of rows in friday", len(friday), 3)
assert set(friday["day"]) == {"Fri"}, "friday should only contain Friday rows"
_eq("number of rows in big", len(big), 2)
assert big["qty"].min() >= 3, "big should only contain orders with qty of 3 or more"`},'friday = orders[orders["day"] == "Fri"] — and the same pattern with >= 3 on qty.',`friday = orders[orders["day"] == "Fri"]
big = orders[orders["qty"] >= 3]
print(friday)
print(big)`)),
 ]},
 {name:'New columns & sorting', finding:'The week brought in $70.50, and Friday\'s triple-latte order was the biggest ticket at $13.50.', steps:[
  P(ORDERS, L('Make the table say more','<div class="case">📋 <b>The case.</b> “The till gives price and quantity. I want <i>revenue</i>. Then show me the biggest order.”</div><p>Assign to a new column name to add a column. Column math is vectorized, exactly like NumPy.</p><p><code>sort_values("col")</code> reorders the rows; add <code>ascending=False</code> for largest first. <code>.iloc[0]</code> is the first row by position.</p>',`orders["revenue"] = orders["price"] * orders["qty"]
top = orders.sort_values("revenue", ascending=False)
print(top.head(3))`)),
  MC('What does this print?',`import pandas as pd
df = pd.DataFrame({"p": [2, 5], "q": [3, 1]})
df["t"] = df["p"] * df["q"]
print(df["t"].tolist())`,['[6, 5]','[10, 3]','[5, 6]','11'],'Row by row: 2 × 3 and 5 × 1.'),
  MC('What does this print?',`import pandas as pd
df = pd.DataFrame({"p": [2, 5, 3]})
print(df.sort_values("p", ascending=False)["p"].tolist())`,['[5, 3, 2]','[2, 3, 5]','[2, 5, 3]','5'],'ascending=False sorts from largest to smallest.'),
  P(ORDERS, ORD('Build a program that prints the single biggest order.',['orders["revenue"] = orders["price"] * orders["qty"]','top = orders.sort_values("revenue", ascending=False)','print(top.head(1))'],'The column has to exist before you can sort by it.')),
  P(ORDERS, CODE('Add a <code>revenue</code> column (price × qty) to <code>orders</code>. Then create <code>total</code>, the week\'s total revenue, and <code>best_item</code>, the item of the single order with the highest revenue.','',{tests:`assert "revenue" in orders.columns, 'Add the column with  orders["revenue"] = ...'
_close("total", total, 70.5)
_eq("best_item", best_item, "latte")`},'After adding the column: total = orders["revenue"].sum(). Sort by revenue with ascending=False, then take .iloc[0]["item"].',`orders["revenue"] = orders["price"] * orders["qty"]
total = orders["revenue"].sum()
best_item = orders.sort_values("revenue", ascending=False).iloc[0]["item"]
print(total, best_item)`)),
 ]},
]},

/* ------------------------------------------------------------------ cleaning */
{part:'Part 2 · Working with data', name:'Cleaning & reshaping', blurb:'Real data is messy. Fix it, group it, join it.',
 terms:[['NaN','“Not a Number” — how pandas marks a missing value.'],['isna()','True wherever a value is missing. .isna().sum() counts the gaps.'],['fillna() / dropna()','Fill the gaps with a value / throw away the rows that have gaps.'],['dtype','The type of data in a column: int64, float64, object (text) and so on.'],['.str','The doorway to text tools for a whole column: .str.strip(), .str.lower(), .str.title().'],['groupby()','Split the rows into groups, calculate something for each group, combine the answers.'],['merge()','Join two tables side by side using a column they share.'],['Pivot table','A grid summary: one column\'s values down the side, another\'s across the top.']],
 levels:[
 {name:'Missing values', finding:'One visit count was missing. Filling it with the median (2.5) keeps the row without inventing an extreme.', steps:[
  P(RAW, L('The loyalty-card mess','<div class="case">📋 <b>The case.</b> Rosa kept the loyalty-card list by hand. It has gaps, typos and repeats. “Can you make it usable?”</div><p>Missing values show up as <code>NaN</code> (or <code>None</code>). First find them, then decide: <b>drop</b> the rows, or <b>fill</b> the gaps with a sensible value such as the median.</p>',`print(raw)
print(raw.isna().sum())`)),
  MC('What does this print?',`import pandas as pd
s = pd.Series([1, None, 3])
print(s.isna().sum())`,['1','2','3','None'],'isna() is True only for the missing value; summing counts it.'),
  MC('What does this print?',`import pandas as pd
s = pd.Series([1, None, 3])
print(s.fillna(0).tolist())`,['[1.0, 0.0, 3.0]','[1, 3]','[1, None, 3]','[0, 0, 0]'],'The gap becomes 0. (The numbers are floats because a column with a missing value can\'t be whole numbers.)'),
  MC('What does this print?',`import pandas as pd
s = pd.Series([1, None, 3])
print(len(s.dropna()))`,['2','3','1','0'],'dropna() removes the missing entry, leaving two.'),
  FILL('Replace missing visits with 0.',`raw["visits"] = raw["visits"].___(0)`,['fillna'],'fillna(value) fills every gap with that value. Assign the result back to keep it.'),
  P(RAW, CODE('Create <code>missing</code>, the number of missing values in the <code>visits</code> column. Then fill those gaps with the column\'s <b>median</b> and store the result back in <code>raw["visits"]</code>.','',{tests:`_eq("missing", missing, 1)
_eq("gaps left in visits", int(raw["visits"].isna().sum()), 0)
_close("the filled-in value", raw["visits"].iloc[4], 2.5)`},'Count first: raw["visits"].isna().sum(). Then raw["visits"] = raw["visits"].fillna(raw["visits"].median())',`missing = raw["visits"].isna().sum()
raw["visits"] = raw["visits"].fillna(raw["visits"].median())
print(missing)
print(raw["visits"])`)),
 ]},
 {name:'Types & text', finding:'With names tidied and money stored as numbers, the cards add up to $67.50 spent.', steps:[
  P(RAW, L('Numbers pretending to be text','<div class="case">📋 <b>The case.</b> “Why can\'t I add up the spent column? And look at these names…”</div><p>Check <code>.dtypes</code>. A column of type <code>object</code> holds text, even if it <i>looks</i> like numbers. Convert it with <code>.astype(float)</code>.</p><p>Text columns get string tools through <code>.str</code>: <code>.str.strip()</code> removes stray spaces, <code>.str.lower()</code> / <code>.str.title()</code> fix capitals.</p>',`print(raw.dtypes)
print(raw["spent"].astype(float).sum())
print(raw["customer"].str.strip().str.title().tolist())`)),
  MC('What does this print?',`import pandas as pd
s = pd.Series(["1", "2"])
print((s + s).tolist())`,["['11', '22']",'[2, 4]','[3]','An error'],'They are text, so + glues them together. This is what a wrong dtype does silently.'),
  MC('What does this print?',`import pandas as pd
s = pd.Series(["1", "2"])
print(s.astype(int).sum())`,['3','12','2','An error'],'astype(int) turns the text into numbers, so they add up properly.'),
  MC('What does this print?',`import pandas as pd
s = pd.Series([" Bo ", "AL"])
print(s.str.strip().str.lower().tolist())`,["['bo', 'al']","[' bo ', 'al']","['Bo', 'AL']","['BO', 'AL']"],'strip() removes the spaces at the ends, lower() makes everything lowercase.'),
  FILL('Remove stray spaces from every name.',`raw["customer"] = raw["customer"].___.strip()`,['str'],'.str applies a text method to every value in the column.'),
  P(RAW, CODE('Clean two columns of <code>raw</code>. Make <code>customer</code> tidy: no stray spaces, and Title Case (like "Ben"). Convert <code>spent</code> to numbers (float).','',{tests:`_eq('raw["customer"]', raw["customer"].tolist(), ["Ana", "Ben", "Chloe", "Ana", "Dev", "Eli", "Ben"])
assert str(raw["spent"].dtype).startswith("float"), 'raw["spent"] is still ' + str(raw["spent"].dtype) + ' — convert it with .astype(float)'
_close('raw["spent"].sum()', raw["spent"].sum(), 67.5)`},'raw["customer"] = raw["customer"].str.strip().str.title() and raw["spent"] = raw["spent"].astype(float)',`raw["customer"] = raw["customer"].str.strip().str.title()
raw["spent"] = raw["spent"].astype(float)
print(raw)`)),
 ]},
 {name:'Group-by', finding:'Lattes earn $36 of the week\'s $70.50 — more than half. Rosa\'s star product is confirmed.', steps:[
  P(ORDERS, L('Split, apply, combine','<div class="case">📋 <b>The case.</b> “Which product earns us the most? And which day?”</div><p><code>groupby</code> is the most useful move in data analysis. It <b>splits</b> the rows into groups, <b>applies</b> a calculation to each, and <b>combines</b> the answers.</p><p>Read it aloud: “group by day, take qty, sum it.” The result is a Series labelled by group; <code>.idxmax()</code> gives the label of the biggest.</p><p>Also handy: <code>drop_duplicates()</code> removes repeated rows.</p>',`by_day = orders.groupby("day")["qty"].sum()
print(by_day)
print(by_day.idxmax())
chart.bar(by_day.index, by_day.values, title="Items sold per day")`)),
  MC('What does this print?',`import pandas as pd
df = pd.DataFrame({"g": ["a", "b", "a"], "v": [1, 2, 3]})
print(df.groupby("g")["v"].sum().tolist())`,['[4, 2]','[1, 2, 3]','[6]','[3, 3]'],'Group a has 1 and 3 (sum 4). Group b has 2.'),
  MC('What does this print?',`import pandas as pd
df = pd.DataFrame({"g": ["a", "b", "a"], "v": [1, 2, 3]})
print(df.groupby("g")["v"].mean()["a"])`,['2.0','4','1.5','3.0'],'The mean of group a is (1 + 3) / 2. Look up a group\'s answer by its label.'),
  MC('What does this print?',`import pandas as pd
df = pd.DataFrame({"x": [1, 1, 2]})
print(len(df.drop_duplicates()))`,['2','3','1','0'],'The repeated row is removed, leaving 1 and 2.'),
  P(ORDERS, ORD('Build a program that prints the day with the most items sold.',['by_day = orders.groupby("day")["qty"].sum()','best = by_day.idxmax()','print(best)'],'Group and sum first, then ask for the label of the largest value.')),
  P(ORDERS, CODE('Add a <code>revenue</code> column (price × qty). Then create <code>by_item</code>, the total revenue for each item, and <code>star</code>, the name of the item with the highest revenue.','',{tests:`_close('by_item["latte"]', by_item["latte"], 36.0)
_close('by_item["muffin"]', by_item["muffin"], 18.0)
_close('by_item["tea"]', by_item["tea"], 7.5)
_eq("star", star, "latte")`},'by_item = orders.groupby("item")["revenue"].sum() and star = by_item.idxmax()',`orders["revenue"] = orders["price"] * orders["qty"]
by_item = orders.groupby("item")["revenue"].sum()
star = by_item.idxmax()
print(by_item)
chart.bar(by_item.index, by_item.values, title="Revenue by item")`)),
 ]},
 {name:'Merge & pivot', finding:'After costs, the week\'s profit is $48.60 — and Thursday sold no food at all. Time for a Thursday muffin deal?', steps:[
  P(MENU, L('Two tables are better than one','<div class="case">📋 <b>The case.</b> “Revenue is nice, but what\'s our <i>profit</i>? The costs are in a different sheet.”</div><p><code>merge</code> joins two tables on a column they share. Every order row picks up the matching row from the menu.</p><p>A <b>pivot table</b> then reshapes rows into a grid — here days down the side and kinds across the top.</p>',`full = orders.merge(menu, on="item")
print(full.head(3))
print(orders.pivot_table(index="day", columns="kind", values="qty", aggfunc="sum", fill_value=0))`)),
  MC('What does this print?',`import pandas as pd
a = pd.DataFrame({"k": [1, 2], "x": ["p", "q"]})
b = pd.DataFrame({"k": [2, 1], "y": ["r", "s"]})
print(a.merge(b, on="k")["y"].tolist())`,["['s', 'r']","['r', 's']","['p', 'q']",'An error'],'Rows are matched by the key k, not by position: k=1 pairs with "s", k=2 with "r".'),
  MC('In a default merge, what happens to a row whose key has <b>no match</b> in the other table?',null,['It is left out of the result','It is kept with NaN in the new columns','pandas raises an error','It is matched to the nearest key'],'The default is an “inner” join: only keys found in both tables survive. Use how="left" to keep unmatched rows.'),
  FILL('Join the menu costs onto the orders.',`full = orders.___(menu, on="item")`,['merge'],'merge(other, on="column") joins using the shared column.'),
  P(MENU, CODE('Merge <code>orders</code> with <code>menu</code> into <code>full</code>. Add a <code>profit</code> column: (price − cost) × qty. Then create <code>total_profit</code>.','',{tests:`assert "profit" in full.columns, 'Add the column with  full["profit"] = ...'
_eq("rows in full", len(full), 12)
_close("total_profit", total_profit, 48.6)`},'full = orders.merge(menu, on="item"). Then full["profit"] = (full["price"] - full["cost"]) * full["qty"]',`full = orders.merge(menu, on="item")
full["profit"] = (full["price"] - full["cost"]) * full["qty"]
total_profit = full["profit"].sum()
print(total_profit)`)),
  P(ORDERS, CODE('Create <code>table</code>, a pivot table with each <b>day</b> as a row, each <b>kind</b> as a column, and the <b>sum of qty</b> in the cells. Days with nothing sold should show 0.','',{tests:`_eq('table.loc["Wed", "food"]', table.loc["Wed", "food"], 3)
_eq('table.loc["Thu", "food"]', table.loc["Thu", "food"], 0)
_eq('table.loc["Fri", "drink"]', table.loc["Fri", "drink"], 4)`},'orders.pivot_table(index="day", columns="kind", values="qty", aggfunc="sum", fill_value=0)',`table = orders.pivot_table(index="day", columns="kind", values="qty", aggfunc="sum", fill_value=0)
print(table)`)),
 ]},
]}
);
})();
