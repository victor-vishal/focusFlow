export class SoundMixer {
    constructor() {
        this.audioCtx = null;
        this.isInitialized = false;
        
        this.sources = {
            rain: { active: false, gainNode: null, init: () => this.createRain() },
            wind: { active: false, gainNode: null, init: () => this.createWind() },
            fire: { active: false, gainNode: null, init: () => this.createFire() },
            noise: { active: false, gainNode: null, init: () => this.createWhiteNoise() }
        };

        this.initDOM();
    }

    initDOM() {
        // Toggles
        document.querySelectorAll('.sound-channel input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target.dataset.sound;
                const slider = document.querySelector(`.volume-slider[data-target="${target}"]`);
                
                slider.disabled = !e.target.checked;
                
                if (e.target.checked) {
                    this.startSound(target);
                } else {
                    this.stopSound(target);
                }
            });
        });

        // Sliders
        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const target = e.target.dataset.target;
                this.setVolume(target, e.target.value);
            });
        });
    }

    initAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        this.isInitialized = true;
    }

    startSound(type) {
        if (!this.isInitialized) {
            this.initAudioContext();
        }
        
        if (!this.sources[type].active) {
            this.sources[type].init();
            this.sources[type].active = true;
            
            // Set initial volume from slider
            const slider = document.querySelector(`.volume-slider[data-target="${type}"]`);
            this.setVolume(type, slider.value);
        }
    }

    stopSound(type) {
        if (this.sources[type].active && this.sources[type].gainNode) {
            // Fade out to avoid clicks
            this.sources[type].gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.1);
            setTimeout(() => {
                this.sources[type].active = false;
                // We keep the nodes connected but volume at 0 for simplicity, 
                // or we could disconnect/recreate them. For synthesized noise, keeping volume 0 is fine.
            }, 500);
        }
    }

    setVolume(type, value) {
        if (this.sources[type].gainNode) {
            // Value is 0-100, convert to 0.0 - 1.0 (with slight curve for better volume feel)
            const normalized = value / 100;
            const curved = Math.pow(normalized, 1.5);
            // Limit max volume so they don't blow out speakers
            const maxVolumeMap = { rain: 0.8, wind: 0.6, fire: 0.7, noise: 0.2 };
            
            this.sources[type].gainNode.gain.setTargetAtTime(curved * maxVolumeMap[type], this.audioCtx.currentTime, 0.1);
        }
    }

    // --- Sound Synthesis Generators ---
    
    _generateNoiseBuffer(type = 'white') {
        const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds of noise
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === 'brown') {
                // Brown noise approximation
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate gain
            } else {
                data[i] = white;
            }
        }
        return buffer;
    }

    _createNoiseSource(type = 'white') {
        const source = this.audioCtx.createBufferSource();
        source.buffer = this._generateNoiseBuffer(type);
        source.loop = true;
        return source;
    }

    createRain() {
        if (this.sources.rain.gainNode) return; // Already created

        const noise = this._createNoiseSource('white');
        
        // Filter to sound like rain (bandpass)
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.5;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = 0;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        noise.start();
        this.sources.rain.gainNode = gainNode;
    }

    createWind() {
        if (this.sources.wind.gainNode) return;

        const noise = this._createNoiseSource('brown');
        
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        filter.Q.value = 1;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = 0;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        noise.start();
        this.sources.wind.gainNode = gainNode;
    }

    createFire() {
        if (this.sources.fire.gainNode) return;
        
        const noise = this._createNoiseSource('brown');
        
        // Highpass to get crackles
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        // Crackle effect using a script processor or periodic LFO on gain is complex,
        // we'll use a simple filtered brown noise which somewhat sounds like a steady burn.
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = 0;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        noise.start();
        this.sources.fire.gainNode = gainNode;
    }

    createWhiteNoise() {
        if (this.sources.noise.gainNode) return;

        const noise = this._createNoiseSource('white');
        
        // Slight lowpass to remove harsh highs
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 5000;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = 0;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        noise.start();
        this.sources.noise.gainNode = gainNode;
    }
}
