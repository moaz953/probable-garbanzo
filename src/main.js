import './style.css';
import { Keyboard } from './keyboard.js';
import { SmartAssist } from './smart-assist.js';

const output = document.getElementById('output');
const suggestionsContainer = document.getElementById('suggestions');
const assist = new SmartAssist();

// Helper: Insert text at cursor position
const insertText = (text) => {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const val = output.value;

  // Insert text between start and end (replacing selection if any)
  output.value = val.substring(0, start) + text + val.substring(end);

  // Move cursor to end of inserted text
  output.selectionStart = output.selectionEnd = start + text.length;

  handleSuggestions();
  output.focus();
};

const deleteText = () => {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const val = output.value;

  // If there is a selection, delete selection
  if (start !== end) {
    output.value = val.substring(0, start) + val.substring(end);
    output.selectionStart = output.selectionEnd = start;
  }
  // If no selection, delete char before cursor
  else if (start > 0) {
    output.value = val.substring(0, start - 1) + val.substring(start);
    output.selectionStart = output.selectionEnd = start - 1;
  }

  handleSuggestions();
  output.focus();
};

const deleteWord = () => {
  const start = output.selectionStart;
  const val = output.value;

  // Provide logic to delete word BEFORE cursor
  // 1. Get text before cursor
  const textBefore = val.substring(0, start);
  const textAfter = val.substring(start);

  // 2. Find last word boundary in textBefore
  const trimmedBefore = textBefore.trimEnd();
  const diff = textBefore.length - trimmedBefore.length;

  // If we are just sitting on spaces, delete them and the word before
  const lastSpace = trimmedBefore.lastIndexOf(' ');

  let newStart = 0;
  if (lastSpace === -1) {
    newStart = 0; // delete everything before
  } else {
    newStart = lastSpace; // keep the space? usually delete word removes whole word.
    // let's keeping the space before the word being deleted?
    // Or if iOS style: delete word and the space after it?
    // Let's just delete from newStart to cursor.
  }

  output.value = val.substring(0, newStart) + textAfter;
  output.selectionStart = output.selectionEnd = newStart;

  handleSuggestions();
  output.focus();
};

const handleNewline = () => {
  insertText('\n');
};

const handleSuggestions = () => {
  const text = output.value;
  // Regex to split by whitespace but keep delimiters if needed, 
  // or just get the last token.
  const words = text.trimEnd().split(/\s+/);

  // Logic: 
  // If the last character is a space, we are looking for Next-Word prediction.
  // If the last character is a letter, we are looking for Auto-Complete for current word.

  const isNewWord = text.endsWith(' ');
  const currentWord = isNewWord ? "" : words[words.length - 1];
  const previousWord = isNewWord ? words[words.length - 1] : words[words.length - 2];

  // Suggestions
  const suggestions = assist.suggest(currentWord, previousWord);
  renderSuggestions(suggestions);
};

const renderSuggestions = (list) => {
  suggestionsContainer.innerHTML = '';
  list.forEach(word => {
    const chip = document.createElement('div');
    chip.className = 'suggestion-chip';
    chip.innerText = word;
    chip.addEventListener('click', () => {
      // Replace current word with suggestion
      const text = output.value;
      const lastSpaceIndex = text.lastIndexOf(' ');
      if (lastSpaceIndex === -1) {
        output.value = word + ' ';
      } else {
        output.value = text.substring(0, lastSpaceIndex + 1) + word + ' ';
      }
      suggestionsContainer.innerHTML = '';
      output.focus();
    });
    suggestionsContainer.appendChild(chip);
  });
};

// Search Logic
document.getElementById('btn-copy').addEventListener('click', () => {
  const text = output.value;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      // Visual Feedback (e.g. change text momentarily)
      const btn = document.getElementById('btn-copy');
      const original = btn.innerText;
      btn.innerText = "تم النسخ!";
      setTimeout(() => btn.innerText = original, 1500);
    });
  }
});

document.getElementById('btn-google').addEventListener('click', () => {
  const query = output.value.trim();
  if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
});

document.getElementById('btn-youtube').addEventListener('click', () => {
  const query = output.value.trim();
  if (query) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
});

// AI Tools - Copy and Open
const showToast = (msg) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
};

const openAI = (url, useParam = false) => {
  const text = output.value;

  // Construct URL with param if supported (ChatGPT sometimes supports ?q=)
  let finalUrl = url;
  if (useParam && text) {
    // Simple encoding
    finalUrl += `?q=${encodeURIComponent(text)}`;
  }

  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("تم النسخ! الصق النص هناك (Ctrl+V)"); // "Copied! Paste there"
      // Small delay to ensure user sees message before tab switch
      setTimeout(() => window.open(finalUrl, '_blank'), 500);
    });
  } else {
    window.open(finalUrl, '_blank');
  }
};

document.getElementById('btn-chatgpt').addEventListener('click', () => {
  openAI('https://chatgpt.com/', true); // Try using param
});

document.getElementById('btn-deepseek').addEventListener('click', () => {
  openAI('https://chat.deepseek.com/'); // DeepSeek usually needs manual paste
});

// Init Keyboard
document.getElementById('btn-clear').addEventListener('click', () => {
  output.value = "";
  handleSuggestions();
  output.focus();
});

new Keyboard(
  'keyboard',
  insertText,
  deleteText,
  () => insertText(' '),
  handleNewline,
  deleteWord
);

