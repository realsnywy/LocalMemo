// storage.js - DataManager split from app.js
import { normalizeMetadata } from './models.js';

const STORAGE_KEY = 'localmemo_data';
const STORAGE_LISTS_KEY = 'localmemo_lists';

export class DataManager {
  constructor() {
    this.data = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : { notes: [], tasks: [] };
      data.notes = (data.notes || []).map(note => ({ ...note, createdAt: note.createdAt || new Date().toISOString() }));
      data.tasks = (data.tasks || []).map(task => ({ ...task, createdAt: task.createdAt || new Date().toISOString() }));
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

  createNote(title, content, color = 'yellow', metadata = {}) {
    const itemMetadata = normalizeMetadata(metadata);
    const note = {
      id: Date.now().toString(),
      type: 'note',
      title: title.trim(),
      content: content.trim(),
      color,
      order: this.data.notes.length + 1,
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
      if (!note.createdAt) note.createdAt = new Date().toISOString();
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

  getNoteById(id) { return this.data.notes.find(n => n.id === id); }

  createTask(title, items = [], metadata = {}) {
    const itemMetadata = normalizeMetadata(metadata);
    const task = {
      id: Date.now().toString(),
      type: 'task',
      title: title.trim(),
      items: items.map((item, idx) => ({ id: `${Date.now()}_${idx}`, text: item.text || '', completed: item.completed || false })),
      order: this.data.tasks.length + 1,
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
      if (!task.createdAt) task.createdAt = new Date().toISOString();
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

  getTaskById(id) { return this.data.tasks.find(t => t.id === id); }

  getItemById(id, type) { return type === 'task' ? this.getTaskById(id) : this.getNoteById(id); }

  updateItemState(id, type, patch = {}) {
    const item = this.getItemById(id, type);
    if (!item) return null;
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    this.saveToStorage();
    return item;
  }

  togglePinned(id, type) { return this.updateItemState(id, type, { pinned: !Boolean(this.getItemById(id, type)?.pinned) }); }

  toggleArchived(id, type) { return this.updateItemState(id, type, { archived: !Boolean(this.getItemById(id, type)?.archived), trashed: false }); }

  toggleTrash(id, type) { return this.updateItemState(id, type, { trashed: !Boolean(this.getItemById(id, type)?.trashed) }); }

  getAllItems() {
    return [...this.data.notes, ...this.data.tasks].sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return Boolean(b.pinned) - Boolean(a.pinned);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  deleteAllData() { this.data = { notes: [], tasks: [] }; this.saveToStorage(); localStorage.removeItem(STORAGE_LISTS_KEY); }

  exportData() { return JSON.stringify(this.data, null, 2); }

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
