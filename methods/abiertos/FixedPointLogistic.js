function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

export function FixedPointMethod(
    g,
    xValue,
    lambdaValue,
    mathEquation,
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

    const headerRow = ["Iteración", "Valor de x", "Nuevo valor de x", "λ"];

    for (let i = 0; i <= 3; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];

        row.appendChild(tableData);
    }

    head.appendChild(row);

    mainTable.appendChild(head);
    mainTable.appendChild(body);

    table.appendChild(mainTable);

    let method = "Punto Fijo";

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
            fgColor: { argb: "8800AAA4" }
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

    let iteration = 1;

    while (true) {
        let newValue = g(xValue, lambdaValue);

        sheet.addRow([iteration, xValue, newValue, lambdaValue]);

        const tableBody = document.getElementById("tableBody");

        const row = document.createElement("tr");

        const data = [
            iteration,
            formatNumber(xValue),
            formatNumber(newValue),
            lambdaValue
        ];

        for (let i = 0; i <= 3; i++) {
            const tableData = document.createElement("td");
            tableData.innerHTML = data[i];

            row.appendChild(tableData);
        }

        tableBody.appendChild(row);


        const latexString = `
            \\begin{array}{l l}
            \\text{Iteración:} & ${iteration} \\\\
            x_n & ${xValue} \\\\
            x_n+1 & ${newValue} \\\\
            λ & ${lambdaValue} \\\\
            \\end{array}
        `;

        eachIteration.push(iteration);
        eachValue.push(newValue);

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
        if (repeatOption === "Cumplir Tolerancia" && Math.abs(newValue - xValue) < epsilon) {
            console.log("Convergencia en la iteración:", iteration);
            console.log("Raíz:", newValue);
            break;
        }

        // Límite de seguridad
        if (iteration >= 200) {
            alert("Se alcanzó el limite máximo de iteraciones permitidas...");
            break;
        }

        xValue = newValue;

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
                borderColor: 'rgba(0, 170, 136, 0.53)',       // Línea principal (glow)
                backgroundColor: 'rgba(0, 170, 116, 0.2)',     // Relleno suave debajo de la línea
                pointBackgroundColor: 'rgba(0, 170, 142, 0.8)',// Puntos más sólidos
                pointBorderColor: 'rgb(0, 121, 101)',           // Borde de los puntos, cercano al fondo
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
}
