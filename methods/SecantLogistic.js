import { evaluateFunction } from "../MathLogistic.js";

function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

// FUNCION PARA EL MÉTODO DE LA SECANTE //
export function SecantMethod(
    mathFunction,
    firstApproach,
    secondApproach,
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

    const headerRow = ["Iteración", "Aprox. anterior", "Aprox. posterior", "Nueva Aprox.", "f(Aprox. anterior)", "f(Aprox. posterior)", "Ec%"];

    for (let i = 0; i <= 6; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];

        row.appendChild(tableData);
    }

    head.appendChild(row);

    mainTable.appendChild(head);
    mainTable.appendChild(body);

    table.appendChild(mainTable);

    let method = "Secante";

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
            fgColor: { argb: "AA000088" }
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
    
    while(true) {
        const data = SecantOperation(
            firstApproach,
            secondApproach,
            mathFunction,
            epsilon,
            iteration,
            sheet,
            lastNewApproach
        );

        eachIteration.push(iteration);
        eachApproach.push(data.newApproach);

        eachRelativeError.push(data.relativeError);

        firstApproach = secondApproach;
        secondApproach = data.newApproach;
        
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

    sheet.getColumn(7).numFmt = "0.00%";

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
                label: 'Valor de Aproximación (x_n+1) por iteración',
                data: eachApproach,
                borderColor: 'rgba(170, 0, 0, 0.8)',
                backgroundColor: 'rgba(170, 0, 0, 0.2)',
                pointBackgroundColor: 'rgba(170, 0, 0, 0.9)',
                pointHoverBackgroundColor: 'rgb(200, 0, 0)',
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
                    title: { display: true, text: 'Valor de Aproximación (x_n+1)' },
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
                label: 'Error Relativo',
                data: eachRelativeError,
                borderColor: 'rgba(170, 0, 0, 0.8)',
                backgroundColor: 'rgba(170, 0, 0, 0.2)',
                pointBackgroundColor: 'rgba(170, 0, 0, 0.9)',
                pointHoverBackgroundColor: 'rgb(200, 0, 0)',
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
                    title: { display: true, text: 'Error Relativo por iteración' },
                    ticks: {
                        callback: function(value) {
                            return `${value*100}%`;
                        }
                    }
                }
            },
            animation: {
                onComplete: async () => {
                    const chartImageError = chartCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");

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
// ==================================== //

// FUNCION PARA REALIZAR EL MÉTODO DE LA SECANTE //
function SecantOperation(
    firstApproach,
    secondApproach,
    mathFunction,
    epsilon,
    iteration,
    sheet,
    lastNewApproach
) {
    const result = SecantCalculus(
        firstApproach,
        secondApproach,
        mathFunction,
        epsilon,
        iteration
    );

    SecantLog(
        iteration,
        firstApproach,
        secondApproach,
        result.newApproach,
        mathFunction,
        result.firstApproachEvaluation,
        result.secondApproachEvaluation
    );

    const latexString = `
        \\begin{array}{l l}
        \\text{Iteración:} & ${iteration} \\\\
        x_0 & ${firstApproach} \\\\
        x_1 & ${secondApproach} \\\\
        f(x_0) & ${result.firstApproachEvaluation} \\\\
        f(x_1) & ${result.secondApproachEvaluation} \\\\
        x_2 & ${result.newApproach} \\\\
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

    if (iteration === 1) excelFormula = `=D${iteration+1}/D${iteration+1}`;
    if (iteration > 1) excelFormula = `=ABS((D${iteration+1}-D${iteration})/D${iteration})`;

    const newApproachExcelFormula = `=C${iteration+1} - (F${iteration+1} * (C${iteration+1} - B${iteration+1})) / (F${iteration+1} - E${iteration+1})`;

    if (iteration === 1) sheet.addRow([iteration, firstApproach, secondApproach, { formula: newApproachExcelFormula }, result.firstApproachEvaluation, result.secondApproachEvaluation, { formula: excelFormula }]);
    else sheet.addRow([iteration, { formula: `=C${iteration}` }, { formula: `=D${iteration}` }, { formula: newApproachExcelFormula }, result.firstApproachEvaluation, result.secondApproachEvaluation, { formula: excelFormula }]);


    let relativeError = 0;

    if (iteration === 1) {
        relativeError = 1;
    } else {
        relativeError = math.abs((lastNewApproach - result.newApproach) / result.newApproach);
    }


    const tableBody = document.getElementById("tableBody");

    const row = document.createElement("tr");

    const data = [
        iteration,
        formatNumber(firstApproach),
        formatNumber(secondApproach),
        formatNumber(result.firstApproachEvaluation),
        formatNumber(result.secondApproachEvaluation),
        formatNumber(result.newApproach),
        `${formatNumber(relativeError * 100)}%`
    ];

    for (let i = 0; i <= 6; i++) {
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


// FUNCION PARA CALCULO DEL MÉTODO DE LA SECANTE //
function SecantCalculus(
    firstApproach,
    secondApproach,
    mathFunction,
    epsilon,
    iteration
) {
    let iterate = true;

    // x_0 --- x_n-1
    let { result: firstApproachEvaluation } = evaluateFunction(mathFunction, firstApproach);

    // x_1 --- x_n
    let { result: secondApproachEvaluation } = evaluateFunction(mathFunction, secondApproach)

    // x_2 --- x_n+1
    let newApproach = secondApproach - secondApproachEvaluation * (secondApproach - firstApproach) / (secondApproachEvaluation - firstApproachEvaluation);


    if (firstApproachEvaluation === 0 || secondApproachEvaluation === 0) {
        alert(`Se encontró la raíz exacta en la iteración ${iteration}...`);
        iterate = false;
    }
    else if (Math.abs(newApproach - secondApproach) <= epsilon) {
        alert(`El valor de la raíz cumple con la precisión deseada en la iteración ${iteration}...`);
        iterate = false;
    }

    return {
        newApproach,
        firstApproachEvaluation,
        secondApproachEvaluation,
        iterate
    }
}
// ============================================== //

// FUNCION PARA IMPRIMIR DATOS DEL MÉTODO DE LA SECANTE //
function SecantLog(
    iteration,
    firstApproach,
    secondApproach,
    newApproach,
    mathFunction,
    firstApproachEvaluation,
    secondApproachEvaluation
) {
    console.log(`Iteración: ${iteration}`);
    console.log(`Primera Aproximación (x_0): ${firstApproach}`);
    console.log(`Segunda Aproximación (x_1): ${secondApproach}`);
    console.log(`Nueva Aproximación (x_2): ${newApproach}`);

    console.log("");

    console.log("Fórmula: x_1 - (f(x_1) * (x_1 - x_0)) / (f(x_1) - f(x_0))");
    console.log(`Cálculo de la aproximación: ${secondApproach} - (${secondApproachEvaluation} * (${secondApproach} - ${firstApproach})) / (${secondApproachEvaluation} - ${firstApproachEvaluation})`);

    console.log("");
    console.log(`Primera Aproximación - evaluación: f(x) = ${mathFunction} // f(x) = ${firstApproachEvaluation}`);
    console.log(`Segunda Aproximación - evaluación: f(x) = ${mathFunction} // f(x) = ${secondApproachEvaluation}`);
    console.log("");
}
// ===================================================== //