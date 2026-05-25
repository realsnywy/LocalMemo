# LocalMemo

LocalMemo is a lightweight notes and tasks app built with vanilla HTML, CSS, and JavaScript. Everything is stored locally in the browser, with optional private GitHub Gist sync for backup.

## Highlights

- Notes and tasks with colors, tags, reminders, pinning, archive, and trash.
- Custom lists for organizing and filtering your items.
- Markdown editing with live preview and rich toolbar.
- Multiple view modes (grid/list) and advanced search/filters.
- Private GitHub Gist sync for backup and restore.
- Browser notifications for reminders.
- Multi-language support (English, Portuguese, Spanish).
- Dark mode and responsive design.

## Quick Start

1. Open `index.html` in a modern browser.
2. Click the **+** button (bottom right) to create a note or task.
3. Use list tabs at the top to organize items into custom lists, or create new ones.
4. Toggle between grid and list view modes using the buttons in the search bar.
5. Open Settings for export/import or GitHub sync.

## Data Storage

- Notes, tasks, and metadata are saved in `localStorage`.
- Settings and language preference are also stored locally.
- Export/import uses JSON files for backups and migration.

## GitHub Sync

- Create a private GitHub Personal Access Token with `gist` permission.
- Paste the token and optional Gist ID in Settings.
- Use Sync Now to create or update the backup.
- Automatic sync can run every 5 minutes when enabled.

## Building for Desktop

LocalMemo is also available as a native Windows desktop app built with [Tauri](https://tauri.app).

### Prerequisites

- Node.js 18+ and npm
- Rust 1.77+ (for Tauri builds)

### Development

```bash
npm install
npm run dev          # Run dev server with Tauri window
```

### Release Build

```bash
npm run clean        # Clean build artifacts
npm install
npm run icons:generate  # (Optional) Regenerate icons from SVG
npm run build        # Build production-optimized Windows installers
```

Installers will be in `src-tauri/target/release/bundle/`:

- **LocalMemo_1.0.0_x64.msi** - MSI installer
- **LocalMemo_1.0.0_x64-setup.exe** - NSIS installer

## Project Files

- Node.js 18+ and npm
- Rust 1.77+ (for Tauri builds)

### Development

```bash
npm install
npm run dev          # Run dev server with Tauri window
```

### Release Build

```bash
npm run clean        # Clean build artifacts
npm install
npm run icons:generate  # (Optional) Regenerate icons from SVG
npm run build        # Build production-optimized Windows installers
```

Installers will be in `src-tauri/target/release/bundle/`:

- **LocalMemo_1.0.0_x64.msi** - MSI installer
- **LocalMemo_1.0.0_x64-setup.exe** - NSIS installer

## Project Files

Current layout (not exhaustive):

```
LocalMemo/
├── index.html                # app entry and markup
├── styles.css                # global styles
├── github-sync.js            # optional GitHub Gist sync
├── i18n.js                   # translations and language switching
├── modules/                  # ES module sources
│   ├── constants.js          # shared constants (storage keys, colors)
│   ├── models.js             # model helpers (normalization, markdown)
│   ├── storage.js            # DataManager (load/save, CRUD)
│   ├── ui-manager.js         # UIManager (rendering, events, UI logic)
│   └── ui.js                 # bootstrap and app initialization
└── README.md
```

## Notes

- Markdown is supported in note content; there is a live preview in the editor.
- Custom lists are created and managed through the list tabs interface.
- Each item tracks creation date and last updated date.
- Archived items and trash remain stored locally until restored or removed.
- Printing uses the browser dialog and reflects the current filtered view.

### Contributing

- Open an issue or submit a PR.
- `window.LocalMemoApp` is exposed for compatibility with `github-sync.js`; maintain this interface if modifying the bootstrap.

## License

Open source and free to use. Inspired by Google Keep and Google Tasks.
