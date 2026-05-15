# LocalMemo

LocalMemo is a lightweight notes and tasks app built with vanilla HTML, CSS, and JavaScript. Everything is stored locally in the browser, with optional private GitHub Gist sync for backup.

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

```
LocalMemo/
├── index.html
├── styles.css
├── app.js
├── github-sync.js
└── README.md
```

## Notes

- Markdown is supported in note content.
- Custom lists are created and managed through the list tabs interface.
- Each item tracks creation date and last updated date.
- Archived items and trash remain stored locally until restored or removed.
- Printing uses the browser dialog and reflects the current filtered view.

## License

Open source and free to use. Inspired by Google Keep and Google Tasks.
