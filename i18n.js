// ============================================
// LocalMemo - Internationalization (i18n)
// ============================================

const i18n = {
  currentLanguage: 'en',

  translations: {
    en: {
      // Header
      settings: 'Settings',

      // Buttons
      newNote: 'Add Note',
      newTask: 'Add Task',
      addItem: 'Add Item',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      ok: 'OK',
      close: 'Close',
      testConnection: 'Test Connection',
      syncNow: 'Sync Now',
      clearSettings: 'Clear Settings',
      exportData: 'Export Data (JSON)',
      importData: 'Import Data (JSON)',
      deleteAllData: 'Delete All Local Data',

      // Sections
      all: 'All',
      notes: 'Notes',
      tasks: 'Tasks',
      archived: 'Archived',
      trash: 'Trash',

      // Labels
      title: 'Title',
      content: 'Content',
      optional: 'Optional',
      search: 'Search notes and tasks...',
      noteContentPlaceholder: 'Write your note here... (Markdown supported)',
      menu: 'Menu',
      itemList: 'List',
      itemTags: 'Tags',
      itemReminder: 'Reminder',
      itemPinned: 'Pin this item',
      itemArchived: 'Archive item',
      listPlaceholder: 'Main list',
      tagsPlaceholder: 'work, ideas, personal',
      reminderPlaceholder: 'Select date and time',
      markdownHint: 'Markdown is supported in note content.',

      // Settings
      settingsTitle: 'Settings',
      githubSync: 'GitHub Synchronization',
      githubSyncDesc: 'Configure your GitHub Personal Access Token (PAT) and Gist ID to sync your notes automatically to the cloud.',
      githubPat: 'GitHub Personal Access Token',
      githubPatDesc: 'Token with gist permission (create and edit)',
      gistId: 'Private Gist ID',
      gistIdDesc: 'Unique ID of your gist (will be created automatically if it does not exist)',
      general: 'General',
      autoSync: 'Automatically sync when there are changes',
      dangerZone: 'Danger Zone',
      dangerZoneDesc: 'This action is IRREVERSIBLE and cannot be undone!',

      // Editor
      newNoteTitle: 'New Note',
      newTaskTitle: 'New Task',
      editNoteTitle: 'Edit Note',
      editTaskTitle: 'Edit Task',
      noteTab: 'Note',
      taskTab: 'Task',
      addTaskItem: 'Add Item',
      deleteTaskItem: 'Delete',
      notePlaceholder: 'Note title (optional)',
      taskPlaceholder: 'Task title',
      taskItemPlaceholder: 'Type the task item...',

      // Messages
      emptyState: 'No notes or tasks yet.<br>Create one to get started!',
      noTitle: 'Untitled',
      noteTypeTag: 'Note',
      taskTypeTag: 'Task',
      pinnedTag: 'Pinned',
      archivedTag: 'Archived',
      trashedTag: 'Trash',
      listTag: 'List',
      reminderTag: 'Reminder',
      completed: 'completed',
      of: 'of',
      deleteConfirm: 'Are you sure you want to delete this item?',
      deleteAllConfirm: 'Are you sure you want to delete ALL data?',
      deleteAllFinal: 'Last confirmation: Delete ALL data?',
      clearGithubConfirm: 'Are you sure you want to clear GitHub settings?',
      emptyNoteWarning: 'The note cannot be empty!',
      emptyTaskTitle: 'The task needs a title!',
      dateSeparator: ',',

      // Lists & View Modes
      enterListName: 'Enter list name:',

      // Context Menu
      edit: 'Edit',
      duplicate: 'Duplicate',
      delete: 'Delete',
      pin: 'Pin',
      unpin: 'Unpin',
      archive: 'Archive',
      unarchive: 'Unarchive',
      trash: 'Trash',
      restore: 'Restore',
      print: 'Print',

      // GitHub Messages
      connectionTesting: 'Testing connection with GitHub...',
      connectionSuccess: 'Connection successful!',
      connectionFailed: 'Failed to connect to GitHub.',
      syncStarted: 'Syncing...',
      syncSuccess: 'Sync completed successfully!',
      syncFailed: 'Error during sync.',
      configRequired: 'Configure PAT and Gist ID first',
      newGistCreated: 'New Gist created!',
      importingFromGist: 'Importing data from Gist...',
      importedAndMerged: 'Data imported and merged successfully!',
      invalidToken: 'Invalid or expired token',
      gistUnavailable: 'Gist not found or inaccessible',
      settingsCleared: 'Settings cleared!',
      dataImported: 'Data imported successfully!',
      invalidFormat: 'Invalid file format!',
      importError: 'Error importing data',
      dataDeleted: 'All data has been deleted!',
      githubSettingsCleared: 'GitHub settings cleared!',
      noteSavedWarning: 'The note cannot be empty!',

      // Footer
      footerLine1: 'Made with ❤️ in 🇧🇷 by Gabriel "Snywy" Furtado',
      footerLine2: 'Feito com ❤️ no 🇧🇷 por Gabriel "Snywy" Furtado',
      year: 'year',
      confirmTitle: 'Confirm',
      noticeTitle: 'Notice',
    },

    pt: {
      // Header
      settings: 'Configurações',

      // Buttons
      newNote: 'Adicionar Nota',
      newTask: 'Adicionar Tarefa',
      addItem: 'Adicionar Item',
      save: 'Salvar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      ok: 'OK',
      close: 'Fechar',
      testConnection: 'Testar Conexão',
      syncNow: 'Sincronizar Agora',
      clearSettings: 'Limpar Configurações',
      exportData: 'Exportar Dados (JSON)',
      importData: 'Importar Dados (JSON)',
      deleteAllData: 'Deletar Todos os Dados Locais',

      // Sections
      all: 'Tudo',
      notes: 'Notas',
      tasks: 'Tarefas',
      archived: 'Arquivados',
      trash: 'Lixeira',

      // Labels
      title: 'Título',
      content: 'Conteúdo',
      optional: 'Opcional',
      search: 'Pesquisar notas e tarefas...',
      noteContentPlaceholder: 'Escreva sua nota aqui... (Markdown suportado)',
      menu: 'Menu',
      itemList: 'Lista',
      itemTags: 'Tags',
      itemReminder: 'Lembrete',
      itemPinned: 'Fixar este item',
      itemArchived: 'Arquivar item',
      listPlaceholder: 'Lista principal',
      tagsPlaceholder: 'trabalho, ideias, pessoal',
      reminderPlaceholder: 'Selecione data e hora',
      markdownHint: 'Markdown é suportado no conteúdo da nota.',

      // Settings
      settingsTitle: 'Configurações',
      githubSync: 'Sincronização com GitHub',
      githubSyncDesc: 'Configure seu GitHub Personal Access Token (PAT) e ID do Gist para sincronizar suas notas automaticamente na nuvem.',
      githubPat: 'GitHub Personal Access Token',
      githubPatDesc: 'Token com permissão de gist (criar e editar)',
      gistId: 'ID do Gist Privado',
      gistIdDesc: 'ID único do seu gist (será criado automaticamente se não existir)',
      general: 'Geral',
      autoSync: 'Sincronizar automaticamente quando houver alterações',
      dangerZone: 'Zona de Perigo',
      dangerZoneDesc: 'Esta ação é IRREVERSÍVEL e não pode ser desfeita!',

      // Editor
      newNoteTitle: 'Nova Nota',
      newTaskTitle: 'Nova Tarefa',
      editNoteTitle: 'Editar Nota',
      editTaskTitle: 'Editar Tarefa',
      noteTab: 'Nota',
      taskTab: 'Tarefa',
      addTaskItem: 'Adicionar Item',
      deleteTaskItem: 'Deletar',
      notePlaceholder: 'Título da nota (opcional)',
      taskPlaceholder: 'Título da tarefa',
      taskItemPlaceholder: 'Digite o item da tarefa...',

      // Messages
      emptyState: 'Nenhuma nota ou tarefa ainda.<br>Crie uma para começar!',
      noTitle: 'Sem título',
      noteTypeTag: 'Nota',
      taskTypeTag: 'Tarefa',
      pinnedTag: 'Fixado',
      archivedTag: 'Arquivado',
      trashedTag: 'Lixeira',
      listTag: 'Lista',
      reminderTag: 'Lembrete',
      completed: 'concluído',
      of: 'de',
      deleteConfirm: 'Tem certeza que quer deletar este item?',
      deleteAllConfirm: 'Tem certeza que quer deletar TODOS os dados?',
      deleteAllFinal: 'Última confirmação: Deletar TODOS os dados?',
      clearGithubConfirm: 'Tem certeza que quer limpar as configurações do GitHub?',
      emptyNoteWarning: 'A nota não pode estar vazia!',
      emptyTaskTitle: 'A tarefa precisa de um título!',
      dateSeparator: 'de',

      // Lists & View Modes
      enterListName: 'Digite o nome da lista:',

      // Context Menu
      edit: 'Editar',
      duplicate: 'Duplicar',
      delete: 'Deletar',
      pin: 'Fixar',
      unpin: 'Desafixar',
      archive: 'Arquivar',
      unarchive: 'Desarquivar',
      trash: 'Lixeira',
      restore: 'Restaurar',
      print: 'Imprimir',

      // GitHub Messages
      connectionTesting: 'Testando conexão com GitHub...',
      connectionSuccess: 'Conexão bem-sucedida!',
      connectionFailed: 'Falha ao conectar com GitHub.',
      syncStarted: 'Sincronizando...',
      syncSuccess: 'Sincronização concluída com sucesso!',
      syncFailed: 'Erro durante sincronização.',
      configRequired: 'Configure o PAT e ID do Gist primeiro',
      newGistCreated: 'Novo Gist criado!',
      importingFromGist: 'Importando dados do Gist...',
      importedAndMerged: 'Dados importados e mesclados com sucesso!',
      invalidToken: 'Token inválido ou expirado',
      gistUnavailable: 'Gist não encontrado ou inacessível',
      settingsCleared: 'Configurações limpas!',
      dataImported: 'Dados importados com sucesso!',
      invalidFormat: 'Formato de arquivo inválido!',
      importError: 'Erro ao importar dados',
      dataDeleted: 'Todos os dados foram deletados!',
      githubSettingsCleared: 'Configurações do GitHub limpas!',
      noteSavedWarning: 'A nota não pode estar vazia!',

      // Footer
      footerLine1: 'Made with ❤️ in 🇧🇷 by Gabriel "Snywy" Furtado',
      footerLine2: 'Feito com ❤️ no 🇧🇷 por Gabriel "Snywy" Furtado',
      year: 'ano',
      confirmTitle: 'Confirmar',
      noticeTitle: 'Aviso',
    }
  },

  // Get translation
  t(key) {
    return this.translations[this.currentLanguage]?.[key] || key;
  },

  // Set language
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('localmemo_language', lang);
      this.updatePageLanguage();
      return true;
    }
    return false;
  },

  // Get current language
  getLanguage() {
    const stored = localStorage.getItem('localmemo_language');
    if (stored && this.translations[stored]) {
      this.currentLanguage = stored;
      return stored;
    }
    return this.currentLanguage;
  },

  // Update page language
  updatePageLanguage() {
    document.documentElement.lang = this.currentLanguage;
    document.title = this.currentLanguage === 'en'
      ? 'LocalMemo - Notes and Tasks'
      : 'LocalMemo - Notas e Tarefas';

    // Dispatch event for UI update
    window.dispatchEvent(new CustomEvent('language-changed', {
      detail: { language: this.currentLanguage }
    }));
  },

  // Initialize
  init() {
    this.getLanguage();
    this.updatePageLanguage();
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});

// Expose globally
window.i18n = i18n;
