export class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.moonIcon = document.getElementById('moon-icon');
        this.sunIcon = document.getElementById('sun-icon');
        
        this.init();
    }

    init() {
        // Initial setup based on localStorage or system preference
        this.applyTheme(this.getCurrentTheme());
        
        // Listen for manual toggle
        this.themeToggleBtn.addEventListener('click', () => {
            const current = this.getCurrentTheme();
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            this.setTheme(newTheme);
        });

        // Listen for system theme changes (if user hasn't overridden)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('color-scheme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    getCurrentTheme() {
        // Check localStorage first
        const saved = localStorage.getItem('color-scheme');
        if (saved) return saved;

        // Fallback to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setTheme(theme) {
        localStorage.setItem('color-scheme', theme);
        this.applyTheme(theme);
    }

    applyTheme(theme) {
        // Update DOM attributes
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        const metaCS = document.querySelector('meta[name="color-scheme"]');
        if (metaCS) metaCS.content = theme;

        // Update Icons
        if (theme === 'dark') {
            this.moonIcon.classList.add('hidden');
            this.sunIcon.classList.remove('hidden');
        } else {
            this.moonIcon.classList.remove('hidden');
            this.sunIcon.classList.add('hidden');
        }
    }
}
