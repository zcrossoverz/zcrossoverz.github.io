# Phỏng vấn Java Mid — Bản chỉnh sửa

> Bản viết lại từ tài liệu gốc: sửa lỗi kỹ thuật, thống nhất văn phong, giải thích chi tiết để người mới đọc cũng hiểu. Các chỗ bản gốc sai được liệt kê ở **Phụ lục cuối file**. Đánh số lại 1–49 (bản gốc có hai mục 31 trùng nhau).
>
> Cách dùng: câu **in đậm đầu mỗi mục** là câu trả lời gọn khi phỏng vấn; phần sau là giải thích để hiểu bản chất — hiểu rồi thì tự nói được, không cần học thuộc.

---

## Phần 1 — Java Core & OOP cơ bản

### 1. JavaBean là gì?

**JavaBean là một quy ước (convention) để viết class Java: có constructor không tham số, field để `private`, truy cập qua getter/setter, và thường implements `Serializable`.**

Vì sao cần quy ước này? Vì rất nhiều framework (Jackson khi parse JSON, JPA khi tạo Entity, JSP...) tạo object **bằng reflection**: chúng gọi constructor rỗng để tạo object trước, rồi gọi setter để đổ dữ liệu vào. Nếu class không có constructor rỗng hoặc không có setter, framework không làm việc được.

Đặc điểm đầy đủ:

- Có constructor không tham số (no-args constructor).
- Field để `private` (che giấu dữ liệu — encapsulation).
- Đọc/ghi field qua getter/setter.
- Thường implements `Serializable` — không bắt buộc, nhưng phổ biến khi cần truyền object qua mạng hoặc lưu xuống file/cache.

Các class dữ liệu như Entity, DTO, Model đều viết theo chuẩn JavaBean.

### 2. Spring Bean là gì? Khác gì JavaBean?

**Spring Bean là object do Spring IoC Container tạo ra và quản lý** — Spring tạo object, quản lý vòng đời (lifecycle), và tự động inject vào chỗ cần dùng.

Hai khái niệm này trùng chữ "bean" nhưng khác hẳn nhau:

| | JavaBean | Spring Bean |
|---|---|---|
| Bản chất | Quy ước **cách viết** một class | Object được **container quản lý** |
| Ai tạo ra | Bạn tự `new`, hoặc framework tạo qua reflection | Spring tạo và giữ trong container |
| Ví dụ | `User`, `Order`, `Product` (Entity/DTO) | `UserService`, `OrderRepository`, `UserController` |

Cách nhận biết trong dự án: class gắn `@Component`, `@Service`, `@Repository`, `@Controller` hoặc khai báo qua `@Bean` → Spring Bean. Class chỉ chứa dữ liệu → JavaBean (và một object có thể vừa là JavaBean vừa được khai báo làm Spring Bean).

### 3. StringBuilder là gì?

**StringBuilder dùng để nối chuỗi nhiều lần mà không sinh ra hàng loạt object mới — nó sửa trên cùng một vùng nhớ. Lưu ý: StringBuilder KHÔNG thread-safe, chỉ nên dùng trong phạm vi một thread.**

Muốn hiểu StringBuilder phải hiểu điểm yếu của `String` trước: **String là immutable** (bất biến) — một khi tạo ra thì không sửa được nữa. Nên đoạn code này:

```java
String s = "";
for (int i = 0; i < 10000; i++) {
    s = s + i;   // mỗi vòng lặp tạo MỘT OBJECT STRING MỚI
}
```

tạo ra ~10.000 object String rác, vừa tốn bộ nhớ vừa bắt Garbage Collector dọn dẹp liên tục.

StringBuilder giải quyết bằng cách giữ một mảng ký tự bên trong và ghi nối tiếp vào đó:

```java
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(" Java");
sb.append(" Spring");
System.out.println(sb.toString());  // Hello Java Spring
```

Vì các method của nó không có `synchronized`, hai thread cùng `append` một StringBuilder có thể làm hỏng dữ liệu. Trong thực tế điều này hiếm khi thành vấn đề, vì StringBuilder thường là **biến cục bộ trong method** — mỗi thread có bản riêng.

### 4. StringBuffer là gì?

**StringBuffer giống StringBuilder về công dụng, khác ở chỗ các method có `synchronized` → thread-safe, đổi lại chậm hơn.**

`synchronized` nghĩa là tại một thời điểm chỉ một thread được gọi method đó; thread khác phải đợi. An toàn khi nhiều thread cùng ghi vào một buffer, nhưng phải trả giá bằng tốc độ.

Chọn cái nào: hầu như luôn dùng **StringBuilder**, vì nối chuỗi thường diễn ra trong một thread. Chỉ cân nhắc StringBuffer khi thật sự có nhiều thread cùng ghi chung một buffer — trường hợp này rất hiếm trong code hiện đại.

### 5. Builder Pattern là gì?

**Builder Pattern là cách tạo object có nhiều thuộc tính sao cho dễ đọc, dễ hiểu — thay vì constructor dài dằng dặc phải nhớ đúng thứ tự tham số.**

So sánh cho dễ thấy. Không có Builder:

```java
// 6 tham số — đọc code không biết "true" là gì, thứ tự dễ nhầm
User user = new User("Nam", "nam@mail.com", 25, "HCM", true, null);
```

Có Builder (với Lombok chỉ cần gắn `@Builder` lên class):

```java
User user = User.builder()
        .name("Nam")
        .email("nam@mail.com")
        .age(25)
        .city("HCM")
        .active(true)
        .build();
```

Mỗi dòng tự mô tả nghĩa của nó, muốn bỏ field nào thì bỏ, không cần nhớ thứ tự. Thường dùng nhất cho các class DTO.

### 6. HashMap hoạt động như thế nào?

**HashMap lưu dữ liệu theo cặp Key → Value. Khi `put`, nó tính `hashCode()` của key để suy ra vị trí ô lưu trữ (bucket); khi `get`, nó tính lại hash để nhảy thẳng tới bucket đó thay vì duyệt tuần tự.**

Luồng của `map.put("Apple", 100)`:

```text
Key "Apple"
  ↓ hashCode()        → ví dụ ra 12345
  ↓ hash % số bucket  → ví dụ ra bucket số 5
  ↓ lưu cặp (Apple, 100) vào bucket 5
```

(Thực tế Java dùng phép `(n-1) & hash` thay cho chia lấy dư, nhưng ý nghĩa tương đương.)

