/* DIAGNOSTIC — Messaging, Distributed, Resilience, Ops, Testing, System Design. Schema: xem d1. */
DIAG.register({ items: [

{ id:"dg-msg-01", node:"msg-delivery", d:"msg", lv:"senior", dim:"predict",
  q:"Consumer Kafka xử lý xong message rồi mới commit offset (at-least-once). Consumer crash NGAY SAU khi xử lý xong nhưng TRƯỚC khi commit. Sau rebalance, chuyện gì xảy ra?",
  opts:[
    { t:"Message đó được giao lại và bị XỬ LÝ LẦN NỮA — consumer bắt buộc phải idempotent", ok:true },
    { t:"Message bị mất vì đã tiêu thụ rồi", why:"Ngược hoàn toàn: offset CHƯA commit nghĩa là với Kafka message 'chưa xử lý' → giao lại. At-least-once mất chiều 'mất message' nhưng đổi bằng chiều 'trùng message' — phải biết mình đứng ở vế nào của trade-off." },
    { t:"Kafka tự phát hiện đã xử lý và bỏ qua", why:"Kafka không biết gì về việc bạn 'đã xử lý' — nó chỉ biết OFFSET ĐÃ COMMIT. Trạng thái xử lý là chuyện của consumer; gán cho broker trí thông minh nó không có là nguồn thiết kế sai." },
    { t:"Không xảy ra vì Kafka mặc định exactly-once", why:"Exactly-once của Kafka (transactions/EOS) chỉ trong phạm vi hẹp Kafka-to-Kafka và phải bật chủ động, trả giá hiệu năng. Với side effect NGOÀI Kafka (ghi DB, gọi API), thế giới thực là at-least-once + idempotent consumer." }
  ],
  why:"Chuẩn thiết kế: at-least-once + consumer idempotent (unique constraint theo message key/id, hoặc bảng processed_messages). 'Đã xử lý chưa' phải là câu hỏi trả lời được bằng DỮ LIỆU, không bằng niềm tin vào broker.",
  fix:{ lesson:"20-apache-kafka.html", qb:"idempotency", inc:"inc-duplicate-message" } },

{ id:"dg-msg-02", node:"msg-kafka", d:"msg", lv:"middle", dim:"analyze",
  q:"Topic có 4 partition, consumer group có 4 consumer, lag tăng đều. Đội bạn thêm consumer thứ 5, 6 nhưng lag vẫn tăng y nguyên. Vì sao?",
  opts:[
    { t:"Số consumer hữu ích tối đa = số partition; consumer 5, 6 đứng KHÔNG — muốn thêm song song phải tăng partition hoặc tăng tốc xử lý mỗi message", ok:true },
    { t:"Consumer mới cần vài giờ warm-up mới nhận việc", why:"Rebalance gán partition diễn ra trong giây/phút, không có khái niệm 'warm-up vài giờ'. Nếu sau rebalance consumer vẫn idle — nó không có partition để nhận, vì 4 partition đã có chủ." },
    { t:"Phải tăng replication factor để chia tải đọc", why:"Replication là BẢN SAO cho độ bền/failover — consumer trong group chỉ đọc từ leader của mỗi partition. Nhầm replication (an toàn) với partitioning (song song) là lỗi khái niệm nền tảng của Kafka." },
    { t:"Lag tăng do broker chậm, cần thêm broker", why:"Có thể, nhưng bằng chứng đang chỉ hướng khác: thêm consumer không đổi gì = nút thắt ở mức ĐỘ SONG SONG (partition) hoặc tốc độ xử lý của consumer, không phải broker. Kiểm partition count trước khi mua thêm máy." }
  ],
  why:"Partition là đơn vị song song của Kafka: mỗi partition tối đa 1 consumer trong group. 4 partition = trần 4 consumer. Xử lý lag: tăng partition (cân nhắc ordering theo key!), tối ưu handler (batch, async), hoặc xem lại xử lý chậm do downstream.",
  fix:{ lesson:"20-apache-kafka.html", qb:"kafka", inc:"inc-duplicate-message" } },

{ id:"dg-msg-03", node:"msg-eda", d:"msg", lv:"senior", dim:"design",
  q:"Service phải: ghi đơn hàng vào DB <em>và</em> publish event <code>OrderCreated</code> lên Kafka — hai việc phải nhất quán (không được cái có cái không). Cách ĐÚNG?",
  opts:[
    { t:"Outbox pattern: ghi đơn + ghi event vào bảng outbox trong CÙNG transaction DB; một relay/CDC đọc outbox và publish sang Kafka (retry được)", ok:true },
    { t:"Publish Kafka ngay bên trong method @Transactional, cạnh câu lệnh insert", why:"Kafka KHÔNG tham gia transaction DB: publish xong mà transaction rollback → event 'ma' trỏ tới đơn không tồn tại; hoặc commit xong publish fail → đơn có mà event mất. Hai hệ thống, một transaction là ảo tưởng." },
    { t:"Publish trước, nếu thành công thì mới ghi DB", why:"Đảo thứ tự chỉ đảo chiều lỗi: publish xong ghi DB fail → consumer nhận event về đơn không bao giờ tồn tại. Vấn đề gốc (hai hệ không chung transaction) vẫn nguyên." },
    { t:"Dùng XA/2PC giữa Postgres và Kafka cho chuẩn ACID", why:"Kafka không hỗ trợ XA; và ngay cả nơi có XA, 2PC mang giá đắt (blocking, coordinator là điểm chết) nên hiện đại tránh dùng cho luồng nghiệp vụ thường. Outbox rẻ, chịu lỗi tốt và thành chuẩn de-facto." }
  ],
  why:"Outbox biến 'ghi 2 hệ thống' thành 'ghi 1 DB' (nguyên tử sẵn) + việc chuyển tiếp có retry. Đổi lại: event đến trễ chút (eventual) và consumer vẫn cần idempotent (relay retry gây trùng) — trade-off chấp nhận được trong đa số hệ.",
  fix:{ lesson:"18-event-driven-architecture.html", qb:"event-driven", inc:"inc-duplicate-message" } },

{ id:"dg-dist-01", node:"dist-basics", d:"dist", lv:"senior", dim:"decide",
  q:"Hệ thống ví điện tử nhân bản dữ liệu 2 datacenter. Mạng giữa 2 DC đứt (partition). Request 'xem số dư & rút tiền' đến DC bị cô lập. Theo CAP, lựa chọn ĐÚNG cho nghiệp vụ này?",
  opts:[
    { t:"Chọn C (từ chối/trả lỗi tạm thời) — thà không phục vụ còn hơn cho rút dựa trên số dư có thể đã cũ, dẫn tới rút quá tiền", ok:true },
    { t:"Chọn A (phục vụ bằng dữ liệu đang có) — hệ thống lớn không được phép từ chối user", why:"'Không bao giờ từ chối' nghe hay nhưng với TIỀN, phục vụ trên dữ liệu cũ = double spend, đối soát âm — chi phí sai lớn hơn chi phí từ chối tạm thời rất nhiều. Lựa chọn C/A phải theo chi phí sai của TỪNG nghiệp vụ." },
    { t:"Không phải chọn — thiết kế tốt sẽ có cả C và A kể cả khi mạng đứt", why:"Đây chính là hiểu nhầm CAP kinh điển: KHI partition xảy ra, node bị cô lập hoặc trả lời (có thể sai — mất C) hoặc từ chối (mất A) — về logic không có cửa thứ ba. Thiết kế tốt là chọn ĐÚNG CHỖ, không phải né được định lý." },
    { t:"Chọn A cho xem số dư và cả rút tiền, nhưng ghi log lại để đối soát sau", why:"Nửa hợp lý: XEM số dư có thể nghiêng A (hiện bản cũ + nhãn 'có thể chưa cập nhật'). Nhưng RÚT TIỀN là ghi có hậu quả — 'đối soát sau' nghĩa là chấp nhận mất tiền trước rồi đi đòi. Tách read/write và bảo vệ write mới là câu trả lời trưởng thành." }
  ],
  why:"CAP quyết định THEO THAO TÁC, không toàn hệ thống: đọc-hiển-thị có thể AP, ghi-tiền phải CP. Nói được 'chi phí của sai' cho từng thao tác là tư duy senior mà câu này muốn đo.",
  fix:{ lesson:"39-database-consistency.html", qb:"cap-theorem", inc:null } },

{ id:"dg-dist-02", node:"dist-tx", d:"dist", lv:"senior", dim:"decide",
  q:"Luồng đặt hàng qua 3 service: Order → trừ kho (Inventory) → trừ tiền (Payment). Cần nhất quán cuối cùng, chịu được một bước fail. Kiến trúc phù hợp nhất?",
  opts:[
    { t:"Saga: chuỗi transaction cục bộ + compensating action (hoàn kho, hoàn tiền) khi bước sau thất bại", ok:true },
    { t:"Một transaction @Transactional bọc cả 3 lời gọi service", why:"@Transactional chỉ phủ DB CỦA service hiện tại — lời gọi HTTP sang service khác nằm ngoài tầm rollback. Rollback local xong, kho bên kia vẫn đã trừ: bạn cần cơ chế BÙ (compensation), không phải annotation to hơn." },
    { t:"2PC với coordinator để cả 3 commit nguyên tử", why:"2PC yêu cầu mọi bên tham gia giao thức + khoá tài nguyên trong lúc chờ coordinator (điểm chết, blocking). Giữa các microservice qua HTTP/Kafka, 2PC gần như bất khả thi vận hành — ngành đã dịch chuyển sang saga có lý do." },
    { t:"Gọi 3 service song song cho nhanh, cái nào fail thì thôi", why:"'Fail thì thôi' = chấp nhận trừ tiền mà không giữ kho (hoặc ngược lại) như trạng thái CUỐI. Bạn vừa mô tả chính xác bug nhất quán dữ liệu, không phải kiến trúc." }
  ],
  why:"Saga đổi 'nguyên tử toàn cục' lấy 'nhất quán cuối cùng có kịch bản bù'. Giá phải trả thật: phải THIẾT KẾ hành động bù (hoàn tiền có thể fail — cần retry/queue), trạng thái trung gian lộ ra ngoài (đơn 'đang xử lý'). Nói được giá này mới là hiểu saga.",
  fix:{ lesson:"13-distributed-transaction.html", qb:"saga", inc:null } },

{ id:"dg-resil-01", node:"resil-patterns", d:"resil", lv:"middle", dim:"analyze",
  q:"Service gọi API đối tác KHÔNG đặt timeout. Đối tác chậm dần (không chết hẳn). Service của bạn sẽ chết theo kịch bản nào?",
  opts:[
    { t:"Thread xử lý request bị giam trong các call chờ mãi → pool cạn → mọi endpoint (kể cả không liên quan đối tác) cùng treo", ok:true },
    { t:"Không sao — đối tác chậm thì chỉ tính năng liên quan chậm theo", why:"Đúng nếu tài nguyên vô hạn — nhưng thread pool hữu hạn: mỗi call treo GIAM một thread. Khi cạn pool, endpoint chẳng liên quan gì cũng không có thread để chạy. Đây chính là cách lỗi LAN — cascading failure bài học số 1." },
    { t:"JVM tự ngắt các call quá lâu sau 60 giây", why:"Không có 'timeout mặc định của JVM' cho HTTP call. Không đặt = chờ vô hạn (hoặc theo default của thư viện — thường rất dài). Timeout là quyết định thiết kế BẠN phải đặt, ở mọi tầng." },
    { t:"Load balancer sẽ tự chuyển traffic khỏi service của bạn nên user không ảnh hưởng", why:"LB chuyển traffic khỏi instance UNHEALTHY — nhưng cả N instance của bạn cùng gọi đối tác chậm nên cùng cạn pool: LB chỉ chứng kiến cả cụm chết đều. LB không phải lá chắn cho lỗi phụ thuộc." }
  ],
  why:"Chuỗi kinh điển: dependency chậm → thread bị giam → pool cạn → chết lan. Phòng thủ nhiều lớp: timeout bắt buộc (connect + read) → retry có backoff CÓ GIỚI HẠN → circuit breaker (cắt sớm khi đối tác bệnh) → bulkhead (pool riêng cho từng dependency).",
  fix:{ lesson:"22-resilience-patterns.html", qb:"resilience", inc:"inc-retry-storm" } },

{ id:"dg-resil-02", node:"resil-patterns", d:"resil", lv:"middle", dim:"decide",
  q:"Config retry hiện tại: <code>maxAttempts=5, delay=0, retryOn=Exception.class</code>. Nhận xét đúng nhất?",
  opts:[
    { t:"Nguy hiểm kép: retry tức thì ×5 nhân tải đúng lúc downstream yếu nhất (retry storm), và retry cả lỗi KHÔNG NÊN retry (4xx, lỗi nghiệp vụ) — cần backoff + jitter + phân loại lỗi", ok:true },
    { t:"Hợp lý — retry càng nhiều càng tăng khả năng thành công", why:"Với lỗi TẠM (mạng nháy) thì vài retry giúp thật; nhưng khi downstream đang QUÁ TẢI, 5 retry tức thì = nhân 5 tải lên kẻ sắp gục — hàng nghìn client cùng làm vậy tạo sóng thần. Retry không phân loại là vũ khí tự sát tập thể." },
    { t:"Chỉ cần giảm maxAttempts xuống 3 là ổn", why:"Số lần chỉ là một trong BA vấn đề: vẫn thiếu backoff+jitter (tản thời điểm đấm lại) và thiếu phân loại lỗi (retry 400 Bad Request thì 100 lần vẫn 400 — phí tài nguyên che khuất lỗi thật)." },
    { t:"Nên bỏ hẳn retry vì rủi ro quá lớn", why:"Cực đoan ngược: mạng thật SẼ nháy, không retry = lỗi vặt thành lỗi user thấy. Câu trả lời kỹ sư là retry ĐÚNG CÁCH: ít lần, backoff + jitter, chỉ lỗi tạm (timeout, 503, 429-theo-Retry-After), kèm circuit breaker và idempotency phía ghi." }
  ],
  why:"Retry chuẩn: exponential backoff + jitter, giới hạn attempts, chỉ retry lỗi tạm thời, ghi = phải idempotent, và có circuit breaker đứng trên. Retry là con dao hai lưỡi đúng nghĩa — cấu hình mặc định bừa là lưỡi quay vào mình.",
  fix:{ lesson:"22-resilience-patterns.html", qb:"resilience", inc:"inc-retry-storm" } },

{ id:"dg-resil-03", node:"resil-idem", d:"resil", lv:"middle", dim:"decide",
  q:"Scheduled job gửi email nhắc hạn, chạy trên 3 instance — thi thoảng khách nhận 3 email giống nhau. Giải pháp GỐC RỄ nhất?",
  opts:[
    { t:"Chống trùng bằng ràng buộc dữ liệu: bảng <code>email_sent(invoice_id, ngay) UNIQUE</code> — instance nào insert được thì gửi; hoặc distributed lock + vẫn giữ unique làm lưới cuối", ok:true },
    { t:"Thêm synchronized vào method gửi email", why:"synchronized là khoá TRONG MỘT JVM — ba instance là ba JVM, khoá của ai người nấy giữ. Đây là misconception 'khoá local chống được trùng toàn hệ' — câu sai kinh điển nhất về scale-out." },
    { t:"Cấu hình chỉ chạy job trên instance số 1", why:"Chỉ định 'instance số 1' tạo single point of failure và mâu thuẫn với deploy hiện đại (instance vô danh, thay thế bất kỳ lúc nào). Nếu muốn single-runner tử tế: leader election/ShedLock — bản chất vẫn là KHOÁ CHUNG + lưới dữ liệu." },
    { t:"Cho 3 instance chạy lệch giờ nhau 5 phút", why:"Lệch giờ làm HẸP cửa trùng chứ không đóng: instance chậm/chạy bù/redeploy là đè lịch nhau ngay. Giải pháp thời gian cho bài toán tranh chấp là băng keo — điều kiện duy nhất đáng tin nằm ở DỮ LIỆU." }
  ],
  why:"Nguyên tắc: sự thật 'đã làm chưa' phải nằm ở nơi MỌI instance cùng nhìn (DB unique constraint là trọng tài rẻ và tuyệt đối nhất). Lock chỉ để đỡ tốn công tính trùng; constraint mới là bảo đảm.",
  fix:{ lesson:"33-idempotency.html", qb:"scale-out", inc:"inc-duplicate-message" } },

{ id:"dg-ops-01", node:"ops-obs", d:"ops", lv:"middle", dim:"analyze",
  q:"Sau release mới: p50 latency giữ nguyên 40ms, p99 nhảy từ 300ms lên 2.5s. Alert chưa kêu (threshold theo avg). Đọc tín hiệu này thế nào?",
  opts:[
    { t:"Đa số request vẫn nhanh nhưng một nhóm nhỏ chậm khủng khiếp — nghi các nguyên nhân 'thỉnh thoảng': GC pause, chờ connection pool, lock contention, N+1 với dữ liệu lớn, cache miss path", ok:true },
    { t:"p99 là nhiễu thống kê, p50 mới phản ánh trải nghiệm thật", why:"Ngược lại ở quy mô thật: 1% của 1 triệu request/ngày = 10.000 lượt bị 2.5s — và thường rơi vào user nặng (dữ liệu nhiều = khách quan trọng). Tail latency LÀ trải nghiệm, bỏ qua nó là bỏ rơi đúng nhóm user giá trị." },
    { t:"Do máy đo sai vì avg vẫn bình thường", why:"Avg bị p50 đông đảo kéo phẳng — nó MÙ với tail theo toán học, không phải máy sai. Chính vì thế alert theo avg là anti-pattern; SLO tử tế đặt trên percentile." },
    { t:"Server thiếu CPU, cần scale ngang ngay", why:"Thiếu CPU thường đẩy CẢ ĐƯỜNG CONG (p50 cũng tăng). p50 phẳng + p99 vọt chỉ về phía chờ-đợi-có-điều-kiện (pool, lock, GC) — scale thêm máy không chữa được lock contention hay N+1." }
  ],
  why:"Phân phối latency lệch phải; avg/p50 che tail. Điều tra: trace các request chậm (distributed tracing), tương quan thời điểm với GC log/pool metrics. Bài học thiết kế: alert theo p95/p99 + error rate, không theo avg.",
  fix:{ lesson:"26-observability.html", qb:"observability", inc:"inc-thread-starvation" } },

{ id:"dg-ops-02", node:"ops-docker", d:"ops", lv:"middle", dim:"analyze",
  q:"Pod Java bị Kubernetes <code>OOMKilled</code> dù đã set <code>-Xmx = memory limit của container</code>. Vì sao vẫn chết?",
  opts:[
    { t:"-Xmx chỉ giới hạn HEAP; process còn ăn ngoài heap: metaspace, thread stack, direct buffer, code cache... — tổng vượt limit là kernel giết; phải chừa 'khoảng thở' (vd heap ~50-75% limit)", ok:true },
    { t:"Kubernetes đo sai memory của JVM", why:"cgroup đếm RSS của PROCESS — chính xác theo đúng nghĩa của nó. 'Máy đo sai' hiếm khi là câu trả lời; 'mình đo thiếu thành phần' mới thường đúng: bạn chỉ đang nhìn heap trong khi kernel nhìn tất cả." },
    { t:"Do memory leak trong code Java", why:"Leak heap thì thường chết kiểu KHÁC: OutOfMemoryError trong JVM kèm GC quần quật trước đó. OOMKilled là kernel giết từ BÊN NGOÀI vì tổng RSS vượt limit — cấu hình sizing sai là nghi phạm số 1, leak là số 2 (kiểm sau)." },
    { t:"Phải tắt swap trên node là hết", why:"K8s mặc định đã chạy không swap; và swap không đổi được phép toán 'RSS &gt; limit → kill'. Đây là câu trả lời copy từ checklist cài đặt, không phải từ hiểu memory accounting." }
  ],
  why:"Memory JVM = heap + metaspace + N thread × stack + direct/NIO + JIT code cache + GC overhead. Sizing chuẩn: limit container → heap chiếm phần (MaxRAMPercentage 50-75%), phần còn cho non-heap; theo dõi RSS chứ không chỉ heap.",
  fix:{ lesson:"24-docker-kubernetes.html", qb:"docker-k8s", inc:"inc-memory-leak" } },

{ id:"dg-test-01", node:"test-strategy", d:"test", lv:"middle", dim:"decide",
  q:"Integration test tầng repository chạy H2 in-memory: xanh 100%. Lên staging (Oracle) query văng lỗi syntax và một bug khoá không tái hiện được trên H2. Kết luận & hướng đi?",
  opts:[
    { t:"Test DB nên chạy trên ĐÚNG engine production — dùng Testcontainers (Oracle/Postgres container) cho integration test; H2 chỉ còn hợp cho unit test siêu nhanh không đụng đặc thù dialect", ok:true },
    { t:"Viết query theo chuẩn SQL thuần để chạy được mọi DB", why:"'SQL thuần' là mục tiêu đẹp nhưng ảo với hệ thật: dialect, hành vi lock, function, plan… khác nhau tận gốc. Tránh hết đặc thù = từ bỏ sức mạnh của DB đang trả tiền. Test trên đồ thật rẻ hơn viết code cho DB tưởng tượng." },
    { t:"Giữ H2, bổ sung test thủ công trên staging trước mỗi release", why:"Kiểm thủ công không lặp lại được, không chặn PR, và chạy SAU khi code đã trộn — lỗi phát hiện muộn đắt gấp nhiều lần. Mục tiêu của integration test là tự động bắt đúng loại lỗi này TRƯỚC khi merge." },
    { t:"Mock hết tầng repository là khỏi cần DB trong test", why:"Mock repository thì thứ được test chỉ còn... mock. Lỗi dialect/lock nằm CHÍNH TRONG tầng chạm DB — mock nó đi là xoá luôn đối tượng cần kiểm. Mock đúng chỗ: ở RANH GIỚI khi test tầng khác, không phải để né DB trong test tầng DB." }
  ],
  why:"Nguyên tắc: test càng gần production càng đáng tin. Testcontainers cho DB thật trong Docker — chậm hơn H2 nhưng bắt được dialect/lock/migration thật; trả giá bằng vài giây CI là rẻ.",
  fix:{ lesson:"27-testing-strategy.html", qb:"testing-strategy", inc:null } },

{ id:"dg-des-01", node:"des-sysdes", d:"sysdes", lv:"senior", dim:"design",
  q:"Hệ đọc-nhiều (đọc:ghi = 100:1) sắp tăng tải đọc ×10. DB hiện là 1 instance Postgres đã tối ưu index. Thứ tự leo thang HỢP LÝ nhất?",
  opts:[
    { t:"Cache cho dữ liệu đọc nóng (đo hit rate) → read replica cho phần đọc còn lại → CDN/edge nếu là nội dung tĩnh → sharding chỉ khi tải GHI/dung lượng vượt một máy", ok:true },
    { t:"Shard database ngay từ bây giờ cho tương lai xa", why:"Sharding là phương án ĐẮT NHẤT và khó lùi nhất (mất join/transaction xuyên shard, resharding là dự án). Tải ĐỌC ×10 có lời giải rẻ hơn nhiều tầng (cache, replica). Chọn vũ khí to nhất trước là dấu hiệu chưa từng trả giá vận hành." },
    { t:"Chuyển sang NoSQL vì Postgres không scale được", why:"'Postgres không scale' là khẩu hiệu, không phải phân tích: đọc-nhiều là kịch bản Postgres + replica + cache xử lý tốt tới quy mô rất lớn. Đổi cả mô hình dữ liệu (mất transaction, học lại vận hành) phải có lý do CỤ THỂ hơn một nỗi sợ." },
    { t:"Nâng cấp máy DB lên cấu hình to nhất có thể", why:"Scale up hợp lệ và nên nằm trong lộ trình, nhưng đứng MỘT MÌNH thì: trần cứng, giá phi tuyến, và không thêm được availability. Với đọc:ghi 100:1, cache+replica giải phóng DB hiệu quả hơn hẳn mua máy to." }
  ],
  why:"Nguyên tắc leo thang: giải pháp rẻ-dễ-lùi trước (cache, replica), đắt-khó-lùi sau (shard). Mỗi bước phải kèm ĐO (hit rate, replica lag, tỉ lệ đọc sau ghi cần strong consistency — cache/replica mang theo vấn đề staleness phải xử lý).",
  fix:{ lesson:"37-system-design-interview.html", qb:"scalability", inc:null } },

{ id:"dg-des-02", node:"des-clean", d:"sysdes", lv:"middle", dim:"analyze",
  q:"<code>OrderService</code> 3.200 dòng: tính giá, gọi kho, gửi email, xuất PDF, ghi audit, retry logic tự chế. Mỗi sprint sửa gì cũng đụng nó, test class này mất 40 phút. Chẩn đoán gốc + bước refactor ĐẦU TIÊN hợp lý?",
  opts:[
    { t:"Vi phạm Single Responsibility — nhiều LÝ DO THAY ĐỔI trộn một chỗ; bước đầu: vẽ ranh giới trách nhiệm, tách dần từng cụm (PricingService, NotificationService...) sau lưng interface, có test đặc tả hành vi trước khi tách", ok:true },
    { t:"Class dài là bình thường với nghiệp vụ phức tạp, chỉ cần thêm comment chia vùng", why:"Vấn đề không phải SỐ DÒNG mà là SỐ LÝ DO THAY ĐỔI chồng lên nhau: sửa email rung cả tính giá, test chậm vì dựng cả thế giới. Comment không giảm coupling — nó chỉ đánh số phòng trong một căn nhà không vách." },
    { t:"Viết lại từ đầu thành microservices cho mỗi chức năng", why:"Nhảy từ 'class to' sang 'network boundary' là leo 3 bậc thang một lúc: bạn đổi bug compile-time lấy bug phân tán (timeout, nhất quán). Tách MODULE trong process trước; microservice là quyết định tổ chức/scale, không phải thuốc trị class dài." },
    { t:"Thêm máy CI mạnh hơn để test chạy nhanh, còn code giữ nguyên", why:"Test chậm ở đây là TRIỆU CHỨNG của coupling (phải dựng mọi dependency để test một nhánh). Mua máy che triệu chứng thì bệnh coupling vẫn tăng theo mỗi sprint — chi phí sửa chỉ càng đắt." }
  ],
  why:"SRP nói về 'lý do thay đổi'. Refactor an toàn: đặc tả hành vi bằng test → tách trách nhiệm ra sau interface → chuyển dần call-site. Điểm senior: biết tách TRONG process trước khi bàn chuyện tách QUA mạng.",
  fix:{ lesson:"36-clean-code-solid.html", qb:"solid", inc:null } }

]});
