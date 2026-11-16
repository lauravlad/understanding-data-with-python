/* Part 1 — Python warm-up */
(function(){
const WORLDS=[
{name:'Hello, Python',blurb:'Printing, variables and simple math',levels:[
 {name:'Say hello',steps:[
  L('Your first command','<p>Python does what you tell it, one line at a time. The <code>print()</code> command shows something on the screen.</p><p>Text must go inside quotes. Python calls text a <b>string</b>.</p>','print("Hello!")\nprint("I can write many lines.")'),
  MC('What will this show on the screen?','print("Hi")',['Hi','"Hi"','print Hi','Nothing'],'The quotes mark where the text starts and ends — they are not printed.'),
  FILL('Fill in the missing command.','___("Hello, world!")',['print'],'print(...) shows whatever is inside the brackets.'),
  MC('Which line will cause an error?',null,['print("hello)','print("hello")','print(\'hello\')','print("hello", "there")'],'The string is opened with " but never closed. Every opening quote needs a matching closing quote.'),
  CODE('Make Python print exactly this sentence.','',{out:['I am learning Python!']},'Use print() with the sentence inside quotes.','print("I am learning Python!")'),
 ]},
 {name:'Variables',steps:[
  L('Naming things','<p>A <b>variable</b> is a name that remembers a value. You create one with <code>=</code>.</p><p>Read <code>score = 10</code> as “score <i>gets</i> 10”. Later you can use the name instead of the value — and change it.</p>','name = "Ada"\nscore = 10\nprint(name)\nprint(score)'),
  MC('What does this print?','x = 5\nx = x + 2\nprint(x)',['7','5','x + 2','52'],'Python works out the right side first (5 + 2), then stores 7 back in x.'),
  FILL('Store 10 in the variable score.','score ___ 10',['='],'A single = stores a value in a name.'),
  ORD('Put the lines in an order that prints “Hello, Sam”.',['name = "Sam"','greeting = "Hello, " + name','print(greeting)'],'A variable has to be created before a later line can use it.'),
  CODE('Create a variable <code>planet</code> holding the text "Mars" and a variable <code>moons</code> holding the number 2. Then print both.','',{tests:'_eq("planet", planet, "Mars")\n_eq("moons", moons, 2)\nassert "Mars" in _out and "2" in _out, "Now print both variables."'},'Text needs quotes, numbers don\'t:  planet = "Mars"','planet = "Mars"\nmoons = 2\nprint(planet)\nprint(moons)'),
 ]},
 {name:'Math & comments',steps:[
  L('Python is a calculator','<p><code>+</code> add, <code>-</code> subtract, <code>*</code> multiply, <code>/</code> divide.</p><p><code>//</code> divides and drops the remainder, <code>%</code> gives only the remainder, and <code>**</code> is “to the power of”.</p><p>Anything after <code>#</code> is a <b>comment</b>: a note for humans that Python ignores.</p>','print(7 / 2)    # 3.5\nprint(7 // 2)   # 3\nprint(7 % 2)    # 1\nprint(2 ** 3)   # 8'),
  MC('What does this print?','print(7 // 2)',['3','3.5','1','4'],'// is whole-number division: 2 fits into 7 three times.'),
  MC('What does this print?','print(2 ** 3)',['8','6','5','23'],'** means power: 2 × 2 × 2 = 8.'),
  FILL('Which operator makes this print 1 (the remainder)?','print(10 ___ 3)',['%'],'10 ÷ 3 is 3 remainder 1. % gives the remainder.'),
  CODE('A room is 8 wide and 5 high. Store its area in a variable called <code>area</code>, then print it.','width = 8\nheight = 5\n',{tests:'_eq("area", area, 40)\nassert "40" in _out, "Good — now print(area)."'},'Multiply with *:  area = width * height','width = 8\nheight = 5\narea = width * height\nprint(area)'),
 ]},
]},
{name:'Words & Types',blurb:'Strings, numbers and turning one into the other',levels:[
 {name:'Working with text',steps:[
  L('Gluing strings together','<p><code>+</code> joins strings, <code>*</code> repeats them and <code>len()</code> counts the characters.</p><p>An <b>f-string</b> lets you drop variables straight into text: put <code>f</code> before the quotes and the variable in curly braces.</p>','name = "Zoe"\nprint("Hi " + name)\nprint(f"Hi {name}, your name has {len(name)} letters")'),
  MC('What does this print?','print("ha" * 3)',['hahaha','ha3','ha ha ha','An error'],'Multiplying a string repeats it.'),
  FILL('Complete the f-string so it prints “Hi Zoe!”.','name = "Zoe"\nprint(f"Hi {___}!")',['name'],'Inside an f-string, {name} is replaced by the value of name.'),
  MC('What does this print?','print(len("python"))',['6','5','python','7'],'len() counts characters: p-y-t-h-o-n is 6.'),
  CODE('Join the two names with a space between them and store the result in <code>full</code>. Then print it.','first = "Grace"\nlast = "Hopper"\n',{tests:'_eq("full", full, "Grace Hopper")\nassert "Grace Hopper" in _out, "Now print(full)."'},'Either  first + " " + last  or an f-string:  f"{first} {last}"','first = "Grace"\nlast = "Hopper"\nfull = first + " " + last\nprint(full)'),
 ]},
 {name:'Types',steps:[
  L('Every value has a type','<p><code>int</code> — whole numbers like <code>7</code><br><code>float</code> — decimals like <code>3.5</code><br><code>str</code> — text like <code>"7"</code><br><code>bool</code> — <code>True</code> or <code>False</code></p><p><code>"7"</code> and <code>7</code> are different things! Convert with <code>int()</code>, <code>float()</code> and <code>str()</code>.</p>','print("3" + "4")        # 34  (text joined)\nprint(int("3") + 4)     # 7   (numbers added)\nprint("Age: " + str(12))'),
  MC('What does this print?','print("3" + "4")',['34','7','"3" + "4"','An error'],'Both are strings, so + glues them together.'),
  MC('What does this print?','print(int("3") + 4)',['7','34','An error','3 + 4'],'int("3") turns the text into the number 3, and 3 + 4 is 7.'),
  FILL('Text + number is an error. Convert the number to text.','age = 12\nprint("I am " + ___(age))',['str'],'str() turns a value into a string so it can be joined to other text.'),
  CODE('<code>price_text</code> is text, not a number. Create a variable <code>total</code> that is the price doubled, as a number.','price_text = "250"\n',{tests:'_eq("total", total, 500)'},'Convert first:  int(price_text) * 2','price_text = "250"\ntotal = int(price_text) * 2\nprint(total)'),
 ]},
 {name:'Inside a string',steps:[
  L('Positions and methods','<p>Each character has a position, starting at <b>0</b>. <code>word[0]</code> is the first character and <code>word[-1]</code> the last.</p><p>A <b>slice</b> <code>word[1:4]</code> takes positions 1, 2, 3 — the end is not included.</p><p>Strings also have built-in tools called <b>methods</b>: <code>.upper()</code>, <code>.lower()</code>, <code>.replace(a, b)</code>.</p>','word = "python"\nprint(word[0])        # p\nprint(word[-1])       # n\nprint(word[1:4])      # yth\nprint(word.upper())   # PYTHON'),
  MC('What does this print?','print("python"[0])',['p','y','python','0'],'Counting starts at 0, so position 0 is the first letter.'),
  MC('What does this print?','print("python"[1:4])',['yth','pyth','ytho','pyt'],'Positions 1, 2 and 3 — the slice stops before position 4.'),
  FILL('Make this print HELLO.','print("hello".___())',['upper'],'.upper() returns the string in capital letters.'),
  CODE('From <code>word</code>, create <code>first</code> (its first letter), <code>last</code> (its last letter) and <code>shout</code> (the word in capitals).','word = "adventure"\n',{tests:'_eq("first", first, "a")\n_eq("last", last, "e")\n_eq("shout", shout, "ADVENTURE")'},'word[0], word[-1] and word.upper()','word = "adventure"\nfirst = word[0]\nlast = word[-1]\nshout = word.upper()'),
 ]},
]},
{name:'Decisions',blurb:'True, False and choosing what to do',levels:[
 {name:'True or False',steps:[
  L('Asking questions','<p>Comparisons give back <code>True</code> or <code>False</code>.</p><p><code>==</code> equal &nbsp; <code>!=</code> not equal &nbsp; <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code></p><p>Careful: one <code>=</code> stores a value, two <code>==</code> compares.</p>','print(3 > 5)          # False\nprint(4 == 4)         # True\nprint("a" != "b")     # True'),
  MC('What does this print?','print(3 > 5)',['False','True','3 > 5','An error'],'3 is not greater than 5.'),
  MC('Which operator checks whether two values are equal?',null,['==','=','!=','=>'],'== compares. A single = stores a value.'),
  MC('What does this print?','print("a" == "A")',['False','True','a','An error'],'Capital and small letters are different characters.'),
  CODE('Create a variable <code>is_hot</code> that is True when the temperature is above 30. Use a comparison — don\'t just type True.','temperature = 31\n',{tests:'_eq("is_hot", is_hot, True)',need:['>']},'A comparison can be stored directly:  is_hot = temperature > 30','temperature = 31\nis_hot = temperature > 30\nprint(is_hot)'),
 ]},
 {name:'if and else',steps:[
  L('Choosing a path','<p><code>if</code> runs a block of code only when a condition is True. <code>else</code> runs when it is not.</p><p>Two rules: the line ends with a <b>colon</b>, and the block underneath is <b>indented</b> by 4 spaces. Indentation is how Python knows what belongs to the <code>if</code>.</p>','age = 15\nif age >= 13:\n    print("teen")\nelse:\n    print("kid")'),
  MC('What does this print?','x = 4\nif x > 3:\n    print("big")\nelse:\n    print("small")',['big','small','big and then small','Nothing'],'4 > 3 is True, so the if-block runs and the else-block is skipped.'),
  ORD('Build a program that prints “teen” for age 15.',['age = 15','if age >= 13:','    print("teen")','else:','    print("kid")'],'The indented lines belong to the if / else right above them.'),
  FILL('What is missing at the end of the if line?','if score > 50___\n    print("You win")',[':'],'Every if, else, for, while and def line ends with a colon.'),
  CODE('Print <code>even</code> if <code>number</code> is even, otherwise print <code>odd</code>. Use if / else.','number = 7\n',{out:['odd'],need:['if','else']},'A number is even when  number % 2 == 0','number = 7\nif number % 2 == 0:\n    print("even")\nelse:\n    print("odd")'),
 ]},
 {name:'More choices',steps:[
  L('elif, and, or, not','<p><code>elif</code> (“else if”) checks another condition when the ones above were False. Python stops at the first one that is True.</p><p>Combine conditions with <code>and</code> (both true), <code>or</code> (at least one true) and <code>not</code> (flips it).</p>','score = 75\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")'),
  MC('What does this print?','score = 95\nif score >= 90:\n    print("A")\nelif score >= 70:\n    print("B")\nelse:\n    print("C")',['A','A and then B','B','C'],'Both conditions are true for 95, but Python only runs the first matching branch.'),
  MC('What does this print?','print(True and False)',['False','True','True and False','An error'],'and needs both sides to be True.'),
  MC('What does this print?','print(5 > 3 or 2 > 9)',['True','False','5','An error'],'or needs only one side to be True, and 5 > 3 is.'),
  CODE('Set <code>greeting</code> to "Good morning" when hour is below 12, "Good afternoon" when it is below 18, and "Good evening" otherwise.','hour = 14\n',{tests:'_eq("greeting", greeting, "Good afternoon")',need:['elif']},'if hour < 12: … elif hour < 18: … else: …','hour = 14\nif hour < 12:\n    greeting = "Good morning"\nelif hour < 18:\n    greeting = "Good afternoon"\nelse:\n    greeting = "Good evening"\nprint(greeting)'),
 ]},
]},
{name:'Loops',blurb:'Doing things again and again',levels:[
 {name:'for and range',steps:[
  L('Repeat with for','<p>A <code>for</code> loop repeats its indented block once for each value.</p><p><code>range(3)</code> gives 0, 1, 2 — it starts at 0 and stops <i>before</i> 3. <code>range(1, 4)</code> gives 1, 2, 3.</p>','for i in range(3):\n    print("Lap", i)'),
  MC('What does this print (one number per line)?','for i in range(3):\n    print(i)',['0 1 2','1 2 3','0 1 2 3','3 3 3'],'range(3) starts at 0 and stops before 3.'),
  MC('Which numbers does range(1, 4) produce?',null,['1, 2, 3','1, 2, 3, 4','0, 1, 2, 3','1 and 4'],'The start is included, the end is not.'),
  FILL('Make this loop run 5 times.','for i in ___(5):\n    print("hello")',['range'],'range(5) produces five values: 0 to 4.'),
  CODE('Print the numbers 1 to 5, each on its own line. Use a for loop.','',{out:['1','2','3','4','5'],need:['for']},'range(1, 6) gives 1, 2, 3, 4, 5.','for i in range(1, 6):\n    print(i)'),
 ]},
 {name:'while',steps:[
  L('Repeat while true','<p>A <code>while</code> loop keeps going as long as its condition is True.</p><p>Something inside the loop must eventually make the condition False — otherwise it runs forever (an <b>infinite loop</b>).</p><p><code>n -= 1</code> is short for <code>n = n - 1</code>.</p>','n = 3\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("done")'),
  MC('What does this print (one per line)?','n = 3\nwhile n > 0:\n    print(n)\n    n -= 1',['3 2 1','3 2 1 0','1 2 3','3 3 3 forever'],'It stops as soon as n reaches 0, because 0 > 0 is False.'),
  ORD('Build a loop that prints “hop” three times.',['count = 0','while count < 3:','    print("hop")','    count = count + 1'],'The counter starts at 0 and grows by one each time around.'),
  MC('What happens if you delete the line that changes count?','count = 0\nwhile count < 3:\n    print("hop")',['It prints hop forever','It prints hop once','It prints nothing','It prints hop 3 times'],'count stays 0, so count < 3 is always True. That is an infinite loop.'),
  CODE('Count down from 5 to 1, one number per line, then print <code>Liftoff!</code>. Use a while loop.','',{out:['5','4','3','2','1','Liftoff!'],need:['while']},'Start with n = 5, loop while n > 0, and subtract 1 each time. Print Liftoff! after the loop (not indented).','n = 5\nwhile n > 0:\n    print(n)\n    n -= 1\nprint("Liftoff!")'),
 ]},
 {name:'Adding it up',steps:[
  L('The running total','<p>A very common pattern: start a variable at 0 before the loop, and add to it inside the loop.</p><p><code>total += i</code> is short for <code>total = total + i</code>.</p><p>A for loop can also walk through the characters of a string.</p>','total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)      # 6\n\nfor ch in "hi":\n    print(ch)'),
  MC('What does this print?','total = 0\nfor i in range(4):\n    total += i\nprint(total)',['6','4','10','0'],'0 + 1 + 2 + 3 = 6.'),
  MC('What does this print (one per line)?','for ch in "hi":\n    print(ch)',['h i','hi','hi hi','0 1'],'The loop visits one character at a time.'),
  FILL('Add i to total each time around.','total = 0\nfor i in range(5):\n    total ___ i',['+=','= total +','=total+'],'+= adds to the variable and stores the result back.'),
  CODE('Add up all the whole numbers from 1 to 100 and store the answer in <code>total</code>. Use a loop.','',{tests:'_eq("total", total, 5050)',need:['for|while']},'total = 0, then loop over range(1, 101) adding each number.','total = 0\nfor i in range(1, 101):\n    total += i\nprint(total)'),
 ]},
]},
{name:'Lists',blurb:'Keeping many values together',levels:[
 {name:'List basics',steps:[
  L('A row of boxes','<p>A <b>list</b> holds several values in order, inside square brackets.</p><p>Just like strings, positions start at 0. <code>len()</code> counts the items and <code>.append()</code> adds one to the end.</p>','fruits = ["apple", "kiwi", "plum"]\nprint(fruits[0])       # apple\nfruits.append("mango")\nprint(len(fruits))     # 4'),
  MC('What does this print?','fruits = ["apple", "kiwi", "plum"]\nprint(fruits[1])',['kiwi','apple','plum','1'],'Position 0 is apple, so position 1 is kiwi.'),
  MC('What does this print?','print(len([4, 8, 15]))',['3','27','15','2'],'len() counts how many items are in the list.'),
  FILL('Add "mango" to the end of the list.','fruits.___("mango")',['append'],'.append(x) adds x as the new last item.'),
  CODE('Create a list <code>colors</code> with any three colour names. Then use append to add "gold" at the end.','',{tests:'assert isinstance(colors, list), "colors should be a list, like [\\"red\\", \\"blue\\"]"\n_eq("len(colors)", len(colors), 4)\n_eq("the last item", colors[-1], "gold")',need:['append']},'colors = ["red", "green", "blue"] and then colors.append("gold")','colors = ["red", "green", "blue"]\ncolors.append("gold")\nprint(colors)'),
 ]},
 {name:'Looping over lists',steps:[
  L('Visit every item','<p><code>for item in my_list:</code> hands you each item in turn — no positions needed.</p><p><code>in</code> also works as a question: <code>3 in [1, 2, 3]</code> is True.</p>','for n in [2, 4, 6]:\n    print(n * 10)\n\nprint("kiwi" in ["apple", "kiwi"])   # True'),
  MC('What does this print (one per line)?','for n in [2, 4]:\n    print(n * 10)',['20 40','2 4','24 24','60'],'First n is 2 (prints 20), then n is 4 (prints 40).'),
  MC('What does this print?','print(3 in [1, 2, 3])',['True','False','3','2'],'in asks “is this value somewhere in the list?”'),
  ORD('Build a program that adds up the list and prints 15.',['nums = [3, 5, 7]','total = 0','for n in nums:','    total += n','print(total)'],'The running-total pattern again: start at 0, add inside the loop, print after the loop.'),
  CODE('Find the highest score and store it in <code>best</code>.','scores = [88, 92, 79, 95, 60]\n',{tests:'_eq("best", best, 95)'},'Start with best = scores[0]. In a loop, if a score is bigger than best, replace best. (Python also has a built-in max().)','scores = [88, 92, 79, 95, 60]\nbest = scores[0]\nfor s in scores:\n    if s > best:\n        best = s\nprint(best)'),
 ]},
 {name:'List tools',steps:[
  L('Slices and methods','<p>Slices work on lists too: <code>nums[1:3]</code> gives items 1 and 2.</p><p><code>.sort()</code> puts a list in order, <code>.pop()</code> removes and returns the last item, and <code>sum()</code>, <code>min()</code>, <code>max()</code> do what they say.</p><p>To build a new list, start with <code>[]</code> and append inside a loop.</p>','nums = [3, 1, 2]\nnums.sort()\nprint(nums)        # [1, 2, 3]\nprint(sum(nums))   # 6\n\nbig = []\nfor n in nums:\n    if n > 1:\n        big.append(n)'),
  MC('What does this print?','print([10, 20, 30, 40][1:3])',['[20, 30]','[10, 20, 30]','[20, 30, 40]','[10, 20]'],'Positions 1 and 2 — the slice stops before position 3.'),
  MC('What does this print?','nums = [3, 1, 2]\nnums.sort()\nprint(nums)',['[1, 2, 3]','[3, 1, 2]','[3, 2, 1]','None'],'.sort() rearranges the list itself, smallest first.'),
  FILL('Remove the last item from the list.','nums = [1, 2, 3]\nnums.___()',['pop'],'.pop() removes the last item and hands it back to you.'),
  CODE('Build a new list <code>warm</code> containing only the temperatures above 20, in the same order.','temps = [18, 21, 25, 19, 23]\n',{tests:'_eq("warm", warm, [21, 25, 23])'},'warm = [] first. Then loop over temps, and append t when t > 20.','temps = [18, 21, 25, 19, 23]\nwarm = []\nfor t in temps:\n    if t > 20:\n        warm.append(t)\nprint(warm)'),
 ]},
]},
{name:'Functions',blurb:'Building your own commands',levels:[
 {name:'def',steps:[
  L('Make your own command','<p><code>def</code> creates a <b>function</b>: a named block of code you can run whenever you like.</p><p>Defining a function doesn\'t run it. It runs when you <b>call</b> it by name with brackets. Values in the brackets are handed to the function\'s <b>parameters</b>.</p>','def cheer(team):\n    print("Go " + team + "!")\n\ncheer("Owls")\ncheer("Foxes")'),
  MC('What does this program print?','def greet():\n    print("hey")',['Nothing','hey','greet','An error'],'The function is defined but never called. Add greet() to run it.'),
  FILL('Which keyword starts a function definition?','___ greet(name):\n    print("Hi " + name)',['def'],'def is short for “define”.'),
  ORD('Build a program that prints “Go Owls!”.',['def cheer(team):','    print("Go " + team + "!")','cheer("Owls")'],'Define the function first, then call it. The call is not indented.'),
  CODE('Write a function <code>shout(word)</code> that prints the word followed by an exclamation mark. For example <code>shout("hey")</code> prints <code>hey!</code>','',{tests:'_eq(\'shout("hey") printing\', _printed(shout, "hey"), "hey!")\n_eq(\'shout("wow") printing\', _printed(shout, "wow"), "wow!")'},'def shout(word):  and inside it  print(word + "!")','def shout(word):\n    print(word + "!")\n\nshout("hey")'),
 ]},
 {name:'return',steps:[
  L('Giving back an answer','<p><code>print</code> only shows something on screen. <code>return</code> hands a value back to whoever called the function, so it can be stored or used in more code.</p><p>A function stops as soon as it reaches <code>return</code>. A function with no return gives back the special value <code>None</code>.</p>','def double(n):\n    return n * 2\n\nx = double(4)\nprint(x + 1)     # 9'),
  MC('What does this print?','def double(n):\n    return n * 2\n\nprint(double(4))',['8','4','n * 2','None'],'double(4) is replaced by the value it returns: 8.'),
  MC('What does a function give back if it has no return statement?',null,['None','0','An error','An empty string'],'None is Python\'s way of saying “no value”.'),
  FILL('Make the function hand back the sum.','def add(a, b):\n    ___ a + b',['return'],'return sends the result back to the caller.'),
  CODE('Write a function <code>area(w, h)</code> that returns the width times the height.','',{tests:'_eq("area(3, 4)", area(3, 4), 12)\n_eq("area(5, 5)", area(5, 5), 25)'},'Use return, not print:  return w * h','def area(w, h):\n    return w * h\n\nprint(area(3, 4))'),
 ]},
 {name:'Functions that decide',steps:[
  L('Logic inside functions','<p>Functions can contain anything you\'ve learned: ifs, loops, lists.</p><p>A parameter can have a <b>default value</b>, used when the caller leaves it out.</p>','def sign(n):\n    if n < 0:\n        return "negative"\n    return "positive"\n\ndef greet(name="friend"):\n    return "Hi " + name\n\nprint(greet())        # Hi friend\nprint(greet("Lin"))   # Hi Lin'),
  MC('What does this print?','def greet(name="friend"):\n    return "Hi " + name\n\nprint(greet())',['Hi friend','Hi','Hi name','An error'],'No value was passed in, so name takes its default: "friend".'),
  MC('What does this print?','def sign(n):\n    if n < 0:\n        return "neg"\n    return "pos"\n\nprint(sign(-2))',['neg','pos','neg and then pos','None'],'The first return ends the function, so the second one is never reached.'),
  CODE('Write a function <code>is_even(n)</code> that returns True when n is even and False when it is odd.','',{tests:'_eq("is_even(4)", is_even(4), True)\n_eq("is_even(7)", is_even(7), False)\n_eq("is_even(0)", is_even(0), True)'},'n % 2 == 0 is already True or False — you can return it directly.','def is_even(n):\n    return n % 2 == 0'),
  CODE('Write a function <code>biggest(a, b)</code> that returns the larger of the two numbers.','',{tests:'_eq("biggest(3, 9)", biggest(3, 9), 9)\n_eq("biggest(10, 2)", biggest(10, 2), 10)\n_eq("biggest(4, 4)", biggest(4, 4), 4)'},'if a > b: return a — otherwise return b.','def biggest(a, b):\n    if a > b:\n        return a\n    return b'),
 ]},
]},
{name:'Dictionaries',blurb:'Looking things up by name',levels:[
 {name:'Keys and values',steps:[
  L('A labelled collection','<p>A <b>dictionary</b> stores pairs: a <b>key</b> and its <b>value</b>, inside curly braces.</p><p>You look values up by key instead of by position, and you can add or change entries the same way.</p>','pet = {"name": "Rex", "age": 3}\nprint(pet["name"])     # Rex\npet["age"] = 4         # change\npet["color"] = "brown" # add'),
  MC('What does this print?','pet = {"name": "Rex", "age": 3}\nprint(pet["age"])',['3','age','Rex','1'],'pet["age"] looks up the value stored under the key "age".'),
  FILL('Which key makes this print Rex?','pet = {"name": "Rex", "age": 3}\nprint(pet["___"])',['name'],'"Rex" is stored under the key "name".'),
  MC('What does this print?','pet = {"name": "Rex", "age": 3}\npet["color"] = "brown"\nprint(len(pet))',['3','2','brown','4'],'Assigning to a new key adds a third pair.'),
  CODE('Create a dictionary <code>player</code> with a "name" (any text) and a "level" of 1. Then, on a new line, increase the level by 1.','',{tests:'assert isinstance(player, dict), "player should be a dictionary: {...}"\nassert isinstance(player.get("name"), str), \'player needs a "name" that is text\'\n_eq(\'player["level"]\', player.get("level"), 2)',need:['1']},'player = {"name": "Kai", "level": 1}  then  player["level"] += 1','player = {"name": "Kai", "level": 1}\nplayer["level"] += 1\nprint(player)'),
 ]},
 {name:'Looping over dictionaries',steps:[
  L('Walking through pairs','<p>A for loop over a dictionary gives you its keys. Use <code>.items()</code> to get key and value together, or <code>.values()</code> for just the values.</p><p><code>in</code> checks whether a <i>key</i> exists.</p>','prices = {"apple": 3, "bread": 4}\nfor item, cost in prices.items():\n    print(item, "costs", cost)\n\nprint("milk" in prices)   # False'),
  MC('What does this print (one per line)?','for k in {"a": 1, "b": 2}:\n    print(k)',['a b','1 2','a 1 b 2','{"a": 1}'],'Looping over a dictionary gives the keys.'),
  MC('What does this print?','print("z" in {"a": 1})',['False','True','None','An error'],'There is no key "z" in the dictionary.'),
  FILL('Get the key and the value together.','for key, value in prices.___():\n    print(key, value)',['items'],'.items() gives each pair as (key, value).'),
  CODE('Add up all the prices and store the result in <code>total</code>.','prices = {"apple": 3, "bread": 4, "milk": 2}\n',{tests:'_eq("total", total, 9)'},'Running total again: loop over prices.values() and add each one.','prices = {"apple": 3, "bread": 4, "milk": 2}\ntotal = 0\nfor cost in prices.values():\n    total += cost\nprint(total)'),
 ]},
 {name:'Counting things',steps:[
  L('The counting pattern','<p>Dictionaries are perfect for counting. <code>d.get(key, 0)</code> gives the value for the key, or 0 if the key isn\'t there yet.</p><p>Bonus tool: <code>"a b c".split()</code> breaks text into a list of words.</p>','counts = {}\nfor ch in "banana":\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts)    # {\'b\': 1, \'a\': 3, \'n\': 2}\n\nprint("to be or not".split())'),
  MC('What does this print?','d = {}\nd["x"] = d.get("x", 0) + 1\nd["x"] = d.get("x", 0) + 1\nprint(d["x"])',['2','1','0','An error'],'The first line stores 0 + 1. The second finds 1 and stores 1 + 1.'),
  ORD('Build a program that counts the letters of “banana” and prints how many a\'s there are.',['counts = {}','for ch in "banana":','    counts[ch] = counts.get(ch, 0) + 1','print(counts["a"])'],'Empty dictionary first, count inside the loop, print after it.'),
  MC('What does this print?','print("to be or not".split())',["['to', 'be', 'or', 'not']",'to be or not','4',"['to be or not']"],'.split() cuts the text at the spaces and gives a list of words.'),
  CODE('Write a function <code>count_words(text)</code> that returns a dictionary saying how many times each word appears. For example <code>count_words("a b a")</code> returns <code>{"a": 2, "b": 1}</code>.','',{tests:'_eq(\'count_words("a b a")\', count_words("a b a"), {"a": 2, "b": 1})\n_eq(\'count_words("hi")\', count_words("hi"), {"hi": 1})\n_eq(\'count_words("go go go")\', count_words("go go go"), {"go": 3})'},'Loop over text.split() and use the counting pattern, then return the dictionary.','def count_words(text):\n    counts = {}\n    for word in text.split():\n        counts[word] = counts.get(word, 0) + 1\n    return counts'),
 ]},
]},
{name:'Boss Battles',blurb:'No hints up front — just you and the code',levels:[
 {name:'The Gatekeeper',steps:[
  CODE('<b>FizzBuzz.</b> Write <code>fizzbuzz(n)</code>. Return "FizzBuzz" if n divides by both 3 and 5, "Fizz" if only by 3, "Buzz" if only by 5 — otherwise return the number as text, like "7".','',{tests:'_eq("fizzbuzz(15)", fizzbuzz(15), "FizzBuzz")\n_eq("fizzbuzz(9)", fizzbuzz(9), "Fizz")\n_eq("fizzbuzz(10)", fizzbuzz(10), "Buzz")\n_eq("fizzbuzz(7)", fizzbuzz(7), "7")\n_eq("fizzbuzz(30)", fizzbuzz(30), "FizzBuzz")'},'Check the “both” case first. n % 3 == 0 means n divides by 3. Use str(n) for the last case.','def fizzbuzz(n):\n    if n % 3 == 0 and n % 5 == 0:\n        return "FizzBuzz"\n    elif n % 3 == 0:\n        return "Fizz"\n    elif n % 5 == 0:\n        return "Buzz"\n    return str(n)'),
  CODE('Write <code>count_vowels(text)</code> that returns how many of the letters a, e, i, o, u are in the text (lowercase only is fine).','',{tests:'_eq(\'count_vowels("banana")\', count_vowels("banana"), 3)\n_eq(\'count_vowels("sky")\', count_vowels("sky"), 0)\n_eq(\'count_vowels("education")\', count_vowels("education"), 5)'},'Loop over the characters and count when  ch in "aeiou".','def count_vowels(text):\n    count = 0\n    for ch in text:\n        if ch in "aeiou":\n            count += 1\n    return count'),
  CODE('Write <code>reverse(text)</code> that returns the text backwards. <code>reverse("abc")</code> returns <code>"cba"</code>.','',{tests:'_eq(\'reverse("abc")\', reverse("abc"), "cba")\n_eq(\'reverse("Python")\', reverse("Python"), "nohtyP")\n_eq(\'reverse("")\', reverse(""), "")'},'Start with result = "". For each character, put it in front:  result = ch + result','def reverse(text):\n    result = ""\n    for ch in text:\n        result = ch + result\n    return result'),
 ]},
 {name:'The List Lord',steps:[
  CODE('Write <code>average(nums)</code> that returns the average of a list of numbers.','',{tests:'_eq("average([2, 4, 6])", average([2, 4, 6]), 4)\n_eq("average([10])", average([10]), 10)\n_eq("average([1, 2])", average([1, 2]), 1.5)'},'Add them up and divide by how many there are: len(nums).','def average(nums):\n    return sum(nums) / len(nums)'),
  CODE('Write <code>only_evens(nums)</code> that returns a new list with just the even numbers, in the same order.','',{tests:'_eq("only_evens([1, 2, 3, 4])", only_evens([1, 2, 3, 4]), [2, 4])\n_eq("only_evens([7, 9])", only_evens([7, 9]), [])\n_eq("only_evens([10, 0, 5])", only_evens([10, 0, 5]), [10, 0])'},'Empty list, loop, append when n % 2 == 0, return the list.','def only_evens(nums):\n    result = []\n    for n in nums:\n        if n % 2 == 0:\n            result.append(n)\n    return result'),
  CODE('A palindrome reads the same forwards and backwards. Write <code>is_palindrome(word)</code> that returns True or False.','',{tests:'_eq(\'is_palindrome("level")\', is_palindrome("level"), True)\n_eq(\'is_palindrome("python")\', is_palindrome("python"), False)\n_eq(\'is_palindrome("noon")\', is_palindrome("noon"), True)\n_eq(\'is_palindrome("a")\', is_palindrome("a"), True)'},'Build the reversed word (like the last battle) and compare it to the original with ==.','def is_palindrome(word):\n    backwards = ""\n    for ch in word:\n        backwards = ch + backwards\n    return word == backwards'),
 ]},
 {name:'The Final Boss',steps:[
  CODE('Write <code>password_ok(pw)</code>. A password is OK when it has at least 8 characters <b>and</b> contains at least one digit.','',{tests:'_eq(\'password_ok("sunshine7")\', password_ok("sunshine7"), True)\n_eq(\'password_ok("sunshine")\', password_ok("sunshine"), False)\n_eq(\'password_ok("abc1")\', password_ok("abc1"), False)\n_eq(\'password_ok("12345678")\', password_ok("12345678"), True)'},'Loop over the characters and remember whether any is in "0123456789". Then combine with len(pw) >= 8.','def password_ok(pw):\n    has_digit = False\n    for ch in pw:\n        if ch in "0123456789":\n            has_digit = True\n    return len(pw) >= 8 and has_digit'),
  CODE('Write <code>most_common(items)</code> that returns the item that appears most often in the list.','',{tests:'_eq(\'most_common(["a", "b", "a"])\', most_common(["a", "b", "a"]), "a")\n_eq("most_common([3, 3, 7, 7, 7])", most_common([3, 3, 7, 7, 7]), 7)\n_eq(\'most_common(["x"])\', most_common(["x"]), "x")'},'Count with a dictionary first. Then loop over the dictionary\'s items and keep the key with the highest count.','def most_common(items):\n    counts = {}\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n    best = None\n    best_count = 0\n    for item, count in counts.items():\n        if count > best_count:\n            best = item\n            best_count = count\n    return best'),
  CODE('Write <code>multiples_sum(limit)</code> that returns the sum of all whole numbers below <code>limit</code> that divide by 3 or by 5. <code>multiples_sum(10)</code> is 3 + 5 + 6 + 9 = 23.','',{tests:'_eq("multiples_sum(10)", multiples_sum(10), 23)\n_eq("multiples_sum(1000)", multiples_sum(1000), 233168)\n_eq("multiples_sum(3)", multiples_sum(3), 0)'},'Running total over range(limit), adding n when n % 3 == 0 or n % 5 == 0.','def multiples_sum(limit):\n    total = 0\n    for n in range(limit):\n        if n % 3 == 0 or n % 5 == 0:\n            total += n\n    return total'),
 ]},
]},
];
const W = WORLDS;
CHAPTERS.push(
 {part:'Part 1 · Python warm-up', name:'Values & variables', blurb:'Printing, naming things, numbers and text', levels:[...W[0].levels, ...W[1].levels],
  terms:[['print()','Shows a value on the screen.'],['String','Text, written inside quotes: "hello".'],['Variable','A name that remembers a value. Created with a single =.'],['int / float','Whole numbers / numbers with a decimal point.'],['f-string','Text with variables dropped in: f"Hi {name}".'],['Index','A position in a string or list. Counting starts at 0.'],['Slice','A piece cut out by position: word[1:4] takes positions 1, 2, 3.'],['Method','A tool attached to a value, called with a dot: "hi".upper().']]},
 {part:'Part 1 · Python warm-up', name:'Decisions & loops', blurb:'True or False, if / else, for and while', levels:[...W[2].levels, ...W[3].levels],
  terms:[['Boolean','A value that is either True or False.'],['==','Compares two values. (A single = stores a value instead.)'],['if / elif / else','Runs different blocks of code depending on conditions. Only the first matching branch runs.'],['Indentation','The 4 spaces that show which lines belong to an if, loop or function.'],['for loop','Repeats a block once for each value in a sequence.'],['range(n)','The numbers 0 up to, but not including, n.'],['while loop','Repeats a block as long as a condition stays True.'],['Running total','Start a variable at 0 before a loop, add to it inside the loop.']]},
 {part:'Part 1 · Python warm-up', name:'Lists, functions & dictionaries', blurb:'Collections of values and your own commands', levels:[...W[4].levels, ...W[5].levels, ...W[6].levels],
  terms:[['List','An ordered collection in square brackets: [3, 5, 7].'],['.append(x)','Adds x to the end of a list.'],['in','Asks whether a value is inside a collection: 3 in [1, 2, 3].'],['Function','A named block of code, created with def and run by calling it.'],['Parameter','A variable in a function\'s brackets that receives a value when the function is called.'],['return','Hands a value back from a function to the code that called it.'],['Dictionary','Pairs of key and value in curly braces: {"name": "Rex"}.'],['.get(key, default)','Looks up a key, giving the default if the key is missing.']]},
 {part:'Part 1 · Python warm-up', name:'Python checkpoint', blurb:'Boss battles: prove the basics before the data arrives', boss:true, levels:W[7].levels, terms:[]}
);
})();
