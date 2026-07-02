/* ============================================================
   QBANK DATA — Kỹ năng phỏng vấn   (prefix id: int-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Kỹ năng phỏng vấn",
  order: 12,
  prefix: "int",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"int-001", legacy:133, t:"37 System Design", lv:"middle", core:true,
  tags:["system-design"],
  q:"Được hỏi 'thiết kế hệ thống X', bạn đi theo framework mấy bước nào?",
  a:"<ol><li><strong>Làm rõ yêu cầu</strong> (5') — functional (làm được gì) + non-functional (scale, latency, consistency, SLA); chốt scope.</li><li><strong>Ước lượng dung lượng</strong> (5') — QPS, dung lượng lưu trữ, băng thông.</li><li><strong>Thiết kế high-level</strong> (10-15') — vẽ box &amp; arrow: client → API → service → storage/cache/queue.</li><li><strong>Đào sâu 1-2 điểm khó</strong> (10-15') — vd chống double-charge, hot partition, consistency.</li><li><strong>Tổng kết trade-off</strong> (5') — điểm yếu, chỗ scale tiếp, monitoring.</li></ol><div class='qb-gotcha'><b>⚠ Sai lầm phổ biến:</b> nhảy thẳng vào vẽ mà chưa clarify → thiết kế sai đề. Interviewer chấm <em>quá trình tư duy</em>, không chỉ đáp án.</div>",
  refs:[["System Design Primer","https://github.com/donnemartin/system-design-primer"]] },

{ id:"int-002", legacy:134, t:"37 System Design", lv:"middle", core:false,
  tags:["system-design"],
  q:"Ước lượng dung lượng (capacity estimation) — cách nhẩm nhanh QPS và storage?",
  a:"<p>Bắt đầu từ con số người dùng: vd 10M DAU, mỗi user 10 request/ngày → 100M request/ngày. Chia cho ~86400s ≈ <strong>~1,150 QPS trung bình</strong>; nhân 2-3 cho <em>peak</em> → ~3,000 QPS.</p><p>Storage: số bản ghi/ngày × kích thước mỗi bản ghi × số ngày giữ. Vd 100M event/ngày × 1KB × 365 ≈ 36 TB/năm. Nhớ vài mốc: 1 ngày ≈ 86,400s (~10⁵), đọc thường ≫ ghi. Mục tiêu là <em>con số cỡ lớn hợp lý</em>, không cần chính xác.</p>",
  refs:[["System Design Primer – Back-of-envelope","https://github.com/donnemartin/system-design-primer#back-of-the-envelope-calculations"]] },

{ id:"int-003", legacy:135, t:"37 System Design", lv:"middle", core:true,
  tags:["system-design"],
  q:"Hệ thống read-heavy và write-heavy dẫn tới những lựa chọn kiến trúc khác nhau nào?",
  a:"<p><strong>Read-heavy</strong> (feed, catalog): thêm <em>cache</em> (Redis) + CDN + <em>read replica</em>, denormalize cho query nhanh, chấp nhận eventual consistency cho dữ liệu ít nhạy cảm.</p><p><strong>Write-heavy</strong> (logging, IoT, metrics): đẩy ghi qua <em>queue</em> để hấp thụ đỉnh, ghi <em>batch</em>, <em>partition/shard</em> để phân tán ghi, chọn store tối ưu ghi (LSM-tree như Cassandra). Cache ít giúp cho write.</p><p>Luôn ước lượng <strong>tỉ lệ read:write</strong> trước để biết tối ưu về hướng nào — đây là câu hỏi clarify quan trọng.</p>",
  refs:[["System Design Primer","https://github.com/donnemartin/system-design-primer"]] },

{ id:"int-004", legacy:136, t:"37 System Design", lv:"senior", core:false,
  tags:["system-design"],
  q:"Khi nào chấp nhận eventual consistency, khi nào bắt buộc strong consistency?",
  a:"<p><strong>Chấp nhận eventual</strong> khi trễ vài giây vô hại: đếm lượt xem, feed mạng xã hội, số like, gợi ý, thông báo, lịch sử hiển thị. Đổi lại được availability + latency + scale.</p><p><strong>Bắt buộc strong</strong> tại điểm ra quyết định về tính đúng đắn: trừ tồn kho (chống oversell), chống thấu chi/double-spend, kiểm trùng thanh toán, khoá đặt chỗ. Ở đây thà chậm/từ chối còn hơn sai.</p><div class='qb-eli5'><b>🌱 Mẹo trả lời:</b> đừng nói 'hệ thống của tôi strong consistency' cho tất cả — hãy chỉ ra <em>đúng chỗ nào</em> cần mạnh, chỗ nào nới được. Đó là tư duy senior.</div>",
  refs:[["Martin Kleppmann – DDIA","https://dataintensive.net/"]] },

{ id:"int-005", legacy:137, t:"38 Algorithms", lv:"junior", core:true,
  tags:["algorithms"],
  q:"Big-O là gì? Giải thích O(1), O(log n), O(n), O(n log n), O(n²) bằng ví dụ.",
  a:"<p>Big-O mô tả <em>thời gian/bộ nhớ tăng thế nào khi dữ liệu lớn lên</em>, bỏ qua hằng số.</p><ul><li><strong>O(1)</strong>: không phụ thuộc n — truy cập <code>array[i]</code>, <code>map.get(k)</code>.</li><li><strong>O(log n)</strong>: mỗi bước loại nửa dữ liệu — binary search, cây cân bằng.</li><li><strong>O(n)</strong>: duyệt hết một lần — tìm max trong mảng.</li><li><strong>O(n log n)</strong>: sort tốt (merge/quick sort).</li><li><strong>O(n²)</strong>: hai vòng lồng — so từng cặp; chậm khi n lớn.</li></ul><div class='qb-eli5'><b>🌱 Cho người mới:</b> n=1 triệu thì O(n²) ≈ 10¹² phép — quá chậm; O(n log n) ≈ 2×10⁷ — ổn. Nên nhận ra vòng lồng là 'cờ đỏ'.</div>",
  refs:[["Big-O Cheat Sheet","https://www.bigocheatsheet.com/"]] },

{ id:"int-006", legacy:138, t:"38 Algorithms", lv:"junior", core:true,
  tags:["algorithms"],
  q:"Vì sao HashMap cho tra cứu trung bình O(1)? Khi giải bài, khi nào nghĩ ngay tới HashMap/HashSet?",
  a:"<p>HashMap tính <code>hashCode</code> của key → ra thẳng vị trí bucket, không phải dò tuần tự → trung bình O(1) (xấu nhất O(n)/O(log n) khi nhiều collision).</p><p>Nghĩ tới HashMap/HashSet khi bài cần: <em>đếm tần suất</em>, <em>kiểm tồn tại nhanh</em>, <em>khử trùng lặp</em>, <em>tra cặp bổ sung</em> (Two Sum: lưu số đã thấy → tìm <code>target - x</code> trong O(1)). Nó thường biến giải pháp O(n²) 'so từng cặp' thành O(n) đổi bộ nhớ lấy tốc độ.</p><div class='qb-gotcha'><b>⚠ Đánh đổi:</b> tốn thêm bộ nhớ, và không giữ thứ tự (dùng <code>LinkedHashMap</code> nếu cần thứ tự chèn).</div>",
  refs:[["Big-O Cheat Sheet","https://www.bigocheatsheet.com/"]] },

{ id:"int-007", legacy:139, t:"38 Algorithms", lv:"middle", core:false,
  tags:["algorithms"],
  q:"Nhận diện khi nào dùng 'two pointers' và 'sliding window'?",
  a:"<p><strong>Two pointers</strong>: mảng/chuỗi (thường đã sort), hai con trỏ đi từ hai đầu hoặc cùng chiều để tránh vòng lồng O(n²) → O(n). Vd: tìm cặp có tổng = target trong mảng đã sort, đảo chuỗi.</p><p><strong>Sliding window</strong>: bài hỏi về <em>đoạn con liên tiếp</em> thoả điều kiện (dài nhất/ngắn nhất/tổng...). Mở rộng cửa sổ bên phải, co bên trái khi vi phạm → mỗi phần tử vào/ra tối đa 1 lần → O(n). Vd: chuỗi con dài nhất không lặp ký tự.</p><div class='qb-eli5'><b>🌱 Tín hiệu:</b> thấy 'đoạn con liên tiếp' hay 'cặp trong mảng sort' → đừng brute force O(n²), nghĩ tới hai kỹ thuật này.</div>",
  refs:[["LeetCode – Sliding Window","https://leetcode.com/explore/"]] },

{ id:"int-008", legacy:140, t:"43 Mental Model", lv:"middle", core:true,
  tags:["mental-model"],
  q:"UMPIRE / quy trình trả lời một bài coding interview gồm những bước nào?",
  a:"<p>Đừng code ngay. Đi theo khung (UMPIRE):</p><ol><li><strong>U</strong>nderstand: hỏi lại đề, ví dụ, ràng buộc, edge case (mảng rỗng? trùng? âm?).</li><li><strong>M</strong>atch: bài này giống pattern nào (hashing, two pointers, DP...).</li><li><strong>P</strong>lan: nói brute force trước, rồi hướng tối ưu; thống nhất với interviewer.</li><li><strong>I</strong>mplement: code sạch, vừa code vừa nói.</li><li><strong>R</strong>eview: trace thử một ví dụ, kiểm edge case.</li><li><strong>E</strong>valuate: nêu độ phức tạp time/space và cách cải thiện.</li></ol><div class='qb-gotcha'><b>⚠ Điểm mất nhiều nhất:</b> im lặng code. Interviewer cần nghe bạn <em>suy nghĩ ra tiếng</em>.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/coding-interview-techniques/"]] },

{ id:"int-009", legacy:141, t:"41 Behavioral", lv:"junior", core:true,
  tags:["behavioral"],
  q:"STAR là gì? Vì sao nên dùng khi trả lời câu hỏi behavioral?",
  a:"<p><strong>STAR</strong> = <strong>Situation</strong> (bối cảnh) → <strong>Task</strong> (nhiệm vụ/vấn đề của bạn) → <strong>Action</strong> (bạn <em>cụ thể</em> đã làm gì) → <strong>Result</strong> (kết quả, có số liệu nếu được).</p><p>Nó giúp câu trả lời có cấu trúc, không lan man, và tập trung vào <em>đóng góp cá nhân</em>. Mẹo: dành ~70% thời lượng cho <strong>Action</strong> (dùng 'tôi', không 'chúng tôi' chung chung), và Result nên đo được ('giảm p99 từ 2s xuống 300ms').</p><div class='qb-eli5'><b>🌱 Chuẩn bị:</b> soạn sẵn 5-6 câu chuyện STAR (một lần khó, một xung đột, một sáng kiến, một thất bại...) rồi 'ánh xạ' vào từng câu hỏi.</div>",
  refs:[["Tech Interview Handbook – Behavioral","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-010", legacy:142, t:"41 Behavioral", lv:"middle", core:false,
  tags:["behavioral"],
  q:"Được hỏi 'kể về một lần bạn thất bại / xung đột với đồng nghiệp' — trả lời sao cho ghi điểm?",
  a:"<p>Người phỏng vấn kiểm <em>sự trưởng thành và khả năng tự nhìn lại</em>, không phải tìm lỗi. Cấu trúc: kể tình huống thật (đừng chọn thất bại giả kiểu 'tôi làm việc quá chăm'), nhận <strong>trách nhiệm phần của mình</strong>, tập trung vào <em>bạn học/thay đổi gì</em> và kết quả sau đó tốt hơn.</p><div class='qb-gotcha'><b>⚠ Red flag cần tránh:</b> đổ lỗi hoàn toàn cho người khác, nói xấu công ty cũ, hoặc phủ nhận từng thất bại. Với xung đột: thể hiện bạn <em>lắng nghe, tìm dữ liệu chung, hướng tới mục tiêu chung</em> thay vì thắng-thua.</div>",
  refs:[["Tech Interview Handbook – Behavioral","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-011", legacy:143, t:"41 Behavioral", lv:"junior", core:false,
  tags:["behavioral"],
  q:"Cuối buổi 'bạn có câu hỏi gì cho chúng tôi không?' — nên hỏi gì?",
  a:"<p>Luôn hỏi (không hỏi = trông thiếu quan tâm). Hỏi thứ giúp bạn <em>đánh giá công ty</em> và cho thấy bạn nghiêm túc: quy trình review/deploy ra sao, on-call/xử lý sự cố thế nào, đội đo thành công của role này bằng gì, thử thách kỹ thuật lớn nhất sắp tới, cơ hội học hỏi/mentor.</p><div class='qb-gotcha'><b>⚠ Tránh:</b> câu tra Google được trong 5 giây (công ty làm gì), hoặc chỉ hỏi lương/nghỉ phép ngay từ vòng kỹ thuật. Câu hỏi tốt là một phần của việc 'phỏng vấn ngược' để chọn nơi phù hợp.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/"]] }

/* DATA_END */
] });
