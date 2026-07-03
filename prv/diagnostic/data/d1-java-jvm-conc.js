/* ============================================================
   DIAGNOSTIC — Java Core, JVM, Concurrency
   Schema 1 item: { id, node (id trong skillmap), d (domain), lv, dim(predict|analyze|decide|design),
     q (HTML), code (string, optional), opts:[{t, ok:true} | {t, why:"misconception"}],
     why (giải thích đáp án đúng), fix:{lesson, qb, inc} }
   Quy tắc: đúng 1 option ok:true; mỗi option sai PHẢI có why = chẩn đoán hiểu nhầm.
   ============================================================ */
DIAG.register({ items: [

{ id:"dg-java-01", node:"java-collections", d:"java", lv:"junior", dim:"predict",
  q:"Đoạn code sau in ra gì?",
  code:"Map&lt;List&lt;Integer&gt;, String&gt; map = new HashMap&lt;&gt;();\nList&lt;Integer&gt; key = new ArrayList&lt;&gt;(List.of(1, 2));\nmap.put(key, \"A\");\nkey.add(3);                     // sửa key SAU khi put\nSystem.out.println(map.get(key));",
  opts:[
    { t:"<code>null</code> — dù key 'vẫn là object đó'", ok:true },
    { t:"<code>A</code> — vẫn cùng một object key nên tìm thấy", why:"Bạn nghĩ HashMap tìm theo danh tính object. Sai: nó tìm theo <b>hashCode tại thời điểm tra cứu</b> — sửa nội dung key làm hashCode đổi, map đi tìm ở bucket khác." },
    { t:"Ném <code>ConcurrentModificationException</code>", why:"CME chỉ nổ khi sửa <b>collection đang được duyệt</b> — ở đây không ai duyệt map; sửa key là bug im lặng, còn tệ hơn có exception." },
    { t:"<code>A</code>, nhưng chỉ khi map nhỏ hơn 8 phần tử", why:"Ngưỡng 8 là chuyện treeify trong MỘT bucket (đổi cấu trúc tìm kiếm), không liên quan việc hash của key đã đổi." }
  ],
  why:"put lưu vào bucket theo hashCode lúc đó; key bị sửa → hashCode mới → get nhảy tới bucket khác → null. Entry cũ thành 'mồ côi' — memory leak nhỏ. Bài học: key của HashMap phải immutable.",
  fix:{ lesson:"52-collections-deep-dive.html", qb:"hashmap", inc:null } },

{ id:"dg-java-02", node:"java-lang", d:"java", lv:"junior", dim:"predict",
  q:"Đoạn code in ra gì?",
  code:"Integer a = 127, b = 127;\nInteger c = 128, d = 128;\nSystem.out.println((a == b) + \" \" + (c == d));",
  opts:[
    { t:"<code>true false</code>", ok:true },
    { t:"<code>true true</code> — autoboxing luôn trả cùng object cho giá trị bằng nhau", why:"Integer cache chỉ phủ <b>-128..127</b>. Ngoài khoảng đó mỗi lần box là một object mới → == so địa chỉ ra false. Đây là bug 'test số nhỏ thì đúng, prod số to thì sai' kinh điển." },
    { t:"<code>false false</code> — wrapper là object, == luôn false", why:"Không 'luôn false' — chính vì cache -128..127 nên == đôi khi <i>tình cờ</i> true, làm bug khó phát hiện hơn. Hiểu cơ chế cache mới giải thích được cả hai vế." },
    { t:"Không biên dịch được vì so sánh object bằng ==", why:"Java cho phép == giữa object (so reference) — compiler không chặn; đó là lý do lỗi này lọt ra production được." }
  ],
  why:"JVM cache Integer từ -128..127; trong khoảng thì cùng object (true), ngoài thì hai object (false). Kết luận thực chiến: so wrapper luôn dùng equals()/Objects.equals().",
  fix:{ lesson:"48-java-oop-foundation.html", qb:"integer-cache", inc:null } },

{ id:"dg-java-03", node:"java-fp", d:"java", lv:"middle", dim:"predict",
  q:"Chạy đoạn này, console in gì?",
  code:"List.of(1, 2, 3).stream()\n    .map(x -&gt; { System.out.println(\"map \" + x); return x * 2; })\n    .filter(x -&gt; x &gt; 2);\nSystem.out.println(\"xong\");",
  opts:[
    { t:"Chỉ in <code>xong</code> — không có dòng map nào", ok:true },
    { t:"In map 1, map 2, map 3 rồi mới in xong", why:"Bạn coi stream chạy như vòng lặp thường. Stream <b>lazy</b>: map/filter chỉ ghi kế hoạch; không có terminal operation (collect/forEach/count) thì cả pipeline không chạy một bước nào." },
    { t:"Lỗi biên dịch vì kết quả stream không được gán", why:"Bỏ lơ kết quả là hợp lệ với compiler (chỉ IDE cảnh báo). Chính vì hợp lệ nên bug 'quên terminal' mới âm thầm lọt qua." },
    { t:"In map 1 rồi dừng vì filter chặn", why:"Filter không 'chặn' việc in — vấn đề là cả pipeline chưa hề chạy. Thứ tự chảy từng-phần-tử chỉ bắt đầu khi có terminal." }
  ],
  why:"Thao tác trung gian (map, filter) chỉ dựng pipeline. Không có terminal operation → không phần tử nào được xử lý. Quên terminal = code không chạy mà không báo lỗi gì.",
  fix:{ lesson:"03-java-8-17-features.html", qb:"stream", inc:null } },

{ id:"dg-java-04", node:"java-oop", d:"java", lv:"middle", dim:"analyze",
  q:"Class <code>User</code> override <code>equals()</code> (so theo email) nhưng <em>quên</em> <code>hashCode()</code>. Đội bạn thấy <code>HashSet&lt;User&gt;</code> chứa 2 user trùng email. Giải thích đúng là?",
  opts:[
    { t:"Hai user rơi vào bucket khác nhau (hashCode mặc định theo địa chỉ object) nên HashSet không bao giờ đem chúng ra so equals với nhau", ok:true },
    { t:"HashSet bị race condition khi hai thread cùng add", why:"Không cần đa luồng — một thread cũng tái hiện được. Đổ cho race khi chưa loại trừ nguyên nhân đơn luồng là thói quen debug nguy hiểm." },
    { t:"equals viết sai — nếu equals đúng thì Set phải chặn trùng", why:"equals có thể đúng hoàn toàn nhưng <b>không bao giờ được gọi</b>: HashSet tìm bucket bằng hashCode TRƯỚC, chỉ so equals trong cùng bucket. Sai hashCode = equals thành vô dụng." },
    { t:"Phải dùng TreeSet thay HashSet thì mới chặn trùng được", why:"TreeSet 'chữa' được vì nó dùng compareTo thay hashCode — nhưng đó là né vấn đề. Contract equals/hashCode vẫn gãy và sẽ nổ ở chỗ khác (HashMap key, cache...)." }
  ],
  why:"Contract: equals bằng nhau ⇒ hashCode phải bằng nhau. Vi phạm thì mọi collection dạng hash hỏng im lặng: chứa trùng, contains ra false. Luôn generate cặp equals/hashCode từ cùng bộ field (hoặc dùng record).",
  fix:{ lesson:"48-java-oop-foundation.html", qb:"hashcode", inc:null } },

{ id:"dg-jvm-01", node:"jvm-memory", d:"jvm", lv:"middle", dim:"analyze",
  q:"Service ném <code>OutOfMemoryError: Metaspace</code> sau nhiều lần hot-deploy trên cùng một JVM. Thủ phạm khả dĩ nhất?",
  opts:[
    { t:"Classloader cũ không được giải phóng sau mỗi lần deploy — mô tả class tích tụ trong Metaspace", ok:true },
    { t:"Tạo quá nhiều object trong vòng lặp", why:"Object instance sống trong <b>heap</b> — tạo nhiều object gây OOM: Java heap space, không đụng Metaspace. Phân biệt vùng nhớ theo loại OOM là kỹ năng chẩn đoán cơ bản." },
    { t:"Đệ quy quá sâu", why:"Đệ quy sâu ăn <b>stack</b> của thread → StackOverflowError, không phải OOM Metaspace." },
    { t:"Quên đóng connection database", why:"Connection leak làm cạn pool (request treo chờ connection), không làm phình vùng chứa metadata class." }
  ],
  why:"Metaspace chứa MÔ TẢ class. Mỗi lần hot-deploy tạo classloader mới; nếu còn reference giữ classloader cũ (thread, static, ThreadLocal) thì toàn bộ class cũ không được dọn → tích tụ dần → OOM Metaspace. Triệu chứng đặc trưng: chỉ xảy ra sau nhiều lần deploy.",
  fix:{ lesson:"02-jvm-internals.html", qb:"metaspace", inc:"inc-memory-leak" } },

{ id:"dg-jvm-02", node:"jvm-gc", d:"jvm", lv:"middle", dim:"predict",
  q:"Hai object A và B trỏ vào nhau (A.ref = B, B.ref = A) nhưng không còn biến nào khác trỏ tới chúng. GC có thu hồi được không?",
  opts:[
    { t:"Có — chúng unreachable từ GC roots, trỏ vòng vào nhau không cứu được", ok:true },
    { t:"Không — reference count của cả hai vẫn là 1 nên không bao giờ về 0", why:"Bạn đang mô tả <b>reference counting</b> — JVM KHÔNG dùng cách đó chính vì nó bó tay với vòng tham chiếu. JVM dò <b>reachability từ GC roots</b>: không có đường đi từ roots tới = rác, kể cả cả cụm trỏ vòng." },
    { t:"Chỉ thu hồi được nếu gọi System.gc()", why:"System.gc() chỉ là <i>gợi ý</i> chạy GC sớm — không thay đổi việc object có đủ điều kiện thu hồi hay không. Điều kiện duy nhất là unreachable." },
    { t:"Không — phải set A.ref = null trước thì GC mới dọn", why:"Không cần cắt vòng thủ công. Ngày xưa lời khuyên 'set null' phổ biến vì hiểu nhầm này; reachability tracing xử lý vòng tự nhiên." }
  ],
  why:"GC hiện đại đi từ GC roots (stack, static, thread...) lần theo mọi reference. Cụm object trỏ vòng nhưng không nối với roots = không ai với tới được = thu hồi bình thường.",
  fix:{ lesson:"02-jvm-internals.html", qb:"garbage-collection", inc:null } },

{ id:"dg-jvm-03", node:"jvm-troubleshoot", d:"jvm", lv:"senior", dim:"decide",
  q:"Biểu đồ heap <em>sau mỗi lần Full GC</em> tăng dần đều suốt 3 ngày, dự kiến 2 ngày nữa OOM. Hành động ĐẦU TIÊN nên làm?",
  opts:[
    { t:"Chụp heap dump ngay (và bật HeapDumpOnOutOfMemoryError), so sánh 2 dump cách nhau vài giờ để tìm nhóm object tăng bất thường", ok:true },
    { t:"Tăng -Xmx gấp đôi cho an toàn rồi theo dõi tiếp", why:"Heap-sau-GC tăng đều = leak thật; tăng Xmx chỉ dời ngày OOM và làm Full GC pause dài hơn. Bạn đang mua thời gian bằng cách giấu bằng chứng." },
    { t:"Restart service mỗi đêm bằng cron", why:"Restart định kỳ là 'chữa triệu chứng bằng thuốc ngủ' — leak vẫn đó, và bạn vừa bình thường hoá một sự cố. Chỉ chấp nhận như biện pháp câu giờ CÓ thời hạn kèm điều tra." },
    { t:"Review toàn bộ code tìm chỗ quên giải phóng bộ nhớ", why:"Codebase lớn mà đọc chay là mò kim đáy bể. Nguyên tắc: <b>đi theo bằng chứng</b> — heap dump chỉ thẳng nhóm object nào đang giữ RAM và ai đang giữ chúng, khoanh vùng trong vài phút." }
  ],
  why:"Quy trình chuẩn: xác nhận leak (heap-sau-GC tăng) → heap dump (jmap/HeapDumpOnOOM) → mở bằng MAT, xem dominator tree + path to GC roots → về đúng dòng code. Chẩn đoán bằng bằng chứng, không đoán.",
  fix:{ lesson:"02-jvm-internals.html", qb:"memory-leak", inc:"inc-memory-leak" } },

{ id:"dg-conc-01", node:"conc-sync", d:"conc", lv:"middle", dim:"predict",
  q:"Hai thread, mỗi thread gọi <code>increment()</code> 10.000 lần. Kết quả cuối của <code>count</code>?",
  code:"private volatile int count = 0;\nvoid increment() { count++; }",
  opts:[
    { t:"Có thể là bất kỳ số nào từ ~2 đến 20.000 — thường nhỏ hơn 20.000", ok:true },
    { t:"Chắc chắn 20.000 — volatile đảm bảo thread-safe", why:"Misconception phổ biến nhất về volatile: nó chỉ cho <b>visibility</b> (thấy giá trị mới ngay), KHÔNG cho <b>atomicity</b>. count++ vẫn là 3 bước đọc-cộng-ghi, hai thread vẫn chen nhau giữa các bước." },
    { t:"Chắc chắn 20.000 vì int là kiểu nguyên thuỷ, thao tác trên nó là atomic", why:"Ghi/đọc int ĐƠN LẺ là atomic, nhưng count++ là <b>ba</b> thao tác gộp. Tính atomic của từng viên gạch không làm cả bức tường atomic." },
    { t:"Chương trình ném exception vì hai thread cùng ghi một biến", why:"Java không hề báo lỗi khi các thread giẫm nhau — race condition thất bại <i>im lặng</i>. Chính vì không có exception nên loại bug này mới đáng sợ." }
  ],
  why:"Mất lượt cập nhật (lost update): hai thread cùng đọc 5, cùng ghi 6. Sửa: AtomicInteger.incrementAndGet() (CAS) hoặc synchronized. volatile chỉ dành cho cờ một-người-ghi.",
  fix:{ lesson:"01-java-concurrency.html", qb:"volatile", inc:null } },

{ id:"dg-conc-02", node:"conc-pools", d:"conc", lv:"middle", dim:"predict",
  q:"<code>ThreadPoolExecutor(core=2, max=4, queue=ArrayBlockingQueue(2))</code>. Nộp <strong>7 task</strong> chạy lâu cùng lúc. Chuyện gì xảy ra?",
  opts:[
    { t:"2 task chạy ngay, 2 vào queue, tạo thêm 2 thread cho task 5-6, task thứ 7 bị reject", ok:true },
    { t:"Tạo dần 4 thread chạy 4 task, 2 vào queue, task 7 bị reject", why:"Sai thứ tự quyết định: đủ core (2) rồi thì task mới vào <b>QUEUE trước</b>, chỉ khi queue ĐẦY mới tạo thread vượt core. Đây là điểm phản trực giác nhất của TPE — 'tăng dần tới max rồi mới queue' là cách hiểu sai phổ biến." },
    { t:"Cả 7 đều được nhận, 5 task chờ trong queue", why:"Queue chỉ chứa 2. Bạn đang nghĩ tới LinkedBlockingQueue không giới hạn của newFixedThreadPool — chính cấu hình đó gây OOM vì queue phình vô hạn." },
    { t:"Task 7 chờ cho tới khi có thread rảnh", why:"Hành vi mặc định khi bão hoà là <b>AbortPolicy — ném RejectedExecutionException</b>, không phải chờ. Muốn 'người nộp tự chạy' phải chọn CallerRunsPolicy có chủ đích." }
  ],
  why:"Thứ tự TPE: (1) &lt; core → tạo thread; (2) đủ core → vào queue; (3) queue đầy → tạo tới max; (4) max + queue đầy → RejectedExecutionHandler. 7 task: 2 chạy + 2 queue + 2 thread mới + 1 reject.",
  fix:{ lesson:"01-java-concurrency.html", qb:"threadpool", inc:"inc-thread-starvation" } },

{ id:"dg-conc-03", node:"conc-jmm", d:"conc", lv:"senior", dim:"analyze",
  q:"Thread A chạy: <code>data = loadData(); ready = true;</code>. Thread B lặp: <code>if (ready) use(data);</code>. Không có volatile/synchronized. Thi thoảng B thấy <code>ready == true</code> nhưng <code>data == null</code>. Vì sao điều này HỢP LỆ với JVM?",
  opts:[
    { t:"Không có happens-before giữa hai thread nên JIT/CPU được phép đảo thứ tự ghi hoặc để B đọc cache cũ", ok:true },
    { t:"Đây là bug của JVM — thứ tự code phải được tôn trọng", why:"Thứ tự code chỉ được cam kết <b>trong một thread</b> (as-if-serial). Giữa các thread, không có đồng bộ = không có cam kết — reorder là tối ưu hợp pháp mà bạn đã 'ký giấy đồng ý' khi không dùng volatile/lock." },
    { t:"B đọc quá nhanh, thêm Thread.sleep(10) trước khi đọc là hết", why:"Sleep 'chữa' được trong 999/1000 lần chạy thử — vì làm hẹp cửa sổ race chứ không đóng nó. Sửa race bằng sleep là anti-pattern kinh điển: bug quay lại đúng lúc tải cao nhất." },
    { t:"Chỉ xảy ra trên CPU ARM, x86 không bao giờ bị", why:"x86 có memory model mạnh hơn thật, nhưng <b>JIT compiler</b> vẫn được phép reorder ở tầng biên dịch trên mọi kiến trúc. Viết code đúng theo JMM, đừng đánh cược vào phần cứng." }
  ],
  why:"JMM chỉ đảm bảo thứ tự khi có happens-before. Sửa: 'ready' là volatile (mọi ghi trước volatile-write hiện ra với ai đọc thấy volatile-read), hoặc trao kết quả qua công cụ có sẵn happens-before (Future, BlockingQueue, CountDownLatch).",
  fix:{ lesson:"04-java-memory-model.html", qb:"happens-before", inc:null } },

{ id:"dg-conc-04", node:"conc-sync", d:"conc", lv:"middle", dim:"analyze",
  q:"Service 'đứng im': các API liên quan đến đơn hàng không trả lời, nhưng CPU gần 0%. <code>jstack</code> in ra <code>Found one Java-level deadlock</code>. Chẩn đoán và bài học phòng ngừa chính?",
  opts:[
    { t:"Hai thread giữ khoá của nhau chờ vòng tròn; phòng bằng cách mọi nơi lấy các khoá theo cùng một thứ tự", ok:true },
    { t:"CPU 0% nghĩa là máy thiếu tài nguyên, cần scale thêm instance", why:"Ngược lại: CPU thấp + đứng im là dấu hiệu thread <b>chờ</b> chứ không phải <b>thiếu lực</b>. Scale thêm instance chỉ nhân bản deadlock lên nhiều máy." },
    { t:"Đây là livelock, hai thread nhường nhau mãi", why:"Livelock thì thread vẫn CHẠY (CPU cao, làm việc vô ích). jstack đã nói rõ 'deadlock' — đọc bằng chứng trước khi gắn nhãn." },
    { t:"Do GC pause quá dài làm thread không được cấp CPU", why:"GC pause gây khựng <i>tạm thời</i> toàn JVM rồi hồi phục, không tạo trạng thái treo vĩnh viễn một nhóm chức năng — và jstack đã chỉ đích danh deadlock." }
  ],
  why:"Deadlock = chờ khoá vòng tròn, mãi mãi. Triệu chứng đặc trưng: chức năng liên quan đứng im + CPU nhàn rỗi. Thread dump là bằng chứng vàng. Phòng: thống nhất thứ tự lấy khoá + tryLock có timeout + thu hẹp phạm vi khoá.",
  fix:{ lesson:"01-java-concurrency.html", qb:"deadlock", inc:"inc-db-deadlock" } },

{ id:"dg-conc-05", node:"conc-async", d:"conc", lv:"senior", dim:"decide",
  q:"Đồng nghiệp dùng <code>list.parallelStream().map(x -&gt; callHttpApi(x))</code> để gọi API ngoài cho 500 phần tử. Ý kiến đúng nhất?",
  opts:[
    { t:"Phản đối: parallelStream dùng ForkJoinPool.commonPool chung cả JVM — blocking IO sẽ chiếm hết pool, bóp nghẹt mọi nơi khác cũng dùng nó; nên dùng pool riêng giới hạn + CompletableFuture (hoặc HTTP client async)", ok:true },
    { t:"Ổn — parallel stream sinh ra để chạy song song, càng nhiều phần tử càng lợi", why:"parallelStream sinh ra cho việc <b>CPU-bound</b> (tính toán). commonPool có ~số-core thread; 500 call HTTP blocking sẽ giữ chặt vài thread đó hàng giây — cả JVM (kể cả parallel stream nơi khác) xếp hàng theo." },
    { t:"Chỉ cần tăng kích thước commonPool bằng system property là xong", why:"Chỉnh pool <i>toàn cục</i> để phục vụ một chỗ gọi HTTP là dùng thuốc toàn thân trị bệnh ngoài da — mọi nơi khác chịu ảnh hưởng, và con số 'đủ' hôm nay sai vào ngày mai. Cách ly tài nguyên (bulkhead) mới là nguyên tắc đúng." },
    { t:"Đổi sang stream() thường cho an toàn, chấp nhận chạy tuần tự 500 call", why:"An toàn nhưng bỏ cuộc: 500 call tuần tự × 200ms = 100 giây. Bài toán IO song song có lời giải đúng — pool riêng/async client — đừng chọn giữa 'sập' và 'rùa bò'." }
  ],
  why:"Nguyên tắc: tách pool cho IO-bound, giữ commonPool cho CPU-bound. Blocking call trong commonPool là một trong những nguyên nhân 'cả app chậm không rõ lý do' phổ biến nhất.",
  fix:{ lesson:"21-async-patterns.html", qb:"completablefuture", inc:"inc-thread-starvation" } }

]});
