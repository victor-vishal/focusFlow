export class Timer {
    constructor() {
        // Defaults in seconds
        this.DURATIONS = {
            WORK: 25 * 60,
            SHORT_BREAK: 5 * 60,
            LONG_BREAK: 15 * 60
        };

        this.currentMode = 'WORK';
        this.timeLeft = this.DURATIONS[this.currentMode];
        this.isRunning = false;
        this.intervalId = null;
        this.sessionsCompleted = 0;

        // DOM Elements
        this.timeDisplay = document.getElementById('time-display');
        this.statusDisplay = document.getElementById('status-display');
        this.startBtn = document.getElementById('start-btn');
        this.startBtnText = document.getElementById('start-btn-text');
        this.resetBtn = document.getElementById('reset-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.progressCircle = document.querySelector('.progress-ring__circle');

        // SVG Circle Setup
        const radius = this.progressCircle.r.baseVal.value;
        this.circumference = radius * 2 * Math.PI;
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = 0;

        this.init();
        this.requestNotificationPermission();
    }

    init() {
        this.updateDisplay();

        this.startBtn.addEventListener('click', () => this.toggle());
        this.resetBtn.addEventListener('click', () => this.reset());

        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.setMode(mode);
            });
        });

        document.addEventListener('settings:updated', (e) => {
            const newSettings = e.detail;
            this.DURATIONS = {
                WORK: newSettings.WORK * 60,
                SHORT_BREAK: newSettings.SHORT_BREAK * 60,
                LONG_BREAK: newSettings.LONG_BREAK * 60
            };
            
            if (!this.isRunning) {
                this.timeLeft = this.DURATIONS[this.currentMode];
                this.updateDisplay();
            }
        });
    }

    requestNotificationPermission() {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startBtnText.textContent = 'Pause';
        
        // Use performance.now() or Date.now() for accurate timing instead of just trusting setInterval
        this.expectedEndTime = Date.now() + (this.timeLeft * 1000);

        this.intervalId = setInterval(() => {
            const now = Date.now();
            this.timeLeft = Math.round((this.expectedEndTime - now) / 1000);

            if (this.timeLeft <= 0) {
                this.complete();
            } else {
                this.updateDisplay();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.startBtnText.textContent = 'Start';
        clearInterval(this.intervalId);
    }

    reset() {
        this.pause();
        this.timeLeft = this.DURATIONS[this.currentMode];
        this.updateDisplay();
    }

    setMode(mode) {
        this.pause();
        this.currentMode = mode;
        this.timeLeft = this.DURATIONS[this.currentMode];
        
        // Update UI
        this.modeBtns.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('bg-gradient-to-r', 'from-sky-500', 'to-indigo-600', 'text-white', 'shadow-lg', 'shadow-sky-500/25');
                btn.classList.remove('text-slate-400', 'hover:text-slate-200');
            } else {
                btn.classList.remove('bg-gradient-to-r', 'from-sky-500', 'to-indigo-600', 'text-white', 'shadow-lg', 'shadow-sky-500/25');
                btn.classList.add('text-slate-400', 'hover:text-slate-200');
            }
        });

        const statusTexts = {
            'WORK': 'Work Session',
            'SHORT_BREAK': 'Short Break',
            'LONG_BREAK': 'Long Break'
        };
        this.statusDisplay.textContent = statusTexts[mode];
        
        this.updateDisplay();
    }

    complete() {
        this.pause();
        this.timeLeft = 0;
        this.updateDisplay();
        
        // Show notification
        const messages = {
            'WORK': 'Work session complete! Take a break.',
            'SHORT_BREAK': 'Break is over. Back to work!',
            'LONG_BREAK': 'Long break complete. Ready to focus?'
        };
        
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("FocusFlow", { body: messages[this.currentMode] });
        }

        // Emit custom event for tracker and quotes
        const event = new CustomEvent('timer:complete', { 
            detail: { mode: this.currentMode } 
        });
        document.dispatchEvent(event);

        // Auto-switch modes based on pomodoro rules
        if (this.currentMode === 'WORK') {
            this.sessionsCompleted++;
            if (this.sessionsCompleted % 4 === 0) {
                this.setMode('LONG_BREAK');
            } else {
                this.setMode('SHORT_BREAK');
            }
        } else {
            this.setMode('WORK');
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timeDisplay.textContent = timeStr;
        document.title = `${timeStr} - FocusFlow`;

        // Update SVG Progress
        const totalDuration = this.DURATIONS[this.currentMode];
        const progress = this.timeLeft / totalDuration;
        const offset = this.circumference - (progress * this.circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }
}
