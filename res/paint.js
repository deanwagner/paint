class Paint {
    constructor() {
        // Class Properties
        this.pixels = 16;
        this.mouse  = false;
        this.paint  = 'custom';

        // Class Elements
        this.canvas       = document.getElementById('canvas');
        this.paintPicker  = document.getElementById('paint-color');
        this.gridPicker   = document.getElementById('grid-color');
        this.canvasPicker = document.getElementById('canvas-color');
        this.canvasSlider = document.getElementById('canvas-size');
        this.range        = document.getElementById('range');

        // Set to Default Colors
        this.paintPicker.value  = '#000000';
        this.gridPicker.value   = '#000000';
        this.canvasPicker.value = '#ffffff';

        // Build Grid
        this.buildGrid();

        // Mouse State Tracker
        document.body.addEventListener('mousedown', () => {
            this.mouse = true;
        });
        document.body.addEventListener('mouseup', () => {
            this.mouse = false;
        });

        // Change Paint Color
        this.paintPicker.addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--paint-color', e.target.value);
        });

        // Change Grid Color
        this.gridPicker.addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--grid-color', e.target.value);
        });

        // Change Canvas Color
        this.canvasPicker.addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--canvas-color', e.target.value);
        });

        // Change Canvas Size
        this.canvasSlider.addEventListener('input', (e) => {
            this.pixels = e.target.value;
            this.buildGrid();
        });

        // Change Paint Type
        const radio = document.getElementsByName('paint-type');
        for (let i = 0; i < radio.length; i++) {
            radio[i].addEventListener('change', (e) => {
                document.body.classList.remove(e.target.value);
                if (e.target.checked) {
                    document.body.classList.add(e.target.value)
                    this.paint = e.target.value;
                }
            });
        }

        // Show/Hide Grid
        const grid = document.getElementById('grid-show');
        grid.addEventListener('change', (e) => {
            const size = (e.target.checked) ? '1px' : '0';
            document.documentElement.style.setProperty('--grid-size', size);
        });

        // Clear Image
        const clear = document.getElementById('clear');
        clear.addEventListener('click', (e) => {
            e.preventDefault();
            const divs = this.canvas.getElementsByTagName('div');
            for (let i = 0; i < divs.length; i++) {
                divs[i].style.backgroundColor = null;
            }
        });
    }

    buildGrid() {
        // Empty Canvas
        this.canvas.innerHTML = '';

        // Update CSS Grid
        this.canvas.style.gridTemplateColumns = `repeat(${this.pixels}, 1fr)`;
        this.canvas.style.gridTemplateRows    = `repeat(${this.pixels}, 1fr)`;

        // Update Display
        this.range.innerText = this.pixels + ' × ' + this.pixels;

        // Insert Child DIVs
        for (let i = 0; i < (this.pixels * this.pixels); i++) {
            // Create DIV
            const div = document.createElement('div');

            // Event Listeners
            div.addEventListener('mousedown', (e) => {
                e.target.style.backgroundColor = this.getPaint();
            });
            div.addEventListener('mouseenter', (e) => {
                if (this.mouse) {
                    e.target.style.backgroundColor = this.getPaint();
                }
            });

            // Add to DOM
            this.canvas.appendChild(div);
        }
    }

    getPaint() {
        switch (true) {
            case (this.paint === 'custom'):
                return getComputedStyle(document.documentElement).getPropertyValue('--paint-color');
            case (this.paint === 'random'):
                return this.randomColor();
            default:
                return null;
        }
    }

    randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }
}