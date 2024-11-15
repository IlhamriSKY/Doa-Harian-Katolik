# Changelog

## [0.0.5] - 2024-11-15
### Added
- Menambahkan fungsi `showBible` untuk menampilkan Alkitab dengan tampilan berfilter berdasarkan kitab, bab, dan ayat.
- Menambahkan fungsi `showPrayers` untuk menampilkan kumpulan doa dengan pencarian berdasarkan nama doa.
- Menambahkan fungsi `showSaints` untuk menampilkan daftar orang kudus dengan pencarian berdasarkan nama orang kudus.
- Menambahkan tampilan loading skeleton pada `showBible` untuk memperlihatkan indikator loading ketika data sedang dimuat.

### Changed
- Memperbarui `citySetting.js` untuk menyediakan pilihan kota di Indonesia saja (menggunakan `cities.json`).
- Memperbarui `prayerReminder.js` untuk mengatur pengingat doa berdasarkan zona waktu kota yang dipilih, dengan konfigurasi untuk waktu notifikasi sebelum waktu doa.
- Menambahkan dokumentasi pada setiap fungsi di berbagai file (`citySetting.js`, `prayerReminder.js`, `bibleDisplay.js`, `prayerDisplay.js`, `saintDisplay.js`) untuk meningkatkan keterbacaan dan pemahaman kode.
- Menyederhanakan kode dengan menghapus redundansi dan komentar yang tidak diperlukan di seluruh file.

### Fixed
- Memperbaiki bug pada fitur pencarian Alkitab agar menampilkan hasil pencarian sesuai dengan input.
- Mengubah elemen dropdown untuk pemilihan kitab, bab, dan ayat pada `showBible` agar tampil rapi dan responsif.
- Menyelesaikan masalah tampilan yang menumpuk antara form pencarian dan card di berbagai tampilan.

## [0.0.4] - 2024-11-15
### Changed
- Mengganti dependensi `all-the-cities` dengan `cities.json` untuk mengurangi ketergantungan pada file eksternal `cities.pbf`.
- Memperbarui `citySetting.js` dan `prayerReminder.js` untuk menggunakan data dari `cities.json`.

## [0.0.3] - 2024-11-14
### Fixed
- Memperbaiki versi paket ekstensi yang tidak konsisten dengan publikasi.

## [0.0.2] - 2024-11-13
### Fixed
- Memperbaiki metadata ekstensi untuk menampilkan informasi yang lebih akurat di Visual Studio Marketplace.
- Menyesuaikan `package.json` untuk mencerminkan kategori yang benar dan detail lainnya.

## [0.0.1] - 2024-11-12
### Initial Release
- Rilis pertama ekstensi Doa Harian Katolik.
- Menyediakan fitur pengingat doa harian (Doa Angelus pagi, siang, dan Doa Kerahiman Ilahi).
- Menyediakan pengaturan kota pengguna dan pengingat berbasis zona waktu.
