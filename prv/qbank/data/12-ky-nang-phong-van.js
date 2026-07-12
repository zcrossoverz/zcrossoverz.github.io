/* ============================================================
   QBANK DATA — Kỹ năng phỏng vấn   (prefix id: int-)
   Trạng thái: REWRITTEN (2026-07-04) — đáp án cho junior ~1 năm, giải thích cặn kẽ,
   mỗi câu có ví dụ đời thường + bẫy phỏng vấn + nguồn. Nhóm này thiên KỸ NĂNG
   trình bày/behavioral; phần system-design/algo nặng về kỹ thuật xem nhóm 05/07.
   Thêm câu mới: dán khối mới TRƯỚC dòng DATA_END. Schema: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "Kỹ năng phỏng vấn",
  order: 12,
  prefix: "int",
  status: "rewritten",
  questions: [
/* DATA_START */

{ id:"int-001", legacy:133, t:"System Design", lv:"middle", core:true,
  tags:["system-design"],
  q:"Được hỏi 'thiết kế hệ thống X', bạn đi theo framework mấy bước nào và phân bổ thời gian ra sao?",
  a:"<p>Vòng system design ~45 phút chấm <em>cách bạn tư duy và giao tiếp</em>, không chỉ đáp án. Đi theo khung có phân bổ thời gian: <strong>(1) Làm rõ yêu cầu (~5')</strong> — functional + non-functional (scale, latency, consistency, SLA), chốt scope. <strong>(2) Ước lượng (~5')</strong> — QPS, storage, băng thông. <strong>(3) Thiết kế high-level (~10-15')</strong> — vẽ client → API → service → storage/cache/queue. <strong>(4) Đào sâu 1-2 điểm khó (~10-15')</strong> — chống double-charge, hot partition, consistency. <strong>(5) Tổng kết trade-off (~5')</strong> — điểm yếu, chỗ scale tiếp, monitoring.</p><p>Điểm mấu chốt của <em>kỹ năng phỏng vấn</em> (khác với kiến thức kỹ thuật ở nhóm Architecture): liên tục <em>nói ra suy nghĩ</em>, checkpoint với interviewer ('anh muốn em đào sâu phần nào?'), và quản lý thời gian để không sa lầy một chỗ.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như một kiến trúc sư gặp khách: hỏi nhu cầu và ngân sách trước (clarify + estimate), phác bản vẽ tổng (high-level), rồi mới bàn kỹ phần bếp/móng khách quan tâm (deep-dive) — vừa làm vừa trao đổi, không im lặng vẽ một mình.</div><div class='qb-gotcha'><b>⚠ Sai lầm mất điểm nhất:</b> nhảy thẳng vào vẽ box khi chưa clarify → thiết kế sai đề; và im lặng suy nghĩ. (Nội dung kỹ thuật của khung này: xem arch-020; ước lượng: arch-021.)</div>",
  refs:[["System Design Primer","https://github.com/donnemartin/system-design-primer"]] },

{ id:"int-002", legacy:134, t:"System Design", lv:"middle", core:false,
  tags:["system-design"],
  q:"Ước lượng dung lượng (capacity estimation) — cách nhẩm nhanh QPS và storage tại chỗ?",
  a:"<p>Bắt đầu từ số người dùng và nói to giả định: ví dụ 10M DAU, mỗi user 10 request/ngày → 100M request/ngày. Chia cho ~86.400 giây ≈ <strong>~1.150 QPS trung bình</strong>; nhân 2-3 lần cho <em>peak</em> → ~3.000 QPS. Storage: số bản ghi/ngày × kích thước mỗi bản × số ngày giữ (ví dụ 100M event × 1KB × 365 ≈ ~36 TB/năm).</p><p>Vài mốc để nhẩm nhanh: 1 ngày ≈ 86.400s (làm tròn 10⁵), đọc thường ≫ ghi. Mục tiêu là <em>bậc độ lớn hợp lý</em>, không cần chính xác — con số này để quyết định 'một DB đủ chưa hay phải shard/cache'.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như ước 'tiệc ~100 khách, mỗi người 2 suất' để biết đặt mấy bàn — không đếm từng người, chỉ cần đủ để lên kế hoạch.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> sa đà tính số lẻ chi li = mất thời gian quý. Dùng số tròn, nói rõ giả định, tách đọc/ghi. (Chi tiết kỹ thuật: arch-021.)</div>",
  refs:[["System Design Primer – Back-of-envelope","https://github.com/donnemartin/system-design-primer#back-of-the-envelope-calculations"]] },

