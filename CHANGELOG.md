# Changelog

All notable changes to **AkihiroLabs POS** are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [10.3.1] — 2026-10-23

### Changed
- Bigger cash numpad to reduce mistyping: keys are 56px tall with 22px digits and 8px gaps.
- Larger quick-cash buttons; cart panel widened to 380px.
- Cart item list shrinks on short screens, and the cart panel scrolls instead of clipping.

## [10.3.0] — 2026-10-23

### Changed
- New minimal light theme in the AkihiroLabs palette: white background, charcoal text,
  navy `#1E3A8A` as the only accent. Removed the dark purple theme, gradients and blur.
- Replaced every emoji in the UI with [Lucide](https://lucide.dev) line icons, inlined as SVG
  (`icon()` helper in `js/ui.js`), so icons still work offline / from disk.
- Prices and totals now use charcoal text; CSV/PDF buttons are neutral.
- PDF report uses the navy palette and no longer has an emoji in the title.

### Added
- "Join our Discord" link in the footer.

## [10.2.0] — 2026-09-29

- New app logo in the AkihiroLabs family style (navy base, white symbol, orange accent): `app-icon.png`, `favicon.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`.
- Favicon and home-screen icon now use the new logo instead of `assets/icon.png`.

## [10.1.0] — 2026-09-28

### Changed
- Split the single-file `index.html` into separate files:
  `css/style.css`, `js/*.js` and `js/views/*.js`, linked from `index.html`.
- Version now lives in one place: `js/version.js` (`APP_VERSION`).
- Footer and PDF reports show the **AkihiroLabs** brand and the current version.
- New app icon (Byte 🦝) in `assets/icon.png`, used as favicon and home-screen icon.

### Added
- `README.md` and `CHANGELOG.md`.
- Repository renamed from `POS-SYTEM` to `akihirolabs-pos`.

### Notes
- No feature or behavior changes. The IndexedDB name (`pos_bar_v3`) is unchanged,
  so existing data in your browser keeps working.

## [10.0.0]

- Single-file release (`index.html`): staff PIN login, POS with cash numpad,
  size variants, customer tabs, happy hour, inventory with low-stock alerts,
  dashboard, reports, CSV / PDF export, JSON backup / restore, English / Burmese UI.
