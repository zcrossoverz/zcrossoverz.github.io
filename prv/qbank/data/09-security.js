/* ============================================================
   QBANK DATA — Security   (prefix id: sec-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Security",
  order: 9,
  prefix: "sec",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"sec-001", legacy:111, t:"29 App Security", lv:"junior", core:true,
  tags:["app-security"],
  q:"SQL Injection hoạt động thế nào? Cách chống đúng là gì?",
  a:"<p>Xảy ra khi bạn <em>ghép chuỗi</em> input người dùng thẳng vào câu SQL: <code>\"...WHERE name='\" + input + \"'\"</code>. Kẻ tấn công nhập <code>' OR '1'='1</code> → đổi luôn ý nghĩa câu lệnh, đọc/xoá dữ liệu.</p><p><strong>Chống</strong>: dùng <strong>parameterized query / PreparedStatement</strong> (<code>WHERE name = ?</code>) — dữ liệu được gửi <em>tách khỏi</em> câu lệnh, DB không bao giờ diễn giải nó thành SQL. Trong JPA dùng bind parameter, tránh nối chuỗi JPQL. Validate input là lớp phụ, không thay thế parameterized.</p><div class='qb-eli5'><b>🌱 Ý chính:</b> đừng bao giờ 'dán' dữ liệu người dùng vào câu lệnh; hãy đưa nó qua 'ô tham số' riêng.</div>",
  refs:[["OWASP – SQL Injection Prevention","https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"]] },

{ id:"sec-002", legacy:112, t:"29 App Security", lv:"middle", core:true,
  tags:["app-security"],
  q:"XSS là gì? Stored và Reflected khác nhau ra sao? Cách chống?",
  a:"<p><strong>XSS</strong>: kẻ tấn công chèn JavaScript vào trang, chạy trong trình duyệt nạn nhân (đánh cắp cookie/token, giả mạo thao tác). <strong>Stored</strong>: mã độc lưu ở server (vd comment) rồi phục vụ cho mọi người xem. <strong>Reflected</strong>: mã độc nằm trong URL/param, phản chiếu lại ngay trong response.</p><p><strong>Chống</strong>: <em>output encoding</em> theo ngữ cảnh (HTML-escape khi render), dùng framework tự escape, <strong>Content-Security-Policy (CSP)</strong>, cookie <code>HttpOnly</code> để JS không đọc được token. Lọc input hỗ trợ thêm nhưng encode lúc output là chính.</p>",
  refs:[["OWASP – XSS Prevention","https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"]] },

{ id:"sec-003", legacy:113, t:"29 App Security", lv:"middle", core:true,
  tags:["app-security"],
  q:"CSRF và CORS khác nhau thế nào? Chống CSRF ra sao?",
  a:"<p>Hai khái niệm hay bị nhầm. <strong>CSRF</strong>: lợi dụng việc trình duyệt <em>tự gửi cookie</em> — trang độc khiến trình duyệt nạn nhân gửi request 'thật' tới site bạn đang đăng nhập (vd chuyển tiền) mà bạn không cố ý. <strong>CORS</strong>: cơ chế cho phép/chặn trang origin khác <em>đọc response</em> — không phải để chống CSRF.</p><p><strong>Chống CSRF</strong>: CSRF token (server phát, form gửi lại, kẻ tấn công không đoán được), SameSite cookie (<code>Lax</code>/<code>Strict</code>), kiểm tra Origin/Referer. API dùng token trong header (không phải cookie) thì ít bị CSRF hơn.</p>",
  refs:[["OWASP – CSRF Prevention","https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"]] },

{ id:"sec-004", legacy:114, t:"29 App Security", lv:"middle", core:false,
  tags:["app-security"],
  q:"IDOR (Insecure Direct Object Reference) là gì? Phòng thế nào?",
  a:"<p>IDOR = truy cập object của người khác chỉ bằng cách <em>đổi id</em>: <code>GET /orders/1001</code> đổi thành <code>/orders/1002</code> và server trả về đơn của người khác vì <strong>chỉ kiểm tra đăng nhập, không kiểm tra quyền sở hữu</strong>. Đây là 'Broken Object Level Authorization' — top lỗi API.</p><p><strong>Phòng</strong>: mỗi truy cập object phải kiểm <em>ownership/permission</em> ở tầng server (<code>WHERE owner_id = currentUser</code>), không tin id từ client. Dùng id khó đoán (UUID) chỉ là lớp phụ, không thay cho authorization.</p>",
  refs:[["OWASP – Broken Object Level Authorization","https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/"]] },

{ id:"sec-005", legacy:115, t:"30 Cryptography", lv:"junior", core:true,
  tags:["cryptography"],
  q:"Hashing, Encryption và Encoding khác nhau ra sao?",
  a:"<ul><li><strong>Encoding</strong> (Base64, URL-encode): đổi định dạng cho dễ truyền, <em>không bảo mật</em>, ai cũng decode được.</li><li><strong>Encryption</strong>: mã hoá <em>hai chiều</em> — có key thì giải ra bản gốc. Dùng để bảo mật dữ liệu cần đọc lại (số thẻ).</li><li><strong>Hashing</strong>: <em>một chiều</em> — không đảo ngược được. Dùng để lưu password (chỉ so hash) và kiểm toàn vẹn (checksum).</li></ul><div class='qb-gotcha'><b>⚠ Nhầm kinh điển:</b> Base64 KHÔNG phải mã hoá. 'Encode password bằng Base64' là sai hoàn toàn về bảo mật.</div>",
  refs:[["OWASP – Cryptographic Storage","https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html"]] },

{ id:"sec-006", legacy:116, t:"30 Cryptography", lv:"middle", core:true,
  tags:["cryptography"],
  q:"Vì sao lưu password phải dùng bcrypt/argon2, KHÔNG dùng SHA-256?",
  a:"<p>SHA-256 được thiết kế để chạy <em>rất nhanh</em> → kẻ tấn công có leak DB có thể thử hàng tỉ mật khẩu/giây (brute force, rainbow table). Password hashing cần <strong>chậm và có salt</strong>.</p><p><strong>bcrypt/scrypt/argon2</strong> là 'slow hash' có <em>work factor</em> chỉnh được (làm chậm chủ ý) và <em>salt</em> tự động (mỗi user một salt → hai người cùng mật khẩu ra hash khác nhau, vô hiệu rainbow table). Argon2 còn tốn bộ nhớ để chống tấn công bằng GPU.</p><div class='qb-eli5'><b>🌱 Ý chính:</b> với password, 'nhanh' là điểm yếu. Ta cố tình chọn thuật toán chậm.</div>",
  refs:[["OWASP – Password Storage","https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"]] },

{ id:"sec-007", legacy:117, t:"30 Cryptography", lv:"middle", core:false,
  tags:["cryptography"],
  q:"Mã hoá đối xứng (symmetric) và bất đối xứng (asymmetric) khác gì? Vì sao thực tế dùng cả hai?",
  a:"<p><strong>Symmetric</strong> (AES): cùng một key để mã và giải → nhanh, nhưng phải chia sẻ key an toàn cho cả hai bên. <strong>Asymmetric</strong> (RSA/ECC): cặp public/private — mã bằng public, giải bằng private (hoặc ký bằng private, verify bằng public) → giải bài toán trao key, nhưng chậm.</p><p>TLS/HTTPS dùng <strong>cả hai</strong>: asymmetric để hai bên thoả thuận an toàn một session key, rồi dùng session key <em>symmetric</em> mã hoá dữ liệu (nhanh). Đây là mô hình 'hybrid'.</p>",
  refs:[["Cloudflare – Encryption","https://www.cloudflare.com/learning/ssl/what-is-encryption/"]] }

/* DATA_END */
] });
