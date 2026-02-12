/**
 * AR-KEY Main Application
 * Professional Arabic Virtual Keyboard Application
 * 
 * @version 2.1.0
 */

import './style.css';
import { Keyboard } from './keyboard.js';
import { SmartAssist } from './smart-assist.js';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const output = document.getElementById('output');
const suggestionsContainer = document.getElementById('suggestions');

// ============================================================================
// SERVICES
// ============================================================================

const assist = new SmartAssist();

// ============================================================================
// TEXT MANIPULATION
// ============================================================================

/**
 * Insert text at cursor position
 */
const insertText = (text) => {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const val = output.value;

  output.value = val.substring(0, start) + text + val.substring(end);
  output.selectionStart = output.selectionEnd = start + text.length;

  updateSuggestions();
  updateCharCount();
  output.focus();
};

/**
 * Delete character before cursor
 */
const deleteText = () => {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const val = output.value;

  if (start !== end) {
    output.value = val.substring(0, start) + val.substring(end);
    output.selectionStart = output.selectionEnd = start;
  } else if (start > 0) {
    output.value = val.substring(0, start - 1) + val.substring(start);
    output.selectionStart = output.selectionEnd = start - 1;
  }

  updateSuggestions();
  updateCharCount();
  output.focus();
};

/**
 * Delete word before cursor
 */
const deleteWord = () => {
  const start = output.selectionStart;
  const val = output.value;

  const textBefore = val.substring(0, start);
  const textAfter = val.substring(start);

  const trimmedBefore = textBefore.trimEnd();
  const lastSpace = trimmedBefore.lastIndexOf(' ');
  const newStart = lastSpace === -1 ? 0 : lastSpace + 1;

  output.value = val.substring(0, newStart) + textAfter;
  output.selectionStart = output.selectionEnd = newStart;

  updateSuggestions();
  updateCharCount();
  output.focus();
};

/**
 * Handle newline insertion
 */
const handleNewline = () => {
  insertText('\n');
};

// ============================================================================
// SUGGESTIONS
// ============================================================================

const updateSuggestions = () => {
  const text = output.value;
  const words = text.trimEnd().split(/\s+/);

  const isNewWord = text.endsWith(' ') || text === '';
  const currentWord = isNewWord ? "" : words[words.length - 1];
  const previousWord = isNewWord ? words[words.length - 1] : words[words.length - 2];

  const suggestions = assist.suggest(currentWord, previousWord);
  renderSuggestions(suggestions, currentWord);
};

const renderSuggestions = (list, currentWord) => {
  suggestionsContainer.innerHTML = '';

  list.forEach(word => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'suggestion-chip';
    chip.innerText = word;

    chip.addEventListener('click', () => {
      const text = output.value;
      const cursorPos = output.selectionStart;

      if (currentWord) {
        // Replace current partial word at cursor position
        const textBeforeCursor = text.substring(0, cursorPos);
        const textAfterCursor = text.substring(cursorPos);
        const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
        const before = lastSpaceIndex === -1 ? '' : textBeforeCursor.substring(0, lastSpaceIndex + 1);
        output.value = before + word + ' ' + textAfterCursor;
        output.selectionStart = output.selectionEnd = before.length + word.length + 1;
      } else {
        // Insert word at cursor position
        const textBeforeCursor = text.substring(0, cursorPos);
        const textAfterCursor = text.substring(cursorPos);
        output.value = textBeforeCursor + word + ' ' + textAfterCursor;
        output.selectionStart = output.selectionEnd = cursorPos + word.length + 1;
      }

      suggestionsContainer.innerHTML = '';
      updateCharCount();
      output.focus();
    });

    suggestionsContainer.appendChild(chip);
  });
};

// ============================================================================
// CHARACTER COUNTER
// ============================================================================

const updateCharCount = () => {
  const counter = document.getElementById('char-counter');
  if (!counter) return;

  const text = output.value;
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  counter.innerHTML = `
        <span>${charCount} حرف</span>
        <span>${wordCount} كلمة</span>
    `;
};

// ============================================================================
// ACTION BUTTONS
// ============================================================================

// Copy Button
document.getElementById('btn-copy')?.addEventListener('click', () => {
  const text = output.value;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ تم النسخ');
    }).catch(() => {
      showToast('⚠️ فشل النسخ');
    });
  }
});

// Clear Button
document.getElementById('btn-clear')?.addEventListener('click', () => {
  output.value = '';
  updateSuggestions();
  updateCharCount();
  output.focus();
});

