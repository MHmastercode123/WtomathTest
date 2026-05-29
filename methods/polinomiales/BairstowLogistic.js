import { evaluateFunction } from "../utils.js";

function getCoefficients(expr) {
    const str = String(expr)
        .replace(/\s+/g, '')
        .replace(/=0$/, '');

    const regex = /([+-]?[^+-]+)/g;
    const terms = str.match(regex) || [];

    const map = new Map();
    let maxDegree = 0;

    for (let term of terms) {

        let coef = 0;
        let degree = 0;

        // x^n
        let matchPower = term.match(/([+-]?\d*\.?\d*)x\^(\d+)/);

        if (matchPower) {
            coef = matchPower[1];
            degree = parseInt(matchPower[2]);

            coef = (coef === '' || coef === '+')
                ? 1
                : coef === '-'
                ? -1
                : parseFloat(coef);

        } 
        else if (term.includes('x')) {
            let c = term.replace('x', '');

            coef =
                c === '' || c === '+'
                    ? 1
                    : c === '-'
                    ? -1
                    : parseFloat(c);

            degree = 1;
        } 
        else {
            coef = parseFloat(term);
            degree = 0;
        }

        if (isNaN(coef)) coef = 0;

        map.set(degree, (map.get(degree) || 0) + coef);

        if (degree > maxDegree) maxDegree = degree;
    }

    // construir vector completo desde grado máximo a 0
    let coeffs = [];

    for (let i = maxDegree; i >= 0; i--) {
        coeffs.push(map.get(i) || 0);
    }

    return coeffs;
}



function formatNumber(num) {
    const EPSILON_THRESHOLD = 1e-6;

    if (Math.abs(num) < EPSILON_THRESHOLD && num !== 0) {
        return num.toExponential(8);
    }

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
}

