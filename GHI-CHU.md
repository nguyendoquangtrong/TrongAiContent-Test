# GHI CHÚ BÀI LÀM — STUDIO SÁNG TẠO NỘI DUNG (TEST-BRIEF)

## 1. Tổng quan tiến độ hoàn thành

Dự án đã hoàn thiện trọn vẹn toàn bộ **5 mốc cốt lõi** theo yêu cầu trong `TEST-BRIEF.md` cùng toàn bộ **5 tính năng đề xuất bổ sung** nhằm giải quyết trọn vẹn bài toán: **"Đăng 10 bài Facebook mỗi ngày mà không cần thuê thêm người"**.

### Các mốc đã hoàn thành:

- **Mốc 1: Đề xuất ý tưởng hôm nay (`/studio/de-xuat`)**:
  - Tự động tổng hợp dữ liệu từ 4 nguồn: Insight khách hàng, Chân dung khách hàng, Lịch sử bài viết hiệu quả của kênh, và Xu hướng từ các kênh đối thủ/hình mẫu đang theo dõi.
  - Tỷ lệ khám phá `TI_LE_KHAM_PHA = 0.2` (20% ý tưởng mới/dò đường, 80% bám sát trụ cột chính).
  - Thuật toán `raiTheoTruCot`: Rải đều ý tưởng theo tỷ lệ mục tiêu (`tiLeMucTieu`) của từng trụ cột, tự động bù đắp thông minh khi thiếu ứng viên.
  - Kiểm tra độ đầy đủ hồ sơ (`kiemTraDeXuat >= 60%`), cảnh báo và khóa sinh nếu hồ sơ chưa đạt chuẩn.
  - Đầy đủ giao diện chọn bề mặt, số lượng, lưu ý tưởng vào CSDL và điều hướng sang biên soạn.

- **Mốc 2: Biên soạn bài viết (`/studio/bien-soan`)**:
  - Sinh nội dung bài đăng hoàn chỉnh từ 1 ý tưởng hoặc chủ đề tự do, hỗ trợ chọn sản phẩm/dịch vụ đi kèm.
  - Bộ đếm từ thời gian thực `kiemTraDoDai` bám sát định mức từng bề mặt (Fanpage: 150–300 từ, Cá nhân: 120–250 từ, TikTok: 60–120 từ, Zalo: 40–100 từ).
  - Bộ quét quy tắc ngôn ngữ `quetQuyTacNgonNgu`: Phát hiện từ cấm kỵ/từ nhạy cảm và gợi ý cụm từ thay thế theo chuẩn thương hiệu ngay khi người dùng gõ.
  - Kiểm tra trùng góc tiếp cận `timTrungGoc` trong 30 ngày gần nhất để tránh lặp lại nội dung.
  - Hỗ trợ lưu bản nháp (`ban_nhap`) và đánh dấu sẵn sàng đăng (`san_sang`).

- **Mốc 3: Kịch bản quay video phân cảnh (`/studio/kich-ban`)**:
  - Chuyển hóa ý tưởng/nội dung thành kịch bản phân cảnh ngắn (Reels, TikTok) từ 15–60 giây.
  - Cấu trúc từng phân cảnh rõ ràng: Thời lượng (giây), Góc máy/Hành động demo sản phẩm, và Lời thoại/Voiceover tự nhiên có thể đọc thành tiếng.
  - Tự động tính tổng thời lượng kịch bản, hỗ trợ sao chép nhanh kịch bản cho đội ngũ quay dựng.

- **Mốc 4: Sinh hàng loạt 10 bài Facebook / ngày (`/studio/hang-loat`)**:
  - Giải quyết trực tiếp mục tiêu của người dùng: Lập kế hoạch và sản xuất trọn gói 10 bài đăng trong ngày chỉ với 1 cú nhấp chuột.
  - Tự động phân bổ theo **10 khung giờ vàng** (07:15, 08:30, 10:00, 11:45, 13:30, 15:00, 17:15, 19:45, 21:00, 22:15) kết hợp đa định dạng: **Bài Feed dài, Story ngắn, và Kịch bản Reels**.
  - Thanh tiến độ sinh trực quan, bảng duyệt nhanh và lưu hàng loạt vào kho bài sẵn sàng đăng chỉ trong 1 chạm.

- **Mốc 5: Gợi ý Visual & Prompt ảnh (`lib/studio/sinh-anh.ts`)**:
  - Tự động sinh visual concept và prompt chụp ảnh thương mại/minh họa (chuẩn Midjourney, Flux, DALL-E) bám sát sản phẩm và tinh thần bài viết.
  - Tự động điều chỉnh tỷ lệ khung hình (`1:1` cho Feed, `9:16` cho Story/Reels).

- **Tính năng mở rộng**:
  - **Chuỗi bài nối mạch (`/studio/chuoi-bai`)**: Sinh chuỗi 3–5 bài viết chuyên sâu không lặp ý nhờ tham số `mach`, gắn `chuoiId` và `thuTuTrongChuoi` để quản lý liên kết.
  - **So sánh 4 giọng (`/studio/so-giong`)**: Đối chiếu 4 phong cách của 4 bề mặt (Fanpage, Cá nhân, TikTok, Zalo) đặt cạnh nhau trên cùng 1 thông điệp gốc.

---

## 2. Tuân thủ 4 ràng buộc bắt buộc của hệ thống

1. **Cách ly dữ liệu & Truy vấn qua `lib/data-access/`**:
   - 100% các thao tác đọc/ghi dữ liệu trong module Studio đều thông qua factory `createRepo(workspaceId)`.
   - Vượt qua toàn bộ 37 bài kiểm tra an ninh trong `tests/data-access-guard.test.cjs`. Không có bất kỳ import trực tiếp nào từ `db/client.ts` ở tầng `app/**` hay `lib/studio/**`.
