"use strict";

/**
 * Paint App
 * @class
 * @author Dean Wagner <info@deanwagner.net>
 */
class Paint {

    // Class Properties
    pixels = 16;
    mouse  = false;
    paint  = 'custom';

    /**
     * Constructor
     * @constructor
     */
    constructor() {
        // Class Elements
        this.canvas       = document.getElementById('canvas');
        this.paintPicker  = document.getElementById('paint-color');
        this.gridPicker   = document.getElementById('grid-color');
        this.canvasPicker = document.getElementById('canvas-color');
        this.canvasSlider = document.getElementById('canvas-size');
        this.range        = document.getElementById('range');

        // LocalStorage
        this.storage = window.localStorage;

        // Check for Stored Image Size
        if (this.storage.hasOwnProperty('size')) {
            this.pixels = parseInt(this.storage.getItem('size'));
        }

        // Set Defaults
        this.setDefaults();

        // Build Grid
        this.buildGrid();

        // Check for Existing Image
        if (this.storage.hasOwnProperty('matrix')) {
            // Build Image from Stored Matrix
            const matrix = JSON.parse(this.storage.getItem('matrix'));
            const divs = this.canvas.getElementsByTagName('div');
            for (let i = 0; i < divs.length; i++) {
                divs[i].style.backgroundColor = matrix[i];
            }
        }

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
                this.canvas.classList.remove(...this.canvas.classList);
                if (e.target.checked) {
                    this.canvas.classList.add(e.target.value)
                    this.paint = e.target.value;
                }
            });
        }

        // Show/Hide Grid
        document.getElementById('grid-show').addEventListener('change', (e) => {
            const size = (e.target.checked) ? '1px' : '0';
            document.documentElement.style.setProperty('--grid-size', size);
        });

        // Clear Canvas
        document.getElementById('clear').addEventListener('click', (e) => {
            e.preventDefault();
            const divs = this.canvas.getElementsByTagName('div');
            for (let i = 0; i < divs.length; i++) {
                divs[i].style.backgroundColor = null;
            }
        });

        // Modal Close Button <X>
        const close = document.querySelectorAll('.close_modal');
        for (let i = 0; i < close.length; i++) {
            close[i].addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal(e.currentTarget.dataset.id);
            });
        }

        // <Save> Button
        document.getElementById('button_save').addEventListener('click', (e) => {
            e.preventDefault();

            // Check for Existing Image
            if (!this.storage.hasOwnProperty('size') || !this.storage.hasOwnProperty('matrix')) {
                // Show Modal for First Save
                this.openModal('save_modal');
            }

            // Build Matrix
            const matrix = [];
            const divs = this.canvas.getElementsByTagName('div');
            for (let i = 0; i < divs.length; i++) {
                matrix[i] = (divs[i].style.backgroundColor) ? divs[i].style.backgroundColor : null;
            }

            // Store Image
            this.storage.setItem('matrix', JSON.stringify(matrix));
            this.storage.setItem('size', this.canvasSlider.value);
            console.log('Image Saved');
        });

        // Save <OK> Button
        document.getElementById('save_confirm').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('save_modal');
        });

        // <Export> Button
        document.getElementById('button_export').addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal('export_modal');
        });
    }

    /**
     * Build Canvas Pixel Grid
     */
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

    /**
     * Get Paint Color based on Paint Type
     * @returns {string|null} - Paint Color or NULL to Erase
     */
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

    /**
     * Get Random Color
     * @returns {string} - Random RGB Color
     */
    randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return '#' + this.byteToHex(r) + this.byteToHex(g) + this.byteToHex(b);
    }

    /**
     * Convert RGB byte to Hex
     * @param   {number} byte - 0-255 Int
     * @returns {string} - Hex
     */
    byteToHex(byte) {
        const hex = byte.toString(16);
        return (hex.length === 1) ? '0' + hex : hex;
    }

    /**
     * Set All Values to Default
     */
    setDefaults() {
        // Default Colors
        this.paintPicker.value  = '#000000';
        this.gridPicker.value   = '#000000';
        this.canvasPicker.value = '#ffffff';

        // Default Values
        this.canvasSlider.value = this.pixels;
        document.getElementById('paint-custom').checked = true;
        document.getElementById('grid-show').checked = true;
    }

    /**
     * Open Modal
     * @param {string} id - Modal ID
     */
    openModal(id) {
        const mask  = document.getElementById('modal');
        const modal = document.getElementById(id);
        modal.style.display = 'block';
        mask.style.display = 'flex';
        mask.style.opacity = '1';
    }

    /**
     * Close Modal
     * @param {string} id - Modal ID
     */
    closeModal(id) {
        const mask  = document.getElementById('modal');
        const modal = document.getElementById(id);
        mask.style.opacity = '0';
        mask.style.display = 'none';
        modal.style.display = 'none';
    }
}