export function BairstowMethod(
    mathFunction,
    iterations,
    epsilon,
    repeatOption
) {
    const mathContainer = document.getElementById("mathContainer");
    const functionDisplay = document.getElementById("functionDisplay");

    const table = document.getElementById("tableDisplay");
    
    const mainTable = document.createElement("table");
    mainTable.id = "mainTable";

    const head = document.createElement("thead");
    head.id = "thead";

    const body = document.createElement("tbody");
    body.id = "tableBody";

    const row = document.createElement("tr");

    let terms = getCoefficients(mathFunction);
    let n = terms.length;

    // let letra = 'a';

    // for (let l = 0; l <= 2; l++) {
    //     for (let i = 1; i <= terms_length; i++) {
    //         headers.push(`${letra}${i-1}`);
    //     }
        
    //     // Sumar 1
    //     code++;

    //     // Convertir de vuelta a letra
    //     letra = String.fromCharCode(code);
    // }

    const headerRow = ["Iteraciones", "r_i-1", "s_i-1", "Δr", "Δs"];

    for (let i = 0; i <= 4; i++) {
        const tableData = document.createElement("th");
        tableData.innerHTML = headerRow[i];

        row.appendChild(tableData);
    }

    head.appendChild(row);

    mainTable.appendChild(head);
    mainTable.appendChild(body);

    table.appendChild(mainTable);

    let method = "Bairstow";

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


    // Variables iniciales
    let eachIteration = [];
    let eachValue = [];
    let eachRelativeError = [1];

    let iteration = 1;

    let bValues = [];
    let cValues = [];

    let lastR = 0;
    let lastS = 0;

    // Para raíces grandes (a_n es comparable o mayor que el término independiente)
    if (Math.abs(terms[0]) >= Math.abs(terms[terms.length - 1])) {
        lastR = terms[1] / terms[0];
        lastS = terms[2] / terms[0];
    }
    
    // Para raíces pequeñas (a_0 es grande respecto a las demás)
    if (Math.abs(terms[terms.length - 1]) > Math.abs(terms[0])) {
        lastR = terms[n-2] / terms[n-3];
        lastS = terms[n-1] / terms[n-3];
    }
    
    for (let i = 0; i <= 50; i++) {
        let aString = "";
        let bString = "";
        let cString = "";

        console.log(`Iteración: ${i}`);

        bValues = [];
        cValues = [];

        console.log(`r: ${lastR}`);
        console.log(`s: ${lastS}`);

        // Imprimir valores de a y calcular valores de b y c
        
        for (let i = 1; i <= n; i++) {
            let a = terms[i-1];

            if (i === 1) {
                bValues.push(a);
                cValues.push(bValues[0]);
            } 
            else if (i === 2) {
                bValues.push(a + (lastR * bValues[0]));
                cValues.push(bValues[1] + lastR * cValues[0]);
            }
            else {
                bValues.push(
                    a +
                    lastR * bValues[bValues.length - 1] +
                    lastS * bValues[bValues.length - 2]
                );
                cValues.push(
                    bValues[bValues.length - 1] +
                    lastR * cValues[cValues.length - 1] +
                    lastS * cValues[cValues.length - 2]
                );
            }

            let b = bValues[bValues.length - 1];
            let c = cValues[cValues.length - 1];

            aString += `a_${n-i} & ${a} \\\\`;
            bString += `b_${n-i} & ${b} \\\\`;
            cString += `c_${n-i} & ${c} \\\\`;
        }

        console.log(terms);
        console.log(bValues);
        console.log(cValues);

        let b_n   = bValues[n - 1];     // b0
        let b_n1  = bValues[n - 2];     // b1

        let c_n1  = cValues[n - 2];     // c1
        let c_n2  = cValues[n - 3];     // c2
        let c_n3  = cValues[n - 4];     // c3

        let denominator = (c_n2**2) - (c_n1 * c_n3);

        let deltaR = (b_n * c_n3 - b_n1 * c_n2) / denominator;
        let deltaS = (b_n1 * c_n1 - b_n * c_n2) / denominator;

        console.log(`△r = ${deltaR}`);
        console.log(`△s = ${deltaS}`);

        if (i > 0) {
            let discriminant = (lastR**2) + (4 * lastS);

            if (discriminant >= 0) {
                let sqrtD = Math.sqrt(discriminant);

                let x1 = (lastR + sqrtD) / 2;
                let x2 = (lastR - sqrtD) / 2;

                console.log(`x1 = ${x1}`);
                console.log(`x2 = ${x2}`);
            } else {
                let real = lastR / 2;
                let imag = Math.sqrt(-discriminant) / 2;

                console.log(`x1 = ${real} + ${imag}i`);
                console.log(`x2 = ${real} - ${imag}i`);
            }
        }

        if ((Math.abs(deltaR) <= epsilon && Math.abs(deltaS) <= epsilon) || ((Math.abs(b_n) <= epsilon && Math.abs(b_n1) <= epsilon))) {
            console.log("");
            console.log(`CONVERGENCIA EN LA ITERACIÓN ${i}`);
            console.log("");
            break;
        }

        let newR = lastR + deltaR;
        let newS = lastS + deltaS;

        console.log(`r = ${newR}`);
        console.log(`s = ${newS}`);

        lastR = newR;
        lastS = newS;

        console.log("");
        console.log("");

        let latexString;

        if (i < 1) {
            latexString = `
                \\begin{array}{c c}
                \\text{Iteración:} & ${i} \\\\
                ${aString}
                \\hline
                \\\\
                ${bString}
                \\hline
                \\\\
                ${cString}
                \\\\
                r & ${lastR} \\\\
                s & ${lastS} \\\\
                \\hline
                \\\\
                △r & ${deltaR} \\\\
                △s & ${deltaS} \\\\
                \\hline
                \\end{array}
            `;
        } else {
            latexString = `
                \\begin{array}{l l}
                \\text{Iteración:} & ${i} \\\\
                ${aString}
                \\hline
                \\\\
                ${bString}
                \\hline
                \\\\
                ${cString}
                \\\\
                r & ${lastR} \\\\
                s & ${lastS} \\\\
                \\hline
                \\\\
                △r & ${deltaR} \\\\
                △s & ${deltaS} \\\\
                \\hline
                \\end{array}
            `;
        }

        const tableBody = document.getElementById("tableBody");

        const row = document.createElement("tr");

        const info = [
            i,
            formatNumber(lastR),
            formatNumber(lastS),
            formatNumber(deltaR),
            formatNumber(deltaS)
        ];

        for (let i = 0; i <= 4; i++) {
            const tableData = document.createElement("td");
            tableData.innerHTML = info[i];

            row.appendChild(tableData);
        }

        tableBody.appendChild(row);
    
        let iterationDisplay = document.createElement("div");
        iterationDisplay.className = "iterationDisplay";
        
        let iterationResults = document.createElement("p");
    
        // Renderizarlo
        iterationResults.innerHTML = katex.renderToString(latexString, {
            throwOnError: false,
            displayMode: true
        });
    
        iterationDisplay.appendChild(iterationResults);
        functionDisplay.appendChild(iterationDisplay);
    }
    

    functionDisplay.style.visibility = "visible";
}

