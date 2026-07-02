/* ============================================================
   QBANK DATA — Resilience & Reliability   (prefix id: res-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Resilience & Reliability",
  order: 6,
  prefix: "res",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"res-001", legacy:78, t:"22 Resilience", lv:"middle", core:true,
  tags:["resilience"],
  q:"Circuit breaker có 3 trạng thái nào? Hoạt động ra sao và bảo vệ điều gì?",
  a:"<p><strong>CLOSED</strong>: cho request đi qua, đếm tỉ lệ lỗi. Vượt ngưỡng → <strong>OPEN</strong>: fail nhanh (không gọi downstream nữa) trong một khoảng thời gian. Hết thời gian chờ → <strong>HALF_OPEN</strong>: cho vài request thử; nếu ok → CLOSED, nếu lỗi → OPEN lại.</p><p>Bảo vệ: không dội request vào service đang chết (cho nó thời gian hồi), và <em>giải phóng thread</em> của caller thay vì chờ timeout hàng loạt → tránh cascading failure.</p><div class='qb-eli5'><b>🌱 Ví von:</b> như cầu dao điện (CB): thấy chập là ngắt, đợi lát thử lại, tránh cháy cả nhà.</div>",
  refs:[["Resilience4j – CircuitBreaker","https://resilience4j.readme.io/docs/circuitbreaker"]] },

{ id:"res-002", legacy:79, t:"22 Resilience", lv:"middle", core:true,
  tags:["resilience"],
  q:"Retry đúng cách cần gì? Vì sao phải có 'jitter'?",
  a:"<p>Trước hết <strong>phân loại lỗi</strong>: chỉ retry lỗi <em>transient</em> (timeout, 503, connection reset); KHÔNG retry lỗi nghiệp vụ/400 (retry vô ích, còn nhân đôi tác hại). Thêm <strong>exponential backoff</strong> (chờ tăng dần) và giới hạn số lần.</p><p><strong>Jitter</strong> (ngẫu nhiên hoá thời gian chờ) tránh <em>thundering herd</em>: nếu nhiều client cùng retry đúng thời điểm, service vừa hồi lại bị đấm sập lần nữa. Jitter làm các retry lệch nhau.</p><div class='qb-gotcha'><b>⚠ Retry chỉ an toàn khi thao tác idempotent</b> — nếu không, retry POST tạo trùng.</div>",
  refs:[["AWS – Exponential backoff and jitter","https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"]] },

{ id:"res-003", legacy:80, t:"22 Resilience", lv:"middle", core:false,
  tags:["resilience"],
  q:"Bulkhead pattern là gì?",
  a:"<p>Cô lập tài nguyên (thread pool/connection pool) theo <em>từng dependency</em> để một cái chậm/chết không nuốt hết tài nguyên của cả app — như các <strong>khoang kín</strong> trên tàu thuỷ, một khoang thủng không làm chìm tàu.</p><p>Vd: dịch vụ gọi cả payment provider (chậm) và catalog (nhanh). Nếu dùng chung một pool, payment chậm sẽ chiếm hết thread → catalog cũng treo. Tách pool riêng cho mỗi bên → sự cố bị khoanh vùng.</p>",
  refs:[["Resilience4j – Bulkhead","https://resilience4j.readme.io/docs/bulkhead"]] },

{ id:"res-004", legacy:81, t:"22 Resilience", lv:"middle", core:true,
  tags:["resilience"],
  q:"Vì sao thiếu timeout lại nguy hiểm hơn ta tưởng?",
  a:"<p>Một call không có timeout mà downstream treo → thread gọi bị giữ <em>vô thời hạn</em>. Nhiều request như vậy → cạn thread pool → service của bạn cũng ngừng nhận request mới → sự cố <strong>lan ngược</strong> lên toàn chuỗi (cascading failure).</p><p>Nguyên tắc: <em>mọi</em> lời gọi mạng/DB phải có timeout hợp lý (nhỏ hơn thời gian giữ thread chấp nhận được), kết hợp circuit breaker + fallback. 'Chờ mãi' là một dạng lỗi tệ nhất vì nó âm thầm.</p>",
  refs:[["Resilience4j – TimeLimiter","https://resilience4j.readme.io/docs/timeout"]] },

{ id:"res-005", legacy:82, t:"33 Idempotency", lv:"middle", core:true,
  tags:["idempotency"],
  q:"Idempotency là gì và vì sao bắt buộc cho thao tác thanh toán/đặt hàng?",
  a:"<p><strong>Idempotency</strong>: xử lý một request 1 lần hay nhiều lần đều cho <em>cùng kết quả/side-effect</em>. Mạng không tin cậy → client timeout rồi <strong>retry</strong>, message giao trùng → nếu thao tác không idempotent thì trừ tiền/tạo đơn nhiều lần.</p><p>Cần cho mọi thao tác có side-effect không tự nhiên idempotent (chủ yếu là POST). GET/PUT/DELETE vốn idempotent theo HTTP.</p><div class='qb-eli5'><b>🌱 Ví von:</b> bấm nút thang máy 5 lần thang vẫn chỉ tới 1 lần — đó là idempotent. Máy bán hàng trừ tiền mỗi lần bấm thì KHÔNG.</div>",
  refs:[["Stripe – Idempotent requests","https://stripe.com/docs/api/idempotent_requests"]] },

{ id:"res-006", legacy:83, t:"33 Idempotency", lv:"senior", core:false,
  tags:["idempotency"],
  q:"Cài idempotency chống được cả race của 2 request đồng thời cùng key — làm thế nào?",
  a:"<p>Chìa khoá là dùng <strong>UNIQUE constraint</strong> của DB làm cổng atomic:</p><ol><li><code>INSERT</code> bản ghi idempotency key ở trạng thái <code>PROCESSING</code> <em>trước khi</em> xử lý.</li><li>Hai request cùng key chạy song song → chỉ một <code>INSERT</code> thành công; cái kia dính <em>DuplicateKeyException</em>.</li><li>Winner xử lý rồi cập nhật <code>COMPLETED</code> + lưu response. Loser bắt lỗi rồi đọc/đợi kết quả: nếu <code>COMPLETED</code> trả response đã lưu, nếu còn <code>PROCESSING</code> trả 409.</li></ol><p>Nhờ đó không cần khoá phân tán mà vẫn chống trùng ngay cả khi đua nhau.</p>",
  refs:[["Stripe – Idempotent requests","https://stripe.com/docs/api/idempotent_requests"]] },

{ id:"res-007", legacy:84, t:"33 Idempotency", lv:"middle", core:false,
  tags:["idempotency"],
  q:"Idempotency key nên do ai sinh và gắn với gì?",
  a:"<p>Do <strong>client</strong> sinh (thường là UUID), gắn với một <em>đơn vị nghiệp vụ</em> (một lần đặt hàng, một giao dịch) và phải <strong>giữ nguyên qua các lần retry</strong>. Gửi qua header <code>Idempotency-Key</code>.</p><div class='qb-gotcha'><b>⚠ Bẫy:</b> nếu server tự sinh key thì mỗi lần retry là key mới → mất tác dụng chống trùng. Key phải ổn định giữa các retry của cùng ý định. Lưu kèm TTL hợp lý.</div>",
  refs:[["Stripe – Idempotent requests","https://stripe.com/docs/api/idempotent_requests"]] },

{ id:"res-008", legacy:85, t:"23 Performance", lv:"middle", core:true,
  tags:["performance"],
  q:"Vì sao 'đo trước khi tối ưu'? Vì sao nhìn p99 chứ không phải giá trị trung bình (mean)?",
  a:"<p>Tối ưu theo cảm tính hay dồn vào chỗ không phải bottleneck = lãng phí và dễ làm hỏng. Phải <strong>đo</strong> (profiler, APM, metric) để biết thời gian thực đi đâu, rồi mới sửa đúng chỗ, rồi <em>đo lại</em> để xác nhận.</p><p><strong>Mean</strong> che giấu đuôi: 99 request nhanh + 1 request 10s vẫn cho mean đẹp. <strong>p99</strong> (99% request nhanh hơn ngưỡng này) phản ánh trải nghiệm của nhóm chậm nhất — chính là user hay phàn nàn. Latency phải nhìn theo percentile (p50/p95/p99).</p>",
  refs:[["Brendan Gregg – Latency","https://www.brendangregg.com/blog/2015-03-30/latency-heat-maps.html"]] },

{ id:"res-009", legacy:86, t:"23 Performance", lv:"senior", core:false,
  tags:["performance"],
  q:"Connection pool (vd HikariCP) nên set bao nhiêu? Vì sao 'to hơn' không phải luôn tốt?",
  a:"<p>Pool quá nhỏ → request xếp hàng chờ connection. Pool quá lớn → nhiều connection tranh CPU/IO/lock của DB → DB chậm đi, context switching tăng, ngược lại giảm throughput. DB chỉ chạy song song hiệu quả tới một mức.</p><p>Công thức khởi điểm của HikariCP: <code>connections ≈ (core_count * 2) + effective_spindle_count</code>; thường pool <em>nhỏ</em> (vd 10) lại nhanh hơn pool lớn. Phải đo bằng load test, và pool app không được vượt giới hạn <code>max_connections</code> của DB (tính cả nhiều instance).</p>",
  refs:[["HikariCP – Pool sizing","https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing"]] }

/* DATA_END */
] });