{ id:"int-003", legacy:135, t:"System Design", lv:"middle", core:true,
  tags:["system-design"],
  q:"Hệ read-heavy và write-heavy dẫn tới những lựa chọn kiến trúc khác nhau nào?",
  a:"<p>Hỏi <em>tỉ lệ đọc:ghi</em> là một câu clarify quan trọng vì nó lái toàn bộ thiết kế. <strong>Read-heavy</strong> (feed, catalog): thêm <em>cache</em> (Redis) + CDN + <em>read replica</em>, denormalize cho truy vấn nhanh, chấp nhận eventual consistency cho dữ liệu ít nhạy cảm. <strong>Write-heavy</strong> (logging, IoT, metrics): đẩy ghi qua <em>queue</em> để hấp thụ đỉnh, ghi theo <em>batch</em>, <em>partition/shard</em> để phân tán ghi, chọn store tối ưu ghi (LSM-tree như Cassandra). Cache giúp ít cho write.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Read-heavy như <em>thư viện đông người đọc</em> — photo thêm nhiều bản (replica/cache) đặt gần bạn đọc. Write-heavy như <em>bưu điện giờ cao điểm nhận hàng</em> — cần nhiều quầy nhận (shard) và băng chuyền đệm (queue) để không nghẽn.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> tối ưu read và write đòi hai hướng khác nhau — không hỏi tỉ lệ đọc:ghi mà cứ 'thêm cache cho nhanh' là trả lời máy móc. Nêu được vì sao cache ít giúp cho write là điểm cộng.</div>",
  refs:[["System Design Primer","https://github.com/donnemartin/system-design-primer"]] },

{ id:"int-004", legacy:136, t:"System Design", lv:"senior", core:false,
  tags:["system-design"],
  q:"Khi nào chấp nhận eventual consistency, khi nào bắt buộc strong consistency?",
  a:"<p><strong>Chấp nhận eventual</strong> khi trễ vài giây vô hại: đếm lượt xem, feed mạng xã hội, số like, gợi ý, thông báo, lịch sử hiển thị — đổi lại được availability + latency + khả năng scale. <strong>Bắt buộc strong</strong> tại điểm ra quyết định về tính đúng đắn: trừ tồn kho (chống oversell), chống double-spend, kiểm trùng thanh toán, khoá đặt chỗ — ở đó thà chậm/từ chối còn hơn sai.</p><p>Kỹ năng phỏng vấn ở đây: đừng phán 'hệ của em strong consistency toàn bộ' — hãy chỉ ra <em>đúng chỗ nào</em> cần mạnh, chỗ nào nới được, và vì sao. Đó là tư duy phân biệt senior với người học thuộc.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Bảng 'số người đang xem' trễ vài giây chẳng sao (eventual); nhưng 'ghế 5A đã có người đặt chưa' thì phải chính xác tức thì (strong) kẻo bán trùng ghế.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> áp strong consistency cho mọi thứ 'cho chắc' làm hệ chậm và khó scale vô lý. (Nền lý thuyết: CAP/PACELC dist-012/013, consistency models dist-014.)</div>",
  refs:[["Martin Kleppmann – DDIA","https://dataintensive.net/"]] },

{ id:"int-005", legacy:137, t:"Algorithms", lv:"junior", core:true,
  tags:["algorithms"],
  q:"Big-O là gì? Giải thích O(1), O(log n), O(n), O(n log n), O(n²) bằng ví dụ.",
  a:"<p>Big-O mô tả <em>thời gian/bộ nhớ tăng thế nào khi dữ liệu lớn lên</em>, bỏ qua hằng số. <strong>O(1)</strong>: không phụ thuộc n — truy cập <code>array[i]</code>, <code>map.get(k)</code>. <strong>O(log n)</strong>: mỗi bước loại nửa dữ liệu — binary search, cây cân bằng. <strong>O(n)</strong>: duyệt hết một lần — tìm max trong mảng. <strong>O(n log n)</strong>: sort tốt (merge/quick sort). <strong>O(n²)</strong>: hai vòng lồng, so từng cặp — chậm khi n lớn.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Tìm một tên trong danh bạ đã sắp xếp: lật giở từng trang là O(n); mở giữa rồi loại nửa (như tra từ điển) là O(log n) — nhanh hơn hẳn khi danh bạ dày.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> n = 1 triệu thì O(n²) ≈ 10¹² phép (quá chậm), O(n log n) ≈ 2×10⁷ (ổn). Thấy <em>vòng lặp lồng nhau</em> là 'cờ đỏ' cần tối ưu — nhận ra sớm là kỹ năng quan trọng khi giải bài.</div>",
  refs:[["Big-O Cheat Sheet","https://www.bigocheatsheet.com/"]] },

