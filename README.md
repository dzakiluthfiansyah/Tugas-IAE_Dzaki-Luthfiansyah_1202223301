# Weather Dashboard - Aplikasi Monolith dengan Public API

## 📋 Deskripsi Proyek
Aplikasi web sederhana untuk menampilkan informasi cuaca kota-kota menggunakan **OpenWeatherMap API**. Aplikasi ini dibangun dengan arsitektur monolith menggunakan Node.js, Express.js, dan SQLite.

## 🚀 Fitur Utama
- ✅ Pencarian cuaca berdasarkan nama kota
- ✅ Menampilkan cuaca kota-kota populer Indonesia  
- ✅ Riwayat pencarian cuaca (disimpan di database)
- ✅ RESTful API endpoints
- ✅ Interface web yang user-friendly
- ✅ Integrasi dengan public API (OpenWeatherMap)

## 🛠️ Teknologi yang Digunakan
- **Backend**: Node.js, Express.js
- **Database**: SQLite (in-memory)
- **Public API**: OpenWeatherMap API
- **HTTP Client**: Axios
- **Frontend**: HTML, CSS, JavaScript (Vanilla)

## 📦 Instalasi dan Setup

### 1. Clone atau Download Project
```bash
# Buat folder project
mkdir weather-dashboard
cd weather-dashboard

# Copy kode dari artifact ke file app.js dan package.json
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Mendapatkan API Key
1. Daftar di [OpenWeatherMap.org](https://openweathermap.org/api)
2. Dapatkan API key gratis
3. Ganti `YOUR_OPENWEATHER_API_KEY` di file `app.js` dengan API key Anda

### 4. Menjalankan Aplikasi
```bash
# Menjalankan aplikasi
npm start

# Atau untuk development (dengan auto-reload)
npm run dev
```

### 5. Akses Aplikasi
Buka browser dan akses: `http://localhost:3000`

## 🔗 API Endpoints

### 1. Mendapatkan Cuaca Kota
```
GET /api/weather/:city
```
**Response:**
```json
{
  "success": true,
  "data": {
    "city": "Jakarta",
    "country": "ID",
    "temperature": 28,
    "feels_like": 32,
    "weather": "Clouds",
    "description": "berawan",
    "humidity": 78,
    "wind_speed": 3.5,
    "icon": "04d"
  }
}
```

### 2. Mendapatkan Riwayat Pencarian
```
GET /api/history
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "city": "Jakarta",
      "country": "ID",
      "temperature": 28.5,
      "weather_main": "Clouds",
      "weather_description": "berawan",
      "humidity": 78,
      "wind_speed": 3.5,
      "timestamp": "2025-06-19 10:30:00"
    }
  ],
  "count": 1
}
```

### 3. Menghapus Riwayat
```
POST /api/history/clear
```

### 4. Cuaca Kota Populer
```
GET /api/popular-cities
```

## 🌐 Halaman Web

### 1. Homepage (`/`)
- Form pencarian cuaca
- Menu navigasi
- Dokumentasi API

### 2. Hasil Pencarian (`/weather`)
- Menampilkan detail cuaca kota
- Data temperature, kelembaban, kecepatan angin

### 3. Riwayat Pencarian (`/history`)
- Daftar riwayat pencarian cuaca
- Opsi untuk menghapus riwayat

### 4. Kota Populer (`/cities`)
- Cuaca 6 kota besar Indonesia
- Jakarta, Surabaya, Bandung, Medan, Semarang, Yogyakarta

## 🗃️ Struktur Database

### Tabel: weather_history
```sql
CREATE TABLE weather_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    country TEXT,
    temperature REAL,
    weather_main TEXT,
    weather_description TEXT,
    humidity INTEGER,
    wind_speed REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Arsitektur Aplikasi

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │────│  Express Server  │────│ OpenWeather API │
│   (Frontend)    │    │   (Backend)      │    │  (Public API)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │  SQLite Database │
                       │   (Local Data)   │
                       └─────────────────┘
```

## 🔄 Alur Kerja Aplikasi

1. **User Interface**: User mengakses web browser
2. **Request Processing**: Express.js menerima request dari user
3. **API Integration**: Server memanggil OpenWeatherMap API
4. **Data Storage**: Data cuaca disimpan ke SQLite database
5. **Response**: Data ditampilkan kembali ke user

## 📝 Contoh Penggunaan API

### Testing dengan cURL:
```bash
# Mendapatkan cuaca Jakarta
curl http://localhost:3000/api/weather/Jakarta

# Mendapatkan riwayat
curl http://localhost:3000/api/history

# Cuaca kota populer
curl http://localhost:3000/api/popular-cities
```

## 🔍 Validasi Tugas

### ✅ Implementasi API Public
- Menggunakan OpenWeatherMap API (public API gratis)
- Integrasi dengan axios untuk HTTP requests
- Error handling untuk API calls

### ✅ Arsitektur Monolith
- Satu aplikasi dengan multiple responsibilities
- Frontend dan backend dalam satu codebase
- Database terintegrasi dalam aplikasi

### ✅ CRUD Operations
- **Create**: Menyimpan data cuaca ke database
- **Read**: Membaca data cuaca dan riwayat
- **Update**: Update data melalui API calls
- **Delete**: Menghapus riwayat pencarian

### ✅ RESTful API Design
- GET untuk mengambil data
- POST untuk create/delete operations
- Proper HTTP status codes
- JSON response format

## 🐛 Troubleshooting

### Error: API Key Invalid
- Pastikan API key dari OpenWeatherMap sudah benar
- Tunggu beberapa menit setelah mendaftar (aktivasi API key)

### Error: City Not Found
- Periksa ejaan nama kota
- Gunakan nama kota dalam bahasa Inggris

### Error: Database Issues
- Restart aplikasi (database in-memory akan reset)
- Periksa permissions folder aplikasi

## 📚 Pengembangan Lebih Lanjut

Ide untuk pengembangan:
1. **Add Authentication**: Login system untuk user
2. **Weather Forecast**: Prediksi cuaca 5 hari
3. **Favorites**: Simpan kota favorit user
4. **Maps Integration**: Tampilkan peta cuaca
5. **Push Notifications**: Alert cuaca ekstrem
6. **Charts**: Grafik trend temperature
7. **Mobile App**: React Native atau PWA

## 📄 Kesimpulan

Aplikasi ini berhasil mengimplementasikan:
- ✅ Integrasi dengan public API (OpenWeatherMap)
- ✅ Arsitektur monolith dengan Express.js
- ✅ Database operations dengan SQLite
- ✅ RESTful API endpoints
- ✅ User interface web yang fungsional
- ✅ Error handling dan validasi input

Aplikasi siap untuk demonstrasi dan evaluasi tugas kuliah! 🎓