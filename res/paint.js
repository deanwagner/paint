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

        // Check for Existing Pixel Matrix
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
            this.storeImage();
        });

        // Save <OK> Button
        document.getElementById('save_confirm').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('save_modal');
        });

        // <Restore> Button
        document.getElementById('button_restore').addEventListener('click', (e) => {
            e.preventDefault();
            location.reload();
        });

        // <Export> Button
        document.getElementById('button_export').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportImage();
        });

        // <Export as File> Button
        document.getElementById('download_image').addEventListener('click', (e) => {
            this.closeModal('export_modal');
        });

        // <Print> Button
        document.getElementById('button_print').addEventListener('click', (e) => {
            e.preventDefault();
            window.print();
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
     * Store Image in LocalStorage
     */
    storeImage() {
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
    }

    /**
     * Port <grid> to <canvas>
     */
    exportImage() {
        // Set up Canvas
        const actualCanvas  = document.getElementById('actual_canvas');
        const canvasContext = actualCanvas.getContext('2d');
        actualCanvas.height = this.pixels;
        actualCanvas.width  = this.pixels;

        // Build Pixel Matrix from Grid
        const matrix = [];
        const divs = this.canvas.getElementsByTagName('div');
        for (let i = 0; i < divs.length; i++) {
            const css = (divs[i].style.backgroundColor) ? divs[i].style.backgroundColor : null;
            if (css) {
                const rgb = css.replace('rgb(', '').replace(')', '').split(', ');
                matrix.push(parseInt(rgb[0]));
                matrix.push(parseInt(rgb[1]));
                matrix.push(parseInt(rgb[2]));
                matrix.push(255);
            } else {
                matrix.push(0);
                matrix.push(0);
                matrix.push(0);
                matrix.push(0);
            }
        }

        // Create Image from Pixel Matrix
        const actualImage = canvasContext.createImageData(this.pixels, this.pixels);
        actualImage.data.set(matrix);

        // Add Image to Canvas
        canvasContext.putImageData(actualImage, 0, 0);

        // Create Download Link
        document.getElementById('download_image').href = actualCanvas.toDataURL('image/png');

        // Open Modal
        this.openModal('export_modal');
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
        return `rgb(${r}, ${g}, ${b})`
    }

    /*
     * Convert RGB byte to Hex Value
     * @param   {number} byte - 0-255 Int
     * @returns {string} - Hex Value
     *
    byteToHex(byte) {
        const hex = byte.toString(16);
        return (hex.length === 1) ? '0' + hex : hex;
    }

    /*
     * Convert RGB bytes to Hex Value
     * @param   {number} r - 0-255 Int
     * @param   {number} g - 0-255 Int
     * @param   {number} b - 0-255 Int
     * @returns {string} - Hex Value
     *
    rgbToHex(r, g, b) {
        const red = this.byteToHex(r);
        const grn = this.byteToHex(g);
        const blu = this.byteToHex(b);
        return '#' + red + grn + blu;
    }

    /*
     * Convert Hex Value to RGBA bytes
     * @param   {string|null} hex - Hex Value
     * @returns {object} - color.r, color.g, color.b
     *
    hexToRgba(hex) {
        let rgba;

        if (hex) {
            rgba = {
                r : parseInt(hex.substring(1, 2), 16),
                g : parseInt(hex.substring(3, 4), 16),
                b : parseInt(hex.substring(5, 6), 16),
                a : 255
            };
        } else {
            rgba = { r : 0, g : 0, b : 0, a : 0 };
        }

        return rgba;
    }
    */

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