{ id:"int-006", legacy:138, t:"Algorithms", lv:"junior", core:true,
  tags:["algorithms"],
  q:"Vì sao HashMap cho tra cứu trung bình O(1)? Khi nào nghĩ ngay tới HashMap/HashSet?",
  a:"<p>HashMap tính <code>hashCode</code> của key rồi ra <em>thẳng</em> vị trí bucket, không phải dò tuần tự → trung bình O(1) (xấu nhất O(n) hoặc O(log n) khi nhiều collision). Nghĩ tới HashMap/HashSet ngay khi bài cần: <em>đếm tần suất</em>, <em>kiểm tồn tại nhanh</em>, <em>khử trùng lặp</em>, hoặc <em>tra cặp bổ sung</em> (Two Sum: lưu số đã thấy rồi tìm <code>target − x</code> trong O(1)). Nó thường biến giải pháp O(n²) 'so từng cặp' thành O(n) — đổi bộ nhớ lấy tốc độ.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như <em>mục lục sách</em>: thay vì lật từng trang tìm chủ đề (tuần tự), bạn tra mục lục ra ngay số trang (hash → bucket). Một bước tới đích thay vì dò cả cuốn.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> đánh đổi là tốn thêm bộ nhớ và <em>không giữ thứ tự</em> (cần thứ tự chèn thì dùng <code>LinkedHashMap</code>). Và nhắc được 'trung bình O(1), xấu nhất O(n)' cho thấy bạn hiểu chứ không thuộc lòng.</div>",
  refs:[["Big-O Cheat Sheet","https://www.bigocheatsheet.com/"]] },

{ id:"int-007", legacy:139, t:"Algorithms", lv:"middle", core:false,
  tags:["algorithms"],
  q:"Nhận diện khi nào dùng 'two pointers' và 'sliding window'?",
  a:"<p><strong>Two pointers</strong>: dùng trên mảng/chuỗi (thường đã sort), hai con trỏ đi từ hai đầu hoặc cùng chiều để tránh vòng lồng O(n²) → O(n). Ví dụ: tìm cặp có tổng = target trong mảng đã sort, đảo chuỗi. <strong>Sliding window</strong>: dùng khi bài hỏi về một <em>đoạn con liên tiếp</em> thoả điều kiện (dài nhất/ngắn nhất/tổng...). Bạn mở rộng cửa sổ bên phải, co bên trái khi vi phạm → mỗi phần tử vào/ra tối đa một lần → O(n). Ví dụ: chuỗi con dài nhất không lặp ký tự.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Sliding window như <em>khung cửa sổ trượt dọc một hàng rào</em> — bạn trượt để luôn nhìn đúng một đoạn liên tiếp, mở rộng/thu hẹp thay vì đo lại từ đầu mỗi lần.</div><div class='qb-gotcha'><b>⚠ Tín hiệu nhận dạng:</b> thấy 'đoạn con liên tiếp' hay 'cặp trong mảng đã sort' → đừng brute force O(n²), nghĩ ngay tới hai kỹ thuật này. Nói được tín hiệu nhận dạng khi phỏng vấn quan trọng hơn thuộc lời giải.</div>",
  refs:[["Tech Interview Handbook – Algorithms","https://www.techinterviewhandbook.org/algorithms/study-cheatsheet/"]] },

