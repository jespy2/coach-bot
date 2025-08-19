const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;

// Required env
if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}

// Controls
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY_OVERDUE = process.env.ONLY_OVERDUE === "1";

// Dates
// PROGRAM_START_DATE is your canonical program start (YYYY-MM-DD).
// OVERRIDE_START_DATE lets you temporarily re-anchor (e.g., to today) without changing the canonical env.
const PROGRAM_START_DATE = process.env.PROGRAM_START_DATE || null;
const OVERRIDE_START_DATE = process.env.OVERRIDE_START_DATE || null;

// Comma-separated YYYY-MM-DD lists
const OFF_DATES = (process.env.OFF_DATES || "").split(",").map(s=>s.trim()).filter(Boolean);
const EXTRA_WORK_DATES = (process.env.EXTRA_WORK_DATES || "").split(",").map(s=>s.trim()).filter(Boolean);

// Helpers
const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const todayISO = new Date().toISOString().slice(0,10);

function parseISO(s){ const d = new Date(s+"T00:00:00Z"); if (isNaN(+d)) throw new Error("Bad date: "+s); return d; }
function fmt(d){ return d.toISOString().slice(0,10); }

function isWeekend(d) {
  const wd = d.getUTCDay(); // 0 Sun..6 Sat
  return wd === 0 || wd === 6;
}

function isOffDate(iso){
  return OFF_DATES.includes(iso);
}
function isExtraWorkDate(iso){
  return EXTRA_WORK_DATES.includes(iso);
}

/**
 * Return the start-of-week block (anchor) for a given week number (1-based) relative to startDate.
 * We advance by (week-1)*7 days from the anchor startDate.
 */
function startOfWeekFrom(startDateISO, weekNum) {
  const start = parseISO(startDateISO);
  const d = new Date(start.getTime() + (weekNum - 1) * 7 * 86400000);
  return fmt(d);
}

/**
 * Picks the next valid work day given a starting date, skipping weekends and OFF_DATES,
 * but allowing EXTRA_WORK_DATES (even if they fall on a weekend/off).
 */
function nextWorkDay(fromISO) {
  let d = parseISO(fromISO);
  while (true) {
    const iso = fmt(d);
    const weekend = isWeekend(d) && !isExtraWorkDate(iso); // allow extra-work weekend
    if (!weekend && !isOffDate(iso)) return iso;
    d = new Date(d.getTime() + 86400000);
  }
}

/**
 * Given a week number and an index within that week (0..N-1), compute a due date:
 * Start at the week's anchor day, then assign sequentially to valid work days.
 */
function dueDateForWeekIndex(startDateISO, weekNum, indexInWeek) {
  // Anchor for the week (could be any day; we still enforce business-day placement)
  let anchor = startOfWeekFrom(startDateISO, weekNum);
  // Move forward indexInWeek valid work days
  let iso = anchor;
  for (let i=0; i<=indexInWeek; i++) {
    if (i === 0) {
      // ensure anchor itself is a valid work day, otherwise find next
      iso = nextWorkDay(anchor);
    } else {
      // take next valid day after current iso
      const d = new Date(parseISO(iso).getTime() + 86400000);
      iso = nextWorkDay(fmt(d));
    }
  }
  return iso;
}

async function gql(q, v={}) {
  while (true) {
    const res = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({ query:q, variables:v })});
    let j;
    try { j = await res.json(); } catch(e) {
      console.error("Linear non-JSON response:", await res.text());
      throw e;
    }
    if (j.errors) {
      const rate = j.errors.some(e => String(e?.extensions?.type||e?.extensions?.code||"").toLowerCase().includes("rate"));
      console.error("Linear GraphQL errors:", JSON.stringify(j.errors, null, 2));
      if (rate) { console.warn("Rate limited; backing off 1500ms…"); await sleep(1500); continue; }
      throw new Error("GraphQL error");
    }
    return j.data;
  }
}

