# TalentFlow — Không gian tuyển dụng

Ứng dụng web tiếng Việt hỗ trợ HR quản lý vị trí, viết và lưu bài tuyển dụng, tiếp nhận CV, đánh giá theo tiêu chí, xếp hạng ứng viên và chuẩn bị phone interview.

React + Vite cho giao diện; Express + SQLite cho API và lưu dữ liệu cục bộ. Các file CV nằm trong thư mục riêng tư, tải qua API có kiểm tra quyền. Font được đóng gói cục bộ. Yêu cầu **Node.js 24.8 trở lên** và npm; đã kiểm tra bằng Node 24.8.0.

## Chạy trên máy

```sh
npm ci
cp .env.example .env
npm run dev
```

Mở **http://localhost:5173**. API chạy trên `127.0.0.1:3001`. Chế độ build:

```sh
npm run build
npm start
```

Khi đó mở **http://localhost:3001**. Server chỉ lắng nghe loopback; không tự triển khai hoặc truy cập production.

Mặc định, database mới được khởi tạo với 4 vị trí, 8 ứng viên và một cuộc phỏng vấn tổng hợp. **CV, điểm và nhận xét mẫu được ghi rõ là demo; không phải kết quả AI thật.**

| Vai trò        | Email demo                 |
| -------------- | -------------------------- |
| Admin          | `admin@talentflow.local`   |
| Recruiter      | `hr@talentflow.local`      |
| Hiring Manager | `manager@talentflow.local` |

Mật khẩu demo: `TalentFlow@demo2026`. Các nút vai trò tại màn hình đăng nhập điền thông tin này. Nếu đặt `BOOTSTRAP_PASSWORD`, dùng mật khẩu đã đặt. Bootstrap chỉ áp dụng khi database chưa có người dùng.

Để tạo workspace sạch, đặt `SEED_DEMO=false` và `DATA_DIR` vào một thư mục mới trước lần chạy đầu. Khi không đặt `BOOTSTRAP_PASSWORD`, mật khẩu Admin được sinh ngẫu nhiên và in một lần trong terminal. Admin tạo người dùng và phân công quyền tại **Vị trí tuyển dụng → Quyền truy cập**.

## Luồng sử dụng

1. **Vị trí tuyển dụng:** tạo JD, yêu cầu bắt buộc (mỗi dòng một yêu cầu) và trọng số đủ 100%. Chỉnh JD, yêu cầu, cấp bậc hoặc trọng số tạo phiên bản tiêu chí mới.
2. **Bài tuyển dụng:** chọn vị trí, kênh và giọng văn. Có thể nhập trực tiếp, dùng mẫu từ JD, hoặc tạo/viết lại bằng AI. Kiểm duyệt rồi lưu; mỗi lần lưu tạo phiên bản mới. Bản nháp AI hoàn tất có thể mở lại trong panel trợ lý nếu đã chuyển sang màn hình khác. Có lịch sử và sao chép. Ứng dụng chưa đăng lên mạng xã hội.
3. **Ứng viên:** tải PDF/DOCX hoặc nhập văn bản thủ công. Xem tiến độ trong chuông thông báo. Mở hồ sơ → **Thông tin & CV**, kiểm tra văn bản, sửa thông tin rồi xác nhận. Có thể trích thông tin bằng AI trước khi xác nhận.
4. **Đánh giá CV:** AI đưa điểm theo 5 tiêu chí, trích dẫn và câu hỏi; backend tính điểm tổng. Có chế độ chấm thủ công, điều chỉnh với lý do và lịch sử giữ nguyên điểm cũ.
5. **CV Ranking:** chọn vị trí, lọc/sắp xếp, shortlist hoặc so sánh 2–4 hồ sơ. Chỉ kết quả cùng phiên bản tiêu chí hiện hành và CV đã xác nhận được xếp hạng. CV hoặc tiêu chí thay đổi sẽ yêu cầu chấm lại.
6. **Phone interview:** lên lịch 15–30 phút, dùng câu hỏi từ đánh giá CV hoặc nhờ AI đề xuất. HR gọi bằng điện thoại riêng, ghi câu trả lời, scorecard và ghi chú/transcript. **Lưu nháp** trước khi tóm tắt bằng AI. HR kiểm duyệt rồi **Duyệt kết quả**. Thông tin đã trả lời và suy luận AI được hiển thị riêng.

Mỗi ứng viên có thể ứng tuyển nhiều vị trí; mỗi lần ứng tuyển có điểm và trạng thái riêng. Trùng file được kiểm tra bằng hash trong phạm vi người dùng có quyền; trùng email/số điện thoại được cảnh báo khi xem hồ sơ. Không tự gộp hồ sơ.

## Bật AI thật

Trong `.env`, đặt:

```dotenv
OPENAI_API_KEY=<key của bạn>
OPENAI_MODEL=<model hỗ trợ Responses API và Structured Outputs>
AI_BASE_URL=https://api.openai.com/v1
```

Khởi động lại server. Không cần đưa key vào frontend. Có thể thay `AI_BASE_URL` để dùng dịch vụ tương thích **Responses API**; lớp tích hợp nằm trong `server/ai.js`. Model phải hỗ trợ schema được gửi. Tham chiếu API: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

AI có các tác vụ: viết/viết lại bài, trích thông tin CV, đánh giá CV, tạo câu hỏi và tóm tắt phỏng vấn. Dữ liệu CV/JD/ghi chú được gửi đến nhà cung cấp khi HR yêu cầu tác vụ AI. Requests dùng `store:false`, không cung cấp công cụ cho model. Prompt coi nội dung nguồn là dữ liệu không đáng tin cậy; backend kiểm tra schema, bằng chứng nguyên văn và các yêu cầu bắt buộc.

