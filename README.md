# Paint
### Paint-by-Pixel Image Creation App

Live Demo:  
https://deanwagner.github.io/paint/

![Project Screenshot](https://deanwagner.github.io/paint/img/paint-screenshot.png)

This project was created for the [Etch-a-Sketch assignment](https://www.theodinproject.com/paths/foundations/courses/foundations/lessons/etch-a-sketch-project) as part of [The Odin Project](https://www.theodinproject.com) curriculum. I met all the assignment objectives and then expanded on it with my own concepts to take it from an Etch-a-Sketch to a fully-functioning paint app--including the ability to save, export, and print.

I used `LocalStorage` to save the image within the browser so that it is stored between sessions. To export the image I loop through the `<div>` elements and build a pixel matrix based on their background color. I then use that pixel matrix to paint the image into a `<canvas>` element for display. From there I convert the contents of the `<canvas>` into a PNG Data URL so that it may be exported as a file to the user's device.

### Objectives

1. Website with 16x16 grid of square `<div>` elements
2. Change color of each `<div>` on mouse-over
3. A "clear" button to clear the grid
4. Adjustable grid size, no larger than 100x100
5. Option to use random color per pixel

### Scope Creep

* Save and restore current image
* Export image as downloadable PNG
* Custom printer CSS for printing image
* Paint on click (and drag) instead of just mouse-over
* Erase painted pixels
* Change grid color
* Show/hide grid
* Change canvas color
* Responsive Design
* PWA and A2HS support