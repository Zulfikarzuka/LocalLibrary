# 📚 Local Library App (Express.js)

Local Library adalah aplikasi web sederhana untuk mengelola katalog buku, penulis, genre, dan ketersediaannya. Dibuat dengan Node.js, Express, dan MongoDB.

## 🚀 Fitur

- CRUD Buku, Penulis, Genre, dan Salinan Buku
- Templating dengan Pug
- Struktur folder MVC
- Login (opsional untuk admin/user)
- Middleware & routing modular
- Validasi & sanitasi form

## 📦 Teknologi yang Digunakan

- Node.js
- Express.js
- MongoDB + Mongoose
- Pug (template engine)
- dotenv (untuk konfigurasi rahasia)
- morgan (logging)
- express-validator

## ⚙️ Instalasi

```bash
# Clone repo
git clone https://github.com/USERNAME/express-local-library.git
cd express-local-library

# Install dependencies
npm install

# Salin konfigurasi dan atur variabel rahasia
cp .env.example .env
# Lalu edit file .env sesuai kebutuhan

# Jalankan server
npm start
