/* ============================================================
   QBANK DATA — DevOps & Cloud   (prefix id: dev-)
   Trang thai: LEGACY — noi dung goc, se viet lai kieu de hieu o dot sau.
   Them cau moi: copy 1 khoi { ... }, dan ngay TRUOC dong danh dau DATA_END
   (dong gan cuoi file), doi id tang dan. Schema + quy tac viet: qbank/GUIDE.md
   ============================================================ */
QB.register({
  group: "DevOps & Cloud",
  order: 8,
  prefix: "dev",
  status: "legacy",
  questions: [
/* DATA_START */

{ id:"dev-001", legacy:100, t:"24 Docker/K8s", lv:"junior", core:true,
  tags:["docker-k8s"],
  q:"Container (Docker) và máy ảo (VM) khác nhau ở đâu? Vì sao container nhẹ hơn?",
  a:"<p><strong>VM</strong> ảo hoá cả phần cứng, mỗi VM chạy một <em>OS đầy đủ</em> (kernel riêng) → nặng, khởi động chậm (phút). <strong>Container</strong> chia sẻ <em>kernel</em> của host, chỉ đóng gói app + thư viện cần thiết → nhẹ (MB), khởi động nhanh (giây), mật độ cao.</p><p>Đổi lại, container cô lập yếu hơn VM (chung kernel). Docker image được build theo layer, tái dùng layer chung.</p><div class='qb-eli5'><b>🌱 Ví von:</b> VM = mỗi nhà xây riêng cả móng (OS); container = các căn hộ chung một toà nhà (kernel), ai có đồ nấy.</div>",
  refs:[["Docker – What is a container","https://www.docker.com/resources/what-container/"]] },

{ id:"dev-002", legacy:101, t:"24 Docker/K8s", lv:"middle", core:true,
  tags:["docker-k8s"],
  q:"Trong Kubernetes, Pod / Deployment / Service khác nhau thế nào?",
  a:"<ul><li><strong>Pod</strong>: đơn vị chạy nhỏ nhất — một (hoặc vài) container chung network/volume. Pod là <em>phù du</em>, chết là mất, IP đổi.</li><li><strong>Deployment</strong>: quản lý một tập Pod giống nhau — giữ đúng số replica, tự thay Pod chết, lo rolling update/rollback.</li><li><strong>Service</strong>: một 'địa chỉ ổn định' (virtual IP/DNS) + load balance tới các Pod đang sống, bất kể Pod đến/đi.</li></ul><div class='qb-eli5'><b>🌱 Mẹo nhớ:</b> Deployment 'nuôi' Pod; Service 'chỉ đường' tới Pod (vì Pod hay đổi IP).</div>",
  refs:[["Kubernetes – Concepts","https://kubernetes.io/docs/concepts/workloads/"]] },

{ id:"dev-003", legacy:102, t:"24 Docker/K8s", lv:"middle", core:true,
  tags:["docker-k8s"],
  q:"Liveness probe và readiness probe khác nhau ra sao? Nhầm lẫn gây hậu quả gì?",
  a:"<p><strong>Liveness</strong>: 'app còn sống không?' — fail → K8s <em>restart</em> Pod. <strong>Readiness</strong>: 'app sẵn sàng nhận traffic chưa?' — fail → K8s <em>ngừng gửi traffic</em> (rút khỏi Service) nhưng KHÔNG restart.</p><p>Nhầm: đặt liveness kiểm tra cả dependency (DB) → khi DB chậm tạm thời, liveness fail → K8s restart Pod liên tục (crash loop) trong khi app vốn ổn. Dependency nên nằm ở <em>readiness</em>. Cần cả <em>startup probe</em> cho app khởi động lâu.</p>",
  refs:[["Kubernetes – Probes","https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"]] },

{ id:"dev-004", legacy:103, t:"24 Docker/K8s", lv:"middle", core:false,
  tags:["docker-k8s"],
  q:"Resource <code>requests</code> và <code>limits</code> khác gì? Điều gì xảy ra khi vượt?",
  a:"<p><strong>requests</strong>: lượng tài nguyên tối thiểu Pod cần — dùng để <em>scheduler</em> chọn node. <strong>limits</strong>: trần tối đa.</p><ul><li>Vượt <strong>CPU limit</strong> → bị <em>throttle</em> (chậm lại), không bị giết.</li><li>Vượt <strong>memory limit</strong> → bị <strong>OOMKilled</strong> (kernel giết Pod).</li></ul><p>Đặt requests quá thấp → node bị nhồi quá tải; limits quá thấp → app bị throttle/kill oan. Quan hệ requests/limits còn quyết định <em>QoS class</em> (Guaranteed/Burstable/BestEffort) khi node thiếu tài nguyên.</p>",
  refs:[["Kubernetes – Resource management","https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/"]] },

{ id:"dev-005", legacy:104, t:"25 CI/CD", lv:"middle", core:false,
  tags:["ci-cd"],
  q:"Rolling update giúp deploy không downtime thế nào? Vai trò của readiness probe?",
  a:"<p>Rolling update thay Pod cũ bằng Pod mới <em>từ từ</em>: tạo Pod mới, chờ nó <strong>readiness = OK</strong> rồi mới nhận traffic và mới xoá một Pod cũ; lặp lại tới khi thay hết. Luôn còn Pod phục vụ → không downtime.</p><p>Readiness probe là điều kiện then chốt: nếu thiếu, K8s gửi traffic vào Pod chưa sẵn sàng (chưa warm-up, chưa kết nối DB) → lỗi 5xx trong lúc deploy. <code>maxSurge</code>/<code>maxUnavailable</code> điều chỉnh tốc độ.</p>",
  refs:[["Kubernetes – Rolling updates","https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/"]] },

{ id:"dev-006", legacy:105, t:"25 CI/CD", lv:"middle", core:true,
  tags:["ci-cd"],
  q:"Blue-green, Canary và Rolling deployment khác nhau ra sao?",
  a:"<ul><li><strong>Rolling</strong>: thay dần Pod cũ bằng mới. Không cần gấp đôi tài nguyên, nhưng trong lúc deploy tồn tại cả 2 version.</li><li><strong>Blue-green</strong>: dựng môi trường mới (green) song song, test xong <em>chuyển toàn bộ</em> traffic sang, giữ blue để rollback tức thì. Tốn gấp đôi tài nguyên.</li><li><strong>Canary</strong>: cho <em>một phần nhỏ</em> traffic (5%) vào version mới, theo dõi metric, ổn thì tăng dần. Giảm bán kính ảnh hưởng khi có bug.</li></ul><div class='qb-eli5'><b>🌱 Mẹo:</b> canary = 'thả con chim vàng vào mỏ để thử khí độc' trước khi cả đội vào.</div>",
  refs:[["AWS – Deployment strategies","https://docs.aws.amazon.com/whitepapers/latest/practicing-continuous-integration-continuous-delivery/deployment-methods.html"]] },

{ id:"dev-007", legacy:106, t:"25 CI/CD", lv:"middle", core:false,
  tags:["ci-cd"],
  q:"Feature flag giúp 'tách deploy khỏi release' như thế nào?",
  a:"<p><strong>Deploy</strong> = đưa code lên production (bật/tắt vẫn nằm im). <strong>Release</strong> = cho người dùng thấy tính năng. Feature flag là công tắc runtime bọc quanh tính năng: deploy code với flag <em>tắt</em>, khi sẵn sàng thì <em>bật</em> mà không cần deploy lại.</p><p>Lợi: bật dần theo % user, tắt ngay khi có sự cố (kill switch) không cần rollback deploy, A/B test. Đánh đổi: nợ kỹ thuật nếu flag không được dọn sau khi ổn định.</p>",
  refs:[["Martin Fowler – Feature Toggles","https://martinfowler.com/articles/feature-toggles.html"]] },

{ id:"dev-008", legacy:107, t:"25 CI/CD", lv:"senior", core:false,
  tags:["ci-cd"],
  q:"Đổi schema DB (đổi tên cột) mà không downtime — 'expand-contract' làm thế nào?",
  a:"<p>Không đổi thẳng (vì code cũ và mới chạy song song lúc deploy). Dùng <strong>expand → migrate → contract</strong>:</p><ol><li><strong>Expand</strong>: thêm cột mới, code ghi <em>cả hai</em> cột, đọc cột cũ. (backward compatible)</li><li><strong>Migrate</strong>: backfill dữ liệu sang cột mới; deploy version đọc cột mới.</li><li><strong>Contract</strong>: khi không còn ai dùng cột cũ, mới xoá.</li></ol><p>Mỗi bước tương thích với version liền kề → rolling deploy an toàn. Xoá cột ngay từ đầu = code cũ đang chạy sẽ lỗi.</p>",
  refs:[["Martin Fowler – Evolutionary DB","https://martinfowler.com/articles/evodb.html"]] },

{ id:"dev-009", legacy:108, t:"26 Observability", lv:"middle", core:true,
  tags:["observability"],
  q:"3 trụ cột của observability là gì? Correlation/trace id để làm gì?",
  a:"<ul><li><strong>Logs</strong>: sự kiện rời rạc, chi tiết ('cái gì đã xảy ra ở dòng này').</li><li><strong>Metrics</strong>: số liệu tổng hợp theo thời gian (QPS, latency p99, error rate) — rẻ, hợp để alert.</li><li><strong>Traces</strong>: theo một request đi qua <em>nhiều service</em>, thấy mỗi span tốn bao lâu → tìm bottleneck.</li></ul><p><strong>Correlation/trace id</strong>: một id gắn vào request từ đầu, truyền qua mọi service và ghi vào mọi log → khi có sự cố, lọc theo id là dựng lại được toàn bộ hành trình một request qua hệ phân tán.</p>",
  refs:[["OpenTelemetry – Observability primer","https://opentelemetry.io/docs/concepts/observability-primer/"]] },

{ id:"dev-010", legacy:109, t:"26 Observability", lv:"middle", core:false,
  tags:["observability"],
  q:"SLI, SLO, SLA và 'error budget' nghĩa là gì?",
  a:"<p><strong>SLI</strong> (Indicator): số đo thực tế (vd % request &lt; 300ms). <strong>SLO</strong> (Objective): mục tiêu nội bộ cho SLI (vd 99.9%). <strong>SLA</strong> (Agreement): cam kết với khách hàng kèm hậu quả (bồi thường) nếu không đạt — thường lỏng hơn SLO.</p><p><strong>Error budget</strong> = 100% − SLO (vd 0.1% được phép lỗi). Còn budget → được đẩy tính năng mới/nhận rủi ro; cháy budget → dừng lại tập trung vào ổn định. Nó biến 'độ tin cậy' thành ngân sách để cân đối tốc độ vs ổn định.</p>",
  refs:[["Google SRE – SLOs","https://sre.google/sre-book/service-level-objectives/"]] },

{ id:"dev-011", legacy:110, t:"54 AWS", lv:"middle", core:false,
  tags:["aws"],
  q:"AWS: EC2, Lambda, ECS/EKS — chọn compute nào khi nào?",
  a:"<ul><li><strong>EC2</strong>: máy ảo, toàn quyền kiểm soát, tự quản OS/scaling. Hợp workload chạy liên tục, cần tuỳ biến sâu.</li><li><strong>Lambda</strong> (serverless): chạy theo sự kiện, tự scale về 0, trả tiền theo lần gọi. Hợp việc ngắn, tải bùng nổ/không đều; nhược: cold start, giới hạn thời gian chạy.</li><li><strong>ECS/EKS</strong>: chạy container có điều phối; EKS = Kubernetes managed. Hợp khi đã container hoá, cần mở rộng nhiều service.</li></ul><div class='qb-eli5'><b>🌱 Mẹo:</b> việc lắt nhắt theo sự kiện → Lambda; dịch vụ chạy 24/7 container → ECS/EKS; cần kiểm soát tối đa → EC2.</div>",
  refs:[["AWS – Compute","https://aws.amazon.com/products/compute/"]] }

/* DATA_END */
] });
