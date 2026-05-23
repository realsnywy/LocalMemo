// modules/ui-manager.js - UI runtime

import {
	STORAGE_SETTINGS_KEY,
	STORAGE_VIEW_MODE_KEY,
	STORAGE_LISTS_KEY,
	COLORS,
	COLORS_DEFAULT,
} from './constants.js';

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
		this.reminderTimers = new Map();
		this.reminderNotificationState = this.loadReminderNotificationState();
		this.initializeElements();
		this.setupEventListeners();
		this.applyStaticTranslations();
		this.renderLists();
		this.initializeViewMode();
		this.render();
		this.scheduleReminderNotifications();
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
		this.newNoteBtn = document.getElementById('new-note-btn');
		this.newTaskBtn = document.getElementById('new-task-btn');
		this.settingsBtn = document.getElementById('settings-btn');
		this.searchInput = document.getElementById('search-input');
		this.filterBtns = document.querySelectorAll('.filter-btn');
		this.notesGrid = document.getElementById('notes-grid');
		this.settingsModal = document.getElementById('settings-modal');
		this.closeSettingsBtn = document.getElementById('close-settings-btn');
		this.closeModalBtn = document.getElementById('close-modal-btn');
		this.settingsOverlay = document.getElementById('modal-overlay');
		this.editorModal = document.getElementById('note-editor-modal');
		this.closeEditorBtn = document.getElementById('close-editor-btn');
		this.cancelEditorBtn = document.getElementById('cancel-editor-btn');
		this.saveEditorBtn = document.getElementById('save-editor-btn');
		this.editorOverlay = document.getElementById('note-editor-overlay');
		this.editorTitle = document.getElementById('editor-title');
		this.editorTabs = document.querySelectorAll('.editor-tab');
		this.noteTitleInput = document.getElementById('note-title-input');
		this.noteContentInput = document.getElementById('note-content-input');
		this.notePreviewLabel = document.getElementById('note-preview-label');
		this.noteContentPreview = document.getElementById('note-content-preview');
		this.noteBoldBtn = document.getElementById('note-bold-btn');
		this.noteItalicBtn = document.getElementById('note-italic-btn');
		this.noteHeadingH1Btn = document.getElementById('note-heading-h1-btn');
		this.noteHeadingH2Btn = document.getElementById('note-heading-h2-btn');
		this.noteHeadingH3Btn = document.getElementById('note-heading-h3-btn');
		this.noteListBtn = document.getElementById('note-list-btn');
		this.noteCodeBtn = document.getElementById('note-code-btn');
		this.itemListInput = document.getElementById('item-list-input');
		this.itemTagsInput = document.getElementById('item-tags-input');
		this.itemReminderInput = document.getElementById('item-reminder-input');
		this.noteBannerUrlInput = document.getElementById('note-banner-url-input');
		this.noteBannerFileInput = document.getElementById('note-banner-file-input');
		this.noteBannerPreviewImage = document.getElementById('banner-preview-image');
		this.noteBannerPreviewEmpty = document.getElementById('banner-preview-empty');
		this.noteBannerLabel = document.getElementById('note-banner-label');
		this.noteBannerUploadLabel = document.getElementById('note-banner-upload-label');
		this.clearBannerBtn = document.getElementById('clear-banner-btn');
		this.clearBannerLabel = document.getElementById('clear-banner-label');
		this.bannerPreviewLabel = document.getElementById('banner-preview-label');
		this.editorMarkdownNote = document.getElementById('editor-markdown-note');
		this.taskTitleInput = document.getElementById('task-title-input');
		this.taskItemsContainer = document.getElementById('task-items-container');
		this.addTaskItemBtn = document.getElementById('add-task-item-btn');
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
		this.dialogModal = document.getElementById('app-dialog-modal');
		this.dialogOverlay = document.getElementById('app-dialog-overlay');
		this.dialogTitle = document.getElementById('app-dialog-title');
		this.dialogMessage = document.getElementById('app-dialog-message');
		this.dialogCloseBtn = document.getElementById('app-dialog-close-btn');
		this.dialogCancelBtn = document.getElementById('app-dialog-cancel-btn');
		this.dialogConfirmBtn = document.getElementById('app-dialog-confirm-btn');
		this.contextMenu = document.getElementById('context-menu');
		this.listsTabsContainer = document.getElementById('lists-tabs-container');
		this.listAddBtn = document.getElementById('list-add-btn');
		this.viewModeBtns = document.querySelectorAll('.view-mode-btn');
		this.sortSelect = document.getElementById('sort-select');
		this.sortDirectionBtn = document.getElementById('sort-direction-btn');
		this.createMainBtn = document.getElementById('create-main-btn');
		this.createBtnMenu = document.querySelector('.create-btn-menu');
	}

	setupEventListeners() {
		this.createMainBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			this.createBtnMenu.classList.toggle('active');
		});

		this.newNoteBtn.addEventListener('click', () => {
			this.createBtnMenu.classList.remove('active');
			this.openEditorForNewNote();
		});
		this.newTaskBtn.addEventListener('click', () => {
			this.createBtnMenu.classList.remove('active');
			this.openEditorForNewTask();
		});

		this.settingsBtn.addEventListener('click', () => this.openSettings());

		document.addEventListener('click', (e) => {
			if (!e.target.closest('.create-button-group')) {
				this.createBtnMenu.classList.remove('active');
			}
		});

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

		document.querySelectorAll('.lang-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const lang = e.target.dataset.lang;
				i18n.setLanguage(lang);
				document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
				e.target.classList.add('active');
			});
		});

		window.addEventListener('language-changed', () => {
			this.applyStaticTranslations();
			this.updateContextMenuText();
			this.loadSettings();
			this.render();
		});

		this.settingsBtn.addEventListener('click', () => this.openSettings());
		this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
		this.closeModalBtn.addEventListener('click', () => this.closeSettings());
		this.settingsOverlay.addEventListener('click', () => this.closeSettings());

		this.testGithubBtn.addEventListener('click', () => window.GitHubSync?.testConnection?.());
		this.syncNowBtn.addEventListener('click', () => window.GitHubSync?.syncNow?.());
		this.clearGithubBtn.addEventListener('click', () => this.clearGithubSettings());
		this.exportDataBtn.addEventListener('click', () => this.exportData());
		this.importDataBtn.addEventListener('click', () => this.importFileInput.click());
		this.importFileInput.addEventListener('change', (e) => this.importData(e));
		this.clearAllBtn.addEventListener('click', () => this.clearAllData());

		this.closeEditorBtn.addEventListener('click', () => this.closeEditor());
		this.cancelEditorBtn.addEventListener('click', () => this.closeEditor());
		this.saveEditorBtn.addEventListener('click', () => this.saveItem());
		this.editorOverlay.addEventListener('click', () => this.closeEditor());

		this.dialogCloseBtn.addEventListener('click', () => this.closeDialog(false));
		this.dialogCancelBtn.addEventListener('click', () => this.closeDialog(false));
		this.dialogConfirmBtn.addEventListener('click', () => this.closeDialog(true));
		this.dialogOverlay.addEventListener('click', () => this.closeDialog(false));

		this.editorTabs.forEach(tab => {
			tab.addEventListener('click', (e) => this.switchEditorTab(e.target.dataset.tab));
		});

		this.noteContentInput?.addEventListener('input', () => this.updateNotePreview());

		const toolbarBindings = [
			[this.noteBoldBtn, 'bold'],
			[this.noteItalicBtn, 'italic'],
			[this.noteHeadingH1Btn, 'heading'],
			[this.noteHeadingH2Btn, 'heading2'],
			[this.noteHeadingH3Btn, 'heading3'],
			[this.noteListBtn, 'bulletList'],
			[this.noteCodeBtn, 'code'],
		];

		toolbarBindings.forEach(([button, action]) => {
			button?.addEventListener('click', () => this.applyMarkdownAction(action));
		});

		this.noteBannerUrlInput?.addEventListener('input', () => {
			this.updateBannerPreview(this.noteBannerUrlInput.value.trim());
		});

		this.noteBannerFileInput?.addEventListener('change', (e) => this.handleBannerFileSelect(e));
		this.clearBannerBtn?.addEventListener('click', () => this.clearBanner());

		this.addTaskItemBtn.addEventListener('click', () => this.addTaskItem());

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

		window.addEventListener('data-updated', () => {
			this.render();
			this.scheduleReminderNotifications();
		});

		this.autoSyncToggle.addEventListener('change', (e) => {
			const settings = this.getSettings();
			settings.autoSync = e.target.checked;
			this.saveSettings(settings);
		});

		this.viewModeBtns.forEach(btn => {
			btn.addEventListener('click', (e) => {
				this.viewModeBtns.forEach(b => b.classList.remove('active'));
				e.target.closest('.view-mode-btn').classList.add('active');
				this.currentViewMode = e.target.closest('.view-mode-btn').dataset.mode;
				this.saveViewMode();
				this.render();
			});
		});

		if (this.sortSelect) {
			this.sortSelect.addEventListener('change', (e) => {
				const settings = this.getSettings();
				settings.sortMode = e.target.value;
				this.saveSettings(settings);
				this.render();
			});
		}

		if (this.sortDirectionBtn) {
			this.sortDirectionBtn.addEventListener('click', (e) => {
				const settings = this.getSettings();
				settings.sortAsc = !Boolean(settings.sortAsc);
				this.saveSettings(settings);
				const icon = this.sortDirectionBtn.querySelector('i');
				if (icon) {
					icon.classList.toggle('bi-arrow-up', settings.sortAsc);
					icon.classList.toggle('bi-arrow-down', !settings.sortAsc);
				}
				this.sortDirectionBtn.title = settings.sortAsc ? 'Ascending' : 'Descending';
				this.render();
			});
		}

		if (this.listAddBtn) {
			this.listAddBtn.addEventListener('click', () => this.addNewList());
		}

		this.loadSettings();
	}

	loadReminderNotificationState() {
		try {
			const stored = localStorage.getItem('localmemo_reminder_notifications');
			return stored ? JSON.parse(stored) : {};
		} catch (error) {
			return {};
		}
	}

	saveReminderNotificationState() {
		localStorage.setItem('localmemo_reminder_notifications', JSON.stringify(this.reminderNotificationState));
	}

	getReminderNotificationKey(item) {
		return `${item.type}:${item.id}:${item.reminderAt}`;
	}

	clearReminderTimers() {
		this.reminderTimers.forEach(timerId => window.clearTimeout(timerId));
		this.reminderTimers.clear();
	}

	async ensureNotificationPermission() {
		if (!('Notification' in window)) {
			return false;
		}

		if (Notification.permission === 'granted') {
			return true;
		}

		if (Notification.permission === 'denied') {
			return false;
		}

		try {
			return await Notification.requestPermission() === 'granted';
		} catch (error) {
			return false;
		}
	}

	scheduleReminderNotifications() {
		this.clearReminderTimers();

		const activeKeys = new Set();
		const items = this.dataManager.getAllItems();

		items.forEach(item => {
			if (!item.reminderAt) {
				return;
			}

			const reminderDate = new Date(item.reminderAt);
			const reminderTime = reminderDate.getTime();
			if (Number.isNaN(reminderTime)) {
				return;
			}

			const key = this.getReminderNotificationKey(item);
			activeKeys.add(key);

			if (this.reminderNotificationState[key]) {
				return;
			}

			const delay = reminderTime - Date.now();
			if (delay <= 0) {
				this.fireReminderNotification(item);
				return;
			}

			const timerId = window.setTimeout(() => {
				this.fireReminderNotification(item);
			}, delay);

			this.reminderTimers.set(key, timerId);
		});

		const nextState = {};
		Object.entries(this.reminderNotificationState).forEach(([key, value]) => {
			if (activeKeys.has(key)) {
				nextState[key] = value;
			}
		});

		const hasStateChanged = JSON.stringify(nextState) !== JSON.stringify(this.reminderNotificationState);
		if (hasStateChanged) {
			this.reminderNotificationState = nextState;
			this.saveReminderNotificationState();
		}
	}

	fireReminderNotification(item) {
		if (!item.reminderAt) {
			return;
		}

		const key = this.getReminderNotificationKey(item);
		if (this.reminderNotificationState[key]) {
			return;
		}

		if (!('Notification' in window) || Notification.permission === 'denied') {
			return;
		}

		const title = item.title?.trim() || i18n.t('noTitle');
		const message = `${i18n.t('reminderNotificationBody')}: ${title}`;
		const notification = new Notification(i18n.t('reminderNotificationTitle'), {
			body: message,
			icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%2360a5fa" d="M12 2a7 7 0 0 0-7 7v4.2L3.4 15.8a1 1 0 0 0 .9 1.2h15.4a1 1 0 0 0 .9-1.2L19 13.2V9a7 7 0 0 0-7-7zm0 20a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22z"/></svg>',
			tag: key,
		});

		notification.onclick = () => {
			window.focus();
			notification.close();
		};

		this.reminderNotificationState[key] = new Date().toISOString();
		this.saveReminderNotificationState();
	}

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

			const input = document.createElement('input');
			input.type = 'text';
			input.className = 'form-input';
			input.placeholder = i18n.t('enterListName') || 'Enter list name:';
			input.value = defaultValue;
			input.style.marginBottom = '1rem';

			titleEl.textContent = i18n.t('enterListName') || 'Enter list name:';
			messageEl.innerHTML = '';
			messageEl.appendChild(input);

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
		if (listName === 'All') return;

		const index = this.lists.indexOf(listName);
		if (index > -1) {
			this.lists.splice(index, 1);
			this.saveLists();

			if (this.currentList === listName) {
				this.currentList = 'All';
			}

			this.renderLists();
			this.render();
		}
	}

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

	openSettings() { this.settingsModal.classList.add('active'); }
	closeSettings() { this.settingsModal.classList.remove('active'); }

	getSettings() {
		try {
			const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
			return stored ? JSON.parse(stored) : {
				githubPat: '', githubGistId: '', autoSync: false, sortMode: 'custom', sortAsc: false,
			};
		} catch (error) {
			return { githubPat: '', githubGistId: '', autoSync: false, sortMode: 'custom', sortAsc: false };
		}
	}

	saveSettings(settings) { localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings)); }

	loadSettings() {
		const settings = this.getSettings();
		this.githubPatInput.value = settings.githubPat || '';
		this.githubGistIdInput.value = settings.githubGistId || '';
		this.autoSyncToggle.checked = settings.autoSync || false;
		if (this.sortSelect) this.sortSelect.value = settings.sortMode || 'custom';
		if (this.sortDirectionBtn) {
			this.sortDirectionBtn.dataset.asc = settings.sortAsc ? '1' : '0';
			this.sortDirectionBtn.title = settings.sortAsc ? 'Ascending' : 'Descending';
			this.sortDirectionBtn.querySelector('i')?.classList.toggle('bi-arrow-up', settings.sortAsc);
			this.sortDirectionBtn.querySelector('i')?.classList.toggle('bi-arrow-down', !settings.sortAsc);
		}
	}

	applyStaticTranslations() {
		this.newNoteBtn.innerHTML = `<i class="bi bi-plus-circle"></i> ${i18n.t('newNote')}`;
		this.newTaskBtn.innerHTML = `<i class="bi bi-check2-circle"></i> ${i18n.t('newTask')}`;
		this.searchInput.placeholder = i18n.t('search');
		this.settingsBtn.title = i18n.t('settings');

		this.filterBtns.forEach(btn => {
			const filter = btn.dataset.filter;
			if (filter === 'all') btn.textContent = i18n.t('all');
			else if (filter === 'notes') btn.textContent = i18n.t('notes');
			else if (filter === 'tasks') btn.textContent = i18n.t('tasks');
			else if (filter === 'archived') btn.textContent = i18n.t('archived');
			else if (filter === 'trash') btn.textContent = i18n.t('trash');
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
		if (this.noteBannerLabel) this.noteBannerLabel.textContent = i18n.t('bannerImage');
		if (this.noteBannerUrlInput) this.noteBannerUrlInput.placeholder = i18n.t('bannerUrl');
		if (this.noteBannerUploadLabel) this.noteBannerUploadLabel.textContent = i18n.t('bannerUpload');
		if (this.clearBannerLabel) this.clearBannerLabel.textContent = i18n.t('clearBanner');
		if (this.bannerPreviewLabel) this.bannerPreviewLabel.textContent = i18n.t('bannerPreview');
		if (this.noteBannerPreviewEmpty) this.noteBannerPreviewEmpty.textContent = i18n.t('noBannerSelected');
		if (this.notePreviewLabel) this.notePreviewLabel.textContent = i18n.t('livePreview');
		if (this.noteBoldBtn) this.noteBoldBtn.title = i18n.t('bold');
		if (this.noteItalicBtn) this.noteItalicBtn.title = i18n.t('italic');
		if (this.noteHeadingH1Btn) this.noteHeadingH1Btn.title = i18n.t('heading1');
		if (this.noteHeadingH2Btn) this.noteHeadingH2Btn.title = i18n.t('heading2');
		if (this.noteHeadingH3Btn) this.noteHeadingH3Btn.title = i18n.t('heading3');
		if (this.noteListBtn) this.noteListBtn.title = i18n.t('bulletList');
		if (this.noteCodeBtn) this.noteCodeBtn.title = i18n.t('code');
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
		this.editorTitle.textContent = this.currentEditingType === 'task' ? i18n.t('newTaskTitle') : i18n.t('newNoteTitle');
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
		const language = i18n.getLanguage();
		if (language === 'pt') return 'pt-BR';
		if (language === 'es') return 'es-ES';
		return 'en-US';
	}

	parseSearchQuery(rawQuery = '') {
		const out = { terms: [], tags: [], lists: [], typeFilter: null, pinnedFilter: null, archivedFilter: null, trashedFilter: null, titleTerms: [], contentTerms: [] };
		const q = String(rawQuery || '').trim();
		if (!q) return out;
		const tokenRe = /(\b[\w-]+):("[^"]+"|\S+)/g;
		let remainder = q;
		let m;
		while ((m = tokenRe.exec(q)) !== null) {
			const key = m[1].toLowerCase();
			let val = m[2];
			if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
			val = String(val).toLowerCase();
			remainder = remainder.replace(m[0], '');
			if (key === 'tag' || key === 'tags') out.tags.push(val);
			else if (key === 'list' || key === 'in') out.lists.push(val);
			else if (key === 'type') out.typeFilter = val;
			else if (key === 'pinned') out.pinnedFilter = (val === 'true' || val === '1' || val === 'yes');
			else if (key === 'archived') out.archivedFilter = (val === 'true' || val === '1' || val === 'yes');
			else if (key === 'trashed') out.trashedFilter = (val === 'true' || val === '1' || val === 'yes');
			else if (key === 'title') out.titleTerms.push(val);
			else if (key === 'content') out.contentTerms.push(val);
			else out.terms.push((key + ':' + val).toLowerCase());
		}
		const words = remainder.trim().split(/\s+/).map(s => s.trim()).filter(Boolean).map(s => s.toLowerCase());
		out.terms = out.terms.concat(words);
		return out;
	}

	showNotice(message, title = i18n.t('noticeTitle')) { return this.showDialog({ title, message, confirmText: i18n.t('ok'), cancelText: '', showCancel: false }); }

	showDialog({ title, message, confirmText, cancelText, showCancel = true }) {
		this.dialogTitle.textContent = title;
		this.dialogMessage.textContent = message;
		this.dialogConfirmBtn.textContent = confirmText;
		this.dialogCancelBtn.textContent = cancelText || i18n.t('cancel');
		this.dialogCancelBtn.style.display = showCancel ? 'inline-flex' : 'none';
		this.dialogModal.classList.add('active');
		return new Promise(resolve => { this.dialogResolver = resolve; });
	}

	closeDialog(result) {
		if (!this.dialogModal.classList.contains('active')) return;
		this.dialogModal.classList.remove('active');
		const resolver = this.dialogResolver;
		this.dialogResolver = null;
		if (resolver) resolver(result);
	}

	async clearGithubSettings() {
		const confirmed = await this.showDialog({ title: i18n.t('confirmTitle'), message: i18n.t('clearGithubConfirm'), confirmText: i18n.t('confirm'), cancelText: i18n.t('cancel'), showCancel: true });
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
			setTimeout(() => { this.githubStatus.className = 'github-status'; }, 5000);
		}
	}

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
		const firstConfirm = await this.showDialog({ title: i18n.t('confirmTitle'), message: `⚠️ ${i18n.t('dangerZoneDesc')}\n\n${i18n.t('deleteAllConfirm')}`, confirmText: i18n.t('confirm'), cancelText: i18n.t('cancel'), showCancel: true });
		if (!firstConfirm) return;
		const secondConfirm = await this.showDialog({ title: i18n.t('confirmTitle'), message: i18n.t('deleteAllFinal'), confirmText: i18n.t('confirm'), cancelText: i18n.t('cancel'), showCancel: true });
		if (secondConfirm) {
			this.dataManager.deleteAllData();
			this.lists = ['All'];
			this.currentList = 'All';
			this.renderLists();
			this.render();
			this.showNotice(i18n.t('dataDeleted'));
		}
	}

	openEditorForNewNote() {
		this.currentEditingId = null;
		this.currentEditingType = 'note';
		this.setEditorMode('note');
		this.resetEditorFields();
		this.editorTitle.textContent = i18n.t('newNoteTitle');
		this.editorModal.classList.add('active');
		setTimeout(() => this.noteTitleInput.focus(), 0);
		this.updateNotePreview();
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
			this.updateNotePreview();
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
		setTimeout(() => { if (type === 'note') this.noteTitleInput.focus(); else this.taskTitleInput.focus(); }, 0);
	}

	setEditorMode(mode) {
		document.querySelectorAll('.editor-tab').forEach(tab => {
			tab.hidden = tab.dataset.tab !== mode;
			tab.classList.toggle('active', tab.dataset.tab === mode);
		});
		if (this.noteBannerSection) this.noteBannerSection.hidden = mode !== 'note';
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
		this.clearBanner();
		this.updateNotePreview();
	}

	populateEditorMetadata(item) {
		this.itemListInput.value = item.listName || '';
		this.itemTagsInput.value = Array.isArray(item.tags) ? item.tags.join(', ') : '';
		this.itemReminderInput.value = item.reminderAt || '';
		const bannerUrl = item.bannerUrl || item.banner?.src || '';
		this.noteBannerUrlInput.value = bannerUrl;
		this.updateBannerPreview(bannerUrl);
	}

	getEditorMetadata() {
		return {
			listName: this.itemListInput.value.trim(),
			tags: this.itemTagsInput.value,
			reminderAt: this.itemReminderInput.value,
			bannerUrl: this.noteBannerUrlInput.value.trim(),
		};
	}

	handleBannerFileSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			event.target.value = '';
			this.showNotice(i18n.t('invalidFormat'));
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const bannerUrl = String(reader.result || '');
			this.noteBannerUrlInput.value = bannerUrl;
			this.updateBannerPreview(bannerUrl);
		};
		reader.readAsDataURL(file);
		event.target.value = '';
	}

	updateBannerPreview(bannerUrl) {
		if (!this.noteBannerPreviewImage || !this.noteBannerPreviewEmpty) return;
		if (bannerUrl) {
			this.noteBannerPreviewImage.src = bannerUrl;
			this.noteBannerPreviewImage.hidden = false;
			this.noteBannerPreviewEmpty.hidden = true;
			document.getElementById('banner-preview')?.classList.add('has-image');
		} else {
			this.noteBannerPreviewImage.removeAttribute('src');
			this.noteBannerPreviewImage.hidden = true;
			this.noteBannerPreviewEmpty.hidden = false;
			document.getElementById('banner-preview')?.classList.remove('has-image');
		}
	}

	clearBanner() {
		if (this.noteBannerUrlInput) this.noteBannerUrlInput.value = '';
		if (this.noteBannerFileInput) this.noteBannerFileInput.value = '';
		this.updateBannerPreview('');
	}

	updateNotePreview() {
		if (!this.noteContentPreview) return;
		const content = this.noteContentInput.value.trim();
		this.noteContentPreview.innerHTML = content ? this.renderMarkdown(content) : `<p class="note-content-empty">${this.escapeHtml(i18n.t('previewEmpty'))}</p>`;
	}

	applyMarkdownAction(action) {
		const input = this.noteContentInput;
		if (!input) return;
		const start = input.selectionStart ?? 0;
		const end = input.selectionEnd ?? 0;
		const value = input.value;
		const selectedText = value.slice(start, end);
		const replaceSelection = (replacement, selectionStart, selectionEnd) => {
			input.value = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
			input.focus();
			input.setSelectionRange(selectionStart, selectionEnd);
			this.updateNotePreview();
		};
		const wrapSelection = (prefix, suffix = prefix) => {
			const replacement = selectedText || '';
			if (selectedText) {
				const wrapped = `${prefix}${replacement}${suffix}`;
				replaceSelection(wrapped, start + prefix.length, start + prefix.length + replacement.length);
			} else {
				const insertion = `${prefix}${suffix}`;
				replaceSelection(insertion, start + prefix.length, start + prefix.length);
			}
		};
		const prefixLines = (prefix) => {
			if (!selectedText) {
				replaceSelection(prefix, start + prefix.length, start + prefix.length);
				return;
			}
			const lines = selectedText.split(/\r?\n/).map(line => `${prefix}${line}`);
			const replacement = lines.join('\n');
			replaceSelection(replacement, start, start + replacement.length);
		};
		switch (action) {
			case 'bold': wrapSelection('**'); break;
			case 'italic': wrapSelection('*'); break;
			case 'heading2': prefixLines('## '); break;
			case 'heading3': prefixLines('### '); break;
			case 'heading': prefixLines('# '); break;
			case 'bulletList': prefixLines('- '); break;
			case 'code': wrapSelection('`'); break;
			default: break;
		}
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

	async saveItem() { if (this.currentEditingType === 'note') await this.saveNote(); else if (this.currentEditingType === 'task') await this.saveTask(); }

	async saveNote() {
		const title = this.noteTitleInput.value;
		const content = this.noteContentInput.value;
		const metadata = this.getEditorMetadata();
		const previousNote = this.currentEditingId ? this.dataManager.getNoteById(this.currentEditingId) : null;
		const previousListName = previousNote?.listName || '';
		const targetListName = metadata.listName || this.currentList || 'All';
		if (metadata.reminderAt) await this.ensureNotificationPermission();
		if (!title && !content && !metadata.bannerUrl) { this.showNotice(i18n.t('emptyNoteWarning')); return; }
		if (this.currentEditingId) this.dataManager.updateNote(this.currentEditingId, title, content, COLORS_DEFAULT, metadata);
		else { const createdNote = this.dataManager.createNote(title, content, COLORS_DEFAULT, metadata); this.syncItemOrderByList(createdNote, targetListName, { append: true }); }
		if (previousNote) this.syncItemOrderByList(previousNote, targetListName, { append: previousListName !== targetListName });
		this.closeEditor(); this.render(); this.scheduleReminderNotifications();
	}

	async saveTask() {
		const title = this.taskTitleInput.value.trim();
		const metadata = this.getEditorMetadata();
		const previousTask = this.currentEditingId ? this.dataManager.getTaskById(this.currentEditingId) : null;
		const previousListName = previousTask?.listName || '';
		const targetListName = metadata.listName || this.currentList || 'All';
		if (metadata.reminderAt) await this.ensureNotificationPermission();
		if (!title) { this.showNotice(i18n.t('emptyTaskTitle')); return; }
		const items = Array.from(this.taskItemsContainer.querySelectorAll('.task-input')).map(input => ({ id: input.dataset.id || Date.now().toString(), text: input.value.trim(), completed: false })).filter(item => item.text);
		if (!items || items.length === 0) { this.showNotice(i18n.t('emptyTaskItemsWarning')); return; }
		if (this.currentEditingId) this.dataManager.updateTask(this.currentEditingId, title, items, metadata);
		else { const createdTask = this.dataManager.createTask(title, items, metadata); this.syncItemOrderByList(createdTask, targetListName, { append: true }); }
		if (previousTask) this.syncItemOrderByList(previousTask, targetListName, { append: previousListName !== targetListName });
		this.closeEditor(); this.render(); this.scheduleReminderNotifications();
	}

	syncItemOrderByList(item, listName, options = {}) {
		if (!item) return;
		const scopedListName = String(listName || 'All').trim() || 'All';
		const append = Boolean(options.append);
		if (!item.orderByList || typeof item.orderByList !== 'object') item.orderByList = {};
		if (!Number.isFinite(Number(item.orderByList[scopedListName]))) {
			item.orderByList[scopedListName] = append ? this.getNextListOrderValue(scopedListName) : this.getFallbackListOrderValue(item, scopedListName);
			this.dataManager.saveToStorage();
		}
	}

	getFallbackListOrderValue(item, listName) {
		const fallback = Number(item?.order);
		if (Number.isFinite(fallback) && fallback > 0) return fallback;
		return this.getNextListOrderValue(listName);
	}

	getNextListOrderValue(listName) {
		const scopedListName = String(listName || 'All').trim() || 'All';
		const sourceItems = this.dataManager.getAllItems().filter(item => scopedListName === 'All' || String(item.listName || '').trim() === scopedListName);
		const orders = sourceItems.map(item => Number(item.orderByList?.[scopedListName] ?? item.order)).filter(value => Number.isFinite(value));
		return orders.length ? Math.max(...orders) + 1 : 1;
	}

	closeEditor() { this.editorModal.classList.remove('active'); this.currentEditingId = null; this.currentEditingType = null; }

	showContextMenu(event, id, type) {
		const item = this.dataManager.getItemById(id, type);
		this.contextMenu.dataset.id = id;
		this.contextMenu.dataset.type = type;
		this.contextMenu.style.top = event.clientY + 'px';
		this.contextMenu.style.left = event.clientX + 'px';
		this.updateContextMenuText(item);
		this.contextMenu.classList.add('active');
		const existingButtons = Array.from(this.contextMenu.querySelectorAll('.context-menu-item'));
		existingButtons.forEach(btn => btn.removeEventListener('click', this.contextMenuHandler));
		this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
			item.addEventListener('click', (e) => this.handleContextMenuAction(e.target.closest('[data-action]').dataset.action, id, type));
		});
	}

	handleContextMenuAction(action, id, type) {
		this.contextMenu.classList.remove('active');
		if (action === 'edit') this.openEditorForEdit(id, type);
		else if (action === 'duplicate') { if (type === 'note') this.dataManager.duplicateNote(id); else if (type === 'task') this.dataManager.duplicateTask(id); this.render(); }
		else if (action === 'pin') { this.dataManager.togglePinned(id, type); this.render(); }
		else if (action === 'archive') { this.dataManager.toggleArchived(id, type); this.render(); }
		else if (action === 'unarchive') { this.dataManager.toggleArchived(id, type); this.render(); }
		else if (action === 'trash') { this.dataManager.toggleTrash(id, type); this.render(); }
		else if (action === 'restore') { this.dataManager.toggleTrash(id, type); this.render(); }
		else if (action === 'print') { window.print(); }
		else if (action === 'delete') {
			this.showDialog({ title: i18n.t('confirmTitle'), message: i18n.t('deleteConfirm'), confirmText: i18n.t('confirm'), cancelText: i18n.t('cancel'), showCancel: true }).then(confirmed => {
				if (!confirmed) return;
				if (type === 'note') this.dataManager.deleteNote(id); else if (type === 'task') this.dataManager.deleteTask(id);
				this.render();
			});
		}
	}

	render() {
		const items = this.getFilteredItems();
		if (items.length === 0) {
			this.notesGrid.innerHTML = `<div class="empty-state"><i class="bi bi-inbox"></i><p>${i18n.t('emptyState')}</p></div>`;
			this.notesGrid.className = `notes-container view-${this.currentViewMode}`;
			return;
		}
		this.notesGrid.innerHTML = items.map(item => this.renderItem(item)).join('');
		this.notesGrid.className = `notes-container view-${this.currentViewMode}`;
		this.notesGrid.querySelectorAll('.note-card').forEach(card => {
			card.setAttribute('draggable', 'true');
			card.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
			card.addEventListener('dragover', (e) => this.handleDragOver(e, card));
			card.addEventListener('drop', (e) => this.handleDrop(e, card));
			card.addEventListener('dragend', () => this.clearDragState());
		});
		document.querySelectorAll('.note-menu-btn').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); const card = btn.closest('.note-card'); this.showContextMenu(e, card.dataset.id, card.dataset.type); }); });
		document.querySelectorAll('.color-option').forEach(option => { option.addEventListener('click', (e) => { e.stopPropagation(); const card = e.target.closest('.note-card'); const color = e.target.dataset.color; this.updateNoteColor(card.dataset.id, color); }); });
		document.querySelectorAll('.task-checkbox').forEach(checkbox => { checkbox.addEventListener('change', (e) => { const card = e.target.closest('.note-card'); const taskId = e.target.dataset.taskId; this.toggleTaskItem(card.dataset.id, taskId); }); });
		document.querySelectorAll('.note-card-btn').forEach(btn => { btn.addEventListener('click', (e) => { e.stopPropagation(); const card = btn.closest('.note-card'); const id = card.dataset.id; const type = card.dataset.type; const action = btn.dataset.action; if (action === 'pin') { this.dataManager.togglePinned(id, type); this.render(); } else if (action === 'archive') { this.dataManager.toggleArchived(id, type); this.render(); } else if (action === 'trash') { this.dataManager.toggleTrash(id, type); this.render(); } else if (action === 'delete') { this.showDialog({ title: i18n.t('confirmTitle'), message: i18n.t('deleteConfirm'), confirmText: i18n.t('confirm'), cancelText: i18n.t('cancel'), showCancel: true }).then(confirmed => { if (confirmed) { if (type === 'note') this.dataManager.deleteNote(id); else if (type === 'task') this.dataManager.deleteTask(id); this.render(); } }); } }); });
	}

	updateContextMenuText(item = null) {
		document.querySelectorAll('.context-menu-item').forEach(btn => {
			const action = btn.dataset.action;
			let icon = '';
			let label = i18n.t(action);
			if (action === 'edit') icon = '<i class="bi bi-pencil"></i>';
			else if (action === 'duplicate') icon = '<i class="bi bi-files"></i>';
			else if (action === 'unarchive') icon = '<i class="bi bi-arrow-counterclockwise"></i>';
			else if (action === 'restore') icon = '<i class="bi bi-arrow-counterclockwise"></i>';
			else if (action === 'print') icon = '<i class="bi bi-printer"></i>';
			btn.innerHTML = `${icon} ${label}`;
			if (item) {
				if (action === 'unarchive') btn.style.display = item.archived && !item.trashed ? 'flex' : 'none';
				else if (action === 'restore') btn.style.display = item.trashed ? 'flex' : 'none';
				else if (action === 'edit') btn.style.display = !item.archived && !item.trashed ? 'flex' : 'none';
				else if (action === 'duplicate') btn.style.display = !item.trashed ? 'flex' : 'none';
			}
		});
	}

	switchEditorTab(tab) { this.setEditorMode(tab); }

	getFilteredItems() {
		let items = this.dataManager.getAllItems();
		if (this.currentFilter === 'notes') items = items.filter(item => item.type === 'note');
		else if (this.currentFilter === 'tasks') items = items.filter(item => item.type === 'task');
		else if (this.currentFilter === 'archived') items = items.filter(item => item.archived && !item.trashed);
		else if (this.currentFilter === 'trash') items = items.filter(item => item.trashed);
		else items = items.filter(item => !item.archived && !item.trashed);
		if (this.currentList !== 'All') items = items.filter(item => item.listName === this.currentList);
		if (this.searchQuery) {
			const parsed = this.parseSearchQuery(this.searchQuery);
			if (parsed.typeFilter) items = items.filter(i => i.type === parsed.typeFilter);
			if (parsed.lists.length) items = items.filter(i => parsed.lists.includes(String(i.listName || '').toLowerCase()));
			if (parsed.tags.length) items = items.filter(i => { const itemTags = Array.isArray(i.tags) ? i.tags.map(t => String(t).toLowerCase()) : []; return parsed.tags.every(t => itemTags.includes(t)); });
			if (parsed.pinnedFilter !== null) items = items.filter(i => Boolean(i.pinned) === parsed.pinnedFilter);
			if (parsed.archivedFilter !== null) items = items.filter(i => Boolean(i.archived) === parsed.archivedFilter);
			if (parsed.trashedFilter !== null) items = items.filter(i => Boolean(i.trashed) === parsed.trashedFilter);
			if (parsed.titleTerms.length) items = items.filter(i => parsed.titleTerms.some(t => String(i.title || '').toLowerCase().includes(t)));
			if (parsed.contentTerms.length) items = items.filter(i => parsed.contentTerms.some(t => String(i.content || '').toLowerCase().includes(t)));
			if (parsed.terms.length) {
				items = items.filter(item => {
					const searchableText = [item.title, item.content || '', Array.isArray(item.tags) ? item.tags.join(' ') : '', item.listName || '', item.reminderAt || ''].join(' ').toLowerCase();
					return parsed.terms.every(term => searchableText.includes(term));
				});
			}
		}
		items = this.applySorting(items);
		return items;
	}

	applySorting(items) {
		try {
			const settings = this.getSettings();
			const mode = settings.sortMode || 'custom';
			const asc = Boolean(settings.sortAsc);
			const listKey = this.currentList || 'All';
			const pinned = items.filter(i => i.pinned);
			const normal = items.filter(i => !i.pinned);
			const getListOrderValue = (item) => {
				const scopedOrder = item.orderByList?.[listKey];
				if (Number.isFinite(Number(scopedOrder))) return Number(scopedOrder);
				const fallbackOrder = Number(item.order);
				if (Number.isFinite(fallbackOrder)) return fallbackOrder;
				return null;
			};
			const comparator = (a, b) => {
				if (mode === 'name') {
					const an = String(a.title || '').toLowerCase();
					const bn = String(b.title || '').toLowerCase();
					return an.localeCompare(bn) * (asc ? 1 : -1);
				}
				if (mode === 'date') {
					const ad = new Date(a.updatedAt).getTime() || 0;
					const bd = new Date(b.updatedAt).getTime() || 0;
					return (ad - bd) * (asc ? 1 : -1);
				}
				const ao = getListOrderValue(a);
				const bo = getListOrderValue(b);
				if (ao !== null && bo !== null) return (ao - bo) * (asc ? 1 : -1);
				const aT = new Date(a.updatedAt).getTime() || 0;
				const bT = new Date(b.updatedAt).getTime() || 0;
				return (aT - bT) * (asc ? 1 : -1);
			};
			pinned.sort(comparator);
			normal.sort(comparator);
			return [...pinned, ...normal];
		} catch (error) {
			return items;
		}
	}

	renderItem(item) { if (item.type === 'note') return this.renderNoteCard(item); else if (item.type === 'task') return this.renderTaskCard(item); return ''; }

	renderNoteCard(note) {
		const date = new Date(note.updatedAt);
		const dateStr = date.toLocaleDateString(this.getDateLocale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
		const colorOptions = COLORS.map(color => `<div class="color-option color-${color}${note.color === color ? ' active' : ''}" data-color="${color}"></div>`).join('');
		const badges = this.renderItemBadges(note);
		const content = note.content ? this.renderMarkdown(note.content) : '';
		const bannerUrl = note.bannerUrl || note.banner?.src || '';
		const banner = bannerUrl ? `<div class="note-banner"><img src="${this.escapeHtml(bannerUrl)}" alt="${this.escapeHtml(note.title || i18n.t('noTitle'))} banner" loading="lazy"></div>` : '';
		return `<div class="note-card color-${note.color}${note.pinned ? ' is-pinned' : ''}${note.archived ? ' is-archived' : ''}${note.trashed ? ' is-trashed' : ''}" data-id="${note.id}" data-type="note">${banner}<div class="note-card-header"><h3 class="note-title">${this.escapeHtml(note.title || i18n.t('noTitle'))}</h3><div class="note-card-buttons">${!note.archived && !note.trashed ? `<button class="note-card-btn pin-btn" title="${note.pinned ? i18n.t('unpin') : i18n.t('pin')}" data-action="pin"><i class="bi bi-pin-angle${note.pinned ? '-fill' : ''}"></i></button><button class="note-card-btn archive-btn" title="${i18n.t('archive')}" data-action="archive"><i class="bi bi-archive"></i></button>` : ''}${note.trashed ? `<button class="note-card-btn delete-btn" title="${i18n.t('delete')}" data-action="delete"><i class="bi bi-trash-fill"></i></button>` : `<button class="note-card-btn trash-btn" title="${i18n.t('trash')}" data-action="trash"><i class="bi bi-trash"></i></button>`}<button class="note-menu-btn" title="${i18n.t('menu')}"><i class="bi bi-three-dots-vertical"></i></button></div></div><div class="note-content markdown-content">${content}</div>${badges}<span class="note-type-tag"><i class="bi bi-file-text"></i> ${i18n.t('noteTypeTag')}</span><div class="note-footer"><div class="note-date"><i class="bi bi-calendar-event"></i><span>${dateStr}</span></div><div class="color-picker">${colorOptions}</div></div></div>`;
	}

	renderTaskCard(task) {
		const completedCount = task.items.filter(i => i.completed).length;
		const totalCount = task.items.length;
		const date = new Date(task.updatedAt);
		const dateStr = date.toLocaleDateString(this.getDateLocale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
		const taskItems = task.items.map(item => `<div class="task-item ${item.completed ? 'completed' : ''}"><input type="checkbox" class="task-checkbox" data-task-id="${item.id}" ${item.completed ? 'checked' : ''}><span class="task-item-text">${this.escapeHtml(item.text)}</span></div>`).join('');
		const badges = this.renderItemBadges(task);
		return `<div class="note-card${task.pinned ? ' is-pinned' : ''}${task.archived ? ' is-archived' : ''}${task.trashed ? ' is-trashed' : ''}" data-id="${task.id}" data-type="task"><div class="note-card-header"><h3 class="note-title">${this.escapeHtml(task.title)}</h3><div class="note-card-buttons">${!task.archived && !task.trashed ? `<button class="note-card-btn pin-btn" title="${task.pinned ? i18n.t('unpin') : i18n.t('pin')}" data-action="pin"><i class="bi bi-pin-angle${task.pinned ? '-fill' : ''}"></i></button><button class="note-card-btn archive-btn" title="${i18n.t('archive')}" data-action="archive"><i class="bi bi-archive"></i></button>` : ''}${task.trashed ? `<button class="note-card-btn delete-btn" title="${i18n.t('delete')}" data-action="delete"><i class="bi bi-trash-fill"></i></button>` : `<button class="note-card-btn trash-btn" title="${i18n.t('trash')}" data-action="trash"><i class="bi bi-trash"></i></button>`}<button class="note-menu-btn" title="${i18n.t('menu')}"><i class="bi bi-three-dots-vertical"></i></button></div></div><div class="task-list">${taskItems}</div>${badges}<span class="note-type-tag"><i class="bi bi-check2-circle"></i> ${i18n.t('taskTypeTag')} (${completedCount}/${totalCount})</span><div class="note-footer"><div class="note-date"><i class="bi bi-calendar-event"></i><span>${dateStr}</span></div></div></div>`;
	}

	renderItemBadges(item) {
		const badges = [];
		if (item.pinned) badges.push(`<span class="note-badge note-badge-pin"><i class="bi bi-pin-angle-fill"></i> ${i18n.t('pinnedTag')}</span>`);
		if (item.archived) badges.push(`<span class="note-badge note-badge-archive"><i class="bi bi-archive"></i> ${i18n.t('archivedTag')}</span>`);
		if (item.trashed) badges.push(`<span class="note-badge note-badge-trash"><i class="bi bi-trash"></i> ${i18n.t('trashedTag')}</span>`);
		if (item.listName) badges.push(`<span class="note-badge note-badge-list"><i class="bi bi-collection"></i> ${this.escapeHtml(item.listName)}</span>`);
		if (Array.isArray(item.tags) && item.tags.length > 0) item.tags.forEach(tag => { badges.push(`<span class="note-badge note-badge-tag">#${this.escapeHtml(tag)}</span>`); });
		if (item.reminderAt) {
			const reminderDate = new Date(item.reminderAt);
			const isDue = !Number.isNaN(reminderDate.getTime()) && reminderDate.getTime() <= Date.now();
			badges.push(`<span class="note-badge note-badge-reminder${isDue ? ' is-due' : ''}"><i class="bi bi-bell"></i> ${this.escapeHtml(this.formatReminderDate(reminderDate))}</span>`);
		}
		return badges.length ? `<div class="note-badges">${badges.join('')}</div>` : '';
	}

	formatReminderDate(date) { if (!(date instanceof Date) || Number.isNaN(date.getTime())) return i18n.t('reminderTag'); return date.toLocaleString(this.getDateLocale(), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

	renderMarkdown(text) {
		const lines = String(text || '').split(/\r?\n/);
		const blocks = [];
		let listItems = [];
		const flushList = () => { if (listItems.length) { blocks.push(`<ul>${listItems.join('')}</ul>`); listItems = []; } };
		const formatInline = (value) => value.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
		lines.forEach(rawLine => { const line = this.escapeHtml(rawLine.trim()); if (!line) { flushList(); return; } const headingMatch = line.match(/^(#{1,3})\s+(.*)$/); if (headingMatch) { flushList(); const level = headingMatch[1].length + 1; blocks.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`); return; } if (/^[-*]\s+/.test(line)) { listItems.push(`<li>${formatInline(line.replace(/^[-*]\s+/, ''))}</li>`); return; } flushList(); blocks.push(`<p>${formatInline(line)}</p>`); }); flushList(); return blocks.join('');
	}

	updateNoteColor(id, color) { const note = this.dataManager.getNoteById(id); if (note) { note.color = color; note.updatedAt = new Date().toISOString(); this.dataManager.saveToStorage(); this.render(); } }

	toggleTaskItem(taskId, itemId) { const task = this.dataManager.getTaskById(taskId); if (task) { const item = task.items.find(i => i.id === itemId); if (item) { item.completed = !item.completed; task.updatedAt = new Date().toISOString(); this.dataManager.saveToStorage(); this.render(); } } }

	escapeHtml(text) {
		const source = String(text ?? '');
		const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
		return source.replace(/[&<>"']/g, m => map[m]);
	}

	handleDragStart(e, card) { e.dataTransfer.effectAllowed = 'move'; const id = card.dataset.id; const type = card.dataset.type; e.dataTransfer.setData('text/plain', JSON.stringify({ id, type })); card.classList.add('dragging'); }
	handleDragOver(e, card) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; card.classList.add('drag-over'); }
	handleDrop(e, card) { e.preventDefault(); const source = JSON.parse(e.dataTransfer.getData('text/plain') || '{}'); const targetId = card.dataset.id; const targetType = card.dataset.type; if (!source.id || !source.type) return; if (source.type !== targetType) return; this.reorderItems(source.id, targetId, source.type); this.clearDragState(); }
	clearDragState() { document.querySelectorAll('.note-card.dragging').forEach(c => c.classList.remove('dragging')); document.querySelectorAll('.note-card.drag-over').forEach(c => c.classList.remove('drag-over')); }
	reorderItems(sourceId, targetId, type) { const visibleCards = Array.from(this.notesGrid.querySelectorAll('.note-card')); const visibleItems = visibleCards.map(card => this.dataManager.getItemById(card.dataset.id, card.dataset.type)).filter(Boolean); const sourceIndex = visibleItems.findIndex(i => i.id === sourceId && i.type === type); const targetIndex = visibleItems.findIndex(i => i.id === targetId && i.type === type); if (sourceIndex === -1 || targetIndex === -1) return; const [moved] = visibleItems.splice(sourceIndex, 1); visibleItems.splice(targetIndex, 0, moved); const listKey = this.currentList || 'All'; visibleItems.forEach((item, idx) => { if (!item.orderByList || typeof item.orderByList !== 'object') item.orderByList = {}; item.orderByList[listKey] = idx + 1; }); this.dataManager.saveToStorage(); this.render(); }
}

export { UIManager };