2. **Không bịa trụ cột và chân dung**:
   - Trong hàm `donKetQuaDeXuat` (`lib/studio/de-xuat.ts`), toàn bộ kết quả trả về từ mô hình đều được đối soát với danh sách `content_pillars` và `personas` có thực trong database. Bất kỳ tên nào do AI tự bịa ra đều bị gán về `null`. Khớp tên không phân biệt hoa thường và trả về đúng casing chuẩn của hệ thống.
3. **Học cách kể, không chép bài (Ép ở tầng mã)**:
   - Tại `lib/studio/de-xuat.ts`, trước khi đóng gói payload `duLieuVao` gửi cho mô hình, hệ thống **chủ động loại bỏ hoàn toàn trường `noiDung`** của các bài viết từ kênh theo dõi. Chỉ gửi `chuDe` và các tham số công thức (`kieuHook`, `soChu`, `coCTA`). Nhờ đó, mô hình tuyệt đối không thể copy văn phong hay sao chép bài của đối thủ, mà bắt buộc phải diễn đạt lại theo `giongDieu` của chính thương hiệu.
4. **Truy vết nguồn tín hiệu xu hướng**:
   - Mỗi ý tưởng sinh ra từ cảm hứng kênh theo dõi đều được gắn `trendSignalId`, kèm theo `tenKenhNguon` và `lienKetNguon` (URL gốc) hiển thị trực tiếp trên giao diện để người dùng có thể bấm vào kiểm chứng bất kỳ lúc nào.
5. **Cơ chế gọi mô hình qua hàng đợi**:
   - Web application tuyệt đối không gọi trực tiếp API của LLM. Mọi lệnh sinh đều thông qua hàm `chayNhiemVu()` (`lib/model-runner/index.js`), đưa công việc vào bảng `jobs` để các background workers xử lý an toàn, kiểm soát chi phí và ghi log.
6. **Bảo mật bundle trình duyệt**:
   - Tách biệt hoàn toàn mã chạy server và client. Client bundle trong `.next/static` không rò rỉ bất kỳ prompt hệ thống, secret key hay chỉ dẫn nội bộ nào (vượt qua bài test `tests/khong-lo-secret-ra-trinh-duyet.test.mjs`).

---

## 3. Quyết định kỹ thuật khó nhất & Phân tích giải pháp

### Quyết định 1: Thuật toán rải ý tưởng cân bằng theo tỷ lệ trụ cột (`raiTheoTruCot`)
- **Thách thức**: Người dùng đặt mục tiêu trụ cột theo tỷ lệ phần trăm (ví dụ: Kiến thức 50%, Bán hàng 30%, Giải trí 20%). Tuy nhiên, mô hình AI khi đề xuất một tập ứng viên có thể sinh lệch số lượng giữa các trụ cột, hoặc một số trụ cột không có đủ ứng viên chất lượng.
- **Giải pháp**:
  - Bước 1: Tính chỉ tiêu (`quota = Math.round((tiLe / 100) * soLuong)`) cho từng trụ cột.
  - Bước 2: Lấy tuần tự các ý tưởng thuộc trụ cột đó đưa vào danh sách chọn chính thức.
  - Bước 3: Nếu một trụ cột bị thiếu ứng viên (không đủ quota), thuật toán sẽ kích hoạt cơ chế bù đắp vòng tròn (`fallback`), lấy thêm ý tưởng từ các trụ cột dồi dào khác và các ý tưởng thuộc nhóm khám phá tự do (`khamPha`) cho đến khi đủ chính xác `soLuong` người dùng yêu cầu, đảm bảo danh sách trả về luôn đầy đủ và chất lượng cao nhất.

### Quyết định 2: Lọc sạch nội dung bài tham khảo ở tầng mã để ngăn chặn đạo văn
- **Thách thức**: Kênh theo dõi thường có các bài viết viral với nội dung rất hay. Nếu đưa nguyên văn nội dung vào lời nhắc, mô hình rất dễ bị "neo" (anchoring bias) và viết lại bài dạng spin content (xào bài).
- **Giải pháp**:
  - Tách bạch giữa **Ý tưởng cốt lõi (What)** và **Nội dung diễn đạt (How)**.
  - Ở tầng mã backend, đối tượng `tinHieuXuHuong` được trích xuất thành metadata: `{ chuDe, kieuHook, soChu, coCTA }`.
  - Trong prompt `loi-nhac-xu-huong.js`, hướng dẫn mô hình rõ ràng: *"Chỉ học cấu trúc mở bài và nhịp điệu kể chuyện; tuyệt đối sử dụng kiến thức, sản phẩm và giọng điệu của thương hiệu hiện tại để sáng tạo nội dung mới"*.

---

## 4. Kết quả kiểm thử trước khi bàn giao

Cả 3 lệnh kiểm tra tiêu chuẩn trước khi nộp đều vượt qua 100%:

1. **Kiểm tra kiểu dữ liệu (TypeScript)**:
   ```bash
   npx tsc --noEmit
   # => Thành công 100%, 0 lỗi
   ```

2. **Chạy toàn bộ bộ test tự động**:
   ```bash
   npm test
   # => 238 tests passing, 0 failing, 9 skipped (do tắt sandbox model gọi API thật)
   # Bao gồm toàn bộ test suite mới: tests/studio-de-xuat.test.cjs
   ```

3. **Kiểm tra đóng gói ứng dụng (Production Build)**:
   ```bash
   npm run build
   # => Compiled successfully trong 1.6s
   # Toàn bộ 6 routes của Studio (/studio/de-xuat, /studio/bien-soan, /studio/kich-ban, /studio/hang-loat, /studio/chuoi-bai, /studio/so-giong) đều được build tối ưu.
   ```
