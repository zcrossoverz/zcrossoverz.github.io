#!/usr/bin/env node
/* ============================================================
   QA TỰ ĐỘNG cho Backend Engineering Lab
   Chạy:  cd html && node _qa/validate.mjs
   LƯU Ý CHO AGENT: file này chỉ sửa qua bash (mount cache issue).
   ============================================================ */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\0+$/, "");
const exists = (f) => fs.existsSync(path.join(ROOT, f));
let ERRORS = 0, WARNS = 0;
const err = (...a) => { ERRORS++; console.log("  ✗", ...a); };
const warn = (...a) => { WARNS++; console.log("  ⚠", ...a); };
const ok = (...a) => console.log("  ✓", ...a);

function runScript(file, sandbox) {
  const src = rd(file);
  const cjk = src.match(/[一-鿿]/g);
  if (cjk) err(file, "chứa ký tự CJK lạc:", [...new Set(cjk)].join(","));
  try { new vm.Script(src, { filename: file }); } catch (e) { err(file, "SYNTAX:", e.message); return; }
  vm.runInNewContext(src, sandbox);
}
function tagBalance(id, html, file) {
  for (const t of ["p", "ol", "ul", "div", "strong", "em", "pre", "code", "b", "table"]) {
    const o = (html.match(new RegExp("<" + t + "[ >]", "g")) || []).length;
    const c = (html.match(new RegExp("</" + t + ">", "g")) || []).length;
    if (o !== c) err(file, id, "the <" + t + "> lech " + o + " mo / " + c + " dong");
  }
}

/* ---------- 1. SKILLMAP ---------- */
console.log("\n[1/6] learnmap/skillmap.js");
const smCtx = { window: {} };
runScript("learnmap/skillmap.js", smCtx);
const SM = smCtx.window.SKILLMAP;
const domIds = new Set(SM.domains.map((d) => d.id));
const nodeIds = new Set();
for (const n of SM.nodes) {
  if (nodeIds.has(n.id)) err("node trùng id:", n.id);
  nodeIds.add(n.id);
  if (!domIds.has(n.d)) err(n.id, "domain không tồn tại:", n.d);
  if (!["junior", "middle", "senior"].includes(n.lv)) err(n.id, "lv sai:", n.lv);
  if (n.lesson && !exists(n.lesson)) err(n.id, "lesson không tồn tại:", n.lesson);
}
for (const n of SM.nodes) for (const p of n.pre || []) if (!nodeIds.has(p)) err(n.id, "prereq không tồn tại:", p);
{
  const state = {};
  const byId = Object.fromEntries(SM.nodes.map((n) => [n.id, n]));
  const visit = (id, stack) => {
    if (state[id] === 1) return;
    if (state[id] === 0) { err("CHU TRÌNH prerequisite:", [...stack, id].join(" → ")); return; }
    state[id] = 0;
    for (const p of byId[id].pre || []) visit(p, [...stack, id]);
    state[id] = 1;
  };
  for (const n of SM.nodes) visit(n.id, []);
}
ok(SM.nodes.length, "nodes,", SM.domains.length, "domains, không chu trình");

/* ---------- 2. QBANK ---------- */
console.log("\n[2/6] qbank/");
const qbCtx = { window: {} };
qbCtx.QB = { packs: [], register(p) { qbCtx.QB.packs.push(p); } };
runScript("qbank/manifest.js", qbCtx);
for (const f of qbCtx.window.QB_FILES) {
  if (!exists("qbank/" + f)) { err("manifest trỏ file thiếu:", f); continue; }
  runScript("qbank/" + f, qbCtx);
}
const qIds = new Set(), qTags = new Set(), legacies = new Set();
let qTotal = 0;
for (const p of qbCtx.QB.packs) {
  if (!p.group || !p.prefix || !p.order) err("pack thiếu group/prefix/order:", p.group);
  for (const q of p.questions) {
    qTotal++;
    if (qIds.has(q.id)) err("qbank trùng id:", q.id);
    qIds.add(q.id);
    if (!new RegExp("^" + p.prefix + "-\\d{3}$").test(q.id)) err("id sai prefix:", q.id);
    if (!["junior", "middle", "senior"].includes(q.lv)) err(q.id, "lv sai");
    if (!q.tags || !q.tags.length) err(q.id, "thiếu tags");
    else q.tags.forEach((t) => qTags.add(t));
    if (q.legacy != null) { if (legacies.has(q.legacy)) err("trùng legacy:", q.legacy); legacies.add(q.legacy); }
    if (!q.q || !q.a) err(q.id, "thiếu q/a");
    tagBalance(q.id, q.a || "", "qbank");
  }
}
ok(qTotal, "câu /", qbCtx.QB.packs.length, "nhóm ·", legacies.size, "legacy id ·", qTags.size, "tag khác nhau");

