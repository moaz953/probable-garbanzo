/**
 * AR-KEY Professional Arabic Virtual Keyboard
 * A feature-rich, accessible Arabic keyboard with haptic feedback,
 * shift layer for diacritics, theming, and customizable settings.
 * 
 * @version 2.1.0
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_SETTINGS = {
    soundEnabled: true,
    vibrationEnabled: true,
    theme: 'dark',
    keySize: 'medium' // small, medium, large
};

const KEY_SIZES = {
    small: '1.8cm',
    medium: '2.2cm',
    large: '2.6cm'
};

// ============================================================================
// EVENT EMITTER
// ============================================================================

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(...args));
    }
}

// ============================================================================
// KEYBOARD CLASS
// ============================================================================

export class Keyboard extends EventEmitter {
    constructor(containerId, callbacks = {}) {
        super();

        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Keyboard container #${containerId} not found`);
        }

        // Callbacks
        this.callbacks = {
            onInput: callbacks.onInput || (() => { }),
            onDelete: callbacks.onDelete || (() => { }),
            onSpace: callbacks.onSpace || (() => { }),
            onEnter: callbacks.onEnter || (() => { }),
            onDeleteWord: callbacks.onDeleteWord || (() => { })
        };

        // State
        this.isShiftActive = false;
        this.settings = this.loadSettings();

        // Keyboard layouts
        this.layouts = {
            primary: [
                ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "0"],
                ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
                ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
                ["ذ", "ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"]
            ],
            shift: [
                ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
                ["َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "»", "«", "÷", "×"],
                ["{", "}", "[", "]", "،", "؛", "'", "\"", "؟", "!", ":"],
                ["~", "٪", "@", "#", "$", "ـ", "-", "+", "=", "(", ")"]
            ]
        };

        // Audio context (shared for performance)
        this.audioContext = null;

        this.init();
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    init() {
        this.initAudioContext();
        this.applyTheme();
        this.applyKeySize();
        this.render();
        this.setupKeyboardShortcuts();
    }

    initAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        } catch {
            // AudioContext not available in this environment
        }
    }

    // ========================================================================
    // SETTINGS MANAGEMENT
    // ========================================================================

    loadSettings() {
        try {
            const saved = localStorage.getItem('ar-key-settings');
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('ar-key-settings', JSON.stringify(this.settings));
        } catch {
            // Settings save failed (e.g., localStorage unavailable)
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();

        if (key === 'theme') this.applyTheme();
        if (key === 'keySize') this.applyKeySize();

        this.emit('settingsChanged', { key, value });
    }

    // ========================================================================
    // THEMING
    // ========================================================================

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    toggleTheme() {
        const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.updateSetting('theme', newTheme);
    }

    applyKeySize() {
        const size = KEY_SIZES[this.settings.keySize] || KEY_SIZES.medium;
        document.documentElement.style.setProperty('--key-size', size);
    }

    // ========================================================================
    // RENDERING
    // ========================================================================

    render() {
        this.container.innerHTML = '';
        this.container.setAttribute('role', 'application');
        this.container.setAttribute('aria-label', 'لوحة مفاتيح عربية');

        const currentLayout = this.isShiftActive ? this.layouts.shift : this.layouts.primary;

        // Render character rows
        currentLayout.forEach((rowChars, rowIndex) => {
            const row = this.createRow();
            row.setAttribute('role', 'group');
            row.setAttribute('aria-label', `الصف ${rowIndex + 1}`);

            rowChars.forEach(char => {
                row.appendChild(this.createCharacterKey(char));
            });

            this.container.appendChild(row);
        });

        // Render control row
        this.container.appendChild(this.createControlRow());
    }

    createRow() {
        const row = document.createElement('div');
        row.className = 'keyboard-row';
        return row;
    }

    // ========================================================================
    // KEY CREATION
    // ========================================================================

    createCharacterKey(char) {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'key';
        key.innerText = char;
        key.setAttribute('aria-label', char);
        key.setAttribute('data-char', char);

        let wasPointerDown = false;

        key.addEventListener('pointerdown', (e) => {
            wasPointerDown = true;
            this.triggerFeedback();
            key.classList.add('active');
            this.showPopup(key, char);

            if (e.pointerType === 'mouse') {
                e.preventDefault();
                this.handleInput(char);
            }
        });

        key.addEventListener('pointerup', () => key.classList.remove('active'));
        key.addEventListener('pointerout', () => key.classList.remove('active'));

        key.addEventListener('click', (e) => {
            if (wasPointerDown && e.pointerType !== 'mouse') {
                this.handleInput(char);
            }
            wasPointerDown = false;
        });

        return key;
    }

    createControlRow() {
        const controlRow = this.createRow();
        controlRow.classList.add('control-row');

        // Shift Key
        const shiftKey = this.createFunctionKey('⇧', 'shift-key', () => {
            this.toggleShift();
        });
        shiftKey.setAttribute('aria-pressed', String(this.isShiftActive));
        shiftKey.setAttribute('aria-label', this.isShiftActive ? 'إلغاء التشكيل' : 'التشكيل والرموز');
        shiftKey.title = this.isShiftActive ? 'إلغاء التشكيل' : 'التشكيل والرموز';
        if (this.isShiftActive) shiftKey.classList.add('active-toggle');

        // Backspace Key with long-press
        const bkspKey = this.createBackspaceKey();

        // Space Key
        const spaceKey = this.createFunctionKey('', 'space', () => {
            this.handleInput(' ');
        });
        spaceKey.innerHTML = '<span class="space-label">مسافة</span>';
        spaceKey.setAttribute('aria-label', 'مسافة');
        spaceKey.title = 'مسافة';

        // Enter Key
        const enterKey = this.createFunctionKey('↵', '', () => {
            this.callbacks.onEnter();
        });
        enterKey.setAttribute('aria-label', 'سطر جديد');
        enterKey.title = 'سطر جديد';

        // Settings Key
        const settingsKey = this.createFunctionKey('⚙️', 'settings-key', () => {
            this.emit('openSettings');
        });
        settingsKey.setAttribute('aria-label', 'الإعدادات');
        settingsKey.title = 'الإعدادات';

        controlRow.append(shiftKey, bkspKey, spaceKey, enterKey, settingsKey);
        return controlRow;
    }

    createFunctionKey(label, extraClass, handler) {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = `key special ${extraClass}`.trim();
        key.innerText = label;

        let wasPointerDown = false;

        key.addEventListener('pointerdown', (e) => {
            wasPointerDown = true;
            this.triggerFeedback();
            key.classList.add('active');

            if (e.pointerType === 'mouse') {
                e.preventDefault();
                handler();
            }
        });

        key.addEventListener('pointerup', () => key.classList.remove('active'));
        key.addEventListener('pointerout', () => key.classList.remove('active'));

        key.addEventListener('click', (e) => {
            if (wasPointerDown && e.pointerType !== 'mouse') {
                handler();
            }
            wasPointerDown = false;
        });

        return key;
    }

    createBackspaceKey() {
        const key = document.createElement('button');
        key.type = 'button';
        key.className = 'key special backspace-key';
        key.innerHTML = '<span>⌫</span>';
        key.title = 'حذف';
        key.setAttribute('aria-label', 'حذف');

        let deleteTimer = null;
        let deleteInterval = null;
        let startTime = 0;

        const clearDelete = () => {
            clearTimeout(deleteTimer);
            clearInterval(deleteInterval);
            deleteTimer = null;
            deleteInterval = null;
            key.classList.remove('active');
        };

        const startRapidDelete = (e) => {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();

            this.callbacks.onDelete();
            this.triggerFeedback();
            key.classList.add('active');

            clearDelete();
            startTime = Date.now();

            deleteTimer = setTimeout(() => {
                deleteInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;

                    if (elapsed > 1500) {
                        this.callbacks.onDeleteWord();
                        this.vibrate(15);
                    } else {
                        this.callbacks.onDelete();
                        this.vibrate(5);
                    }
                }, 80);
            }, 400);
        };

        key.addEventListener('pointerdown', startRapidDelete);
        key.addEventListener('pointerup', clearDelete);
        key.addEventListener('pointerout', clearDelete);
        key.addEventListener('pointercancel', clearDelete);

        return key;
    }

    // ========================================================================
    // SHIFT FUNCTIONALITY
    // ========================================================================

    toggleShift() {
        this.isShiftActive = !this.isShiftActive;
        this.render();
        this.emit('shiftToggled', this.isShiftActive);
    }

    // ========================================================================
    // INPUT HANDLING
    // ========================================================================

    handleInput(char) {
        this.callbacks.onInput(char);
        this.emit('input', char);
    }

    // ========================================================================
    // KEYBOARD SHORTCUTS
    // ========================================================================

    setupKeyboardShortcuts() {
        this._onKeyDown = (e) => {
            if (e.key === 'Shift') {
                if (!this.isShiftActive) this.toggleShift();
            }
        };

        this._onKeyUp = (e) => {
            if (e.key === 'Shift') {
                if (this.isShiftActive) this.toggleShift();
            }
        };

        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
    }

    // ========================================================================
    // FEEDBACK
    // ========================================================================

    vibrate(duration = 20) {
        if (!this.settings.vibrationEnabled) return;
        if (navigator.vibrate) {
            try {
                navigator.vibrate(duration);
            } catch { /* Ignore */ }
        }
    }

    triggerFeedback() {
        this.vibrate(15);
        if (this.settings.soundEnabled) {
            this.playClickSound();
        }
    }

    playClickSound() {
        if (!this.audioContext) return;

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const now = this.audioContext.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch { /* Ignore audio errors */ }
    }

    // ========================================================================
    // KEY POPUP
    // ========================================================================

    showPopup(keyElement, char) {
        if (!keyElement || this.isShiftActive) return;

        const existing = keyElement.querySelector('.key-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'key-popup';
        popup.innerText = char;
        popup.setAttribute('aria-hidden', 'true');

        if (getComputedStyle(keyElement).position === 'static') {
            keyElement.style.position = 'relative';
        }

        keyElement.appendChild(popup);

        requestAnimationFrame(() => {
            setTimeout(() => popup.remove(), 180);
        });
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    getSettings() {
        return { ...this.settings };
    }

    setSound(enabled) {
        this.updateSetting('soundEnabled', enabled);
    }

    setVibration(enabled) {
        this.updateSetting('vibrationEnabled', enabled);
    }

    setKeySize(size) {
        if (KEY_SIZES[size]) {
            this.updateSetting('keySize', size);
        }
    }

    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
        if (this._onKeyUp) document.removeEventListener('keyup', this._onKeyUp);
        this.container.innerHTML = '';
        this.events = {};
    }
}

// ============================================================================
// FACTORY FUNCTION (Backward Compatibility)
// ============================================================================

export function createKeyboard(containerId, onInput, onDelete, onSpace, onEnter, onDeleteWord) {
    return new Keyboard(containerId, {
        onInput,
        onDelete,
        onSpace,
        onEnter,
        onDeleteWord
    });
}
