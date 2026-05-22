import { evaluateFunction } from "../MathLogistic.js";

function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

// FUNCION PARA EL MÉTODO DE NEWTON RAPHSON //
export function NewtonRaphsonMethod(
    mathFunction,
    approach,
    iterations,
    epsilon,
    repeatOption
) {
    const grafica3D = document.getElementById("grafica3D");
    grafica3D.style.display = "none";
    const grafica = document.getElementById("grafica");
    grafica.style.display = "block";

    const mathContainer = document.getElementById("mathContainer");

    const table = document.getElementById("tableDisplay");
    
    const mainTable = document.createElement("table");
    mainTable.id = "mainTable";

    const head = document.createElement("thead");
    head.id = "thead";

    const body = document.createElement("tbody");
    body.id = "tableBody";

    const row = document.createElement("tr");

    const headerRow = ["Iteración", "Aproximación", "f(Aproximación)", "f'(Aproximación)", "Nueva Aproximación", "Ec%"];

    for (let i = 0; i <= 5; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];

        row.appendChild(tableData);
    }

    head.appendChild(row);

    mainTable.appendChild(head);
    mainTable.appendChild(body);

    table.appendChild(mainTable);

    let method = "Newton Raphson";

    // 1. Crear libro
    const workbook = new ExcelJS.Workbook();

    // 2. Crear hoja
    const sheet = workbook.addWorksheet("WToMath");

    // 3. Agregar encabezados
    const header = sheet.addRow(
        headerRow
    );

    // 4. Estilos
    header.eachCell(cell => {
        cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8800AA96" }
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

    let derivatedMathFunction = math.derivative(mathFunction, 'x');

    let eachIteration = [];
    let eachApproach = [];
    let eachRelativeError = [];

    let iteration = 1;
    let lastNewApproach = 0;

    while (true) {
        const data = NewtonRaphsonOperation(
            approach,
            mathFunction,
            derivatedMathFunction,
            epsilon,
            iteration,
            sheet,
            lastNewApproach
        );

        eachIteration.push(iteration);
        eachApproach.push(approach);

        eachRelativeError.push(data.relativeError);

        approach = data.newApproach;

        lastNewApproach = data.newApproach;

        // Condición de parada por iteraciones
        if (repeatOption === "Definir Iteraciones" && (iteration >= iterations || !data.iterate)) {
            break;
        }

        // Condición de parada por tolerancia
        if (repeatOption === "Cumplir Tolerancia" && !data.iterate) {
            break;
        }

        // Límite de seguridad
        if (iteration >= 200) {
            alert("Se alcanzó el limite máximo de iteraciones permitidas...");
            break;
        }

        iteration++;
    }

    sheet.getColumn(6).numFmt = "0.00%";

    let chartCanvas = document.getElementById('chart');
    // Destruir gráfico anterior si existe
    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: eachIteration,
            datasets: [{
                label: 'Valor de Aproximación por iteración',
                data: eachApproach,
                borderColor: 'rgba(0, 170, 14, 0.53)',       // Línea principal (glow)
                backgroundColor: 'rgba(0, 170, 26, 0.2)',     // Relleno suave debajo de la línea
                pointBackgroundColor: 'rgba(14, 170, 0, 0.8)',// Puntos más sólidos
                pointBorderColor: 'rgb(22, 121, 0)',           // Borde de los puntos, cercano al fondo
                tension: 0.2
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // context.parsed.y contiene el valor Y del punto
                            return `c = ${context.parsed.y}`; // Decimales
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Iteración' },
                    ticks: {
                        precision: 0 // Enteros para iteraciones
                    }
                },
                y: { 
                    title: { display: true, text: 'Valor de Aproximación' },
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                }
            },
            animation: {
                onComplete: async () => {
                    const chartImage = chartCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");

                    // Crear hoja para el gráfico del error
                    let chartSheet = workbook.getWorksheet("Gráfico");
                    if (!chartSheet) {
                        chartSheet = workbook.addWorksheet("Gráfico");
                    } else {
                        workbook.removeWorksheet(chartSheet.id);
                        chartSheet = workbook.addWorksheet("Gráfico");
                    }

                    const imageId = workbook.addImage({
                        base64: chartImage,
                        extension: 'png',
                    });

                    // Posicionar la imagen dentro de la hoja
                    chartSheet.addImage(imageId, {
                        tl: { col: 0, row: 0 }, // top-left
                        br: { col: 10, row: 20 } // bottom-right
                    });


                    // 6. Generar archivo
                    const buffer = await workbook.xlsx.writeBuffer();

                    // 7. Descargar
                    const blob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });


                    let existingBtn = document.getElementById("excelFile_btn");
                    if (existingBtn) {
                        existingBtn.remove();
                    }

                    const excelbtn = document.createElement("button");
                    excelbtn.id = "excelFile_btn";
                    excelbtn.innerHTML = "Generar Excel";

                    const url = URL.createObjectURL(blob);

                    excelbtn.addEventListener("click", () => {
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `Método por ${method}.xlsx`;

                        mathContainer.appendChild(link);
                        link.click();
                        mathContainer.removeChild(link);
                    });

                    const excelDisplay = document.getElementById("excelDisplay");
                    excelDisplay.appendChild(excelbtn);
                }
            },
        }
    });


    let chartCanvasError = document.getElementById('chartError');
    // Destruir gráfico anterior si existe
    const existingChartError = Chart.getChart(chartCanvasError);
    if (existingChartError) {
        existingChartError.destroy();
    }

    const ctxError = chartCanvasError.getContext('2d');

    new Chart(ctxError, {
        type: 'line',
        data: {
            labels: eachIteration,
            datasets: [{
                label: 'Error Relativo por iteración',
                data: eachRelativeError,
                borderColor: 'rgba(0, 170, 14, 0.53)',       // Línea principal (glow)
                backgroundColor: 'rgba(0, 170, 26, 0.2)',     // Relleno suave debajo de la línea
                pointBackgroundColor: 'rgba(14, 170, 0, 0.8)',// Puntos más sólidos
                pointBorderColor: 'rgb(22, 121, 0)',           // Borde de los puntos, cercano al fondo
                tension: 0.2
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // context.parsed.y contiene el valor Y del punto
                            return `c = ${context.parsed.y}`; // Decimales
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Iteración' },
                    ticks: {
                        precision: 0 // Enteros para iteraciones
                    }
                },
                y: {
                    title: { display: true, text: 'Error relativo' },
                    ticks: {
                        callback: function(value) {
                            return `${value*100}%`;
                        }
                    }
                }
            },
            animation: {
                onComplete: async () => {
                    const chartImageError = chartCanvasError.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");

                    // Crear hoja para el gráfico
                    let chartSheetError = workbook.getWorksheet("Gráfico del Error");
                    if (!chartSheetError) {
                        chartSheetError = workbook.addWorksheet("Gráfico del Error");
                    } else {
                        workbook.removeWorksheet(chartSheetError.id);
                        chartSheetError = workbook.addWorksheet("Gráfico del Error");
                    }

                    const imageIdError = workbook.addImage({
                        base64: chartImageError,
                        extension: 'png',
                    });

                    // Posicionar la imagen dentro de la hoja
                    chartSheetError.addImage(imageIdError, {
                        tl: { col: 0, row: 0 }, // top-left
                        br: { col: 10, row: 20 } // bottom-right
                    });

                    // 6. Generar archivo
                    const buffer = await workbook.xlsx.writeBuffer();

                    // 7. Descargar
                    const blob = new Blob([buffer], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    });


                    let existingBtn = document.getElementById("excelFile_btn");
                    if (existingBtn) {
                        existingBtn.remove();
                    }

                    const excelbtn = document.createElement("button");
                    excelbtn.id = "excelFile_btn";
                    excelbtn.innerHTML = "Generar Excel";

                    const url = URL.createObjectURL(blob);

                    excelbtn.addEventListener("click", () => {
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `Método por ${method}.xlsx`;

                        mathContainer.appendChild(link);
                        link.click();
                        mathContainer.removeChild(link);
                    });

                    const excelDisplay = document.getElementById("excelDisplay");
                    excelDisplay.appendChild(excelbtn);
                }
            },
        }
    });
}
// =================================== //