**Collision (trùng bucket / va chạm băm)** xảy ra khi 2 key khác nhau nhưng tính ra cùng một bucket. Khi đó HashMap xếp cả hai vào chung bucket đó dưới dạng danh sách liên kết, và dùng `equals()` để phân biệt đúng key khi lấy ra. Điểm cộng khi phỏng vấn: từ Java 8, nếu một bucket chứa quá nhiều phần tử (ngưỡng 8), danh sách liên kết được chuyển thành cây đỏ-đen (red-black tree) để tìm kiếm nhanh hơn.

### 7. ThreadPool là gì? Vì sao cần?

**ThreadPool là "bể" chứa sẵn một số thread để tái sử dụng, thay vì mỗi việc đến lại tạo một thread mới.**

Vì sao cần: tạo và hủy thread rất tốn kém (cấp phát bộ nhớ stack, hệ điều hành phải quản lý). Nếu cứ mỗi request tạo một thread mới không giới hạn, 100 request đồng thời sinh ra 100 thread — đủ lớn thì cạn RAM, CPU tốn thời gian chuyển đổi qua lại giữa các thread (context switch) nhiều hơn là làm việc thật.

Với ThreadPool đặt kích thước 5: 5 request được xử lý ngay bằng 5 thread trong pool, 95 request còn lại xếp hàng trong queue chờ tới lượt. Hệ thống chịu tải ổn định, không bị "nổ" vì quá nhiều thread.

(Liên hệ thực tế: Tomcat trong Spring Boot cũng dùng thread pool cho request, mặc định tối đa 200 thread.)

### 8. CompletableFuture là gì?

**CompletableFuture là công cụ xử lý bất đồng bộ (async) trong Java: cho phép chạy nhiều task song song rồi đợi kết quả một lượt, thay vì đợi từng task xong mới chạy task tiếp theo.**

Ví dụ cần gọi 3 nguồn dữ liệu: lấy thông tin user mất 2s, product mất 3s, payment mất 1s.

- Chạy **tuần tự** (đồng bộ): 2 + 3 + 1 = **6 giây**.
- Chạy **song song** (bất đồng bộ): cả 3 chạy cùng lúc, tổng thời gian = task lâu nhất = **3 giây**.

```java
CompletableFuture<User> userF     = CompletableFuture.supplyAsync(() -> getUser());
CompletableFuture<Product> prodF  = CompletableFuture.supplyAsync(() -> getProduct());
CompletableFuture<Payment> payF   = CompletableFuture.supplyAsync(() -> getPayment());

CompletableFuture.allOf(userF, prodF, payF).join(); // đợi cả 3 xong một lượt
```

Hai method hay được hỏi: `supplyAsync()` chạy task **có trả kết quả**, `runAsync()` chạy task **không trả kết quả** (chỉ thực thi, ví dụ ghi log).

---

## Phần 2 — Spring & tầng dữ liệu

### 9. Cấu trúc source theo MVC

**MVC (Model - View - Controller) là mô hình kiến trúc tách biệt ba phần: dữ liệu (Model), giao diện (View), và điều khiển luồng xử lý (Controller).**

Cấu trúc package phổ biến của một project Spring Boot:

```text
controller/   → nhận request, trả response (không chứa logic nghiệp vụ)
service/      → chứa logic nghiệp vụ (business logic)
repository/   → tầng truy cập dữ liệu (còn gọi là DAO)
entity/       → class ánh xạ bảng trong database
dto/          → object trung chuyển dữ liệu giữa client và server
utils/        → hàm tiện ích dùng chung
```

Phân biệt hai loại object dữ liệu hay bị lẫn: **Entity** ánh xạ 1-1 với bảng trong DB; **DTO** là object "đóng gói" dữ liệu để trả về client hoặc nhận từ client. Tách riêng để không lộ cấu trúc DB ra ngoài API, và để API đổi format thoải mái mà không đụng vào DB.

### 10. DI (Dependency Injection) là gì?

**DI là kỹ thuật để một object NHẬN các object nó phụ thuộc từ bên ngoài, thay vì tự tạo bằng `new`.**

Không dùng DI — class tự tạo thứ nó cần:

```java
public class UserService {
    private UserDAO dao = new UserDAO(); // tự tạo → dính chặt vào UserDAO

    public void register() {
        dao.save();
    }
}
```

Có DI — đối tượng được truyền vào từ bên ngoài:

```java
public class UserService {
    private UserDAO dao;

    public UserService(UserDAO dao) {  // ai dùng UserService sẽ đưa dao vào
        this.dao = dao;
    }

    public void register() {
        dao.save();
    }
}
```

Lợi ích: code không dính chặt vào một implementation cụ thể (loose coupling), dễ thay thế, và đặc biệt **dễ viết unit test** — khi test chỉ cần truyền một UserDAO giả (mock) vào.

Ba kiểu DI trong Spring:

1. **Constructor Injection** — truyền qua constructor. Đây là cách **được khuyến nghị**: dependency có thể khai báo `final`, không bao giờ null, dễ test. Nếu một service phải inject quá nhiều thứ và constructor "nhìn rối" — đó thực ra là tín hiệu tốt: nó cảnh báo class đang ôm quá nhiều việc, nên tách nhỏ (nguyên tắc Single Responsibility).
2. **Setter Injection** — truyền qua setter, phù hợp với dependency không bắt buộc (optional).
3. **Field Injection** (`@Autowired` thẳng lên field) — viết ngắn nhất nhưng bị khuyến cáo tránh: không mock được khi test nếu thiếu Spring context, che giấu dependency, và các công cụ phân tích code (Sonar, security scan) sẽ cảnh báo.

### 11. JPA là gì?

**JPA (Java Persistence API) là một CHUẨN (specification) của Java để làm việc với database theo hướng ORM — thao tác với object Java thay vì viết SQL và xử lý ResultSet thủ công.**

Điểm quan trọng nhất: **JPA không phải framework, nó chỉ là bộ interface/quy định**. Hibernate, EclipseLink là những framework *hiện thực* (implementation) chuẩn JPA đó. Tương tự như "JPA là bản thiết kế, Hibernate là ngôi nhà xây theo bản thiết kế".

Vị trí của JPA trong ứng dụng:

```text
Application
    ↓
Service
    ↓
Repository (JPA)
    ↓
Hibernate (JPA Implementation)
    ↓
JDBC
    ↓
MySQL / SQL Server / PostgreSQL / Oracle
```

JPA tự chuyển đổi thao tác object thành SQL:

```java
User user = new User();
user.setName("Nam");
repository.save(user);
```

thành:

```sql
INSERT INTO users(name) VALUES ('Nam');
```

Bạn không phải tự viết câu SQL này. Với Spring Data JPA, chỉ cần tạo interface extends `JpaRepository` là có sẵn đầy đủ CRUD (xem mục 16).

