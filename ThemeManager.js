class ThemeManager {
    constructor() {
        this.themes = ['modern', 'retro', 'space'];
        this.currentTheme = localStorage.getItem('wtomath-theme') || 'modern';
        this.canvas = null;
        this.animationFrameId = null;
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.applyTheme(this.currentTheme);
            this.setupSelector();
            this.setupSpaceCanvas();
        });
    }

    applyTheme(theme) {
        if (!this.themes.includes(theme)) theme = 'modern';
        
        this.themes.forEach(t => document.body.classList.remove(`theme-${t}`));
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('wtomath-theme', theme);
        this.currentTheme = theme;

        if (theme === 'space') {
            this.startSpaceAnimation();
            const bg = document.getElementById('space-bg');
            if (bg) bg.style.display = 'block';
        } else {
            this.stopSpaceAnimation();
            const bg = document.getElementById('space-bg');
            if (bg) bg.style.display = 'none';
        }

        // Trigger resize to fix chart dimensions if needed
        window.dispatchEvent(new Event('resize'));
    }

    setupSelector() {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
            themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    setupSpaceCanvas() {
        this.canvas = document.getElementById('space-bg');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'space-bg';
            document.body.prepend(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        
        for(let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2,
                speed: Math.random() * 0.05 + 0.01
            });
        }

        window.addEventListener('resize', () => {
            if(this.currentTheme === 'space') {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        });
    }

    startSpaceAnimation() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const animate = () => {
            this.ctx.fillStyle = 'rgba(10, 10, 30, 0.3)'; // Trailing effect
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffffff';
            this.stars.forEach(star => {
                this.ctx.beginPath();
                this.ctx.arc(star.x * this.canvas.width, star.y * this.canvas.height, star.size, 0, Math.PI * 2);
                this.ctx.fill();

                star.y += star.speed / 100; // very slow
                star.x -= star.speed / 200; 

                if (star.y > 1) star.y = 0;
                if (star.x < 0) star.x = 1;
            });

            this.animationFrameId = requestAnimationFrame(animate);
        };

        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        animate();
    }

    stopSpaceAnimation() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

const themeManager = new ThemeManager();