// Google Search
document.getElementById('btn-google')?.addEventListener('click', () => {
  const query = output.value.trim();
  if (query) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }
});

// YouTube Search
document.getElementById('btn-youtube')?.addEventListener('click', () => {
  const query = output.value.trim();
  if (query) {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }
});

// Wikipedia Search (Arabic)
document.getElementById('btn-wikipedia')?.addEventListener('click', () => {
  const query = output.value.trim();
  if (query) {
    window.open(`https://ar.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  }
});

// ============================================================================
// AI TOOLS
// ============================================================================

const openAI = (url, useParam = false) => {
  const text = output.value.trim();
  let finalUrl = url;

  if (useParam && text) {
    finalUrl += `?q=${encodeURIComponent(text)}`;
  }

  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 تم النسخ! الصق النص هناك');
      setTimeout(() => window.open(finalUrl, '_blank', 'noopener,noreferrer'), 400);
    }).catch(() => {
      showToast('⚠️ فشل النسخ');
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    });
  } else {
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }
};

document.getElementById('btn-chatgpt')?.addEventListener('click', () => {
  openAI('https://chatgpt.com/', true);
});

document.getElementById('btn-deepseek')?.addEventListener('click', () => {
  openAI('https://chat.deepseek.com/');
});

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

const showToast = (message) => {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2000);
};

// ============================================================================
// SETTINGS PANEL
// ============================================================================

const createSettingsPanel = (keyboard) => {
  const settings = keyboard.getSettings();

  const overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  overlay.innerHTML = `
        <div class="settings-panel">
            <h2>⚙️ الإعدادات</h2>
            
            <div class="setting-item">
                <span class="setting-label">الصوت</span>
                <label class="toggle">
                    <input type="checkbox" id="setting-sound" ${settings.soundEnabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <span class="setting-label">الاهتزاز</span>
                <label class="toggle">
                    <input type="checkbox" id="setting-vibration" ${settings.vibrationEnabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <span class="setting-label">الوضع الداكن</span>
                <label class="toggle">
                    <input type="checkbox" id="setting-theme" ${settings.theme === 'dark' ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <button class="close-settings">حفظ وإغلاق</button>
        </div>
    `;

  document.body.appendChild(overlay);

  // Event Listeners
  overlay.querySelector('#setting-sound').addEventListener('change', (e) => {
    keyboard.setSound(e.target.checked);
  });

  overlay.querySelector('#setting-vibration').addEventListener('change', (e) => {
    keyboard.setVibration(e.target.checked);
  });

  overlay.querySelector('#setting-theme').addEventListener('change', (e) => {
    keyboard.updateSetting('theme', e.target.checked ? 'dark' : 'light');
  });

  overlay.querySelector('.close-settings').addEventListener('click', () => {
    overlay.remove();
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Close on Escape key
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
};

// ============================================================================
// KEYBOARD INITIALIZATION
// ============================================================================

const keyboard = new Keyboard('keyboard', {
  onInput: insertText,
  onDelete: deleteText,
  onSpace: () => insertText(' '),
  onEnter: handleNewline,
  onDeleteWord: deleteWord
});

// Listen for settings button
keyboard.on('openSettings', () => {
  createSettingsPanel(keyboard);
});

// ============================================================================
// QUICK SOUND TOGGLE
// ============================================================================

const soundToggle = document.getElementById('quick-sound-toggle');

const updateSoundToggleUI = () => {
  const settings = keyboard.getSettings();
  if (soundToggle) {
    soundToggle.textContent = settings.soundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !settings.soundEnabled);
  }
};

soundToggle?.addEventListener('click', () => {
  const settings = keyboard.getSettings();
  const newState = !settings.soundEnabled;
  keyboard.setSound(newState);
  updateSoundToggleUI();
  showToast(newState ? '🔊 الصوت مفعل' : '🔇 الصوت مغلق');
});

// Update UI on settings change
keyboard.on('settingsChanged', ({ key }) => {
  if (key === 'soundEnabled') updateSoundToggleUI();
});

// Initialize sound toggle UI
updateSoundToggleUI();

// ============================================================================
// INITIALIZATION
// ============================================================================

// Add character counter to DOM
const charCounter = document.createElement('div');
charCounter.id = 'char-counter';
charCounter.className = 'char-counter';
charCounter.setAttribute('role', 'status');
charCounter.setAttribute('aria-live', 'polite');
document.querySelector('.output-container')?.appendChild(charCounter);

// Initial updates
updateCharCount();
updateSuggestions();

// Focus output on load
output?.focus();