Ưu điểm: giảm số SQL phải viết; thao tác bằng object thay vì ResultSet; hỗ trợ quan hệ giữa các bảng (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`); dễ bảo trì; tích hợp tốt với Spring Boot. Với truy vấn phức tạp hoặc cần tối ưu hiệu năng cao, các team thường kết hợp JPA với SQL thuần (native query) hoặc MyBatis.

### 12. JDBC là gì?

**JDBC là API gốc, thấp nhất của Java để nói chuyện với database. Không có JDBC thì Java không biết cách kết nối MySQL.**

Luồng hoạt động: mở `Connection` → tạo `PreparedStatement` (câu SQL) → Driver của DB (ví dụ MySQL Driver) gửi lệnh xuống Database → nhận về `ResultSet` → tự tay đọc từng dòng từng cột gán vào object Java.

Nhược điểm: code rất dài và lặp — mỗi thao tác đều phải mở connection, viết SQL, map ResultSet, đóng connection, xử lý exception. Đó chính là lý do ORM như Hibernate ra đời.

### 13. ORM là gì?

**ORM (Object Relational Mapping) là kỹ thuật ánh xạ giữa thế giới object của Java và thế giới bảng của database.**

Cụ thể: một **class** ↔ một **bảng**; một **field** ↔ một **cột**; một **object** ↔ một **dòng dữ liệu**. Nhờ ánh xạ này, thao tác `repository.save(user)` được dịch tự động thành `INSERT`, không phải viết tay.

### 14. Hibernate là gì?

**Hibernate là ORM framework phổ biến nhất của Java — nó hiện thực chuẩn JPA.**

Lưu ý hay bị hỏi xoáy: Hibernate không thay thế JDBC. Hibernate sinh ra câu SQL, rồi **cuối cùng vẫn gọi JDBC** để gửi SQL đó xuống database. JDBC luôn là tầng thấp nhất trực tiếp giao tiếp với DB.

### 15. Entity là gì?

**Entity là class Java ánh xạ với một bảng trong database: một object Entity = một dòng (record) trong bảng.**

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;        // ↔ cột id

    private String name;    // ↔ cột name
}
```

`@Entity` báo cho JPA biết class này cần được quản lý và ánh xạ xuống DB; `@Id` đánh dấu khóa chính. Khi `save(user)`, JPA lấy giá trị các field của object ghi thành một dòng trong bảng `users`.

### 16. Repository là gì?

**Repository là tầng truy cập dữ liệu — lớp trung gian giúp code nghiệp vụ gọi xuống database mà không cần biết chi tiết bên dưới.**

Trong Spring Data JPA chỉ cần khai báo:

```java
public interface UserRepository extends JpaRepository<User, Long> {
}
```

là có sẵn rất nhiều method: `save()`, `findById()`, `findAll()`, `delete()`... không phải viết dòng code cài đặt nào.

Khi gọi `repository.save(user)`, chuỗi thực thi bên dưới là:

```text
Repository → EntityManager → Hibernate → JDBC → Database
```

### 17. Spring Data JPA có phải Hibernate không?

**Không.** Hai thứ nằm ở hai tầng khác nhau:

- **Spring Data JPA** là tầng Repository của Spring, giúp giảm code lặp (tự sinh query từ tên method, có sẵn CRUD).
- **Hibernate** là ORM engine thực hiện việc ánh xạ Object ↔ Database và sinh SQL.

Spring Data JPA đứng trên, gọi xuống Hibernate (qua chuẩn JPA) để làm việc thật.

### 18. Hibernate có phải JDBC không?

**Không.** Hibernate là tầng ORM đứng trên JDBC. Hibernate sinh SQL rồi dùng JDBC gửi SQL đó đến database. Có thể nói: Hibernate giúp bạn *không phải viết* code JDBC, chứ không *loại bỏ* JDBC.

---

## Phần 3 — Bảo mật & xử lý đồng thời

### 19. JWT (JSON Web Token) là gì?

**JWT là chuẩn token dùng để xác thực (Authentication) và truyền thông tin an toàn giữa Client và Server. Thay vì server phải lưu phiên đăng nhập (Session), thông tin người dùng nằm ngay trong token mà client giữ và gửi kèm mỗi request.**

Luồng hoạt động:

```text
User đăng nhập (username + password)
  → Server kiểm tra tài khoản
  → Server tạo JWT, trả về Client
  → Client lưu JWT (localStorage / cookie)
  → Mỗi request sau gắn header: Authorization: Bearer <JWT>
  → Server xác thực JWT → cho phép truy cập
```

Cấu trúc JWT gồm 3 phần, ngăn cách bằng dấu chấm `xxxxx.yyyyy.zzzzz`:

- **Header** (x): thuật toán ký (ví dụ HS256).
- **Payload** (y): thông tin user (username, role, thời gian hết hạn `exp`...).
- **Signature** (z): chữ ký, được tính từ `Header + Payload + Secret Key`. Secret key cấu hình trong file properties hoặc biến môi trường, chỉ server biết.

Cách server xác thực: khi client gửi JWT lên, server tách token, **tính lại signature** từ header + payload + secret key của mình rồi so sánh với signature trong token. Khác nhau → token đã bị sửa → trả `401`.

Hai ý cần nói chính xác khi phỏng vấn:

- Không có secret key thì hacker **không thể giả mạo hoặc sửa** token (sửa payload là signature sai ngay). Nhưng nếu hacker **đánh cắp được token thật** (lộ qua XSS, mạng không mã hóa...) thì vẫn dùng được cho đến khi token hết hạn — vì vậy cần đặt `exp` ngắn, chạy HTTPS, kết hợp refresh token.
- Payload chỉ được **encode Base64, không phải mã hóa** — ai cũng decode đọc được. Tuyệt đối không nhét password hay dữ liệu nhạy cảm vào payload.

### 20. Login với JWT diễn ra như thế nào?

**Sau khi login thành công và client có token, mỗi request đi qua một JWT Filter đứng trước Controller; filter xác thực token rồi mới cho request đi tiếp.**

Các bước JWT Filter thực hiện:

```text
Lấy token (từ header Authorization)
  ↓
Verify Signature (tính lại chữ ký, so sánh)
  ↓
Kiểm tra exp (token còn hạn không?)
  ↓
Lấy username từ payload
  ↓
Đưa thông tin user vào SecurityContext
  ↓
Cho phép vào Controller
```

Bất kỳ bước nào fail (chữ ký sai, token hết hạn) → trả `401 Unauthorized`, request không bao giờ chạm tới Controller.

### 21. Logout hoạt động như thế nào?

**Với Session: server lưu sessionID lúc login, logout thì server xóa sessionID — xong. Với JWT: server không lưu token nên không có gì để xóa; client tự xóa token khỏi localStorage/cookie.**

Nhưng client xóa token chỉ là "quên" nó — nếu token đã bị lộ trước đó thì vẫn còn hiệu lực đến khi hết hạn. Cách xử lý phổ biến khi cần logout "thật": khi user logout, đưa token vào **blacklist trong Redis** (giữ đến lúc token hết hạn tự nhiên). Mỗi request đến, server check blacklist trước — nếu token nằm trong đó thì trả `401` dù chữ ký vẫn hợp lệ.

### 22. Spring Security là gì?

**Spring Security là framework bảo mật của Spring, xử lý xác thực, phân quyền và bảo vệ ứng dụng khỏi các kiểu tấn công phổ biến.**

Chức năng chính: Authentication (xác thực — bạn là ai), Authorization (phân quyền — bạn được làm gì), bảo vệ API, mã hóa password (BCrypt), chống các tấn công CSRF / Session Fixation / Clickjacking, hỗ trợ OAuth2, JWT, SSO.

Cách hình dung: nó là **lớp bảo vệ đứng chắn trước Controller** — mọi request phải qua nó trước:

```text
Client → Filter Chain → JWT Filter → Authentication → Authorization → Controller
```

Điều cốt lõi cần nhớ: Spring Security hoạt động dựa trên **Filter** (Security Filter Chain) — một chuỗi các bộ lọc, mỗi filter đảm nhận một việc. **SecurityContext** là nơi Spring lưu thông tin người dùng đang đăng nhập của request hiện tại; trong code lấy ra bằng `SecurityContextHolder`.

### 23. Concurrent Request là gì? Xử lý thế nào?

**Concurrent Request là tình huống nhiều request cùng đọc/ghi một dữ liệu tại cùng thời điểm. Trong Spring Boot, mỗi request được một thread riêng xử lý nên chúng chạy đồng thời thật sự — nếu không kiểm soát, dữ liệu có thể sai (ví dụ 2 người cùng mua sản phẩm cuối cùng trong kho).**

Các cách xử lý, từ đơn giản đến thực tế:

1. **`synchronized`** — chỉ cho một thread vào đoạn code, còn lại đợi. Nghe ổn nhưng **không khả thi trong thực tế**: `synchronized` chỉ có tác dụng trong một JVM, mà production thường chạy nhiều instance/server song song — thread ở server A không hề biết khóa ở server B.
2. **Pessimistic Lock (khóa bi quan) + Transaction** — DB khóa bản ghi ngay khi đọc (`SELECT ... FOR UPDATE`), request khác phải đợi đến khi transaction xong mới đọc được. An toàn tuyệt đối nhưng giảm throughput vì các request phải xếp hàng.
3. **Optimistic Lock (khóa lạc quan) — `@Version` của JPA** — thêm cột version vào bảng. Ai cũng đọc thoải mái; khi update, JPA kiểm tra version còn khớp không (`UPDATE ... WHERE id=? AND version=?`). Nếu đã có người update trước → version lệch → ném `OptimisticLockException` → mình bắt exception và retry. Phù hợp khi xung đột ít xảy ra.
4. **Đưa vào Message Queue xử lý lần lượt (FIFO)** — `request → queue → consumer → database`, biến xử lý đồng thời thành tuần tự. Với Kafka còn có khái niệm **partition**: ví dụ topic có 3 partition thì 3 consumer đọc song song, mỗi consumer một partition — vừa tuần tự trong từng partition, vừa scale được.

Hai câu hỏi kèm theo trong bản gốc:

**Hỏi: 2 request cùng update 1 bảng cùng lúc, làm sao đảm bảo toàn vẹn?**
Trả lời: dùng Optimistic Lock với `@Version` của JPA (cơ chế như mục 3 ở trên).

**Hỏi: method không gắn `@Transactional`, gọi API lấy dữ liệu trước rồi mới insert/update — có lỗi không?**
Trả lời: không lỗi, insert vẫn chạy — vì `save()`/`delete()` của Spring Data JPA **đã có sẵn `@Transactional`** bên trong (khai báo trong `SimpleJpaRepository`), nên mỗi lệnh save tự mở transaction riêng của nó. Nhưng nếu tự viết query ghi dữ liệu (`@Modifying @Query` hoặc dùng `EntityManager` trực tiếp) mà không có transaction thì sẽ ném **`TransactionRequiredException`**. Ý thứ hai đáng nói thêm: vì không có `@Transactional` bao ngoài, nhiều lệnh save liên tiếp là nhiều transaction rời — lệnh sau lỗi thì lệnh trước **không rollback** → dữ liệu nửa vời. Muốn "cùng sống cùng chết" phải gắn `@Transactional` bao cả method.

### 24. Cache là gì?

**Cache là nơi lưu dữ liệu tạm thời (thường trên RAM như Redis) để không phải truy cập database lặp đi lặp lại — đọc cache nhanh hơn đọc DB rất nhiều.**

Ví dụ: 1000 request cùng hỏi thông tin một sản phẩm. Request đầu tiên: cache chưa có (cache miss) → xuống DB lấy → lưu vào cache. 999 request sau: lấy thẳng từ cache (cache hit), không đụng DB nữa. DB được giảm tải, response nhanh hơn hẳn.

Điểm cộng khi phỏng vấn: nhớ nói về **invalidation** — khi dữ liệu gốc thay đổi (admin sửa giá sản phẩm) phải xóa/cập nhật cache tương ứng, và đặt **TTL** (thời gian sống) để cache không giữ dữ liệu cũ mãi.

---

## Phần 4 — Container & DevOps

### 25. Containerize là gì?

**Containerize là đóng gói ứng dụng cùng toàn bộ môi trường chạy của nó (Application + JDK + Library + OS dependency) thành một image.**

Lợi ích cốt lõi: chấm dứt câu "trên máy em chạy được mà" — vì image mang theo đúng môi trường của nó, chạy ở máy dev, server test hay production đều cho kết quả như nhau.

### 26. Docker là gì?

**Docker là công cụ phổ biến nhất để build image và chạy container.**

### 27. Image và Container khác nhau thế nào?

**Image giống như file cài đặt (bản mẫu, bất biến); Container giống như chương trình đang chạy được tạo ra từ file đó.**

Một Image có thể tạo ra nhiều Container — giống một file cài game có thể cài lên nhiều máy chạy độc lập nhau.

### 28. Tại sao cần Kubernetes (K8s)?

**Kubernetes là nền tảng quản lý container ở quy mô lớn: tự động deploy, scale, chia tải, khởi động lại container chết.**

Bài toán dẫn vào: giả sử Product Service nhận 100.000 request/phút — một container không chịu nổi, phải chạy 5 container. Vậy ai sẽ chia request giữa 5 container? Ai restart container bị chết? Ai tăng/giảm số container theo tải? **Docker không làm được những việc đó** — Docker chỉ chạy container. Đó là việc của Kubernetes:

- **Deploy** — triển khai phiên bản mới.
- **Scale** — tăng/giảm số container theo tải.
- **Load Balance** — chia request đều giữa các container.
- **Restart / Self Healing** — container chết thì tự dựng lại.
- **Rolling Update** — cập nhật dần từng phần, không downtime.

Các khái niệm cơ bản: **Pod** là đơn vị nhỏ nhất trong Kubernetes (1 pod = 1 hoặc nhiều container chạy chung); **Deployment** quản lý Pod — chịu trách nhiệm scale, rolling update, self-healing.

Ví dụ thực tế: Deployment `eportal-uat` gồm các pod `camunda`, `zeebe`, `operate`, `tasklist`, `ppl-api`.

### 29. OpenShift (OCP) là gì?

**OpenShift = Kubernetes + các tính năng doanh nghiệp, do RedHat phát triển.**

Những thứ OpenShift bổ sung trên nền K8s: CI/CD tích hợp sẵn, giao diện web quản trị, quản lý người dùng và phân quyền, monitoring, logging... Dùng K8s "chay" phải tự ghép các mảnh này; OpenShift gói sẵn cho doanh nghiệp.

### 30. Logging để làm gì?

**Log không chỉ để debug — nó còn dùng để theo dõi request, điều tra lỗi trên production, audit, monitoring và truy vết.**

Trong Java dùng Logger qua facade SLF4J; với Lombok chỉ cần gắn annotation **`@Slf4j`** lên class là có sẵn biến `log`:

```java
@Slf4j
@Service
public class OrderService {
    public void create() {
        log.info("Tạo order mới");
        log.error("Lỗi khi lưu order", e);
    }
}
```

Vì sao dùng Logger thay cho `System.out.println`: Logger cấu hình được đầu ra — ghi ra file, console, hoặc đẩy lên hệ thống tập trung như ELK, Splunk, Grafana Loki — và lọc được theo mức độ.

Các log level theo thứ tự tăng dần độ nghiêm trọng: `TRACE < DEBUG < INFO < WARN < ERROR`. Production thường đặt mức INFO — các log TRACE/DEBUG bị bỏ qua để đỡ rác và đỡ tốn I/O.

### 31. BPMN là gì?

**BPMN (Business Process Model and Notation) là chuẩn mô tả quy trình nghiệp vụ bằng sơ đồ** — các bước, điều kiện rẽ nhánh, ai làm bước nào... vẽ thành diagram mà cả dev lẫn nghiệp vụ đều đọc được.

**Camunda** là Workflow Engine: nó đọc file BPMN và thực thi quy trình đó thật (gọi service, giao task cho người dùng, theo dõi trạng thái từng bước).

---

## Phần 5 — OOP nâng cao

### 32. Abstract class và Interface khác nhau thế nào?

**Abstract class trả lời "LÀ cái gì" (Dog *là* Animal); Interface trả lời "CÓ THỂ LÀM gì" (Bird *có thể* Fly).**

**Abstract class** dùng khi các class có quan hệ cha–con thật sự và cần chia sẻ trạng thái/logic chung:

- Có thể chứa field, constructor, và method đã cài đặt sẵn.
- Chỉ được `extends` một abstract class (Java đơn kế thừa).
- Không thể `new` trực tiếp — chỉ class con cụ thể mới tạo được object.

**Interface** dùng để mô tả hành vi/khả năng mà nhiều class không liên quan nhau cùng có:

- Một class `implements` được nhiều interface.
- Giúp loose coupling — code phụ thuộc vào hành vi, không phụ thuộc class cụ thể.
- Từ Java 8, interface cũng có được `default method` (method có body) — điểm cộng khi phỏng vấn.

Vì sao interface mạnh trong thiết kế: con Vịt vừa bay vừa bơi — cho `Duck implements Flyable, Swimmable` là xong; còn dùng kế thừa thì kẹt ngay vì chỉ được một class cha.

### 33. `this` là gì?

**`this` đại diện cho object hiện tại (current object).**

Ba cách dùng: gọi constructor khác cùng class (`this(...)`); truy cập field của object hiện tại — thường để phân biệt với tham số trùng tên (`this.name = name`); gọi method của chính object đó.

### 34. `super` là gì?

**`super` đại diện cho class cha (parent class).**

Ba cách dùng tương ứng: gọi constructor của cha (`super(...)` — phải là dòng đầu tiên trong constructor con); truy cập field của cha; gọi method của cha — hay dùng khi đã override nhưng vẫn muốn tận dụng logic gốc (`super.doSomething()`).

### 35. `final` là gì?

**`final` là từ khóa "khóa lại, không cho thay đổi", áp dụng ở 3 chỗ:**

- **final variable** — không gán lại được sau khi đã gán. Lưu ý tinh tế: với biến object, `final` chỉ khóa việc *gán lại biến*, chứ **không khóa nội dung object** — `final List<String> list` vẫn `list.add("x")` được, chỉ không `list = new ArrayList<>()` được nữa.
- **final method** — class con không override được.
- **final class** — không class nào extends được (ví dụ chính là `String`).

### 36. `static` là gì?

**`static` làm cho biến/method thuộc về CLASS chứ không thuộc về từng object — mọi object dùng chung một bản duy nhất trong bộ nhớ.**

Dùng khi cần thứ gì đó mang tính chung/toàn cục: hằng số, hàm tiện ích không phụ thuộc trạng thái object:

```java
public static final String LANGUAGE = "VN";   // hằng số dùng chung
Math.max(a, b);                               // method static — gọi thẳng qua class, không cần new
```

Hai ý nói thêm khi phỏng vấn: static method **không override được** (chỉ có method hiding — class con khai báo trùng thì che đi chứ không phải đa hình); và biến static là **trạng thái dùng chung** nên nhiều thread cùng ghi vào sẽ gặp vấn đề đồng bộ.

### 37. SOLID là gì?

**SOLID là 5 nguyên tắc thiết kế hướng đối tượng giúp code dễ bảo trì, dễ mở rộng.**

1. **S — Single Responsibility**: một class chỉ nên giữ một trách nhiệm duy nhất. (UserService không nên vừa xử lý user vừa gửi email vừa xuất báo cáo.)
2. **O — Open/Closed**: mở để mở rộng, đóng để sửa đổi — thêm tính năng mới bằng cách thêm class/implementation mới, không sửa code cũ đang chạy ổn.
3. **L — Liskov Substitution**: object của class con phải thay thế được object của class cha mà chương trình vẫn đúng. (Nếu `Penguin extends Bird` mà `fly()` ném exception thì đã vi phạm — chỗ nào dùng Bird sẽ vỡ khi gặp Penguin.)
4. **I — Interface Segregation**: thay vì một interface to đùng nhiều method, chia thành nhiều interface nhỏ chuyên biệt — class chỉ implement đúng thứ nó cần.
5. **D — Dependency Inversion**: module cấp cao không phụ thuộc module cấp thấp; cả hai phụ thuộc vào abstraction (interface). Đây chính là nền tảng lý thuyết của Dependency Injection (mục 10).

---

## Phần 6 — Message Queue

### 38. Kafka là gì?

**Kafka là hệ thống truyền tin (Message Broker / Event Streaming) giúp các service giao tiếp với nhau mà không cần gọi trực tiếp.**

4 thành phần chính:

- **Producer** — service gửi message.
- **Topic** — "kênh" chứa message: producer gửi vào, consumer đọc ra.
- **Broker** — server Kafka (thường chạy nhiều broker thành cluster).
- **Consumer** — service đọc message từ topic.

Flow tổng quát: `Client → Service 1 → Producer → Broker → Topic → Consumer → Service 2`.

**Kafka lưu message ở đâu?** Kafka **không** gửi xong rồi xóa — nó ghi message xuống **disk** và giữ theo thời gian cấu hình (retention). Consumer đọc xong, message vẫn còn đó; consumer khác (hoặc chính nó) có thể đọc lại.

**Partition** là phân vùng của topic — 1 topic có nhiều partition (tùy config). Message gửi vào topic được phân bố vào các partition. Vì sao cần: để **xử lý song song** — 10 partition thì 10 consumer cùng đọc song song, mỗi consumer một partition. Đánh đổi: Kafka **chỉ đảm bảo thứ tự message trong từng partition**, không đảm bảo thứ tự toàn topic.

**Offset** là số nguyên tuần tự (bắt đầu từ 0) đóng vai trò con trỏ vị trí của message trong một partition. Tác dụng:

- Xác định vị trí đọc: consumer biết mình đã đọc đến đâu.
- Không bỏ sót dữ liệu: consumer chết đột ngột, khởi động lại sẽ đọc tiếp từ offset cuối cùng đã commit.
- Phục hồi sự cố: chủ động reset offset để đọc lại dữ liệu cũ khi cần xử lý lại.

### 39. ActiveMQ là gì? Khác Kafka thế nào?

**ActiveMQ cũng là Message Broker nhưng theo mô hình hàng đợi truyền thống (queue, FIFO): message giao cho MỘT consumer xử lý, xử lý xong thì XÓA khỏi queue — thích hợp phân phát từng công việc (task).**

4 thành phần: **Producer**, **Queue** (điểm khác Kafka — thay cho topic+partition), **Broker** (chính là ActiveMQ Server: nhận, lưu, định tuyến, retry, quản lý ACK), **Consumer**.

Flow: `Producer → Queue → Broker → Consumer`.

**ACK (Acknowledgment)** là tín hiệu consumer gửi lại broker báo "tôi đã nhận và xử lý xong message này". Cơ chế: consumer lấy message từ queue → xử lý xong → gửi ACK → broker **xóa message** để consumer đọc message tiếp theo. (Kafka thì không xóa — đây là khác biệt bản chất.) Message lỗi retry mãi không được thì broker chuyển vào **DLQ (Dead Letter Queue)** để xử lý riêng, không làm nghẽn queue chính.

Hai câu hỏi tình huống hay gặp:

**Hỏi: Consumer chết sau khi nhận message nhưng chưa ACK thì sao?**
Broker thấy message chưa có ACK nghĩa là chưa xử lý xong → **không xóa message**. Message được đưa trở lại queue (redelivery) hoặc giao cho consumer khác trong cùng queue khi có consumer sẵn sàng. Không mất message.

**Hỏi: Consumer nhận message, update DB thành công, nhưng gửi ACK bị lỗi thì sao?**
Broker không nhận được ACK nên sẽ **gửi lại message** → consumer nhận trùng. Xử lý bằng **idempotency**: mỗi message mang một `requestId`; consumer kiểm tra requestId đã xử lý chưa — nếu đã xử lý (dup) thì bỏ qua bước update DB, chỉ trả ACK thành công về broker.

---

## Phần 7 — JVM, bộ nhớ & database

### 40. JDK, JRE, JVM khác nhau thế nào?

**JVM chạy chương trình Java; JRE = JVM + thư viện, đủ để CHẠY ứng dụng; JDK = JRE + công cụ dev (javac, debugger), đủ để PHÁT TRIỂN ứng dụng.**

```text
JDK
 ├── JRE
 │    ├── JVM            ← máy ảo thực thi bytecode
 │    └── Java Library   ← java.lang, java.util, ...
 └── javac, debugger, công cụ build
```

Cách nhớ nhanh: máy người dùng chỉ cần JRE; máy dev cần JDK.

### 41. Heap và Stack khác nhau thế nào?

**Heap là nơi lưu OBJECT; Stack là nơi lưu biến cục bộ, lời gọi method và biến tham chiếu (reference).**

```java
public void test() {
    int a = 10;              // a nằm trên Stack
    User u = new User();     // u (reference) nằm trên Stack
                             // object User thật nằm trên Heap, u trỏ tới nó
}
```

Mỗi thread có Stack riêng (nên biến cục bộ luôn an toàn giữa các thread); Heap thì dùng chung cho cả ứng dụng và do Garbage Collector dọn dẹp.

Hai lỗi tương ứng khi đầy bộ nhớ: Heap đầy → **`OutOfMemoryError`** (thường do giữ quá nhiều object, memory leak); Stack đầy → **`StackOverflowError`** (thường do đệ quy không có điểm dừng — mỗi lần gọi method chồng thêm một frame lên stack).

### 42. Index trong database là gì?

**Index là cấu trúc dữ liệu (thường là B-tree) giúp database tìm dữ liệu nhanh mà không phải quét toàn bộ bảng (full table scan) — cột có index thì DB nhảy thẳng tới vị trí dữ liệu, như tra mục lục sách thay vì lật từng trang.**

Nên đánh index cho: cột hay xuất hiện trong `WHERE`, `JOIN`, `ORDER BY`, `GROUP BY`, cột cần `UNIQUE`.

Không nên đánh index cho: cột ít giá trị khác nhau (như giới tính — index không giúp lọc được bao nhiêu), bảng nhỏ ít dòng (quét thẳng còn nhanh hơn), cột bị update liên tục (mỗi lần update dữ liệu là phải update cả index → chậm ghi).

**Câu hỏi bẫy: đánh composite index 3 cột theo thứ tự (B, C, D), nhưng câu query lại WHERE theo thứ tự (C, B, D) — chuyện gì xảy ra?**

Trả lời đúng: **index vẫn được dùng bình thường, query vẫn nhanh.** SQL là ngôn ngữ khai báo — optimizer của DB tự sắp xếp lại các điều kiện trong WHERE cho khớp với index, nên *thứ tự viết trong câu WHERE không quan trọng*, miễn là đủ các cột và là điều kiện bằng (`=`).

Quy tắc thật sự cần nhớ là **leftmost prefix**: index (B, C, D) chỉ dùng được khi query có mặt cột **đầu tiên** của index. Nghĩa là:

- `WHERE B = ?` → dùng được index.
- `WHERE B = ? AND C = ?` → dùng được.
- `WHERE C = ? AND B = ? AND D = ?` → dùng được (đủ cả 3 cột, optimizer tự đảo).
- `WHERE C = ? AND D = ?` → **KHÔNG** dùng được index — vì thiếu B, cột đầu tiên. Đây mới là trường hợp query chậm.

Hình dung: index (B,C,D) như danh bạ sắp theo Họ → Tên đệm → Tên. Biết Họ thì tra được; chỉ biết Tên đệm và Tên mà không biết Họ thì đành lật từng trang.

### 43. Multithreading với @Async và ThreadPoolTaskExecutor

**Trong Spring, thread cho các tác vụ `@Async` được lấy từ `ThreadPoolTaskExecutor` — mỗi lần `@Async` chạy sẽ lấy một thread rảnh trong pool, dùng xong trả lại pool để tái sử dụng, không tạo mới rồi hủy — nhờ đó giảm hẳn chi phí tạo/hủy thread.**

Cấu hình pool:

```java
@Bean
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);    // số thread thường trực
    executor.setMaxPoolSize(10);    // số thread tối đa khi tải cao
    executor.initialize();
    return executor;
}
```

Cách hoạt động: bình thường pool giữ 5 thread; việc đến dồn dập thì xếp vào queue, queue đầy mới mở thêm thread cho tới tối đa 10. Method gắn `@Async` sẽ chạy trên thread của pool này thay vì thread của request.

### 44. Collection Framework gồm những gì?

**Java Collection chia thành 3 nhánh chính: List (có thứ tự, cho trùng), Set (không trùng), Queue (hàng đợi).**

```text
Collection
├── List
│    ├── ArrayList
│    └── LinkedList
├── Set
│    ├── HashSet
│    ├── LinkedHashSet
│    └── TreeSet
└── Queue
```

Lưu ý hay bị hỏi: **Map không nằm trong cây Collection** — nó là hệ thống phân cấp riêng (vì lưu theo cặp key-value chứ không phải từng phần tử đơn), nhưng vẫn được tính là một phần của Collection Framework.

### 45. Map hoạt động như thế nào?

**Map lưu dữ liệu theo cặp Key → Value.**

Hình dung HashMap như một **tòa chung cư**: muốn cất object vào phải biết cất vào căn nào (mỗi căn phòng là một bucket). Khi `put`, HashMap tính `hashCode()` của key, lấy `hashCode % số căn` → ra đúng số phòng cần cất. Khi `get`, tính lại y như vậy → nhảy thẳng tới đúng phòng, không phải gõ cửa từng căn.

Vai trò của cặp method quan trọng nhất:

- **`hashCode()`** — như số phòng: cho biết *nên tìm ở đâu*.
- **`equals()`** — như kiểm tra CMND/CCCD: vào đúng phòng rồi, xác nhận *đúng người* cần tìm (vì một phòng có thể có nhiều người ở ghép — chính là collision).

Đây cũng là lý do quy tắc kinh điển: override `equals()` thì **bắt buộc** override `hashCode()` — hai object bằng nhau mà hashCode khác nhau thì HashMap tìm sai phòng, không bao giờ thấy.

### 46. Set là gì? HashSet hoạt động thế nào bên trong?

**Set là collection KHÔNG chứa phần tử trùng lặp.**

Điều thú vị bên trong: **HashSet thực chất là một HashMap<E, Object>**. Khi gọi `set.add("Java")`, thực tế nó chạy `map.put("Java", PRESENT)` — trong đó `PRESENT` là một object giả dùng chung làm value. Nghĩa là: giá trị của Set chính là **Key** của HashMap (key thì không trùng → Set không trùng), còn value chỉ là vật đánh dấu.

Vì sao điều này đáng giá — bài toán kiểm tra trùng lặp: có 1 triệu email, cần check một email đã tồn tại chưa.

- Dùng `List`: `list.contains(email)` phải **duyệt tuần tự**, xấu nhất 1 triệu lần so sánh — O(n).
- Dùng `HashSet`: `set.contains(email)` chỉ cần tính hash → nhảy tới bucket → so sánh vài phần tử — O(1).

### 47. List là gì?

**List là INTERFACE (không phải class), đại diện cho danh sách có thứ tự, truy cập theo index, cho phép phần tử trùng.**

Các class implement nó:

```text
List
├── ArrayList              ← dùng nhiều nhất, nền là mảng
├── LinkedList             ← nền là danh sách liên kết
├── Vector                 ← bản cũ, có synchronized, ít dùng
└── CopyOnWriteArrayList   ← thread-safe, cho môi trường đa luồng đọc nhiều
```

Vì List là interface nên khai báo chuẩn là `List<String> list = new ArrayList<>();` — code phụ thuộc interface, sau muốn đổi implementation không phải sửa chỗ dùng.

### 48. ArrayList hoạt động như thế nào?

**ArrayList là List được xây trên MẢNG (array). Bên trong nó giữ một mảng `Object[] elementData` với sức chứa (capacity) ban đầu, ví dụ 10.**

```java
ArrayList<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");
```

Bộ nhớ bên trong lúc này:

```text
index:  0    1    2    3     4    ...  9
value:  A    B    C    null  null ...  null      (size = 3, capacity = 10)
```

`add()` thực chất chỉ làm hai việc: `elementData[size] = phầnTửMới; size++;`

Vì sao ArrayList truy cập nhanh: dữ liệu nằm trong **mảng liên tục trên bộ nhớ**, nên `get(i)` tính thẳng ra địa chỉ phần tử — O(1), không phải lần theo từng node như LinkedList.

Hai điểm nói thêm để ăn điểm:

- **Khi mảng đầy**: ArrayList tự tạo mảng mới lớn hơn (~1.5 lần) rồi copy toàn bộ sang — vì vậy nếu biết trước số lượng phần tử, khởi tạo `new ArrayList<>(1000)` sẽ tránh được nhiều lần copy.
- **Điểm yếu**: thêm/xóa ở giữa list chậm — phải dịch chuyển tất cả phần tử phía sau — O(n).

### 49. Tham trị và tham chiếu trong Java

**Câu trả lời chuẩn: Java LUÔN LUÔN là pass-by-value (truyền giá trị). Với kiểu nguyên thủy, giá trị được copy là bản thân con số; với object, giá trị được copy là CÁI THAM CHIẾU (địa chỉ trỏ tới object) — chứ không phải object.**

Đây là câu rất hay bị trả lời sai khi phỏng vấn, đi từng trường hợp:

**Trường hợp 1 — kiểu nguyên thủy (int, float, boolean...): copy giá trị.**

```java
public static void change(int x) {
    x = 100;                  // chỉ đổi bản copy
}

public static void main(String[] args) {
    int a = 10;
    change(a);
    System.out.println(a);    // 10 — a không đổi
}
```

**Trường hợp 2 — object: copy tham chiếu → SỬA NỘI DUNG object thì bên gọi thấy thay đổi.**

```java
public static void change(int[] arr) {
    arr[0] = 100;             // sửa nội dung object mà cả hai cùng trỏ tới
}

public static void main(String[] args) {
    int[] a = {10};
    change(a);
    System.out.println(a[0]); // 100 — vì cùng trỏ tới MỘT mảng trên Heap
}
```

**Trường hợp 3 — cái bẫy: GÁN LẠI tham số thì bên gọi KHÔNG bị ảnh hưởng.**

```java
public static void change(int[] arr) {
    arr = new int[]{100};     // chỉ bẻ hướng bản copy của tham chiếu
}

public static void main(String[] args) {
    int[] a = {10};
    change(a);
    System.out.println(a[0]); // 10 — a vẫn trỏ tới mảng cũ
}
```

Giải thích bằng hình ảnh: tham chiếu như **tờ giấy ghi địa chỉ nhà**. Truyền object vào method là đưa **bản photo tờ giấy**. Cầm bản photo đến sửa cái nhà (trường hợp 2) → chủ nhà thấy nhà đổi thật. Nhưng gạch địa chỉ trên bản photo rồi ghi địa chỉ nhà khác (trường hợp 3) → tờ giấy gốc của chủ nhà vẫn ghi địa chỉ cũ, không liên quan.

Riêng với **String**: vì String là immutable (không sửa nội dung được), nên không có cách nào làm "trường hợp 2" với String — truyền String vào method thì bên gọi không bao giờ thấy thay đổi. Bản gốc của tài liệu lấy String làm ví dụ "tham chiếu bị đổi thành 100" là **sai** (và đoạn code đó cũng không compile được — không gán số cho String).

Kết luận để trả lời phỏng vấn: *"Java không có pass-by-reference. Mọi thứ đều pass-by-value; với object, cái được copy là reference, nên qua reference đó có thể sửa nội dung object, nhưng gán lại tham số thì không ảnh hưởng biến bên ngoài."*

---

## Phụ lục — Những chỗ bản gốc SAI hoặc thiếu, đã sửa trong bản này

Phần này quan trọng: nếu mang nguyên bản gốc đi trả lời phỏng vấn, các mục dưới đây có thể bị trừ điểm.

**Sai kỹ thuật (phải sửa cách hiểu):**

1. **Mục 48 cũ (tham trị/tham chiếu) — sai nặng nhất.** Bản gốc nói truyền String vào method rồi gán `x = 100` thì biến bên ngoài thành 100. Sai hai lớp: (1) code đó không compile được (gán số cho String), (2) Java luôn pass-by-value — gán lại tham số không bao giờ ảnh hưởng biến bên ngoài; chỉ *sửa nội dung object* (qua setter, `arr[0]=...`) mới thấy thay đổi, mà String thì immutable nên càng không. Xem mục 49 bản mới.
2. **Mục 41 cũ (composite index) — đáp án sai.** Bản gốc nói WHERE theo thứ tự (C,B,D) trên index (B,C,D) thì "vẫn chậm như bình thường". Thực tế optimizer tự sắp xếp lại điều kiện — thứ tự viết trong WHERE không quan trọng, index vẫn được dùng. Chỉ chậm khi **thiếu cột đầu tiên (B)** của index (quy tắc leftmost prefix). Xem mục 42 bản mới.
3. **Mục 23 cũ: exception `NoTransactionRollBack` không tồn tại.** Tên đúng là **`TransactionRequiredException`** — ném ra khi thao tác ghi (`@Modifying` query, EntityManager) chạy ngoài transaction.
4. **Mục 3 cũ: "StringBuilder là Single Thread"** — diễn đạt dễ hiểu sai. Chính xác: StringBuilder **không thread-safe**, nên chỉ dùng an toàn trong phạm vi một thread.
5. **Mục 47 cũ: "ArrayList nhanh vì dữ liệu nằm trong RAM"** — lý do sai (mọi cấu trúc dữ liệu Java đều nằm trong RAM). Lý do đúng: dữ liệu nằm trong **mảng liên tục** → truy cập theo index là O(1).
6. **Mục 19 cũ: "hacker không có secret key thì không truy cập được"** — thiếu chính xác. Không có secret thì không *giả mạo* được token, nhưng token bị *đánh cắp* vẫn dùng được tới khi hết hạn.
7. **Mục 30 cũ: `@SLF4J`** — viết đúng là **`@Slf4j`** (annotation của Lombok, phân biệt hoa thường).

**Lỗi soạn thảo:**

8. Đánh số trùng: có hai mục "31" (BPMN và abstract/interface) — bản này đánh lại 1–49.
9. Mục 42 cũ (Multithreading) bị dán nhầm nguyên đoạn code của mục tham trị/tham chiếu vào giữa — đã gỡ.
10. Mục 15 (Entity) và 20 (Login) chỉ có hình, không có chữ giải thích — đã viết bổ sung.
11. Lỗi chính tả lặp nhiều lần: "theard" → thread, "bất động bộ" → bất đồng bộ, "partion" → partition, "Supper" → super, "sesstionID" → sessionID, "dung" → dùng, "quét sì ciu ri ty" → bị công cụ security scan cảnh báo.

**Nội dung đúng nhưng đã viết rõ hơn:** phân biệt DTO/Entity trong cấu trúc MVC (mục 9); vì sao constructor injection "nhìn rối" lại là dấu hiệu tốt (mục 10); pessimistic vs optimistic lock có tên gọi rõ ràng (mục 23); cache thêm ý TTL/invalidation (mục 24); final với object chỉ khóa việc gán lại (mục 35); Map không thuộc cây Collection (mục 44); ArrayList grow ~1.5x khi đầy (mục 48).





