# Changelog

All notable changes to **AkihiroLabs POS** are documented here.
This project follows [Semantic Versioning](https://semver.org/).

## [10.5.0] — 2026-10-23

### Added
- **Inventory role** for stock staff. Inventory users only see the Inventory screen and can change
  stock counts and alert levels (per size, too). Name, category, price and sizes are read-only for
  them, and they can't add or delete products.
- Role permissions:

  | | Admin | Cashier | Inventory |
  |---|---|---|---|
  | Sell, tabs | ✓ | ✓ | – |
  | See stock | ✓ | ✓ | ✓ |
  | Edit stock counts | ✓ | – | ✓ |
  | Edit name / price / sizes, add or delete products | ✓ | – | – |
  | Reports, staff, settings | ✓ | – | – |

### Changed
- Inventory stock column is now **read-only** (−/+ buttons removed). Stock changes only through
  **Edit** or sales. Low counts show in orange, sold out in red.

## [10.4.0] — 2026-10-23

### Added
- **Stock per size (variants).** Each size now has its own price, stock count and low-stock
  alert, like Square / Shopify / Loyverse variants.
  - Product form: each size row is *Size · Price · Stock · Alert at*.
  - POS size picker shows how many of each size are left; sold-out sizes are greyed out.
  - The cart can't go over the stock of a size; checkout and tabs deduct from the exact size sold.
  - Inventory shows one −/+ row per size. Low-stock alerts are per size (e.g. "Yoma Beer (M)").
  - A product's total stock is the sum of its sizes.

### Migration
- Existing products with sizes start every size at **0** and show a **Set counts** notice in
  Inventory — count what you have and enter it per size (like a real POS stock count).
  Old sales, tabs and backups keep working; restored backups are migrated the same way.

## [10.3.3] — 2026-10-23

### Fixed
- **Quick-cash buttons:** no more three "Exact" buttons on an empty cart, and no duplicate amounts (e.g. 34,000 twice).
- **Stock limits:** the cart can no longer hold more of a product than is in stock (all sizes counted together).
- **Double payment:** tapping Confirm Payment / Charge & Close twice quickly no longer records the sale twice.
- **Tabs:** items added to a tab are saved automatically when you leave POS or log out, instead of being lost.
- **Dates:** report date filters, the "Today" button and the backup file name now use local time
  (before, early-morning sales could land on the wrong day).
- **Delete safety:** deleting a product, staff member or tab now asks for confirmation.
- **Staff:** PINs must be exactly 4 digits; you can't delete your own account or remove the last admin.
- **Restore:** asks before replacing data, rejects invalid files, now also restores tabs, works when
  picking the same file twice, and signs everyone out afterwards.
- **Happy hour:** discount is clamped to 0–50%, and invalid start/end times no longer break pricing.
- **Times:** tab and PDF times show correctly (e.g. "5:03 PM" was cut to "5:03:").
- **Low stock:** out-of-stock items now appear in the dashboard Low Stock list.
- **Translations:** remaining English-only text (happy-hour banner, inventory, tabs, reports, settings,
  login, messages) now switches to Burmese; the chosen language is remembered after reload.
- PDF report escapes product/staff names; the dashboard stacks to one column on phones;
  empty product category is saved as "Other"; Enter opens a new tab.

## [10.3.2] — 2026-10-23

### Fixed
- Switching from POS to another screen no longer makes the navigation jump. The top bar is
  now rendered once in `app.js`, full width, above every view (it used to sit inside the
  POS product column only, and wrapped to two lines on tablets).
- Footer now also shows on the Dashboard.

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
