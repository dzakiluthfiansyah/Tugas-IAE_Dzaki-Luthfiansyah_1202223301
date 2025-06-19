// Weather Dashboard - Aplikasi Monolith dengan Public API
// Menggunakan Express.js, SQLite, dan OpenWeatherMap API

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');
const app = express();

// Konfigurasi
const PORT = 3000;
const API_KEY = 'https://openweathermap.org/api'; // Ganti dengan API key Anda
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Inisialisasi Database SQLite
const db = new sqlite3.Database(':memory:');

// Membuat tabel untuk menyimpan riwayat pencarian
db.serialize(() => {
    db.run(`CREATE TABLE weather_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        country TEXT,
        temperature REAL,
        weather_main TEXT,
        weather_description TEXT,
        humidity INTEGER,
        wind_speed REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Routes

// 1. Homepage - Menampilkan form pencarian
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Weather Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
            input, button { padding: 10px; margin: 5px; }
            button { background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .weather-card { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .error { color: red; background: #ffebee; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>🌤️ Weather Dashboard</h1>
        
        <div class="container">
            <h2>Cek Cuaca Kota</h2>
            <form action="/weather" method="POST">
                <input type="text" name="city" placeholder="Masukkan nama kota" required>
                <button type="submit">Cek Cuaca</button>
            </form>
        </div>
        
        <div class="container">
            <h2>Menu Navigasi</h2>
            <a href="/history"><button>📊 Lihat Riwayat Pencarian</button></a>
            <a href="/cities"><button>🏙️ Cuaca Kota-Kota Populer</button></a>
        </div>
        
        <div class="container">
            <h3>📝 Dokumentasi API</h3>
            <p><strong>Endpoints yang tersedia:</strong></p>
            <ul>
                <li>GET /api/weather/:city - Mendapatkan cuaca kota</li>
                <li>GET /api/history - Mendapatkan riwayat pencarian</li>
                <li>POST /api/history/clear - Menghapus riwayat</li>
                <li>GET /api/popular-cities - Cuaca kota-kota populer</li>
            </ul>
        </div>
    </body>
    </html>
    `);
});

// 2. API Endpoint - Mendapatkan cuaca berdasarkan nama kota
app.get('/api/weather/:city', async (req, res) => {
    try {
        const city = req.params.city;
        
        // Memanggil OpenWeatherMap API
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
                lang: 'id'
            }
        });
        
        const weatherData = response.data;
        
        // Menyimpan ke database
        const stmt = db.prepare(`INSERT INTO weather_history 
            (city, country, temperature, weather_main, weather_description, humidity, wind_speed) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run(
            weatherData.name,
            weatherData.sys.country,
            weatherData.main.temp,
            weatherData.weather[0].main,
            weatherData.weather[0].description,
            weatherData.main.humidity,
            weatherData.wind.speed
        );
        
        stmt.finalize();
        
        // Mengembalikan data cuaca
        res.json({
            success: true,
            data: {
                city: weatherData.name,
                country: weatherData.sys.country,
                temperature: Math.round(weatherData.main.temp),
                feels_like: Math.round(weatherData.main.feels_like),
                weather: weatherData.weather[0].main,
                description: weatherData.weather[0].description,
                humidity: weatherData.main.humidity,
                wind_speed: weatherData.wind.speed,
                icon: weatherData.weather[0].icon
            }
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan data cuaca',
            error: error.response?.data?.message || error.message
        });
    }
});

// 3. Form handler untuk pencarian cuaca
app.post('/weather', async (req, res) => {
    try {
        const city = req.body.city;
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/weather/${city}`);
        const weatherData = apiResponse.data.data;
        
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hasil Cuaca - ${weatherData.city}</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .weather-card { background: linear-gradient(135deg, #74b9ff, #0984e3); color: white; padding: 30px; border-radius: 15px; text-align: center; }
                .temp { font-size: 3em; margin: 10px 0; }
                .back-btn { background: #2d3436; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="weather-card">
                <h1>🌤️ ${weatherData.city}, ${weatherData.country}</h1>
                <div class="temp">${weatherData.temperature}°C</div>
                <p><strong>${weatherData.weather}</strong> - ${weatherData.description}</p>
                <p>Terasa seperti: ${weatherData.feels_like}°C</p>
                <p>💧 Kelembaban: ${weatherData.humidity}% | 💨 Angin: ${weatherData.wind_speed} m/s</p>
            </div>
            <a href="/" class="back-btn">← Kembali ke Beranda</a>
        </body>
        </html>
        `);
        
    } catch (error) {
        res.send(`
        <div style="font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="color: red; background: #ffebee; padding: 20px; border-radius: 5px;">
                <h2>❌ Error</h2>
                <p>Gagal mendapatkan data cuaca untuk kota "${req.body.city}"</p>
                <p>Pastikan nama kota benar dan coba lagi.</p>
            </div>
            <a href="/" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">← Kembali</a>
        </div>
        `);
    }
});

// 4. API Endpoint - Mendapatkan riwayat pencarian
app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM weather_history ORDER BY timestamp DESC LIMIT 20", (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Database error' });
            return;
        }
        
        res.json({
            success: true,
            data: rows,
            count: rows.length
        });
    });
});

// 5. Halaman riwayat pencarian
app.get('/history', (req, res) => {
    db.all("SELECT * FROM weather_history ORDER BY timestamp DESC", (err, rows) => {
        if (err) {
            res.status(500).send('Database error');
            return;
        }
        
        let historyHTML = rows.map(row => `
            <div class="weather-card">
                <h3>${row.city}, ${row.country}</h3>
                <p><strong>${row.temperature}°C</strong> - ${row.weather_description}</p>
                <p>Kelembaban: ${row.humidity}% | Angin: ${row.wind_speed} m/s</p>
                <small>📅 ${new Date(row.timestamp).toLocaleString('id-ID')}</small>
            </div>
        `).join('');
        
        if (historyHTML === '') {
            historyHTML = '<p>Belum ada riwayat pencarian.</p>';
        }
        
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Riwayat Pencarian</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .weather-card { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .back-btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .clear-btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px; }
            </style>
        </head>
        <body>
            <h1>📊 Riwayat Pencarian Cuaca</h1>
            <div>
                <a href="/" class="back-btn">← Kembali ke Beranda</a>
                <button onclick="clearHistory()" class="clear-btn">🗑️ Hapus Riwayat</button>
            </div>
            ${historyHTML}
            
            <script>
                function clearHistory() {
                    if (confirm('Yakin ingin menghapus semua riwayat?')) {
                        fetch('/api/history/clear', { method: 'POST' })
                        .then(() => location.reload());
                    }
                }
            </script>
        </body>
        </html>
        `);
    });
});

