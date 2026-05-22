import { evaluateFunction } from "../MathLogistic.js";

function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

// FUNCION PARA EL MÉTODO DE REGLA FALSA //
export function RegulaFalsiMethod(
    mathFunction,
    aInterval,
    bInterval,
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

    const headerRow = ["Iteración", "a", "Intersección", "b", "f(a)", "f(Intersección)", "f(b)", "Ec%"];

    for (let i = 0; i <= 7; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];

        row.appendChild(tableData);
    }

    head.appendChild(row);

    mainTable.appendChild(head);
    mainTable.appendChild(body);

    table.appendChild(mainTable);

    let method = "Regla Falsa";

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
            fgColor: { argb: "8899AA00" }
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
    let eachIntersection = [];
    let eachRelativeError = [];

    let iteration = 1;
    let lastIntersection = 0;

    while (true) {
        const data = RegulaFalsiOperation(
            aInterval,
            bInterval,
            mathFunction,
            epsilon,
            iteration,
            sheet,
            lastIntersection
        );

        eachIteration.push(iteration);
        eachIntersection.push(data.intersection);

        eachRelativeError.push(data.relativeError);

        aInterval = data.aInterval;
        bInterval = data.bInterval;

        lastIntersection = data.intersection;

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

    

    sheet.getColumn(8).numFmt = "0.00%";

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
                label: 'Valor de Intersección por iteración',
                data: eachIntersection,
                borderColor: 'rgba(153, 170, 0, 0.534)',       // Línea similar al glow
                backgroundColor: 'rgba(153, 170, 0, 0.2)',     // Relleno suave
                pointBackgroundColor: 'rgba(153, 170, 0, 0.8)',// Puntos más sólidos
                pointBorderColor: 'rgba(121, 121, 0, 1)',      // Borde de los puntos
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
                    title: { display: true, text: 'Valor de Intersección' },
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

                    // Crear hoja para el gráfico
                    let chartSheet = workbook.getWorksheet("Gráfico");
                    if (!chartSheet) {
                        chartSheet = workbook.addWorksheet("Gráfico");
                    } else {
                        workbook.removeWorksheet(chartSheet.id);  // opcional: eliminar y crear nueva
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

                    const excelDisply = document.getElementById("excelDisplay");
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
                label: 'Error Relativo por Iteración',
                data: eachRelativeError,
                borderColor: 'rgba(153, 170, 0, 0.534)',       // Línea similar al glow
                backgroundColor: 'rgba(153, 170, 0, 0.2)',     // Relleno suave
                pointBackgroundColor: 'rgba(153, 170, 0, 0.8)',// Puntos más sólidos
                pointBorderColor: 'rgba(121, 121, 0, 1)',      // Borde de los puntos
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
                    title: { display: true, text: 'Error Relativo' },
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
                        workbook.removeWorksheet(chartSheetError.id);  // opcional: eliminar y crear nueva
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

                    const excelDisply = document.getElementById("excelDisplay");
                    excelDisplay.appendChild(excelbtn);
                }
            },
        }
    });
}
// =================================== //