// Pull ALL open issues with week-* label
async function fetchOpenIssuesWithWeeks() {
  const q = `
    query($tid:ID!, $after:String) {
      issues(
        first: 250, after: $after, orderBy: createdAt,
        filter:{
          team:{ id:{ eq:$tid } },
          state:{ name:{ nin:["Done","Canceled","Duplicate"] } },
          labels:{ some:{ name:{ startsWith:"week-" } } }
        }
      ){
        nodes{
          id number title dueDate
          createdAt
          labels{ nodes{ name } }
        }
        pageInfo{ hasNextPage endCursor }
      }
    }`;
  const all = [];
  let after = null;
  while (true) {
    const d = await gql(q, { tid: TEAM, after });
    all.push(...d.issues.nodes);
    if (!d.issues.pageInfo?.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
    await sleep(120);
  }
  return all;
}

function getWeekNum(labels){
  const week = labels.find(l => l.startsWith("week-"));
  if (!week) return null;
  const n = Number(week.replace("week-",""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function setDueDate(issueId, dateISO) {
  const m = `mutation($id:String!, $d:TimelessDate){
    issueUpdate(id:$id, input:{ dueDate:$d }){ success }
  }`;
  const r = await gql(m, { id: issueId, d: dateISO });
  return r.issueUpdate.success;
}

(async function main(){
  const startAnchor = OVERRIDE_START_DATE || PROGRAM_START_DATE || todayISO;
  console.log(`Start anchor = ${startAnchor}${OVERRIDE_START_DATE ? " (override)" : PROGRAM_START_DATE ? " (program)" : " (today)"}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startAnchor)) {
    console.error("Bad start date. Use YYYY-MM-DD for PROGRAM_START_DATE or OVERRIDE_START_DATE.");
    process.exit(1);
  }

  if (OFF_DATES.length) console.log("OFF_DATES =", OFF_DATES.join(", "));
  if (EXTRA_WORK_DATES.length) console.log("EXTRA_WORK_DATES =", EXTRA_WORK_DATES.join(", "));
  if (ONLY_OVERDUE) console.log("ONLY_OVERDUE = true (will only adjust items due before today)");

  const issues = await fetchOpenIssuesWithWeeks();
  console.log(`Found ${issues.length} open issues with week-* labels.`);

  // Group by week, sort stably by createdAt then number
  const groups = new Map(); // weekNum -> array of issues
  for (const it of issues) {
    const labels = (it.labels?.nodes || []).map(n=>n.name);
    const w = getWeekNum(labels);
    if (!w) continue;
    if (!groups.has(w)) groups.set(w, []);
    groups.get(w).push(it);
  }
  for (const [w, arr] of groups) {
    arr.sort((a,b)=>{
      const ca = new Date(a.createdAt).getTime();
      const cb = new Date(b.createdAt).getTime();
      if (ca !== cb) return ca - cb;
      return (a.number||0) - (b.number||0);
    });
  }

  let changed = 0;
  for (const [weekNum, arr] of [...groups.entries()].sort((a,b)=>a[0]-b[0])) {
    console.log(`Week ${weekNum}: ${arr.length} items`);
    for (let i=0; i<arr.length; i++) {
      const it = arr[i];
      const target = dueDateForWeekIndex(startAnchor, weekNum, i);
      const current = it.dueDate || "(none)";
      const shouldChange = ONLY_OVERDUE ? (!!it.dueDate && it.dueDate < todayISO) : true;

      if (!shouldChange) {
        // skip if we're respecting ONLY_OVERDUE and this isn't overdue
        continue;
      }

      if (current === target) continue;

      if (DRY_RUN) {
        console.log(`DRY_RUN #${it.number}: "${it.title}"  ${current} -> ${target}`);
      } else {
        const ok = await setDueDate(it.id, target);
        if (ok) {
          changed++;
          console.log(`Updated #${it.number}: ${current} -> ${target}`);
        } else {
          console.warn(`Failed to update #${it.number}`);
        }
        await sleep(120); // be gentle on API
      }
    }
  }

  console.log(DRY_RUN ? "Done (dry run)." : `Done. Updated ${changed} due dates.`);
})();
