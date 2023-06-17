document.addEventListener("DOMContentLoaded", function () {
    const coords = {x: 0, y: 0};
    const circles = document.querySelectorAll(".circle");

    circles.forEach(function (circle) {
        circle.x = 0;
        circle.y = 0;
    });

    /**
     * Detecta el movimiento del mouse en la página principal
     * @window
     * @param {e} event - evento del mouse
     * @return no retorna un valor
     */
    window.addEventListener("mousemove", function (e) {
        coords.x = e.pageX;
        coords.y = e.pageY;

        animateCircles();
    });

    /**
     * Anima los círculos que se muestran en la página principal para que se muevan con el mouse
     * @animateCircles
     * @param {none} none -no toma ningun parametro
     * @return no retorna un valor
     */
    function animateCircles() {
        let x = coords.x;
        let y = coords.y;

        circles.forEach(function (circle, index) {
            circle.style.left = coords.x - 12 + "px";
            circle.style.top = coords.y - 12 + "px";

            circle.style.scale = (circles.length - index) / circles.length;

            circle.x = x;
            circle.y = y;

            const nextCircle = circles[index + 1] || circles[0];
            coords.x += (nextCircle.x - circle.x) * .35;
            coords.y += (nextCircle.y - circle.y) * .35;
        });
    }
});