function BairstowOperation(
    mathFunction,
    terms,
    lastR,
    lastS,
    iteration,
    epsilon
) {
    console.log("");
    console.log(`Iteración: ${iteration}`);
    console.log(`Función: ${mathFunction}`);
    console.log(`r: ${lastR}`);
    console.log(`s: ${lastS}`);
    console.log("");

    let n = terms.length;

    let bValues = [];
    let cValues = [];

    // =========================
    // RECURRENCIA b (Bairstow)
    // =========================
    for (let i = 0; i < n; i++) {
        if (i === 0) {
            bValues[i] = terms[i];
        } else if (i === 1) {
            bValues[i] = terms[i] + lastR * bValues[i - 1];
        } else {
            bValues[i] =
                terms[i] +
                lastR * bValues[i - 1] +
                lastS * bValues[i - 2];
        }
    }

    // =========================
    // RECURRENCIA c (derivadas)
    // =========================
    for (let i = 0; i < n; i++) {
        if (i === 0) {
            cValues[i] = bValues[i];
        } else if (i === 1) {
            cValues[i] = bValues[i] + lastR * cValues[i - 1];
        } else {
            cValues[i] =
                bValues[i] +
                lastR * cValues[i - 1] +
                lastS * cValues[i - 2];
        }
    }

    // =========================
    // Valores clave
    // =========================
    let b_n = bValues[n - 1];
    let b_n1 = bValues[n - 2];

    let c_n1 = cValues[n - 2];
    let c_n2 = cValues[n - 3];
    let c_n3 = cValues[n - 4];

    // =========================
    // SISTEMA LINEAL Bairstow
    // =========================
    let denominator = (c_n2 * c_n2) - (c_n1 * c_n3);

    if (Math.abs(denominator) < 1e-12) {
        console.warn("Sistema singular en Bairstow");
        return null;
    }

    let deltaR = (b_n * c_n3 - b_n1 * c_n2) / denominator;
    let deltaS = (b_n1 * c_n1 - b_n * c_n2) / denominator;

    console.log(`Δr = ${deltaR}`);
    console.log(`Δs = ${deltaS}`);

    // =========================
    // NUEVOS VALORES
    // =========================
    let newR = lastR + deltaR;
    let newS = lastS + deltaS;

    // =========================
    // RAÍCES DEL FACTOR ACTUAL
    // x² - r x - s = 0
    // =========================
    let discriminant = lastR * lastR + 4 * lastS;

    if (discriminant >= 0) {
        let sqrtD = Math.sqrt(discriminant);

        let x1 = (lastR + sqrtD) / 2;
        let x2 = (lastR - sqrtD) / 2;

        console.log(`x1 = ${x1}`);
        console.log(`x2 = ${x2}`);
    } else {
        let real = lastR / 2;
        let imag = Math.sqrt(-discriminant) / 2;

        console.log(`x1 = ${real} + ${imag}i`);
        console.log(`x2 = ${real} - ${imag}i`);
    }

    console.log(`r = ${newR}`);
    console.log(`s = ${newS}`);

    return {
        bValues,
        cValues,
        deltaR,
        deltaS,
        r: newR,
        s: newS,
        b_n,
        b_n1
    };
}
