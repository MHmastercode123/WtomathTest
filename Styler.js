window.addEventListener("load", () => {
    const dropbtns = document.querySelectorAll('.dropbtn');
    const btns = [
        document.getElementById('btnDemoBisection'),
        document.getElementById('btnRegulaFalsi'),
        document.getElementById('btnDemoNewtonRaphson'),
        document.getElementById('btnDemoSecant'),
        document.getElementById('btnDemoFixedPoint')
    ].filter(Boolean);

    // Función global para resize
    const handleResize = () => {
        dropbtns.forEach(btn => adjustFont(btn, 20));
        btns.forEach(btn => adjustFont(btn, 20));
    };

    // Ejecutar al cargar
    handleResize();
    window.addEventListener('resize', handleResize);

    // Eventos hover para todos los dropbtn
    dropbtns.forEach(dropbtn => {
        dropbtn.addEventListener('mouseenter', () => {
            btns.forEach(btn => adjustFont(btn, 20));
        });
    });
});

function adjustFont(element, maxSize) {
    window.requestAnimationFrame(() => {
        let min = 1;
        let max = maxSize;
        let best = min;

        while (min <= max) {
            let mid = Math.floor((min + max) / 2);
            element.style.fontSize = mid + 'px';

            if (
                element.scrollWidth <= element.offsetWidth &&
                element.scrollHeight <= element.offsetHeight
            ) {
                best = mid;
                min = mid + 1; // Intenta más grande
            } else {
                max = mid - 1; // Reduce
            }
        }

        element.style.fontSize = best + 'px';
    });
}