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
  g.appendChild(el("rect", { x: sx1, y: sy1, width: w, height: h, class: cls }));
}

// --- draw the half-pitch ---
// Real dimensions (yards): 18-yard box 44 wide, 6-yard box 20 wide, penalty
// spot 12 from goal, centre circle r10, goal 8 wide, corner arcs r1.
function drawPitch() {
  // defs: goal netting + turf shading
  const defs = el("defs", {});
  const net = el("pattern", {
    id: "netmesh", width: 0.7, height: 0.7, patternUnits: "userSpaceOnUse"
  });
  net.appendChild(el("path", {
    d: "M0 0 L0.7 0.7 M0.7 0 L0 0.7",
    stroke: "rgba(255,255,255,0.30)", "stroke-width": 0.07, fill: "none"
  }));
  defs.appendChild(net);

  const shade = el("radialGradient", { id: "turfshade", cx: "50%", cy: "18%", r: "95%" });
  shade.appendChild(el("stop", { offset: "0%", "stop-color": "#ffffff", "stop-opacity": 0.09 }));
  shade.appendChild(el("stop", { offset: "62%", "stop-color": "#000000", "stop-opacity": 0 }));
  shade.appendChild(el("stop", { offset: "100%", "stop-color": "#000000", "stop-opacity": 0.24 }));
  defs.appendChild(shade);
  svg.appendChild(defs);

  const g = el("g", {});
  const [gx, gy] = toSvg(120, 0);

  // turf: 5-yard mowing bands, low contrast so the white lines stay dominant
  g.appendChild(el("rect", { x: gx, y: gy, width: 80, height: 60, class: "grass" }));
  for (let i = 0; i < 12; i++) {
    const [sx, sy] = toSvg(120 - i * 5, 0);
    g.appendChild(el("rect", {
      x: sx, y: sy, width: 80, height: 5,
      class: i % 2 === 0 ? "stripe-a" : "stripe-b"
    }));
  }
  g.appendChild(el("rect", { x: gx, y: gy, width: 80, height: 60, fill: "url(#turfshade)" }));

  // goal: netting behind the line, then posts and crossbar on top
  {
    const [sx, sy] = toSvg(120, 36);          // left post, on the goal line
    g.appendChild(el("rect", { x: sx, y: sy - 2.2, width: 8, height: 2.2, fill: "url(#netmesh)" }));
    g.appendChild(el("rect", { x: sx, y: sy - 2.2, width: 8, height: 2.2, class: "goalframe" }));
  }

  // outer boundary (goal line at top, halfway line at bottom, two touchlines)
  rectPitch(g, 60, 0, 120, 80, "pline");

  // corner arcs, 1 yard, at both goal-line corners
  g.appendChild(el("path", { d: "M 6 7 A 1 1 0 0 0 7 6", class: "pline" }));
  g.appendChild(el("path", { d: "M 85 6 A 1 1 0 0 0 86 7", class: "pline" }));

  // centre circle: semicircle bulging into this half, plus the centre spot
  {
    const [ax, ay] = toSvg(60, 30);
    const [bx, by] = toSvg(60, 50);
    g.appendChild(el("path", { d: `M ${ax} ${ay} A 10 10 0 0 1 ${bx} ${by}`, class: "pline" }));
    const [cx, cy] = toSvg(60, 40);
    g.appendChild(el("circle", { cx, cy, r: 0.55, class: "pdot" }));
  }

  // penalty box and 6-yard box
  rectPitch(g, 102, 18, 120, 62, "pline");
  rectPitch(g, 114, 30, 120, 50, "pline");

  // penalty arc: centred on the penalty spot, bulging AWAY from goal.
  // sweep-flag must be 0 here; 1 curves it back into the box.
  {
    const [ax, ay] = toSvg(102, 32);
    const [bx, by] = toSvg(102, 48);
    g.appendChild(el("path", { d: `M ${ax} ${ay} A 10 10 0 0 0 ${bx} ${by}`, class: "pline" }));
  }

  // penalty spot
  {
    const [sx, sy] = toSvg(108, 40);
    g.appendChild(el("circle", { cx: sx, cy: sy, r: 0.55, class: "pdot" }));
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
