# Backend Engineering Lab — Kiến trúc hệ thống

> Tài liệu cho developer/AI tiếp tục phát triển. Cập nhật: 2026-07-12.

## Hệ thống này là gì

Một **môi trường tự học Backend Engineering** chạy hoàn toàn offline (mở bằng `file://`, không build step, không server), tiến hoá từ bộ tài liệu + question bank có sẵn. Chu trình học khép kín:

```
                    ┌──────────────────────────────────────────┐
                    │            learn.html  (HUB)             │
                    │  bạn ở đâu · yếu gì · học gì tiếp theo   │
                    └──────┬───────────┬───────────┬───────────┘
                           │ evidence  │ evidence  │ evidence
        ┌──────────────────┴──┐  ┌─────┴──────┐  ┌─┴────────────────┐
        │ 62 Question Bank    │  │ 63 Diagnostic│ │ 64 Incident Lab │
        │ nhớ / giải thích    │  │ dự đoán/phân │ │ debug / quyết   │
        │ (Leitner + quiz)    │  │ tích/trade-off│ │ định (on-call)  │
        └──────────┬──────────┘  └─────┬──────┘  └─┬────────────────┘
                   │ tag               │ node      │ skill node
                   └────────┬──────────┴───────────┘
                            ▼
              learnmap/skillmap.js  (XƯƠNG SỐNG)
        ~80 node · 18 domain · prerequisite graph
                            │ lesson
                            ▼
              58 bài học HTML (01→61, index.html)
```

**Nguyên tắc thiết kế:** nội dung là DỮ LIỆU (file `*.js` tự đăng ký qua `register()`), engine là UI mỏng. Không phụ thuộc UI — đổi giao diện không phải viết lại nội dung. Mọi thứ kiểm tra được bằng máy (`_qa/validate.mjs`).

## Bản đồ file

| Đường dẫn | Vai trò |
|---|---|
| `learn.html` | Hub: mastery theo domain, radar 7 năng lực, path engine "học gì tiếp", mục đang quên, bản đồ kiến thức · nhắc đo lại diagnostic (>30 ngày) & làm lại incident/design cũ (>28 ngày) — kỹ năng cũng mục |
| `learnmap/skillmap.js` | Knowledge graph: node {id, d, lv, pre[], lesson, tags[], inc[], vnote, planned} |
| `assets/progress.js` | `BEP` — store hợp nhất: đọc/ghi localStorage mọi module + công thức mastery + Leitner decay + 7 dimensions |
| `62-interview-question-bank.html` + `qbank/` | Question bank 217+ câu, 12 nhóm. Xem `qbank/GUIDE.md` |
| `63-diagnostic.html` + `diagnostic/` | Pool 62 câu tình huống MCQ (d1–d5); mỗi lượt đo RÚT NGẪU NHIÊN (Nhanh 20 / Chuẩn 40 / Toàn bộ) stratified theo domain, ưu tiên câu chưa gặp lượt trước (lưu `qids` trong be_diag_v1) — chống nhớ đề; mỗi đáp án sai = 1 misconception + remediation; chấm theo domain/dimension/node |
| `64-incident-lab.html` + `incidents/` | 12 sự cố production: artifacts (log/dump/EXPLAIN) → điều tra từng bước → root cause → fix trade-off → lab tái hiện |
| `65-design-lab.html` + `design/` | 4 bài thiết kế (rate limiter, notification đa kênh, file upload 2GB, URL shortener): yêu cầu → chọn kiến trúc từng bước → chấm trade-off |
| `66-hr-ach-interview-pack.html` | HR pack cá nhân song ngữ VI-EN: 12 câu HR mẫu, pitch ACH, luồng đối soát, 8 incident STAR, glossary + mẫu câu EN. File standalone (CSS/JS riêng, có lang-toggle & practice mode) — node `car-hr-ach` trong skillmap. Có **speaking tracker**: nút "🎙 đã luyện nói" cho 22 mục, ghi `be_speak_v1` qua progress.js, Hub hiển thị tiến độ |
| `67-consensus-consistent-hashing.html` | Bài học mới (2026-07-12) theo depth chuẩn: quorum W+R>N, leader election + fencing token, Raft, consistent hashing ring + vnodes, Redis slots vs ring, 3 build lab Java — lesson của node `dist-consensus` + `dist-hashing` |
| `index.html` | Danh mục 58 bài học (giữ nguyên URL cũ) + banner Hub |
| `_qa/validate.mjs` | QA tự động — chạy `node _qa/validate.mjs` từ `html/`, exit≠0 nếu lỗi |

