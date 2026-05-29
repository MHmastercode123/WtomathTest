import { evaluateFunction } from "../utils.js";

function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

function getCoefficients(expr) {
    const str = expr.toString().replace(/\s+/g, '');

    // Detectar grado máximo
    const degrees = [...str.matchAll(/x\^(\d+)/g)].map(m => parseInt(m[1]));
    const maxDegree = degrees.length ? Math.max(...degrees) : (str.includes('x') ? 1 : 0);

    let coeffs = new Array(maxDegree + 1).fill(0);

    // Separar términos
    const terms = str.match(/[+-]?[^+-]+/g);

    terms.forEach(term => {
        let coef, degree;

        if (term.includes('x^')) {
            const [c, d] = term.split('x^');
            coef = c === '' || c === '+' ? 1 : c === '-' ? -1 : parseFloat(c);
            degree = parseInt(d);
        } 
        else if (term.includes('x')) {
            const c = term.replace('x', '');
            coef = c === '' || c === '+' ? 1 : c === '-' ? -1 : parseFloat(c);
            degree = 1;
        } 
        else {
            coef = parseFloat(term);
            degree = 0;
        }

        coeffs[maxDegree - degree] = coef;
    });

    return coeffs;
}

// FUNCION PARA EL MÉTODO DE NEWTON HORNER //
export function NewtonHornerMethod(
    mathFunction,
    approach,
    iterations,
    epsilon,
    repeatOption
) {
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

    
    let eachIteration = [];
    let eachApproach = [];
    let eachRelativeError = [];
    
    let iteration = 1;
    let lastNewApproach = 0;
    let lastDerivatedMathFunction = mathFunction;
    
    let derivatedMathFunction = math.derivative(String(lastDerivatedMathFunction).replace(/\s*=\s*0\s*$/, ''), 'x');

    while (true) {
        const data = NewtonHornerOperation(
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


// FUNCION PARA REALIZAR EL MÉTODO DE NEWTON HORNER //
function NewtonHornerOperation(
    approach,
    mathFunction,
    derivatedMathFunction,
    epsilon,
    iteration,
    sheet,
    lastNewApproach
) {
    const result = NewtonHornerCalculus(
        approach,
        mathFunction,
        derivatedMathFunction,
        epsilon,
        iteration
    );

    NewtonHornerLog(
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


// FUNCION PARA CALCULO DEL MÉTODO DE NEWTON HORNER //
function NewtonHornerCalculus(
    approach,
    mathFunction,
    derivatedMathFunction,
    epsilon,
    iteration
) {
    // División sintética
    let mathFunctionFinalResult = 0;
    let syntheticResult = 0;
    let term = 0;

    let mathFunctionTerms = getCoefficients(mathFunction);
    let derivatedMathFunctionTerms = getCoefficients(derivatedMathFunction);


    console.log("División Sintética de la Función");
    for (let i = 0; i < mathFunctionTerms.length; i++) {
        term = mathFunctionTerms[i];
        console.log(mathFunctionTerms[i])

        term = syntheticResult + mathFunctionTerms[i];
        console.log("Termino sumado: " + term)

        if (i !== mathFunctionTerms.length - 1) {
            syntheticResult = approach * term;
            console.log("Resultado sintético: " + syntheticResult)
        }

        if (i === mathFunctionTerms.length - 1) {
            mathFunctionFinalResult = term;
        }
    }

    console.log(mathFunctionFinalResult);


    // División sintética
    let derivatedMathFunctionFinalResult = 0;
    syntheticResult = 0;
    term = 0;


    console.log("División Sintética de la derivada de la Función");
    for (let i = 0; i < derivatedMathFunctionTerms.length; i++) {
        term = derivatedMathFunctionTerms[i];
        console.log(derivatedMathFunctionTerms[i])

        term = syntheticResult + derivatedMathFunctionTerms[i];
        console.log("Termino sumado: " + term)

        if (i !== derivatedMathFunctionTerms.length - 1) {
            syntheticResult = approach * term;
            console.log("Resultado sintético: " + syntheticResult)
        }

        if (i === derivatedMathFunctionTerms.length - 1) {
            derivatedMathFunctionFinalResult = term;
        }
    }

    console.log(derivatedMathFunctionFinalResult);

    
    let iterate = true;
    let { result: approachEvaluation } = evaluateFunction(mathFunction, approach);

    let { result: derivatedApproachEvaluation } = evaluateFunction(derivatedMathFunction, approach);

    let newApproach = approach - mathFunctionFinalResult / derivatedMathFunctionFinalResult;

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

// FUNCION PARA IMPRIMIR DATOS DEL MÉTODO DE NEWTON HORNER //
function NewtonHornerLog(
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
