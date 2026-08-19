# HUT RI 81 × Radiant Group

Sistem manajemen acara peringatan HUT RI ke-81 × Radiant Group — registrasi peserta, check-in, spin draw (lucky draw), serta manajemen perlombaan lengkap dengan scoring, leaderboard, nominasi, pemenang, dan live competition monitor.

## Tech Stack

Frontend:
- React
- TypeScript
- Vite
- React Router

Backend:
- Google Apps Script

Database:
- Google Spreadsheet

Deployment:
- GitHub
- GitHub Actions
- GitHub Pages

## Features

- Dashboard
- Registration
- Check-in
- Participants
- Prizes
- Lucky Draw (Spin Draw)
- Winners
- Authentication
- Role-based authorization
- Competition management
- Teams
- Scoring
- Leaderboard
- Nominations
- Competition Winners
- Live Competition Monitor
- Activity Log
- Google Apps Script API

## Roles

- SUPERADMIN
- ADMIN
- OPERATOR
- VIEWER
- PUBLIC untuk live monitor jika diaktifkan

## Development

```bash
npm install
npm run dev
```

Salin `.env.example` menjadi `.env` (atau `.env.local`) lalu isi `VITE_API_URL` dengan URL deployment Google Apps Script Anda.

```bash
cp .env.example .env
```

## Production Build

```bash
npm run build
```

## Deployment

GitHub Actions otomatis melakukan build dan deploy ke GitHub Pages setiap push ke branch `main`.

1. Pastikan repository ini adalah repository GitHub: https://github.com/assyaref/hut-ri-81-radiant-group
2. Di GitHub, buka **Settings → Secrets and variables → Actions → Variables** dan tambahkan variable `VITE_API_URL` berisi URL deployment Google Apps Script Anda.
3. Buka **Settings → Pages** dan pastikan source diatur ke **GitHub Actions**.
4. Push ke `main` (atau jalankan workflow `Deploy to GitHub Pages` secara manual lewat tab **Actions**).

Deployment URL: https://assyaref.github.io/hut-ri-81-radiant-group/

> Catatan: Jangan pernah commit file `.env`, credential, password, API key, atau Spreadsheet ID ke repository.

