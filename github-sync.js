// ============================================
// LocalMemo - GitHub Sync
// Sincronização com GitHub Gist
// ============================================

const GitHubSync = {
  // ============================================
  // Configurações e Constantes
  // ============================================
  GIST_FILENAME: 'localmemo_data.json',
  GITHUB_API_URL: 'https://api.github.com',
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutos
  syncTimer: null,

  // ============================================
  // Inicialização
  // ============================================
  init() {
    this.setupAutoSync();
    console.log('GitHubSync inicializado!');
  },

  // ============================================
  // Settings Management
  // ============================================
  getSettings() {
    try {
      const stored = localStorage.getItem('localmemo_settings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return {};
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem('localmemo_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  },

  // ============================================
  // Connection Test
  // ============================================
  async testConnection() {
    const settings = this.getSettings();
    const { githubPat, githubGistId } = settings;

    if (!githubPat || !githubGistId) {
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '❌ ' + i18n.t('configRequired'),
        'error'
      );
      return false;
    }

    try {
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '⏳ ' + i18n.t('connectionTesting'),
        'info'
      );

      // Teste 1: Verificar PAT
      const userResponse = await fetch(`${this.GITHUB_API_URL}/user`, {
        headers: this.getHeaders(githubPat),
      });

      if (!userResponse.ok) {
        throw new Error(i18n.t('invalidToken'));
      }

      const userData = await userResponse.json();
      const username = userData.login;

      // Teste 2: Verificar Gist
      const gistResponse = await fetch(
        `${this.GITHUB_API_URL}/gists/${githubGistId}`,
        {
          headers: this.getHeaders(githubPat),
        }
      );

      if (!gistResponse.ok) {
        throw new Error(i18n.t('gistUnavailable'));
      }

      const gistData = await gistResponse.json();

      window.LocalMemoApp?.uiManager?.showGithubStatus(
        `✅ ${i18n.t('connectionSuccess')} Usuário: ${username}`,
        'success'
      );

      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        `❌ ${error.message}`,
        'error'
      );
      return false;
    }
  },

  // ============================================
  // Sync Functions
  // ============================================
  async fetchFromGist() {
    const settings = this.getSettings();
    const { githubPat, githubGistId } = settings;

    if (!githubPat || !githubGistId) {
      throw new Error(i18n.t('configRequired'));
    }

    try {
      const response = await fetch(
        `${this.GITHUB_API_URL}/gists/${githubGistId}`,
        {
          headers: this.getHeaders(githubPat),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const gistData = await response.json();
      const file = gistData.files[this.GIST_FILENAME];

      if (!file) {
        throw new Error('Arquivo não encontrado no Gist');
      }

      return JSON.parse(file.content);
    } catch (error) {
      console.error('Erro ao buscar dados do Gist:', error);
      throw error;
    }
  },

  async updateGist(data) {
    const settings = this.getSettings();
    const { githubPat, githubGistId } = settings;

    if (!githubPat || !githubGistId) {
      throw new Error(i18n.t('configRequired'));
    }

    try {
      const response = await fetch(
        `${this.GITHUB_API_URL}/gists/${githubGistId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(githubPat),
          body: JSON.stringify({
            files: {
              [this.GIST_FILENAME]: {
                content: JSON.stringify(data, null, 2),
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar Gist:', error);
      throw error;
    }
  },

  async createGist(data) {
    const settings = this.getSettings();
    const { githubPat } = settings;

    if (!githubPat) {
      throw new Error(i18n.t('configRequired'));
    }

    try {
      const response = await fetch(`${this.GITHUB_API_URL}/gists`, {
        method: 'POST',
        headers: this.getHeaders(githubPat),
        body: JSON.stringify({
          description: 'LocalMemo - Notes and Tasks Backup',
          public: false,
          files: {
            [this.GIST_FILENAME]: {
              content: JSON.stringify(data, null, 2),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const gistData = await response.json();
      const newGistId = gistData.id;

      // Salvar novo ID do Gist
      const settings = this.getSettings();
      settings.githubGistId = newGistId;
      this.saveSettings(settings);

      return newGistId;
    } catch (error) {
      console.error('Erro ao criar Gist:', error);
      throw error;
    }
  },

  // ============================================
  // Sync Now
  // ============================================
  async syncNow() {
    const settings = this.getSettings();
    const { githubPat, githubGistId } = settings;

    if (!githubPat) {
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '❌ ' + i18n.t('configRequired'),
        'error'
      );
      return;
    }

    try {
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '⏳ ' + i18n.t('syncStarted'),
        'info'
      );

      let gistId = githubGistId;

      // Se não há Gist ID, criar um novo Gist
      if (!gistId) {
        const data = window.LocalMemoApp?.dataManager?.data;
        gistId = await this.createGist(data);
        window.LocalMemoApp?.uiManager?.showGithubStatus(
          `✅ ${i18n.t('newGistCreated')} ID: ${gistId}`,
          'success'
        );
        return;
      }

      // Sincronizar dados locais para o Gist
      const localData = window.LocalMemoApp?.dataManager?.data;
      await this.updateGist(localData);

      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '✅ ' + i18n.t('syncSuccess'),
        'success'
      );
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        `❌ Erro: ${error.message}`,
        'error'
      );
    }
  },

  // ============================================
  // Auto Sync
  // ============================================
  setupAutoSync() {
    // Sincronizar ao carregar a página
    window.addEventListener('load', () => {
      setTimeout(() => this.attemptAutoSync(), 2000);
    });

    // Sincronizar quando houver mudanças nos dados
    window.addEventListener('data-updated', () => {
      if (this.isAutoSyncEnabled()) {
        this.resetSyncTimer();
      }
    });

    // Sincronizar periodicamente
    this.startSyncTimer();
  },

  startSyncTimer() {
    if (!this.isAutoSyncEnabled()) {
      return;
    }

    this.syncTimer = setInterval(() => {
      this.attemptAutoSync();
    }, this.SYNC_INTERVAL);
  },

  stopSyncTimer() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  },

  resetSyncTimer() {
    this.stopSyncTimer();
    this.startSyncTimer();
  },

  attemptAutoSync() {
    const settings = this.getSettings();
    if (settings.autoSync && settings.githubPat) {
      this.syncNow().catch(error => {
        console.warn('Erro durante sincronização automática:', error);
      });
    }
  },

  isAutoSyncEnabled() {
    const settings = this.getSettings();
    return settings.autoSync === true;
  },

  // ============================================
  // Utilitários
  // ============================================
  getHeaders(pat) {
    return {
      'Authorization': `token ${pat}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  },

  // ============================================
  // Merge Functions (para sincronização em dois sentidos)
  // ============================================
  mergeData(localData, remoteData) {
    /**
     * Estratégia de merge:
     * - Items que existem no remoto mas não no local: adicionar
     * - Items que existem em ambos: usar a versão mais recente (por updatedAt)
     * - Items que existem no local mas não no remoto: manter
     */

    const merged = {
      notes: this.mergeItems(localData.notes || [], remoteData.notes || []),
      tasks: this.mergeItems(localData.tasks || [], remoteData.tasks || []),
    };

    return merged;
  },

  mergeItems(localItems, remoteItems) {
    const itemMap = new Map();

    // Adicionar items locais
    localItems.forEach(item => {
      itemMap.set(item.id, item);
    });

    // Adicionar/atualizar com items remotos
    remoteItems.forEach(remoteItem => {
      const localItem = itemMap.get(remoteItem.id);
      if (!localItem) {
        // Item novo do remoto
        itemMap.set(remoteItem.id, remoteItem);
      } else {
        // Item existe em ambos: usar versão mais recente
        const localTime = new Date(localItem.updatedAt).getTime();
        const remoteTime = new Date(remoteItem.updatedAt).getTime();
        if (remoteTime > localTime) {
          itemMap.set(remoteItem.id, remoteItem);
        }
      }
    });

    return Array.from(itemMap.values());
  },

  // ============================================
  // Pull from Gist (importar dados remotos)
  // ============================================
  async pullFromGist() {
    const settings = this.getSettings();
    if (!settings.githubPat || !settings.githubGistId) {
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '❌ ' + i18n.t('configRequired'),
        'error'
      );
      return;
    }

    try {
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '⏳ ' + i18n.t('importingFromGist'),
        'info'
      );

      const remoteData = await this.fetchFromGist();
      const localData = window.LocalMemoApp?.dataManager?.data;

      const merged = this.mergeData(localData, remoteData);

      window.LocalMemoApp?.dataManager?.data = merged;
      window.LocalMemoApp?.dataManager?.saveToStorage();
      window.LocalMemoApp?.uiManager?.render();

      window.LocalMemoApp?.uiManager?.showGithubStatus(
        '✅ ' + i18n.t('importedAndMerged'),
        'success'
      );
    } catch (error) {
      console.error('Erro ao importar do Gist:', error);
      window.LocalMemoApp?.uiManager?.showGithubStatus(
        `❌ Erro: ${error.message}`,
        'error'
      );
    }
  },
};

// ============================================
// Inicializar quando DOM estiver pronto
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  GitHubSync.init();
});

// Expor GitHubSync globalmente
window.GitHubSync = GitHubSync;
