export class Keyboard {
    constructor(containerId, onInput, onDelete, onSpace, onEnter, onDeleteWord) {
        this.container = document.getElementById(containerId);
        this.onInput = onInput;
        this.onDelete = onDelete;
        this.onSpace = onSpace;
        this.onEnter = onEnter;
        this.onDeleteWord = onDeleteWord;

        this.layout = [
            ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د"],
            ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
            ["ئ", "ء", "ؤ", "ر", "لا", "ى", "ة", "و", "ز", "ظ"]
        ];

        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        this.layout.forEach(rowChars => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';

            rowChars.forEach(char => {
                const key = this.createKey(char);
                rowDiv.appendChild(key);
            });

            this.container.appendChild(rowDiv);
        });

        // Add fourth row for Space and Controls
        const controlRow = document.createElement('div');
        controlRow.className = 'keyboard-row';

        // Backspace
        const bkspKey = this.createKey("⌫", "special"); // Backspace on Left as requested

        let deleteTimer = null;
        let deleteInterval = null;

        const clearDelete = () => {
            clearTimeout(deleteTimer);
            clearInterval(deleteInterval);
        };

        const startRapidDelete = (e) => {
            // Prevent default browser behaviors (selection, etc.)
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();

            // 1. Initial Delete
            this.handleInteraction(null, 'delete');
            this.triggerFeedback(); // Feedback for first press

            // 2. Setup Long Press (Rapid Fire)
            clearDelete(); // clear any existing

            const startTime = Date.now();

            deleteTimer = setTimeout(() => {
                deleteInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;

                    // After 1.5s of holding, switch to WORD deletion
                    if (elapsed > 1500) {
                        this.handleInteraction(null, 'deleteWord');
                        if (navigator.vibrate) navigator.vibrate(10); // Stronger vibrate
                    } else {
                        this.handleInteraction(null, 'delete');
                        if (navigator.vibrate) navigator.vibrate(5);
                    }
                }, 100); // 100ms speed
            }, 500); // 500ms delay before rapid fire
        };

        // Use pointerdown for both Mouse and Touch to enable Long Press
        bkspKey.addEventListener('pointerdown', startRapidDelete);

        // Stop on release or leaving the key
        bkspKey.addEventListener('pointerup', clearDelete);
        bkspKey.addEventListener('pointerout', clearDelete);
        bkspKey.addEventListener('pointercancel', clearDelete);

        // Thal (ذ) Key - Moved here as requested
        const thalKey = this.createKey("ذ");
        thalKey.addEventListener('pointerdown', (e) => {
            this.triggerFeedback();
            thalKey.classList.add('active');
            this.showPopup(thalKey, "ذ");
            this.handleInteraction("ذ", 'input');
        });
        // Add cleanup for active state if needed? createKey handles style?
        // createKey doesn't handle "active" class removal automatically for custom listeners unless we rely on CSS :active?
        // Actually our createKey implementation handles "click" usually. 
        // But for consistency with "instant pointerdown" pattern:
        thalKey.addEventListener('pointerup', () => thalKey.classList.remove('active'));
        thalKey.addEventListener('pointerout', () => thalKey.classList.remove('active'));


        // Space
        const spaceKey = this.createKey("مسافة", "special space");
        spaceKey.innerText = "_________";
        spaceKey.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') { e.preventDefault(); this.handleInteraction(' ', 'input'); }
        });
        spaceKey.addEventListener('click', (e) => {
            if (e.pointerType !== 'mouse') this.handleInteraction(' ', 'input');
        });

        // Enter
        // "Arrow make it like computer" -> Standard Enter Arrow ↵
        const enterKey = this.createKey("↵", "special");
        enterKey.title = "Enter";
        enterKey.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') { e.preventDefault(); this.handleInteraction(null, 'enter'); }
        });
        enterKey.addEventListener('click', (e) => {
            if (e.pointerType !== 'mouse') this.handleInteraction(null, 'enter');
        });

        // Order: [Backspace] [Thal] [Space] [Enter]
        controlRow.appendChild(bkspKey);
        controlRow.appendChild(thalKey);
        controlRow.appendChild(spaceKey);
        controlRow.appendChild(enterKey);
        this.container.appendChild(controlRow);
    }

    createKey(char, extraClass = '') {
        const key = document.createElement('div');
        key.className = `key ${extraClass}`;
        key.innerText = char;

        // Touch and Click handling
        // We use click for simplicity, but for "accessible" touch interaction, touchstart might be better for responsiveness.
        // However, fast click logic is handled by browsers well now.
        // Let's stick to click but add vibration.

        // Note: handling both 'click' and 'touchstart' might cause double events. 
        // We'll rely on 'click' which covers tap. 
        // But for the "Vibrate" and "Sound" immediate feedback, maybe 'pointerdown'?

        key.addEventListener('pointerdown', (e) => {
            this.triggerFeedback();
            key.classList.add('active');

            // Show Popup
            if (!extraClass.includes('special')) {
                this.showPopup(key, char);
            }

            // Instant typing for Mouse users (User Request: "Writing is with the mouse")
            // This makes it feel much snappier than waiting for 'click' (mouseup).
            if (e.pointerType === 'mouse') {
                e.preventDefault(); // Prevent text selection or focus loss
                if (!extraClass.includes('special')) {
                    this.handleInteraction(char, 'input');
                }
            }
        });

        key.addEventListener('pointerup', () => {
            key.classList.remove('active');
        });

        key.addEventListener('pointerout', () => {
            key.classList.remove('active');
        });

        // Handle Click (mostly for Touch where we want to scroll support, 
        // or if pointerdown didn't fire input)
        key.addEventListener('click', (e) => {
            // If it was a mouse click, we already handled it in pointerdown.
            // We only process if it wasn't handled (e.g., touch tap).
            if (e.pointerType === 'mouse') return;

            if (!extraClass.includes('special')) {
                this.handleInteraction(char, 'input');
            }
        });

        return key;
    }

    handleInteraction(val, type) {
        if (type === 'input') {
            this.onInput(val);
        } else if (type === 'delete') {
            this.onDelete();
        } else if (type === 'deleteWord') {
            // Need to add this callback to constructor or just expose it?
            // Constructor signature: (containerId, onInput, onDelete, onSpace, onEnter)
            // I'll assume onDelete can handle a "mode" or I add a new param.
            // To avoid breaking constructor signature too much, let's just make onDelete accept an arg or check main.js
            // But main.js passes `deleteText`.
            // Let's modify `main.js` to accept a count or mode.
            // For now, let's assume `this.onDelete` handles basic char. We need `this.onDeleteWord`.
            // I'll emit a custom event or just modify constructor.
            // Modifying constructor is cleaner.
            if (this.onDeleteWord) this.onDeleteWord();
        } else if (type === 'enter') {
            this.onEnter();
        }
    }

    triggerFeedback() {
        // Vibrate
        if (navigator.vibrate) {
            try { navigator.vibrate(20); } catch (e) { /* ignore */ }
        }

        // Sound - Web Audio API (Simple "Click" Pop)
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.05);
            }
        } catch (e) {
            console.error("Audio feedback failed", e);
        }
    }

    showPopup(keyElement, char) {
        if (!keyElement) return;
        const existing = keyElement.querySelector('.key-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.className = 'key-popup';
        popup.innerText = char;

        // Ensure relative positioning
        if (getComputedStyle(keyElement).position === 'static') {
            keyElement.style.position = 'relative';
        }
        keyElement.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 200);
    }
}
