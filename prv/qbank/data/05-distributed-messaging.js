/* ============================================================
   QBANK DATA — Distributed & Messaging   (prefix id: dist-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Distributed & Messaging",
  order: 5,
  prefix: "dist",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"dist-001", legacy:67, t:"13 Distributed Tx", lv:"senior", core:true,
  tags:["distributed-tx"],
  q:"2PC (Two-Phase Commit) gồm 2 phase nào? Kể 3 điểm yếu khiến microservices ít dùng.",
  a:"<p><strong>Phase 1 – Prepare</strong>: coordinator hỏi mọi participant 'chuẩn bị commit được chưa?', mỗi service khoá resource và vote READY. <strong>Phase 2 – Commit/Abort</strong>: nếu tất cả READY, coordinator ra lệnh commit; ngược lại abort.</p><ul><li><strong>Coordinator là SPOF</strong>: coordinator chết sau prepare → participant kẹt (in-doubt), giữ khoá.</li><li><strong>Blocking</strong>: giữ khoá suốt 2 phase → giảm throughput.</li><li><strong>Kém chịu network partition</strong>, khó scale.</li></ul><p>Vì vậy microservices thường thay bằng <strong>Saga</strong> (eventual consistency + compensation).</p>",
  refs:[["Microservices.io – Saga","https://microservices.io/patterns/data/saga.html"]] },

{ id:"dist-002", legacy:68, t:"13 Distributed Tx", lv:"senior", core:false,
  tags:["distributed-tx"],
  q:"Saga: Choreography và Orchestration khác nhau ra sao?",
  a:"<p><strong>Choreography</strong>: không có trung tâm — mỗi service phản ứng với event và phát event tiếp. Decoupled, nhưng luồng nghiệp vụ 'ẩn' trong các event → khó theo dõi/debug, dễ vòng lặp khi nhiều bước.</p><p><strong>Orchestration</strong>: một <em>orchestrator</em> điều phối tuần tự các bước và gọi compensation khi lỗi. State rõ ràng, dễ debug/giám sát, nhưng orchestrator thành điểm coupling tập trung.</p><div class='qb-eli5'><b>🌱 Ví von:</b> choreography = dàn nhạc jazz không nhạc trưởng (mỗi người nghe nhau); orchestration = dàn giao hưởng có nhạc trưởng chỉ huy.</div>",
  refs:[["Microservices.io – Saga","https://microservices.io/patterns/data/saga.html"]] },

{ id:"dist-003", legacy:69, t:"18 Event-Driven", lv:"senior", core:true,
  tags:["event-driven"],
  q:"'Dual-write problem' là gì? Outbox pattern giải quyết thế nào?",
  a:"<p><strong>Dual-write</strong>: bạn phải ghi DB <em>và</em> publish message (Kafka) — hai hệ thống khác nhau, không có transaction chung. Ghi DB xong app chết trước khi publish → mất event; hoặc publish xong DB rollback → event trỏ dữ liệu ma.</p><p><strong>Outbox</strong>: ghi business data + một bản ghi vào bảng <code>outbox</code> <strong>trong cùng một transaction DB</strong> (atomic). Một tiến trình riêng (poller hoặc CDC như Debezium) đọc outbox chưa gửi → publish Kafka → đánh dấu đã gửi. Nếu publish fail thì retry (nên consumer idempotent).</p>",
  refs:[["Microservices.io – Transactional Outbox","https://microservices.io/patterns/data/transactional-outbox.html"]] },

{ id:"dist-004", legacy:70, t:"13 Distributed Tx", lv:"senior", core:false,
  tags:["distributed-tx"],
  q:"Compensation transaction là gì? Có phải lúc nào cũng 'undo' được không?",
  a:"<p>Là thao tác <em>đảo ngược nghiệp vụ</em> của một bước Saga đã thành công (vd đã trừ tồn kho → cộng lại). Nó không phải 'rollback DB' mà là một hành động nghiệp vụ mới.</p><p><strong>Không phải lúc nào cũng undo được</strong>: email/SMS đã gửi không rút lại được → chấp nhận thực tế, đánh dấu trạng thái <code>COMPENSATED</code> và gửi thông báo đính chính, thay vì cố 'xoá' hành động. Thiết kế bước cần cân nhắc thứ tự (việc khó đảo để sau cùng).</p>",
  refs:[["Microservices.io – Saga","https://microservices.io/patterns/data/saga.html"]] },

{ id:"dist-005", legacy:71, t:"20 Kafka", lv:"middle", core:true,
  tags:["kafka"],
  q:"Partition key trong Kafka quyết định gì? Nếu key null thì sao? Thứ tự message được đảm bảo ở đâu?",
  a:"<p>Producer băm <strong>key</strong> → chọn partition; cùng key luôn vào <em>cùng partition</em>. Thứ tự message chỉ được đảm bảo <strong>trong một partition</strong>, KHÔNG phải toàn topic.</p><p>Nên nếu cần giữ thứ tự các sự kiện của cùng một thực thể (vd cùng <code>orderId</code>), hãy dùng nó làm key. <strong>Key null</strong> → phân phối round-robin → mất đảm bảo thứ tự theo thực thể.</p><div class='qb-eli5'><b>🌱 Cho người mới:</b> topic = con sông chia thành nhiều lạch (partition). Trong một lạch nước chảy đúng thứ tự; giữa các lạch thì không.</div>",
  refs:[["Kafka – Documentation","https://kafka.apache.org/documentation/"]] },

{ id:"dist-006", legacy:72, t:"20 Kafka", lv:"middle", core:true,
  tags:["kafka"],
  q:"Consumer group và rebalancing là gì? Vì sao quá nhiều rebalance là dấu hiệu xấu?",
  a:"<p>Trong một <strong>consumer group</strong>, mỗi partition được gán cho đúng <em>một</em> consumer → scale bằng cách thêm consumer (tối đa = số partition). <strong>Rebalancing</strong> là quá trình gán lại partition khi có consumer vào/ra.</p><p>Trong lúc rebalance, việc tiêu thụ <em>tạm dừng</em>. Rebalance liên tục (do consumer xử lý chậm quá <code>max.poll.interval</code>, hoặc heartbeat timeout) làm lag tăng, throughput sụt. Fix: xử lý nhanh trong vòng poll, tune timeout, dùng cooperative rebalancing.</p>",
  refs:[["Kafka – Consumer groups","https://kafka.apache.org/documentation/#intro_consumers"]] },

{ id:"dist-007", legacy:73, t:"20 Kafka", lv:"senior", core:false,
  tags:["kafka"],
  q:"Kafka giao 'at-least-once' nên có thể trùng. Làm sao để consumer không xử lý lặp gây double-effect?",
  a:"<p>Consumer crash sau khi xử lý nhưng trước khi commit offset → khi khởi động lại nhận lại message → xử lý 2 lần. Giải pháp là <strong>idempotent consumer</strong>:</p><ul><li>Mỗi message có <code>eventId</code>; trước khi xử lý, check đã thấy id này chưa (lưu ở DB/Redis) → thấy rồi thì skip.</li><li>Hoặc gói side-effect + lưu offset/eventId trong <em>cùng một DB transaction</em>.</li><li>Manual ack/commit sau khi xử lý xong.</li></ul><p>'Exactly-once về hiệu ứng' = at-least-once + idempotency ở phía consumer.</p>",
  refs:[["Confluent – Exactly-once","https://docs.confluent.io/kafka/design/delivery-semantics.html"]] },

{ id:"dist-008", legacy:74, t:"21 Async Patterns", lv:"middle", core:false,
  tags:["async-patterns"],
  q:"Listener Kafka xử lý một việc nặng (render 5 phút). Vì sao không nên xử lý trực tiếp trong listener?",
  a:"<p>Listener chạy trong vòng <em>poll</em> của consumer. Xử lý lâu → giữ partition, vượt <code>max.poll.interval.ms</code> → broker tưởng consumer chết → <strong>rebalance</strong> liên miên, lag dồn.</p><p>Cách đúng: listener chỉ <strong>enqueue job</strong> (ghi vào DB/queue nội bộ) và <em>ack nhanh</em>; một worker pool riêng xử lý việc nặng ở nền. Tách việc nặng khỏi vòng poll.</p>",
  refs:[["Kafka – Consumer config","https://kafka.apache.org/documentation/#consumerconfigs"]] },

{ id:"dist-009", legacy:75, t:"18 Event-Driven", lv:"middle", core:true,
  tags:["event-driven"],
  q:"Event và Command khác nhau ra sao? Vì sao kiến trúc event-driven giảm coupling?",
  a:"<p><strong>Command</strong>: yêu cầu ai đó <em>làm một việc</em> (<code>CreateOrder</code>), có người nhận cụ thể, kỳ vọng thực thi. <strong>Event</strong>: thông báo một việc <em>đã xảy ra</em> (<code>OrderCreated</code>), phát cho bất kỳ ai quan tâm, người phát không biết/không quan tâm ai nghe.</p><p>Event-driven giảm coupling vì producer không gọi trực tiếp consumer — thêm consumer mới (gửi email, cập nhật analytics) <em>không cần sửa</em> producer. Đánh đổi: luồng khó theo dõi hơn, cần lo eventual consistency và idempotency.</p>",
  refs:[["Martin Fowler – Event-Driven","https://martinfowler.com/articles/201701-event-driven.html"]] },

{ id:"dist-010", legacy:76, t:"21 Async Patterns", lv:"middle", core:false,
  tags:["async-patterns"],
  q:"Dead Letter Queue (DLQ) là gì và dùng khi nào?",
  a:"<p>DLQ là nơi chứa những message <em>xử lý thất bại nhiều lần</em> (poison message) để không chặn hàng đợi chính. Sau khi retry đủ số lần mà vẫn lỗi (vd payload hỏng, bug logic), message được chuyển sang DLQ để con người/quy trình xử lý riêng, còn consumer tiếp tục với message khác.</p><div class='qb-gotcha'><b>⚠ Đừng bỏ quên DLQ:</b> phải có alert khi DLQ có message + công cụ replay sau khi fix bug, nếu không dữ liệu 'chết' âm thầm.</div>",
  refs:[["AWS – Dead-letter queues","https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html"]] },

{ id:"dist-011", legacy:77, t:"20 Kafka", lv:"middle", core:false,
  tags:["kafka"],
  q:"Kafka và RabbitMQ khác nhau về bản chất thế nào? Chọn cái nào?",
  a:"<p><strong>Kafka</strong> là <em>distributed log</em>: message được ghi vào partition và <em>giữ lại</em> theo retention; consumer đọc theo offset, có thể tua lại (replay), nhiều consumer group đọc độc lập. Hợp: event streaming, throughput cao, replay, event sourcing.</p><p><strong>RabbitMQ</strong> là <em>message broker</em> truyền thống: routing linh hoạt (exchange/queue), message thường bị xoá sau khi ack. Hợp: task queue, routing phức tạp, RPC.</p><div class='qb-eli5'><b>🌱 Mẹo:</b> cần 'nhật ký sự kiện tua lại được' → Kafka; cần 'hàng đợi việc cần làm, giao xong là xong' → RabbitMQ.</div>",
  refs:[["Kafka – Introduction","https://kafka.apache.org/intro"]] }

/* DATA_END */
] });
