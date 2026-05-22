import { BisectionMethod } from "./methods/BisectionLogistic.js";
import { RegulaFalsiMethod } from "./methods/RegulaFalsiLogistic.js";
import { NewtonRaphsonMethod, NewtonRaphsonSystemMethod } from "./methods/NewtonRaphsonLogistic.js";
import { SecantMethod } from "./methods/SecantLogistic.js";
import { FixedPointMethod } from "./methods/FixedPointLogistic.js";
import { MullerMethod } from "./methods/MullerLogistic.js";
import { BairstowMethod } from "./methods/BairstowLogistic.js";
import { NewtonHornerMethod } from "./methods/NewtonHornerLogistic.js";
import { loadSmartAnalyzer } from "./SmartAnalyzer.js";
import { loadSmartSystemAnalyzer } from "./SmartMatrixAnalyzer.js";
import { loadCalcTaylor } from "./methods/SeriesLogistic.js";
// OPERACIONES AL CARGAR EL DOM //
function initUI() {
    if (window._uiInitialized) return;
    window._uiInitialized = true;

    const navLinks = document.querySelectorAll('.nav-link');
    const dropZone = document.getElementById('mathContainer');

    let customGhost = null;

    navLinks.forEach(link => {
        // Fix clicks
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const method = link.getAttribute('data-method');
            if (method) triggerMethodLoad(method);
        });

        // Drag Start
        link.addEventListener('dragstart', (e) => {
            link.classList.add('dragging');
            e.dataTransfer.setData('text/plain', link.getAttribute('data-method'));
            e.dataTransfer.effectAllowed = "copy";

            // Ocultar la imagen fantasma nativa con una imagen transparente
            const transparentImage = new Image();
            transparentImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(transparentImage, 0, 0);

            // Crear nuestro propio fantasma personalizado que podemos animar
            customGhost = document.createElement('div');
            customGhost.className = 'ghost-dragging swinging';
            customGhost.innerHTML = link.innerHTML;
            document.body.appendChild(customGhost);
        });

        // Track Drag to move custom ghost
        link.addEventListener('drag', (e) => {
            if (e.clientX === 0 && e.clientY === 0) return; // Ignorar el último evento a 0,0
            if (customGhost) {
                customGhost.style.left = e.clientX + 'px';
                customGhost.style.top = e.clientY + 'px';
            }
        });

        // Drag End
        link.addEventListener('dragend', () => {
            link.classList.remove('dragging');
            if (customGhost) {
                customGhost.remove();
                customGhost = null;
            }
        });
    });

    if (dropZone) {
        dropZone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir el drop
            e.dataTransfer.dropEffect = "copy";
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            const method = e.dataTransfer.getData('text/plain');
            if (method) {
                // Crear el botón cayendo
                const fallElement = document.createElement('div');
                fallElement.className = 'falling-button';

                const originalLink = Array.from(navLinks).find(l => l.getAttribute('data-method') === method);
                fallElement.innerHTML = originalLink ? originalLink.innerHTML : method;

                // Posicionarlo exactamente donde se soltó el mouse
                fallElement.style.left = `${e.clientX}px`;
                fallElement.style.top = `${e.clientY}px`;
                document.body.appendChild(fallElement);

                // Animar el botón cayendo en su lugar hacia abajo
                const animation = fallElement.animate([
                    { left: `${e.clientX}px`, top: `${e.clientY}px`, transform: 'translate(-50%, -20%) rotate(5deg) scale(1)', opacity: 1 },
                    { left: `${e.clientX}px`, top: `${e.clientY + 40}px`, transform: 'translate(-50%, -20%) rotate(0deg) scale(1.1)', opacity: 0.8, offset: 0.5 },
                    { left: `${e.clientX}px`, top: `${e.clientY + 100}px`, transform: 'translate(-50%, -20%) rotate(-5deg) scale(0.8)', opacity: 0 }
                ], {
                    duration: 400,
                    easing: 'ease-in'
                });

                animation.onfinish = () => {
                    fallElement.remove();
                    triggerMethodLoad(method);
                    let canvas = document.getElementById("grafica");
                    canvas.style.display = "none";
                };
            }
        });
    }
}

// En los módulos (type="module"), el DOM ya está listo cuando se ejecutan.
initUI();
// Para máxima seguridad, si algún navegador extraño no lo tiene listo:
document.addEventListener('DOMContentLoaded', initUI);
window.addEventListener('load', initUI);

window.triggerMethodLoad = triggerMethodLoad;

function triggerMethodLoad(method) {
    if (method === "Analizador Inteligente") {
        loadSmartAnalyzer();
        return;
    }
    if (method === "Analizador de Sistemas") {
        loadSmartSystemAnalyzer();
        return;
    }
    if (method === "Taylor") {
        loadCalcTaylor();
        return;
    }
    if (method === "Maclaurin") {
        loadCalcTaylor();
        setTimeout(() => {
            const aInput = document.getElementById("aInput");
            if (aInput) aInput.value = "0";
        }, 50);
        return;
    }

    loadRootSearcher(method);
    // Aplicar animación de caída al formulario generado
    const form = document.getElementById("mathForm_RootSearcher");
    if (form) {
        form.classList.add("drop-animate");
    }
}
// ============================ //


// CREAR ARCHIVO DE EXCEL CON LOS DATOS OBTENIDOS //
async function createExcelFile() {
    // 1. Crear libro
    const workbook = new ExcelJS.Workbook();

    // 2. Crear hoja
    const sheet = workbook.addWorksheet("WToMath");

    // 3. Agregar encabezados
    const header = sheet.addRow(
        ["Iteración", "a", "c", "b", "f(a)", "f(c)", "f(b)", "Ec%"]
    );

    // 🎨 Estilos (aquí empieza lo importante)
    header.eachCell(cell => {
        cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF0070C0" }
        };

        cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true
        };

        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    // 4. Datos + fórmula
    sheet.addRow(["Juan", 20, { formula: "B2*2" }]);
    sheet.addRow(["Ana", 25, { formula: "B3*2" }]);

    // 5. Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();

    // 6. Descargar
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte.xlsx"; +
        link.click();
}
// ============================================== //


