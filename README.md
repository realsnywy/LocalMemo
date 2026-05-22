# LocalMemo

LocalMemo is a lightweight notes and tasks app built with vanilla HTML, CSS, and JavaScript. Everything is stored locally in the browser, with optional private GitHub Gist sync for backup.
Recent work has modularized core logic into ES modules under `src/` while keeping a legacy `app.js` bootstrap for compatibility.

## Highlights

- Markdown notes with colors, tags, custom lists, reminders, pinning, archive, and trash.
- Task lists with progress tracking and the same metadata support.
- Floating action button to quickly create notes or tasks.
- Custom lists for organizing notes and tasks (create, delete, filter).
- Grid and list view modes for different viewing preferences.
- Search and filters for active items, archived items, and trash.
- Tracks creation and update dates for all items.
- Private GitHub Gist backup and restore.
- Responsive layout with system light/dark support.
- Printing support for the current filtered view.
- Multi-language support (English, Portuguese, Spanish) and language selector.
- Note banners (image URL or local upload) and improved live Markdown preview.
- Richer editor toolbar with headings (H1/H2/H3), bold/italic, code and lists.
- Browser notifications for reminders and in-page scheduling.
- Drag-and-drop manual reordering and sort controls (Custom/Name/Date + direction).

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

## Project Files

Current layout (not exhaustive):

```
LocalMemo/
├── index.html                # app entry and markup
├── styles.css                # global styles
├── app.js                    # legacy bootstrap (still in use for now)
├── github-sync.js            # optional GitHub Gist sync
├── i18n.js                   # translations and language switching
├── src/                      # ES module sources (new)
│   ├── models.js             # model helpers (normalization, markdown)
│   ├── storage.js            # DataManager (load/save, CRUD)
│   └── ui.js                 # UI bridge / module (migration in progress)
└── README.md
```

## Notes

- Markdown is supported in note content; there is a live preview in the editor.
- Custom lists are created and managed through the list tabs interface.
- Each item tracks creation date and last updated date.
- Archived items and trash remain stored locally until restored or removed.
- Printing uses the browser dialog and reflects the current filtered view.

### Development notes

- The codebase is being modernized to ES modules under `src/`. The legacy `app.js` still contains the full `UIManager` and bootstraps the app; `src/ui.js` currently provides a bridge and a non-destructive migration path. After the UI module is fully migrated, `app.js` can be removed and `src/ui.js` used as the primary entrypoint (`<script type="module" src="src/ui.js"></script>`).
- Per-list custom ordering is a requested feature; manual drag/drop ordering is implemented globally and can be extended to persist per-list order.

### Contributing

- Open an issue or submit a PR. If you work on the UI migration, preserve `window.LocalMemoApp` for compatibility with `github-sync.js` unless you update the sync code too.

## License

Open source and free to use. Inspired by Google Keep and Google Tasks.