// FUNCION PARA REALIZAR EL MÉTODO DE NEWTON RAPHSON //
function NewtonRaphsonOperation(
    approach,
    mathFunction,
    derivatedMathFunction,
    epsilon,
    iteration,
    sheet,
    lastNewApproach
) {
    const result = NewtonRaphsonCalculus(
        approach,
        mathFunction,
        derivatedMathFunction,
        epsilon,
        iteration
    );

    NewtonRaphsonLog(
        iteration,
        approach,
        result.newApproach,
        mathFunction,
        derivatedMathFunction,
        result.approachEvaluation,
        result.derivatedApproachEvaluation
    );

    const latexString = `
        \\begin{array}{l l}
        \\text{Iteración:} & ${iteration} \\\\
        x_0 & ${approach} \\\\
        f(x_0) & ${result.approachEvaluation} \\\\
        f'(x_0) & ${result.derivatedApproachEvaluation} \\\\
        Nuevo x_0 & ${result.newApproach} \\\\
        \\end{array}
    `;


    let iterationResults = document.createElement("p");

    // Renderizarlo
    iterationResults.innerHTML = katex.renderToString(latexString, {
        throwOnError: false,
        displayMode: true
    });

    let iterationDisplay = document.createElement("div");
    iterationDisplay.className = "iterationDisplay";

    iterationDisplay.appendChild(iterationResults);

    const functionDisplay = document.getElementById("functionDisplay");
    functionDisplay.style.visibility = "visible";
    functionDisplay.appendChild(iterationDisplay);


    let excelFormula;
    if (iteration === 1) excelFormula = `=E${iteration+1}/E${iteration+1}`;
    if (iteration > 1) excelFormula = `=ABS((E${iteration+1}-E${iteration})/E${iteration})`
    
    if (iteration === 1) sheet.addRow([iteration, approach, result.approachEvaluation, result.derivatedApproachEvaluation, { formula: `=B${iteration+1}-(C${iteration+1}/D${iteration+1})` }, { formula: excelFormula }]);
    else sheet.addRow([iteration, { formula: `=E${iteration}` }, result.approachEvaluation, result.derivatedApproachEvaluation, { formula: `=B${iteration+1}-(C${iteration+1}/D${iteration+1})` }, { formula: excelFormula }]);


    let relativeError = 0;

    if (iteration === 1) {
        relativeError = 1;
    }
    else if (iteration > 1) {
        relativeError = math.abs(((result.newApproach - lastNewApproach) / lastNewApproach));
    }


    const tableBody = document.getElementById("tableBody");

    const row = document.createElement("tr");

    const data = [
        iteration,
        formatNumber(approach),
        formatNumber(result.approachEvaluation),
        formatNumber(result.derivatedApproachEvaluation),
        formatNumber(result.newApproach),
        `${formatNumber(relativeError * 100)}%`
    ];

    for (let i = 0; i <= 5; i++) {
        const tableData = document.createElement("td");
        tableData.innerHTML = data[i];

        row.appendChild(tableData);
    }

    tableBody.appendChild(row);


    return {
        newApproach: result.newApproach,
        iterate: result.iterate,
        relativeError
    }
}
// ============================================== //


