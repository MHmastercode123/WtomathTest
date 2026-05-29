import { evaluateFunction } from "../utils.js";

function formatNumber(num) {
    const value = Number(num);

    if (isNaN(value)) return "NaN";

    const EPSILON_THRESHOLD = 1e-6;

    if (Math.abs(value) < EPSILON_THRESHOLD && value !== 0) {
        return value.toExponential(8);
    }

    return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

export function MullerMethod(
    mathFunction,
    xFirstValue,
    xSecondValue,
    xThirdValue,
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

    const headerRow = ["Iteración", "x_i-1", "x_i", "x_i+1", "x_i+2", "h_i-1", "h_i", "d_i-1", "d_i", "a", "b", "c"];

    for (let i = 0; i <= 11; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];

        row.appendChild(tableData);
    }

    head.appendChild(row);

    mainTable.appendChild(head);
    mainTable.appendChild(body);

    table.appendChild(mainTable);

    let method = "Müller";

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
            fgColor: { argb: "88AB6100" }
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
    let eachValue = [];
    let eachRelativeError = [1];

    let iteration = 1;
    let lastValue = xThirdValue;

    while (true) {
        const data = MullerOperation(
            mathFunction,
            xFirstValue,
            xSecondValue,
            xThirdValue,
            iteration,
            epsilon
        );

        lastValue = xThirdValue;

        sheet.addRow([iteration, xFirstValue, xSecondValue, xThirdValue, data.xFourthValue, data.firstD, data.secondD, data.firstSlope, data.secondSlope, data.a, data.b, data.c]);

        const tableBody = document.getElementById("tableBody");

        const row = document.createElement("tr");

        const info = [
            iteration,
            formatNumber(xFirstValue),
            formatNumber(xSecondValue),
            formatNumber(xThirdValue),
            formatNumber(data.xFourthValue),
            formatNumber(data.firstD),
            formatNumber(data.secondD),
            formatNumber(data.firstSlope),
            formatNumber(data.secondSlope),
            formatNumber(data.a),
            formatNumber(data.b),
            formatNumber(data.c)
        ];

        for (let i = 0; i <= 11; i++) {
            const tableData = document.createElement("td");
            tableData.innerHTML = info[i];

            row.appendChild(tableData);
        }

        tableBody.appendChild(row);

        const latexString = `
            \\begin{array}{l l}
            \\text{Iteración:} & ${iteration} \\\\
            x_${iteration-1} & ${xFirstValue} \\\\
            x_${iteration} & ${xSecondValue} \\\\
            x_${iteration+1} & ${xThirdValue} \\\\
            x_${iteration+2} & ${data.xFourthValue} \\\\
            \\\\
            h_${iteration-1} & ${data.firstD} \\\\
            h_${iteration} & ${data.secondD} \\\\
            \\\\
            d_${iteration-1} & ${data.firstSlope} \\\\
            d_${iteration} & ${data.secondSlope} \\\\
            \\\\
            a & ${data.a} \\\\
            b & ${data.b} \\\\
            c & ${data.c} \\\\
            \\end{array}
        `;

        eachIteration.push(iteration);
        eachValue.push(data.xFourthValue);

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

        // Condición de parada por iteraciones
        if (repeatOption === "Definir Iteraciones" && iteration >= iterations) {
            break;
        }

        // Condición de parada por tolerancia
        let previousValue = xThirdValue;
        lastValue = xThirdValue;

        eachRelativeError.push(Math.abs(data.xFourthValue - previousValue));


        if (repeatOption === "Cumplir Tolerancia" && Math.abs(data.xFourthValue - lastValue) < epsilon) {
            console.log("Convergencia en la iteración:", iteration);
            console.log("Raíz:", data.xFourthValue);
            break;
        }

        // Límite de seguridad
        if (iteration >= 200) {
            alert("Se alcanzó el limite máximo de iteraciones permitidas...");
            break;
        }

        xFirstValue = xSecondValue;
        xSecondValue = xThirdValue;
        xThirdValue = data.xFourthValue;

        iteration++;
    }

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
                label: 'Valor de x por iteración',
                data: eachValue,
                borderColor: 'rgba(170, 94, 0, 0.53)',       // Línea principal (glow)
                backgroundColor: 'rgba(171, 97, 0, 0.2)',    // Relleno suave debajo de la línea
                pointBackgroundColor: 'rgba(171, 97, 0, 0.8)', // Puntos más sólidos
                pointBorderColor: 'rgb(140, 80, 0)',         // Borde de los puntos, cercano al fondo 
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
                    title: { display: true, text: 'Valor de x' },
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
                label: 'Error Relativo por Iteración',
                data: eachRelativeError,
                borderColor: 'rgb(0, 123, 255)',         // Línea azul fuerte
                backgroundColor: 'rgba(0, 123, 255, 0.2)', // Relleno azul claro
                pointBackgroundColor: 'rgb(0, 82, 204)',  // Puntos azul oscuro
                pointBorderColor: 'rgb(0, 60, 150)',      // Borde de puntos
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

                    const excelDisplay = document.getElementById("excelDisplay");
                    excelDisplay.appendChild(excelbtn);
                }
            },
        }
    });
}