// COLOCAR EL TITULO DEL MÉTODO ANTES DE CARGAR EL FORMULARIO //
function prepareTitle(method) {
    const lblTitle = document.createElement("div");
    lblTitle.id = "lblTitle";

    const Title = document.createElement("h2");
    Title.id = "Title";
    Title.className = "math-title";
    Title.innerHTML = `<i class="fa-solid fa-square-root-variable"></i> Método de ${method}`;

    lblTitle.appendChild(Title);
    document.getElementById("mathContainer").appendChild(lblTitle);
}
// ========================================================== //


// CONVERSOR DE FORMATO LATEX A FUNCION MATEMATICA //
function latexToMathExpr(latex) {
    let expr = latex
        // 1. Limpiar espacios y saltos
        .replace(/\n/g, '')
        .replace(/\s+/g, '');

    // Convert curly brace superscripts to parentheses and replace unicode minus
    expr = expr.replace(/\^{([^}]*)}/g, '^($1)').replace(/−/g, '-');

    // Eliminar f(x)=, P(x)=, y=, etc. o convertir A=B a (A)-(B)
    if (expr.includes('=')) {
        const parts = expr.split('=');
        const leftSide = parts[0];
        const rightSide = parts.slice(1).join('=');
        
        if (rightSide === "") {
            expr = leftSide;
        } else {
            const isFunctionDecl = /^([a-zA-Z][a-zA-Z0-9_]*\([xX]\)|[yY])$/.test(leftSide);
            if (isFunctionDecl) {
                expr = rightSide;
            } else {
                expr = `(${leftSide})-(${rightSide})`;
            }
        }
    }

    return expr
        // 2. Eliminar left/right
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')

        // 3. Normalizar funciones SIN backslash primero (IMPORTANTE)
        .replace(/\bln\b/g, 'log')
        .replace(/\blog\b/g, 'log')
        .replace(/\bsin\b/g, 'sin')
        .replace(/\bcos\b/g, 'cos')
        .replace(/\btan\b/g, 'tan')
        .replace(/\bexp\b/g, 'exp')

        // 4. Proteger funciones con backslash
        .replace(/\\sin/g, '§sin')
        .replace(/\\cos/g, '§cos')
        .replace(/\\tan/g, '§tan')
        .replace(/\\sec/g, '§sec')
        .replace(/\\csc/g, '§csc')
        .replace(/\\cot/g, '§cot')
        .replace(/\\log/g, '§log')
        .replace(/\\ln/g, '§log')
        .replace(/\\exp/g, '§exp')

        // 5. Log con base
        .replace(/\\log_\{([^}]*)\}\(([^)]*)\)/g, 'log($2,$1)')
        .replace(/\\log_\{([^}]*)\}\{([^}]*)\}/g, 'log($2,$1)')
        .replace(/\\log_([0-9a-zA-Z]+)\(([^)]*)\)/g, 'log($2,$1)')

        // 6. Fracciones
        .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')

        // 7. Raíces
        .replace(/\\sqrt{([^}]*)}/g, 'sqrt($1)')

        // 8. Factorial
        .replace(/([0-9]+)!/g, 'factorial($1)')

        // 9. Constantes
        .replace(/\\pi/g, 'pi')

        // 10. Euler (e^x)
        .replace(/e\^{([^}]*)}/g, 'exp($1)')
        .replace(/§exp\(([^)]*)\)/g, 'exp($1)')

        // 11. Potencias (más seguras)
        .replace(/([a-zA-Z0-9\)\]])\^{([^}]*)}/g, 'pow($1,$2)')
        .replace(/([a-zA-Z0-9\)\]])\^([a-zA-Z0-9]+)/g, 'pow($1,$2)')

        // 12. Operadores
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\div/g, '/')

        // 13. Restaurar funciones
        .replace(/§/g, '');
}
// =============================================== //


// CONVERSOR DE FORMATO LATEX A ECUACIÓN MATEMÁTICA //
function latexToMathEquation(expr) {
    return expr
        .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)') // fracciones
        .replace(/\\left|\\right/g, '') // quitar left/right
        .replace(/\\/g, '') // quitar \ restantes
        .trim();
}
// ================================================ //


// LIMPIAR PANEL //
function clearDisplay(display) {
    display.innerHTML = "";
    display.style.visibility = "hidden";
}
// ============= //


// LIMPIAR CONTENEDOR PADRE //
function clearMathContainer() {
    document.getElementById("mathContainer").innerHTML = "";
}
// ======================== //


