# QBANK — Hướng dẫn thêm/sửa câu hỏi

> Dành cho người (hoặc AI) tiếp tục mở rộng ngân hàng câu hỏi. Đọc 5 phút là đủ làm đúng.

## Kiến trúc

```
62-interview-question-bank.html   ← engine (UI + Leitner + quiz). KHÔNG chứa dữ liệu.
qbank/
  manifest.js                     ← danh sách file dữ liệu, nạp theo thứ tự
  data/01-nen-tang-web.js         ← mỗi NHÓM một file, tự đăng ký qua QB.register(...)
  data/02-core-java.js
  ...
```

Trang mở bằng `file://` bình thường — dữ liệu nạp bằng thẻ `<script>` động (không dùng fetch/JSON vì bị chặn CORS trên file://).

## Thêm câu vào nhóm có sẵn

1. Mở `qbank/data/<nhóm>.js`, cuộn xuống cuối, **dán khối mới ngay TRƯỚC dòng đánh dấu `DATA_END`**.
2. `id` tăng dần theo prefix của file (xem header file): ví dụ file web đang tới `web-025` thì câu mới là `web-026`.
3. Chạy `node _qa/validate.mjs` (từ thư mục `html/`) — pass mới được commit.

### Schema một câu

```js
{ id:"web-026",            // BẮT BUỘC unique, đúng prefix của file
  legacy:123,              // CHỈ dùng khi migrate từ bản cũ — câu mới KHÔNG có field này
  t:"Web & HTTP",          // topic hiển thị (nhóm con trong group)
  lv:"junior",             // junior | middle | senior
  core:true,               // true = câu bắt buộc phải trả lời được ở level đó
  tags:["http","cache"],   // 2-4 tag, chữ thường không dấu, a-z0-9- . Tag nối câu hỏi
                           // với skillmap (learnmap/skillmap.js) → tính mastery ở Hub
  q:"Câu hỏi (được dùng HTML inline như <code>, <em>)",
  a:"<p>Đáp án HTML...</p>",
  refs:[["Tên nguồn","https://..."]] }
```

### Quy tắc escape (nguồn bug số 1)

- String bọc `"..."`; **HTML attribute bên trong dùng nháy đơn**: `<div class='qb-eli5'>`.
- Dấu `"` trong nội dung → `\"`. Generic Java → `&lt;` `&gt;` (`List&lt;String&gt;`).
- Code nhiều dòng trong `<pre>` → dùng `\n`.
- Không được có chuỗi `*/` trong comment header (đóng block comment sớm).

## Quy tắc viết đáp án (bắt buộc — đây là linh hồn của bank)

Người đọc là **junior ~1 năm kinh nghiệm**. Viết theo thứ tự:

1. **Nền tảng trước, nâng cao sau** — không nhảy cóc bước trung gian.
2. **Thuật ngữ khó giải thích ngay lần đầu xuất hiện** — dùng box `<div class='qb-term'><b>📖 Từ khó:</b> ...</div>` khi câu có ≥1 thuật ngữ lạ.
3. **Không liệt kê định nghĩa khô khan** — giảng như nói chuyện, mỗi ý trả lời một câu "vì sao".
4. Kèm `<div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> ...</div>` (một hình ảnh đời sống đúng bản chất)
   và `<div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> ...</div>` (bẫy/câu hỏi nối thường gặp).
5. **KHÔNG dùng ví dụ banking** (quy ước riêng của repo — trừ các file mock 57/58).
6. Khẳng định kỹ thuật quan trọng phải có `refs` từ nguồn đáng tin (docs chính chủ, Baeldung, Vlad Mihalcea...).
7. Kiến thức phụ thuộc phiên bản → ghi rõ trong nội dung ("từ Java 21...", "mặc định của Spring Boot 3...").

## Thêm NHÓM mới

1. Tạo `qbank/data/13-ten-nhom.js` theo khuôn file có sẵn (`QB.register({group, order, prefix, status, questions})`).
2. Thêm 1 dòng vào `qbank/manifest.js`.
3. Prefix mới không trùng prefix cũ. Chạy validate.

## Trạng thái nhóm (`status`)

- `rewritten` — đã viết theo chuẩn ngôn ngữ dễ hiểu ở trên.
- `partial` — một phần rewritten (xem comment trong file).
- `legacy` — nội dung gốc, sẽ rewrite sau (UI hiện badge "cũ" ở mục lục).

Tiến độ học của người dùng lưu trong localStorage (`qb_box_v2`, `qb_star_v2`, `qb_stat_v1`, `qb_last_v1`) — **đổi `id` của câu cũ = mất tiến độ câu đó**, đừng đổi id.