Thiếu thông tin không được kết luận là thiếu năng lực. Các tiêu chí thiếu bằng chứng được ghi rõ cần xác minh. Mức độ đầy đủ của bằng chứng không phải xác suất tuyển thành công. AI không tự thay trạng thái thành Từ chối hoặc Đã tuyển.

Các tác vụ lưu trong SQLite, chạy tuần tự, tự thử lại tối đa 2 lần với HTTP 429/5xx. Tác vụ lỗi có nút thử lại; dữ liệu trước đó được giữ. Tác vụ đang chạy khi server khởi động lại được đánh dấu lỗi để HR thử lại. Nếu CV, tiêu chí, ghi chú, điểm HR hoặc quyền truy cập thay đổi trong lúc AI chạy, kết quả không ghi đè dữ liệu mới.

## PDF, DOCX và OCR

- PDF/DOCX tối đa 10 MB/file, 10 file/lần, 50.000 ký tự/CV.
- Kiểm tra phần mở rộng và nội dung file; DOCX tối đa 25 MB sau giải nén.
- PDF tối đa 30 trang; tối đa 10 trang scan được OCR mỗi CV. Mỗi tác vụ có thời hạn 3 phút.
- PDF scan được render và OCR với Tesseract `eng+vie`. Lần đầu cần mạng để tải bộ ngôn ngữ; cache trong `DATA_DIR/ocr`. Có thể đặt `OCR_LANG_PATH` đến bộ ngôn ngữ cục bộ để chạy offline.
- Thông tin trích xuất theo nhãn/regex cần HR kiểm tra. CV không theo cấu trúc hoặc OCR kém có thể cần nhập/sửa thủ công. Thông tin trích bằng AI cũng chưa được tự xác nhận.
- PDF gốc xem cạnh thông tin hồ sơ; DOCX gốc có thể tải về. File không được cung cấp qua đường dẫn public.

## Phân quyền và lưu trữ

Admin quản lý người dùng, quyền vị trí, thời hạn lưu trữ và xóa hồ sơ. Recruiter làm việc trên vị trí được phân công. Hiring Manager chỉ đọc và nhận xét trên vị trí được phân công; backend chặn các thao tác tuyển dụng của vai trò này.

Session dùng cookie HttpOnly/SameSite, mật khẩu được hash với scrypt. Các thao tác trình duyệt kiểm tra origin. `.env`, database và CV bị loại khỏi git. Database và file nguồn nằm trong `DATA_DIR` (mặc định `.data`), với quyền truy cập filesystem hạn chế. Dữ liệu không được mã hóa ở tầng ứng dụng; cần bảo vệ máy lưu trữ và bản sao lưu nếu dùng dữ liệu thật.

Thời hạn lưu mặc định 365 ngày. Server kiểm tra mỗi giờ khi đang chạy, tính theo ngày tạo ứng viên và lần ứng tuyển mới nhất. Hồ sơ hết hạn bị xóa cùng CV, đánh giá, phỏng vấn và nhận xét. Admin có thể chạy dọn ngay hoặc xóa một ứng viên từ hồ sơ. Nhật ký chỉ lưu hành động, người thực hiện và ID; không ghi nội dung CV.

Nếu thay địa chỉ ứng dụng, cập nhật `ALLOWED_ORIGINS`. Bật `SECURE_COOKIE=true` khi có HTTPS. Mật khẩu demo chỉ dùng thử cục bộ.

## Kiểm tra

```sh
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

Kiểm tra OCR thật với PDF scan tổng hợp (cần bộ ngôn ngữ hoặc mạng trong lần đầu):

```sh
TEST_OCR=true node --test tests/extract.test.js
```

Backend tests dùng database tạm và nhà cung cấp AI giả lập ở một HTTP server cục bộ, kiểm tra cả yêu cầu API, schema, bằng chứng, retry và cạnh tranh cập nhật. E2E dùng workspace tạm riêng, kiểm tra luồng HR trên Chromium, so sánh, quyền Hiring Manager và mobile. Các bài kiểm tra không sửa `.data` của ứng dụng.

**Chưa gọi AI thật trong phiên triển khai vì chưa có API key/model do người dùng cấu hình.** Kiểm thử với nhà cung cấp thật vẫn cần thực hiện trước khi dùng kết quả AI cho dữ liệu tuyển dụng thực tế.

## Cấu trúc và giới hạn MVP

```text
src/main.jsx         Các màn hình và tương tác React
src/styles.css       Giao diện responsive
server/index.js      API, phân quyền, hàng đợi và lưu kết quả
server/domain.js     Schema, công thức điểm và kiểm tra bằng chứng
server/store.js      SQLite, session, audit và dữ liệu demo
server/ai.js         Adapter Responses API và prompts
server/extract.js    PDF/DOCX/OCR và thông tin theo nhãn
 tests/              Kiểm thử API, dữ liệu nguồn và trình duyệt
```

Các thực thể được lưu dưới dạng JSON có type/id trong SQLite: users (role), jobs, rubrics, posts (phiên bản), candidates, resumes, applications, evaluations (criteria), interviews (scorecard), tasks, audit và settings. Cách lưu này phù hợp MVP cục bộ; khi mở rộng nên chuyển sang schema quan hệ có foreign key, migration và database server.

Một tiến trình server và một worker phù hợp quy mô chạy thử. Chưa có tổng đài/gọi tự động, ghi âm, speech-to-text, lịch bên ngoài, gửi email, đăng mạng xã hội, quét malware hoặc hạ tầng triển khai nhiều người dùng. Không cần các tính năng đó để chạy luồng MVP đã mô tả.