{ id:"int-008", legacy:140, t:"Coding process", lv:"middle", core:true,
  tags:["mental-model"],
  q:"Quy trình trả lời một bài coding interview (UMPIRE) gồm những bước nào?",
  a:"<p>Đừng lao vào code ngay. Đi theo khung <strong>UMPIRE</strong>: <strong>U</strong>nderstand — hỏi lại đề, ví dụ, ràng buộc, edge case (mảng rỗng? trùng? số âm?). <strong>M</strong>atch — bài này giống pattern nào (hashing, two pointers, DP...). <strong>P</strong>lan — nói brute force trước, rồi hướng tối ưu, thống nhất với interviewer. <strong>I</strong>mplement — code sạch, vừa code vừa nói. <strong>R</strong>eview — trace thử một ví dụ, kiểm edge case. <strong>E</strong>valuate — nêu độ phức tạp time/space và cách cải thiện.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như giải một bài toán khó trong phòng thi cùng giám khảo: bạn đọc kỹ đề, nói ra hướng làm để họ gật đầu, rồi mới đặt bút — thay vì viết ào rồi phát hiện lạc đề ở phút chót.</div><div class='qb-gotcha'><b>⚠ Điểm mất nhiều nhất:</b> im lặng code trong đầu. Interviewer cần <em>nghe bạn suy nghĩ ra tiếng</em> — họ chấm quá trình, và còn có thể gợi ý đúng hướng nếu bạn nói ra. Code đúng mà im thin thít vẫn có thể trượt.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/coding-interview-techniques/"]] },

