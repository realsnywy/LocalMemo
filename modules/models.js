// modules/models.js - utility helpers

export function normalizeTags(tags) {
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

export function normalizeMetadata(metadata = {}, fallback = {}) {
  return {
    pinned: Boolean(metadata.pinned ?? fallback.pinned),
    tags: normalizeTags(metadata.tags ?? fallback.tags),
    listName: String(metadata.listName ?? fallback.listName ?? '').trim(),
    reminderAt: String(metadata.reminderAt ?? fallback.reminderAt ?? '').trim(),
    bannerUrl: String(metadata.bannerUrl ?? fallback.bannerUrl ?? '').trim(),
    archived: Boolean(metadata.archived ?? fallback.archived),
    trashed: Boolean(metadata.trashed ?? fallback.trashed),
  };
}

export function escapeHtml(text) {
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

export function renderMarkdown(text) {
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
    const line = escapeHtml(rawLine.trim());

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
