/* Shared building blocks for lesson content. Each part file pushes chapters onto CHAPTERS. */
const CHAPTERS = [];

/* Step constructors */
const L    = (title, body, code) => ({t:'learn', title, body, code});
const MC   = (q, code, opts, why) => ({t:'mc', q, code, opts, why});              // opts[0] is the correct one
const FILL = (q, code, answers, why) => ({t:'fill', q, code, answers, why});      // code contains ___
const ORD  = (q, lines, why) => ({t:'order', q, lines, why});
const BUG  = (q, lines, bad, why) => ({t:'bug', q, lines, bad, why});            // bad = index of the faulty line
const CODE = (q, starter, check, hint, sol) => ({t:'code', q, starter, check, hint, sol});
/* Attach setup code (a dataset) that runs before the learner's code */
const P = (pre, step) => Object.assign(step, {pre});

const RANKS = [[0,'Newcomer'],[150,'Bean Counter'],[500,'Table Tamer'],[1000,'Data Wrangler'],[1700,'Stat Sleuth'],[2500,'Model Maker'],[3300,'Data Scientist']];
const XP = {mc:10, fill:10, bug:10, order:15, code:25, learn:0};