{ id:"int-009", legacy:141, t:"Behavioral", lv:"junior", core:true,
  tags:["behavioral"],
  q:"STAR là gì? Vì sao nên dùng khi trả lời câu hỏi behavioral?",
  a:"<p><strong>STAR</strong> = <strong>Situation</strong> (bối cảnh) → <strong>Task</strong> (nhiệm vụ/vấn đề của bạn) → <strong>Action</strong> (bạn <em>cụ thể</em> đã làm gì) → <strong>Result</strong> (kết quả, có số liệu nếu được). Nó giúp câu trả lời có cấu trúc, không lan man, và tập trung vào <em>đóng góp cá nhân</em> của bạn. Mẹo phân bổ: dành ~70% thời lượng cho <strong>Action</strong> (nói 'tôi' làm gì, không 'chúng tôi' chung chung), và Result nên đo được ('giảm p99 từ 2s xuống 300ms').</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như kể một câu chuyện hay: có bối cảnh, có nút thắt, có <em>việc nhân vật chính (bạn) làm</em>, và một cái kết rõ ràng — thay vì lan man 'hồi đó team tôi làm nhiều thứ lắm'.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> kể lê thê phần Situation rồi hụt hơi ở Action/Result; hoặc dùng 'chúng tôi' khiến người nghe không biết <em>bạn</em> đóng góp gì. Chuẩn bị sẵn 5-6 câu chuyện STAR (một lần khó, một xung đột, một sáng kiến, một thất bại) rồi ánh xạ vào từng câu hỏi.</div>",
  refs:[["Tech Interview Handbook – Behavioral","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-010", legacy:142, t:"Behavioral", lv:"middle", core:false,
  tags:["behavioral"],
  q:"Được hỏi 'kể về một lần bạn thất bại / xung đột với đồng nghiệp' — trả lời sao cho ghi điểm?",
  a:"<p>Người phỏng vấn kiểm <em>sự trưởng thành và khả năng tự nhìn lại</em>, không phải để bắt lỗi bạn. Cấu trúc: kể một tình huống <em>thật</em> (đừng chọn thất bại giả kiểu 'tôi làm việc quá chăm'), nhận <strong>phần trách nhiệm của mình</strong>, rồi tập trung vào <em>bạn học được gì và thay đổi ra sao</em>, kết quả sau đó tốt hơn. Với xung đột: cho thấy bạn <em>lắng nghe, tìm dữ liệu/điểm chung, hướng tới mục tiêu chung</em> thay vì thắng-thua cá nhân.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như kể về một lần lạc đường: người trưởng thành nói 'tôi đã chủ quan không xem bản đồ, giờ tôi luôn kiểm trước' — chứ không đổ tại 'đường xấu, biển báo dở'.</div><div class='qb-gotcha'><b>⚠ Red flag cần tránh:</b> đổ lỗi hoàn toàn cho người khác, nói xấu công ty cũ, hoặc khăng khăng 'tôi chưa từng thất bại'. Cả ba đều báo hiệu thiếu tự nhận thức — thứ interviewer sợ hơn cả bản thân lỗi lầm.</div>",
  refs:[["Tech Interview Handbook – Behavioral","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-011", legacy:143, t:"Behavioral", lv:"junior", core:false,
  tags:["behavioral"],
  q:"Cuối buổi 'bạn có câu hỏi gì cho chúng tôi không?' — nên hỏi gì?",
  a:"<p>Luôn hỏi — không hỏi gì trông như thiếu quan tâm. Hỏi những thứ vừa giúp bạn <em>đánh giá công ty</em> vừa cho thấy bạn nghiêm túc: quy trình review/deploy ra sao, on-call và xử lý sự cố thế nào, đội đo thành công của vị trí này bằng gì, thử thách kỹ thuật lớn nhất sắp tới, cơ hội học hỏi/được mentor.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như đi xem nhà trước khi thuê: bạn hỏi về hàng xóm, nước nôi, an ninh (điều kiện sống thật) — chứ không chỉ gật đầu nghe chủ nhà quảng cáo. Phỏng vấn cũng là bạn đang chọn họ.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> hỏi thứ tra Google 5 giây ra (công ty làm gì), hoặc chỉ chăm chăm lương/nghỉ phép ngay ở vòng kỹ thuật. Câu hỏi tốt là phần của việc 'phỏng vấn ngược' để chọn đúng nơi — và để lại ấn tượng chín chắn.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/"]] },

{ id:"int-012", t:"Behavioral", lv:"junior", core:true,
  tags:["behavioral"],
  q:"'Hãy giới thiệu về bản thân' — trả lời thế nào cho gọn và ghi điểm?",
  a:"<p>Đây không phải lời mời kể tiểu sử từ hồi đi học. Nó là một <em>pitch 60-90 giây</em> có chọn lọc theo vị trí ứng tuyển, cấu trúc <strong>hiện tại → quá khứ → tương lai</strong>: (1) hiện tại bạn là ai, làm gì, thế mạnh nổi bật; (2) một-hai điểm trong quá khứ <em>liên quan tới JD</em> (kinh nghiệm/thành tựu khớp việc); (3) vì sao bạn ở đây, vì sao vai trò này. Chọn lọc là chìa khoá — kể đúng thứ nhà tuyển dụng cần nghe, không phải mọi thứ về bạn.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như <em>trailer phim</em>: chỉ ghép những cảnh hấp dẫn và liên quan để người xem muốn xem tiếp — không chiếu cả bộ phim dài hai tiếng ngay ở phần giới thiệu.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> đọc lại nguyên CV theo trình tự thời gian, hoặc lan sang đời tư dài dòng. Giữ dưới ~2 phút, hướng mọi thứ về 'vì sao tôi hợp vai trò này', và chốt bằng một câu mở đường cho câu hỏi tiếp theo.</div>",
  refs:[["Tech Interview Handbook – Self introduction","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-013", t:"Behavioral", lv:"junior", core:false,
  tags:["behavioral"],
  q:"'Điểm yếu lớn nhất của bạn là gì?' — trả lời sao cho thật mà không tự hại?",
  a:"<p>Câu này đo <em>sự tự nhận thức và tinh thần cầu tiến</em>, không phải để loại bạn vì có điểm yếu (ai cũng có). Công thức an toàn: chọn một điểm yếu <em>thật nhưng không phá vỡ yêu cầu cốt lõi</em> của vị trí, rồi kể <em>bạn đang làm gì cụ thể để cải thiện</em> và tiến bộ tới đâu. Sự chân thành + hành động khắc phục mới là thứ ghi điểm.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như thừa nhận 'tôi chưa giỏi thuyết trình trước đám đông, nên tôi đã tham gia một câu lạc bộ nói và giờ đỡ run hơn nhiều' — cho thấy bạn nhìn ra vấn đề và chủ động sửa, đáng tin hơn người 'hoàn hảo'.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> hai thái cực đều mất điểm — 'tôi không có điểm yếu nào' (thiếu tự nhận thức) và điểm yếu giả trá hình khoe khoang ('tôi quá cầu toàn / làm việc quá chăm', nghe sáo, interviewer biết ngay). Nhưng cũng đừng khai một điểm yếu <em>giết chết</em> khả năng làm đúng công việc đó.</div>",
  refs:[["Tech Interview Handbook – Behavioral","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-014", t:"Behavioral", lv:"middle", core:true,
  tags:["behavioral"],
  q:"Trình bày một dự án bạn từng làm cho ấn tượng — nên nhấn vào điều gì?",
  a:"<p>Interviewer không muốn nghe một danh sách công nghệ; họ muốn hiểu <em>vai trò và tư duy của bạn</em>. Kể như một câu chuyện có xung đột-giải pháp: bối cảnh ngắn → <em>vấn đề/thách thức</em> → <strong>cụ thể bạn làm gì</strong> và <em>những đánh đổi bạn cân nhắc khi ra quyết định kỹ thuật</em> → <strong>kết quả đo được</strong> (số liệu: giảm latency, tăng throughput, tiết kiệm chi phí). Phần 'vì sao chọn cách này thay cách kia' là nơi lộ ra trình độ thật.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Kể một chuyến đi đáng nhớ thì người ta nhớ <em>tình huống bạn xoay xở khi lỡ chuyến tàu</em>, không phải danh sách bạn mang theo những vật gì trong vali (tech stack).</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> nói 'chúng tôi' mù mờ (không rõ <em>bạn</em> làm gì) và không nêu được impact/số liệu. Chuẩn bị <em>sâu</em> 1-2 dự án để đào được: vì sao chọn kiến trúc đó, khó khăn gì, nếu làm lại sẽ khác ra sao — đó là mỏ câu hỏi đào sâu.</div>",
  refs:[["Tech Interview Handbook – Behavioral","https://www.techinterviewhandbook.org/behavioral-interview/"]] },

{ id:"int-015", t:"Coding process", lv:"middle", core:false,
  tags:["mental-model"],
  q:"Gặp câu hỏi/bài mà bạn KHÔNG biết trong phỏng vấn — xử lý thế nào cho ghi điểm?",
  a:"<p>'Không biết' không tự động là điểm trừ lớn — <em>cách</em> bạn xử lý mới quyết định. Đừng đơ và cũng đừng bịa. Hãy: (1) thành thật thừa nhận phần bạn chưa chắc, (2) <em>suy luận ra tiếng</em> từ nền tảng đã có ('em chưa dùng X, nhưng đoán nó hoạt động thế này vì nó giống Y...'), (3) hỏi làm rõ để thu hẹp, hoặc (4) nói <em>bạn sẽ tìm hiểu thế nào</em> nếu gặp trong việc thật. Điều interviewer muốn thấy là tư duy khi thiếu thông tin — thứ xảy ra hằng ngày ở công việc thật.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Bị hỏi đường tới một nơi lạ, người khéo nói 'tôi không rõ chính xác, nhưng nó ở hướng này, tôi sẽ hỏi/tra bản đồ thế này' — hữu ích và đáng tin hơn hẳn người chỉ bừa hoặc im lặng.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> <em>bịa</em> một câu trả lời nghe có vẻ đúng là red flag lớn hơn 'không biết' — nó cho thấy bạn có thể tự tin nói sai ở công việc thật. Nhưng 'em không biết' cụt lủn rồi im cũng phí; luôn kèm suy luận hoặc cách tiếp cận.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/coding-interview-techniques/"]] },

{ id:"int-016", t:"Sự nghiệp", lv:"middle", core:false,
  tags:["behavioral"],
  q:"Đàm phán lương/offer — vài nguyên tắc cơ bản để không tự bán rẻ?",
  a:"<p>Vài nguyên tắc thực dụng: (1) <strong>nghiên cứu market range</strong> cho vị trí + địa điểm + cấp độ trước, để có mỏ neo dựa trên dữ liệu chứ không cảm tính; (2) nếu được, <em>tránh nói con số mong muốn đầu tiên</em> — để phía họ đưa ra trước; (3) đàm phán <strong>cả gói</strong> (base, thưởng, cổ phần, ngày phép, remote, ngân sách học tập), không chỉ mỗi base; (4) sau khi họ ra offer, <em>im lặng cân nhắc</em> là một công cụ — đừng vội nhận ngay; (5) luôn lịch sự và dựa trên <em>giá trị bạn mang lại</em>, không phải nhu cầu cá nhân.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như mua bán một món có giá trị: người biết <em>giá thị trường và chất lượng món hàng</em> thì thương lượng điềm tĩnh và được giá đúng, còn người sốt ruột 'chốt cho xong' thường hớ.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> nói một con số thấp vì sợ mất cơ hội = tự bán rẻ mình; và nhận ngay offer đầu tiên không thương lượng thường bỏ lỡ 10-20%. Đòn bẩy mạnh nhất là có <em>lựa chọn thay thế</em> (một offer khác, hoặc công việc hiện tại ổn) — nó cho bạn sự bình tĩnh để thương lượng.</div>",
  refs:[["Tech Interview Handbook – Negotiation","https://www.techinterviewhandbook.org/negotiation/"]] },

{ id:"int-017", t:"Sự nghiệp", lv:"middle", core:false,
  tags:["behavioral"],
  q:"Phỏng vấn là hai chiều — những 'red flag' nào về công ty cần để ý?",
  a:"<p>Bạn cũng đang đánh giá họ. Vài dấu hiệu cảnh báo đáng chú ý: quy trình phỏng vấn <em>lộn xộn, trễ hẹn, thiếu tôn trọng thời gian</em> của bạn (thường phản ánh văn hoá nội bộ); người phỏng vấn <em>không trả lời được</em> 'đội đo thành công của vai trò này thế nào' hay 'thử thách lớn nhất là gì'; <em>turnover cao</em> (hỏi khéo 'người trước ở vị trí này bao lâu'); <em>không có</em> code review/test/CI mà xem đó là bình thường; on-call nặng nề không có bù đắp; hoặc né tránh câu hỏi về văn hoá/cân bằng/định hướng.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như đi xem nhà: đừng chỉ nghe lời môi giới, hãy để ý <em>tường có vết nứt, hàng xóm thế nào, nước có yếu không</em> — những chi tiết nhỏ lộ ra vấn đề lớn mà quảng cáo giấu đi.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> vì cần việc gấp mà <em>phớt lờ linh cảm xấu</em> rõ ràng — dễ dẫn tới nghỉ việc sớm và mệt mỏi. Nhưng cũng đừng suy diễn cả một môi trường tệ chỉ từ một chi tiết nhỏ; tìm <em>mẫu hình lặp lại</em> qua nhiều tín hiệu.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/"]] },

{ id:"int-018", t:"Sự nghiệp", lv:"middle", core:true,
  tags:["behavioral"],
  q:"Nhà tuyển dụng kỳ vọng khác nhau gì ở junior, middle và senior? Vì sao cần biết?",
  a:"<p>Biết mình đang phỏng vấn ở <em>level nào</em> để chỉnh câu trả lời cho đúng kỳ vọng. Đại thể: <strong>Junior</strong> — nền tảng vững, học nhanh, code sạch <em>khi được hướng dẫn</em>, thái độ cầu tiến; được kỳ vọng cần review/định hướng. <strong>Middle</strong> — <em>tự chủ</em> giải quyết task cỡ vừa, hiểu trade-off và chọn được giải pháp hợp lý, ít cần giám sát. <strong>Senior</strong> — <em>dẫn dắt thiết kế</em>, ra quyết định trong tình huống mơ hồ/thiếu thông tin, <em>ảnh hưởng và mentor</em> người khác, và nghĩ ở tầm hệ thống/tổ chức chứ không chỉ đoạn code trước mặt.</p><div class='qb-eli5'><b>🌱 Ví dụ đời thường:</b> Như các đai trong võ thuật: đai cao không chỉ 'đánh giỏi hơn' mà còn <em>dẫn dắt lớp, ra quyết định và chịu trách nhiệm</em> — kỳ vọng đổi về chất, không chỉ về lượng.</div><div class='qb-gotcha'><b>⚠ Bẫy phỏng vấn:</b> junior cố 'diễn' senior bằng lời to tát nhưng không có chiều sâu → lộ; còn ứng viên senior chỉ khoe kỹ năng code mà <em>không thể hiện tư duy hệ thống, đánh đổi và ảnh hưởng</em> → bị đánh giá dưới level. Trả lời khớp level đang ứng tuyển mới trúng.</div>",
  refs:[["Tech Interview Handbook","https://www.techinterviewhandbook.org/"]] }

/* DATA_END */
] });
