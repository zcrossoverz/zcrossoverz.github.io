/* ============================================================
   SKILLMAP — bản đồ kiến thức Backend Engineering (xương sống hệ thống)
   - node.id     : định danh duy nhất (domain-prefix)
   - node.d      : domain id
   - node.lv     : "junior" | "middle" | "senior" (mức cần đạt của node)
   - node.pre    : các node cần vững TRƯỚC (prerequisite — không được tạo vòng)
   - node.lesson : file bài học trong html/ (null = học qua qbank/incident; planned = chưa có)
   - node.tags   : nối tới câu hỏi qbank có tag giao nhau (evidence "nhớ/giải thích")
   - node.inc    : incident id trong incidents/ (evidence "debug")
   - node.vnote  : kiến thức phụ thuộc PHIÊN BẢN — ghi rõ để không dạy điều đã cũ
   - node.planned: true = lỗ hổng nội dung đã nhận diện, chưa có bài — roadmap
   Sửa file này xong PHẢI chạy: node _qa/validate.mjs
   ============================================================ */
window.SKILLMAP = {
  version: 1,
  updated: "2026-07-12", /* sync */
  domains: [
    { id: "cs",     t: "CS Foundation & Algorithms", icon: "🧮", order: 1 },
    { id: "web",    t: "Web & Networking",           icon: "🌐", order: 2 },
    { id: "java",   t: "Java Core",                  icon: "☕", order: 3 },
    { id: "jvm",    t: "JVM & Memory",               icon: "⚙️", order: 4 },
    { id: "conc",   t: "Concurrency",                icon: "🧵", order: 5 },
    { id: "spring", t: "Spring & Spring Boot",       icon: "🌱", order: 6 },
    { id: "data",   t: "Database Engineering",       icon: "🗄️", order: 7 },
    { id: "cache",  t: "Redis & Caching",            icon: "⚡", order: 8 },
    { id: "msg",    t: "Messaging & Kafka",          icon: "📨", order: 9 },
    { id: "dist",   t: "Distributed Systems",        icon: "🕸️", order: 10 },
    { id: "resil",  t: "Reliability & Performance",  icon: "🛡️", order: 11 },
    { id: "api",    t: "API Design",                 icon: "🔌", order: 12 },
    { id: "sec",    t: "Security",                   icon: "🔐", order: 13 },
    { id: "test",   t: "Testing",                    icon: "✅", order: 14 },
    { id: "ops",    t: "Ops: Linux → K8s → Observability", icon: "🖥️", order: 15 },
    { id: "sysdes", t: "Architecture & System Design", icon: "🏛️", order: 16 },
    { id: "dom",    t: "Nghiệp vụ & AI",             icon: "🏦", order: 17 },
    { id: "career", t: "Interview & Senior Skills",  icon: "🎯", order: 18 }
  ],
  nodes: [
    /* ---------- CS Foundation ---------- */
    { id: "cs-bigo",   d: "cs", t: "Mental model thuật toán & Big-O", lv: "junior", pre: [], lesson: "43-algorithm-mental-model.html", tags: ["mental-model", "algorithms"], inc: [] },
    { id: "cs-ds",     d: "cs", t: "Cấu trúc dữ liệu cốt lõi", lv: "junior", pre: ["cs-bigo"], lesson: "38-algorithm-data-structure.html", tags: ["algorithms"], inc: [] },
    { id: "cs-patterns", d: "cs", t: "Coding patterns (two-pointer, BFS/DFS, DP…)", lv: "middle", pre: ["cs-ds"], lesson: "42-leetcode-patterns-mastery.html", tags: ["algorithms"], inc: [] },
    { id: "cs-coding-interview", d: "cs", t: "Coding interview playbook", lv: "middle", pre: ["cs-patterns"], lesson: "44-faang-coding-playbook.html", tags: [], inc: [] },
    { id: "cs-os",     d: "cs", t: "OS cho backend: process, memory, scheduler, IO", lv: "middle", pre: [], lesson: null, planned: true, tags: ["process", "linux"], inc: [] },

    /* ---------- Web & Networking ---------- */
    { id: "web-http",    d: "web", t: "HTTP: method, status, header, vòng đời request", lv: "junior", pre: [], lesson: "47-junior-foundation-pack.html", tags: ["http", "status-code", "idempotent", "cookie", "session"], inc: [] },
    { id: "web-network", d: "web", t: "TCP/UDP, DNS, TLS", lv: "junior", pre: ["web-http"], lesson: null, tags: ["tcp", "udp", "dns", "tls", "https"], inc: [] },
    { id: "web-infra",   d: "web", t: "Reverse proxy, CORS, HTTP caching", lv: "junior", pre: ["web-http"], lesson: null, tags: ["nginx", "reverse-proxy", "cors", "cache", "http2"], inc: [] },

    /* ---------- Java Core ---------- */
    { id: "java-lang",        d: "java", t: "Ngôn ngữ & bộ nhớ căn bản (pass-by-value, wrapper, String)", lv: "junior", pre: [], lesson: "48-java-oop-foundation.html", tags: ["pass-by-value", "wrapper", "string", "static", "final", "jdk"], inc: [] },
    { id: "java-oop",         d: "java", t: "OOP & equals/hashCode contract", lv: "junior", pre: ["java-lang"], lesson: "48-java-oop-foundation.html", tags: ["oop", "overloading", "interface", "equals", "hashcode"], inc: [] },
    { id: "java-collections", d: "java", t: "Collections framework & internals", lv: "junior", pre: ["java-oop"], lesson: "52-collections-deep-dive.html", tags: ["collections", "hashmap", "arraylist", "comparable", "iterator"], inc: [] },
    { id: "java-fp",          d: "java", t: "Lambda, Stream, Optional", lv: "junior", pre: ["java-lang"], lesson: "03-java-8-17-features.html", tags: ["lambda", "stream", "optional", "java8"], inc: [] },
    { id: "java-exceptions",  d: "java", t: "Exception, try-with-resources & logging", lv: "junior", pre: ["java-lang"], lesson: "49-exception-logging.html", tags: ["exception", "checked", "try-with-resources", "logging", "log-level"], inc: [] },
    { id: "java-modern",      d: "java", t: "Java hiện đại: record, sealed, pattern matching", lv: "middle", pre: ["java-fp"], lesson: "03-java-8-17-features.html", tags: ["java-version", "record"], inc: [], vnote: "Java 17/21 — record 16, sealed 17, pattern switch 21" },

    /* ---------- JVM & Memory ---------- */
    { id: "jvm-memory",      d: "jvm", t: "Cấu trúc bộ nhớ JVM (heap, stack, metaspace)", lv: "middle", pre: ["java-lang"], lesson: "02-jvm-internals.html", tags: ["jvm", "heap", "stack", "metaspace"], inc: ["inc-k8s-oomkilled"] },
    { id: "jvm-gc",          d: "jvm", t: "Garbage Collection & generational heap", lv: "middle", pre: ["jvm-memory"], lesson: "02-jvm-internals.html", tags: ["gc", "garbage-collection"], inc: ["inc-memory-leak", "inc-gc-pressure"], vnote: "G1 mặc định từ Java 9; ZGC generational từ 21" },
    { id: "jvm-troubleshoot", d: "jvm", t: "Chẩn đoán JVM: heap dump, thread dump, profiler", lv: "senior", pre: ["jvm-gc"], lesson: "02-jvm-internals.html", tags: ["memory-leak", "heap-dump", "mat"], inc: ["inc-memory-leak", "inc-thread-starvation"] },

    /* ---------- Concurrency ---------- */
    { id: "conc-basics", d: "conc", t: "Thread, Runnable/Callable, vòng đời", lv: "junior", pre: ["java-lang"], lesson: "01-java-concurrency.html", tags: ["thread", "process", "runnable", "callable"], inc: [] },
    { id: "conc-sync",   d: "conc", t: "Race condition, volatile, synchronized, atomic", lv: "middle", pre: ["conc-basics"], lesson: "01-java-concurrency.html", tags: ["race-condition", "volatile", "synchronized", "atomic", "visibility", "thread-safe"], inc: [] },
    { id: "conc-pools",  d: "conc", t: "Thread pool & ExecutorService", lv: "middle", pre: ["conc-basics"], lesson: "01-java-concurrency.html", tags: ["threadpool", "executor", "queue"], inc: ["inc-thread-starvation"] },
    { id: "conc-async",  d: "conc", t: "CompletableFuture & async patterns", lv: "senior", pre: ["conc-pools"], lesson: "21-async-patterns.html", tags: ["completablefuture", "async", "async-patterns"], inc: ["inc-thread-starvation"] },
    { id: "conc-jmm",    d: "conc", t: "Java Memory Model & happens-before", lv: "senior", pre: ["conc-sync"], lesson: "04-java-memory-model.html", tags: ["happens-before", "memory-model", "reordering", "singleton"], inc: [] },
    { id: "conc-dist-lock", d: "conc", t: "Khoá xuyên instance & chống double-processing", lv: "senior", pre: ["conc-sync", "cache-redis"], lesson: "33-idempotency.html", tags: ["distributed-lock", "scale-out"], inc: ["inc-duplicate-message"] },
    { id: "conc-vthreads", d: "conc", t: "Virtual threads (Project Loom)", lv: "senior", pre: ["conc-pools"], lesson: null, planned: true, tags: ["virtual-threads"], inc: [], vnote: "Java 21+ — thay đổi cách nghĩ về blocking IO; JEP 491 (Java 24) gỡ pinning của synchronized" },

    /* ---------- Spring ---------- */
    { id: "spr-core", d: "spring", t: "IoC, DI, bean & lifecycle", lv: "junior", pre: ["java-oop"], lesson: "05-spring-core.html", tags: ["ioc", "dependency-injection", "bean", "spring-core", "qualifier"], inc: [] },
    { id: "spr-boot", d: "spring", t: "Spring Boot, auto-configuration, profiles", lv: "junior", pre: ["spr-core"], lesson: "06-spring-boot.html", tags: ["spring-boot", "auto-configuration", "starter", "configuration-properties", "profiles"], inc: [] },
    { id: "spr-mvc",  d: "spring", t: "Spring MVC: DispatcherServlet → controller", lv: "junior", pre: ["spr-boot", "web-http"], lesson: null, tags: ["spring-mvc"], inc: [] },
    { id: "spr-state", d: "spring", t: "Singleton bean & thread-safety trong web app", lv: "middle", pre: ["spr-core", "conc-sync"], lesson: "05-spring-core.html", tags: ["singleton", "bean-scope", "state"], inc: [] },
    { id: "spr-tx",   d: "spring", t: "Spring Transaction: proxy, propagation, rollback", lv: "middle", pre: ["spr-core", "data-tx"], lesson: "07-spring-transaction.html", tags: ["spring-transaction"], inc: [] },
    { id: "spr-jpa",  d: "spring", t: "JPA/Hibernate: persistence context, lazy, N+1", lv: "middle", pre: ["spr-core", "data-sql-core"], lesson: "09-spring-data-jpa.html", tags: ["spring-data-jpa", "lazy"], inc: ["inc-n-plus-one"] },
    { id: "spr-webflux", d: "spring", t: "WebFlux & reactive — khi nào (không) dùng", lv: "senior", pre: ["conc-async", "spr-boot"], lesson: "10-spring-webflux.html", tags: ["spring-webflux"], inc: [] },

    /* ---------- Database ---------- */
    { id: "data-sql-core",   d: "data", t: "SQL nền tảng: JOIN, GROUP BY, NULL, subquery", lv: "junior", pre: [], lesson: "11-sql-advanced.html", tags: ["join", "sql", "group-by", "null", "union", "window-function"], inc: [] },
    { id: "data-sql-tuning", d: "data", t: "Index, EXPLAIN & query tuning", lv: "middle", pre: ["data-sql-core"], lesson: "11-sql-advanced.html", tags: ["index", "btree", "composite-index", "explain", "covering-index", "pagination", "sargable"], inc: ["inc-n-plus-one"] },
    { id: "data-design",     d: "data", t: "Thiết kế schema, chuẩn hoá, khoá", lv: "middle", pre: ["data-sql-core"], lesson: "12-database-design.html", tags: ["normalization", "primary-key", "foreign-key", "soft-delete", "constraint"], inc: [] },
    { id: "data-tx",         d: "data", t: "ACID, isolation level, MVCC, locking", lv: "middle", pre: ["data-sql-core"], lesson: "39-database-consistency.html", tags: ["acid", "transaction", "isolation-level", "mvcc", "optimistic-lock", "pessimistic-lock", "deadlock"], inc: ["inc-db-deadlock"] },
    { id: "data-pool",       d: "data", t: "Connection pool & vòng đời kết nối", lv: "junior", pre: [], lesson: null, tags: ["connection-pool", "hikari"], inc: ["inc-pool-exhaustion"] },
    { id: "data-oracle",     d: "data", t: "Oracle deep dive (bind variable, parse, AWR)", lv: "middle", pre: ["data-sql-tuning"], lesson: "40-oracle-deep-dive.html", tags: ["oracle", "bind-variable", "hard-parse"], inc: [] },
    { id: "data-scale",      d: "data", t: "Partitioning, sharding, read replica", lv: "senior", pre: ["data-tx", "data-sql-tuning"], lesson: "12-database-design.html", tags: ["partitioning", "sharding"], inc: [] },

    /* ---------- Cache ---------- */
    { id: "cache-redis",    d: "cache", t: "Redis: kiểu dữ liệu, TTL, persistence", lv: "junior", pre: [], lesson: "14-redis.html", tags: ["redis", "cache", "in-memory"], inc: [] },
    { id: "cache-patterns", d: "cache", t: "Caching patterns & invalidation", lv: "middle", pre: ["cache-redis"], lesson: "14-redis.html", tags: ["cache-aside", "write-through", "write-behind", "ttl"], inc: ["inc-cache-stampede"] },
    { id: "cache-failures", d: "cache", t: "Stampede, penetration, avalanche, hot key", lv: "senior", pre: ["cache-patterns"], lesson: "14-redis.html", tags: ["cache-penetration", "cache-avalanche", "hot-key", "bloom-filter", "distributed-lock"], inc: ["inc-cache-stampede"] },

    /* ---------- Messaging ---------- */
    { id: "msg-kafka",    d: "msg", t: "Kafka: topic, partition, consumer group, offset", lv: "middle", pre: ["web-network"], lesson: "20-apache-kafka.html", tags: ["kafka"], inc: ["inc-duplicate-message", "inc-consumer-lag"] },
    { id: "msg-delivery", d: "msg", t: "Delivery semantics & idempotent consumer", lv: "senior", pre: ["msg-kafka", "resil-idem"], lesson: "20-apache-kafka.html", tags: ["kafka", "idempotency"], inc: ["inc-duplicate-message"] },
    { id: "msg-eda",      d: "msg", t: "Event-driven architecture & outbox pattern", lv: "senior", pre: ["msg-kafka", "data-tx"], lesson: "18-event-driven-architecture.html", tags: ["event-driven"], inc: ["inc-outbox-stuck"] },

    /* ---------- Distributed ---------- */
    { id: "dist-basics", d: "dist", t: "CAP/PACELC, consistency model, thời gian & thứ tự", lv: "senior", pre: ["data-tx"], lesson: "39-database-consistency.html", tags: ["cap-theorem", "pacelc", "distributed"], inc: [] },
    { id: "dist-tx",     d: "dist", t: "Distributed transaction, saga, 2PC", lv: "senior", pre: ["dist-basics", "msg-eda"], lesson: "13-distributed-transaction.html", tags: ["distributed-tx"], inc: [] },
    { id: "dist-consensus", d: "dist", t: "Consensus & replication: Raft, leader election, quorum", lv: "senior", pre: ["dist-basics"], lesson: "67-consensus-consistent-hashing.html", tags: ["consensus", "raft", "quorum", "leader-election"], inc: [] },
    { id: "dist-hashing",   d: "dist", t: "Consistent hashing & data partitioning", lv: "senior", pre: ["dist-basics"], lesson: "67-consensus-consistent-hashing.html", tags: ["consistent-hashing", "partitioning"], inc: [] },

    /* ---------- Reliability & Performance ---------- */
    { id: "resil-idem",     d: "resil", t: "Idempotency đầu-cuối", lv: "middle", pre: ["web-http", "data-design"], lesson: "33-idempotency.html", tags: ["idempotent", "idempotency"], inc: ["inc-duplicate-message"] },
    { id: "resil-patterns", d: "resil", t: "Timeout, retry + backoff, circuit breaker, bulkhead", lv: "middle", pre: ["web-http"], lesson: "22-resilience-patterns.html", tags: ["resilience"], inc: ["inc-retry-storm"] },
    { id: "resil-design",   d: "resil", t: "Chống cascading failure & graceful degradation", lv: "senior", pre: ["resil-patterns", "cache-patterns"], lesson: "22-resilience-patterns.html", tags: ["resilience"], inc: ["inc-retry-storm", "inc-cache-stampede"] },
    { id: "resil-perf",     d: "resil", t: "Performance tuning: đo trước, sửa sau", lv: "senior", pre: ["jvm-gc", "data-sql-tuning"], lesson: "23-performance-tuning.html", tags: ["performance"], inc: ["inc-n-plus-one", "inc-thread-starvation", "inc-gc-pressure"] },

    /* ---------- API ---------- */
    { id: "api-rest",      d: "api", t: "REST design & data contract", lv: "junior", pre: ["web-http"], lesson: "19-api-design.html", tags: ["rest", "api", "api-design", "json", "path"], inc: [] },
    { id: "api-evolution", d: "api", t: "Versioning, pagination, error contract, webhook", lv: "middle", pre: ["api-rest"], lesson: "19-api-design.html", tags: ["api-design", "pagination"], inc: [] },

    /* ---------- Security ---------- */
    { id: "sec-auth",   d: "sec", t: "AuthN vs AuthZ, session, JWT", lv: "junior", pre: ["web-http"], lesson: "08-spring-security.html", tags: ["authentication", "authorization", "jwt", "token"], inc: [] },
    { id: "sec-appsec", d: "sec", t: "OWASP: injection, XSS, CSRF, SSRF", lv: "middle", pre: ["sec-auth"], lesson: "29-application-security.html", tags: ["app-security", "sql-injection", "security", "prepared-statement"], inc: [] },
    { id: "sec-spring", d: "sec", t: "Spring Security: filter chain & method security", lv: "middle", pre: ["sec-auth", "spr-boot"], lesson: "08-spring-security.html", tags: ["spring-security"], inc: [] },
    { id: "sec-crypto", d: "sec", t: "Cryptography thực dụng (hash, HMAC, chữ ký)", lv: "senior", pre: ["sec-appsec"], lesson: "30-cryptography.html", tags: ["cryptography", "certificate", "ma-hoa"], inc: [] },

    /* ---------- Testing ---------- */
    { id: "test-strategy", d: "test", t: "Test pyramid, unit vs integration, Testcontainers", lv: "junior", pre: ["java-lang"], lesson: "27-testing-strategy.html", tags: ["testing-strategy"], inc: [] },
    { id: "test-perf",     d: "test", t: "Load/stress/soak testing & đọc percentile", lv: "middle", pre: ["test-strategy"], lesson: "28-performance-testing.html", tags: ["performance-testing"], inc: [] },

    /* ---------- Ops ---------- */
    { id: "ops-linux",  d: "ops", t: "Linux: process, port, log, đọc tài nguyên", lv: "junior", pre: [], lesson: "51-linux-backend-essentials.html", tags: ["linux", "port", "grep", "debug"], inc: [] },
    { id: "ops-git",    d: "ops", t: "Git workflow làm việc nhóm", lv: "junior", pre: [], lesson: "50-git-daily-workflow.html", tags: ["git"], inc: [] },
    { id: "ops-docker", d: "ops", t: "Docker & Kubernetes căn bản", lv: "middle", pre: ["ops-linux"], lesson: "24-docker-kubernetes.html", tags: ["docker-k8s"], inc: ["inc-k8s-oomkilled"] },
    { id: "ops-cicd",   d: "ops", t: "CI/CD pipeline & deploy an toàn", lv: "middle", pre: ["ops-docker", "ops-git", "test-strategy"], lesson: "25-cicd-pipeline.html", tags: ["ci-cd"], inc: [] },
    { id: "ops-obs",    d: "ops", t: "Observability: log có cấu trúc, metric, trace", lv: "middle", pre: ["ops-linux"], lesson: "26-observability.html", tags: ["observability", "logging"], inc: ["inc-retry-storm", "inc-cache-stampede"] },
    { id: "ops-audit",  d: "ops", t: "Audit logging & compliance", lv: "middle", pre: ["data-design"], lesson: "34-audit-logging.html", tags: ["audit-logging"], inc: [] },
    { id: "ops-aws",    d: "ops", t: "AWS cho Java backend", lv: "middle", pre: ["ops-docker"], lesson: "54-aws-java-backend.html", tags: ["aws"], inc: [] },
    { id: "ops-k8s-tshoot", d: "ops", t: "K8s troubleshooting: probe, OOMKilled, rollout", lv: "senior", pre: ["ops-docker", "ops-obs"], lesson: null, planned: true, tags: [], inc: [] },

    /* ---------- Architecture & System Design ---------- */
    { id: "des-clean",    d: "sysdes", t: "Clean code & SOLID", lv: "junior", pre: ["java-oop"], lesson: "36-clean-code-solid.html", tags: ["solid"], inc: [] },
    { id: "des-patterns", d: "sysdes", t: "Design patterns dùng thật", lv: "middle", pre: ["des-clean"], lesson: "16-design-patterns.html", tags: ["design-patterns"], inc: [] },
    { id: "des-arch",     d: "sysdes", t: "Clean architecture & DDD", lv: "senior", pre: ["des-patterns"], lesson: "15-clean-architecture-ddd.html", tags: ["clean-arch-ddd"], inc: [] },
    { id: "des-micro",    d: "sysdes", t: "Microservices patterns & ranh giới service", lv: "senior", pre: ["des-arch", "dist-basics"], lesson: "17-microservices-patterns.html", tags: ["microservices"], inc: [] },
    { id: "des-sysdes",   d: "sysdes", t: "System design method: từ yêu cầu → kiến trúc", lv: "senior", pre: ["data-scale", "cache-patterns", "msg-kafka", "resil-patterns"], lesson: "37-system-design-interview.html", tags: ["system-design", "scalability"], inc: [] },
    { id: "des-faang",    d: "sysdes", t: "System design nâng cao (case khó)", lv: "senior", pre: ["des-sysdes"], lesson: "45-faang-system-design.html", tags: ["system-design"], inc: [] },

    /* ---------- Nghiệp vụ & AI ---------- */
    { id: "dom-payment", d: "dom", t: "Payment & banking concepts", lv: "middle", pre: ["data-tx", "resil-idem"], lesson: "35-payment-banking-concepts.html", tags: ["payment"], inc: [] },
    { id: "dom-ai",      d: "dom", t: "Tích hợp AI/LLM vào backend", lv: "middle", pre: ["api-rest"], lesson: "53-ai-llm-backend-integration.html", tags: ["ai-llm"], inc: [] },

    /* ---------- Interview & Senior skills ---------- */
    { id: "car-behavioral", d: "career", t: "Behavioral & STAR stories", lv: "junior", pre: [], lesson: "59-behavioral-rehearsal-drill.html", tags: ["behavioral"], inc: [] },
    { id: "car-hr-ach",     d: "career", t: "HR pack & ACH project deep-dive (song ngữ VI-EN)", lv: "junior", pre: [], lesson: "66-hr-ach-interview-pack.html", tags: [], inc: [] },
    { id: "car-mock",       d: "career", t: "Mock interview end-to-end", lv: "middle", pre: ["car-behavioral"], lesson: "57-mock-payment-gateway.html", tags: [], inc: [] },
    { id: "car-soft",       d: "career", t: "Senior soft skills: ảnh hưởng, mentoring, quyết định", lv: "senior", pre: [], lesson: null, planned: true, tags: [], inc: [] }
  ]
};
