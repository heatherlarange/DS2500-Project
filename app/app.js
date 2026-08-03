/* Free-Kick Success Map - interactive environment
 *
 * Renders the attacking half of a pitch (StatsBomb 120x80 coordinate frame,
 * goal at the top) and, on click, drops a marker and opens a stat tile.
 *
 * The tile shows LIVE geometry computed from the click (distance + angle to
 * goal). The data slots (success rate, shots, goals, nearest scorer) are left
 * empty on purpose - they get filled from data/field_stats.json once you run
 * src/build_field_data.py. See README for the wiring step.
 */

// --- pitch geometry (StatsBomb units: 1 unit = 1 yard) ---
const M = 6;          // margin (units) around the drawn half
const GOAL = { x: 120, y: 40 };
const POST_A = { x: 120, y: 36 };
const POST_B = { x: 120, y: 44 };
const YARD_TO_M = 0.9144;

const svg = document.getElementById("pitch");
const SVGNS = "http://www.w3.org/2000/svg";

// pitch coords (px 60..120 length, py 0..80 width) -> svg user coords
function toSvg(px, py) {
  return [M + py, M + (120 - px)];
}
// svg user coords -> pitch coords
function toPitch(sx, sy) {
  const py = clamp(sx - M, 0, 80);
  const px = clamp(120 - (sy - M), 60, 120);
  return [px, py];
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function el(name, attrs) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
function lineTo(g, p1, p2, cls) {
  const [x1, y1] = toSvg(p1[0], p1[1]);
  const [x2, y2] = toSvg(p2[0], p2[1]);
  g.appendChild(el("line", { x1, y1, x2, y2, class: cls }));
}
function rectPitch(g, xa, ya, xb, yb, cls) {
  const [sx1, sy1] = toSvg(xb, ya);   // xb is the larger length (closer to goal / top)
  const w = Math.abs(yb - ya);
  const h = Math.abs(xb - xa);
  g.appendChild(el("rect", { x: sx1, y: sy1, width: w, height: h, class: cls, rx: 0.2 }));
}

// --- draw the half-pitch ---
function drawPitch() {
  const g = el("g", {});
  // grass base + mowing stripes
  const [gx, gy] = toSvg(120, 0);
  g.appendChild(el("rect", { x: gx, y: gy, width: 80, height: 60, class: "grass", rx: 1 }));
  for (let i = 0; i < 6; i++) {
    const [sx, sy] = toSvg(120 - i * 10, 0);
    g.appendChild(el("rect", {
      x: sx, y: sy, width: 80, height: 10,
      class: i % 2 === 0 ? "stripe-a" : "stripe-b"
    }));
  }
  // outer boundary of the shown half
  rectPitch(g, 60, 0, 120, 80, "pline");
  // halfway line is the bottom edge; center-circle arc bulging into the half
  {
    const [ax, ay] = toSvg(60, 30);
    const [bx, by] = toSvg(60, 50);
    g.appendChild(el("path", { d: `M ${ax} ${ay} A 10 10 0 0 1 ${bx} ${by}`, class: "pline" }));
    const [cx, cy] = toSvg(60, 40);
    g.appendChild(el("circle", { cx, cy, r: 0.5, class: "pdot" }));
  }
  // penalty box (102..120 length, 18..62 width) and 6-yard box
  rectPitch(g, 102, 18, 120, 62, "pline");
  rectPitch(g, 114, 30, 120, 50, "pline");
  // penalty spot
  {
    const [sx, sy] = toSvg(108, 40);
    g.appendChild(el("circle", { cx: sx, cy: sy, r: 0.5, class: "pdot" }));
  }
  // penalty arc (D) outside the box
  {
    const [ax, ay] = toSvg(102, 32);
    const [bx, by] = toSvg(102, 48);
    g.appendChild(el("path", { d: `M ${ax} ${ay} A 10 10 0 0 1 ${bx} ${by}`, class: "pline" }));
  }
  // goal frame on the goal line
  {
    const [sx, sy] = toSvg(120, 36);
    g.appendChild(el("rect", { x: sx, y: sy - 1.6, width: 8, height: 1.6, class: "goal" }));
  }
  svg.appendChild(g);
}

// --- geometry helpers ---
function distanceM(px, py) {
  return Math.hypot(GOAL.x - px, GOAL.y - py) * YARD_TO_M;
}
function angleDeg(px, py) {
  const ax = POST_A.x - px, ay = POST_A.y - py;
  const bx = POST_B.x - px, by = POST_B.y - py;
  const dot = ax * bx + ay * by;
  const cross = ax * by - ay * bx;
  return Math.abs(Math.atan2(Math.abs(cross), dot) * 180 / Math.PI);
}

// --- optional data hook (populated later by build_field_data.py) ---
let FIELD_DATA = null;
fetch("field_stats.json")
  .then(r => r.ok ? r.json() : null)
  .then(d => { if (d && d.cells && Object.keys(d.cells).length) FIELD_DATA = d; })
  .catch(() => { /* no data yet - tile stays in empty state */ });

function lookupCell(px, py) {
  if (!FIELD_DATA) return null;
  const b = FIELD_DATA.bin_size;
  const ix = Math.floor((px - FIELD_DATA.x_min) / b);
  const iy = Math.floor((py - FIELD_DATA.y_min) / b);
  return FIELD_DATA.cells[`${ix}_${iy}`] || null;
}

// --- marker + tile ---
const markerLayer = el("g", { id: "marker-layer" });
const tile = document.getElementById("tile");

function placeMarker(px, py) {
  markerLayer.replaceChildren();
  const [sx, sy] = toSvg(px, py);
  markerLayer.appendChild(el("circle", { cx: sx, cy: sy, r: 1.6, class: "marker-ring" }));
  markerLayer.appendChild(el("circle", { cx: sx, cy: sy, r: 0.9, class: "marker-dot" }));
  if (!markerLayer.isConnected) svg.appendChild(markerLayer);
}

function setValue(id, text, empty) {
  const node = document.getElementById(id);
  node.textContent = text;
  node.classList.toggle("is-empty", !!empty);
}

function showTile(px, py, clientX, clientY) {
  // live geometry
  setValue("statDist", distanceM(px, py).toFixed(1) + " m");
  setValue("statAngle", angleDeg(px, py).toFixed(0) + " deg");
  document.getElementById("tileCoord").textContent =
    `pitch x ${px.toFixed(0)}, y ${py.toFixed(0)}`;

  // data slots (empty until field_stats.json is generated)
  const cell = lookupCell(px, py);
  if (cell) {
    setValue("statRate", (cell.rate * 100).toFixed(1) + "%");
    setValue("statShots", String(cell.shots));
    setValue("statGoals", String(cell.goals));
    const s = cell.nearest_scorer;
    setValue("statScorer", s ? `${s.player}` : "none in range", !s);
    document.getElementById("tileNote").textContent =
      cell.nearest_scorer
        ? `Nearest goal from x ${cell.nearest_scorer.x}, y ${cell.nearest_scorer.y}.`
        : "No scored free kick recorded in this area.";
  } else {
    ["statRate", "statShots", "statGoals", "statScorer"].forEach(id => setValue(id, "--", true));
    document.getElementById("tileNote").textContent =
      "Data slots ready. Run src/build_field_data.py to fill them from freekicks_all.csv.";
  }

  // position the tile near the click, clamped inside the stage
  const stage = document.querySelector(".stage");
  const sb = stage.getBoundingClientRect();
  tile.hidden = false;
  const tw = tile.offsetWidth, th = tile.offsetHeight;
  let left = clientX - sb.left + 14;
  let top = clientY - sb.top + 14;
  left = clamp(left, 8, sb.width - tw - 8);
  top = clamp(top, 8, sb.height - th - 8);
  tile.style.left = left + "px";
  tile.style.top = top + "px";
}

function handleClick(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  const [px, py] = toPitch(p.x, p.y);
  placeMarker(px, py);
  showTile(px, py, e.clientX, e.clientY);
}

svg.addEventListener("click", handleClick);
document.querySelector(".tile__close").addEventListener("click", () => {
  tile.hidden = true;
  markerLayer.replaceChildren();
});

drawPitch();