// FUNCION PARA CALCULAR LAS RAICES //
function RootSearcher(method, repeatOption) {
    if (method === undefined || method === "", method === null) {
        alert("OPERATION ERROR - No se ha elegido un método para encontrar las raíces.")
        clearMathContainer()
        return;
    };

    const rootSearchBox = document.getElementById("RootSearchBox");
    rootSearchBox.style.display = "block";

    const graphicDisplay = document.getElementById("graphicDisplay");

    if (method === "Bairstow") graphicDisplay.style.display = "none";
    else graphicDisplay.style.display = "block";

    // LIMPIEZA DE PANELES AL RECALCULAR //
    let functionDisplay = document.getElementById("functionDisplay");

    if (functionDisplay) clearDisplay(functionDisplay);

    let tableDisplay = document.getElementById("tableDisplay");

    if (tableDisplay) clearDisplay(tableDisplay);
    tableDisplay.style.visibility = "visible"
    // ================================= //


    // OBTENER VALORES DE LOS CAMPOS EN EL FORMULARIO //
    const { error, data } = obtainFormValues(method, repeatOption);

    if (error) return;

    if (method === "Newton Raphson" && data.nrType && data.nrType !== "single") {
        const rootSearchBox = document.getElementById("RootSearchBox");
        rootSearchBox.style.display = "block";

        const graphicDisplay = document.getElementById("graphicDisplay");
        graphicDisplay.style.display = "block";

        let functionDisplay = document.getElementById("functionDisplay");
        if (functionDisplay) clearDisplay(functionDisplay);

        let tableDisplay = document.getElementById("tableDisplay");
        if (tableDisplay) clearDisplay(tableDisplay);
        tableDisplay.style.visibility = "visible";

        NewtonRaphsonSystemMethod(
            data.nrType,
            data.equations,
            data.initialGuesses,
            data.iInputValue,
            data.eInputValue,
            repeatOption
        );
        return;
    }

    const g = data.g;
    const xValue = data.xInputValue;
    const lambdaValue = data.lambdaInputValue;

    const mathFunction = data.mathFunction;
    const mathEquation = data.mathEquation;

    // Si es Bisección, Regla Falsa
    const aInterval = data.aInputValue;
    const bInterval = data.bInputValue;

    // Si es Newton Raphson o Newton Horner
    const approach = data.xoInputValue;

    // Si es Secante
    const firstApproach = data.firstxoInputValue;
    const secondApproach = data.secondxoInputValue;

    // Si es Müller
    const xFirstValue = data.firstxInputValue;
    const xSecondValue = data.secondxInputValue;
    const xThirdValue = data.thirdxInputValue;

    const iterations = data.iInputValue;
    const epsilon = data.eInputValue;
    // ============================================== //


    // VALIDAR QUE LOS DATOS SEAN COHERENTES //
    if (aInterval >= bInterval) {
        alert("VALUE ERROR - Los intervalos no pueden ser iguales y el valor de 'a' debe ser menor que 'b'.");
        return;
    }

    if (iterations <= 0) {
        alert("VALUE ERROR - La cantidad de iteraciones debe ser mayor que 0.");
        return;
    }

    if (iterations > 30000) {
        alert("MAX VALUE ERROR - La cantidad máxima de iteraciones permitidas es de 100,000.");
        return;
    }

    if (epsilon < 0) {
        alert("VALUE ERROR - No se acepta una tolerancia menor de 0.");
        return;
    }
    // ===================================== //


    // IMPRIMIR DATOS INICIALES //
    console.clear();
    if (method !== "Punto Fijo" && method !== "Müller" && method !== "Bairstow") console.log(`Función: ${mathFunction}`);
    else console.log(`Ecuación: ${mathEquation}`);

    if (method === "Bisección" || method === "Regla Falsa") {
        console.log(`Intervalo A: ${aInterval}`);
        console.log(`Intervalo B: ${bInterval}`);
    }

    if (method === "Newton Raphson") {
        console.log(`Aproximación: ${approach}`);
    }

    if (repeatOption === "Definir Iteraciones") console.log(`Iteraciones: ${iterations}`);
    console.log(`Epsilon: ${epsilon}`);
    // ======================== //


    // REALIZAR OPERACIONES SEGÚN EL MÉTODO //
    console.log("");
    console.log(`Método: ${method}`);
    console.log("");

    let expr = "";

    if (method !== "Punto Fijo" && method !== "Müller" && method !== "Bairstow") {
        expr = mathFunction.toString();
    }
    else {
        expr = mathEquation.toString();
    }

    // separar en lados
    if (expr.includes("=")) {
        const parts = expr.split("=");
        const left = parts[0];
        const right = parts.slice(1).join("=");
        if (right.trim() === "") {
            expr = left;
        } else {
            expr = `(${left}) - (${right})`;
        }
    }


    // compilar expresión
    const compiled = math.compile(expr);

    // generar puntos
    function generarDatos(inicio, fin, paso) {
        const puntos = [];

        for (let x = inicio; x <= fin; x += paso) {
            let y;

            try {
                y = compiled.evaluate({ x });
            } catch {
                y = null;
            }

            puntos.push({ x, y });
        }

        return puntos;
    }

    const datos = generarDatos(-10, 10, 0.1);

    const canvas = document.getElementById('grafica');
    if (!canvas) return;

    canvas.style.display = "block";
    // buscar gráfica existente
    const existingChart = Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    // crear gráfica
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: mathFunction.toString(),
                data: datos,
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            parsing: false,
            scales: {
                x: {
                    type: 'linear',
                    grid: {
                        display: true,
                        color: (ctx) => {
                            return ctx.tick.value === 0 ? '#ffffff' : 'transparent';
                        },
                        lineWidth: (ctx) => {
                            return ctx.tick.value === 0 ? 2 : 0;
                        }
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    grid: {
                        display: true,
                        color: (ctx) => {
                            return ctx.tick.value === 0 ? '#ffffff' : 'transparent';
                        },
                        lineWidth: (ctx) => {
                            return ctx.tick.value === 0 ? 2 : 0;
                        }
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }

    });

    switch (method) {
        case "Bisección":
            BisectionMethod(
                mathFunction,
                aInterval,
                bInterval,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Regla Falsa":
            RegulaFalsiMethod(
                mathFunction,
                aInterval,
                bInterval,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Newton Raphson":
            NewtonRaphsonMethod(
                mathFunction,
                approach,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Secante":
            SecantMethod(
                mathFunction,
                firstApproach,
                secondApproach,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Punto Fijo":
            FixedPointMethod(
                g,
                xValue,
                lambdaValue,
                mathEquation,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Müller":
            MullerMethod(
                mathFunction,
                xFirstValue,
                xSecondValue,
                xThirdValue,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Bairstow":
            BairstowMethod(
                mathFunction,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        case "Newton Horner":
            NewtonHornerMethod(
                mathFunction,
                approach,
                iterations,
                epsilon,
                repeatOption
            );
            break;
        default:
            alert("No se proporcionó un método de búsqueda válido...");
            break;
    }
    // ==================================== //
}
// ================================ //


// FUNCION PARA EVALUAR FUNCIONES //
export function evaluateFunction(
    mathFunction,
    xValue
) {
    let result = mathFunction.evaluate({ x: xValue });
    let lessThanZero;

    if (result < 0) {
        lessThanZero = true;
    }
    else {
        lessThanZero = false;
    }

    return {
        lessThanZero,
        result
    };
}
// ============================== //


// FUNCIÓN PARA CARGAR DATOS DEL FORMULARIO //
function obtainFormValues(method, repeatOption) {
    // OBTENCION DE LA FUNCION MATEMATICA O ECUACIÓN //
    let functionInput;
    let equationInput;

    let mathFunction;
    let mathEquation;

    let g;
    let xInputValue;
    let lambdaInputValue;

    const nrTypeSelect = document.getElementById("nrTypeSelect");
    const nrType = nrTypeSelect ? nrTypeSelect.value : "single";

    if (method === "Newton Raphson" && nrType !== "single") {
        let eq1Input = document.getElementById("eq1Input");
        let eq2Input = document.getElementById("eq2Input");
        let eq3Input = document.getElementById("eq3Input");

        let equations = [];
        if (eq1Input) equations.push(latexToMathExpr(eq1Input.value));
        if (eq2Input) equations.push(latexToMathExpr(eq2Input.value));
        if (eq3Input && nrType === "system3") equations.push(latexToMathExpr(eq3Input.value));

        for (let i = 0; i < equations.length; i++) {
            if (!equations[i] || equations[i].trim() === "") {
                alert(`EMPTY FIELD ERROR - La ecuación ${i+1} no puede estar vacía.`);
                return { error: true, data: null };
            }
        }

        let xoInput = document.getElementById("xoInput");
        let yoInput = document.getElementById("yoInput");
        let zoInput = document.getElementById("zoInput");

        let initialGuesses = [];
        let x0Val, y0Val, z0Val;
        try {
            if (xoInput) x0Val = math.parse(latexToMathExpr(xoInput.value)).evaluate();
            if (yoInput) y0Val = math.parse(latexToMathExpr(yoInput.value)).evaluate();
            if (zoInput && nrType === "system3") z0Val = math.parse(latexToMathExpr(zoInput.value)).evaluate();
        } catch (e) {
            alert("SYNTAX ERROR - Los valores iniciales no son válidos.");
            return { error: true, data: null };
        }

        if (x0Val === undefined || isNaN(x0Val) || !isFinite(x0Val)) {
            alert("TYPE ERROR - La aproximación inicial x0 debe ser un número válido.");
            return { error: true, data: null };
        }
        initialGuesses.push(x0Val);

        if (y0Val === undefined || isNaN(y0Val) || !isFinite(y0Val)) {
            alert("TYPE ERROR - La aproximación inicial y0 debe ser un número válido.");
            return { error: true, data: null };
        }
        initialGuesses.push(y0Val);

        if (nrType === "system3") {
            if (z0Val === undefined || isNaN(z0Val) || !isFinite(z0Val)) {
                alert("TYPE ERROR - La aproximación inicial z0 debe ser un número válido.");
                return { error: true, data: null };
            }
            initialGuesses.push(z0Val);
        }

        let iInputValue = 100;
        if (repeatOption === "Definir Iteraciones") {
            const iInput = document.getElementById("iInput");
            try {
                iInputValue = math.parse(latexToMathExpr(iInput.value)).evaluate();
            } catch (e) {
                alert("SYNTAX ERROR - La cantidad de iteraciones no es válida.");
                return { error: true, data: null };
            }
            if (!Number.isInteger(iInputValue) || iInputValue <= 0) {
                alert("TYPE ERROR - Las iteraciones deben ser un entero positivo.");
                return { error: true, data: null };
            }
        }

        const eInput = document.getElementById("eInput");
        let eInputValue;
        try {
            let eInputToMath = latexToMathExpr(eInput.value);
            eInputValue = math.parse(eInputToMath).evaluate();
        } catch (e) {
            alert("SYNTAX ERROR - La tolerancia no es válida.");
            return { error: true, data: null };
        }
        if (eInputValue <= 0 || isNaN(eInputValue)) {
            alert("TYPE ERROR - La tolerancia debe ser un número positivo.");
            return { error: true, data: null };
        }

        return {
            error: false,
            data: {
                nrType,
                equations,
                initialGuesses,
                iInputValue,
                eInputValue
            }
        };
    } else if (method !== "Punto Fijo" && method !== "Müller" && method !== "Bairstow" && method !== "Newton Horner") {
        functionInput = document.getElementById("functionInput");
        let functionInputLatex = functionInput.value;

        if (!functionInputLatex.includes('x')) {
            alert("La expresión debe contener al menos una 'x'");
            return {
                error: true,
                data: null
            }
        }

        try {
            mathFunction = math.parse(latexToMathExpr(functionInputLatex));
        }
        catch (e) {
            alert("SYNTAX ERROR - La expresión escrita no cumple con la nomenclatura válida...");
            return {
                error: true,
                data: null
            }
        }
    } else {
        equationInput = document.getElementById("equationInput");
        let equationInputLatex = equationInput.value;

        if (!equationInputLatex.includes('x')) {
            alert("La ecuación debe contener al menos una 'x'");
            return {
                error: true,
                data: null
            }
        }

        try {
            mathEquation = latexToMathEquation(equationInputLatex);

            let left, right;
            if (mathEquation.includes("=")) {
                const parts = mathEquation.split("=");
                left = parts[0];
                right = parts.slice(1).join("=");
            } else {
                left = mathEquation;
                right = "0";
            }

            if (right.trim() === "") {
                right = "0";
            }

            const LeftAndRight = `(${left.trim()}) - (${right.trim()})`;
            const simplifiedEquation = nerdamer(LeftAndRight).expand();

            mathFunction = simplifiedEquation;

            const f = (x) => simplifiedEquation.evaluate({ x });

            // g(x)=x−λf(x)
            g = (x, lambdaValue) => x - lambdaValue * f(x);
        } catch (e) {
            alert("SYNTAX ERROR - La expresión escrita no cumple con la nomenclatura válida...");
            return {
                error: true,
                data: null
            }
        }

        if (method === "Punto Fijo") {
            const xInput = document.getElementById("xInput");
            let xInputLatex = xInput.value;

            let xInputNode;

            try {
                xInputNode = math.parse(latexToMathExpr(xInputLatex));
                xInputValue = xInputNode.evaluate();
            }
            catch (e) {
                alert("SYNTAX ERROR - El valor para 'x' no puede ser evaluado por la calculadora.");
                return {
                    error: true,
                    data: null
                };
            }

            if (!isFinite(xInputValue)) {
                alert("TYPE ERROR - El valor de 'x' debe ser de tipo entero o decimal.");
                return {
                    error: true,
                    data: null
                }
            }


            const lambdaInput = document.getElementById("lambdaInput");
            let lambdaInputLatex = lambdaInput.value;

            let lambdaInputNode;

            try {
                lambdaInputNode = math.parse(latexToMathExpr(lambdaInputLatex));
                lambdaInputValue = lambdaInputNode.evaluate();
            }
            catch (e) {
                alert("SYNTAX ERROR - El valor para 'x' no puede ser evaluado por la calculadora.");
                return {
                    error: true,
                    data: null
                };
            }

            if (!isFinite(lambdaInputValue)) {
                alert("TYPE ERROR - El valor de 'λ' debe ser de tipo entero o decimal.");
                return {
                    error: true,
                    data: null
                }
            }
        }
    }
    // ================================== //


    //==========================//
    // Bisección
    let aInputValue, bInputValue;

    // Newton Raphson
    let xoInputValue;

    // Secante
    let secondxoInputValue, firstxoInputValue;

    // Müller
    let firstxInputValue, secondxInputValue, thirdxInputValue;

    let iInputValue;
    //==========================//


    if (method === "Bisección" || method === "Regla Falsa") {

        // OBTENCION DE LA CANTIDAD DEL INTERVALO EN A //
        const aInput = document.getElementById("aInput");
        let aInputLatex = aInput.value;

        let aInputNode;

        try {
            aInputNode = math.parse(latexToMathExpr(aInputLatex));
            aInputValue = aInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para el intervalo 'a' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(aInputValue)) {
            alert("TYPE ERROR - El valor del intervalo 'a' debe ser de tipo entero o decimal.");
            return {
                error: true,
                data: null
            }
        }
        // =========================================== //


        // OBTENCION DE LA CANTIDAD DEL INTERVALO EN B //
        const bInput = document.getElementById("bInput");
        let bInputLatex = bInput.value;

        let bInputNode;

        try {
            bInputNode = math.parse(latexToMathExpr(bInputLatex));
            bInputValue = bInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para el intervalo 'b' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(bInputValue)) {
            alert("TYPE ERROR - El valor del intervalo 'b' debe ser de tipo entero o decimal.");
            return {
                error: true,
                data: null
            }
        }
        // =========================================== //
    }

    if (method === "Newton Raphson" || method === "Newton Horner") {
        // OBTENCION DE LA APROXIMACIÓN N //
        const xoInput = document.getElementById("xoInput");
        let xoInputLatex = xoInput.value;

        let xoInputNode;

        try {
            xoInputNode = math.parse(latexToMathExpr(xoInputLatex));
            xoInputValue = xoInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para la aproximación 'x0' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(xoInputValue)) {
            alert("TYPE ERROR - El valor de la aproximación 'x0' debe ser de tipo entero o decimal.");
            return {
                error: true,
                data: null
            }
        }
        // =========================================== //
    }

    if (method === "Secante") {
        // OBTENCION DE LA PRIMERA APROXIMACIÓN N //
        const firstxoInput = document.getElementById("firstxoInput");
        let firstxoInputLatex = firstxoInput.value;

        let firstxoInputNode;

        try {
            firstxoInputNode = math.parse(latexToMathExpr(firstxoInputLatex));
            firstxoInputValue = firstxoInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para la primera aproximación 'x0' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(firstxoInputValue)) {
            alert("TYPE ERROR - El valor de la primera aproximación 'x0' debe ser de tipo entero o decimal.");
            return {
                error: true,
                data: null
            }
        }
        // =========================================== //


        // OBTENCION DE LA SEGUNDA APROXIMACIÓN N //
        const secondxoInput = document.getElementById("secondxoInput");
        let secondxoInputLatex = secondxoInput.value;

        let secondxoInputNode;

        try {
            secondxoInputNode = math.parse(latexToMathExpr(secondxoInputLatex));
            secondxoInputValue = secondxoInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para la segunda aproximación 'x0' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(secondxoInputValue)) {
            alert("TYPE ERROR - El valor de la segunda aproximación 'x0' debe ser de tipo entero o decimal.");
            return {
                error: true,
                data: null
            }
        }
        // =========================================== //
    }

    if (method === "Müller") {
        // OBTENCION DEL PRIMER VALOR DE X //
        const firstxInput = document.getElementById("firstxInput");
        let firstxInputLatex = firstxInput.value;

        let firstxInputNode;

        try {
            firstxInputNode = math.parse(latexToMathExpr(firstxInputLatex));
            firstxInputValue = firstxInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El primer valor de 'x' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(firstxInputValue)) {
            alert("TYPE ERROR - El primer valor de 'x' debe ser un número real válido.");
            return {
                error: true,
                data: null
            };
        }
        // =========================================== //


        // OBTENCION DEL SEGUNDO VALOR DE X //
        const secondxInput = document.getElementById("secondxInput");
        let secondxInputLatex = secondxInput.value;

        let secondxInputNode;

        try {
            secondxInputNode = math.parse(latexToMathExpr(secondxInputLatex));
            secondxInputValue = secondxInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para el segundo valor de 'x' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(secondxInputValue)) {
            alert("TYPE ERROR - El segundo valor de 'x' debe ser un número real válido.");
            return {
                error: true,
                data: null
            };
        }
        // =========================================== //


        // OBTENCION DEL TERCER VALOR DE X //
        const thirdxInput = document.getElementById("thirdxInput");
        let thirdxInputLatex = thirdxInput.value;

        let thirdxInputNode;

        try {
            thirdxInputNode = math.parse(latexToMathExpr(thirdxInputLatex));
            thirdxInputValue = thirdxInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - El valor para el tercer valor de 'x' no puede ser evaluado por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!isFinite(thirdxInputValue)) {
            alert("TYPE ERROR - El tercer valor de 'x' debe ser un número real válido.");
            return {
                error: true,
                data: null
            };
        }
        // =========================================== //
    }


    // OBTENCION DE LA CANTIDAD DE ITERACIONES //
    if (repeatOption === "Definir Iteraciones") {
        const iInput = document.getElementById("iInput");

        let iInputLatex = iInput.value;

        let iInputNode;

        try {
            iInputNode = math.parse(latexToMathExpr(iInputLatex));
            iInputValue = iInputNode.evaluate();
        }
        catch (e) {
            alert("SYNTAX ERROR - La cantidad de iteraciones no puede ser procesada por la calculadora.");
            return {
                error: true,
                data: null
            };
        }

        if (!Number.isInteger(iInputValue)) {
            alert("TYPE ERROR - La cantidad de iteraciones debe ser de tipo entero.");
            return {
                error: true,
                data: null
            }
        }
    }
    // ======================================= //


    // OBTENCION DEL ERROR DESEADO //
    const eInput = document.getElementById("eInput");
    let eInputLatex = eInput.value;

    if (eInputLatex.trim() === "") {
        alert("EMPTY FIELD ERROR - Se requiere un valor para la tolerancia al error.");
        return {
            error: true,
            data: null
        }
    }

    let eInputValue;
    let eInputNode;

    try {
        let eInputToMath = latexToMathExpr(eInputLatex);

        eInputNode = math.parse(eInputToMath);
        eInputValue = eInputNode.evaluate();
    }
    catch (e) {
        alert("SYNTAX ERROR - El valor para el error deseado no puede ser evaluado por la calculadora.");
        return {
            error: true,
            data: null
        };
    }

    // =========================== //

    return {
        error: false,
        data: {
            g,
            mathEquation,
            xInputValue,
            lambdaInputValue,
            mathFunction,
            aInputValue,
            bInputValue,
            xoInputValue,
            firstxoInputValue,
            secondxoInputValue,
            firstxInputValue,
            secondxInputValue,
            thirdxInputValue,
            iInputValue,
            eInputValue
        }
    }
}
// ======================================== //


// INICIALIZADOR DE ELEMENTOS EN LA PAGINA //
function loadRootSearcher(method) {
    clearMathContainer();
    prepareTitle(method);

    // FORMULARIO DEL CALCULO //
    const form = document.createElement("div");
    form.id = "mathForm_RootSearcher";
    form.className = "dashboard-card";

    const formTitle = document.createElement("h3");
    formTitle.className = "card-title";
    formTitle.innerHTML = `<i class="fa-solid fa-sliders"></i> Parámetros de Entrada`;
    form.appendChild(formTitle);

    const formGrid = document.createElement("div");
    formGrid.className = "form-grid";
    // ====================== //


    // OPCIÓN ELEGIDA POR EL USUARIO //
    const repeatOptions = document.getElementById('repeatOptions');
    const repeatOption = repeatOptions.value;
    // ====================== //


    // CAMPOS //                                                   
    const equationMathField = document.createElement("math-field");
    equationMathField.value = "x^2 - x - 1 = 0";
    equationMathField.placeholder = "Ecuación\u2008Matemática\u2008con\u2008(x)\u2008igualada\u2008a\u20080...";
    equationMathField.id = "equationInput";

    const xMathField = document.createElement("math-field");
    xMathField.value = "";
    xMathField.placeholder = "Valor\u2008de\u2008(x)...";
    xMathField.id = "xInput";

    const lambdaMathField = document.createElement("math-field");
    lambdaMathField.value = "0.07";
    lambdaMathField.placeholder = "λ...";
    lambdaMathField.id = "lambdaInput";

    const fMathField = document.createElement("math-field");
    fMathField.value = "x + ln(x)";
    fMathField.placeholder = 'Expresión\u2008Matemática\u2008con\u2008(x)...';
    fMathField.id = "functionInput";

    const aMathField = document.createElement("math-field");
    aMathField.value = "";
    aMathField.restrict = '0123456789';
    aMathField.virtualKeyboardLayout = 'numeric';
    aMathField.placeholder = 'Valor\u2008del\u2008intervalo\u2008en\u2008[a,...]...';
    aMathField.id = "aInput";

    const bMathField = document.createElement("math-field");
    bMathField.value = "";
    bMathField.restrict = '0123456789';
    bMathField.virtualKeyboardLayout = 'numeric';
    bMathField.placeholder = 'Valor\u2008del\u2008intervalo\u2008en\u2008[...,b]...';
    bMathField.id = "bInput";

    const xoMathField = document.createElement("math-field");
    xoMathField.value = "";
    xoMathField.restrict = '0123456789.';
    xoMathField.virtualKeyboardLayout = 'numeric';
    xoMathField.placeholder = 'Aproximación\u2008inicial\u2008(x_0)...';
    xoMathField.id = "xoInput";

    const firstxoMathField = document.createElement("math-field");
    firstxoMathField.value = "";
    firstxoMathField.restrict = '0123456789.';
    firstxoMathField.virtualKeyboardLayout = 'numeric';
    firstxoMathField.placeholder = 'Primera\u2008\u2008Aproximación\u2008inicial\u2008(x_0)...';
    firstxoMathField.id = "firstxoInput";

    const secondxoMathField = document.createElement("math-field");
    secondxoMathField.value = "";
    secondxoMathField.restrict = '0123456789.';
    secondxoMathField.virtualKeyboardLayout = 'numeric';
    secondxoMathField.placeholder = 'Segunda\u2008\u2008Aproximación\u2008inicial\u2008(x_1)...';
    secondxoMathField.id = "secondxoInput";

    const firstxMathField = document.createElement("math-field");
    firstxMathField.value = "";
    firstxMathField.restrict = '0123456789.';
    firstxMathField.virtualKeyboardLayout = 'numeric';
    firstxMathField.placeholder = 'Primer\u2008valor\u2008inicial\u2008(x_{i-1})...';
    firstxMathField.id = "firstxInput";

    const secondxMathField = document.createElement("math-field");
    secondxMathField.value = "";
    secondxMathField.restrict = '0123456789.';
    secondxMathField.virtualKeyboardLayout = 'numeric';
    secondxMathField.placeholder = 'Segundo\u2008valor\u2008inicial\u2008(x_{i})...';
    secondxMathField.id = "secondxInput";

    const thirdxMathField = document.createElement("math-field");
    thirdxMathField.value = "";
    thirdxMathField.restrict = '0123456789.';
    thirdxMathField.virtualKeyboardLayout = 'numeric';
    thirdxMathField.placeholder = 'Tercer\u2008valor\u2008inicial\u2008(x_{i+1})...';
    thirdxMathField.id = "thirdxInput";

    const iMathField = document.createElement("math-field");
    iMathField.value = "";
    iMathField.restrict = '0123456789';
    iMathField.virtualKeyboardLayout = 'numeric';
    iMathField.placeholder = 'Cantidad\u2008de\u2008iteraciones...';
    iMathField.id = "iInput";

    const eMathField = document.createElement("math-field");
    eMathField.value = "";
    eMathField.restrict = '0123456789';
    eMathField.virtualKeyboardLayout = 'numeric';
    eMathField.placeholder = 'Tolerancia\u2008al\u2008error\u2008(ε)...';
    eMathField.id = "eInput";


    const btnSearchRoot = document.createElement("btn");
    btnSearchRoot.type = "submit";
    btnSearchRoot.id = "btnSearchRoot";
    btnSearchRoot.textContent = "Iterar";
    btnSearchRoot.addEventListener("click", () => {
        RootSearcher(method, repeatOption);
    })
    // ====== //


    // FUNCIÓN AUXILIAR PARA REDIBUJAR FORMULARIO DE NEWTON RAPHSON SISTEMAS //
    function updateNewtonRaphsonForm(type, grid, repOpt) {
        grid.innerHTML = "";

        if (type === "single") {
            const fMathField = document.createElement("math-field");
            fMathField.value = "x + ln(x)";
            fMathField.placeholder = 'Expresión\u2008Matemática\u2008con\u2008(x)...';
            fMathField.id = "functionInput";
            grid.appendChild(fMathField);

            const xoMathField = document.createElement("math-field");
            xoMathField.value = "";
            xoMathField.restrict = '0123456789.-';
            xoMathField.virtualKeyboardLayout = 'numeric';
            xoMathField.placeholder = 'Aproximación\u2008inicial\u2008(x_0)...';
            xoMathField.id = "xoInput";
            grid.appendChild(xoMathField);
        } else if (type === "system2") {
            const eq1MathField = document.createElement("math-field");
            eq1MathField.value = "x^2 + y^2 - 4 = 0";
            eq1MathField.placeholder = "Ecuación f1(x,y) = 0...";
            eq1MathField.id = "eq1Input";
            grid.appendChild(eq1MathField);

            const eq2MathField = document.createElement("math-field");
            eq2MathField.value = "exp(x) + y - 1 = 0";
            eq2MathField.placeholder = "Ecuación f2(x,y) = 0...";
            eq2MathField.id = "eq2Input";
            grid.appendChild(eq2MathField);

            const xoMathField = document.createElement("math-field");
            xoMathField.value = "1";
            xoMathField.restrict = '0123456789.-';
            xoMathField.virtualKeyboardLayout = 'numeric';
            xoMathField.placeholder = 'Aproximación\u2008inicial\u2008x_0...';
            xoMathField.id = "xoInput";
            grid.appendChild(xoMathField);

            const yoMathField = document.createElement("math-field");
            yoMathField.value = "1";
            yoMathField.restrict = '0123456789.-';
            yoMathField.virtualKeyboardLayout = 'numeric';
            yoMathField.placeholder = 'Aproximación\u2008inicial\u2008y_0...';
            yoMathField.id = "yoInput";
            grid.appendChild(yoMathField);
        } else if (type === "system3") {
            const eq1MathField = document.createElement("math-field");
            eq1MathField.value = "x^2 + y^2 + z^2 - 9 = 0";
            eq1MathField.placeholder = "Ecuación f1(x,y,z) = 0...";
            eq1MathField.id = "eq1Input";
            grid.appendChild(eq1MathField);

            const eq2MathField = document.createElement("math-field");
            eq2MathField.value = "x*y*z - 1 = 0";
            eq2MathField.placeholder = "Ecuación f2(x,y,z) = 0...";
            eq2MathField.id = "eq2Input";
            grid.appendChild(eq2MathField);

            const eq3MathField = document.createElement("math-field");
            eq3MathField.value = "x + y + z^2 - 4 = 0";
            eq3MathField.placeholder = "Ecuación f3(x,y,z) = 0...";
            eq3MathField.id = "eq3Input";
            grid.appendChild(eq3MathField);

            const xoMathField = document.createElement("math-field");
            xoMathField.value = "1.5";
            xoMathField.restrict = '0123456789.-';
            xoMathField.virtualKeyboardLayout = 'numeric';
            xoMathField.placeholder = 'Aproximación\u2008inicial\u2008x_0...';
            xoMathField.id = "xoInput";
            grid.appendChild(xoMathField);

            const yoMathField = document.createElement("math-field");
            yoMathField.value = "1.5";
            yoMathField.restrict = '0123456789.-';
            yoMathField.virtualKeyboardLayout = 'numeric';
            yoMathField.placeholder = 'Aproximación\u2008inicial\u2008y_0...';
            yoMathField.id = "yoInput";
            grid.appendChild(yoMathField);

            const zoMathField = document.createElement("math-field");
            zoMathField.value = "1.5";
            zoMathField.restrict = '0123456789.-';
            zoMathField.virtualKeyboardLayout = 'numeric';
            zoMathField.placeholder = 'Aproximación\u2008inicial\u2008z_0...';
            zoMathField.id = "zoInput";
            grid.appendChild(zoMathField);
        }

        if (repOpt === "Definir Iteraciones") {
            const iMathField = document.createElement("math-field");
            iMathField.value = "";
            iMathField.restrict = '0123456789';
            iMathField.virtualKeyboardLayout = 'numeric';
            iMathField.placeholder = 'Cantidad\u2008de\u2008iteraciones...';
            iMathField.id = "iInput";
            grid.appendChild(iMathField);
        }

        const eMathField = document.createElement("math-field");
        eMathField.value = "";
        eMathField.restrict = '0123456789';
        eMathField.virtualKeyboardLayout = 'numeric';
        eMathField.placeholder = 'Tolerancia\u2008al\u2008error\u2008(ε)...';
        eMathField.id = "eInput";
        grid.appendChild(eMathField);
    }

    // INSERCIÓN DE CAMPOS AL FORMULARIO //
    if (method === "Newton Raphson") {
        const nrTypeSelect = document.createElement("select");
        nrTypeSelect.id = "nrTypeSelect";
        nrTypeSelect.className = "styled-select";
        nrTypeSelect.style.gridColumn = "1 / -1";
        nrTypeSelect.style.marginBottom = "15px";

        const optSingle = document.createElement("option");
        optSingle.value = "single";
        optSingle.textContent = "Ecuación Única";
        nrTypeSelect.appendChild(optSingle);

        const optSystem2 = document.createElement("option");
        optSystem2.value = "system2";
        optSystem2.textContent = "Sistema de Ecuaciones (2x2)";
        nrTypeSelect.appendChild(optSystem2);

        const optSystem3 = document.createElement("option");
        optSystem3.value = "system3";
        optSystem3.textContent = "Sistema de Ecuaciones (3x3)";
        nrTypeSelect.appendChild(optSystem3);

        form.appendChild(nrTypeSelect);
        form.appendChild(formGrid);

        updateNewtonRaphsonForm("single", formGrid, repeatOption);

        nrTypeSelect.addEventListener("change", () => {
            updateNewtonRaphsonForm(nrTypeSelect.value, formGrid, repeatOption);
        });
    } else {
        if (method === "Punto Fijo" || method === "Müller" || method === "Bairstow" || method === "Newton Horner") {
            formGrid.appendChild(equationMathField);

            if (method === "Punto Fijo") {
                formGrid.appendChild(xMathField);
                formGrid.appendChild(lambdaMathField);
            } else if (method === "Müller") {
                formGrid.appendChild(firstxMathField);
                formGrid.appendChild(secondxMathField);
                formGrid.appendChild(thirdxMathField);
            }
        } else {
            formGrid.appendChild(fMathField);
        }

        if (method === "Bisección" || method === "Regla Falsa") {
            formGrid.appendChild(aMathField);
            formGrid.appendChild(bMathField);
        }

        if (method === "Newton Horner") {
            formGrid.appendChild(xoMathField);
        }

        if (method === "Secante") {
            formGrid.appendChild(firstxoMathField);
            formGrid.appendChild(secondxoMathField);
        }

        if (repeatOption === "Definir Iteraciones") {
            formGrid.appendChild(iMathField);
        }

        formGrid.appendChild(eMathField);
        form.appendChild(formGrid);
    }

    form.appendChild(btnSearchRoot);
    // ================================= //



    // CONTENEDOR PARA LOS PANELES //
    const rootSearchBox = document.createElement("div");
    rootSearchBox.id = "RootSearchBox";
    rootSearchBox.className = "dashboard-card";
    rootSearchBox.style.display = "none";

    const resultTitle = document.createElement("h3");
    resultTitle.className = "card-title";
    resultTitle.innerHTML = `<i class="fa-solid fa-chart-line"></i> Resultados de la Ejecución`;
    rootSearchBox.appendChild(resultTitle);
    // =============================== //


    // PANELES PARA PRESENTAR //
    const graphicDisplay = document.createElement("div");
    graphicDisplay.id = "graphicDisplay";

    const excelDisplay = document.createElement("div");
    excelDisplay.id = "excelDisplay";

    const tableDisplay = document.createElement("div");
    tableDisplay.id = "tableDisplay";

    const functionDisplay = document.createElement("div");
    functionDisplay.id = "functionDisplay";
    // ====================== //

    // INSERCIÓN DE PANELES AL CONTENEDOR PRINCIPAL //
    rootSearchBox.appendChild(graphicDisplay);
    rootSearchBox.appendChild(excelDisplay);
    rootSearchBox.appendChild(tableDisplay);
    rootSearchBox.appendChild(functionDisplay);
    // ============================================ //


    // CREACIÓN DEL GRÁFICO //
    let grafica = document.getElementById('grafica');
    if (!grafica) {
        grafica = document.createElement('canvas');
        grafica.id = 'grafica';
        grafica.width = 600;
        grafica.height = 300;
        graphicDisplay.appendChild(grafica);
    };

    let chartCanvas = document.getElementById('chart');
    if (!chartCanvas) {
        chartCanvas = document.createElement('canvas');
        chartCanvas.id = 'chart';
        chartCanvas.width = 600;
        chartCanvas.height = 300;
        graphicDisplay.appendChild(chartCanvas);
    };

    let chartCanvasError = document.getElementById('chartError');
    if (!chartCanvasError) {
        chartCanvasError = document.createElement('canvas');
        chartCanvasError.id = 'chartError';
        chartCanvasError.width = 600;
        chartCanvasError.height = 300;
        graphicDisplay.appendChild(chartCanvasError);
    };
    // ==================== //



    // CONTENEDOR PARA LAS OPERACIONES //
    const Field = document.createElement("div");
    Field.className = "Field";
    Field.id = "Calc_Field";
    // =============================== //


    // INSERCIÓN DEL CONTENEDOR DE PANELES //
    Field.appendChild(rootSearchBox);
    // =================================== //



    // CONTENEDOR PADRE //
    const txtField = document.createElement("div");;
    txtField.className = "txtField";
    // ================ //


    // INSERCIÓN DE CONTENEDORES DE PANELES //
    txtField.appendChild(Field);
    // ==================================== //



    // INSERCIÓN DE CONTENEDORES PADRE A LA RAIZ //
    document.getElementById("mathContainer").appendChild(form);
    document.getElementById("mathContainer").appendChild(txtField);
    // ========================================= // 
}
// ======================================= //