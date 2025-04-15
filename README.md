# 🛒 E-Commerce Project

Dự án gồm hai phần chính:

- `front_end`: Giao diện người dùng, được xây dựng bằng **ReactJS**
- `back_end`: API và xử lý nghiệp vụ, được xây dựng bằng **Node.js (ExpressJS)** và sử dụng **MongoDB** làm database.

---

## 🚀 Công nghệ sử dụng

### 📦 Backend (`back_end`)

- Node.js
- ExpressJS
- MongoDB / Mongoose
- Dotenv
- JWT (Xác thực)
- Bcrypt (Mã hóa mật khẩu)
- Nodemon (phát triển)
- Multer (Upload file)

### 🌐 Frontend (`front_end`)

- ReactJS
- React Router DOM
- Axios (Gọi API)
- TailwindCSS
- Redux toolkit

---

## ⚙️ Cài đặt và chạy dự án

> Lưu ý: Cần cài sẵn **Node.js**, **npm/yarn**, **MongoDB** trên máy.

<p>Tạo file .env trong thư mục back_end và thêm các thông tin cần thiết</p>
<ul>
<li>PORT=5000</li>
<li>MONGODB_URI=your_mongodb_uri</li>
<li>PAYPAL_CLIENT_ID=your_paypal_client_id</li>
<li>PAYPAL_SECRET_KEY=your_paypal_secret_key</li>
<li>CLIENT_SECRET_KEY=your_client_secret_key</li>
<li>CLOUD_NAME=your_cloudinary_cloud_name</li>
<li>CLOUD_API_KEY=your_cloudinary_api_key</li>
<li>CLOUD_API_SECRET=your_cloudinary_api_secret</li>
</ul>
---

### 📦 Chạy `front_end`

````bash
cd front_end
npm install          # Cài dependencies
npm run dev
### 📦 Chạy `back_end`

```bash
cd back_end
npm install          # Cài dependencies
npm start
````