// FUNCION PARA CALCULO DEL MÉTODO DE NEWTON RAPHSON //
function NewtonRaphsonCalculus(
    approach,
    mathFunction,
    derivatedMathFunction,
    epsilon,
    iteration
) {
    let iterate = true;
    let { result: approachEvaluation } = evaluateFunction(mathFunction, approach);

    let { result: derivatedApproachEvaluation } = evaluateFunction(derivatedMathFunction, approach);

    let newApproach = approach - approachEvaluation / derivatedApproachEvaluation;


    if (approachEvaluation === 0) {
        alert(`Se encontró la raíz exacta en la iteración ${iteration}...`);
        iterate = false;
    }
    else if (Math.abs(approachEvaluation) <= epsilon) {
        alert(`El valor de la raíz "${approach}" cumple con la precisión deseada en la iteración ${iteration}...`);
        iterate = false;
    }
    else if (Math.abs(newApproach - approach) <= epsilon) {
        alert(`Convergencia alcanzada en la iteración ${iteration}`);
        iterate = false;
    }

    return {
        newApproach,
        approachEvaluation,
        derivatedApproachEvaluation,
        iterate
    }
}
// ============================================== //

// FUNCION PARA IMPRIMIR DATOS DEL MÉTODO DE NEWTON RAPHSON //
function NewtonRaphsonLog(
    iteration,
    approach,
    newApproach,
    mathFunction,
    derivatedMathFunction,
    approachEvaluation,
    derivatedApproachEvaluation
) {
    console.log(`Iteración: ${iteration}`);
    console.log(`Aproximación Inicial: ${approach}`);
    console.log(`Nueva Aproximación: ${newApproach}`);

    console.log("");

    console.log("Fórmula: xo - f(xo) / f'(xo))");
    console.log(`Cálculo de la aproximación: ${approach} - ${approachEvaluation} / ${derivatedApproachEvaluation}`);

    console.log("");
    console.log(`Aproximación - evaluación: f(x) = ${mathFunction} // f(x) = ${approachEvaluation}`);
    console.log(`Derivada - evaluación: f(x) = ${derivatedMathFunction} // f(x) = ${derivatedApproachEvaluation}`);
    console.log("");
}
// ===================================================== //

