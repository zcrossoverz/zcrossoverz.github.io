/* ============================================================
   QBANK DATA — Architecture & Design   (prefix id: arch-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Architecture & Design",
  order: 7,
  prefix: "arch",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"arch-001", legacy:87, t:"15 Clean Arch/DDD", lv:"junior", core:true,
  tags:["clean-arch-ddd"],
  q:"Dependency Rule trong Clean Architecture là gì? Vì sao domain không được import Spring/JPA?",
  a:"<p><strong>Dependency Rule</strong>: phụ thuộc chỉ được hướng <em>vào trong</em> — tầng ngoài (web, DB, framework) biết tầng trong (domain), nhưng domain (lõi nghiệp vụ) <em>không</em> biết tầng ngoài.</p><p>Giữ domain thuần (không import Spring/JPA) để: (1) <strong>test</strong> nghiệp vụ không cần bootstrap framework; (2) đổi DB/framework/web không đụng business logic; (3) logic không bị 'ô nhiễm' bởi chi tiết kỹ thuật. Persistence chỉ là 'chi tiết', đặt ở tầng infrastructure.</p><div class='qb-eli5'><b>🌱 Ví von:</b> lõi nghiệp vụ như công thức nấu ăn; bếp gas hay bếp từ (framework/DB) là chi tiết đổi được mà không đổi công thức.</div>",
  refs:[["Uncle Bob – Clean Architecture","https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"]] },

{ id:"arch-002", legacy:88, t:"15 Clean Arch/DDD", lv:"middle", core:false,
  tags:["clean-arch-ddd"],
  q:"Aggregate Root trong DDD là gì? Vì sao nên lưu cả aggregate trong một transaction?",
  a:"<p><strong>Aggregate</strong> là một cụm object gắn bó về nghiệp vụ, có một <strong>root</strong> làm cửa vào duy nhất; mọi thay đổi bên trong phải đi qua root. Aggregate là <em>ranh giới nhất quán</em>: invariant (vd 'tổng dòng đơn ≤ hạn mức') phải luôn đúng sau mỗi thao tác.</p><p>Vì vậy nên lưu cả aggregate trong <em>một transaction</em> để giữ invariant nguyên vẹn. Aggregate quá lớn (root ôm hàng nghìn child) → tách nhỏ hoặc tham chiếu bằng id thay vì nhúng.</p>",
  refs:[["Martin Fowler – DDD Aggregate","https://martinfowler.com/bliki/DDD_Aggregate.html"]] },

{ id:"arch-003", legacy:89, t:"15 Clean Arch/DDD", lv:"middle", core:false,
  tags:["clean-arch-ddd"],
  q:"Value Object và Entity khác nhau ra sao? Cho ví dụ.",
  a:"<p><strong>Entity</strong>: có <em>identity</em> riêng và vòng đời (hai object cùng thuộc tính nhưng khác id vẫn là hai thực thể) — vd <code>Order</code>, <code>User</code>. <strong>Value Object</strong>: định danh bằng <em>giá trị</em>, không có id, <strong>immutable</strong> — vd <code>Money(amount, currency)</code>, <code>Address</code>, <code>DateRange</code>.</p><p>Value Object chặn state sai bằng cách <em>validate trong constructor</em> và không có setter → không thể tồn tại <code>Money</code> âm hay currency rỗng. Điều này gom logic hợp lệ về một chỗ thay vì rải khắp nơi.</p>",
  refs:[["Martin Fowler – ValueObject","https://martinfowler.com/bliki/ValueObject.html"]] },

{ id:"arch-004", legacy:90, t:"15 Clean Arch/DDD", lv:"middle", core:false,
  tags:["clean-arch-ddd"],
  q:"Vì sao interface của repository nên đặt ở domain layer, còn implementation ở infrastructure?",
  a:"<p>Domain định nghĩa <em>cần lưu/đọc gì</em> (interface, ngôn ngữ nghiệp vụ), infrastructure hiện thực <em>lưu bằng gì</em> (JPA/Mongo). Đây là <strong>Dependency Inversion</strong>: domain không phụ thuộc JPA, mà JPA phụ thuộc interface của domain.</p><p>Nhờ đó test domain bằng in-memory repo, đổi công nghệ lưu trữ không đụng nghiệp vụ.</p><div class='qb-gotcha'><b>⚠ Rò rỉ:</b> đừng để repository của domain trả về <code>Page&lt;T&gt;</code> của Spring hay entity JPA — đó là kéo chi tiết infra ngược vào domain.</div>",
  refs:[["Uncle Bob – Clean Architecture","https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html"]] },

{ id:"arch-005", legacy:91, t:"16 Design Patterns", lv:"middle", core:true,
  tags:["design-patterns"],
  q:"Strategy pattern giải quyết vấn đề gì? Cho ví dụ thay cho khối if/else dài.",
  a:"<p><strong>Strategy</strong> đóng gói mỗi thuật toán/hành vi thành một class riêng cùng implement một interface, rồi chọn cái phù hợp lúc runtime. Nó thay khối <code>if/else</code>/<code>switch</code> theo loại bằng <em>đa hình</em>.</p><p>Vd tính phí ship: thay vì <code>if(type==STANDARD)...else if(EXPRESS)...</code>, có <code>ShippingStrategy</code> với các implementation <code>StandardShipping</code>, <code>ExpressShipping</code>. Thêm loại mới = thêm class, không sửa code cũ (đúng OCP). Trong Spring có thể inject <code>Map&lt;String, ShippingStrategy&gt;</code>.</p><div class='qb-gotcha'><b>⚠ Đừng lạm dụng:</b> nếu chỉ có 2 nhánh cố định và không đổi, một if/else đơn giản dễ đọc hơn.</div>",
  refs:[["Refactoring.Guru – Strategy","https://refactoring.guru/design-patterns/strategy"]] },

{ id:"arch-006", legacy:92, t:"16 Design Patterns", lv:"middle", core:false,
  tags:["design-patterns"],
  q:"Factory Method / Abstract Factory dùng để làm gì?",
  a:"<p><strong>Factory Method</strong>: giao việc <em>tạo object</em> cho một method (thường override ở subclass) thay vì gọi <code>new</code> trực tiếp — tách 'dùng object' khỏi 'biết tạo loại nào'. <strong>Abstract Factory</strong>: tạo cả một <em>họ</em> object liên quan (vd UI theo theme: nút + ô nhập cùng phong cách).</p><p>Lợi ích: nơi dùng không phụ thuộc class cụ thể → dễ mở rộng thêm loại, dễ test (thay factory bằng bản mock). Đánh đổi: thêm lớp trừu tượng, đừng dùng khi chỉ có một loại đơn giản.</p>",
  refs:[["Refactoring.Guru – Factory Method","https://refactoring.guru/design-patterns/factory-method"]] },

{ id:"arch-007", legacy:93, t:"16 Design Patterns", lv:"senior", core:false,
  tags:["design-patterns"],
  q:"Khi nào design pattern trở nên PHẢN tác dụng (over-engineering)?",
  a:"<p>Pattern là công cụ giải quyết một vấn đề <em>cụ thể</em>; áp dụng khi vấn đề đó chưa tồn tại thì chỉ thêm phức tạp. Dấu hiệu over-engineering: 5 tầng abstraction cho một CRUD, interface chỉ có duy nhất một implementation 'phòng khi sau này', factory tạo factory.</p><p>Nguyên tắc: <strong>YAGNI</strong> (You Aren't Gonna Need It) và 'rule of three' — chấp nhận lặp 1-2 lần, chỉ trừu tượng hoá khi thấy pattern lặp thật sự và điểm biến thiên rõ ràng. Code đơn giản đọc được thắng code 'thông minh'.</p>",
  refs:[["Martin Fowler – Yagni","https://martinfowler.com/bliki/Yagni.html"]] },

{ id:"arch-008", legacy:94, t:"36 SOLID", lv:"middle", core:true,
  tags:["solid"],
  q:"SRP (Single Responsibility) thực chất nói gì? (không phải 'mỗi class làm một việc')",
  a:"<p>Phát biểu chuẩn: <em>một class chỉ nên có <strong>một lý do để thay đổi</strong></em> — tức phục vụ <strong>một actor/stakeholder</strong>. Không phải 'một việc' theo nghĩa hẹp.</p><p>Ví dụ kinh điển: class <code>Employee</code> có <code>calculatePay()</code> (bộ phận Tài chính yêu cầu), <code>reportHours()</code> (bộ phận Nhân sự), <code>save()</code> (DBA). Ba actor khác nhau có thể yêu cầu đổi ba method này vì lý do khác nhau → nên tách, để đổi cho actor này không vô tình phá phần của actor khác.</p>",
  refs:[["Uncle Bob – SRP","https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html"]] },

{ id:"arch-009", legacy:95, t:"36 SOLID", lv:"middle", core:false,
  tags:["solid"],
  q:"OCP (Open/Closed) đạt được bằng cơ chế nào? Cho ví dụ.",
  a:"<p><strong>Open for extension, closed for modification</strong>: thêm hành vi mới bằng cách <em>thêm code</em> (class mới) chứ không <em>sửa</em> code đã chạy ổn. Cơ chế: đa hình / interface / Strategy.</p><p>Vd hệ thống thanh toán: thêm phương thức mới (MoMo, ZaloPay) = thêm một implementation <code>PaymentMethod</code>, không phải mở lại và sửa <code>switch(type)</code> khổng lồ (dễ gây hồi quy). Sửa code cũ = rủi ro làm hỏng cái đang chạy.</p>",
  refs:[["Baeldung – SOLID","https://www.baeldung.com/solid-principles"]] },

{ id:"arch-010", legacy:96, t:"36 SOLID", lv:"middle", core:false,
  tags:["solid"],
  q:"LSP (Liskov Substitution) bị vi phạm khi nào? Ví dụ Rectangle/Square.",
  a:"<p><strong>LSP</strong>: object của subtype phải <em>thay thế được</em> supertype mà không phá hành vi mà code đang kỳ vọng.</p><p>Ví dụ: <code>Square extends Rectangle</code>. Code làm việc với <code>Rectangle</code> giả định <code>setWidth(5)</code> không đổi height. Nhưng <code>Square</code> phải giữ cạnh bằng nhau nên <code>setWidth</code> đổi luôn height → code dùng Rectangle 'gãy'. Vi phạm khác: override method rồi ném <code>UnsupportedOperationException</code> cho thao tác mà cha hỗ trợ.</p><div class='qb-eli5'><b>🌱 Ý chính:</b> kế thừa phải là 'thật sự thay thế được', không chỉ 'giống giống'.</div>",
  refs:[["Baeldung – Liskov","https://www.baeldung.com/java-liskov-substitution-principle"]] },

{ id:"arch-011", legacy:97, t:"36 SOLID", lv:"middle", core:true,
  tags:["solid"],
  q:"DIP (Dependency Inversion) nghĩa thực tế trong Spring là gì?",
  a:"<p><strong>DIP</strong>: module cấp cao và cấp thấp <em>đều phụ thuộc abstraction</em> (interface), không phụ thuộc implementation cụ thể; và abstraction không phụ thuộc chi tiết.</p><p>Trong Spring: service inject <em>interface</em> (<code>OrderRepository</code>) chứ không phải class cụ thể (<code>JpaOrderRepository</code>). Nhờ đó đổi implementation không sửa service, và test được bằng mock. DI của Spring chính là công cụ hiện thực DIP.</p><div class='qb-gotcha'><b>⚠ Phân biệt:</b> DIP (nguyên tắc thiết kế) khác DI (kỹ thuật tiêm dependency) — DI là một cách thực hiện DIP.</div>",
  refs:[["Baeldung – SOLID","https://www.baeldung.com/solid-principles"]] },

{ id:"arch-012", legacy:98, t:"17 Microservices", lv:"senior", core:true,
  tags:["microservices"],
  q:"Chia service theo ranh giới nào là đúng? Khi nào KHÔNG nên microservices?",
  a:"<p>Chia theo <strong>business capability / bounded context</strong> (DDD), sao cho mỗi service <em>sở hữu dữ liệu riêng</em> và thay đổi nghiệp vụ chủ yếu nằm gọn trong một service. Ranh giới sai (chia theo tầng kỹ thuật, hoặc quá nhỏ) → 'distributed monolith': mọi thay đổi phải sửa nhiều service + gọi chéo liên tục.</p><p><strong>Không nên microservices khi</strong>: team nhỏ, sản phẩm còn dò dẫm nghiệp vụ, chưa có nền tảng vận hành (CI/CD, observability). Chi phí phân tán (network, eventual consistency, deploy) là thật. Lời khuyên phổ biến: <em>bắt đầu bằng monolith module hoá</em>, tách khi có lý do rõ ràng.</p>",
  refs:[["Martin Fowler – MonolithFirst","https://martinfowler.com/bliki/MonolithFirst.html"]] },

{ id:"arch-013", legacy:99, t:"17 Microservices", lv:"middle", core:false,
  tags:["microservices"],
  q:"API Gateway làm gì? Nó có phải SPOF không? Auth nên đặt ở gateway hay ở service?",
  a:"<p><strong>API Gateway</strong> là cửa vào duy nhất: định tuyến, tổng hợp, rate limit, TLS termination, xác thực sơ bộ. Nó <em>có thể</em> thành SPOF → phải chạy nhiều instance + load balancer.</p><p>Auth: nên <strong>xác thực (verify token)</strong> ở gateway để chặn sớm request rác; nhưng <strong>authorization chi tiết theo nghiệp vụ</strong> (user này có sở hữu order kia không) nên ở service vì gateway không biết ngữ cảnh dữ liệu. Theo 'defense in depth', service vẫn không tin tưởng mù vào gateway.</p>",
  refs:[["Microservices.io – API Gateway","https://microservices.io/patterns/apigateway.html"]] },

{ id:"arch-014", legacy:144, t:"19 API Design", lv:"middle", core:true,
  tags:["api-design"],
  q:"Idempotency-Key trong REST API dùng thế nào? Cho method nào?",
  a:"<p>Client sinh một khoá duy nhất (UUID) cho mỗi <em>ý định</em> và gửi qua header <code>Idempotency-Key</code>. Server lưu (key → kết quả); nếu thấy key đã xử lý thì trả <em>kết quả cũ</em> thay vì làm lại. Nhờ đó client retry an toàn khi timeout/mạng lỗi mà không tạo trùng.</p><p>Chủ yếu cho <strong>POST</strong> (tạo đơn, thanh toán) — vốn không idempotent theo HTTP. GET/PUT/DELETE đã idempotent sẵn nên không cần. (Xem thêm chủ đề 33 để cài chống race.)</p>",
  refs:[["Stripe – Idempotent requests","https://stripe.com/docs/api/idempotent_requests"]] },

{ id:"arch-015", legacy:145, t:"19 API Design", lv:"middle", core:false,
  tags:["api-design"],
  q:"Có những cách versioning API nào? Thế nào là thay đổi 'breaking'?",
  a:"<p>Các cách: <strong>URL path</strong> (<code>/v1/orders</code>) — dễ thấy, dễ route, phổ biến nhất; <strong>header/media type</strong> (<code>Accept: application/vnd.api.v2+json</code>) — URL sạch nhưng khó test/cache; <strong>query param</strong> (<code>?version=2</code>).</p><p><strong>Breaking change</strong>: xoá/đổi tên field, đổi kiểu, thêm field bắt buộc, đổi nghĩa — làm client cũ hỏng. <em>Non-breaking</em>: thêm field optional, thêm endpoint. Nguyên tắc: cố giữ backward-compatible, chỉ bump major version khi buộc phải breaking, và có thời gian deprecate.</p>",
  refs:[["Microsoft – API versioning","https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#versioning-a-restful-web-api"]] },

{ id:"arch-016", legacy:146, t:"19 API Design", lv:"middle", core:false,
  tags:["api-design"],
  q:"Phân trang: offset-based và cursor-based khác nhau ra sao? Khi nào chọn cursor?",
  a:"<p><strong>Offset</strong> (<code>?page=5&size=20</code> → <code>LIMIT 20 OFFSET 80</code>): đơn giản, nhảy trang tuỳ ý, nhưng <em>chậm ở trang sâu</em> (DB phải đếm+bỏ qua N dòng) và <em>lệch dữ liệu</em> khi có insert/delete giữa lúc phân trang (trùng/sót bản ghi).</p><p><strong>Cursor</strong> (con trỏ tới vị trí cuối, thường theo id/timestamp: <code>WHERE id &lt; last_id ORDER BY id DESC LIMIT 20</code>): nhanh và <em>ổn định</em> bất kể trang sâu hay dữ liệu thay đổi. Hợp feed/infinite scroll/dữ liệu lớn. Nhược: không nhảy tới 'trang 100' tuỳ ý.</p>",
  refs:[["Slack – Cursor pagination","https://api.slack.com/docs/pagination"]] },

{ id:"arch-017", legacy:147, t:"19 API Design", lv:"middle", core:false,
  tags:["api-design"],
  q:"Rate limiting: token bucket và sliding window khác nhau ra sao? Trả status nào?",
  a:"<p><strong>Token bucket</strong>: bình chứa token, refill đều theo thời gian; mỗi request tốn 1 token → cho phép <em>burst</em> ngắn (dùng token tích luỹ) nhưng giới hạn tốc độ trung bình. Phổ biến, mượt.</p><p><strong>Sliding window</strong>: đếm request trong cửa sổ trượt → chính xác hơn <em>fixed window</em> (fixed window bị 'dồn' ở ranh giới: 2× giới hạn quanh mốc reset).</p><p>Vượt hạn trả <strong>429 Too Many Requests</strong> + header <code>Retry-After</code>. State phải lưu ở nơi dùng chung (Redis) khi chạy nhiều instance.</p>",
  refs:[["Cloudflare – Rate limiting","https://www.cloudflare.com/learning/bots/what-is-rate-limiting/"]] },

{ id:"arch-018", legacy:148, t:"Scalability", lv:"junior", core:true,
  tags:["scalability"],
  q:"Scale ngang (horizontal) và scale dọc (vertical) khác nhau? Load balancer đóng vai trò gì?",
  a:"<p><strong>Vertical (scale up)</strong>: cho một máy mạnh hơn (thêm CPU/RAM). Đơn giản nhưng có trần phần cứng và vẫn là <em>một điểm chết</em>. <strong>Horizontal (scale out)</strong>: thêm nhiều máy chạy song song → gần như không trần, chịu lỗi tốt (một máy chết còn máy khác), nhưng đòi hỏi app <strong>stateless</strong> và cần cân bằng tải.</p><p><strong>Load balancer</strong> đứng trước, phân phối request tới các instance (round-robin/least-conn), kiểm health để bỏ instance chết → cho phép scale ngang và deploy không downtime.</p><div class='qb-gotcha'><b>⚠ Điều kiện để scale ngang:</b> đừng giữ state trong RAM instance (session, cache cục bộ) — đẩy ra Redis/DB, nếu không request tới máy khác sẽ 'mất trí nhớ'.</div>",
  refs:[["System Design Primer – Scalability","https://github.com/donnemartin/system-design-primer#scalability"]] }

/* DATA_END */
] });