## Mô hình năng lực (7 chiều) & nguồn evidence

| Chiều | Đo bằng | Trạng thái |
|---|---|---|
| Nhớ được | qbank Leitner box trung bình | ✅ hoạt động |
| Giải thích được | tỉ lệ câu box≥4 | ✅ (proxy — self-rating) |
| Dự đoán được | diagnostic dim `predict` | ✅ 19 câu |
| Phân tích được | diagnostic dim `analyze` | ✅ 19 câu |
| Quyết định trade-off | diagnostic dim `decide` + incident fix | ✅ 17 câu + 8 fix |
| Debug được | điểm Incident Lab | ✅ 12 sự cố |
| Thiết kế được | diagnostic dim `design` + Design Lab (65) | ✅ 7 câu diag + 4 đề Design Lab |

**Công thức mastery một node** (trong `progress.js → nodeEvidence`): qbank 0.45 + diagnostic 0.3 + incident 0.25, chuẩn hoá theo phần có dữ liệu. Không có dữ liệu = `null` ("chưa đo"), không phải 0 — hệ thống không giả vờ biết.

**Path engine** (`learn.html`): gợi ý node khi mọi prereq đạt ≥45%; ưu tiên weak → đang học dở → mới; hiển thị lý do + hành động (bài học / lọc qbank theo tag / sự cố).

## localStorage (KHÔNG đổi key — mất tiến độ người dùng)

`qb_box_v2` (Leitner box theo id câu) · `qb_star_v2` · `qb_stat_v1` (XP/streak) · `qb_last_v1` (ngày ôn gần nhất/câu) · `be_diag_v1` (kết quả diagnostic, từ 2026-07-12 có thêm `qids` = câu đã rút lượt trước) · `be_inc_v1` (điểm incident) · `be_lessons_v1` · `be_dsg_v1` (điểm design lab) · `be_speak_v1` (lượt luyện nói theo mục — 66). Migration id cũ→mới của qbank đã chạy tự động qua field `legacy` (giữ vĩnh viễn trong data).

## Quy tắc nội dung (áp dụng cho MỌI content mới)

1. Đối tượng: dev ~1 năm kinh nghiệm. Không dạy if/else; đào cơ chế bên trong, failure mode, trade-off.
2. Ngôn ngữ đơn giản, giải thích thuật ngữ lần đầu xuất hiện, nền tảng trước nâng cao sau (chi tiết: `qbank/GUIDE.md`).
3. Khẳng định quan trọng có nguồn (`refs`). Kiến thức theo phiên bản → ghi rõ (skillmap dùng field `vnote`).
4. Diagnostic: mỗi option sai BẮT BUỘC có `why` = chẩn đoán misconception + hướng sửa. Không có "sai vì sai".
5. Incident: artifacts phải giống thật (log format thật, thread dump thật, số liệu khớp nhau trong timeline); mục `prove` phải chạy được trên máy học viên kèm expected output.
6. Không ví dụ banking (trừ nhóm Mock & Rehearsal: 57/58/59/66 — cố ý dùng CV/dự án thật).

## Cách mở rộng (việc thường gặp)

- **Thêm câu qbank** → `qbank/GUIDE.md`.
- **Thêm câu diagnostic** → thêm item vào `diagnostic/data/*.js` (schema ở đầu `d1`), `node` phải tồn tại trong skillmap.
- **Thêm sự cố** → thêm `INCIDENTS.register({...})` vào `incidents/data/*.js` (schema ở đầu `i1`), cập nhật `inc:[...]` của node liên quan trong skillmap để Hub nối được.
- **Thêm chủ đề mới** → thêm node vào skillmap (khai `pre` cẩn thận) → viết bài học html (theo depth chuẩn của repo) → thêm câu qbank có tag khớp `node.tags` → (lý tưởng) 1 câu diagnostic + 1 sự cố.
- **Sau MỌI thay đổi:** `cd html && node _qa/validate.mjs` phải PASS.