// NEWTON-RAPHSON PARA SISTEMAS DE ECUACIONES NO LINEALES (2x2 y 3x3) //
export function NewtonRaphsonSystemMethod(
    type,
    equations,
    initialGuesses,
    iterations,
    epsilon,
    repeatOption
) {
    const mathContainer = document.getElementById("mathContainer");
    const table = document.getElementById("tableDisplay");
    
    // Restablecer visibilidad en caso de ejecuciones fallidas previas
    const graphicDisplay = document.getElementById("graphicDisplay");
    if (graphicDisplay) graphicDisplay.style.display = "block";
    const excelDisplay = document.getElementById("excelDisplay");
    if (excelDisplay) excelDisplay.style.display = "block";
    if (table) table.style.display = "block";
    
    // Limpiar contenido previo de la tabla y resultados
    table.innerHTML = "";
    const functionDisplay = document.getElementById("functionDisplay");
    if (functionDisplay) {
        functionDisplay.innerHTML = "";
        functionDisplay.style.visibility = "hidden";
    }

    const mainTable = document.createElement("table");
    mainTable.id = "mainTable";

    const head = document.createElement("thead");
    head.id = "thead";

    const body = document.createElement("tbody");
    body.id = "tableBody";

    const row = document.createElement("tr");

    // Preparación de Variables y Derivadas Analíticas (Jacobiano)
    const vars = type === "system2" ? ["x", "y"] : ["x", "y", "z"];
    const n = vars.length;

    // Asegurar que las ecuaciones no tengan espacios raros y estén limpias
    const cleanedEqs = equations.map(eq => {
        let clean = eq.trim();
        if (clean.includes("=")) {
            const parts = clean.split("=");
            const left = parts[0];
            const right = parts.slice(1).join("=");
            clean = right.trim() === "" ? left : `(${left}) - (${right})`;
        }
        return clean;
    });

    const parsedEqs = cleanedEqs.map(eq => math.parse(eq));
    const compiledEqs = parsedEqs.map(node => node.compile());

    // Definir encabezados de tabla según el tipo
    let headerRow = [];
    if (type === "system2") {
        console.log("system2");
        plotSystemEquations(compiledEqs);
        headerRow = ["Iteración", "x", "y", "f1(x,y)", "f2(x,y)", "Error Relativo Max"];
    } else if (type === "system3") {
        console.log("system3");
        plotSystemEquations(compiledEqs);
    } else {
        headerRow = ["Iteración", "x", "y", "z", "f1(x,y,z)", "f2(x,y,z)", "f3(x,y,z)", "Error Relativo Max"];
    }

    for (let i = 0; i < headerRow.length; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];
        row.appendChild(tableData);
    }

    head.appendChild(row);
    mainTable.appendChild(head);
    mainTable.appendChild(body);
    table.appendChild(mainTable);

    let method = `Newton Raphson ${type === "system2" ? "2x2" : "3x3"}`;

    // 1. Crear libro de ExcelJS
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("WToMath");
    const header = sheet.addRow(headerRow);

    // 2. Estilos para el encabezado de Excel
    header.eachCell(cell => {
        cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }
        };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "8800AA96" }
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

    // Calcular Jacobiano Simbólico
    const jacobianSym = [];
    for (let i = 0; i < n; i++) {
        jacobianSym[i] = [];
        for (let j = 0; j < n; j++) {
            jacobianSym[i][j] = math.derivative(parsedEqs[i], vars[j]);
        }
    }
    const jacobianCompiled = jacobianSym.map(row => row.map(node => node.compile()));

    // Historial para gráficas
    let eachIteration = [];
    let trajectoryData = vars.map(() => []); // un array de historial por variable
    let eachRelativeError = [];

    let guesses = [...initialGuesses];
    let iteration = 1;
    let maxAllowedIterations = repeatOption === "Definir Iteraciones" ? iterations : 100;
    let iterate = true;

    // Guardar una referencia a KaTeX para la Jacobiana inicial simbólica
    let jacobianLatexSymbolic = "\\mathbf{J}(\\mathbf{X}) = \\begin{bmatrix} ";
    for (let i = 0; i < n; i++) {
        let rowLatex = [];
        for (let j = 0; j < n; j++) {
            rowLatex.push(`\\frac{\\partial f_${i+1}}{\\partial ${vars[j]}}`);
        }
        jacobianLatexSymbolic += rowLatex.join(" & ") + (i === n - 1 ? "" : " \\\\ ");
    }
    jacobianLatexSymbolic += " \\end{bmatrix} = \\begin{bmatrix} ";
    for (let i = 0; i < n; i++) {
        let rowLatex = [];
        for (let j = 0; j < n; j++) {
            rowLatex.push(jacobianSym[i][j].toTex());
        }
        jacobianLatexSymbolic += rowLatex.join(" & ") + (i === n - 1 ? "" : " \\\\ ");
    }
    jacobianLatexSymbolic += " \\end{bmatrix}";

    let jacSymbolicDiv = document.createElement("div");
    jacSymbolicDiv.className = "iterationDisplay";
    jacSymbolicDiv.style.marginBottom = "20px";
    jacSymbolicDiv.style.padding = "15px";
    jacSymbolicDiv.style.border = "1px solid var(--primary-color)";
    jacSymbolicDiv.innerHTML = `
        <h4 style="color:var(--primary-color); margin-top:0;">Matriz Jacobiana Analítica</h4>
        ${katex.renderToString(jacobianLatexSymbolic, { throwOnError: false, displayMode: true })}
    `;
    functionDisplay.style.visibility = "visible";
    functionDisplay.appendChild(jacSymbolicDiv);

    let prevGuesses = null;

    while (iterate) {
        // Crear scope de evaluación
        let scope = {};
        for (let i = 0; i < n; i++) {
            scope[vars[i]] = guesses[i];
        }

        // Evaluar funciones en el punto actual (F)
        let fVal = compiledEqs.map(comp => comp.evaluate(scope));

        // Evaluar Jacobiana en el punto actual (J)
        let JVal = jacobianCompiled.map(row => row.map(comp => comp.evaluate(scope)));

        // Resolver sistema J * Delta = -F
        let minusF = fVal.map(val => -val);
        let delta;
        try {
            delta = math.lusolve(JVal, minusF);
        } catch (err) {
            // Ocultar elementos estándar vacíos para evitar pantallas rotas
            const graphicDisplay = document.getElementById("graphicDisplay");
            if (graphicDisplay) graphicDisplay.style.display = "none";
            const excelDisplay = document.getElementById("excelDisplay");
            if (excelDisplay) excelDisplay.style.display = "none";
            const tableDisplay = document.getElementById("tableDisplay");
            if (tableDisplay) tableDisplay.style.display = "none";

            if (functionDisplay) {
                functionDisplay.innerHTML = "";
                functionDisplay.style.visibility = "visible";
                
                const warningBox = document.createElement("div");
                warningBox.className = "iterationDisplay";
                warningBox.style.background = "rgba(220, 53, 69, 0.08)";
                warningBox.style.border = "1px solid rgba(220, 53, 69, 0.25)";
                warningBox.style.borderRadius = "12px";
                warningBox.style.padding = "25px";
                warningBox.style.color = "#ff8e8e";
                warningBox.style.boxShadow = "0 6px 20px rgba(0,0,0,0.35)";
                warningBox.style.backdropFilter = "blur(8px)";
                warningBox.style.margin = "10px 0 20px 0";

                let guessesText = type === "system2" 
                    ? `[x_0, y_0] = [${guesses[0]}, ${guesses[1]}]`
                    : `[x_0, y_0, z_0] = [${guesses[0]}, ${guesses[1]}, ${guesses[2]}]`;
                    
                let matrixLatex = `\\mathbf{J}(\\mathbf{X}) = \\begin{bmatrix} ` + JVal.map(row => row.map(val => formatNumber(val)).join(" & ")).join(" \\\\ ") + " \\end{bmatrix}";
                
                // Generar aproximaciones iniciales perturbadas basadas en los parámetros de entrada del usuario
                function getPerturbedGuesses(origGuesses, option) {
                    return origGuesses.map((g, i) => {
                        let val = parseFloat(g) || 0;
                        let delta = val !== 0 ? Math.abs(val) * 0.08 : 0.1;
                        delta = parseFloat(delta.toFixed(4));
                        if (option === 1) {
                            if (i === 1) return parseFloat((val - delta).toFixed(4));
                            if (i === 2) return parseFloat((val + delta).toFixed(4));
                            return val;
                        } else {
                            if (i === 0) return parseFloat((val - delta).toFixed(4));
                            if (i === 1) return parseFloat((val + delta).toFixed(4));
                            if (i === 2) return parseFloat((val + delta * 1.5).toFixed(4));
                            return val;
                        }
                    });
                }

                let opt1 = getPerturbedGuesses(initialGuesses, 1);
                let opt2 = getPerturbedGuesses(initialGuesses, 2);

                let exampleSymmetry = initialGuesses.map(g => formatNumber(parseFloat(g) || 0)).join(", ");

                let recommendedGuesses = type === "system2"
                    ? `x_0 = ${formatNumber(opt1[0])}, &nbsp; y_0 = ${formatNumber(opt1[1])}`
                    : `x_0 = ${formatNumber(opt1[0])}, &nbsp; y_0 = ${formatNumber(opt1[1])}, &nbsp; z_0 = ${formatNumber(opt1[2])}`;

                let alternativeGuesses = type === "system2"
                    ? `x_0 = ${formatNumber(opt2[0])}, &nbsp; y_0 = ${formatNumber(opt2[1])}`
                    : `x_0 = ${formatNumber(opt2[0])}, &nbsp; y_0 = ${formatNumber(opt2[1])}, &nbsp; z_0 = ${formatNumber(opt2[2])}`;

                let systemEqHtml = katex.renderToString("\\mathbf{J} \\cdot \\mathbf{\\Delta} = -\\mathbf{F}", { throwOnError: false, displayMode: false });

                warningBox.innerHTML = `
                    <h3 style="color:#ff6b6b; margin-top:0; font-size:1.35rem; display:flex; align-items:center; gap:12px; font-weight:600;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem;"></i> Excepción Matemática: Matriz Jacobiana Singular
                    </h3>
                    <p style="line-height:1.6; font-size:0.98rem; color:#e2e8f0; margin-bottom:18px;">
                        El solver ha detectado una excepción matemática en la <strong>Iteración ${iteration}</strong>. Con los valores actuales de aproximación:
                        <br>
                        <code style="background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-family:monospace; color:#fff; display:inline-block; margin-top:6px; font-size:0.92rem;">${guessesText}</code>
                        <br><br>
                        La <strong>Matriz Jacobiana</strong> (matriz de derivadas parciales) es <strong>singular</strong>, lo que significa que su determinante es exactamente <strong>0</strong> y no posee inversa.
                    </p>
                    
                    <div style="margin:20px 0; background:rgba(0,0,0,0.25); padding:18px; border-radius:8px; border-left:4px solid #ff6b6b; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">
                        <h4 style="margin-top:0; margin-bottom:12px; color:#ff8e8e; font-size:0.95rem; text-transform:uppercase; letter-spacing:0.5px;">Matriz Jacobiana Evaluada:</h4>
                        ${katex.renderToString(matrixLatex, { throwOnError: false, displayMode: true })}
                    </div>
                    
                    <h4 style="color:#ff8e8e; margin-bottom:8px; font-size:1.05rem; font-weight:600;">¿Por qué ocurre esto con tus datos?</h4>
                    <p style="line-height:1.6; font-size:0.93rem; color:#cbd5e1; margin-top:0; margin-bottom:20px;">
                        Al evaluar tus ecuaciones con valores simétricos o proporcionales (por ejemplo, <code>${exampleSymmetry}</code>), 
                        las derivadas parciales calculadas producen filas en la matriz Jacobiana que son linealmente dependientes (múltiplos perfectos entre sí). 
                        Esto hace imposible resolver el sistema de corrección lineal ${systemEqHtml} y detiene el flujo del método.
                    </p>
                    
                    <h4 style="color:#34d399; margin-bottom:8px; font-size:1.05rem; font-weight:600; display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-circle-check"></i> ¿Cómo solucionarlo?
                    </h4>
                    <p style="line-height:1.6; font-size:0.93rem; color:#cbd5e1; margin-top:0; margin-bottom:0;">
                        Para resolver la excepción, solo debes <strong>romper la simetría</strong> de tus aproximaciones iniciales. Cambia ligeramente al menos uno de los valores en los campos de entrada:
                        <br>
                        <span style="display:block; margin-top:10px; line-height:1.8;">
                            <strong>Opción recomendada:</strong>
                            <br>
                            <code style="background:rgba(52,211,153,0.12); padding:4px 10px; border-radius:4px; font-family:monospace; color:#34d399; display:inline-block; font-size:0.9rem; border: 1px solid rgba(52,211,153,0.2);">
                                ${recommendedGuesses}
                            </code>
                            <br>
                            <strong>Otra opción alternativa:</strong>
                            <br>
                            <code style="background:rgba(52,211,153,0.12); padding:4px 10px; border-radius:4px; font-family:monospace; color:#34d399; display:inline-block; font-size:0.9rem; border: 1px solid rgba(52,211,153,0.2); margin-top:5px;">
                                ${alternativeGuesses}
                            </code>
                        </span>
                    </p>
                `;
                functionDisplay.appendChild(warningBox);
            }
            return;
        }

        // math.lusolve retorna una columna [[d1], [d2], ...]
        let delta1D = delta.map(d => d[0]);

        // Actualizar aproximaciones
        let newGuesses = guesses.map((g, i) => g + delta1D[i]);

        // Calcular error relativo
        let maxError = 0;
        if (iteration === 1) {
            maxError = 1.0;
        } else {
            let relativeErrors = newGuesses.map((ng, i) => {
                let prev = prevGuesses[i];
                return ng !== 0 ? Math.abs((ng - prev) / ng) : Math.abs(ng - prev);
            });
            maxError = Math.max(...relativeErrors);
        }

        // Guardar historial para gráficas
        eachIteration.push(iteration);
        for (let i = 0; i < n; i++) {
            trajectoryData[i].push(guesses[i]);
        }
        eachRelativeError.push(maxError);

        // Renderizado de KaTeX detallado por iteración
        let vectorXLatex = `\\mathbf{X}^{(${iteration})} = \\begin{bmatrix} ` + guesses.map(g => formatNumber(g)).join(" \\\\ ") + " \\end{bmatrix}";
        
        let jacValLatex = `\\mathbf{J}(\\mathbf{X}^{(${iteration})}) = \\begin{bmatrix} ` + JVal.map(row => row.map(val => formatNumber(val)).join(" & ")).join(" \\\\ ") + " \\end{bmatrix}";
        
        let vectorFLatex = `\\mathbf{F}(\\mathbf{X}^{(${iteration})}) = \\begin{bmatrix} ` + fVal.map(val => formatNumber(val)).join(" \\\\ ") + " \\end{bmatrix}";
        
        let deltaLatex = `\\mathbf{\\Delta}^{(${iteration})} = \\begin{bmatrix} ` + delta1D.map(d => formatNumber(d)).join(" \\\\ ") + " \\end{bmatrix}";
        
        let vectorXNewLatex = `\\mathbf{X}^{(${iteration+1})} = \\begin{bmatrix} ` + newGuesses.map(g => formatNumber(g)).join(" \\\\ ") + " \\end{bmatrix}";

        let stepLatex = `
            \\begin{array}{l}
            \\text{Iteración } ${iteration}: \\\\
            ${vectorXLatex} \\quad ${jacValLatex} \\quad ${vectorFLatex} \\\\
            \\text{Resolviendo } \\mathbf{J} \\cdot \\mathbf{\\Delta} = -\\mathbf{F} \\implies ${deltaLatex} \\\\
            \\text{Siguiente Paso } \\mathbf{X}^{(${iteration+1})} = \\mathbf{X}^{(${iteration})} + \\mathbf{\\Delta} \\implies ${vectorXNewLatex} \\\\
            \\text{Error Relativo Máximo: } ${formatNumber(maxError * 100)}\\%
            \\end{array}
        `;

        let iterDiv = document.createElement("div");
        iterDiv.className = "iterationDisplay";
        iterDiv.style.marginBottom = "15px";
        iterDiv.innerHTML = katex.renderToString(stepLatex, { throwOnError: false, displayMode: true });
        functionDisplay.appendChild(iterDiv);

        // Agregar fila a la tabla visual
        let rowData = [iteration];
        for (let i = 0; i < n; i++) {
            rowData.push(formatNumber(guesses[i]));
        }
        for (let i = 0; i < n; i++) {
            rowData.push(formatNumber(fVal[i]));
        }
        rowData.push(`${formatNumber(maxError * 100)}%`);

        let tr = document.createElement("tr");
        for (let i = 0; i < rowData.length; i++) {
            let td = document.createElement("td");
            td.innerHTML = rowData[i];
            tr.appendChild(td);
        }
        body.appendChild(tr);

        // Agregar fila al Excel
        let excelRowData = [iteration];
        for (let i = 0; i < n; i++) {
            excelRowData.push(guesses[i]);
        }
        for (let i = 0; i < n; i++) {
            excelRowData.push(fVal[i]);
        }
        excelRowData.push(maxError);
        sheet.addRow(excelRowData);

        // Verificar convergencia
        let maxFuncVal = Math.max(...fVal.map(v => Math.abs(v)));
        if (maxFuncVal <= epsilon) {
            alert(`Se encontró la raíz exacta o cumple la tolerancia de funciones en la iteración ${iteration}.`);
            iterate = false;
        } else if (repeatOption === "Cumplir Tolerancia" && maxError <= epsilon && iteration > 1) {
            alert(`El valor de la aproximación cumple con la precisión deseada en la iteración ${iteration}.`);
            iterate = false;
        } else if (repeatOption === "Definir Iteraciones" && iteration >= maxAllowedIterations) {
            iterate = false;
        } else if (iteration >= 200) {
            alert("Se alcanzó el límite máximo de 200 iteraciones.");
            iterate = false;
        }

        prevGuesses = [...guesses];
        guesses = [...newGuesses];
        iteration++;
    }

    // Configurar columna de error en formato porcentaje en Excel
    const errColIdx = type === "system2" ? 6 : 8;
    sheet.getColumn(errColIdx).numFmt = "0.00%";

    // Graficar Trayectorias de Variables
    let chartCanvas = document.getElementById('chart');
    const existingChart = Chart.getChart(chartCanvas);
    if (existingChart) {
        existingChart.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    const colors = ['rgba(0, 170, 26, 0.8)', 'rgba(0, 112, 192, 0.8)', 'rgba(216, 50, 50, 0.8)'];
    const fillColors = ['rgba(0, 170, 26, 0.1)', 'rgba(0, 112, 192, 0.1)', 'rgba(216, 50, 50, 0.1)'];

    let datasets = vars.map((v, i) => {
        return {
            label: `Aproximación de ${v}`,
            data: trajectoryData[i],
            borderColor: colors[i],
            backgroundColor: fillColors[i],
            pointBackgroundColor: colors[i],
            tension: 0.2
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: eachIteration,
            datasets: datasets
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Iteración' },
                    ticks: { precision: 0 }
                },
                y: { 
                    title: { display: true, text: 'Valor de Aproximación' }
                }
            },
            animation: {
                onComplete: async () => {
                    const chartImage = chartCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
                    let chartSheet = workbook.getWorksheet("Gráfico");
                    if (!chartSheet) {
                        chartSheet = workbook.addWorksheet("Gráfico");
                    } else {
                        workbook.removeWorksheet(chartSheet.id);
                        chartSheet = workbook.addWorksheet("Gráfico");
                    }

                    const imageId = workbook.addImage({
                        base64: chartImage,
                        extension: 'png',
                    });

                    chartSheet.addImage(imageId, {
                        tl: { col: 0, row: 0 },
                        br: { col: 10, row: 20 }
                    });

                    await updateExcelDownloadBtn();
                }
            }
        }
    });

    // Graficar Error Relativo Máximo
    let chartCanvasError = document.getElementById('chartError');
    const existingChartError = Chart.getChart(chartCanvasError);
    if (existingChartError) {
        existingChartError.destroy();
    }

    const ctxError = chartCanvasError.getContext('2d');
    new Chart(ctxError, {
        type: 'line',
        data: {
            labels: eachIteration,
            datasets: [{
                label: 'Error Relativo Máximo por iteración',
                data: eachRelativeError,
                borderColor: 'rgba(220, 160, 0, 0.8)',
                backgroundColor: 'rgba(220, 160, 0, 0.1)',
                pointBackgroundColor: 'rgba(220, 160, 0, 1)',
                tension: 0.2
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Error: ${formatNumber(context.parsed.y * 100)}%`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    title: { display: true, text: 'Iteración' },
                    ticks: { precision: 0 }
                },
                y: { 
                    title: { display: true, text: 'Error relativo máximo' },
                    ticks: {
                        callback: function(value) {
                            return `${value*100}%`;
                        }
                    }
                }
            },
            animation: {
                onComplete: async () => {
                    const chartImageError = chartCanvasError.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
                    let chartSheetError = workbook.getWorksheet("Gráfico del Error");
                    if (!chartSheetError) {
                        chartSheetError = workbook.addWorksheet("Gráfico del Error");
                    } else {
                        workbook.removeWorksheet(chartSheetError.id);
                        chartSheetError = workbook.addWorksheet("Gráfico del Error");
                    }

                    const imageIdError = workbook.addImage({
                        base64: chartImageError,
                        extension: 'png',
                    });

                    chartSheetError.addImage(imageIdError, {
                        tl: { col: 0, row: 0 },
                        br: { col: 10, row: 20 }
                    });

                    await updateExcelDownloadBtn();
                }
            }
        }
    });

    // Helper para regenerar el botón y el enlace Excel
    async function updateExcelDownloadBtn() {
        // Verificar que ambas hojas existan antes de escribir el archivo final
        if (!workbook.getWorksheet("Gráfico") || !workbook.getWorksheet("Gráfico del Error")) {
            return;
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        let existingBtn = document.getElementById("excelFile_btn");
        if (existingBtn) {
            existingBtn.remove();
        }

        const excelbtn = document.createElement("button");
        excelbtn.id = "excelFile_btn";
        excelbtn.innerHTML = "Generar Excel";

        const url = URL.createObjectURL(blob);
        excelbtn.addEventListener("click", () => {
            const link = document.createElement("a");
            link.href = url;
            link.download = `Método por ${method}.xlsx`;
            mathContainer.appendChild(link);
            link.click();
            mathContainer.removeChild(link);
        });

        const excelDisplay = document.getElementById("excelDisplay");
        if (excelDisplay) {
            excelDisplay.appendChild(excelbtn);
        }
    }
}

// ================================
// GRÁFICA DE ECUACIONES (system2)
// ================================

function plotSystemEquations(compiledEqs) {
    const n = compiledEqs.length;
    console.log(n)

    if (n <= 2) {
        plot2DSystem(compiledEqs);
    } else {
        plot3DSystem(compiledEqs);
    }
}

function plot2DSystem(compiledEqs) {
    const canvas = document.getElementById("grafica");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const range = 10;
    const step = 0.2;

    const datasets = [];
    const colors = ["red", "blue", "green"];

    const xValues = [];

    for (let x = -range; x <= range; x += step) {
        xValues.push(x);
    }

    compiledEqs.forEach((f, index) => {
        if (!f) return;

        const yValues = [];

        for (let x = -range; x <= range; x += step) {
            let best = null;

            for (let y = -range; y <= range; y += step) {
                try {
                    const err = Math.abs(f.evaluate({ x, y }));

                    if (!best || err < best.err) {
                        best = { y, err };
                    }
                } catch (e) {}
            }

            yValues.push(best ? best.y : null);
        }

        datasets.push({
            label: `f${index + 1}(x,y)=0`,
            data: yValues,
            borderColor: colors[index] || "black",
            pointRadius: 0,
            tension: 0.2
        });
    });

    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    new Chart(ctx, {
        type: "line",
        data: {
            labels: xValues,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `y = ${ctx.parsed.y}`
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: "x" } },
                y: { title: { display: true, text: "y" } }
            }
        }
    });
}

function plot3DSystem(equations) {
    const grafica3D = document.getElementById("grafica3D");
    const grafica = document.getElementById("grafica");

    grafica3D.style.display = "block";
    grafica.style.display = "none";

    Plotly.purge("grafica3D");

    const range = 5;
    const step = 0.3;

    const traces = [];

    equations.forEach((eq, index) => {

        const color = getUniqueColor();

        const values = [];
        const x = [];
        const y = [];
        const z = [];

        for (let i = -range; i <= range; i += step) {
            for (let j = -range; j <= range; j += step) {
                for (let k = -range; k <= range; k += step) {

                    const scope = { x: i, y: j, z: k };

                    let val = 0;

                    try {
                        val = Math.abs(eq.evaluate(scope));
                    } catch {
                        continue;
                    }

                    x.push(i);
                    y.push(j);
                    z.push(k);
                    values.push(val);
                }
            }
        }

        traces.push({
            type: "isosurface",
            x,
            y,
            z,
            value: values,

            isomin: 0,
            isomax: 0.3,
            surface: {
                count: 1
            },

            colorscale: [
                [0, color],
                [1, color]
            ],

            opacity: 0.6,

            showscale: false,

            name: `f${index + 1}`
        });
    });

    const layout = {
        title: {
            text: "Sistema de ecuaciones 3x3",
            font: { color: "#e5e7eb" }
        },

        paper_bgcolor: "#0f172a",
        plot_bgcolor: "#0f172a",

        scene: {
            bgcolor: "#0f172a",

            xaxis: {
                title: "X",
                gridcolor: "rgba(255,255,255,0.08)",
                zerolinecolor: "rgba(255,255,255,0.2)"
            },

            yaxis: {
                title: "Y",
                gridcolor: "rgba(255,255,255,0.08)",
                zerolinecolor: "rgba(255,255,255,0.2)"
            },

            zaxis: {
                title: "Z",
                gridcolor: "rgba(255,255,255,0.08)",
                zerolinecolor: "rgba(255,255,255,0.2)"
            }
        }
    };

    Plotly.newPlot("grafica3D", traces, layout);

    setTimeout(() => {
        Plotly.Plots.resize("grafica3D");
    }, 100);
}

function getUniqueColor() {
    const baseColors = [
        "#9b59b6",
        "#f39c12",
        "#1abc9c",
        "#e67e22",
        "#34495e",
        "#e84393",
        "#fd79a8",
        "#fdcb6e",
        "#6c5ce7",
        "#00b894"
    ];

    // si el pool está vacío → lo recargamos y mezclamos
    if (colorPool.length === 0) {
        colorPool = [...baseColors];

        // shuffle (Fisher-Yates)
        for (let i = colorPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colorPool[i], colorPool[j]] = [colorPool[j], colorPool[i]];
        }
    }

    return colorPool.pop();
}

let colorPool = [];