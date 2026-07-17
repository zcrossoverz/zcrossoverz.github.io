/* ============================================================
   BEP — Backend Engineering Progress store (dùng chung mọi module)
   - KHÔNG đụng vào key cũ của qbank (chỉ đọc): qb_box_v2, qb_star_v2, qb_stat_v1
   - Key mới:  qb_last_v1   {questionId: "yyyy-m-d"}   (qbank ghi khi rate)
               be_diag_v1   kết quả diagnostic
               be_inc_v1    kết quả incident lab
               be_lessons_v1 {file: ts}  bài học tự đánh dấu đã học
   - Mọi module nạp file này qua <script src="assets/progress.js">
   ============================================================ */
(function () {
  "use strict";
  var L = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  var S = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var today = function () { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
  var daysAgo = function (str) {
    if (!str) return 9999;
    var p = str.split("-").map(Number);
    var then = new Date(p[0], p[1] - 1, p[2]);
    return Math.floor((Date.now() - then.getTime()) / 86400000);
  };

  var BEP = {
    today: today,
    daysAgo: daysAgo,

    /* ---------- Question bank (đọc) ---------- */
    qbBoxes: function () { return L("qb_box_v2", {}); },
    qbStars: function () { return L("qb_star_v2", []); },
    qbStat: function () { return L("qb_stat_v1", { xp: 0, streak: 0 }); },
    qbLast: function () { return L("qb_last_v1", {}); },
    qbTouch: function (id) { var m = L("qb_last_v1", {}); m[id] = today(); S("qb_last_v1", m); },

    /* ---------- Diagnostic ---------- */
    diagGet: function () { return L("be_diag_v1", null); },
    diagSave: function (result) { result.ts = today(); S("be_diag_v1", result); },

    /* ---------- Incident lab ---------- */
    incGet: function () { return L("be_inc_v1", {}); },
    incSave: function (id, score, max) {
      var m = L("be_inc_v1", {});
      var prev = m[id];
      if (!prev || score > prev.score) m[id] = { score: score, max: max, ts: today() };
      else prev.ts = today();
      S("be_inc_v1", m);
    },

    /* ---------- Design lab ---------- */
    dsgGet: function () { return L("be_dsg_v1", {}); },
    dsgSave: function (id, score, max) {
      var m = L("be_dsg_v1", {});
      var prev = m[id];
      if (!prev || score > prev.score) m[id] = { score: score, max: max, ts: today() };
      else prev.ts = today();
      S("be_dsg_v1", m);
    },

    /* ---------- Coding sprint (68) ---------- */
    codeGet: function () { return L("be_code_v1", {}); },
    codeSet: function (id, st) {
      var m = L("be_code_v1", {});
      if (st == null) delete m[id]; else m[id] = { st: st, ts: today() };
      S("be_code_v1", m);
      return m;
    },

    /* ---------- Luyện nói (66 HR pack, 59 drill) ---------- */
    speakGet: function () { return L("be_speak_v1", {}); },
    speakMark: function (id) {
      var m = L("be_speak_v1", {});
      var r = m[id] || { n: 0 };
      r.n++; r.ts = today();
      m[id] = r; S("be_speak_v1", m);
      return r;
    },

    /* ---------- Kỹ năng cũng "mục": incident/design làm lâu chưa ôn lại ---------- */
    staleSkills: function (map, days) {
      var out = [];
      Object.keys(map || {}).forEach(function (id) {
        var d = daysAgo(map[id].ts);
        if (d >= days) out.push({ id: id, days: d, score: map[id].score, max: map[id].max });
      });
      out.sort(function (a, b) { return b.days - a.days; });
      return out;
    },

    /* ---------- Export / Import toàn bộ hồ sơ học ---------- */
    KEYS: ["qb_box_v2", "qb_star_v2", "qb_stat_v1", "qb_last_v1", "be_diag_v1", "be_inc_v1", "be_lessons_v1", "be_dsg_v1", "be_speak_v1", "be_code_v1"],
    exportAll: function () {
      var out = { _v: 1, _app: "backend-lab", _ts: today() };
      BEP.KEYS.forEach(function (k) {
        var v = localStorage.getItem(k);
        if (v != null) { try { out[k] = JSON.parse(v); } catch (e) {} }
      });
      return out;
    },
    importAll: function (obj) {
      if (!obj || obj._app !== "backend-lab") throw new Error("File không đúng định dạng hồ sơ học");
      var n = 0;
      BEP.KEYS.forEach(function (k) {
        if (obj[k] != null) { S(k, obj[k]); n++; }
      });
      return n;
    },

    /* ---------- Lessons (tự đánh dấu) ---------- */
    lessons: function () { return L("be_lessons_v1", {}); },
    lessonToggle: function (file) {
      var m = L("be_lessons_v1", {});
      if (m[file]) delete m[file]; else m[file] = today();
      S("be_lessons_v1", m);
      return !!m[file];
    },

    /* ============================================================
       TÍNH MASTERY — mọi module dùng chung một công thức
       Evidence cho một node của skillmap:
       - qbank: các câu có tag giao với node.tags → avg(box)/5
       - diag : các item gắn node.id → tỉ lệ đúng
       - inc  : các incident trong node.inc đã hoàn thành → score/max
       Trọng số: qbank 0.45, diag 0.3, inc 0.25 (chuẩn hoá theo phần có dữ liệu)
       ============================================================ */
    buildQIndex: function (packs) {
      // packs = QB.packs (nạp qbank data trước). Trả về: tag -> [questionId]
      var idx = {};
      (packs || []).forEach(function (p) {
        (p.questions || []).forEach(function (q) {
          (q.tags || []).forEach(function (tg) {
            (idx[tg] = idx[tg] || []).push(q.id);
          });
        });
      });
      return idx;
    },

    nodeEvidence: function (node, qidx, boxes, diag, incMap) {
      var ev = { qbIds: [], qbAvg: null, diagOk: 0, diagTotal: 0, incDone: 0, incTotal: (node.inc || []).length, mastery: null };
      var seen = {};
      (node.tags || []).forEach(function (tg) {
        (qidx[tg] || []).forEach(function (id) { if (!seen[id]) { seen[id] = 1; ev.qbIds.push(id); } });
      });
      if (ev.qbIds.length) {
        var sum = 0, rated = 0;
        ev.qbIds.forEach(function (id) { var b = boxes[id]; if (b != null) { sum += b; rated++; } });
        ev.qbRated = rated;
        ev.qbAvg = rated ? (sum / rated) / 5 : null; // chỉ tính câu ĐÃ ôn; chưa ôn = chưa có evidence
        if (rated < ev.qbIds.length * 0.3) ev.qbAvg = ev.qbAvg == null ? null : ev.qbAvg * (0.5 + 0.5 * rated / ev.qbIds.length); // ôn quá ít → giảm độ tin
      }
      if (diag && diag.byNode && diag.byNode[node.id]) {
        ev.diagOk = diag.byNode[node.id].ok; ev.diagTotal = diag.byNode[node.id].total;
      }
      var incScore = 0;
      (node.inc || []).forEach(function (iid) {
        var r = (incMap || {})[iid];
        if (r) { ev.incDone++; incScore += r.max ? r.score / r.max : 0; }
      });
      // gộp
      var parts = [], weights = [];
      if (ev.qbAvg != null) { parts.push(ev.qbAvg); weights.push(0.45); }
      if (ev.diagTotal > 0) { parts.push(ev.diagOk / ev.diagTotal); weights.push(0.3); }
      if (ev.incDone > 0) { parts.push(incScore / ev.incDone); weights.push(0.25); }
      if (parts.length) {
        var tw = weights.reduce(function (a, b) { return a + b; }, 0), m = 0;
        parts.forEach(function (p, i) { m += p * weights[i] / tw; });
        ev.mastery = m;
      }
      return ev;
    },

    /* Trạng thái một node cho path engine */
    nodeState: function (ev) {
      if (ev.mastery == null) return "untouched";       // chưa có dữ liệu
      if (ev.mastery >= 0.75) return "solid";           // vững
      if (ev.mastery >= 0.45) return "progress";        // đang học
      return "weak";                                     // yếu — cần học lại
    },

    /* Câu qbank đang "mục" (đã từng thuộc nhưng lâu không ôn) */
    decayingQuestions: function (boxes, last, limit) {
      var out = [];
      Object.keys(boxes).forEach(function (id) {
        var b = boxes[id] || 0;
        var d = daysAgo(last[id]);
        // ngưỡng Leitner đơn giản: box càng cao càng được nghỉ lâu
        var due = [1, 2, 4, 8, 16, 30][Math.min(b, 5)];
        if (last[id] && d >= due) out.push({ id: id, box: b, days: d, overdue: d - due });
      });
      out.sort(function (a, b) { return b.overdue - a.overdue; });
      return limit ? out.slice(0, limit) : out;
    },

    /* 7 chiều năng lực — gom evidence từ các nguồn */
    dimensions: function (diag, incMap, boxes, dsgMap) {
      var boxVals = Object.keys(boxes).map(function (k) { return boxes[k]; });
      var rated = boxVals.length;
      var avgBox = rated ? boxVals.reduce(function (a, b) { return a + b; }, 0) / rated / 5 : null;
      var mastered = boxVals.filter(function (b) { return b >= 4; }).length;
      var dims = {
        remember:  { label: "Nhớ được",        v: rated ? Math.min(1, avgBox * 1.15) : null, src: rated + " câu đã ôn" },
        explain:   { label: "Giải thích được", v: rated ? mastered / Math.max(rated, 30) : null, src: mastered + " câu thuộc (box≥4)" },
        predict:   { label: "Dự đoán được",    v: null, src: "diagnostic" },
        analyze:   { label: "Phân tích được",  v: null, src: "diagnostic" },
        debug:     { label: "Debug được",      v: null, src: "incident lab" },
        design:    { label: "Thiết kế được",   v: null, src: "diagnostic (design) — lab sẽ bổ sung" },
        decide:    { label: "Quyết định trade-off", v: null, src: "diagnostic + incident" }
      };
      if (diag && diag.byDim) {
        ["predict", "analyze", "design", "decide"].forEach(function (d) {
          var r = diag.byDim[d];
          if (r && r.total) dims[d].v = r.ok / r.total;
        });
      }
      var incIds = Object.keys(incMap || {});
      if (incIds.length) {
        var s = 0; incIds.forEach(function (k) { s += incMap[k].max ? incMap[k].score / incMap[k].max : 0; });
        dims.debug.v = s / Math.max(incIds.length, 4); // chuẩn theo tối thiểu 4 incident
        dims.debug.src = incIds.length + " sự cố đã xử lý";
        if (dims.decide.v == null) dims.decide.v = s / Math.max(incIds.length, 5) * 0.8;
      }
      var dsgIds = Object.keys(dsgMap || {});
      if (dsgIds.length) {
        var sd = 0;
        dsgIds.forEach(function (k) { sd += dsgMap[k].max ? dsgMap[k].score / dsgMap[k].max : 0; });
        var dv = sd / Math.max(dsgIds.length, 3);
        dims.design.v = dims.design.v == null ? dv : (dims.design.v + dv) / 2;
        dims.design.src = dsgIds.length + " bài thiết kế + diagnostic";
      }
      return dims;
    }
  };

  window.BEP = BEP;
})();
