/* DIAGNOSTIC — Database, Cache. Schema: xem d1. */
DIAG.register({ items: [

{ id:"dg-db-01", node:"data-sql-tuning", d:"data", lv:"middle", dim:"predict",
  q:"Bảng <code>orders</code> có index trên <code>created_at</code>. Query nào KHÔNG tận dụng được index đó?",
  opts:[
    { t:"<code>WHERE DATE(created_at) = '2026-07-01'</code>", ok:true },
    { t:"<code>WHERE created_at &gt;= '2026-07-01' AND created_at &lt; '2026-07-02'</code>", why:"Đây chính là cách viết ĐÚNG để dùng index (range scan trên giá trị gốc). Nếu bạn chọn nó, bạn đang nhớ ngược quy tắc sargable." },
    { t:"<code>WHERE created_at &gt; now() - interval '7 days'</code>", why:"Hàm ở đây tác động lên HẰNG SỐ (vế phải), không lên cột — tính ra một mốc rồi range scan bình thường. Index chỉ 'mù' khi hàm bọc lên CỘT." },
    { t:"<code>ORDER BY created_at DESC LIMIT 10</code>", why:"Index là dữ liệu đã sắp thứ tự — đọc ngược 10 entry cuối là xong, khỏi sort. Đây là một trong những chỗ index toả sáng nhất." }
  ],
  why:"Index xếp theo GIÁ TRỊ GỐC của cột. Bọc hàm lên cột (DATE(), UPPER()...) nghĩa là so sánh trên giá trị đã biến đổi — thứ tự sắp sẵn vô nghĩa, DB đành tính hàm cho từng dòng (mất sargability). Luôn đảo phép biến đổi sang phía hằng số.",
  fix:{ lesson:"11-sql-advanced.html", qb:"sargable", inc:"inc-n-plus-one" } },

{ id:"dg-db-02", node:"data-sql-tuning", d:"data", lv:"middle", dim:"predict",
  q:"Có composite index <code>(customer_id, status, created_at)</code>. Query <code>WHERE status = 'PAID' AND created_at &gt; ?</code> (không có customer_id) sẽ?",
  opts:[
    { t:"Gần như không dùng được index này — thiếu cột đầu (leftmost prefix), các giá trị status nằm rải rác khắp index", ok:true },
    { t:"Dùng tốt vì 2/3 cột của index xuất hiện trong WHERE", why:"Index không phải checklist 'có mặt bao nhiêu cột' — nó là dữ liệu xếp lồng: theo customer_id TRƯỚC, rồi mới status. Thiếu customer_id thì status 'PAID' nằm tản mát trong từng nhóm customer — không nhảy thẳng được." },
    { t:"Dùng được nếu đổi thứ tự điều kiện trong WHERE cho khớp index", why:"Thứ tự viết điều kiện trong WHERE không quan trọng (optimizer tự sắp) — thứ tự CỘT TRONG INDEX mới quyết định. Hai thứ tự này hay bị nhầm là một." },
    { t:"PostgreSQL tự tạo index tạm cho query này", why:"Không DB nào tự tạo index theo query (tạo index đắt và ảnh hưởng ghi). Optimizer chỉ chọn giữa những gì ĐÃ có — thiết kế index là việc của người, mọc từ query thật." }
  ],
  why:"Luật leftmost prefix: index (a,b,c) phục vụ điều kiện a / a+b / a+b+c. Query thường theo status+created_at → cần index riêng bắt đầu bằng status, vd (status, created_at).",
  fix:{ lesson:"11-sql-advanced.html", qb:"composite-index", inc:null } },

{ id:"dg-db-03", node:"data-tx", d:"data", lv:"middle", dim:"predict",
  q:"Isolation READ COMMITTED (mặc định Postgres). Hai request đồng thời chạy logic: <code>SELECT so_luong FROM kho WHERE id=1</code> (cả hai thấy 1) → app kiểm tra <code>1 &gt; 0</code> → <code>UPDATE kho SET so_luong = so_luong - 1</code>. Kho còn 1 món. Kết quả?",
  opts:[
    { t:"Bán lố: cả hai request thành công, kho về -1 — READ COMMITTED không bảo vệ pattern đọc-kiểm-ghi", ok:true },
    { t:"Request thứ hai bị DB chặn với lỗi serialization", why:"Lỗi serialization chỉ có ở mức SERIALIZABLE. READ COMMITTED cho phép cả hai commit êm đẹp — vấn đề nằm ở QUYẾT ĐỊNH dựa trên dữ liệu đã cũ, thứ isolation mặc định không canh giúp." },
    { t:"Không sao vì UPDATE có khoá dòng, request sau phải chờ", why:"Chờ thì có chờ — nhưng chờ xong nó vẫn UPDATE TIẾP trên dòng đã bị trừ (so_luong - 1 tính trên giá trị mới = 0 → -1). Khoá dòng của UPDATE không quay ngược thời gian sửa cái CHECK đã làm trên dữ liệu cũ." },
    { t:"Kho về 0 vì hai UPDATE gộp làm một", why:"DB không 'gộp' các update — mỗi cái trừ 1 lần lượt. Đây là suy nghĩ lạc quan hoá nguy hiểm: hệ thống không tự hiểu ý định nghiệp vụ 'không âm kho' trừ khi bạn nói ra (constraint/điều kiện)." }
  ],
  why:"Check-then-act là race bất kể isolation mặc định. Sửa đúng: điều kiện nguyên tử trong chính câu UPDATE — <code>UPDATE kho SET so_luong = so_luong - 1 WHERE id = 1 AND so_luong &gt; 0</code> rồi kiểm affected rows; hoặc SELECT FOR UPDATE; hoặc constraint CHECK (so_luong &gt;= 0) làm lưới cuối.",
  fix:{ lesson:"39-database-consistency.html", qb:"isolation-level", inc:"inc-db-deadlock" } },

{ id:"dg-db-04", node:"data-tx", d:"data", lv:"senior", dim:"analyze",
  q:"Log Postgres nửa đêm: <code>ERROR: deadlock detected — Process 118 waits for row X (held by 231); Process 231 waits for row Y (held by 118)</code>, trùng giờ chạy 2 batch job. Phân tích + hướng xử lý gốc?",
  opts:[
    { t:"Hai job khoá các dòng theo THỨ TỰ khác nhau rồi chờ chéo; sửa bằng cách cả hai xử lý bản ghi theo cùng một thứ tự (vd ORDER BY id) + retry khi dính deadlock error", ok:true },
    { t:"Postgres bug — deadlock là lỗi của DB engine, cần nâng version", why:"DB PHÁT HIỆN và phá deadlock (giết một nạn nhân) là nó đang làm ĐÚNG việc. Vòng chờ do thứ tự khoá của code tạo ra — nâng version không đổi được thứ tự code bạn khoá dòng." },
    { t:"Tách hai job chạy cách nhau 1 tiếng là hết", why:"Lịch chạy là băng keo: job trễ, chạy lại, thêm job thứ ba... là đụng lại ngay. Nguyên nhân gốc (thứ tự khoá không thống nhất) vẫn nguyên — và một ngày nó xuất hiện trong giờ cao điểm thay vì nửa đêm." },
    { t:"Bọc cả hai job trong một transaction lớn dùng SERIALIZABLE", why:"SERIALIZABLE không chống deadlock (thậm chí thêm cơ hội xung đột + serialization failure phải retry). Transaction to hơn = giữ khoá lâu hơn = dễ kẹt hơn. Đi ngược nguyên tắc 'transaction ngắn, khoá theo thứ tự'." }
  ],
  why:"Deadlock DB = chờ khoá vòng tròn. Phòng: (1) thứ tự khoá thống nhất toàn hệ (sort id trước khi update hàng loạt), (2) transaction ngắn, (3) index đủ để UPDATE không quét-khoá thừa, (4) app bắt đúng mã lỗi deadlock và retry — nó là lỗi tạm thời theo thiết kế.",
  fix:{ lesson:"39-database-consistency.html", qb:"deadlock", inc:"inc-db-deadlock" } },

{ id:"dg-db-05", node:"data-sql-core", d:"data", lv:"junior", dim:"predict",
  q:"Query 'mọi user kèm đơn PAID nếu có': <code>SELECT * FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.status = 'PAID'</code>. Kết quả thực tế?",
  opts:[
    { t:"User không có đơn PAID biến mất — WHERE lọc NULL làm LEFT JOIN hoá INNER JOIN; điều kiện phải chuyển vào ON", ok:true },
    { t:"Đúng yêu cầu: mọi user đều xuất hiện, ai không có đơn PAID thì cột đơn là NULL", why:"Đó là kết quả bạn MUỐN — nhưng WHERE chạy SAU khi join: dòng user-không-khớp có o.status = NULL, mà NULL = 'PAID' cho UNKNOWN → bị WHERE loại. Muốn giữ: ...LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'PAID'." },
    { t:"Lỗi cú pháp vì WHERE không được tham chiếu bảng LEFT JOIN", why:"Cú pháp hoàn toàn hợp lệ — đó mới là cái bẫy: query chạy êm, trả kết quả 'trông hợp lý', chỉ THIẾU dòng. Loại bug không-có-lỗi này sống rất lâu trong báo cáo." },
    { t:"Kết quả như INNER JOIN nhưng chậm hơn vì LEFT JOIN nặng hơn", why:"Vế ngữ nghĩa (thành INNER) đúng, nhưng optimizer thấy WHERE như vậy sẽ tự quy hoạch như INNER — không có khoản 'chậm hơn' đáng kể. Đừng thêm thuyết hiệu năng không có cơ sở vào phân tích." }
  ],
  why:"Với LEFT JOIN: điều kiện lọc BẢNG PHẢI đặt trong ON (tham gia lúc ghép); WHERE trên cột bảng phải sẽ loại các dòng NULL — mất chữ LEFT. Ngược lại, điều kiện bảng trái để ở WHERE là bình thường.",
  fix:{ lesson:"11-sql-advanced.html", qb:"join", inc:null } },

{ id:"dg-db-06", node:"data-pool", d:"data", lv:"junior", dim:"analyze",
  q:"Giờ cao điểm, hàng loạt request lỗi <code>HikariPool - Connection is not available, request timed out after 30000ms</code>. CPU của database chỉ 15%. Điều tra hướng nào TRƯỚC?",
  opts:[
    { t:"Tìm nơi giữ connection quá lâu: transaction dài (gọi API ngoài bên trong transaction), query chậm, hoặc connection leak — bật leakDetectionThreshold", ok:true },
    { t:"Tăng maximumPoolSize từ 10 lên 100 ngay để chữa cháy", why:"DB CPU 15% nghĩa là DB không quá tải — vấn đề là connection bị GIỮ chứ không phải THIẾU. Tăng pool khi có leak chỉ kéo dài thời gian tới lần cạn sau, và 100 connection có thể tự làm DB nghẽn thật." },
    { t:"Scale thêm instance app để có thêm pool", why:"Mỗi instance mới mang leak/transaction dài của chính nó theo — bạn đang nhân bản nguyên nhân. Và tổng connection tăng vọt có thể đè DB. Chẩn đoán trước, scale sau." },
    { t:"DB đang quá tải nên trả connection chậm", why:"Bằng chứng nói ngược lại: CPU DB 15%. Lỗi này là app CHỜ MƯỢN connection từ pool của chính nó — nút thắt ở phía app đang ôm connection, không phải DB hụt hơi." }
  ],
  why:"Pool cạn với DB nhàn = connection bị giam. Thủ phạm quen: @Transactional bọc cả lời gọi HTTP chậm (connection bị giữ suốt thời gian chờ), quên đóng resource, query thiếu index chạy lâu. Chuỗi xử lý: đo (leakDetection, metrics active/idle) → tìm nơi giữ → sửa → rồi mới cân nhắc size.",
  fix:{ lesson:"09-spring-data-jpa.html", qb:"connection-pool", inc:"inc-pool-exhaustion" } },

{ id:"dg-cache-01", node:"cache-patterns", d:"cache", lv:"middle", dim:"decide",
  q:"Cache-aside cho <code>product:{id}</code>. Khi UPDATE sản phẩm trong DB, bước tiếp theo với cache nên là gì?",
  opts:[
    { t:"XOÁ (invalidate) key đó — lần đọc sau tự nạp bản mới từ DB", ok:true },
    { t:"SET lại cache bằng giá trị mới ngay trong lúc update", why:"Nghe chủ động hơn nhưng mở ra race: hai update gần nhau có thể SET theo thứ tự ngược (bản cũ đè bản mới) và nằm lì tới hết TTL. XOÁ thì tệ nhất chỉ là một lần cache miss — sai lệch tự sửa." },
    { t:"Không cần làm gì — TTL sẽ tự làm mới", why:"Trong suốt phần còn lại của TTL (có thể nhiều phút), mọi người đọc GIÁ CŨ — với dữ liệu như giá bán, tồn kho là ăn complaint ngay. TTL là lưới an toàn cuối, không phải cơ chế cập nhật chính." },
    { t:"Xoá TOÀN BỘ cache cho chắc ăn", why:"Flush all vì một sản phẩm đổi = tự gây cache avalanche: mọi key cùng miss, DB lãnh nguyên tải. Phạm vi invalidation phải hẹp đúng bằng dữ liệu đổi." }
  ],
  why:"Chuẩn cache-aside: ghi DB → DELETE key. Đơn giản, tự phục hồi, khe hở nhỏ (giữa ghi và xoá) chấp nhận được với TTL hợp lý. Nói thêm được delayed double delete / ghi qua queue cho yêu cầu chặt hơn là điểm cộng.",
  fix:{ lesson:"14-redis.html", qb:"cache-aside", inc:"inc-cache-stampede" } },

{ id:"dg-cache-02", node:"cache-failures", d:"cache", lv:"senior", dim:"analyze",
  q:"Cứ đúng ~03:00 mỗi đêm, DB load vọt gấp 10 trong 2 phút rồi tự hết. Đêm đó có job warm-cache chạy lúc 02:00, set hàng chục nghìn key với <code>TTL = 3600s</code>. Nguyên nhân khả dĩ nhất?",
  opts:[
    { t:"Cache avalanche: cả loạt key được set cùng lúc nên HẾT HẠN cùng lúc (02:00 + 1h) — mọi request sau đó cùng miss, dồn về DB; sửa bằng TTL + jitter ngẫu nhiên", ok:true },
    { t:"Cache penetration: ai đó quét các key không tồn tại", why:"Penetration đến từ truy vấn dữ liệu KHÔNG TỒN TẠI và thường rải rác/liên tục — không giải thích được tính chu kỳ 'đúng 03:00' khớp hoàn hảo với 02:00 + TTL 3600s. Đọc mối tương quan thời gian trong bằng chứng!" },
    { t:"Hot key bị breakdown khi một sản phẩm nổi tiếng hết hạn cache", why:"Breakdown là MỘT key nóng — gây spike theo sự kiện nội dung, không theo lịch cố định hằng đêm, và một key khó kéo DB gấp 10 suốt 2 phút. Quy mô + chu kỳ chỉ về phía avalanche." },
    { t:"Backup database tự động chạy lúc 03:00", why:"Giả thuyết hợp lý để kiểm — nhưng dữ kiện 'job warm 02:00 + TTL 3600' đã cho lời giải khớp từng phút. Kỹ năng ở đây là đối chiếu timeline các sự kiện trước khi tìm nghi phạm mới." }
  ],
  why:"Set đồng loạt = hẹn giờ chết đồng loạt. Chữa: TTL = base + random (vd 3600 ± 300s) để tản thời điểm hết hạn; key cực nóng thì refresh chủ động/logical expiration; và app cần phanh (rate limit xuống DB) làm lưới cuối.",
  fix:{ lesson:"14-redis.html", qb:"cache-avalanche", inc:"inc-cache-stampede" } },

{ id:"dg-cache-03", node:"cache-redis", d:"cache", lv:"junior", dim:"decide",
  q:"Đội bạn muốn dùng Redis (chưa bật persistence) làm nơi lưu DUY NHẤT cho lịch sử tin nhắn chat. Đánh giá đúng?",
  opts:[
    { t:"Sai vai: Redis in-memory, restart/sự cố là mất; dữ liệu nguồn sự thật phải nằm ở DB bền, Redis chỉ nên là cache/tầng tăng tốc có thể dựng lại", ok:true },
    { t:"Ổn vì Redis nhanh, chat cần realtime", why:"Nhanh không thay được BỀN. Câu hỏi đúng không phải 'nhanh không' mà 'mất được không' — lịch sử chat là dữ liệu nguồn sự thật, mất là mất thật, không dựng lại từ đâu được." },
    { t:"Ổn nếu bật AOF vì AOF ghi mọi lệnh ra đĩa", why:"AOF nâng độ bền đáng kể nhưng Redis vẫn thiếu các bảo đảm của DB thật cho dữ liệu chính (fsync mặc định mỗi giây = vẫn có cửa mất, câu chuyện backup/query/quan hệ...). Kiến trúc đúng vai: DB bền làm gốc + Redis tăng tốc phía trước." },
    { t:"Sai vì Redis chỉ lưu được string", why:"Redis có list, hash, sorted set... — mô hình hoá tin nhắn được. Lý do từ chối nằm ở độ bền và vai trò kiến trúc, không phải kiểu dữ liệu. Bắt đúng bệnh mới ra đúng thuốc." }
  ],
  why:"Nguyên tắc phân vai: dữ liệu trong cache phải là thứ 'mất được và dựng lại được' từ nguồn sự thật. Thiết kế chuẩn cho chat: ghi DB (source of truth) + Redis cho tin gần nhất/presence/pubsub.",
  fix:{ lesson:"14-redis.html", qb:"redis", inc:null } }

]});
