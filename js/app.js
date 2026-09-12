import { ThemeManager } from './theme.js';
import { Timer } from './timer.js';
import { SoundMixer } from './sounds.js';
import { SessionTracker } from './tracker.js';
import { QuoteManager } from './quotes.js';
import { TaskManager } from './tasks.js';
import { SettingsManager } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    const themeManager = new ThemeManager();
    const settingsManager = new SettingsManager();
    const timer = new Timer();
    const soundMixer = new SoundMixer();
    const sessionTracker = new SessionTracker();
    const quoteManager = new QuoteManager();
    const taskManager = new TaskManager();

    // The modules handle their own DOM events and internal state.
    // They communicate via custom DOM events (e.g., 'timer:complete') 
    // dispatched on the document object.

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => console.log('ServiceWorker registered'))
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }
});
