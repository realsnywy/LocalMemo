// ============================================
// LocalMemo - App.js
// Aplicativo de Notas e Tarefas com CRUD
// ============================================

// ============================================
// Constantes
// ============================================
const STORAGE_KEY = 'localmemo_data';
const STORAGE_SETTINGS_KEY = 'localmemo_settings';
const STORAGE_VIEW_MODE_KEY = 'localmemo_view_mode';
const STORAGE_LISTS_KEY = 'localmemo_lists';
const COLORS = ['yellow', 'blue', 'pink', 'green', 'purple'];
const COLORS_DEFAULT = 'yellow';

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map(tag => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeMetadata(metadata = {}, fallback = {}) {
  return {
    pinned: Boolean(metadata.pinned ?? fallback.pinned),
    tags: normalizeTags(metadata.tags ?? fallback.tags),
    listName: String(metadata.listName ?? fallback.listName ?? '').trim(),
    reminderAt: String(metadata.reminderAt ?? fallback.reminderAt ?? '').trim(),
    archived: Boolean(metadata.archived ?? fallback.archived),
    trashed: Boolean(metadata.trashed ?? fallback.trashed),
  };
}

// ============================================
// Data Manager
// ============================================
class DataManager {
  constructor() {
    this.data = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : { notes: [], tasks: [] };
      // Ensure all items have createdAt (backwards compatibility)
      data.notes = (data.notes || []).map(note => ({
        ...note,
        createdAt: note.createdAt || new Date().toISOString(),
      }));
      data.tasks = (data.tasks || []).map(task => ({
        ...task,
        createdAt: task.createdAt || new Date().toISOString(),
      }));
      return data;
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return { notes: [], tasks: [] };
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('data-updated', { detail: this.data }));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }

  // Notas CRUD
  createNote(title, content, color = COLORS_DEFAULT, metadata = {}) {
    const itemMetadata = normalizeMetadata(metadata);
    const note = {
      id: Date.now().toString(),
      type: 'note',
      title: title.trim(),
      content: content.trim(),
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...itemMetadata,
    };
    this.data.notes.push(note);
    this.saveToStorage();
    return note;
  }

  updateNote(id, title, content, color, metadata = {}) {
    const note = this.data.notes.find(n => n.id === id);
    if (note) {
      note.title = title.trim();
      note.content = content.trim();
      note.color = color;
      Object.assign(note, normalizeMetadata(metadata, note));
      note.updatedAt = new Date().toISOString();
      // Ensure createdAt is preserved
      if (!note.createdAt) {
        note.createdAt = new Date().toISOString();
      }
      this.saveToStorage();
    }
    return note;
  }

  deleteNote(id) {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.data.notes.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getNoteById(id) {
    return this.data.notes.find(n => n.id === id);
  }

  duplicateNote(id) {
    const original = this.getNoteById(id);
    if (original) {
      return this.createNote(
        `${original.title} (Cópia)`,
        original.content,
        original.color,
        {
          pinned: original.pinned,
          tags: original.tags,
          listName: original.listName,
          reminderAt: original.reminderAt,
          archived: false,
          trashed: false,
        }
      );
    }
    return null;
  }

  // Tarefas CRUD
  createTask(title, items = [], metadata = {}) {
    const itemMetadata = normalizeMetadata(metadata);
    const task = {
      id: Date.now().toString(),
      type: 'task',
      title: title.trim(),
      items: items.map((item, idx) => ({
        id: `${Date.now()}_${idx}`,
        text: item.text || '',
        completed: item.completed || false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...itemMetadata,
    };
    this.data.tasks.push(task);
    this.saveToStorage();
    return task;
  }

  updateTask(id, title, items, metadata = {}) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.title = title.trim();
      task.items = items;
      Object.assign(task, normalizeMetadata(metadata, task));
      task.updatedAt = new Date().toISOString();
      // Ensure createdAt is preserved
      if (!task.createdAt) {
        task.createdAt = new Date().toISOString();
      }
      this.saveToStorage();
    }
    return task;
  }

  deleteTask(id) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.tasks.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  getTaskById(id) {
    return this.data.tasks.find(t => t.id === id);
  }

  duplicateTask(id) {
    const original = this.getTaskById(id);
    if (original) {
      return this.createTask(
        `${original.title} (Cópia)`,
        JSON.parse(JSON.stringify(original.items)),
        {
          pinned: original.pinned,
          tags: original.tags,
          listName: original.listName,
          reminderAt: original.reminderAt,
          archived: false,
          trashed: false,
        }
      );
    }
    return null;
  }

  // Geral
  getItemById(id, type) {
    return type === 'task' ? this.getTaskById(id) : this.getNoteById(id);
  }

  updateItemState(id, type, patch = {}) {
    const item = this.getItemById(id, type);
    if (!item) {
      return null;
    }

    Object.assign(item, patch, {
      updatedAt: new Date().toISOString(),
    });
    this.saveToStorage();
    return item;
  }

  togglePinned(id, type) {
    const item = this.getItemById(id, type);
    return this.updateItemState(id, type, {
      pinned: !Boolean(item?.pinned),
    });
  }

  toggleArchived(id, type) {
    const item = this.getItemById(id, type);
    return this.updateItemState(id, type, {
      archived: !Boolean(item?.archived),
      trashed: false,
    });
  }

  toggleTrash(id, type) {
    const item = this.getItemById(id, type);
    return this.updateItemState(id, type, {
      trashed: !Boolean(item?.trashed),
    });
  }

  getAllItems() {
    return [...this.data.notes, ...this.data.tasks].sort(
      (a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) {
          return Boolean(b.pinned) - Boolean(a.pinned);
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    );
  }

  deleteAllData() {
    this.data = { notes: [], tasks: [] };
    this.saveToStorage();
    // Also clear the lists storage when deleting all data
    localStorage.removeItem(STORAGE_LISTS_KEY);
  }

  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.notes && imported.tasks && Array.isArray(imported.notes) && Array.isArray(imported.tasks)) {
        this.data = imported;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

// ============================================
// UI Manager
// ============================================
class UIManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentEditingId = null;
    this.currentEditingType = null;
    this.currentFilter = 'all';
    this.currentList = 'All';
    this.currentViewMode = this.loadViewMode();
    this.searchQuery = '';
    this.dialogResolver = null;
    this.lists = this.loadLists();
    this.initializeElements();
    this.setupEventListeners();
    this.applyStaticTranslations();
    this.renderLists();
    this.initializeViewMode();
    this.render();
  }

  initializeViewMode() {
    this.viewModeBtns.forEach(btn => {
      if (btn.dataset.mode === this.currentViewMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  initializeElements() {
    // Buttons
    this.newNoteBtn = document.getElementById('new-note-btn');
    this.newTaskBtn = document.getElementById('new-task-btn');
    this.settingsBtn = document.getElementById('settings-btn');

    // Search e Filter
    this.searchInput = document.getElementById('search-input');
    this.filterBtns = document.querySelectorAll('.filter-btn');

    // Grid
    this.notesGrid = document.getElementById('notes-grid');

    // Modal - Settings
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsBtn = document.getElementById('close-settings-btn');
    this.closeModalBtn = document.getElementById('close-modal-btn');
    this.settingsOverlay = document.getElementById('modal-overlay');

    // Modal - Editor
    this.editorModal = document.getElementById('note-editor-modal');
    this.closeEditorBtn = document.getElementById('close-editor-btn');
    this.cancelEditorBtn = document.getElementById('cancel-editor-btn');
    this.saveEditorBtn = document.getElementById('save-editor-btn');
    this.editorOverlay = document.getElementById('note-editor-overlay');
    this.editorTitle = document.getElementById('editor-title');
    this.editorTabs = document.querySelectorAll('.editor-tab');

    // Editor - Note
    this.noteTitleInput = document.getElementById('note-title-input');
    this.noteContentInput = document.getElementById('note-content-input');
    this.itemListInput = document.getElementById('item-list-input');
    this.itemTagsInput = document.getElementById('item-tags-input');
    this.itemReminderInput = document.getElementById('item-reminder-input');
    this.editorMarkdownNote = document.getElementById('editor-markdown-note');

    // Editor - Task
    this.taskTitleInput = document.getElementById('task-title-input');
    this.taskItemsContainer = document.getElementById('task-items-container');
    this.addTaskItemBtn = document.getElementById('add-task-item-btn');

    // Settings
    this.githubPatInput = document.getElementById('github-pat-input');
    this.githubGistIdInput = document.getElementById('github-gist-id-input');
    this.testGithubBtn = document.getElementById('test-github-btn');
    this.syncNowBtn = document.getElementById('sync-now-btn');
    this.clearGithubBtn = document.getElementById('clear-github-btn');
    this.autoSyncToggle = document.getElementById('auto-sync-toggle');
    this.exportDataBtn = document.getElementById('export-data-btn');
    this.importDataBtn = document.getElementById('import-data-btn');
    this.importFileInput = document.getElementById('import-file-input');
    this.clearAllBtn = document.getElementById('clear-all-btn');
    this.githubStatus = document.getElementById('github-status');

    // Dialog
    this.dialogModal = document.getElementById('app-dialog-modal');
    this.dialogOverlay = document.getElementById('app-dialog-overlay');
    this.dialogTitle = document.getElementById('app-dialog-title');
    this.dialogMessage = document.getElementById('app-dialog-message');
    this.dialogCloseBtn = document.getElementById('app-dialog-close-btn');
    this.dialogCancelBtn = document.getElementById('app-dialog-cancel-btn');
    this.dialogConfirmBtn = document.getElementById('app-dialog-confirm-btn');

    // Context Menu
    this.contextMenu = document.getElementById('context-menu');

    // Lists & View Mode
    this.listsTabsContainer = document.getElementById('lists-tabs-container');
    this.listAddBtn = document.getElementById('list-add-btn');
    this.viewModeBtns = document.querySelectorAll('.view-mode-btn');

    // Create button
    this.createMainBtn = document.getElementById('create-main-btn');
    this.createBtnMenu = document.querySelector('.create-btn-menu');
  }

  setupEventListeners() {
    // Create button - toggle menu on click
    this.createMainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.createBtnMenu.classList.toggle('active');
    });

    // Create menu items - create and close menu
    this.newNoteBtn.addEventListener('click', () => {
      this.createBtnMenu.classList.remove('active');
      this.openEditorForNewNote();
    });
    this.newTaskBtn.addEventListener('click', () => {
      this.createBtnMenu.classList.remove('active');
      this.openEditorForNewTask();
    });

    this.settingsBtn.addEventListener('click', () => this.openSettings());

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.create-button-group')) {
        this.createBtnMenu.classList.remove('active');
      }
    });

    // Search and Filter
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.render();
    });

    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.createBtnMenu.classList.remove('active');
        this.filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
      });
    });

    // Language Selector
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.dataset.lang;
        i18n.setLanguage(lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Language change event
    window.addEventListener('language-changed', () => {
      this.applyStaticTranslations();
      this.updateContextMenuText();
      this.loadSettings();
      this.render();
    });

    // Settings Modal
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.closeModalBtn.addEventListener('click', () => this.closeSettings());
    this.settingsOverlay.addEventListener('click', () => this.closeSettings());

    // Settings Actions
    this.testGithubBtn.addEventListener('click', () => window.GitHubSync?.testConnection?.());
    this.syncNowBtn.addEventListener('click', () => window.GitHubSync?.syncNow?.());
    this.clearGithubBtn.addEventListener('click', () => this.clearGithubSettings());
    this.exportDataBtn.addEventListener('click', () => this.exportData());
    this.importDataBtn.addEventListener('click', () => this.importFileInput.click());
    this.importFileInput.addEventListener('change', (e) => this.importData(e));
    this.clearAllBtn.addEventListener('click', () => this.clearAllData());

    // Editor Modal
    this.closeEditorBtn.addEventListener('click', () => this.closeEditor());
    this.cancelEditorBtn.addEventListener('click', () => this.closeEditor());
    this.saveEditorBtn.addEventListener('click', () => this.saveItem());
    this.editorOverlay.addEventListener('click', () => this.closeEditor());

    // Dialog Modal
    this.dialogCloseBtn.addEventListener('click', () => this.closeDialog(false));
    this.dialogCancelBtn.addEventListener('click', () => this.closeDialog(false));
    this.dialogConfirmBtn.addEventListener('click', () => this.closeDialog(true));
    this.dialogOverlay.addEventListener('click', () => this.closeDialog(false));

    // Editor Tabs
    this.editorTabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.switchEditorTab(e.target.dataset.tab));
    });

    // Task Items
    this.addTaskItemBtn.addEventListener('click', () => this.addTaskItem());

    // Global events
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const card = e.target.closest('.note-card');
      if (card) {
        this.showContextMenu(e, card.dataset.id, card.dataset.type);
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.context-menu') && !e.target.closest('.note-menu-btn')) {
        this.contextMenu.classList.remove('active');
      }
    });

    // Data update event
    window.addEventListener('data-updated', () => this.render());

    // Settings toggle
    this.autoSyncToggle.addEventListener('change', (e) => {
      const settings = this.getSettings();
      settings.autoSync = e.target.checked;
      this.saveSettings(settings);
    });

    // View Mode Toggle
    this.viewModeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.viewModeBtns.forEach(b => b.classList.remove('active'));
        e.target.closest('.view-mode-btn').classList.add('active');
        this.currentViewMode = e.target.closest('.view-mode-btn').dataset.mode;
        this.saveViewMode();
        this.render();
      });
    });

    // List Add Button
    if (this.listAddBtn) {
      this.listAddBtn.addEventListener('click', () => this.addNewList());
    }

    // Load settings
    this.loadSettings();
  }

  // ============================================
  // List Management
  // ============================================
  loadLists() {
    try {
      const stored = localStorage.getItem(STORAGE_LISTS_KEY);
      return stored ? JSON.parse(stored) : ['All'];
    } catch (error) {
      return ['All'];
    }
  }

  saveLists() {
    localStorage.setItem(STORAGE_LISTS_KEY, JSON.stringify(this.lists));
  }

  addNewList() {
    this.showListDialog();
  }

  showListDialog(defaultValue = '') {
    return new Promise((resolve) => {
      const modal = this.dialogModal;
      const titleEl = document.getElementById('app-dialog-title');
      const messageEl = document.getElementById('app-dialog-message');
      const confirmBtn = document.getElementById('app-dialog-confirm-btn');
      const cancelBtn = document.getElementById('app-dialog-cancel-btn');
      const overlay = document.getElementById('app-dialog-overlay');

      // Create input field
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-input';
      input.placeholder = i18n.t('enterListName') || 'Enter list name:';
      input.value = defaultValue;
      input.style.marginBottom = '1rem';

      // Set up modal
      titleEl.textContent = i18n.t('enterListName') || 'Enter list name:';
      messageEl.innerHTML = '';
      messageEl.appendChild(input);

      // Focus input
      modal.classList.add('active');
      setTimeout(() => input.focus(), 100);

      const cleanup = () => {
        modal.classList.remove('active');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        overlay.removeEventListener('click', handleCancel);
        input.removeEventListener('keypress', handleKeypress);
      };

      const handleConfirm = () => {
        const value = input.value.trim();
        cleanup();
        if (value && !this.lists.includes(value)) {
          this.lists.push(value);
          this.saveLists();
          this.renderLists();
        }
        resolve(value);
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      const handleKeypress = (e) => {
        if (e.key === 'Enter') handleConfirm();
        if (e.key === 'Escape') handleCancel();
      };

      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
      overlay.addEventListener('click', handleCancel);
      input.addEventListener('keypress', handleKeypress);
    });
  }

  renderLists() {
    if (!this.listsTabsContainer) return;
    this.listsTabsContainer.innerHTML = '';
    this.lists.forEach(list => {
      const btn = document.createElement('button');
      btn.className = `list-tab ${list === this.currentList ? 'active' : ''}`;
      btn.dataset.list = list;

      // Create tab content with delete button for custom lists
      if (list === 'All') {
        btn.textContent = list;
        btn.addEventListener('click', () => this.selectList(list));
      } else {
        btn.innerHTML = `${list} <button class="list-delete-btn" data-list="${list}">×</button>`;
        btn.addEventListener('click', (e) => {
          if (!e.target.classList.contains('list-delete-btn')) {
            this.selectList(list);
          }
        });

        // Delete button listener
        const deleteBtn = btn.querySelector('.list-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteList(list);
        });
      }

      this.listsTabsContainer.appendChild(btn);
    });
  }

  selectList(listName) {
    this.currentList = listName;
    this.renderLists();
    this.render();
  }

  deleteList(listName) {
    if (listName === 'All') return; // Can't delete "All"

    const index = this.lists.indexOf(listName);
    if (index > -1) {
      this.lists.splice(index, 1);
      this.saveLists();

      // If the deleted list was selected, switch to "All"
      if (this.currentList === listName) {
        this.currentList = 'All';
      }

      this.renderLists();
      this.render();
    }
  }

  // ============================================
  // View Mode Management
  // ============================================
  loadViewMode() {
    try {
      const stored = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
      return stored || 'grid';
    } catch (error) {
      return 'grid';
    }
  }

  saveViewMode() {
    localStorage.setItem(STORAGE_VIEW_MODE_KEY, this.currentViewMode);
  }



  // ============================================
  // Settings Management
  // ============================================
  openSettings() {
    this.settingsModal.classList.add('active');
  }

  closeSettings() {
    this.settingsModal.classList.remove('active');
  }

  getSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        githubPat: '',
        githubGistId: '',
        autoSync: false,
      };
    } catch (error) {
      return { githubPat: '', githubGistId: '', autoSync: false };
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }

  loadSettings() {
    const settings = this.getSettings();
    this.githubPatInput.value = settings.githubPat || '';
    this.githubGistIdInput.value = settings.githubGistId || '';
    this.autoSyncToggle.checked = settings.autoSync || false;
  }

  applyStaticTranslations() {
    this.newNoteBtn.innerHTML = `<i class="bi bi-plus-circle"></i> ${i18n.t('newNote')}`;
    this.newTaskBtn.innerHTML = `<i class="bi bi-check2-circle"></i> ${i18n.t('newTask')}`;
    this.searchInput.placeholder = i18n.t('search');
    this.settingsBtn.title = i18n.t('settings');

    this.filterBtns.forEach(btn => {
      const filter = btn.dataset.filter;
      if (filter === 'all') {
        btn.textContent = i18n.t('all');
      } else if (filter === 'notes') {
        btn.textContent = i18n.t('notes');
      } else if (filter === 'tasks') {
        btn.textContent = i18n.t('tasks');
      } else if (filter === 'archived') {
        btn.textContent = i18n.t('archived');
      } else if (filter === 'trash') {
        btn.textContent = i18n.t('trash');
      }
    });

    document.getElementById('settings-title').textContent = i18n.t('settingsTitle');
    document.getElementById('github-sync-title').textContent = i18n.t('githubSync');
    document.getElementById('github-sync-desc').textContent = i18n.t('githubSyncDesc');
    document.getElementById('github-pat-label').textContent = i18n.t('githubPat');
    document.getElementById('github-pat-desc').textContent = i18n.t('githubPatDesc');
    document.getElementById('github-gist-id-label').textContent = i18n.t('gistId');
    document.getElementById('github-gist-id-desc').textContent = i18n.t('gistIdDesc');
    document.getElementById('general-title').textContent = i18n.t('general');
    document.getElementById('auto-sync-label-text').textContent = i18n.t('autoSync');
    document.getElementById('danger-zone-title').textContent = i18n.t('dangerZone');
    document.getElementById('danger-zone-desc').textContent = i18n.t('dangerZoneDesc');
    document.getElementById('item-list-label').textContent = i18n.t('itemList');
    document.getElementById('item-tags-label').textContent = i18n.t('itemTags');
    document.getElementById('item-reminder-label').textContent = i18n.t('itemReminder');
    document.getElementById('editor-markdown-note').textContent = i18n.t('markdownHint');
    this.itemListInput.placeholder = i18n.t('listPlaceholder');
    this.itemTagsInput.placeholder = i18n.t('tagsPlaceholder');
    this.itemReminderInput.placeholder = i18n.t('reminderPlaceholder');
    this.testGithubBtn.innerHTML = `<i class="bi bi-cloud-check"></i> ${i18n.t('testConnection')}`;
    this.syncNowBtn.innerHTML = `<i class="bi bi-arrow-repeat"></i> ${i18n.t('syncNow')}`;
    this.clearGithubBtn.innerHTML = `<i class="bi bi-trash"></i> ${i18n.t('clearSettings')}`;
    this.exportDataBtn.innerHTML = `<i class="bi bi-download"></i> ${i18n.t('exportData')}`;
    this.importDataBtn.innerHTML = `<i class="bi bi-upload"></i> ${i18n.t('importData')}`;
    this.clearAllBtn.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${i18n.t('deleteAllData')}`;
    this.closeModalBtn.textContent = i18n.t('close');
    if (this.currentEditingId) {
      this.editorTitle.textContent = this.currentEditingType === 'task' ? i18n.t('editTaskTitle') : i18n.t('editNoteTitle');
    } else {
      this.editorTitle.textContent = this.currentEditingType === 'task' ? i18n.t('newTaskTitle') : i18n.t('newNoteTitle');
    }
    this.editorTabs[0].textContent = i18n.t('noteTab');
    this.editorTabs[1].textContent = i18n.t('taskTab');
    this.noteTitleInput.placeholder = i18n.t('notePlaceholder');
    this.noteContentInput.placeholder = i18n.t('noteContentPlaceholder');
    this.taskTitleInput.placeholder = i18n.t('taskPlaceholder');
    this.addTaskItemBtn.innerHTML = `<i class="bi bi-plus"></i> ${i18n.t('addItem')}`;
    this.cancelEditorBtn.textContent = i18n.t('cancel');
    this.saveEditorBtn.textContent = i18n.t('save');
    this.dialogTitle.textContent = i18n.t('noticeTitle');
    this.dialogCancelBtn.textContent = i18n.t('cancel');
    this.dialogConfirmBtn.textContent = i18n.t('ok');
    this.updateLanguageSelector();
    this.updateContextMenuText();
  }

  updateLanguageSelector() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === i18n.getLanguage());
    });
  }

  getDateLocale() {
    return i18n.getLanguage() === 'pt' ? 'pt-BR' : 'en-US';
  }

  showNotice(message, title = i18n.t('noticeTitle')) {
    return this.showDialog({
      title,
      message,
      confirmText: i18n.t('ok'),
      cancelText: '',
      showCancel: false,
    });
  }

  showDialog({ title, message, confirmText, cancelText, showCancel = true }) {
    this.dialogTitle.textContent = title;
    this.dialogMessage.textContent = message;
    this.dialogConfirmBtn.textContent = confirmText;
    this.dialogCancelBtn.textContent = cancelText || i18n.t('cancel');
    this.dialogCancelBtn.style.display = showCancel ? 'inline-flex' : 'none';
    this.dialogModal.classList.add('active');

    return new Promise(resolve => {
      this.dialogResolver = resolve;
    });
  }

  closeDialog(result) {
    if (!this.dialogModal.classList.contains('active')) {
      return;
    }

    this.dialogModal.classList.remove('active');
    const resolver = this.dialogResolver;
    this.dialogResolver = null;
    if (resolver) {
      resolver(result);
    }
  }

  async clearGithubSettings() {
    const confirmed = await this.showDialog({
      title: i18n.t('confirmTitle'),
      message: i18n.t('clearGithubConfirm'),
      confirmText: i18n.t('confirm'),
      cancelText: i18n.t('cancel'),
      showCancel: true,
    });

    if (confirmed) {
      this.githubPatInput.value = '';
      this.githubGistIdInput.value = '';
      const settings = this.getSettings();
      settings.githubPat = '';
      settings.githubGistId = '';
      this.saveSettings(settings);
      this.showGithubStatus(i18n.t('githubSettingsCleared'), 'success');
    }
  }

  showGithubStatus(message, type = 'info') {
    this.githubStatus.textContent = message;
    this.githubStatus.className = `github-status ${type}`;
    if (type !== 'info') {
      setTimeout(() => {
        this.githubStatus.className = 'github-status';
      }, 5000);
    }
  }

  // ============================================
  // Data Export/Import
  // ============================================
  exportData() {
    const dataStr = this.dataManager.exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `localmemo-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = this.dataManager.importData(e.target.result);
        if (success) {
          this.showNotice(i18n.t('dataImported'));
          this.render();
        } else {
          this.showNotice(i18n.t('invalidFormat'));
        }
      } catch (error) {
        this.showNotice(`${i18n.t('importError')}: ${error.message}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  async clearAllData() {
    const firstConfirm = await this.showDialog({
      title: i18n.t('confirmTitle'),
      message: `⚠️ ${i18n.t('dangerZoneDesc')}\n\n${i18n.t('deleteAllConfirm')}`,
      confirmText: i18n.t('confirm'),
      cancelText: i18n.t('cancel'),
      showCancel: true,
    });

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = await this.showDialog({
      title: i18n.t('confirmTitle'),
      message: i18n.t('deleteAllFinal'),
      confirmText: i18n.t('confirm'),
      cancelText: i18n.t('cancel'),
      showCancel: true,
    });

    if (secondConfirm) {
      this.dataManager.deleteAllData();
      // Reset lists to just "All"
      this.lists = ['All'];
      this.currentList = 'All';
      this.renderLists();
      this.render();
      this.showNotice(i18n.t('dataDeleted'));
    }
  }

  // ============================================
  // Editor
  // ============================================
  openEditorForNewNote() {
    this.currentEditingId = null;
    this.currentEditingType = 'note';
    this.setEditorMode('note');
    this.resetEditorFields();
    this.editorTitle.textContent = i18n.t('newNoteTitle');
    this.editorModal.classList.add('active');
    setTimeout(() => this.noteTitleInput.focus(), 0);
  }

  openEditorForNewTask() {
    this.currentEditingId = null;
    this.currentEditingType = 'task';
    this.setEditorMode('task');
    this.resetEditorFields();
    this.addTaskItem();
    this.editorTitle.textContent = i18n.t('newTaskTitle');
    this.editorModal.classList.add('active');
    setTimeout(() => this.taskTitleInput.focus(), 0);
  }

  openEditorForEdit(id, type) {
    this.currentEditingId = id;
    this.currentEditingType = type;
    this.resetEditorFields();

    if (type === 'note') {
      const note = this.dataManager.getNoteById(id);
      this.setEditorMode('note');
      this.noteTitleInput.value = note.title;
      this.noteContentInput.value = note.content;
      this.populateEditorMetadata(note);
      this.editorTitle.textContent = i18n.t('editNoteTitle');
    } else if (type === 'task') {
      const task = this.dataManager.getTaskById(id);
      this.setEditorMode('task');
      this.taskTitleInput.value = task.title;
      this.taskItemsContainer.innerHTML = '';
      task.items.forEach(item => {
        const itemEl = this.createTaskItemElement(item.text, item.completed, item.id);
        this.taskItemsContainer.appendChild(itemEl);
      });
      this.populateEditorMetadata(task);
      this.editorTitle.textContent = i18n.t('editTaskTitle');
    }

    this.editorModal.classList.add('active');
    setTimeout(() => {
      if (type === 'note') this.noteTitleInput.focus();
      else this.taskTitleInput.focus();
    }, 0);
  }

  setEditorMode(mode) {
    document.querySelectorAll('.editor-tab').forEach(tab => {
      tab.hidden = tab.dataset.tab !== mode;
      tab.classList.toggle('active', tab.dataset.tab === mode);
    });

    document.querySelectorAll('.editor-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${mode}-tab`);
    });
  }

  resetEditorFields() {
    this.noteTitleInput.value = '';
    this.noteContentInput.value = '';
    this.taskTitleInput.value = '';
    this.taskItemsContainer.innerHTML = '';
    this.itemListInput.value = '';
    this.itemTagsInput.value = '';
    this.itemReminderInput.value = '';
  }

  populateEditorMetadata(item) {
    this.itemListInput.value = item.listName || '';
    this.itemTagsInput.value = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    this.itemReminderInput.value = item.reminderAt || '';
  }

  getEditorMetadata() {
    return {
      listName: this.itemListInput.value.trim(),
      tags: this.itemTagsInput.value,
      reminderAt: this.itemReminderInput.value,
    };
  }

  addTaskItem(text = '', completed = false) {
    const id = Date.now().toString();
    const itemEl = this.createTaskItemElement(text, completed, id);
    this.taskItemsContainer.appendChild(itemEl);
  }

  createTaskItemElement(text, completed, id) {
    const group = document.createElement('div');
    group.className = 'task-input-group';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-input';
    input.placeholder = i18n.t('taskItemPlaceholder');
    input.value = text;
    input.dataset.id = id;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', () => group.remove());

    group.appendChild(input);
    group.appendChild(deleteBtn);

    return group;
  }

  saveItem() {
    if (this.currentEditingType === 'note') {
      this.saveNote();
    } else if (this.currentEditingType === 'task') {
      this.saveTask();
    }
  }

  saveNote() {
    const title = this.noteTitleInput.value;
    const content = this.noteContentInput.value;
    const metadata = this.getEditorMetadata();

    if (!title && !content) {
      this.showNotice(i18n.t('emptyNoteWarning'));
      return;
    }

    if (this.currentEditingId) {
      this.dataManager.updateNote(this.currentEditingId, title, content, COLORS_DEFAULT, metadata);
    } else {
      this.dataManager.createNote(title, content, COLORS_DEFAULT, metadata);
    }

    this.closeEditor();
    this.render();
  }

  saveTask() {
    const title = this.taskTitleInput.value.trim();
    const metadata = this.getEditorMetadata();

    if (!title) {
      this.showNotice(i18n.t('emptyTaskTitle'));
      return;
    }

    const items = Array.from(this.taskItemsContainer.querySelectorAll('.task-input'))
      .map(input => ({
        id: input.dataset.id || Date.now().toString(),
        text: input.value.trim(),
        completed: false,
      }))
      .filter(item => item.text);

    if (this.currentEditingId) {
      this.dataManager.updateTask(this.currentEditingId, title, items, metadata);
    } else {
      this.dataManager.createTask(title, items, metadata);
    }

    this.closeEditor();
    this.render();
  }

  closeEditor() {
    this.editorModal.classList.remove('active');
    this.currentEditingId = null;
    this.currentEditingType = null;
  }

  // ============================================
  // Context Menu
  // ============================================
  showContextMenu(event, id, type) {
    const item = this.dataManager.getItemById(id, type);
    this.contextMenu.dataset.id = id;
    this.contextMenu.dataset.type = type;
    this.contextMenu.style.top = event.clientY + 'px';
    this.contextMenu.style.left = event.clientX + 'px';
    this.updateContextMenuText(item);
    this.contextMenu.classList.add('active');

    // Remove event listener se já existir
    const existingButtons = Array.from(this.contextMenu.querySelectorAll('.context-menu-item'));
    existingButtons.forEach(btn => {
      btn.removeEventListener('click', this.contextMenuHandler);
    });

    // Add event listeners
    this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => this.handleContextMenuAction(e.target.closest('[data-action]').dataset.action, id, type));
    });
  }

  handleContextMenuAction(action, id, type) {
    this.contextMenu.classList.remove('active');

    if (action === 'edit') {
      this.openEditorForEdit(id, type);
    } else if (action === 'duplicate') {
      if (type === 'note') {
        this.dataManager.duplicateNote(id);
      } else if (type === 'task') {
        this.dataManager.duplicateTask(id);
      }
      this.render();
    } else if (action === 'pin') {
      this.dataManager.togglePinned(id, type);
      this.render();
    } else if (action === 'archive') {
      this.dataManager.toggleArchived(id, type);
      this.render();
    } else if (action === 'unarchive') {
      this.dataManager.toggleArchived(id, type);
      this.render();
    } else if (action === 'trash') {
      this.dataManager.toggleTrash(id, type);
      this.render();
    } else if (action === 'restore') {
      this.dataManager.toggleTrash(id, type);
      this.render();
    } else if (action === 'print') {
      window.print();
    } else if (action === 'delete') {
      this.showDialog({
        title: i18n.t('confirmTitle'),
        message: i18n.t('deleteConfirm'),
        confirmText: i18n.t('confirm'),
        cancelText: i18n.t('cancel'),
        showCancel: true,
      }).then(confirmed => {
        if (!confirmed) {
          return;
        }
        if (type === 'note') {
          this.dataManager.deleteNote(id);
        } else if (type === 'task') {
          this.dataManager.deleteTask(id);
        }
        this.render();
      });
    }
  }

  // ============================================
  // Rendering
  // ============================================
  render() {
    const items = this.getFilteredItems();

    if (items.length === 0) {
      this.notesGrid.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>${i18n.t('emptyState')}</p>
        </div>
      `;
      this.notesGrid.className = `notes-container view-${this.currentViewMode}`;
      return;
    }

    this.notesGrid.innerHTML = items.map(item => this.renderItem(item)).join('');
    this.notesGrid.className = `notes-container view-${this.currentViewMode}`;

    // Add event listeners to menu buttons
    document.querySelectorAll('.note-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.note-card');
        this.showContextMenu(e, card.dataset.id, card.dataset.type);
      });
    });

    // Add event listeners to color pickers
    document.querySelectorAll('.color-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = e.target.closest('.note-card');
        const color = e.target.dataset.color;
        this.updateNoteColor(card.dataset.id, color);
      });
    });

    // Add event listeners to task checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const card = e.target.closest('.note-card');
        const taskId = e.target.dataset.taskId;
        this.toggleTaskItem(card.dataset.id, taskId);
      });
    });

    // Add event listeners to card action buttons
    document.querySelectorAll('.note-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.note-card');
        const id = card.dataset.id;
        const type = card.dataset.type;
        const action = btn.dataset.action;

        if (action === 'pin') {
          this.dataManager.togglePinned(id, type);
          this.render();
        } else if (action === 'archive') {
          this.dataManager.toggleArchived(id, type);
          this.render();
        } else if (action === 'trash') {
          this.dataManager.toggleTrash(id, type);
          this.render();
        } else if (action === 'delete') {
          this.showDialog({
            title: i18n.t('confirmTitle'),
            message: i18n.t('deleteConfirm'),
            confirmText: i18n.t('confirm'),
            cancelText: i18n.t('cancel'),
            showCancel: true,
          }).then(confirmed => {
            if (confirmed) {
              if (type === 'note') {
                this.dataManager.deleteNote(id);
              } else if (type === 'task') {
                this.dataManager.deleteTask(id);
              }
              this.render();
            }
          });
        }
      });
    });
  }

  updateContextMenuText(item = null) {
    document.querySelectorAll('.context-menu-item').forEach(btn => {
      const action = btn.dataset.action;
      let icon = '';
      let label = i18n.t(action);

      if (action === 'edit') {
        icon = '<i class="bi bi-pencil"></i>';
      } else if (action === 'duplicate') {
        icon = '<i class="bi bi-files"></i>';
      } else if (action === 'unarchive') {
        icon = '<i class="bi bi-arrow-counterclockwise"></i>';
      } else if (action === 'restore') {
        icon = '<i class="bi bi-arrow-counterclockwise"></i>';
      } else if (action === 'print') {
        icon = '<i class="bi bi-printer"></i>';
      }

      btn.innerHTML = `${icon} ${label}`;

      // Show/hide based on item state
      if (item) {
        if (action === 'unarchive') {
          btn.style.display = item.archived && !item.trashed ? 'flex' : 'none';
        } else if (action === 'restore') {
          btn.style.display = item.trashed ? 'flex' : 'none';
        } else if (action === 'edit') {
          btn.style.display = !item.archived && !item.trashed ? 'flex' : 'none';
        } else if (action === 'duplicate') {
          btn.style.display = !item.trashed ? 'flex' : 'none';
        }
      }
    });
  }

  switchEditorTab(tab) {
    this.setEditorMode(tab);
  }

  getFilteredItems() {
    let items = this.dataManager.getAllItems();

    // Filter by type
    if (this.currentFilter === 'notes') {
      items = items.filter(item => item.type === 'note');
    } else if (this.currentFilter === 'tasks') {
      items = items.filter(item => item.type === 'task');
    } else if (this.currentFilter === 'archived') {
      items = items.filter(item => item.archived && !item.trashed);
    } else if (this.currentFilter === 'trash') {
      items = items.filter(item => item.trashed);
    } else {
      items = items.filter(item => !item.archived && !item.trashed);
    }

    // Filter by list (if not "All")
    if (this.currentList !== 'All') {
      items = items.filter(item => item.listName === this.currentList);
    }

    // Filter by search query
    if (this.searchQuery) {
      items = items.filter(item => {
        const searchableText = [
          item.title,
          item.content || '',
          Array.isArray(item.tags) ? item.tags.join(' ') : '',
          item.listName || '',
          item.reminderAt || '',
        ].join(' ').toLowerCase();
        return searchableText.includes(this.searchQuery);
      });
    }

    return items;
  }

  renderItem(item) {
    if (item.type === 'note') {
      return this.renderNoteCard(item);
    } else if (item.type === 'task') {
      return this.renderTaskCard(item);
    }
    return '';
  }

  renderNoteCard(note) {
    const date = new Date(note.updatedAt);
    const dateStr = date.toLocaleDateString(this.getDateLocale(), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const colorOptions = COLORS.map(color => `
      <div class="color-option color-${color}${note.color === color ? ' active' : ''}" data-color="${color}"></div>
    `).join('');

    const badges = this.renderItemBadges(note);
    const content = note.content ? this.renderMarkdown(note.content) : '';

    return `
      <div class="note-card color-${note.color}${note.pinned ? ' is-pinned' : ''}${note.archived ? ' is-archived' : ''}${note.trashed ? ' is-trashed' : ''}" data-id="${note.id}" data-type="note">
        <div class="note-card-header">
          <h3 class="note-title">${this.escapeHtml(note.title || i18n.t('noTitle'))}</h3>
          <div class="note-card-buttons">
            ${!note.archived && !note.trashed ? `
              <button class="note-card-btn pin-btn" title="${note.pinned ? i18n.t('unpin') : i18n.t('pin')}" data-action="pin">
                <i class="bi bi-pin-angle${note.pinned ? '-fill' : ''}"></i>
              </button>
              <button class="note-card-btn archive-btn" title="${i18n.t('archive')}" data-action="archive">
                <i class="bi bi-archive"></i>
              </button>
            ` : ''}
            ${note.trashed ? `
              <button class="note-card-btn delete-btn" title="${i18n.t('delete')}" data-action="delete">
                <i class="bi bi-trash-fill"></i>
              </button>
            ` : `
              <button class="note-card-btn trash-btn" title="${i18n.t('trash')}" data-action="trash">
                <i class="bi bi-trash"></i>
              </button>
            `}
            <button class="note-menu-btn" title="${i18n.t('menu')}">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
          </div>
        </div>
        <div class="note-content markdown-content">${content}</div>
        ${badges}
        <span class="note-type-tag">
          <i class="bi bi-file-text"></i> ${i18n.t('noteTypeTag')}
        </span>
        <div class="note-footer">
          <div class="note-date">
            <i class="bi bi-calendar-event"></i>
            <span>${dateStr}</span>
          </div>
          <div class="color-picker">
            ${colorOptions}
          </div>
        </div>
      </div>
    `;
  }

  renderTaskCard(task) {
    const completedCount = task.items.filter(i => i.completed).length;
    const totalCount = task.items.length;
    const date = new Date(task.updatedAt);
    const dateStr = date.toLocaleDateString(this.getDateLocale(), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const taskItems = task.items.map(item => `
      <div class="task-item ${item.completed ? 'completed' : ''}">
        <input type="checkbox" class="task-checkbox" data-task-id="${item.id}" ${item.completed ? 'checked' : ''}>
        <span class="task-item-text">${this.escapeHtml(item.text)}</span>
      </div>
    `).join('');

    const badges = this.renderItemBadges(task);

    return `
      <div class="note-card${task.pinned ? ' is-pinned' : ''}${task.archived ? ' is-archived' : ''}${task.trashed ? ' is-trashed' : ''}" data-id="${task.id}" data-type="task">
        <div class="note-card-header">
          <h3 class="note-title">${this.escapeHtml(task.title)}</h3>
          <div class="note-card-buttons">
            ${!task.archived && !task.trashed ? `
              <button class="note-card-btn pin-btn" title="${task.pinned ? i18n.t('unpin') : i18n.t('pin')}" data-action="pin">
                <i class="bi bi-pin-angle${task.pinned ? '-fill' : ''}"></i>
              </button>
              <button class="note-card-btn archive-btn" title="${i18n.t('archive')}" data-action="archive">
                <i class="bi bi-archive"></i>
              </button>
            ` : ''}
            ${task.trashed ? `
              <button class="note-card-btn delete-btn" title="${i18n.t('delete')}" data-action="delete">
                <i class="bi bi-trash-fill"></i>
              </button>
            ` : `
              <button class="note-card-btn trash-btn" title="${i18n.t('trash')}" data-action="trash">
                <i class="bi bi-trash"></i>
              </button>
            `}
            <button class="note-menu-btn" title="${i18n.t('menu')}">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
          </div>
        </div>
        <div class="task-list">
          ${taskItems}
        </div>
        ${badges}
        <span class="note-type-tag">
          <i class="bi bi-check2-circle"></i> ${i18n.t('taskTypeTag')} (${completedCount}/${totalCount})
        </span>
        <div class="note-footer">
          <div class="note-date">
            <i class="bi bi-calendar-event"></i>
            <span>${dateStr}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderItemBadges(item) {
    const badges = [];

    if (item.pinned) {
      badges.push(`<span class="note-badge note-badge-pin"><i class="bi bi-pin-angle-fill"></i> ${i18n.t('pinnedTag')}</span>`);
    }

    if (item.archived) {
      badges.push(`<span class="note-badge note-badge-archive"><i class="bi bi-archive"></i> ${i18n.t('archivedTag')}</span>`);
    }

    if (item.trashed) {
      badges.push(`<span class="note-badge note-badge-trash"><i class="bi bi-trash"></i> ${i18n.t('trashedTag')}</span>`);
    }

    if (item.listName) {
      badges.push(`<span class="note-badge note-badge-list"><i class="bi bi-collection"></i> ${this.escapeHtml(item.listName)}</span>`);
    }

    if (Array.isArray(item.tags) && item.tags.length > 0) {
      item.tags.forEach(tag => {
        badges.push(`<span class="note-badge note-badge-tag">#${this.escapeHtml(tag)}</span>`);
      });
    }

    if (item.reminderAt) {
      const reminderDate = new Date(item.reminderAt);
      const isDue = !Number.isNaN(reminderDate.getTime()) && reminderDate.getTime() <= Date.now();
      badges.push(
        `<span class="note-badge note-badge-reminder${isDue ? ' is-due' : ''}"><i class="bi bi-bell"></i> ${this.escapeHtml(this.formatReminderDate(reminderDate))}</span>`
      );
    }

    return badges.length ? `<div class="note-badges">${badges.join('')}</div>` : '';
  }

  formatReminderDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return i18n.t('reminderTag');
    }

    return date.toLocaleString(this.getDateLocale(), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  renderMarkdown(text) {
    const lines = String(text || '').split(/\r?\n/);
    const blocks = [];
    let listItems = [];

    const flushList = () => {
      if (listItems.length) {
        blocks.push(`<ul>${listItems.join('')}</ul>`);
        listItems = [];
      }
    };

    const formatInline = (value) => value
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    lines.forEach(rawLine => {
      const line = this.escapeHtml(rawLine.trim());

      if (!line) {
        flushList();
        return;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        flushList();
        const level = headingMatch[1].length + 1;
        blocks.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
        return;
      }

      if (/^[-*]\s+/.test(line)) {
        listItems.push(`<li>${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`);
        return;
      }

      flushList();
      blocks.push(`<p>${formatInline(line)}</p>`);
    });

    flushList();

    return blocks.join('');
  }

  updateNoteColor(id, color) {
    const note = this.dataManager.getNoteById(id);
    if (note) {
      note.color = color;
      note.updatedAt = new Date().toISOString();
      this.dataManager.saveToStorage();
      this.render();
    }
  }

  toggleTaskItem(taskId, itemId) {
    const task = this.dataManager.getTaskById(taskId);
    if (task) {
      const item = task.items.find(i => i.id === itemId);
      if (item) {
        item.completed = !item.completed;
        task.updatedAt = new Date().toISOString();
        this.dataManager.saveToStorage();
        this.render();
      }
    }
  }

  escapeHtml(text) {
    const source = String(text ?? '');
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return source.replace(/[&<>"']/g, m => map[m]);
  }
}

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const dataManager = new DataManager();
  const uiManager = new UIManager(dataManager);

  // Expose to global scope for GitHub sync
  window.LocalMemoApp = {
    dataManager,
    uiManager,
  };

  console.log('LocalMemo inicializado com sucesso!');
});
