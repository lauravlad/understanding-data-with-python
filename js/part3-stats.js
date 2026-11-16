/* Part 3 — Statistics: one big chapter, from averages to hypothesis tests. */
(function(){
const WAITS = `import numpy as np
waits = np.array([2, 3, 3, 4, 4, 4, 5, 5, 6, 7, 8, 21])   # minutes each customer waited`;

const SCORES = `import numpy as np
scores = np.array([70, 72, 68, 75, 71, 69, 73, 74, 70, 98])   # taste-test scores for ten coffee beans`;

const TEMPS = `import numpy as np
temp = np.array([14, 16, 19, 21, 23, 26, 28, 31])    # afternoon temperature, in degrees C
iced = np.array([8, 11, 15, 18, 24, 27, 33, 38])     # iced drinks sold that afternoon`;

const SAMPLE = `import numpy as np
rng = np.random.default_rng(3)
sample = rng.normal(5, 1.5, 40).round(1)   # wait times of 40 randomly chosen customers`;

const MACHINES = `import numpy as np
old = np.array([5.1, 6.0, 4.8, 5.5, 6.2, 5.9, 5.4, 6.1, 5.0, 5.7])   # waits with the old machine
new = np.array([4.6, 5.0, 4.2, 5.1, 4.9, 4.4, 5.3, 4.7, 4.5, 4.8])   # waits with the new machine
rng = np.random.default_rng(0)`;

CHAPTERS.push(
{part:'Part 3 · Statistics', name:'Statistics', blurb:'What the numbers really say — and how sure you can be',
 terms:[['Mean','The sum divided by the count. Pulled around by extreme values.'],['Median','The middle value when sorted. Barely moved by extreme values.'],['Outlier','A value far from the rest. Worth investigating before trusting an average.'],['Standard deviation','The typical distance of values from the mean. Bigger means more spread out.'],['IQR','Interquartile range: Q3 − Q1, the width of the middle half of the data.'],['Normal distribution','The bell curve. About 68% of values lie within 1 standard deviation of the mean, 95% within 2.'],['z-score','How many standard deviations a value is from the mean: (x − mean) / sd.'],['Correlation (r)','A number from −1 to 1 measuring how closely two things follow a straight line together.'],['Confounder','A hidden third thing that drives two others, making them look related.'],['Sample','The part of a population you actually measured.'],['Standard error','How much a sample mean typically wobbles: sd / √n.'],['Bootstrap','Resampling your own sample, with replacement, many times to see how uncertain an estimate is.'],['Confidence interval','A range of plausible values for the true answer, such as the middle 95% of bootstrap results.'],['Null hypothesis','The boring explanation: nothing is going on, any difference is just chance.'],['p-value','How often chance alone would produce a result at least as extreme as yours. Small means chance is a poor explanation.']],
 levels:[
 {name:'The middle', finding:'The “average” wait is 6 minutes, but the typical customer waits 4.5. One 21-minute disaster was dragging the mean up.', steps:[
  P(WAITS, L('Which average?','<div class="case">📋 <b>The case.</b> A review says “waited forever.” Rosa asks: “How long do people actually wait?”</div><p>The <b>mean</b> adds everything up and divides by the count. The <b>median</b> is the middle value when sorted.</p><p>They agree when data is balanced. When there is an <b>outlier</b> — one value far from the rest — the mean gets dragged towards it and the median hardly notices.</p><p>Always <i>look</i> first: <code>chart.hist</code> draws a histogram.</p>',`print(np.mean(waits))
print(np.median(waits))
chart.hist(waits, bins=10, title="Wait times (minutes)")`)),
  MC('What does this print?',`import numpy as np
print(np.mean([1, 2, 3, 10]))`,['4.0','2.5','3.0','16'],'(1 + 2 + 3 + 10) / 4 = 4. Notice that 4 is bigger than three of the four values.'),
  MC('What does this print?',`import numpy as np
print(np.median([1, 2, 3, 10]))`,['2.5','4.0','3','2'],'With an even count, the median is halfway between the two middle values: 2 and 3.'),
  MC('One customer waited 21 minutes. If you delete that one value, which number changes more?',null,['The mean','The median','Both change by the same amount','Neither changes'],'The mean uses every value\'s size, so one extreme value moves it a lot. The median only cares about order.'),
  FILL('Get the middle value.',`typical = np.___(waits)`,['median'],'np.median sorts the values and returns the middle one.'),
  P(WAITS, CODE('Create <code>mean_wait</code> and <code>median_wait</code>. Then set <code>typical</code> to the text "mean" or "median" — whichever better describes what a typical customer experiences here.','',{tests:`_close("mean_wait", mean_wait, 6.0)
_close("median_wait", median_wait, 4.5)
assert typical in ("mean", "median"), 'typical should be the text "mean" or "median"'
assert typical == "median", "Look at the data: 11 of the 12 customers waited 8 minutes or less. Which number is closer to their experience?"`},'np.mean(waits) and np.median(waits). One 21-minute wait is pulling one of them upward.',`mean_wait = np.mean(waits)
median_wait = np.median(waits)
typical = "median"
print(mean_wait, median_wait)`)),
 ]},
 {name:'Spread', finding:'The middle half of customers wait between 3.75 and 6.25 minutes. The 21-minute wait is a statistical outlier — a one-off, not the norm.', steps:[
  P(WAITS, L('How spread out?','<div class="case">📋 <b>The case.</b> “Okay, 4.5 minutes typically. But how <i>consistent</i> are we?”</div><p>Two cafés can share an average and feel completely different. <b>Spread</b> tells them apart.</p><p><b>Standard deviation</b> (<code>np.std</code>) is the typical distance from the mean. <b>Quartiles</b> cut sorted data into quarters: Q1 is the 25% mark, Q3 the 75% mark, and <b>IQR</b> = Q3 − Q1 is the width of the middle half.</p><p>A common rule: anything above Q3 + 1.5 × IQR (or below Q1 − 1.5 × IQR) is an <b>outlier</b>.</p>',`print(np.std(waits))
q1, q3 = np.percentile(waits, [25, 75])
print(q1, q3, q3 - q1)`)),
  MC('Which list has the larger standard deviation?',null,['[1, 9, 1, 9]','[5, 5, 5, 5]','They are the same','It cannot be known without a calculator'],'Both have mean 5, but in the first every value sits 4 away from it. In the second the distance is 0.'),
  MC('What does this print?',`import numpy as np
print(np.std([2, 4, 4, 4, 5, 5, 7, 9]))`,['2.0','5.0','40','7'],'The mean is 5 and the squared distances average to 4, whose square root is 2.'),
  MC('What does this print?',`import numpy as np
print(np.percentile([1, 2, 3, 4, 5], 50))`,['3.0','2.5','50','5'],'The 50th percentile is the median.'),
  FILL('When your data is a <b>sample</b> from something bigger, statisticians divide by n − 1 instead of n. Which argument does that?',`spread = np.std(sample, ___=1)`,['ddof'],'ddof=1 gives the “sample” standard deviation. It is slightly larger, to make up for a sample underestimating the true spread.'),
  P(WAITS, CODE('Create <code>q1</code> and <code>q3</code> (the 25th and 75th percentiles of <code>waits</code>), <code>iqr</code>, and <code>outliers</code>: an array of the waits above Q3 + 1.5 × IQR.','',{tests:`_close("q1", q1, 3.75)
_close("q3", q3, 6.25)
_close("iqr", iqr, 2.5)
_eq("outliers", outliers, [21])`},'q1, q3 = np.percentile(waits, [25, 75]). Then a mask: waits[waits > q3 + 1.5 * iqr]',`q1, q3 = np.percentile(waits, [25, 75])
iqr = q3 - q1
outliers = waits[waits > q3 + 1.5 * iqr]
print(q1, q3, iqr, outliers)`)),
 ]},
 {name:'Bell curves & z-scores', finding:'Nine beans score within one standard deviation of each other. The tenth, at 98, is nearly three standard deviations out — worth a premium price.', steps:[
  L('The shape of data','<div class="case">📋 <b>The case.</b> A supplier sends ten beans with taste scores. “Is any of them genuinely special, or are they all about the same?”</div><p>Lots of real measurements pile up in a <b>bell curve</b> — the <b>normal distribution</b>. It is described by just a mean and a standard deviation (sd).</p><p>The rule of thumb: about <b>68%</b> of values fall within 1 sd of the mean, <b>95%</b> within 2, and <b>99.7%</b> within 3.</p><p>A <b>z-score</b> says how many sds a value is from the mean: <code>z = (x − mean) / sd</code>. Beyond ±2 is unusual.</p>',`import numpy as np
rng = np.random.default_rng(1)
heights = rng.normal(170, 10, 5000)    # mean 170, sd 10
print(heights.mean().round(1), heights.std().round(1))
chart.hist(heights, bins=30, title="5000 simulated heights")`),
  MC('Scores have mean 100 and standard deviation 15. What is the z-score of 130?',null,['2.0','30','1.3','0.5'],'(130 − 100) / 15 = 2. It is two standard deviations above the mean.'),
  MC('In a normal distribution, roughly what share of values lies within <b>1</b> standard deviation of the mean?',null,['68%','50%','95%','99.7%'],'68 – 95 – 99.7 for 1, 2 and 3 standard deviations.'),
  MC('A value has a z-score of −2.5. What does that tell you?',null,['It is unusually far below the mean','It is slightly above the mean','It is a negative number','It is a mistake in the data'],'Negative means below the mean, and 2.5 standard deviations is further out than about 99% of values.'),
  P(SCORES, CODE('Create <code>z</code>, an array with the z-score of every bean (use <code>scores.mean()</code> and <code>scores.std()</code>). Then create <code>special</code>, an array of the scores whose z-score is above 2.','',{tests:`_close("the mean of z", z.mean(), 0.0)
_close("z of the last bean", z[-1], 2.9, 0.2)
_eq("special", special, [98])`},'z = (scores - scores.mean()) / scores.std(). Then a mask: scores[z > 2]',`z = (scores - scores.mean()) / scores.std()
special = scores[z > 2]
print(z.round(2))
print(special)`)),
  CODE('Test the 68% rule yourself. The starter simulates 10,000 heights with mean 170 and sd 10. Create <code>share</code>, the fraction of them between 160 and 180.',`import numpy as np
rng = np.random.default_rng(7)
heights = rng.normal(170, 10, 10000)
`,{tests:`assert 0 < share <= 1, "share should be a fraction between 0 and 1"
assert 0.66 < share < 0.70, f"share should come out near 0.68, but yours is {share}"`},'Build a mask with two conditions joined by &, then take its .mean() — the mean of True/False values is the fraction that are True.',`import numpy as np
rng = np.random.default_rng(7)
heights = rng.normal(170, 10, 10000)
share = ((heights > 160) & (heights < 180)).mean()
print(share)`),
 ]},
 {name:'Correlation', finding:'Temperature and iced-drink sales move together almost perfectly (r ≈ 0.99). Rosa can stock ice by the weather forecast.', steps:[
  P(TEMPS, L('Do two things move together?','<div class="case">📋 <b>The case.</b> “I swear we sell more iced drinks on hot days. Am I imagining it?”</div><p>Start with a <b>scatter plot</b>: one dot per day. Then measure it with the <b>correlation coefficient r</b>:</p><p><b>+1</b> perfect upward line · <b>0</b> no straight-line link · <b>−1</b> perfect downward line</p><p>One warning that never gets old: <b>correlation is not causation</b>. Two things can move together because a hidden third thing — a <b>confounder</b> — drives both.</p>',`chart.scatter(temp, iced, title="Temperature vs iced drinks")
r = np.corrcoef(temp, iced)[0, 1]
print(round(r, 3))`)),
  MC('Two variables have r = −0.9. What does that mean?',null,['When one goes up, the other reliably goes down','They are barely related','One causes the other to shrink','90% of the data is negative'],'The sign gives the direction, the size gives the strength. It says nothing about cause.'),
  MC('Two variables have r close to 0. What can you conclude?',null,['There is no straight-line relationship','There is no relationship of any kind','One of them never changes','The data is wrong'],'r only measures straight-line patterns. A perfect U-shape can have r = 0 — which is why you plot first.'),
  MC('Across summer weeks, ice cream sales and sunburn cases are strongly correlated. What is the best explanation?',null,['Hot sunny weather drives both','Ice cream causes sunburn','Sunburn makes people buy ice cream','It must be a coincidence'],'Weather is the confounder: it raises both, so they move together without either causing the other.'),
  FILL('Compute the correlation between x and y.',`r = np.___(x, y)[0, 1]`,['corrcoef'],'np.corrcoef returns a small grid of correlations; position [0, 1] is x with y.'),
  P(TEMPS, CODE('Create <code>r</code>, the correlation between <code>temp</code> and <code>iced</code>. Then create <code>strong</code>: True if r is above 0.8, using a comparison.','',{tests:`_close("r", r, float(np.corrcoef(temp, iced)[0, 1]), 0.001)
_eq("strong", bool(strong), True)`,need:['>']},'r = np.corrcoef(temp, iced)[0, 1] and then strong = r > 0.8',`r = np.corrcoef(temp, iced)[0, 1]
strong = r > 0.8
print(r, strong)
chart.scatter(temp, iced, title="Temperature vs iced drinks")`)),
 ]},
 {name:'Samples & uncertainty', finding:'From 40 customers you can say the true average wait is very likely between about 4.4 and 5.5 minutes. An honest answer comes with a range.', steps:[
  L('You never see everyone','<div class="case">📋 <b>The case.</b> You timed 40 customers. Rosa asks, “So what\'s our average wait — for <i>all</i> customers?”</div><p>The 40 are a <b>sample</b>; all customers are the <b>population</b>. A different 40 would give a slightly different mean. The typical size of that wobble is the <b>standard error</b>: <code>sd / √n</code>. Bigger samples wobble less.</p><p>The <b>bootstrap</b> lets you <i>see</i> the wobble: draw a new sample <i>from your sample</i> (with replacement), take its mean, repeat thousands of times. The middle 95% of those means is a <b>95% confidence interval</b>.</p>',`import numpy as np
rng = np.random.default_rng(2)
population = rng.normal(5, 1.5, 100000)
small = [rng.choice(population, 10).mean() for i in range(2000)]
large = [rng.choice(population, 100).mean() for i in range(2000)]
print(round(np.std(small), 3), round(np.std(large), 3))
chart.hist(small, bins=30, title="Means of samples of 10")
chart.hist(large, bins=30, title="Means of samples of 100")`),
  MC('You can time 20 customers or 500 customers. What is the main benefit of the bigger sample?',null,['Its mean is likely to be closer to the true mean','Its mean will be larger','It removes the need for a median','It proves what causes long waits'],'More data means less wobble in the estimate — not a different answer, a more trustworthy one.'),
  MC('Wait times have sd = 10. For a sample of n = 25, what is the standard error of the mean?',null,['2.0','0.4','10','250'],'sd / √n = 10 / 5 = 2.'),
  MC('A 95% confidence interval for the mean wait is 4.5 to 5.5 minutes. What does it mean?',null,['The true average wait is plausibly somewhere in that range','95% of customers wait between 4.5 and 5.5 minutes','The mean is exactly 5.0','There is a 5% chance the data is wrong'],'It is about the average, not about individual customers. Individual waits are far more spread out than that.'),
  P(SAMPLE, CODE('Bootstrap a confidence interval. Create <code>means</code>, a list of 2000 bootstrap means: each one is the mean of <code>rng.choice(sample, size=len(sample))</code>. Then create <code>low</code> and <code>high</code>, the 2.5th and 97.5th percentiles of <code>means</code>.',`means = []
for i in range(2000):
    resample = rng.choice(sample, size=len(sample))
    # add the mean of resample to the list

`,{tests:`_eq("the number of bootstrap means", len(means), 2000)
assert low < sample.mean() < high, "The sample's own mean should fall between low and high."
assert 0.4 < high - low < 1.6, f"The interval should be roughly 1 minute wide, but yours is {high - low:.2f} wide."`},'Inside the loop: means.append(resample.mean()). After it: low, high = np.percentile(means, [2.5, 97.5])',`means = []
for i in range(2000):
    resample = rng.choice(sample, size=len(sample))
    means.append(resample.mean())
low, high = np.percentile(means, [2.5, 97.5])
print(round(low, 2), round(high, 2))
chart.hist(means, bins=30, title="2000 bootstrap means")`)),
 ]},
 {name:'Is it real?', finding:'Shuffling the labels 5,000 times almost never produces a gap as big as 0.82 minutes. The new machine really is faster — keep it.', steps:[
  P(MACHINES, L('Signal or luck?','<div class="case">📋 <b>The case.</b> Rosa is trialling a new espresso machine. Ten customers were timed with each. “The new one looks faster. Is it — or did we just get lucky?”</div><p>A <b>hypothesis test</b> plays devil\'s advocate. Assume the <b>null hypothesis</b>: the machine makes <i>no</i> difference. Then ask how often pure chance would produce a gap as big as the one you saw. That frequency is the <b>p-value</b>.</p><p>A <b>permutation test</b> does it by brute force: if the machine doesn\'t matter, the labels “old” and “new” are meaningless — so shuffle all 20 times, deal them into two fake groups, and measure the gap. Repeat thousands of times.</p><p>By convention, <b>p below 0.05</b> counts as evidence of a real effect.</p>',`observed = old.mean() - new.mean()
print(round(observed, 2))
both = np.concatenate([old, new])
rng.shuffle(both)
print(round(both[:10].mean() - both[10:].mean(), 2))   # one fake gap`)),
  MC('In this trial, what is the <b>null hypothesis</b>?',null,['The machine makes no difference to wait times','The new machine is faster','The old machine is faster','The sample is too small'],'The null is always the “nothing is going on” story. The test asks how well that story survives the data.'),
  MC('The test gives p = 0.002. How do you read that?',null,['If the machine made no difference, a gap this big would appear about 0.2% of the time','There is a 0.2% chance the new machine is faster','The new machine is 0.2% faster','99.8% of customers will be served faster'],'A p-value is about how surprising the data is if the null were true. Very surprising means the null is a poor explanation.'),
  MC('A different trial gives p = 0.40. What is the right conclusion?',null,['Not enough evidence — a gap like this happens easily by chance','The machines are proven to be identical','The new machine is 40% likely to be better','The experiment was done wrong'],'A large p-value means “can\'t tell”, not “no difference”. A bigger sample might still reveal one.'),
  P(MACHINES + `
observed = old.mean() - new.mean()
both = np.concatenate([old, new])`, ORD('Put the permutation test in order. <code>observed</code> and <code>both</code> already exist.',['count = 0','for i in range(5000):','    rng.shuffle(both)','    fake = both[:10].mean() - both[10:].mean()','    if fake >= observed:','        count += 1','p = count / 5000'],'Shuffle, measure the fake gap, count how often it beats the real one — then turn the count into a fraction.')),
  P(MACHINES, CODE('Run the test. Create <code>observed</code> (mean of <code>old</code> minus mean of <code>new</code>). Shuffle 5000 times and create <code>p</code>, the fraction of shuffles whose fake gap is at least as large as <code>observed</code>. Finally create <code>real</code>: True if p is below 0.05.',`observed = old.mean() - new.mean()
both = np.concatenate([old, new])
count = 0
for i in range(5000):
    rng.shuffle(both)
    # measure the fake gap and count it if it is >= observed

`,{tests:`_close("observed", observed, 0.82, 0.001)
assert 0 <= p <= 1, "p should be a fraction between 0 and 1"
assert p < 0.01, f"p should come out tiny here (well under 0.01), but yours is {p}"
_eq("real", bool(real), True)`},'fake = both[:10].mean() - both[10:].mean(), then if fake >= observed: count += 1. After the loop: p = count / 5000 and real = p < 0.05',`observed = old.mean() - new.mean()
both = np.concatenate([old, new])
count = 0
for i in range(5000):
    rng.shuffle(both)
    fake = both[:10].mean() - both[10:].mean()
    if fake >= observed:
        count += 1
p = count / 5000
real = p < 0.05
print(observed, p, real)`)),
 ]},
]}
);
})();
