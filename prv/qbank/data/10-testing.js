/* ============================================================
   QBANK DATA — Testing   (prefix id: test-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Testing",
  order: 10,
  prefix: "test",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"test-001", legacy:118, t:"27 Testing Strategy", lv:"junior", core:true,
  tags:["testing-strategy"],
  q:"Test pyramid là gì? Vì sao nhiều unit test, ít end-to-end test?",
  a:"<p>Kim tự tháp gợi ý tỉ lệ: <strong>nhiều unit test</strong> (đáy) → <strong>ít hơn integration test</strong> (giữa) → <strong>rất ít E2E test</strong> (đỉnh).</p><p>Lý do: unit test <em>nhanh, rẻ, ổn định</em>, chỉ rõ chỗ hỏng. E2E test <em>chậm, đắt, dễ 'flaky'</em> (hỏng vì lý do ngoài code) và khó chỉ ra nguyên nhân. Nên phủ logic bằng unit, chỉ dùng vài E2E cho luồng quan trọng nhất.</p><div class='qb-gotcha'><b>⚠ Anti-pattern:</b> 'ice-cream cone' (nhiều E2E, ít unit) → CI chậm, hay đỏ vặt, đội ngũ mất niềm tin vào test.</div>",
  refs:[["Martin Fowler – Test Pyramid","https://martinfowler.com/articles/practical-test-pyramid.html"]] },

{ id:"test-002", legacy:119, t:"27 Testing Strategy", lv:"middle", core:true,
  tags:["testing-strategy"],
  q:"Vì sao nên test <em>behavior</em> chứ không test <em>implementation</em>? 'Brittle test' là gì?",
  a:"<p>Test <em>behavior</em>: kiểm 'với input này, kết quả/hiệu ứng quan sát được là gì' (output, state, tương tác quan trọng). Test <em>implementation</em>: kiểm nội bộ (gọi private method X đúng thứ tự, mock mọi thứ).</p><p><strong>Brittle test</strong> là test hỏng mỗi khi bạn <em>refactor</em> dù hành vi không đổi — thường do bám vào chi tiết cài đặt/over-mocking. Nó làm test thành gánh nặng thay vì lưới an toàn. Nên test qua API công khai, mock ở ranh giới (DB, HTTP) chứ không mock nội bộ lung tung.</p>",
  refs:[["Martin Fowler – Practical Test Pyramid","https://martinfowler.com/articles/practical-test-pyramid.html"]] },

{ id:"test-003", legacy:120, t:"27 Testing Strategy", lv:"middle", core:false,
  tags:["testing-strategy"],
  q:"Integration test dùng H2 (in-memory) hay Testcontainers? Trade-off?",
  a:"<p><strong>H2</strong> nhanh, không cần Docker, nhưng <em>khác</em> DB thật (dialect, kiểu dữ liệu, index, hành vi lock) → test xanh nhưng production đỏ vì đặc thù Postgres/Oracle không được kiểm.</p><p><strong>Testcontainers</strong> chạy <em>chính DB thật</em> trong container lúc test → sát production nhất (bắt được lỗi dialect/migration thật). Đổi lại chậm hơn và cần Docker trong CI. Với dự án nghiêm túc, Testcontainers được khuyên dùng cho integration test tầng DB.</p>",
  refs:[["Testcontainers","https://testcontainers.com/"]] },

{ id:"test-004", legacy:121, t:"28 Performance Testing", lv:"middle", core:false,
  tags:["performance-testing"],
  q:"Kể 4 loại performance test (load, stress, spike, soak) và mục đích mỗi loại.",
  a:"<ul><li><strong>Load test</strong>: chạy ở tải kỳ vọng để xem có đạt SLA (latency/throughput) không.</li><li><strong>Stress test</strong>: tăng tải tới khi hỏng để tìm <em>giới hạn</em> và xem hệ thống sập kiểu gì (degrade nhẹ nhàng hay đổ sập).</li><li><strong>Spike test</strong>: tăng tải <em>đột ngột</em> (flash sale) để kiểm auto-scaling/khả năng chịu sốc.</li><li><strong>Soak (endurance) test</strong>: chạy tải vừa <em>trong nhiều giờ</em> để lộ memory leak, đầy disk, rò connection.</li></ul><div class='qb-gotcha'><b>⚠ Đọc kết quả:</b> nhìn p95/p99 và error rate theo thời gian, không chỉ throughput trung bình.</div>",
  refs:[["Grafana k6 – Test types","https://grafana.com/load-testing/types-of-load-testing/"]] }

/* DATA_END */
] });