// 6. API Endpoint - Menghapus riwayat
app.post('/api/history/clear', (req, res) => {
    db.run("DELETE FROM weather_history", (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Gagal menghapus riwayat' });
            return;
        }
        res.json({ success: true, message: 'Riwayat berhasil dihapus' });
    });
});

// 7. API Endpoint - Cuaca kota-kota populer Indonesia
app.get('/api/popular-cities', async (req, res) => {
    const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Yogyakarta'];
    const weatherPromises = cities.map(city => 
        axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: 'metric',
                lang: 'id'
            }
        }).catch(err => null)
    );
    
    try {
        const results = await Promise.all(weatherPromises);
        const weatherData = results
            .filter(result => result !== null)
            .map(result => ({
                city: result.data.name,
                temperature: Math.round(result.data.main.temp),
                description: result.data.weather[0].description,
                humidity: result.data.main.humidity
            }));
        
        res.json({
            success: true,
            data: weatherData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan data cuaca kota populer'
        });
    }
});

// 8. Halaman kota-kota populer
app.get('/cities', async (req, res) => {
    try {
        const apiResponse = await axios.get(`http://localhost:${PORT}/api/popular-cities`);
        const cities = apiResponse.data.data;
        
        const citiesHTML = cities.map(city => `
            <div class="weather-card">
                <h3>🏙️ ${city.city}</h3>
                <p><strong>${city.temperature}°C</strong></p>
                <p>${city.description}</p>
                <p>💧 Kelembaban: ${city.humidity}%</p>
            </div>
        `).join('');
        
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cuaca Kota Populer</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .weather-card { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: inline-block; width: 200px; margin: 10px; text-align: center; }
                .back-btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>🏙️ Cuaca Kota-Kota Populer Indonesia</h1>
            <a href="/" class="back-btn">← Kembali ke Beranda</a>
            <div style="text-align: center;">
                ${citiesHTML}
            </div>
        </body>
        </html>
        `);
    } catch (error) {
        res.send('<h1>Error loading popular cities</h1>');
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
    });
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`
    🌤️  Weather Dashboard berhasil dijalankan!
    📍 Server: http://localhost:${PORT}
    
    📝 Jangan lupa:
    1. Install dependencies: npm install express sqlite3 axios
    2. Daftar di OpenWeatherMap.org untuk mendapatkan API key
    3. Ganti YOUR_OPENWEATHER_API_KEY dengan API key Anda
    
    🔗 Endpoints API:
    - GET  /api/weather/:city
    - GET  /api/history  
    - POST /api/history/clear
    - GET  /api/popular-cities
    `);
});

module.exports = app;