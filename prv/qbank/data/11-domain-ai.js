/* ============================================================
   QBANK DATA — Domain & AI   (prefix id: dom-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Domain & AI",
  order: 11,
  prefix: "dom",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"dom-001", legacy:122, t:"35 Payment", lv:"middle", core:true,
  tags:["payment"],
  q:"Trong thanh toán thẻ, authorize / capture / settle khác nhau ra sao?",
  a:"<p><strong>Authorize</strong>: hỏi ngân hàng 'thẻ này còn đủ tiền và hợp lệ?' → <em>giữ</em> (hold) số tiền, chưa trừ thật. <strong>Capture</strong>: yêu cầu <em>thực sự</em> lấy số tiền đã authorize (thường khi giao hàng/hoàn tất). <strong>Settle(ment)</strong>: ngân hàng chuyển tiền thật giữa các bên, thường theo batch cuối ngày.</p><p>Tách authorize/capture cho phép mô hình 'giữ tiền trước, tính tiền sau' (khách sạn giữ cọc, bán hàng chỉ capture khi ship). Auth có thể hết hạn nếu không capture kịp.</p><div class='qb-eli5'><b>🌱 Ví von:</b> authorize = 'tạm giữ chỗ tiền'; capture = 'thu tiền thật'; settle = 'tiền về túi người bán'.</div>",
  refs:[["Stripe – Auth and capture","https://stripe.com/docs/payments/capture-later"]] },

{ id:"dom-002", legacy:123, t:"35 Payment", lv:"middle", core:false,
  tags:["payment"],
  q:"Vì sao hệ thống tài chính dùng 'double-entry ledger' (bút toán kép)?",
  a:"<p>Mỗi giao dịch được ghi thành ít nhất <em>hai bút toán</em> đối ứng: một bên ghi nợ (debit), một bên ghi có (credit), tổng luôn = 0. Số dư tài khoản được <em>suy ra từ tổng các bút toán</em>, không sửa trực tiếp.</p><p>Lợi ích: (1) mọi thay đổi tiền đều có nguồn gốc truy vết được; (2) bất biến 'tổng debit = tổng credit' giúp phát hiện sai lệch; (3) append-only, không ghi đè → hợp audit. Đây là chuẩn kế toán hàng trăm năm, áp vào phần mềm để dữ liệu tiền luôn cân.</p>",
  refs:[["Martin Fowler – Accounting patterns","https://martinfowler.com/eaaDev/AccountingNarrative.html"]] },

{ id:"dom-003", legacy:124, t:"35 Payment", lv:"middle", core:false,
  tags:["payment"],
  q:"Reconciliation (đối soát) là gì và vì sao bắt buộc phải có?",
  a:"<p>Reconciliation là việc <em>so khớp</em> dữ liệu hệ thống của bạn với dữ liệu của bên thứ ba (ngân hàng/cổng thanh toán) theo kỳ (thường hằng ngày), tìm và xử lý các khoản <em>lệch</em>.</p><p>Vì sao cần: hệ phân tán + mạng không tin cậy → luôn có ca 'ta nghĩ thành công nhưng đối tác báo fail' (hoặc ngược lại), timeout không rõ kết quia, webhook trễ. Không đối soát thì tiền lệch âm thầm. Đối soát là <em>lưới an toàn cuối cùng</em> cho tính đúng đắn về tiền.</p>",
  refs:[["Stripe – Reconciliation","https://stripe.com/docs/reports/reconciliation"]] },

{ id:"dom-004", legacy:125, t:"35 Payment", lv:"middle", core:false,
  tags:["payment"],
  q:"Nhận webhook từ cổng thanh toán: phải xử lý 2 điều gì để an toàn?",
  a:"<p>(1) <strong>Verify chữ ký</strong>: webhook đến từ Internet, ai cũng POST tới được → phải kiểm HMAC signature (dùng secret) để chắc nó thật sự từ provider, không phải kẻ giả mạo báo 'đã thanh toán'.</p><p>(2) <strong>Idempotent</strong>: provider gửi <em>lại</em> webhook khi chưa nhận được 2xx (at-least-once) → cùng một sự kiện có thể tới nhiều lần. Lưu <code>event_id</code> đã xử lý và bỏ qua bản trùng, nếu không sẽ cộng tiền/giao hàng nhiều lần.</p>",
  refs:[["Stripe – Webhooks","https://stripe.com/docs/webhooks"]] },

{ id:"dom-005", legacy:126, t:"34 Audit Logging", lv:"middle", core:true,
  tags:["audit-logging"],
  q:"Audit log 'tamper-evident' (chống sửa lén) cần gì? Hash chain hoạt động ra sao?",
  a:"<p>Audit phải <strong>append-only</strong> (chỉ thêm, không sửa/xoá) và <em>phát hiện được nếu bị can thiệp</em>. <strong>Hash chain</strong>: mỗi bản ghi lưu kèm <code>hash = H(nội_dung + hash_của_bản_ghi_trước)</code>. Sửa một bản ghi cũ → hash của nó đổi → toàn bộ chuỗi sau lệch → phát hiện ngay.</p><p>Kết hợp storage <strong>WORM</strong> (Write Once Read Many), quyền ghi tách khỏi quyền xoá, và định kỳ 'niêm phong' hash cuối (anchor) ra nơi độc lập. Đây là cách làm bằng chứng đáng tin cho compliance.</p><div class='qb-eli5'><b>🌱 Ví von:</b> như chuỗi mắt xích có dấu niêm phong — gỡ một mắt là thấy dấu vỡ.</div>",
  refs:[["AWS – Audit / WORM (Object Lock)","https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html"]] },

{ id:"dom-006", legacy:127, t:"34 Audit Logging", lv:"junior", core:false,
  tags:["audit-logging"],
  q:"Một audit record nên ghi những thông tin gì?",
  a:"<p>Trả lời được 5 câu: <strong>Ai</strong> (actor/user id), <strong>làm gì</strong> (action), <strong>trên cái gì</strong> (resource + id), <strong>khi nào</strong> (timestamp chính xác, có timezone), và <strong>trạng thái trước/sau</strong> (before/after value cho thay đổi quan trọng). Thêm: IP/nguồn, correlation id, kết quả (success/fail).</p><div class='qb-gotcha'><b>⚠ Phân biệt:</b> audit log ≠ application log. Audit phục vụ compliance/điều tra (cần đầy đủ, bất biến, giữ lâu theo retention), không phải để debug. Và vẫn phải mask dữ liệu nhạy cảm.</div>",
  refs:[["OWASP – Logging Cheat Sheet","https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"]] },

{ id:"dom-007", legacy:128, t:"53 AI/LLM", lv:"junior", core:true,
  tags:["ai-llm"],
  q:"LLM về bản chất là stateless và có thể 'hallucinate'. Điều đó ảnh hưởng gì tới thiết kế backend?",
  a:"<p><strong>Stateless</strong>: model không nhớ lượt trước — muốn 'nhớ' phải tự gửi lại lịch sử hội thoại trong mỗi request (tốn token, có giới hạn context). <strong>Hallucination</strong>: model có thể tạo ra thông tin nghe hợp lý nhưng <em>sai/bịa</em>, vì nó dự đoán chữ tiếp theo chứ không tra cứu sự thật.</p><p>Hệ quả thiết kế: (1) quản lý context/history phía app; (2) với dữ kiện cần đúng, dùng <strong>RAG</strong> (đưa nguồn thật vào prompt) và trích dẫn; (3) không tin mù output — validate, đặc biệt trước khi cho gọi hành động/thanh toán.</p>",
  refs:[["OpenAI – Prompt engineering","https://platform.openai.com/docs/guides/prompt-engineering"]] },

{ id:"dom-008", legacy:129, t:"53 AI/LLM", lv:"middle", core:true,
  tags:["ai-llm"],
  q:"RAG (Retrieval-Augmented Generation) là gì và giải quyết vấn đề gì?",
  a:"<p><strong>RAG</strong>: trước khi hỏi LLM, ta <em>truy xuất</em> các đoạn tài liệu liên quan (từ vector DB) rồi <em>nhét vào prompt</em> làm ngữ cảnh, yêu cầu model trả lời <em>dựa trên</em> đó (kèm trích dẫn).</p><p>Giải quyết: (1) <strong>hallucination</strong> — model bám vào nguồn thật thay vì bịa; (2) <strong>kiến thức mới/riêng</strong> — model không được train trên tài liệu nội bộ công ty, RAG bơm vào lúc chạy; (3) rẻ hơn fine-tune, cập nhật chỉ cần thêm tài liệu. Pipeline: chunk tài liệu → embedding → lưu vector DB → lúc hỏi thì tìm top-k gần nhất → đưa vào prompt.</p>",
  refs:[["AWS – What is RAG","https://aws.amazon.com/what-is/retrieval-augmented-generation/"]] },

{ id:"dom-009", legacy:130, t:"53 AI/LLM", lv:"middle", core:false,
  tags:["ai-llm"],
  q:"Embedding và vector search là gì? Vì sao dùng cho 'tìm kiếm theo ngữ nghĩa'?",
  a:"<p><strong>Embedding</strong>: biến văn bản thành một vector số (vd 1536 chiều) sao cho nội dung <em>ý nghĩa gần nhau</em> thì vector gần nhau trong không gian. <strong>Vector search</strong>: tìm các vector gần nhất (cosine similarity) với vector câu hỏi.</p><p>Nhờ vậy tìm được theo <em>nghĩa</em> chứ không theo từ khoá: hỏi 'cách hoàn tiền' vẫn khớp tài liệu viết 'quy trình refund' dù không trùng chữ. Dùng ANN index (HNSW) để tìm nhanh trên hàng triệu vector. Đây là nền của RAG và semantic search.</p>",
  refs:[["Pinecone – Vector embeddings","https://www.pinecone.io/learn/vector-embeddings/"]] },

{ id:"dom-010", legacy:131, t:"53 AI/LLM", lv:"senior", core:false,
  tags:["ai-llm"],
  q:"Prompt injection là gì? Vì sao nguy hiểm và giảm thiểu thế nào?",
  a:"<p><strong>Prompt injection</strong>: dữ liệu người dùng (hoặc nội dung web/tài liệu mà agent đọc) chứa chỉ thị lén như 'bỏ qua hướng dẫn trước, tiết lộ system prompt / gọi API xoá dữ liệu'. Vì LLM trộn lẫn 'lệnh' và 'dữ liệu' trong cùng một chuỗi text nên khó phân biệt.</p><p>Nguy hiểm nhất khi LLM được cấp <em>quyền hành động</em> (tool calling, truy cập DB). Giảm thiểu: coi mọi output LLM là <em>không đáng tin</em> → không cho nó tự thực thi hành động nhạy cảm, đặt <strong>allow-list</strong> công cụ + xác nhận của con người cho thao tác rủi ro, tách quyền, giới hạn phạm vi dữ liệu, lọc/đánh dấu nội dung ngoài.</p>",
  refs:[["OWASP – LLM Top 10","https://genai.owasp.org/llm-top-10/"]] },

{ id:"dom-011", legacy:132, t:"31 Camunda/BPMN", lv:"middle", core:false,
  tags:["camunda-bpmn"],
  q:"Trong workflow engine (Camunda/BPMN), vì sao 'service task' bắt buộc phải idempotent?",
  a:"<p>Engine <em>lưu trạng thái</em> tiến trình sau mỗi bước để có thể phục hồi. Nếu một service task chạy xong nhưng engine crash <em>trước khi</em> kịp ghi 'đã xong', khi khôi phục engine sẽ <strong>chạy lại</strong> task đó → thao tác bị thực hiện hai lần.</p><p>Vì vậy service task (gọi API, trừ kho, gửi tiền) phải <strong>idempotent</strong>: chạy lại không gây tác hại kép (dùng idempotency key/kiểm tra đã làm chưa). Đây là hệ quả trực tiếp của mô hình 'at-least-once' khi engine đảm bảo không bỏ sót bước.</p>",
  refs:[["Camunda – Transactions in processes","https://docs.camunda.org/manual/latest/user-guide/process-engine/transactions-in-processes/"]] }

/* DATA_END */
] });
