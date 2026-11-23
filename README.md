# Seeds Studio

Website open commission Seeds Studio (Anime & GFS): Live2D model, ilustrasi anime, background, dan stinger.

Situs statis: `index.html` + gambar. Deploy di Vercel tanpa build step (Framework Preset: Other).

## Halaman
- `index.html`: website utama, termasuk `#gacha`, `#masuk`, `#akun`.
- `admin.html`: panel admin sementara (PIN awal `seeds2026`, ganti di Pengaturan Gacha). Tidak ditautkan dari website.
- `store.js`: lapisan data sementara berbasis localStorage. Saat backend siap, ganti isi file ini dengan pemanggilan ke server; halaman tidak perlu diubah.

## Catatan
- Halaman: beranda, `#gacha` (Seeds Gacha TCG), `#masuk` (login/daftar), `#akun` (akun saya).
- Akun, hasil gacha, pesanan, dan pengaturan disimpan di browser masing-masing (localStorage) sampai backend tersambung. Data pengguna dari perangkat lain belum terlihat di panel admin.
- PIN admin hanya penghalang sementara, bukan keamanan. Panel admin wajib dilindungi login server saat backend siap.
- Harga, slot, dan link akun sosial masih contoh.
