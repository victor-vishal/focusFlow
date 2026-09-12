export class SettingsManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('focusflow-settings')) || {
            WORK: 25,
            SHORT_BREAK: 5,
            LONG_BREAK: 15
        };

        this.modal = document.getElementById('settings-modal');
        this.settingsBtn = document.getElementById('settings-btn');
        this.closeBtn = document.getElementById('close-settings');
        this.saveBtn = document.getElementById('save-settings-btn');

        this.inputs = {
            WORK: document.getElementById('work-duration'),
            SHORT_BREAK: document.getElementById('short-break-duration'),
            LONG_BREAK: document.getElementById('long-break-duration')
        };

        this.init();
    }

    init() {
        this.backdrop = document.getElementById('close-settings-backdrop');
        
        this.settingsBtn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.saveBtn.addEventListener('click', () => this.save());

        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }
        
        // Dispatch immediately so other modules get the saved settings
        setTimeout(() => this.dispatchSettingsUpdate(), 0);
    }

    open() {
        this.inputs.WORK.value = this.settings.WORK;
        this.inputs.SHORT_BREAK.value = this.settings.SHORT_BREAK;
        this.inputs.LONG_BREAK.value = this.settings.LONG_BREAK;
        
        this.modal.classList.remove('hidden');
    }

    close() {
        this.modal.classList.add('hidden');
    }

    save() {
        this.settings.WORK = parseInt(this.inputs.WORK.value) || 25;
        this.settings.SHORT_BREAK = parseInt(this.inputs.SHORT_BREAK.value) || 5;
        this.settings.LONG_BREAK = parseInt(this.inputs.LONG_BREAK.value) || 15;

        localStorage.setItem('focusflow-settings', JSON.stringify(this.settings));
        
        this.dispatchSettingsUpdate();
        this.close();
    }
    
    dispatchSettingsUpdate() {
        const event = new CustomEvent('settings:updated', {
            detail: this.settings
        });
        document.dispatchEvent(event);
    }
}
