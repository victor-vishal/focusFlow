export class SessionTracker {
    constructor() {
        this.todayCountEl = document.getElementById('today-count');
        this.streakCountEl = document.getElementById('streak-count');
        this.weekChartEl = document.getElementById('week-chart');
        
        this.history = this.loadHistory();
        
        this.init();
        
        // Listen for completed work sessions
        document.addEventListener('timer:complete', (e) => {
            if (e.detail.mode === 'WORK') {
                this.addSession();
            }
        });
    }

    loadHistory() {
        const saved = localStorage.getItem('focusflow_history');
        return saved ? JSON.parse(saved) : {};
    }

    saveHistory() {
        localStorage.setItem('focusflow_history', JSON.stringify(this.history));
    }

    getTodayStr() {
        // Returns YYYY-MM-DD local time
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().split('T')[0];
    }

    addSession() {
        const today = this.getTodayStr();
        if (!this.history[today]) {
            this.history[today] = 0;
        }
        this.history[today]++;
        this.saveHistory();
        this.updateUI();
    }

    calculateStreak() {
        let streak = 0;
        let d = new Date();
        
        while (true) {
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            const dateStr = d.toISOString().split('T')[0];
            
            if (this.history[dateStr] && this.history[dateStr] > 0) {
                streak++;
            } else if (streak === 0 && dateStr === this.getTodayStr()) {
                // If today has 0, we still check yesterday before breaking
            } else {
                break;
            }
            d = new Date(d.getTime() - 86400000); // Subtract 1 day
        }
        return streak;
    }

    init() {
        this.updateUI();
    }

    updateUI() {
        const today = this.getTodayStr();
        const todayCount = this.history[today] || 0;
        
        this.todayCountEl.textContent = todayCount;
        this.streakCountEl.textContent = this.calculateStreak();
        
        this.renderChart();
    }

    renderChart() {
        this.weekChartEl.innerHTML = '';
        
        // Get last 7 days
        const days = [];
        const maxSessions = 10; // For chart scaling
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            
            const dateStr = d.toISOString().split('T')[0];
            const count = this.history[dateStr] || 0;
            
            // Short day name (e.g., 'Mon')
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = i === 0;
            
            days.push({ dayName, count, isToday });
        }

        const maxInHistory = Math.max(...days.map(d => d.count), 1);
        const chartMax = Math.max(maxSessions, maxInHistory);

        days.forEach(day => {
            const heightPercent = Math.max((day.count / chartMax) * 100, 5); // at least 5% height
            
            const group = document.createElement('div');
            group.className = 'flex-1 flex flex-col items-center gap-2 group h-full justify-end';
            
            let barClasses = 'w-full rounded-t-lg transition-all duration-200 ';
            let textClasses = 'text-[11px] ';
            let textContent = day.dayName.charAt(0);
            
            if (day.isToday) {
                barClasses += 'bg-gradient-to-t from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/30';
                textClasses += 'text-sky-400 font-bold';
                textContent = 'Today';
            } else {
                barClasses += 'bg-slate-700/50 group-hover:bg-sky-400';
                textClasses += 'text-slate-400 font-medium group-hover:text-white';
            }

            const bar = document.createElement('div');
            bar.className = barClasses;
            bar.style.height = `${heightPercent}%`;
            
            const label = document.createElement('span');
            label.className = textClasses;
            label.textContent = textContent;
            
            group.appendChild(bar);
            group.appendChild(label);
            this.weekChartEl.appendChild(group);
        });
    }
}
