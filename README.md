<p align="center">
  <img src="app-icon.png" alt="AkihiroLabs POS logo" width="112">
</p>

<h1 align="center">AkihiroLabs POS</h1>

<p align="center">
  A lightweight, local-first point-of-sale system for bars, cafés and small shops.<br>
  Runs entirely in the browser — no server, no account, no install.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-10.8.0-1E3A8A" alt="version 10.8.0">
  <img src="https://img.shields.io/badge/vanilla-JavaScript-00A8CC" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/storage-IndexedDB-1E3A8A" alt="IndexedDB">
  <img src="https://img.shields.io/badge/lang-English%20%7C%20Burmese-00A8CC" alt="English | Burmese">
</p>

---

## Features

- **Staff login & roles** — pick your name and enter a 4-digit PIN. Three roles: **Admin** (everything), **Cashier** (POS, tabs, view stock) and **Inventory** (stock counts and alert levels only).
- **Fast checkout** — product grid with search and categories, large touch-friendly cash numpad, quick-cash buttons and automatic change calculation.
- **Size variants** — like a real POS: each size (S / M / L…) has its own price, stock count and low-stock alert. Selling a size only takes from that size.
- **Customer tabs** — open a tab for a table or guest, add items over time, then charge and close.
- **Happy hour** — automatic % discount on chosen categories during a set time window.
- **Items & Stock** — simple item list with search, category and Low / Out filters; tap an item to edit (Details · Price & sizes · Stock). Inventory staff get a **Stock** count screen with big −/+ buttons and no prices.
- **Dashboard** — today's revenue and orders, top sellers, low stock and open tabs at a glance.
- **Reports** — filter by date range, product breakdown and recent sales log.
- **Refunds** — admins can refund a whole sale or only some items from Reports, and choose whether items go back to stock. Reports show Sales − Refunds = Net revenue.
- **Shifts (cash drawer)** — open a shift with the starting cash, close it by counting the drawer; the app shows expected vs counted cash and the difference, with a printable shift report (PDF). Can be required before selling (Settings → Cash drawer).
- **Export** — CSV (Excel-friendly, UTF-8) and PDF reports with Burmese script support.
- **Backup / Restore** — download or restore all data as a JSON file.
- **Minimal UI** — clean light theme (white, charcoal, navy) with Lucide line icons.
- **Bilingual UI** — English and Burmese (မြန်မာ), switchable anytime.

## Getting started

No build step is needed.

**Option 1 — open locally**

1. Download or clone this repository.
2. Open `index.html` in Chrome, Edge or Safari.

**Option 2 — GitHub Pages**

Live: **https://akihirozayar.github.io/akihirolabs-pos/**

The app is pure static files, so it runs as-is on GitHub Pages (Settings → Pages → deploy from `main`).

## Project structure

```
akihirolabs-pos/
├── index.html              # Page shell — links the CSS and JS files
├── css/
│   └── style.css           # All styles
├── js/
│   ├── version.js          # APP_VERSION (single source of truth)
│   ├── db.js               # IndexedDB, settings, happy-hour pricing
│   ├── i18n.js             # English / Burmese translations
│   ├── state.js            # App state, seed data, helpers, cart, tabs
│   ├── export.js           # Backup / restore, CSV, PDF
│   ├── ui.js               # DOM helpers, top bar, footer
│   ├── views/
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── pos.js
│   │   ├── tabs.js
│   │   ├── inventory.js
│   │   ├── reports.js
│   │   ├── staff.js
│   │   ├── settings.js
│   │   └── modal.js
│   └── app.js              # render() + boot
├── app-icon.png        # App logo (README, 512px)
├── favicon.png · apple-touch-icon.png · icon-192.png · icon-512.png
├── assets/
│   └── icon.png            # Previous icon (Byte 🦝), no longer linked
├── CHANGELOG.md
└── README.md
```

Scripts are plain `<script>` tags (not ES modules), so the app works when opened straight from your disk as well as from a web server. **Load order in `index.html` matters** — `app.js` must stay last.

## Data & privacy

- All data (products, sales, staff, tabs, settings) is stored in your browser's **IndexedDB** (`pos_bar_v3`).
- Nothing is sent to any server.
- Data is per browser and per device — use **Settings → Backup JSON** regularly, and **Restore JSON** to move data to another device.
- Clearing your browser's site data will erase the POS data.

## Tech

- Vanilla JavaScript, HTML and CSS — no frameworks, no build tools
- [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://github.com/niklasvh/html2canvas) for PDF export
- [Noto Sans Myanmar](https://fonts.google.com/noto/specimen/Noto+Sans+Myanmar) for Burmese text

## Versioning

This project uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

- The version lives in **`js/version.js`** and is shown in the app footer and PDF reports.
- To release: bump `APP_VERSION`, update the `?v=` numbers in **`index.html`** to the same version (this makes browsers load the new files instead of cached ones), add an entry to [`CHANGELOG.md`](CHANGELOG.md), then create a GitHub Release tagged `vX.Y.Z`.

Current version: **v10.8.0** — see the [changelog](CHANGELOG.md).

## Community

Updates and feedback on the **AkihiroLabs Discord server**.

---

<p align="center">
  Built by <b>AkihiroLabs</b>
</p>