// FUNCION PARA REALIZAR EL MÉTODO DE REGLA FALSA //
function RegulaFalsiOperation(
    aInterval,
    bInterval,
    mathFunction,
    epsilon,
    iteration,
    sheet,
    lastIntersection
) {
    const result = RegulaFalsiCalculus(
        aInterval,
        bInterval,
        mathFunction,
        epsilon,
        iteration
    );

    RegulaFalsiLog(
        iteration,
        aInterval,
        bInterval,
        result.intersection,
        mathFunction,
        result.aEvaluation,
        result.bEvaluation,
        result.intersectionEvaluation,
        result.aIsLessThanZero,
        result.bIsLessThanZero
    );

    const latexString = `
        \\begin{array}{l l}
        \\text{Iteración:} & ${iteration} \\\\
        a & ${aInterval} \\\\
        ∩ & ${result.intersection} \\\\
        b & ${bInterval} \\\\
        f(a) & ${result.aEvaluation} \\\\
        f(∩) & ${result.intersectionEvaluation} \\\\
        f(b) & ${result.bEvaluation} \\\\
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
    if (iteration === 1) excelFormula = `=C${iteration+1}/C${iteration+1}`;
    if (iteration > 1) excelFormula = `=ABS((C${iteration+1}-C${iteration})/C${iteration})`
    sheet.addRow([iteration, aInterval, result.intersection, bInterval, result.aEvaluation, result.intersectionEvaluation, result.bEvaluation, { formula: excelFormula }]);

    let relativeError = 0;

    if (iteration === 1) {
        relativeError = 1;
    }
    else if (iteration > 1) {
        relativeError = math.abs(((lastIntersection - result.intersection) / result.intersection));
    }


    const tableBody = document.getElementById("tableBody");

    const row = document.createElement("tr");

    const data = [
        iteration,
        formatNumber(aInterval),
        formatNumber(result.intersection),
        formatNumber(bInterval),
        formatNumber(result.aEvaluation),
        formatNumber(result.intersectionEvaluation),
        formatNumber(result.bEvaluation),
        `${formatNumber(relativeError * 100)}%`
    ];

    for (let i = 0; i <= 7; i++) {
        const tableData = document.createElement("td");
        tableData.innerHTML = data[i];

        row.appendChild(tableData);
    }

    tableBody.appendChild(row);


    return {
        aInterval: result.aInterval,
        bInterval: result.bInterval,
        intersection: result.intersection,
        iterate: result.iterate,
        relativeError
    }
}
// ============================================== //


// FUNCION PARA CALCULO DEL MÉTODO DE REGLA FALSA //
function RegulaFalsiCalculus(
    aInterval,
    bInterval,
    mathFunction,
    epsilon,
    iteration
) {
    let iterate = true;
    let { lessThanZero: aIsLessThanZero, result: aEvaluation } = evaluateFunction(mathFunction, aInterval);
    let { lessThanZero: bIsLessThanZero, result: bEvaluation } = evaluateFunction(mathFunction, bInterval);

    // Intersección de la recta b−( ((f(b)(b−a)) / ((f(b)−f(a)) )​
    let intersection = bInterval - (bEvaluation * (bInterval - aInterval)) / (bEvaluation - aEvaluation);
    let { result: intersectionEvaluation } = evaluateFunction(mathFunction, intersection);


    if (aEvaluation === 0 || intersectionEvaluation === 0 || bEvaluation === 0) {
        alert(`Se encontró la raíz exacta en la iteración ${iteration}...`);
        iterate = false;
    }
    else if (Math.abs(intersectionEvaluation) <= epsilon) {
        alert(`El valor de la raíz "${intersection}" cumple con la precisión deseada en la iteración ${iteration}...`);
        iterate = false;
    }

    if (!iterate) {
        return {
            aInterval,
            bInterval,
            intersection,
            aEvaluation,
            bEvaluation,
            intersectionEvaluation,
            aIsLessThanZero,
            bIsLessThanZero,
            iterate
        }
    }

    if (aEvaluation * intersectionEvaluation < 0) {
        bInterval = intersection;
    } else {
        aInterval = intersection;
    }

    return {
        aInterval,
        bInterval,
        intersection,
        aEvaluation,
        bEvaluation,
        intersectionEvaluation,
        aIsLessThanZero,
        bIsLessThanZero,
        iterate
    }
}
// ============================================== //

// FUNCION PARA IMPRIMIR DATOS DEL MÉTODO DE REGLA FALSA //
function RegulaFalsiLog(
    iteration,
    aInterval,
    bInterval,
    intersection,
    mathFunction,
    aEvaluation,
    bEvaluation,
    intersectionEvaluation,
    aIsLessThanZero,
    bIsLessThanZero
) {
    console.log(`Iteración: ${iteration}`);
    console.log(`a: ${aInterval}`);
    console.log(`b: ${bInterval}`);
    console.log(`Intersección: ${intersection}`);
    
    console.log("");

    console.log("Fórmula: b - (f(b) * (b - a)) / (f(b) - f(a))");
    console.log(`Cálculo de la intersección: ${bInterval} - (${bEvaluation} * (${bInterval} - ${aInterval})) / (${bEvaluation} - ${aEvaluation})`);

    console.log("");
    console.log(`A - evaluación: f(x) = ${mathFunction} // f(x) = ${aEvaluation}`);
    console.log(`Intersección - evaluación: f(x) = ${mathFunction} // f(x) = ${intersectionEvaluation}`);
    console.log(`B - evaluación: f(x) = ${mathFunction} // f(x) = ${bEvaluation}`);
    
    console.log("");

    console.log(`A/xr - es menor que 0: ${aIsLessThanZero}`);
    console.log(`B/xr - es menor que 0: ${bIsLessThanZero}`);
    console.log("");
}
// ===================================================== //