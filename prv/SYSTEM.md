# Backend Engineering Lab — Kiến trúc hệ thống

> Tài liệu cho developer/AI tiếp tục phát triển. Cập nhật: 2026-07-03.

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
        ~75 node · 18 domain · prerequisite graph
                            │ lesson
                            ▼
              58 bài học HTML (01→61, index.html)
```

**Nguyên tắc thiết kế:** nội dung là DỮ LIỆU (file `*.js` tự đăng ký qua `register()`), engine là UI mỏng. Không phụ thuộc UI — đổi giao diện không phải viết lại nội dung. Mọi thứ kiểm tra được bằng máy (`_qa/validate.mjs`).

## Bản đồ file

| Đường dẫn | Vai trò |
|---|---|
| `learn.html` | Hub: mastery theo domain, radar 7 năng lực, path engine "học gì tiếp", mục đang quên, bản đồ kiến thức |
| `learnmap/skillmap.js` | Knowledge graph: node {id, d, lv, pre[], lesson, tags[], inc[], vnote, planned} |
| `assets/progress.js` | `BEP` — store hợp nhất: đọc/ghi localStorage mọi module + công thức mastery + Leitner decay + 7 dimensions |
| `62-interview-question-bank.html` + `qbank/` | Question bank 217+ câu, 12 nhóm. Xem `qbank/GUIDE.md` |
| `63-diagnostic.html` + `diagnostic/` | 44 câu tình huống MCQ; mỗi đáp án sai = 1 misconception + remediation; chấm theo domain/dimension/node |
| `64-incident-lab.html` + `incidents/` | 8 sự cố production: artifacts (log/dump/EXPLAIN) → điều tra từng bước → root cause → fix trade-off → lab tái hiện |
| `index.html` | Danh mục 58 bài học (giữ nguyên URL cũ) + banner Hub |
| `_qa/validate.mjs` | QA tự động — chạy `node _qa/validate.mjs` từ `html/`, exit≠0 nếu lỗi |

## Mô hình năng lực (7 chiều) & nguồn evidence

| Chiều | Đo bằng | Trạng thái |
|---|---|---|
| Nhớ được | qbank Leitner box trung bình | ✅ hoạt động |
| Giải thích được | tỉ lệ câu box≥4 | ✅ (proxy — self-rating) |
| Dự đoán được | diagnostic dim `predict` | ✅ 16 câu |
| Phân tích được | diagnostic dim `analyze` | ✅ 15 câu |
| Quyết định trade-off | diagnostic dim `decide` + incident fix | ✅ 11 câu + 8 fix |
| Debug được | điểm Incident Lab | ✅ 8 sự cố |
| Thiết kế được | diagnostic dim `design` | 🟡 mỏng (2 câu) — xem Roadmap |

**Công thức mastery một node** (trong `progress.js → nodeEvidence`): qbank 0.45 + diagnostic 0.3 + incident 0.25, chuẩn hoá theo phần có dữ liệu. Không có dữ liệu = `null` ("chưa đo"), không phải 0 — hệ thống không giả vờ biết.

**Path engine** (`learn.html`): gợi ý node khi mọi prereq đạt ≥45%; ưu tiên weak → đang học dở → mới; hiển thị lý do + hành động (bài học / lọc qbank theo tag / sự cố).

## localStorage (KHÔNG đổi key — mất tiến độ người dùng)

`qb_box_v2` (Leitner box theo id câu) · `qb_star_v2` · `qb_stat_v1` (XP/streak) · `qb_last_v1` (ngày ôn gần nhất/câu) · `be_diag_v1` (kết quả diagnostic) · `be_inc_v1` (điểm incident) · `be_lessons_v1`. Migration id cũ→mới của qbank đã chạy tự động qua field `legacy` (giữ vĩnh viễn trong data).

## Quy tắc nội dung (áp dụng cho MỌI content mới)

1. Đối tượng: dev ~1 năm kinh nghiệm. Không dạy if/else; đào cơ chế bên trong, failure mode, trade-off.
2. Ngôn ngữ đơn giản, giải thích thuật ngữ lần đầu xuất hiện, nền tảng trước nâng cao sau (chi tiết: `qbank/GUIDE.md`).
3. Khẳng định quan trọng có nguồn (`refs`). Kiến thức theo phiên bản → ghi rõ (skillmap dùng field `vnote`).
4. Diagnostic: mỗi option sai BẮT BUỘC có `why` = chẩn đoán misconception + hướng sửa. Không có "sai vì sai".
5. Incident: artifacts phải giống thật (log format thật, thread dump thật, số liệu khớp nhau trong timeline); mục `prove` phải chạy được trên máy học viên kèm expected output.
6. Không ví dụ banking (trừ mock 57/58).

## Cách mở rộng (việc thường gặp)

- **Thêm câu qbank** → `qbank/GUIDE.md`.
- **Thêm câu diagnostic** → thêm item vào `diagnostic/data/*.js` (schema ở đầu `d1`), `node` phải tồn tại trong skillmap.
- **Thêm sự cố** → thêm `INCIDENTS.register({...})` vào `incidents/data/*.js` (schema ở đầu `i1`), cập nhật `inc:[...]` của node liên quan trong skillmap để Hub nối được.
- **Thêm chủ đề mới** → thêm node vào skillmap (khai `pre` cẩn thận) → viết bài học html (theo depth chuẩn của repo) → thêm câu qbank có tag khớp `node.tags` → (lý tưởng) 1 câu diagnostic + 1 sự cố.
- **Sau MỌI thay đổi:** `cd html && node _qa/validate.mjs` phải PASS.

## Roadmap (ưu tiên giảm dần)

1. **Rewrite nốt qbank:** Spring còn 31 câu `partial`; 8 nhóm `legacy` (Distributed, Resilience, Architecture, DevOps, Security, Testing, Domain&AI, Interview) — rewrite theo chuẩn GUIDE.md, mỗi đợt một nhóm + bổ sung câu.
2. **Design lab (chiều "Thiết kế được"):** module kiểu incident nhưng đề bài là thiết kế (yêu cầu → chọn kiến trúc từng bước, chấm trade-off). Tái dùng engine 64 với schema mới.
3. **Thêm sự cố:** consumer lag, GC pressure/high CPU, K8s OOMKilled/probe fail, deployment rollback, outbox relay chết, data inconsistency sau saga (đã có node/misconception nền trong diagnostic).
4. **Node `planned` trong skillmap:** cs-os (OS cho backend), conc-vthreads (virtual threads — Java 21), ops-k8s-tshoot, car-soft — viết bài học + gỡ cờ `planned`.
5. **Diagnostic mở rộng:** ngân hàng câu đủ lớn để mỗi lượt đo rút ngẫu nhiên (chống nhớ đề); thêm item cho các domain mỏng (test, api, dom).
6. **Xuất/nhập tiến độ:** nút export/import JSON localStorage (đổi máy không mất hồ sơ).

## Ghi chú môi trường dev

- Mount bash của agent đôi khi pad/truncate đuôi file bằng `\0` sau khi file-tool edit — `validate.mjs` đã strip; nếu bash thấy file "hỏng" mà Read tool thấy sạch thì tin Read tool (file thật trên Windows là chuẩn).
- File lớn: sửa bằng Edit theo marker `DATA_START`/`DATA_END`, mỗi lần ≤ ~8-10 câu.
