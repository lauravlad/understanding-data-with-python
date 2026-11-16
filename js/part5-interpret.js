/* Part 5 — Interpreting data: how to read numbers, charts, tests and models without fooling yourself. */
(function(){
const SHOPS = `import pandas as pd
shops = pd.DataFrame({
    "shop":       ["Riverton", "Oakdale", "Hillside"],
    "customers":  [3000, 500, 1200],     # customers served last month
    "complaints": [30, 10, 18],          # complaints received last month
})`;

const TIPS = `import pandas as pd
tips = pd.DataFrame({
    "barista": ["Ana", "Ana", "Ben", "Ben"],
    "shift":   ["morning", "evening", "morning", "evening"],
    "orders":  [80, 20, 20, 80],     # orders served
    "tipped":  [24, 12, 5, 44],      # how many of those left a tip
})`;

const RATINGS = `import pandas as pd
ratings = pd.DataFrame({
    "item":  ["seasonal special"] * 2 + ["latte"] * 8 + ["tea"] * 6 + ["muffin"] * 7,
    "stars": [5, 5,
              5, 4, 5, 4, 5, 4, 5, 4,
              4, 3, 4, 4, 3, 4,
              4, 5, 4, 4, 5, 4, 4],
})`;

const LINE = `import numpy as np
temp = np.array([14, 16, 19, 21, 23, 26, 28, 31])    # afternoon temperature, in degrees C
iced = np.array([8, 11, 15, 18, 24, 27, 33, 38])     # iced drinks sold that afternoon
slope, intercept = np.polyfit(temp, iced, 1)          # the regression line from Part 4`;

const ALARM = `import numpy as np
# 20 reviews: 1 = a real complaint, 0 = fine
y_true = np.array([1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
# what the complaint detector said
y_pred = np.array([1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])`;

CHAPTERS.push(
{part:'Part 5 · Interpreting data', name:'Reading data wisely', blurb:'What a result does — and does not — let you say',
 terms:[['Absolute vs relative change','“40 more cups” vs “10% more”. A big percentage of a small number can be a small thing.'],['Percentage points','The plain difference between two percentages: 10% to 12% is 2 points (and a 20% relative rise).'],['Rate','A count divided by how many it could have been. Compare rates, not raw counts, when group sizes differ.'],['Truncated axis','A chart axis that doesn\'t start at zero, making small differences look dramatic.'],['Simpson\'s paradox','A trend that appears in every group but reverses when the groups are lumped together.'],['Selection bias','When the data you have was not collected fairly from the group you care about.'],['Survivorship bias','Studying only the ones that made it, and missing everything the failures could tell you.'],['Small-sample noise','Averages built on a handful of values swing wildly. Check the count before trusting a mean.'],['Effect size','How big a difference is — the thing that decides whether it matters.'],['Statistical vs practical significance','“Unlikely to be chance” is not the same as “large enough to care about”.'],['Multiple comparisons','Test enough things and something will look significant by luck alone.'],['Extrapolation','Using a model outside the range of the data it learned from. Often nonsense.'],['Baseline','The score of the laziest possible model. A real model must beat it.'],['Precision','Of the cases the model flagged, the share that were truly positive.'],['Recall','Of the truly positive cases, the share the model caught.']],
 levels:[
 {name:'Numbers in context', finding:'Oakdale has the fewest complaints but the worst complaint rate: 2 in every 100 customers. That is the shop that needs a visit.', steps:[
  L('Compared to what?','<div class="case">📋 <b>The case.</b> Rosa now owns three shops and reads numbers all day. “Riverton had 30 complaints! Oakdale only 10. Should I be worried about Riverton?”</div><p>A number on its own means nothing. Before reacting, ask three questions:</p><p><b>Out of how many?</b> Turn counts into <b>rates</b>.<br><b>Compared to what?</b> Last month, the other shops, the usual wobble.<br><b>Relative or absolute?</b> “Up 50%” can mean 2 → 3.</p><p>And when percentages themselves change, say <b>percentage points</b>: 10% → 12% is 2 points, even though it is a 20% relative rise.</p>',`muffins_before, muffins_after = 2, 3
lattes_before, lattes_after = 200, 220
print("muffins: +", muffins_after - muffins_before, "  +", (muffins_after / muffins_before - 1) * 100, "%")
print("lattes:  +", lattes_after - lattes_before, " +", round((lattes_after / lattes_before - 1) * 100), "%")`),
  MC('A sign says “Tea sales doubled!” Tea went from 3 cups to 6. Lattes went from 400 to 440. Which change matters more for the till?',null,['Lattes: 40 more cups','Tea: it grew by 100%','They matter equally','Neither can be judged'],'Doubling a tiny number is still a tiny number. Always look at the absolute change next to the percentage.'),
  MC('The share of customers who tip rose from 10% to 12%. Which description is correct?',null,['Up 2 percentage points, a 20% relative increase','Up 2%','Up 12%','Up 20 percentage points'],'The gap between the two percentages is 2 points. Relative to where it started (10), that is a 20% rise. Good reports say which one they mean.'),
  MC('Shop A had 30 complaints from 3000 customers. Shop B had 10 complaints from 500 customers. Which shop has the bigger complaint problem?',null,['Shop B: 2% of its customers complained','Shop A: it had three times as many complaints','They are the same','It cannot be known'],'A is 30 / 3000 = 1%. B is 10 / 500 = 2%. Raw counts mostly measure how big a shop is.'),
  MC('A bar chart shows satisfaction of 96 and 98, and the second bar looks twice as tall. What should you check first?',null,['Whether the axis starts at zero','Whether the bars are the right colour','Whether 98 is a prime number','Nothing — the chart proves a big gap'],'A truncated axis stretches small differences. Read the numbers on the axis before trusting the picture.'),
  P(SHOPS, CODE('Add a <code>rate</code> column to <code>shops</code>: complaints per 100 customers. Then create <code>worst</code>, the name of the shop with the highest rate.','',{tests:`assert "rate" in shops.columns, 'Add the column with  shops["rate"] = ...'
_eq('shops["rate"]', shops["rate"].tolist(), [1.0, 2.0, 1.5])
_eq("worst", worst, "Oakdale")`},'shops["rate"] = shops["complaints"] / shops["customers"] * 100. Then sort by rate (largest first) and take .iloc[0]["shop"].',`shops["rate"] = shops["complaints"] / shops["customers"] * 100
worst = shops.sort_values("rate", ascending=False).iloc[0]["shop"]
print(shops)
print(worst)
chart.bar(shops["shop"], shops["rate"], title="Complaints per 100 customers")`)),
 ]},
 {name:'Simpson\'s paradox', finding:'Ben\'s overall tip rate is higher only because he works evenings, when everyone tips more. Shift for shift, Ana earns more tips. The total was hiding the truth.', steps:[
  P(TIPS, L('When the total lies','<div class="case">📋 <b>The case.</b> “Ben gets tipped on 49% of his orders, Ana on only 36%. I\'m giving Ben the bonus.” Before she does, you split the numbers by shift.</div><p>Something strange can happen when you lump groups together: a pattern that holds in <i>every</i> group <b>reverses</b> in the total. This is <b>Simpson\'s paradox</b>.</p><p>It happens when a hidden factor (here, the shift) affects the outcome <i>and</i> the groups are unevenly spread across it. Run the example and compare the two tables.</p>',`totals = tips.groupby("barista")[["orders", "tipped"]].sum()
print(totals["tipped"] / totals["orders"])          # overall
tips["rate"] = tips["tipped"] / tips["orders"]
print(tips.pivot_table(index="barista", columns="shift", values="rate"))   # by shift`)),
  MC('Ana has the higher tip rate in the morning <b>and</b> in the evening, yet Ben is higher overall. How is that possible?',null,['Ben works mostly evenings, when customers tip more','The table must contain a mistake','Ben is the better barista after all','Percentages cannot be compared'],'Evening customers tip at about twice the morning rate. Ben\'s total is mostly evening orders; Ana\'s is mostly morning ones.'),
  MC('Which comparison is the fair one for deciding who is better at earning tips?',null,['Compare them within the same shift','Compare their overall rates','Compare their total number of tips','Compare how many orders each served'],'Like must be compared with like. The shift is a confounder, so hold it fixed.'),
  MC('Hospital A has a higher overall death rate than Hospital B. What must you know before calling A the worse hospital?',null,['Whether A treats sicker patients','Which hospital is larger','Which hospital is older','Nothing — the rates settle it'],'If A takes the hardest cases, it can be better for every type of patient and still look worse in total. Same paradox, higher stakes.'),
  P(TIPS, CODE('Show Rosa both views. Add a <code>rate</code> column (tipped ÷ orders) to <code>tips</code>. Create <code>overall</code>, each barista\'s overall tip rate (total tipped ÷ total orders, labelled by barista). Then set <code>better</code> to the name of the barista who is better shift for shift.','',{tests:`_eq('tips["rate"]', tips["rate"].tolist(), [0.3, 0.6, 0.25, 0.55])
_close('overall["Ana"]', overall["Ana"], 0.36, 0.001)
_close('overall["Ben"]', overall["Ben"], 0.49, 0.001)
assert better in ("Ana", "Ben"), 'better should be "Ana" or "Ben"'
assert better == "Ana", "Compare the rate column shift by shift: who is higher in the morning? And in the evening?"`},'totals = tips.groupby("barista")[["orders", "tipped"]].sum(), then overall = totals["tipped"] / totals["orders"]. Print tips to compare the rate column within each shift.',`tips["rate"] = tips["tipped"] / tips["orders"]
totals = tips.groupby("barista")[["orders", "tipped"]].sum()
overall = totals["tipped"] / totals["orders"]
better = "Ana"
print(tips)
print(overall)`)),
 ]},
 {name:'Who is missing?', finding:'The “5-star” seasonal special has only two ratings. The latte, at 4.5 stars from eight people, is the one you can actually trust.', steps:[
  L('The data you don\'t have','<div class="case">📋 <b>The case.</b> “Online we\'re at 2.1 stars. But the cards people fill in at the counter say 4.3! Which is true?”</div><p>Every dataset is a <i>sample</i> of something. Always ask <b>how did these rows get here — and who never made it in?</b></p><p><b>Selection bias</b>: the people in your data differ from the people you care about. Online reviewers are mostly the furious and the thrilled.<br><b>Survivorship bias</b>: you only see the ones that lasted.<br><b>Small samples</b>: an average of two values can be anything. Look at the <b>count</b> beside every mean.</p>'),
  MC('Online reviews come mostly from people who were very angry or very delighted. What does that make the online average?',null,['A biased picture of the typical customer','An accurate picture of all customers','Useless for any purpose','Too low by exactly the same amount every time'],'This is selection bias: who chooses to write a review is not random. The reviews are still useful — just not as an estimate of the typical experience.'),
  MC('To learn what makes cafés succeed, a magazine studies 50 cafés that are still open after ten years. What is the flaw?',null,['It ignores the cafés that closed, which may have done the very same things','Fifty is too few to study','Ten years is too short','Cafés cannot be compared with each other'],'Survivorship bias. If the failures also had cosy sofas and loyalty cards, those things explain nothing.'),
  MC('Item A has 5.0 stars from 2 ratings. Item B has 4.6 stars from 300 ratings. Which is the safer bet to feature on the menu?',null,['Item B','Item A','They are equally safe','Neither can be judged'],'Two ratings could be the owner\'s cousins. Three hundred ratings pin the average down.'),
  MC('A customer survey is handed out only on weekday mornings. Who is missing?',null,['Evening and weekend customers','Nobody — a survey is a survey','Customers who dislike coffee','The baristas'],'If evening customers are a different crowd with different wishes, the survey cannot speak for them.'),
  P(RATINGS, CODE('Find the item to feature. Create <code>summary</code>, a table with the <b>mean</b> and <b>count</b> of stars for each item. Create <code>naive_best</code>, the item with the highest mean. Then create <code>trusted</code>, the item with the highest mean <b>among items with at least 5 ratings</b>.','',{tests:`_eq("naive_best", naive_best, "seasonal special")
_eq("trusted", trusted, "latte")
_eq('summary.loc["latte", "count"]', int(summary.loc["latte", "count"]), 8)
_close('summary.loc["latte", "mean"]', summary.loc["latte", "mean"], 4.5)`},'summary = ratings.groupby("item")["stars"].agg(["mean", "count"]). Then summary["mean"].idxmax(), and the same on summary[summary["count"] >= 5].',`summary = ratings.groupby("item")["stars"].agg(["mean", "count"])
naive_best = summary["mean"].idxmax()
enough = summary[summary["count"] >= 5]
trusted = enough["mean"].idxmax()
print(summary)
print(naive_best, "vs", trusted)`)),
 ]},
 {name:'Significant or important?', finding:'With no real difference at all, about 1 experiment in 20 still rang the alarm. One “significant” syrup out of twenty is exactly what luck looks like.', steps:[
  L('Two different questions','<div class="case">📋 <b>The case.</b> “I tested twenty new syrups against the old one. Hazelnut came out significant, p = 0.04! Order a pallet?”</div><p>A small p-value answers one question: <i>could this be chance?</i> It does <b>not</b> answer: <i>is it big enough to matter?</i> For that you need the <b>effect size</b> — and a sense of what a difference is worth.</p><p>Two traps:</p><p><b>Huge samples</b> make trivial differences “significant”.<br><b>Many tests</b> guarantee false alarms: at the 0.05 level, about 1 in 20 tests of <i>nothing</i> will look like something. This is the <b>multiple comparisons</b> problem.</p><p>The cure is cheap: re-test the winner on <b>fresh data</b>.</p>'),
  MC('With a million customers, a new cup colour raises average spend by 1 cent, p = 0.001. What is the sensible reading?',null,['Probably real, but too small to matter','A major discovery','Probably chance','The test was done wrong'],'Statistically significant, practically irrelevant. Huge samples can detect differences nobody should care about.'),
  MC('Rosa tested 20 syrups and exactly one came out with p = 0.04. What should she conclude?',null,['It may well be a false alarm — test hazelnut again on new data','Hazelnut is proven to be better','All twenty syrups are better','The other nineteen are proven to be worse'],'With 20 tests at the 0.05 level you expect about one “significant” result from luck alone.'),
  MC('A trial with only 8 customers shows a large improvement, p = 0.03. Best next step?',null,['Treat it as promising and repeat it with more customers','Announce it as fact','Throw it away as meaningless','Lower the price immediately'],'Small studies that cross the line are the ones most likely not to hold up. Replication is how you find out.'),
  MC('What should always be reported next to a p-value?',null,['How big the difference is, with a plausible range','The name of the software used','The number of decimal places','Nothing — the p-value is the result'],'“Waits fell by 0.8 minutes (roughly 0.4 to 1.2)” tells the reader what to expect. “p < 0.05” alone does not.'),
  CODE('See false alarms for yourself. Each experiment below compares two groups drawn from the <b>same</b> distribution, so there is no real difference. An “alarm” is a gap between the means bigger than 0.51 (about where p = 0.05 sits for groups this size). Create <code>alarms</code>, the number of the 1000 experiments that raise one, and <code>rate</code>, that count as a fraction.',`import numpy as np
rng = np.random.default_rng(11)
alarms = 0
for i in range(1000):
    a = rng.normal(5, 1, 30)
    b = rng.normal(5, 1, 30)
    gap = abs(a.mean() - b.mean())
    # count this experiment if gap is bigger than 0.51

`,{tests:`assert alarms > 0, "alarms is still 0 — add 1 to it whenever gap > 0.51"
_close("rate", rate, alarms / 1000, 0.00001)
assert 0.02 < rate < 0.09, f"rate should land near 0.05, but yours is {rate}"`,need:['if']},'Inside the loop: if gap > 0.51: alarms += 1. After the loop: rate = alarms / 1000',`import numpy as np
rng = np.random.default_rng(11)
alarms = 0
for i in range(1000):
    a = rng.normal(5, 1, 30)
    b = rng.normal(5, 1, 30)
    gap = abs(a.mean() - b.mean())
    if gap > 0.51:
        alarms += 1
rate = alarms / 1000
print(alarms, rate)`),
 ]},
 {name:'Reading a model', finding:'The complaint detector is “85% accurate” — but always answering “fine” scores 80%, and it misses half of the real complaints. Not ready yet.', steps:[
  P(LINE, L('What a line can and cannot say','<div class="case">📋 <b>The case.</b> Rosa has your models pinned to the wall. “Your line says that at 0 degrees I sell <i>minus eighteen</i> iced drinks. Explain.”</div><p>Three rules for reading a fitted line:</p><p><b>The slope is an average tendency.</b> “Each extra degree goes with about 1.8 more drinks” — on average, not every day.<br><b>Stay inside the data.</b> The line was learned from 14° to 31°. Beyond that is <b>extrapolation</b>, and the model has no idea.<br><b>A prediction is an estimate.</b> Say “about 27, give or take a few”, never “27”.</p>',`print(round(slope, 2), round(intercept, 1))
print("at 0 degrees: ", round(slope * 0 + intercept))
print("at 25 degrees:", round(slope * 25 + intercept))
print("at 45 degrees:", round(slope * 45 + intercept))
chart.scatter(temp, iced, line=(slope, intercept), title="Only trust the line where there are dots")`)),
  MC('The intercept is about −18: “minus eighteen iced drinks at 0°”. What is the right response?',null,['The line is only meaningful between about 14° and 31°, where the data is','The model is broken and must be thrown away','Iced drinks really are returned on cold days','The intercept should be rounded up to 0'],'Nothing is wrong with the model. Zero degrees is simply far outside what it has seen.'),
  MC('The slope is 1.8 drinks per degree. Which sentence states it honestly?',null,['On average, a day one degree warmer goes with about 1.8 more iced drinks','Every extra degree sells exactly 1.8 more drinks','Heat is the only thing that sells iced drinks','1.8% of sales are caused by temperature'],'A slope describes the average pattern in the data, with scatter around it — and it is an association, measured on only eight days.'),
  P(ALARM, L('Is this classifier any good?','<p>Accuracy alone can flatter a model. If only 1 review in 5 is a complaint, a “model” that always answers <i>fine</i> is 80% accurate and completely useless. That lazy score is the <b>baseline</b> — the number to beat.</p><p>Then look at the two kinds of mistake separately:</p><p><b>Precision</b> — of the reviews it <i>flagged</i>, how many were real complaints?<br><b>Recall</b> — of the <i>real complaints</i>, how many did it catch?</p><p>Which one matters more depends on which mistake costs more.</p>',`print("accuracy:", (y_true == y_pred).mean())
print("real complaints:", y_true.sum(), " flagged:", y_pred.sum())
print("caught:", ((y_true == 1) & (y_pred == 1)).sum())`)),
  MC('95% of reviews are fine. A detector that is 95% accurate has achieved…',null,['Possibly nothing: always answering “fine” also scores 95%','An excellent result','A result that is 95% better than guessing','Perfect recall'],'Accuracy must be compared with the baseline. When one class dominates, the baseline is already high.'),
  MC('Rosa wants to answer <b>every</b> complaint, and doesn\'t mind reading a few harmless reviews by mistake. Which number should she care about most?',null,['Recall','Precision','Accuracy','The intercept'],'Recall is the share of real complaints that get caught. A missed complaint is her expensive mistake.'),
  P(ALARM, CODE('Judge the complaint detector. Create <code>baseline</code>, the accuracy of always predicting 0. Create <code>precision</code>, the share of flagged reviews that are real complaints, and <code>recall</code>, the share of real complaints that were flagged.','',{tests:`_close("baseline", baseline, 0.8, 0.001)
_close("precision", precision, 2 / 3, 0.001)
_close("recall", recall, 0.5, 0.001)`},'caught = ((y_true == 1) & (y_pred == 1)).sum(). Then precision = caught / y_pred.sum() and recall = caught / y_true.sum(). The baseline is (y_true == 0).mean().',`baseline = (y_true == 0).mean()
caught = ((y_true == 1) & (y_pred == 1)).sum()
precision = caught / y_pred.sum()
recall = caught / y_true.sum()
print(baseline, precision, recall)`)),
 ]},
 {name:'The honest report', finding:'Rosa frames your checklist and hangs it by the till. The numbers were never the hard part — saying exactly what they mean is.', steps:[
  L('Seven questions before you speak','<div class="case">📋 <b>The last case.</b> Rosa is presenting to investors and wants your findings on one page. Every sentence must be true <i>and</i> not misleading.</div><p>Run every finding through this checklist:</p><p>1. <b>Compared to what?</b> A number needs a reference point.<br>2. <b>Out of how many?</b> Rates, not raw counts.<br>3. <b>Who is missing?</b> How did the data get collected?<br>4. <b>Could a third thing explain it?</b> Split by the obvious suspects.<br>5. <b>Could it be chance?</b> How much data, how much wobble?<br>6. <b>Is it big enough to matter?</b> Effect size, in real units.<br>7. <b>How sure are we?</b> Give a range and say what would change your mind.</p><p>In each question that follows, pick the sentence that belongs in the report.</p>'),
  MC('Loyalty-card holders spend 30% more per visit than other customers.',null,['Card holders spend more per visit; we cannot yet say the card is the reason, since keen customers are the ones who sign up','The loyalty card makes customers spend 30% more','Giving everyone a card will raise revenue by 30%','Customers without a card dislike the café'],'The first sentence reports the fact and flags the confounder. The others claim a cause that the data cannot show.'),
  MC('The espresso machine trial: ten customers timed on each machine.',null,['The new machine cut the average wait by about 0.8 minutes; with 10 customers each, a gap this size is very unlikely to be chance','The new machine is proven to be 15% faster for every customer','The new machine has a p-value of 0.0004','The old machine is broken'],'It gives the effect in real units, the size of the sample, and how sure we are — in words a reader can use.'),
  MC('Friday had the highest sales in the one week of orders you analysed.',null,['Friday was the busiest day that week; more weeks are needed before calling it a pattern','Friday is always the busiest day','Sales depend on the day of the week','Fridays cause people to buy coffee'],'One week is one data point per weekday. Say what you saw and what it would take to be sure.'),
  MC('The regression predicts 27 iced drinks for a 25° afternoon.',null,['Expect roughly 27 iced drinks, give or take several — the estimate rests on eight afternoons','Exactly 27 iced drinks will be sold','Temperature explains all iced-drink sales','At 50° the café will sell 71 iced drinks'],'A prediction with its uncertainty and its evidence. The last option also extrapolates far beyond the data.'),
  MC('Online reviews average 2.1 stars; counter cards average 4.3.',null,['The two sources reach different customers, so neither alone shows the typical experience','Customers are unhappy: the true score is 2.1','Customers are happy: the true score is 4.3','The true score is the midpoint, 3.2'],'Both samples are selected in different ways. Naming that is more honest than picking a favourite or splitting the difference.'),
 ]},
]}
);
})();