function MullerOperation(
    mathFunction,
    xFirstValue,
    xSecondValue,
    xThirdValue,
    iteration,
    epsilon
) {
    const { result: xFirstValueEvaluation } = evaluateFunction(mathFunction, xFirstValue);
    const { result: xSecondValueEvaluation } = evaluateFunction(mathFunction, xSecondValue);
    const { result: xThirdValueEvaluation } = evaluateFunction(mathFunction, xThirdValue);

    console.log("");
    console.log(`Iteración: ${iteration}`);
    console.log("");
    console.log(`Función: ${mathFunction}`);
    console.log("");
    console.log(`x${iteration-1} = ${xFirstValue}`);
    console.log(`x${iteration} = ${xSecondValue}`);
    console.log(`x${iteration+1} = ${xThirdValue}`);
    console.log("");
    console.log(`f(x${iteration-1}) = ${xFirstValueEvaluation}`);
    console.log(`f(x${iteration}) = ${xSecondValueEvaluation}`);
    console.log(`f(x${iteration+1}) = ${xThirdValueEvaluation}`);
    console.log("");

    // Cálculo de las diferencias
    let firstD = xSecondValue - xFirstValue;
    let secondD = xThirdValue - xSecondValue;
    console.log(`h${iteration-1} = x${iteration} - x${iteration-1} = ${xSecondValue} - (${xFirstValue}) = ${firstD}`);
    console.log(`h${iteration} = x${iteration+1} - x${iteration} = ${xThirdValue} - (${xSecondValue}) = ${secondD}`);

    // Cálculo de las pendientes
    let firstSlope = (xSecondValueEvaluation - xFirstValueEvaluation) / firstD;
    let secondSlope = (xThirdValueEvaluation - xSecondValueEvaluation) / secondD;
    console.log(`d${iteration-1} = (h${iteration} - (h${iteration-1})) / h${iteration-1} = (${xSecondValueEvaluation} - (${xFirstValueEvaluation})) / ${firstD} = ${firstSlope}`);
    console.log(`d${iteration} = (h${iteration} - (h${iteration-1})) / h${iteration-1} = (${xThirdValueEvaluation} - (${xSecondValueEvaluation})) / ${secondD} = ${secondSlope}`);

    // Cálculo de los coeficientes de la parábola
    let a = (secondSlope - firstSlope) / (secondD  + firstD);
    let b = (a * secondD) + secondSlope;
    let c = Number(xThirdValueEvaluation);

    console.log(`a = (d${iteration} - (d${iteration-1})) / (h${iteration} + (h${iteration-1})) = (${secondSlope} - (${firstSlope})) / (${secondD} + (${firstD})) = ${a}`);
    console.log(`b = (a * h${iteration}) + d${iteration} = (${a} * ${secondSlope}) + ${secondD} = ${b}`);
    console.log(`c = f(x${iteration+1}) = ${c}`);

    // Cálculo nueva aproximación
    let discriminant = Math.sqrt((b**2) - (4 * a * c));

    let denominator =
        Math.abs(b + discriminant) > Math.abs(b - discriminant)
            ? (b + discriminant)
            : (b - discriminant);

    let xFourthValue = xThirdValue - (2 * c / denominator);


    return {
        xFourthValue,
        firstD,
        secondD,
        firstSlope,
        secondSlope,
        a,
        b,
        c
    };
}
