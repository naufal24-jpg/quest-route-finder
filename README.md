# QuestRoute

Aplikasi web interaktif untuk navigasi peta dan pencarian jalur tercepat (*Shortest Path Finder*) dengan desain antarmuka editorial Liquid Glass, dibangun tanpa API key berbayar.

## Demo Langsung (GitHub Pages)
Setelah GitHub Pages diaktifkan pada branch `main` folder `/ (root)`, aplikasi dapat diakses dari desktop maupun HP melalui:
`https://naufal24-jpg.github.io/quest-route-finder/`

## Teknologi
- **Frontend:** HTML5, Tailwind CSS, CSS Liquid Glass kustom, dan Vanilla JavaScript
- **Peta:** Leaflet.js dengan tile Humanitarian OpenStreetMap (`tile.openstreetmap.fr/hot`) dan fallback otomatis ke Esri World Street Map
- **Routing:** OSRM Public API (`router.project-osrm.org`) untuk jalur tercepat, rute alternatif, dan petunjuk arah langkah demi langkah
- **Geocoding:** Nominatim OpenStreetMap API untuk pencarian alamat real-time dan reverse geocoding saat klik peta

## Fitur Utama
- Header kapsul melayang dengan status koneksi OpenStreetMap, filter kategori cepat (`Kampus`, `Stasiun`, `Pusat Belanja`, `Kuliner`), dan tombol `Reset Rute`
- Input **Titik Awal** dan **Titik Tujuan** dengan autocomplete Nominatim, tukar arah rute (`Swap`), serta pengisian langsung lewat klik peta dan marker yang dapat digeser
- Kartu hasil rute menampilkan total jarak (`km`), estimasi waktu tempuh (`mnt`), perkiraan jam tiba, pilihan **Rute Tercepat** dan **Alternatif**, serta daftar petunjuk arah (*turn-by-turn*)
- Direktori 12 destinasi populer Jakarta lengkap dengan pin interaktif pada peta
- Tata letak responsif dengan *collapsible bottom sheet* untuk layar HP dan dukungan tombol lokasi GPS (`Lokasi Saya`)

## Menjalankan Secara Lokal
Buka langsung `index.html` di browser, atau jalankan server lokal:

```bash
python -m http.server 8000
```
