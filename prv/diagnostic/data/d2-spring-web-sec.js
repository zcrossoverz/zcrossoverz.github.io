/* DIAGNOSTIC — Spring, Web, API, Security. Schema: xem d1. */
DIAG.register({ items: [

{ id:"dg-spr-01", node:"spr-tx", d:"spring", lv:"middle", dim:"predict",
  q:"Trong cùng một <code>@Service</code>, method <code>importFile()</code> (không có @Transactional) gọi <code>this.saveBatch()</code> có <code>@Transactional</code>. Khi <code>saveBatch</code> ném RuntimeException giữa chừng, dữ liệu đã insert có bị rollback không?",
  opts:[
    { t:"Không — gọi qua <code>this</code> đi thẳng vào object thật, không qua proxy, nên @Transactional không hề chạy", ok:true },
    { t:"Có — annotation nằm trên method thì cứ gọi là có transaction", why:"@Transactional hoạt động nhờ <b>proxy bọc ngoài bean</b>: logic mở/commit/rollback nằm ở proxy. Gọi nội bộ this.method() không đi qua lớp vỏ đó — annotation thành hình xăm trang trí." },
    { t:"Có, nhưng chỉ khi exception là checked", why:"Ngược hai lần: checked exception mặc định KHÔNG gây rollback; và ở đây transaction còn chưa từng được mở vì self-invocation." },
    { t:"Không, vì thiếu @EnableTransactionManagement", why:"Spring Boot đã bật transaction management tự động từ lâu. Đổ cho thiếu config là hướng điều tra sai — vấn đề nằm ở cơ chế proxy." }
  ],
  why:"Ba lý do @Transactional 'câm' kinh điển: (1) self-invocation qua this, (2) method không public (với proxy mặc định), (3) exception loại không nằm trong rollback rules. Sửa self-invocation: tách method sang bean khác, hoặc tiêm chính nó qua ObjectProvider để gọi qua proxy.",
  fix:{ lesson:"07-spring-transaction.html", qb:"transactional", inc:null } },

{ id:"dg-spr-02", node:"spr-tx", d:"spring", lv:"middle", dim:"predict",
  q:"Method <code>@Transactional</code> ném <code>IOException</code> (checked) sau khi đã update 2 bảng. Mặc định, transaction sẽ?",
  opts:[
    { t:"COMMIT — Spring mặc định chỉ rollback cho RuntimeException và Error", ok:true },
    { t:"ROLLBACK — có exception là rollback, đó là mục đích của transaction", why:"Trực giác hợp lý nhưng sai với mặc định của Spring: checked exception được coi là 'kết quả nghiệp vụ lường trước' (theo triết lý EJB cũ) nên KHÔNG rollback. Muốn rollback: @Transactional(rollbackFor = Exception.class)." },
    { t:"ROLLBACK bảng thứ hai, giữ bảng thứ nhất", why:"Transaction là nguyên tử — không tồn tại rollback 'một nửa trong cùng transaction'. Nếu bạn thấy hệ quả nửa vời, đó là hai transaction riêng biệt, không phải rollback chọn lọc." },
    { t:"Treo transaction chờ người xử lý exception quyết định", why:"Không có trạng thái 'chờ quyết định' — khi method thoát (bình thường hay bằng exception), proxy phải commit hoặc rollback ngay theo rule đã cấu hình." }
  ],
  why:"Rule mặc định gây bất ngờ số 1 của Spring TX. Thực dụng: hoặc dùng unchecked exception cho lỗi cần rollback, hoặc khai rõ rollbackFor. Và nhớ: bắt (catch) exception NUỐT luôn bên trong method cũng làm mất rollback.",
  fix:{ lesson:"07-spring-transaction.html", qb:"transactional", inc:null } },

{ id:"dg-spr-03", node:"spr-state", d:"spring", lv:"middle", dim:"analyze",
  q:"Bug production: thi thoảng user A nhìn thấy <em>dữ liệu giỏ hàng của user B</em>. Chỉ xảy ra giờ cao điểm, không tái hiện được ở local. Nghi phạm số 1?",
  opts:[
    { t:"Một field mutable (vd <code>currentCart</code>) trong bean singleton — mọi request/thread dùng chung một instance nên ghi đè dữ liệu của nhau", ok:true },
    { t:"Database trả nhầm dữ liệu khi tải cao", why:"DB có transaction/isolation bảo vệ — 'DB tự trộn dữ liệu hai user' gần như không tồn tại. Khi bug chỉ hiện lúc tải cao, nghi phạm đầu tiên là <b>state chia sẻ trong app</b>, không phải DB." },
    { t:"Browser cache trả nhầm trang của user khác", why:"Có thể xảy ra nếu cache CDN sai cấu hình, nhưng 'không tái hiện local + chỉ lúc đông' khớp mẫu race condition trong singleton hơn nhiều — và cache sai thì tái hiện được ổn định bằng đúng URL." },
    { t:"JWT của hai user bị trùng chữ ký", why:"Trùng chữ ký HMAC thực tế không xảy ra ngẫu nhiên. Đây là kiểu giải thích 'phép màu mật mã' để né việc soi code của chính mình." }
  ],
  why:"Bean mặc định singleton + mỗi request một thread = field mutable là biến toàn cục trá hình. Dấu hiệu nhận dạng: bug trộn dữ liệu giữa user, chỉ lúc concurrent cao. Sửa: service stateless — dữ liệu request sống trong biến local/tham số.",
  fix:{ lesson:"05-spring-core.html", qb:"singleton", inc:null } },

{ id:"dg-spr-04", node:"spr-jpa", d:"spring", lv:"middle", dim:"predict",
  q:"Controller trả thẳng entity <code>Order</code> có quan hệ <code>@OneToMany(fetch = LAZY) items</code>. Service lấy Order trong <code>@Transactional</code>, return về controller, Jackson serialize sang JSON. Kết quả thường gặp?",
  opts:[
    { t:"<code>LazyInitializationException</code> — Jackson đụng vào <code>items</code> khi persistence context đã đóng", ok:true },
    { t:"JSON chứa đầy đủ items — Hibernate tự load khi cần", why:"'Tự load khi cần' chỉ đúng KHI session còn mở. Transaction kết thúc ở tầng service → ra tới controller/Jackson thì session đã đóng — proxy lazy không còn ai đứng sau để query." },
    { t:"JSON trả về items rỗng []", why:"Lazy proxy không im lặng trả rỗng — nó ném exception khi bị chạm ngoài session. Trả rỗng âm thầm còn nguy hiểm hơn, và may là Hibernate không làm vậy." },
    { t:"Lỗi biên dịch vì entity không được serialize", why:"Compiler không biết gì về JPA session. Code hợp lệ hoàn toàn — đây là lỗi RUNTIME, loại lỗi kiến trúc (trộn tầng) chứ không phải cú pháp." }
  ],
  why:"Nguyên nhân gốc là lỗi RANH GIỚI: entity (gắn session) bị lôi ra ngoài tầng có session. Fix đúng: map sang DTO ngay trong service (trong transaction), fetch join những gì cần. Fix sai mà phổ biến: Open Session In View / bật EAGER — giấu vấn đề, đẻ ra N+1.",
  fix:{ lesson:"09-spring-data-jpa.html", qb:"lazy", inc:"inc-n-plus-one" } },

{ id:"dg-spr-05", node:"spr-core", d:"spring", lv:"junior", dim:"predict",
  q:"Interface <code>NotifyService</code> có 2 bean cài đặt: <code>EmailNotify</code>, <code>SmsNotify</code>. Một service khai constructor <code>OrderService(NotifyService notify)</code>. Khởi động app, chuyện gì xảy ra?",
  opts:[
    { t:"App không khởi động được — <code>NoUniqueBeanDefinitionException</code> vì Spring không biết chọn bean nào", ok:true },
    { t:"Spring tiêm bean được khai báo trước theo thứ tự quét", why:"Spring cố tình KHÔNG chọn theo 'thứ tự quét' — thứ tự đó không ổn định và chọn ngầm là nguồn bug. Triết lý: mơ hồ thì fail sớm, bắt người viết chỉ định rõ (@Qualifier/@Primary)." },
    { t:"Spring tiêm cả hai và gọi lần lượt", why:"Tiêm nhiều bean chỉ xảy ra khi bạn XIN danh sách — khai kiểu List&lt;NotifyService&gt;. Tham số đơn lẻ thì phải đúng một ứng viên." },
    { t:"App chạy, nhưng NullPointerException khi gọi notify lần đầu", why:"Constructor injection fail NGAY LÚC KHỞI ĐỘNG, không đợi runtime — đây chính là một ưu điểm lớn của nó so với field injection: lỗi wiring không bao giờ sống sót tới production." }
  ],
  why:"Resolve theo kiểu → 2 ứng viên → fail fast lúc boot. Cách chỉ định: @Qualifier tại chỗ tiêm, @Primary trên bean mặc định, hoặc tiêm List để nhận tất cả.",
  fix:{ lesson:"05-spring-core.html", qb:"qualifier", inc:null } },

{ id:"dg-web-01", node:"web-infra", d:"web", lv:"junior", dim:"analyze",
  q:"FE ở <code>localhost:3000</code> gọi API <code>localhost:8080</code> bị lỗi CORS trên trình duyệt, nhưng Postman gọi cùng URL thì thành công. Kết luận đúng?",
  opts:[
    { t:"Hành vi đúng thiết kế: CORS là luật của TRÌNH DUYỆT; server chưa khai báo cho phép origin :3000 — sửa bằng config CORS ở server", ok:true },
    { t:"Postman làm việc được nghĩa là server ổn, lỗi nằm ở code FE", why:"Postman không phải trình duyệt nên không áp Same-Origin Policy — nó 'qua mặt' được là chuyện đương nhiên, không chứng minh server đã cấu hình đúng cho browser. Lỗi CORS sửa ở <b>server</b>, không phải FE." },
    { t:"Cần cài extension tắt CORS cho trình duyệt của mọi user", why:"Extension tắt CORS chỉ là đồ nghề dev thử nghiệm trên máy mình — không thể (và không nên) yêu cầu user tắt cơ chế an ninh của họ. Nghĩ theo hướng này là chưa hiểu CORS bảo vệ ai." },
    { t:"Phải chuyển FE và BE về cùng một port thì mới gọi được", why:"Cùng origin đúng là hết CORS, nhưng đây không phải 'cách sửa' thực tế (prod vẫn thường khác domain/port). Cơ chế chính danh là server khai Access-Control-Allow-Origin." }
  ],
  why:"Khác port = khác origin. Trình duyệt chặn JS đọc response cross-origin trừ khi server cho phép qua header CORS (và preflight OPTIONS với request 'không đơn giản'). 'Postman được, browser không' = dấu hiệu nhận dạng CORS 100%.",
  fix:{ lesson:"47-junior-foundation-pack.html", qb:"cors", inc:null } },

{ id:"dg-web-02", node:"web-http", d:"web", lv:"junior", dim:"decide",
  q:"Mobile app gọi <code>POST /payments</code>; mạng chập chờn nên app tự retry khi timeout. Đội bạn lo trừ tiền 2 lần. Giải pháp ĐÚNG là?",
  opts:[
    { t:"Client gửi kèm <code>Idempotency-Key</code> duy nhất cho mỗi lần thanh toán; server lưu key và trả lại kết quả cũ nếu gặp key đã xử lý", ok:true },
    { t:"Cấm client retry — timeout thì báo lỗi cho user bấm lại", why:"Đẩy retry cho ngón tay user không xoá rủi ro (user bấm 2 lần còn nhanh hơn máy) — và UX tệ. Sự thật phải chấp nhận: <b>retry sẽ xảy ra</b>, hệ thống phải an toàn khi nó xảy ra." },
    { t:"Đổi sang PUT vì PUT idempotent", why:"PUT idempotent vì ngữ nghĩa 'ghi đè resource tại URL đã biết' — 'tạo thanh toán mới' không có URL định trước nên không tự nhiên là PUT. Đổi động từ không tự sinh ra tính idempotent; cơ chế chống trùng mới là thứ cần thêm." },
    { t:"Giảm timeout của client xuống 1 giây để phát hiện lỗi sớm hơn", why:"Timeout ngắn hơn làm retry XẢY RA NHIỀU HƠN (server chưa kịp xong đã bị coi là chết) — bạn vừa tăng đúng cái rủi ro đang muốn giảm." }
  ],
  why:"Timeout ≠ thất bại — server có thể đã trừ tiền xong mà response lạc đường. Idempotency-Key cho phép retry vô hại: cùng key → trả kết quả đã có. Đây là chuẩn ngành cho API tiền bạc (Stripe, ngân hàng).",
  fix:{ lesson:"33-idempotency.html", qb:"idempotency", inc:"inc-duplicate-message" } },

{ id:"dg-api-01", node:"api-evolution", d:"api", lv:"middle", dim:"decide",
  q:"API <code>GET /orders?page=50000&amp;size=20</code> (OFFSET) càng trang sâu càng chậm và user phàn nàn thấy dòng lặp lại khi có đơn mới chen vào. Giải pháp đúng hướng nhất?",
  opts:[
    { t:"Chuyển sang keyset/cursor pagination: trả <code>next_cursor</code> theo (created_at, id) của dòng cuối + composite index tương ứng", ok:true },
    { t:"Tăng cache cho endpoint này", why:"Trang sâu gần như không ai xem lại đúng tổ hợp (page 50000) — cache hit rate ~0. Cache không sửa được chi phí OFFSET phải đếm-bỏ N dòng, cũng không sửa việc dữ liệu trôi." },
    { t:"Thêm index cho ORDER BY created_at là hết chậm", why:"Index giúp sort, nhưng OFFSET 1.000.000 vẫn phải <b>đi qua và vứt</b> một triệu entry trước khi lấy 20 — chi phí tuyến tính theo độ sâu vẫn nguyên. Index cần đi kèm cách nhảy thẳng (keyset) mới trị tận gốc." },
    { t:"Giới hạn tối đa 100 trang để user không vào sâu được", why:"Chặn tính năng là đầu hàng, và không sửa lỗi dòng lặp ở cả các trang nông khi dữ liệu chen vào. Bài toán này có lời giải chuẩn ngành (cursor) — các API lớn đều dùng." }
  ],
  why:"Keyset: WHERE (created_at, id) &lt; (mốc cuối trang trước) LIMIT 20 — index seek thẳng, trang thứ 1 triệu nhanh như trang 1, dữ liệu chen vào không làm trôi. Đổi lại: không nhảy thẳng trang N — UI kiểu load-more.",
  fix:{ lesson:"19-api-design.html", qb:"pagination", inc:null } },

{ id:"dg-sec-01", node:"sec-auth", d:"sec", lv:"junior", dim:"predict",
  q:"Đội bạn định nhét <code>soDuTaiKhoan</code> và <code>diaChiNha</code> vào payload JWT 'cho tiện, đằng nào cũng có chữ ký chống sửa'. Đánh giá đúng?",
  opts:[
    { t:"Không được: payload chỉ được ENCODE base64 — ai cầm token đều decode đọc được toàn bộ; chữ ký chống SỬA chứ không chống ĐỌC", ok:true },
    { t:"Được — có signature nghĩa là nội dung đã được bảo vệ", why:"Nhầm lẫn giữa hai khái niệm: chữ ký (integrity — phát hiện bị sửa) và mã hoá (confidentiality — không đọc trộm được). JWT chuẩn (JWS) chỉ có vế đầu. Dán chữ ký lên bưu thiếp không làm nội dung bưu thiếp thành bí mật." },
    { t:"Được, miễn là dùng HTTPS", why:"HTTPS chỉ bảo vệ <b>trên đường truyền</b>. Token còn nằm ở client (localStorage/log/công cụ debug), bị copy qua tin nhắn khi user report lỗi... — mọi nơi đó payload đều đọc được." },
    { t:"Không được vì payload to làm token quá dài, còn bảo mật thì ổn", why:"Kích thước là vấn đề phụ có thật, nhưng lý do chính để từ chối là <b>lộ thông tin</b>. Trả lời thiếu vế bảo mật là trượt trọng tâm câu hỏi." }
  ],
  why:"Nguyên tắc JWT: payload = công khai với người cầm token. Chỉ để claim tối thiểu (sub, roles, exp). Dữ liệu nhạy cảm nằm ở server, tra bằng sub khi cần. (JWE mã hoá có tồn tại nhưng hiếm dùng và không phải mặc định.)",
  fix:{ lesson:"08-spring-security.html", qb:"jwt", inc:null } },

{ id:"dg-sec-02", node:"sec-appsec", d:"sec", lv:"middle", dim:"analyze",
  q:"Code: <code>String sql = \"SELECT * FROM users WHERE name = '\" + tenNhap + \"'\";</code>. Pentest báo lỗi nghiêm trọng. Bản chất lỗ hổng và cách sửa ĐÚNG GỐC?",
  opts:[
    { t:"SQL injection — dữ liệu bị trộn vào lệnh; sửa bằng PreparedStatement/parameter binding để dữ liệu mãi mãi chỉ là giá trị", ok:true },
    { t:"Sửa bằng cách escape dấu nháy đơn trong tenNhap trước khi nối", why:"Escape thủ công là chạy đua vũ trang với attacker (multibyte encoding, ngữ cảnh khác nhau, sót một chỗ là thủng). Parameter binding tách LỆNH khỏi DỮ LIỆU ở tầng giao thức — đúng gốc, không phải vá từng ký tự." },
    { t:"Chỉ nguy hiểm nếu user là admin DB; user thường không đủ quyền phá", why:"App kết nối DB bằng MỘT tài khoản chung — quyền của 'user thường' trên web chính là quyền của tài khoản app dưới DB. SELECT được cả bảng users đã là thảm hoạ rò rỉ, chưa cần DROP." },
    { t:"Validate tenNhap chỉ cho chữ cái là đủ, không cần đổi cách viết SQL", why:"Validate là lớp phòng thủ TỐT nhưng không thay được binding: luật 'chỉ chữ cái' sẽ có ngoại lệ (tên có dấu nháy như O'Brien!), và một chỗ quên validate là thủng. Defense in depth: validate VÀ bind." }
  ],
  why:"Injection đứng đầu OWASP nhiều năm vì cách sửa đúng rất rẻ: luôn dùng PreparedStatement/JPA parameter. Bonus: bind variable còn giúp DB cache execution plan (soft parse).",
  fix:{ lesson:"29-application-security.html", qb:"sql-injection", inc:null } }

]});