/* ---------- 3. DIAGNOSTIC ---------- */
console.log("\n[3/6] diagnostic/");
const dgCtx = { window: {} };
dgCtx.DIAG = { packs: [], register(p) { dgCtx.DIAG.packs.push(p); } };
runScript("diagnostic/manifest.js", dgCtx);
for (const f of dgCtx.window.DIAG_FILES) runScript("diagnostic/" + f, dgCtx);
const dgIds = new Set();
let dgTotal = 0;
for (const p of dgCtx.DIAG.packs) for (const it of p.items) {
  dgTotal++;
  if (dgIds.has(it.id)) err("diag trùng id:", it.id);
  dgIds.add(it.id);
  if (!nodeIds.has(it.node)) err(it.id, "node không tồn tại:", it.node);
  if (!domIds.has(it.d)) err(it.id, "domain sai:", it.d);
  if (!["predict", "analyze", "decide", "design"].includes(it.dim)) err(it.id, "dim sai:", it.dim);
  if (it.opts.filter((o) => o.ok).length !== 1) err(it.id, "phải có đúng 1 đáp án ok");
  it.opts.forEach((o, i) => { if (!o.ok && !o.why) err(it.id, "option", i, "sai mà thiếu why"); });
  if (!it.why) err(it.id, "thiếu why");
  if (it.fix && it.fix.lesson && !exists(it.fix.lesson)) err(it.id, "fix.lesson không tồn tại");
}
ok(dgTotal, "câu chẩn đoán");

/* ---------- 4. INCIDENTS ---------- */
console.log("\n[4/6] incidents/");
const incCtx = { window: {} };
incCtx.INCIDENTS = { list: [], register(x) { incCtx.INCIDENTS.list.push(x); } };
runScript("incidents/manifest.js", incCtx);
for (const f of incCtx.window.INC_FILES) runScript("incidents/" + f, incCtx);
const incIds = new Set();
for (const inc of incCtx.INCIDENTS.list) {
  if (incIds.has(inc.id)) err("incident trùng id:", inc.id);
  incIds.add(inc.id);
  (inc.skills || []).forEach((s) => { if (!nodeIds.has(s)) err(inc.id, "skill node không tồn tại:", s); });
  if (!inc.steps || !inc.steps.length) err(inc.id, "thiếu steps");
  (inc.steps || []).forEach((st, i) => {
    if (!st.opts.some((o) => o.s === 2)) err(inc.id, "step", i, "không có s:2");
    st.opts.forEach((o) => { if (!o.why) err(inc.id, "step", i, "option thiếu why"); });
  });
  if (inc.cause.opts.filter((o) => o.ok).length !== 1) err(inc.id, "cause phải có đúng 1 ok");
  if (!inc.fix.opts.some((o) => o.s === 2)) err(inc.id, "fix không có s:2");
  for (const k of ["alert", "debrief", "prove", "teaser", "title", "artifacts"]) if (!inc[k]) err(inc.id, "thiếu", k);
}
for (const n of SM.nodes) for (const i of n.inc || []) if (!incIds.has(i)) err("skillmap", n.id, "trỏ incident thiếu:", i);
ok(incCtx.INCIDENTS.list.length, "sự cố");

/* ---------- 5. DESIGN LAB ---------- */
console.log("\n[5/6] design/");
const dsCtx = { window: {} };
dsCtx.DESIGNS = { list: [], register(x) { dsCtx.DESIGNS.list.push(x); } };
runScript("design/manifest.js", dsCtx);
for (const f of dsCtx.window.DSG_FILES) runScript("design/" + f, dsCtx);
const dsIds = new Set();
for (const d of dsCtx.DESIGNS.list) {
  if (dsIds.has(d.id)) err("design trùng id:", d.id);
  dsIds.add(d.id);
  (d.skills || []).forEach((s) => { if (!nodeIds.has(s)) err(d.id, "skill node không tồn tại:", s); });
  if (!d.steps || !d.steps.length) err(d.id, "thiếu steps");
  (d.steps || []).forEach((st, i) => {
    if (st.opts.filter((o) => o.s === 2).length !== 1) err(d.id, "step", i, "phải có đúng 1 s:2");
    st.opts.forEach((o) => { if (!o.why) err(d.id, "step", i, "option thiếu why"); });
  });
  for (const k of ["brief", "debrief", "teaser", "title"]) if (!d[k]) err(d.id, "thiếu", k);
}
ok(dsCtx.DESIGNS.list.length, "bài thiết kế");

/* ---------- 6. LIÊN KẾT CHÉO & TRANG ---------- */
console.log("\n[6/6] liên kết chéo & trang HTML");
for (const n of SM.nodes) for (const t of n.tags || []) if (!qTags.has(t)) warn("skillmap", n.id, "tag chưa có câu qbank nào:", t);
for (const f of ["learn.html", "62-interview-question-bank.html", "63-diagnostic.html", "64-incident-lab.html", "65-design-lab.html", "index.html", "assets/progress.js"]) {
  if (!exists(f)) err("thiếu file:", f);
}
for (const [f, need] of [
  ["learn.html", ["hubNext", "hubDomains", "hubRadar", "hubMap", "qbank/manifest.js", "btnExport", "session=today"]],
  ["63-diagnostic.html", ["dgView", "diagnostic/manifest.js"]],
  ["64-incident-lab.html", ["ilView", "incidents/manifest.js"]],
  ["65-design-lab.html", ["dlView", "design/manifest.js"]],
  ["62-interview-question-bank.html", ["qbView", "qbank/manifest.js", "assets/progress.js", "session"]]
]) {
  const src = rd(f);
  for (const n of need) if (!src.includes(n)) err(f, "thiếu tham chiếu:", n);
}
ok("các trang tham chiếu đủ thành phần");

console.log("\n================================");
console.log(ERRORS ? "KET QUA: " + ERRORS + " loi, " + WARNS + " canh bao" : "KET QUA: PASS (" + WARNS + " canh bao)");
process.exit(ERRORS ? 1 : 0);