## Roadmap (ưu tiên giảm dần)

1. **Rewrite nốt qbank:** ĐÃ rewrite theo chuẩn GUIDE.md: Spring, **Security (16)**, **Testing (16)**, **Distributed & Messaging (20 — CAP/PACELC, consensus/Raft, quorum, consistent hashing, clock, split-brain, distributed lock; +2 node dist-consensus/dist-hashing)**, **Architecture & Design (25 — đủ 5 SOLID gồm ISP, system-design method, estimation, caching/CDN, coupling&cohesion, CQRS, sync-vs-async)**, **Resilience & Reliability (16 — graceful degradation, cascading failure, load shedding/backpressure, health check, SLO/error budget, deadline budget, redundancy/SPOF)**, **DevOps & Cloud (18 — Docker layers/multi-stage, CI-vs-CD, 12-factor, IaC, K8s HPA, structured logging, metrics RED/USE)**, **Domain & AI (17 — payment: authorize/capture/settle, ledger, reconciliation, webhook, money-as-integer, refund-vs-chargeback, PCI/tokenization; AI/LLM: RAG, embeddings, prompt injection, function-calling safety, context/token, structured output, streaming; ĐÃ gỡ Camunda/BPMN khỏi hệ học — node dom-bpmn + card index, giữ file lesson 31)** — xong 2026-07-04. **Interview (Kỹ năng phỏng vấn, 18 câu) cũng đã rewritten 2026-07-04 → 12/12 nhóm xong.** Việc còn lại: bổ sung câu mới theo lỗ hổng (node tags chưa có câu).
2. **Design lab (chiều "Thiết kế được"):** ✅ 4 đề — rate limiter, notification đa kênh, file upload lớn, **URL shortener (thêm 2026-07-12)**. Cần: thêm đề feed, chat, payment cho luyện FAANG.
3. **Thêm sự cố:** consumer lag, GC pressure/high CPU, K8s OOMKilled/probe fail, deployment rollback, outbox relay chết, data inconsistency sau saga (đã có node/misconception nền trong diagnostic).
4. **Node `planned` trong skillmap:** cs-os (OS cho backend), conc-vthreads (virtual threads — Java 21), ops-k8s-tshoot, car-soft — viết bài học + gỡ cờ `planned`. (dist-consensus/dist-hashing đã có bài #67 từ 2026-07-12; còn lesson-null không planned: web-network, web-infra, spr-mvc, data-pool.)
5. **Diagnostic mở rộng:** ✅ bản đầu 2026-07-12 — pool 62 câu (+18 câu d5: api/test/dom/design-dim/cs/ops), engine rút ngẫu nhiên stratified theo domain (Nhanh 20/Chuẩn 40/Toàn bộ) + tránh câu đã gặp lượt trước. Tiếp theo: thêm câu cho domain còn mỏng (web, sec, msg, jvm) để pool ~80+, và cân nhắc 2-3 câu design-dim nữa.
6. **Xuất/nhập tiến độ:** ✅ ĐÃ CÓ trong learn.html (mục "Hồ sơ học" — export/import JSON qua `BEP.exportAll/importAll`).

## Ghi chú môi trường dev

- Mount bash của agent đôi khi pad/truncate đuôi file bằng `\0` sau khi file-tool edit — `validate.mjs` đã strip; nếu bash thấy file "hỏng" mà Read tool thấy sạch thì tin Read tool (file thật trên Windows là chuẩn). **Quan sát 2026-07-12:** Edit-tool changes có thể KHÔNG propagate sang mount (bash thấy bản cũ/cắt cụt hàng chục phút), nhưng file tạo MỚI bằng Write tool sync ổn — khi cần validate sau nhiều Edit: dựng overlay `/tmp` từ bản Write-mới trong outputs rồi chạy validate ở đó.
- File lớn: sửa bằng Edit theo marker `DATA_START`/`DATA_END`, mỗi lần ≤ ~8-10 câu.
