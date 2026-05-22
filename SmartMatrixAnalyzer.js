// SmartMatrixAnalyzer.js
// Analizador Inteligente de Sistemas No Lineales para Newton-Raphson con math-field (MathLive)

function clearMathContainer() {
    document.getElementById("mathContainer").innerHTML = "";
}

// Convertidor robusto de LaTeX a Expresiones Matemáticas de math.js (Consistente con la lógica del proyecto)
function latexToMathExpr(latex) {
    if (!latex) return "";
    
    let expr = latex
        .replace(/\$\$/g, '') // Eliminar tokens de modo matemático ($$)
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\mleft/g, '')
        .replace(/\\mright/g, '')
        .replace(/\s+/g, ''); // Eliminar todos los espacios en blanco

    // Eliminar P(x)= o f(x)= o convertir A=B a (A)-(B)
    if (expr.includes('=')) {
        const parts = expr.split('=');
        const leftSide = parts[0];
        const rightSide = parts.slice(1).join('=');
        
        if (rightSide === "" || rightSide === "0") {
            expr = leftSide;
        } else {
            const isFunctionDecl = /^([a-zA-Z][a-zA-Z0-9_]*\([xyzXYZ]\)|[yYzZ])$/.test(leftSide);
            if (isFunctionDecl) {
                expr = rightSide;
            } else {
                expr = `(${leftSide})-(${rightSide})`;
            }
        }
    }

    expr = expr
        // Eliminar etiquetas de formato \mathrm
        .replace(/\\mathrm\{([A-Za-z]+)\}/g, '$1')

        // Manejar funciones trigonométricas comunes escritas en español (Sen -> sin)
        .replace(/Sen/ig, 'sin')
        .replace(/Cos/ig, 'cos')
        .replace(/Tan/ig, 'tan')
        .replace(/\\operatorname\{sen\}/ig, 'sin')

        // Estandarizar funciones matemáticas para parseo
        .replace(/\\ln/g, 'log')
        .replace(/\\log/g, 'log')
        .replace(/\\sin/g, 'sin')
        .replace(/\\cos/g, 'cos')
        .replace(/\\tan/g, 'tan')
        .replace(/\\sec/g, 'sec')
        .replace(/\\csc/g, 'csc')
        .replace(/\\cot/g, 'cot')
        .replace(/\\exp/g, 'exp')

        // Logaritmo con base dinámica: \log_{base}(x)
        .replace(/\\log_\{([^}]+)\}\(([^)]+)\)/g, 'log($2,$1)')
        .replace(/\\log_\{([^}]+)\}\{([^}]+)\}/g, 'log($2,$1)')

        // Estandarizar exponencial natural (Euler)
        .replace(/e\^{([^}]+)}/g, 'exp($1)')
        .replace(/e\^\(([^)]+)\)/g, 'exp($1)')
        .replace(/e\^([\-\+]?[a-zA-Z0-9\.]+)/g, 'exp($1)');

    // Fracciones complejas: \frac{A}{B} -> (A)/(B) (soporta hasta 3 niveles)
    for (let i = 0; i < 3; i++) {
        expr = expr.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
    }

    expr = expr
        // Raíz cuadrada
        .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
        
        // Factorial
        .replace(/([a-zA-Z0-9]+)!/g, 'factorial($1)')

        // Constante Pi
        .replace(/\\pi/g, 'pi')
        
        // Asegurar paréntesis en exponentes complejos
        .replace(/\^{([^}]+)}/g, '^($1)')

        // Multiplicación implícita de variables y operadores comunes
        .replace(/([0-9]+)([xyz])/g, '$1*$2') // 2x -> 2*x, 3y -> 3*y, 4z -> 4*z
        .replace(/([xyz])([0-9]+)/g, '$1*$2')
        .replace(/([xyz])([xyz])/g, '$1*$2') // xy -> x*y, yz -> y*z, xz -> x*z (crucial para sistemas multi-variable)
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\div/g, '/')
        
        // Limpiar cualquier barra invertida restante
        .replace(/\\/g, '');

    return expr;
}

let _systemAnalyzerDOM = null;

export function loadSmartSystemAnalyzer() {
    clearMathContainer();
    const container = document.getElementById("mathContainer");

    _systemAnalyzerDOM = document.createElement("div");
    _systemAnalyzerDOM.style.width = "100%";
    _systemAnalyzerDOM.style.display = "flex";
    _systemAnalyzerDOM.style.flexDirection = "column";
    _systemAnalyzerDOM.style.gap = "20px";

    // Título Principal
    const titleContainer = document.createElement("div");
    titleContainer.className = "math-title-container";
    titleContainer.innerHTML = `<h2 class="math-title"><i class="fa-solid fa-cubes"></i> Analizador Inteligente de Sistemas No Lineales</h2>`;
    _systemAnalyzerDOM.appendChild(titleContainer);

    // Tarjeta del Formulario
    const formCard = document.createElement("div");
    formCard.className = "dashboard-card drop-animate";
    formCard.style.padding = "20px";

    formCard.innerHTML = `
        <h3 class="card-title"><i class="fa-solid fa-gears"></i> Configuración del Sistema</h3>
        <p style="color:#ccc; font-size:0.9em; margin-bottom:15px; line-height:1.4;">
            Ingresa las ecuaciones de tu sistema no lineal en el **editor matemático** (como en los otros métodos) e indica los rangos de exploración. El analizador realizará un barrido multidimensional inteligente buscando aproximaciones iniciales ideales libres de singularidad Jacobiana.
        </p>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:5px; font-weight:bold; color:var(--primary-color);">Dimensión del Sistema:</label>
            <select id="sysDimSelect" class="styled-select" style="width:100%;">
                <option value="system2">Sistema 2x2 (Variables: x, y)</option>
                <option value="system3">Sistema 3x3 (Variables: x, y, z)</option>
            </select>
        </div>
        
        <div id="sysEqsContainer" style="display:flex; flex-direction:column; gap:12px; margin-bottom:15px;">
            <!-- Contenedor dinámico de math-fields -->
        </div>

        <div id="sysRangesContainer" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom:20px;">
            <!-- Contenedor dinámico de rangos de variables -->
        </div>

        <button id="btnSysAnalyze" class="btn-analyze" style="width:100%; padding:12px; background:var(--primary-color, #4facfe); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1.05em; transition: 0.2s ease;">
            <i class="fa-solid fa-magnifying-glass-chart"></i> Analizar Sistema No Lineal
        </button>
    `;

    _systemAnalyzerDOM.appendChild(formCard);

    // Contenedor de Resultados
    const resultsContainer = document.createElement("div");
    resultsContainer.id = "sysAnalysisResults";
    resultsContainer.style.display = "none";
    resultsContainer.style.flexDirection = "column";
    resultsContainer.style.gap = "20px";
    _systemAnalyzerDOM.appendChild(resultsContainer);

    container.appendChild(_systemAnalyzerDOM);

    // Elementos del DOM y Listeners
    const sysDimSelect = document.getElementById("sysDimSelect");
    const sysEqsContainer = document.getElementById("sysEqsContainer");
    const sysRangesContainer = document.getElementById("sysRangesContainer");
    const btnSysAnalyze = document.getElementById("btnSysAnalyze");

    // Función para poblar dinámicamente usando math-fields programáticos (Para máxima robustez)
    function renderInputs() {
        const dim = sysDimSelect.value;
        sysEqsContainer.innerHTML = "";
        sysRangesContainer.innerHTML = "";

        if (dim === "system2") {
            // Ecuación 1
            const div1 = document.createElement("div");
            div1.innerHTML = `<label style="display:block; margin-bottom:5px; font-size:0.95em; font-weight:bold;">Ecuación f₁(x, y) = 0:</label>`;
            const eq1 = document.createElement("math-field");
            eq1.id = "sysEq1";
            eq1.value = "x^2 + y^2 - 4 = 0";
            eq1.style.width = "100%";
            eq1.style.marginBottom = "5px";
            div1.appendChild(eq1);
            sysEqsContainer.appendChild(div1);

            // Ecuación 2
            const div2 = document.createElement("div");
            div2.innerHTML = `<label style="display:block; margin-bottom:5px; font-size:0.95em; font-weight:bold;">Ecuación f₂(x, y) = 0:</label>`;
            const eq2 = document.createElement("math-field");
            eq2.id = "sysEq2";
            eq2.value = "e^x + y - 1 = 0";
            eq2.style.width = "100%";
            eq2.style.marginBottom = "5px";
            div2.appendChild(eq2);
            sysEqsContainer.appendChild(div2);

            // Rangos 2x2
            sysRangesContainer.innerHTML = `
                <div>
                    <label style="display:block; margin-bottom:3px; font-size:0.9em; font-weight:bold;">Rango x:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="sysXMin" class="styled-select" style="width:50%; text-align:center;" value="-3" placeholder="Mín">
                        <input type="number" id="sysXMax" class="styled-select" style="width:50%; text-align:center;" value="3" placeholder="Máx">
                    </div>
                </div>
                <div>
                    <label style="display:block; margin-bottom:3px; font-size:0.9em; font-weight:bold;">Rango y:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="sysYMin" class="styled-select" style="width:50%; text-align:center;" value="-3" placeholder="Mín">
                        <input type="number" id="sysYMax" class="styled-select" style="width:50%; text-align:center;" value="3" placeholder="Máx">
                    </div>
                </div>
            `;
        } else {
            // Ecuación 1
            const div1 = document.createElement("div");
            div1.innerHTML = `<label style="display:block; margin-bottom:5px; font-size:0.95em; font-weight:bold;">Ecuación f₁(x, y, z) = 0:</label>`;
            const eq1 = document.createElement("math-field");
            eq1.id = "sysEq1";
            eq1.value = "x^2 + y^2 + z^2 - 3 = 0";
            eq1.style.width = "100%";
            eq1.style.marginBottom = "5px";
            div1.appendChild(eq1);
            sysEqsContainer.appendChild(div1);

            // Ecuación 2
            const div2 = document.createElement("div");
            div2.innerHTML = `<label style="display:block; margin-bottom:5px; font-size:0.95em; font-weight:bold;">Ecuación f₂(x, y, z) = 0:</label>`;
            const eq2 = document.createElement("math-field");
            eq2.id = "sysEq2";
            eq2.value = "x + y - 1 = 0";
            eq2.style.width = "100%";
            eq2.style.marginBottom = "5px";
            div2.appendChild(eq2);
            sysEqsContainer.appendChild(div2);

            // Ecuación 3
            const div3 = document.createElement("div");
            div3.innerHTML = `<label style="display:block; margin-bottom:5px; font-size:0.95em; font-weight:bold;">Ecuación f₃(x, y, z) = 0:</label>`;
            const eq3 = document.createElement("math-field");
            eq3.id = "sysEq3";
            eq3.value = "x - z = 0";
            eq3.style.width = "100%";
            eq3.style.marginBottom = "5px";
            div3.appendChild(eq3);
            sysEqsContainer.appendChild(div3);

            // Rangos 3x3
            sysRangesContainer.innerHTML = `
                <div>
                    <label style="display:block; margin-bottom:3px; font-size:0.9em; font-weight:bold;">Rango x:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="sysXMin" class="styled-select" style="width:50%; text-align:center;" value="-2" placeholder="Mín">
                        <input type="number" id="sysXMax" class="styled-select" style="width:50%; text-align:center;" value="2" placeholder="Máx">
                    </div>
                </div>
                <div>
                    <label style="display:block; margin-bottom:3px; font-size:0.9em; font-weight:bold;">Rango y:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="sysYMin" class="styled-select" style="width:50%; text-align:center;" value="-2" placeholder="Mín">
                        <input type="number" id="sysYMax" class="styled-select" style="width:50%; text-align:center;" value="2" placeholder="Máx">
                    </div>
                </div>
                <div>
                    <label style="display:block; margin-bottom:3px; font-size:0.9em; font-weight:bold;">Rango z:</label>
                    <div style="display:flex; gap:5px;">
                        <input type="number" id="sysZMin" class="styled-select" style="width:50%; text-align:center;" value="-2" placeholder="Mín">
                        <input type="number" id="sysZMax" class="styled-select" style="width:50%; text-align:center;" value="2" placeholder="Máx">
                    </div>
                </div>
            `;
        }
    }

    renderInputs();
    sysDimSelect.addEventListener("change", renderInputs);

    btnSysAnalyze.addEventListener("click", () => {
        performSystemAnalysis(resultsContainer);
    });
}

function performSystemAnalysis(resultsContainer) {
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "flex";

    const dim = document.getElementById("sysDimSelect").value;
    const rawEq1 = document.getElementById("sysEq1").value;
    const rawEq2 = document.getElementById("sysEq2").value;
    const rawEq3 = dim === "system3" ? document.getElementById("sysEq3").value : null;

    const xMin = parseFloat(document.getElementById("sysXMin").value) || -2;
    const xMax = parseFloat(document.getElementById("sysXMax").value) || 2;
    const yMin = parseFloat(document.getElementById("sysYMin").value) || -2;
    const yMax = parseFloat(document.getElementById("sysYMax").value) || 2;
    const zMin = dim === "system3" ? (parseFloat(document.getElementById("sysZMin").value) || -2) : 0;
    const zMax = dim === "system3" ? (parseFloat(document.getElementById("sysZMax").value) || 2) : 0;

    if (xMin >= xMax || yMin >= yMax || (dim === "system3" && zMin >= zMax)) {
        alert("Los límites mínimos de los rangos deben ser menores que sus máximos correspondientes.");
        return;
    }

    try {
        const math = typeof window.math !== 'undefined' ? window.math : math;
        
        // 1. Limpieza y Compilación de LaTeX a expresiones matemáticas de math.js
        const cleanEq1 = latexToMathExpr(rawEq1);
        const cleanEq2 = latexToMathExpr(rawEq2);
        const cleanEq3 = dim === "system3" ? latexToMathExpr(rawEq3) : null;

        if (!cleanEq1 || !cleanEq2 || (dim === "system3" && !cleanEq3)) {
            alert("Sintaxis vacía o no válida. Introduzca expresiones correctas en los campos.");
            return;
        }

        const node1 = math.parse(cleanEq1);
        const node2 = math.parse(cleanEq2);
        const node3 = dim === "system3" ? math.parse(cleanEq3) : null;

        const comp1 = node1.compile();
        const comp2 = node2.compile();
        const comp3 = dim === "system3" ? node3.compile() : null;

        // 2. Derivadas Parciales Analíticas para la Jacobiana
        let jacobianLaTeX = "";
        let df1_dx, df1_dy, df1_dz, df2_dx, df2_dy, df2_dz, df3_dx, df3_dy, df3_dz;
        let df1_dx_comp, df1_dy_comp, df1_dz_comp, df2_dx_comp, df2_dy_comp, df2_dz_comp, df3_dx_comp, df3_dy_comp, df3_dz_comp;

        df1_dx = math.derivative(cleanEq1, 'x');
        df1_dy = math.derivative(cleanEq1, 'y');
        df1_dx_comp = df1_dx.compile();
        df1_dy_comp = df1_dy.compile();

        df2_dx = math.derivative(cleanEq2, 'x');
        df2_dy = math.derivative(cleanEq2, 'y');
        df2_dx_comp = df2_dx.compile();
        df2_dy_comp = df2_dy.compile();

        if (dim === "system2") {
            jacobianLaTeX = `\\mathbf{J}(x, y) = \\begin{pmatrix} 
                \\frac{\\partial f_1}{\\partial x} & \\frac{\\partial f_1}{\\partial y} \\\\[1.5em]
                \\frac{\\partial f_2}{\\partial x} & \\frac{\\partial f_2}{\\partial y}
            \\end{pmatrix} = \\begin{pmatrix}
                ${df1_dx.toTex()} & ${df1_dy.toTex()} \\\\[1.5em]
                ${df2_dx.toTex()} & ${df2_dy.toTex()}
            \\end{pmatrix}`;
        } else {
            df1_dz = math.derivative(cleanEq1, 'z');
            df2_dz = math.derivative(cleanEq2, 'z');
            df1_dz_comp = df1_dz.compile();
            df2_dz_comp = df2_dz.compile();

            df3_dx = math.derivative(cleanEq3, 'x');
            df3_dy = math.derivative(cleanEq3, 'y');
            df3_dz = math.derivative(cleanEq3, 'z');
            df3_dx_comp = df3_dx.compile();
            df3_dy_comp = df3_dy.compile();
            df3_dz_comp = df3_dz.compile();

            jacobianLaTeX = `\\mathbf{J}(x, y, z) = \\begin{pmatrix}
                \\frac{\\partial f_1}{\\partial x} & \\frac{\\partial f_1}{\\partial y} & \\frac{\\partial f_1}{\\partial z} \\\\[1.2em]
                \\frac{\\partial f_2}{\\partial x} & \\frac{\\partial f_2}{\\partial y} & \\frac{\\partial f_2}{\\partial z} \\\\[1.2em]
                \\frac{\\partial f_3}{\\partial x} & \\frac{\\partial f_3}{\\partial y} & \\frac{\\partial f_3}{\\partial z}
            \\end{pmatrix} = \\begin{pmatrix}
                ${df1_dx.toTex()} & ${df1_dy.toTex()} & ${df1_dz.toTex()} \\\\[1.2em]
                ${df2_dx.toTex()} & ${df2_dy.toTex()} & ${df2_dz.toTex()} \\\\[1.2em]
                ${df3_dx.toTex()} & ${df3_dy.toTex()} & ${df3_dz.toTex()}
            \\end{pmatrix}`;
        }

        // 3. Ejecución del Barrido Multidimensional (Grid Sweep)
        const candidates = [];
        const lowResidualGrid = []; // Para graficar nebulosa 3D

        if (dim === "system2") {
            const stepsX = 25;
            const stepsY = 25;
            const dx = (xMax - xMin) / (stepsX - 1);
            const dy = (yMax - yMin) / (stepsY - 1);

            for (let i = 0; i < stepsX; i++) {
                const cx = xMin + i * dx;
                for (let j = 0; j < stepsY; j++) {
                    const cy = yMin + j * dy;
                    try {
                        const r1 = comp1.evaluate({ x: cx, y: cy });
                        const r2 = comp2.evaluate({ x: cx, y: cy });
                        if (typeof r1 === 'number' && typeof r2 === 'number' && !isNaN(r1) && !isNaN(r2)) {
                            const residual = r1 * r1 + r2 * r2;
                            if (residual < 2.0) {
                                candidates.push({ x: cx, y: cy, residual: residual });
                            }
                        }
                    } catch (e) {}
                }
            }
        } else {
            // 3D Sweep (12x12x12 = 1728 puntos)
            const steps = 12;
            const dx = (xMax - xMin) / (steps - 1);
            const dy = (yMax - yMin) / (steps - 1);
            const dz = (zMax - zMin) / (steps - 1);

            for (let i = 0; i < steps; i++) {
                const cx = xMin + i * dx;
                for (let j = 0; j < steps; j++) {
                    const cy = yMin + j * dy;
                    for (let k = 0; k < steps; k++) {
                        const cz = zMin + k * dz;
                        try {
                            const r1 = comp1.evaluate({ x: cx, y: cy, z: cz });
                            const r2 = comp2.evaluate({ x: cx, y: cy, z: cz });
                            const r3 = comp3.evaluate({ x: cx, y: cy, z: cz });
                            if (typeof r1 === 'number' && typeof r2 === 'number' && typeof r3 === 'number' && !isNaN(r1) && !isNaN(r2) && !isNaN(r3)) {
                                const residual = r1 * r1 + r2 * r2 + r3 * r3;
                                if (residual < 3.0) {
                                    lowResidualGrid.push({ x: cx, y: cy, z: cz, residual: residual });
                                    if (residual < 1.5) {
                                        candidates.push({ x: cx, y: cy, z: cz, residual: residual });
                                    }
                                }
                            }
                        } catch (e) {}
                    }
                }
            }
        }

        // 4. Clustering / Espaciado de Candidatos (para evitar sugerir la misma raíz)
        const distinctCandidates = [];
        const minDistance = 0.08 * Math.min(xMax - xMin, yMax - yMin, dim === "system3" ? (zMax - zMin) : Infinity);

        // Ordenar por menor residuo primero
        candidates.sort((a, b) => a.residual - b.residual);

        for (const cand of candidates) {
            let tooClose = false;
            for (const chosen of distinctCandidates) {
                const dist = dim === "system2"
                    ? Math.sqrt(Math.pow(cand.x - chosen.x, 2) + Math.pow(cand.y - chosen.y, 2))
                    : Math.sqrt(Math.pow(cand.x - chosen.x, 2) + Math.pow(cand.y - chosen.y, 2) + Math.pow(cand.z - chosen.z, 2));

                if (dist < minDistance) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                distinctCandidates.push(cand);
            }
            if (distinctCandidates.length >= 5) break; 
        }

        // 5. Análisis de Singularidad Jacobiana para cada candidato
        const evaluatedCandidates = distinctCandidates.map((cand, idx) => {
            let j11, j12, j13, j21, j22, j23, j31, j32, j33;
            let det = 0;

            if (dim === "system2") {
                j11 = df1_dx_comp.evaluate({ x: cand.x, y: cand.y });
                j12 = df1_dy_comp.evaluate({ x: cand.x, y: cand.y });
                j21 = df2_dx_comp.evaluate({ x: cand.x, y: cand.y });
                j22 = df2_dy_comp.evaluate({ x: cand.x, y: cand.y });
                det = j11 * j22 - j12 * j21;
            } else {
                j11 = df1_dx_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });
                j12 = df1_dy_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });
                j13 = df1_dz_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });

                j21 = df2_dx_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });
                j22 = df2_dy_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });
                j23 = df2_dz_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });

                j31 = df3_dx_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });
                j32 = df3_dy_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });
                j33 = df3_dz_comp.evaluate({ x: cand.x, y: cand.y, z: cand.z });

                det = j11 * (j22 * j33 - j23 * j32) - j12 * (j21 * j33 - j23 * j31) + j13 * (j21 * j32 - j22 * j31);
            }

            const isSingular = Math.abs(det) < 10e-4;

            return {
                ...cand,
                id: idx + 1,
                det: det,
                isSingular: isSingular
            };
        });

        // ================== RENDERIZADO DE RESULTADOS ================== //

        // PANEL 1: Análisis Simbólico de la Jacobiana
        const jCard = document.createElement("div");
        jCard.className = "dashboard-card drop-animate";
        jCard.style.padding = "20px";
        jCard.innerHTML = `
            <h3 class="card-title"><i class="fa-solid fa-matrix"></i> Expresión de la Matriz Jacobiana</h3>
            <p style="color:#ccc; font-size:0.9em; margin-bottom:15px;">
                La matriz Jacobiana $\\mathbf{J}$ recopila las derivadas parciales de cada ecuación con respecto a cada variable del sistema, definiendo la pendiente multidimensional en cada paso:
            </p>
            <div id="sysJacobianContainer" style="overflow-x:auto; background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; display:flex; justify-content:center; align-items:center;">
                <!-- KaTeX render -->
            </div>
        `;
        resultsContainer.appendChild(jCard);
        
        const jDiv = jCard.querySelector("#sysJacobianContainer");
        katex.render(jacobianLaTeX, jDiv, { displayMode: true, throwOnError: false });

        // PANEL 2: Tabla de Sugerencias de Aproximación Inicial
        const sCard = document.createElement("div");
        sCard.className = "dashboard-card drop-animate";
        sCard.style.padding = "20px";

        let tableRowsHtml = "";
        if (evaluatedCandidates.length === 0) {
            tableRowsHtml = `<tr><td colspan="5" style="padding:15px; text-align:center; color:#ff6b6b;"><i class="fa-solid fa-triangle-exclamation"></i> No se encontraron raíces aproximadas o intersecciones en el rango explorado. Prueba ampliando los rangos.</td></tr>`;
        } else {
            tableRowsHtml = evaluatedCandidates.map(c => {
                const statusBadge = c.isSingular
                    ? `<span style="background:rgba(255,107,107,0.2); color:#ff6b6b; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:0.8em; border: 1px solid rgba(255,107,107,0.3);"><i class="fa-solid fa-triangle-exclamation"></i> Singular / Inestable</span>`
                    : `<span style="background:rgba(79,172,254,0.2); color:#4facfe; padding:4px 8px; border-radius:6px; font-weight:bold; font-size:0.8em; border: 1px solid rgba(79,172,254,0.3);"><i class="fa-solid fa-circle-check"></i> Seguro y Estable</span>`;

                const coordsText = dim === "system2"
                    ? `x: <strong>${c.x.toFixed(4)}</strong>, y: <strong>${c.y.toFixed(4)}</strong>`
                    : `x: <strong>${c.x.toFixed(4)}</strong>, y: <strong>${c.y.toFixed(4)}</strong>, z: <strong>${c.z.toFixed(4)}</strong>`;

                const loadBtn = c.isSingular
                    ? `<button disabled style="background:#555; color:#aaa; border:none; padding:6px 12px; border-radius:6px; cursor:not-allowed; font-weight:bold; font-size:0.85em;"><i class="fa-solid fa-ban"></i> Bloqueado</button>`
                    : `<button class="btn-load-nr" data-id="${c.id}" style="background:linear-gradient(135deg, #4facfe, #00f2fe); color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:0.85em; transition:0.2s;"><i class="fa-solid fa-arrow-right-to-bracket"></i> Cargar Solver</button>`;

                return `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.08); transition: background 0.2s;" class="table-hover-row">
                        <td style="padding:12px; font-weight:bold; text-align:center;">#${c.id}</td>
                        <td style="padding:12px; font-family:monospace; font-size:0.95em;">${coordsText}</td>
                        <td style="padding:12px; text-align:center; font-family:monospace;">${c.det.toFixed(4)}</td>
                        <td style="padding:12px; text-align:center;">${statusBadge}</td>
                        <td style="padding:12px; text-align:center;">${loadBtn}</td>
                    </tr>
                `;
            }).join("");
        }

        sCard.innerHTML = `
            <h3 class="card-title"><i class="fa-solid fa-star"></i> Zonas de Raíces Sugeridas</h3>
            <p style="color:#ccc; font-size:0.9em; margin-bottom:15px;">
                Se han escaneado los rangos de las variables y localizado mínimos de error. Los puntos inestables se filtraron para evitar bucles de Newton-Raphson:
            </p>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; color:white;">
                    <thead>
                        <tr style="background:rgba(255,255,255,0.05); border-bottom:2px solid rgba(255,255,255,0.15);">
                            <th style="padding:12px; text-align:center; font-weight:600;">Opción</th>
                            <th style="padding:12px; text-align:left; font-weight:600;">Coordenadas</th>
                            <th style="padding:12px; text-align:center; font-weight:600;">det(J)</th>
                            <th style="padding:12px; text-align:center; font-weight:600;">Estado Convergente</th>
                            <th style="padding:12px; text-align:center; font-weight:600;">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </div>
            <div style="background:rgba(79,172,254,0.08); padding:10px; border-radius:6px; border-left:4px solid #4facfe; font-size:0.85em; color:#ccc; margin-top:15px; line-height:1.4;">
                <i class="fa-solid fa-info-circle" style="color:#4facfe;"></i> <strong>Criterio Educativo:</strong> Selecciona cualquier opción segura. Al hacer clic en <em>Cargar Solver</em>, el sistema cambiará al formulario de Newton-Raphson, pre-cargando tanto las fórmulas como el punto inicial exacto para una convergencia garantizada.
            </div>
        `;
        resultsContainer.appendChild(sCard);

        sCard.querySelectorAll(".btn-load-nr").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.getAttribute("data-id"));
                const target = evaluatedCandidates.find(c => c.id === id);
                if (target) {
                    transferToNewtonRaphson(dim, rawEq1, rawEq2, rawEq3, target);
                }
            });
        });

        // PANEL 3: Gráfica Interactiva
        const plotCard = document.createElement("div");
        plotCard.className = "dashboard-card drop-animate";
        plotCard.style.padding = "20px";
        plotCard.innerHTML = `
            <h3 class="card-title"><i class="fa-solid fa-chart-line"></i> Visualización Geométrica del Sistema</h3>
            <div id="sysPlotlyContainer" style="width:100%; height:450px; border-radius:8px; overflow:hidden;"></div>
        `;
        resultsContainer.appendChild(plotCard);

        const plotDiv = plotCard.querySelector("#sysPlotlyContainer");
        drawSystemPlot(plotDiv, dim, comp1, comp2, comp3, xMin, xMax, yMin, yMax, zMin, zMax, evaluatedCandidates, lowResidualGrid);

        // PANEL 4: Tutor Educativo
        const tutorCard = document.createElement("div");
        tutorCard.className = "dashboard-card drop-animate";
        tutorCard.style.padding = "20px";
        tutorCard.innerHTML = `
            <h3 class="card-title"><i class="fa-solid fa-graduation-cap"></i> Tutor Académico - Geometría y Estabilidad</h3>
            <div style="line-height:1.6; color:#ddd; font-size:0.95em;">
                <p><strong>¿Qué está ocurriendo físicamente en el sistema?</strong></p>
                ${dim === "system2" 
                    ? `<p>En un sistema de dos variables, resolver $f_1(x,y)=0$ y $f_2(x,y)=0$ equivale a encontrar los <strong>puntos de intersección</strong> entre dos curvas en el plano Cartesiano. En la gráfica, la línea <span style="color:#ff6b6b; font-weight:bold;">roja</span> ($f_1 = 0$) y la línea <span style="color:#4facfe; font-weight:bold;">azul</span> ($f_2 = 0$) muestran dónde se anula cada ecuación. Las intersecciones exactas representan las raíces del sistema.</p>` 
                    : `<p>En tres variables, cada ecuación $f_i(x,y,z)=0$ describe una <strong>superficie tridimensional</strong> en el espacio. Las soluciones corresponden a los puntos exactos donde las tres superficies se intersecan simultáneamente. La nube de colores en el espacio representa la región de mínimo error residual (donde la suma de cuadrados es mínima) que te guía hacia la intersección perfecta.</p>`
                }
                <p><strong>El rol de la Matriz Jacobiana y el Determinante:</strong></p>
                <p>El método de Newton-Raphson utiliza la matriz Jacobiana $\\mathbf{J}$ para linealizar localmente el sistema tridimensional o bidimensional. En cada iteración, se actualiza el vector de variables resolviendo $\\mathbf{J} \\cdot \\mathbf{\\Delta} = -\\mathbf{F}$.</p>
                <p style="border-left:3px solid #ff6b6b; padding-left:10px; background:rgba(255,107,107,0.05); margin:10px 0;">
                    ⚠️ Si seleccionas un punto de inicio donde $\\det(\\mathbf{J}) \\approx 0$, la matriz no tiene inversa robusta. El algoritmo de Newton-Raphson sufrirá un desborde numérico (división por cero) o una oscilación infinita, provocando que las iteraciones fallen.
                </p>
                <p>¡Por eso el barrido multidimensional del analizador es tan valioso! Te asegura arrancar la simulación sobre las zonas de convergencia segura.</p>
            </div>
        `;
        resultsContainer.appendChild(tutorCard);

    } catch (err) {
        alert("Error en el análisis matemático: " + err.message + "\nVerifique la sintaxis de sus ecuaciones LaTeX.");
        console.error(err);
    }
}

function drawSystemPlot(plotDiv, dim, comp1, comp2, comp3, xMin, xMax, yMin, yMax, zMin, zMax, candidates, lowResidualGrid) {
    if (dim === "system2") {
        const gridRes = 50;
        const xCoords = [];
        const yCoords = [];
        const dx = (xMax - xMin) / (gridRes - 1);
        const dy = (yMax - yMin) / (gridRes - 1);

        for (let i = 0; i < gridRes; i++) xCoords.push(xMin + i * dx);
        for (let j = 0; j < gridRes; j++) yCoords.push(yMin + j * dy);

        const Z1 = [];
        const Z2 = [];

        for (let j = 0; j < gridRes; j++) {
            const row1 = [];
            const row2 = [];
            const cy = yCoords[j];
            for (let i = 0; i < gridRes; i++) {
                const cx = xCoords[i];
                let v1 = 0, v2 = 0;
                try { v1 = comp1.evaluate({ x: cx, y: cy }); } catch(e){}
                try { v2 = comp2.evaluate({ x: cx, y: cy }); } catch(e){}
                row1.push(v1);
                row2.push(v2);
            }
            Z1.push(row1);
            Z2.push(row2);
        }

        const trace1 = {
            x: xCoords,
            y: yCoords,
            z: Z1,
            type: 'contour',
            showscale: false,
            contours: { coloring: 'none', showlines: true, start: 0, end: 0 },
            line: { color: 'rgb(255, 99, 132)', width: 3 },
            name: 'f₁(x,y) = 0'
        };

        const trace2 = {
            x: xCoords,
            y: yCoords,
            z: Z2,
            type: 'contour',
            showscale: false,
            contours: { coloring: 'none', showlines: true, start: 0, end: 0 },
            line: { color: 'rgb(79, 172, 254)', width: 3 },
            name: 'f₂(x,y) = 0'
        };

        const traceCand = {
            x: candidates.map(c => c.x),
            y: candidates.map(c => c.y),
            mode: 'markers+text',
            type: 'scatter',
            marker: {
                symbol: 'star',
                size: 14,
                color: candidates.map(c => c.isSingular ? '#ff6b6b' : 'gold'),
                line: { color: 'black', width: 1.5 }
            },
            text: candidates.map(c => ` #${c.id}`),
            textposition: 'top center',
            textfont: { color: '#ffffff', weight: 'bold' },
            name: 'Aproximaciones Sugeridas'
        };

        const layout = {
            paper_bgcolor: 'rgba(30, 30, 40, 0.4)',
            plot_bgcolor: 'rgba(0, 0, 0, 0.2)',
            font: { color: '#ffffff', family: 'Inter, sans-serif' },
            margin: { t: 40, b: 40, l: 40, r: 40 },
            xaxis: { title: 'Variable X', gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.3)' },
            yaxis: { title: 'Variable Y', gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.3)' },
            showlegend: true,
            legend: { x: 0, y: 1.1, orientation: 'h' }
        };

        Plotly.newPlot(plotDiv, [trace1, trace2, traceCand], layout, { responsive: true });

    } else {
        const xs = lowResidualGrid.map(p => p.x);
        const ys = lowResidualGrid.map(p => p.y);
        const zs = lowResidualGrid.map(p => p.z);
        const residuals = lowResidualGrid.map(p => p.residual);

        const traceNebula = {
            x: xs,
            y: ys,
            z: zs,
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                size: 4,
                color: residuals,
                colorscale: 'Viridis',
                reversescale: true,
                opacity: 0.4,
                showscale: true,
                colorbar: {
                    title: 'Residuo total',
                    titlefont: { color: '#fff' },
                    tickfont: { color: '#fff' },
                    thickness: 15,
                    len: 0.7
                }
            },
            name: 'Zonas de Aproximación'
        };

        const traceCand = {
            x: candidates.map(c => c.x),
            y: candidates.map(c => c.y),
            z: candidates.map(c => c.z),
            mode: 'markers+text',
            type: 'scatter3d',
            marker: {
                symbol: 'diamond',
                size: 8,
                color: candidates.map(c => c.isSingular ? '#ff6b6b' : 'gold'),
                line: { color: 'black', width: 1.5 }
            },
            text: candidates.map(c => ` #${c.id}`),
            textposition: 'top center',
            textfont: { color: '#ffffff', weight: 'bold' },
            name: 'Aproximaciones Sugeridas'
        };

        const layout = {
            paper_bgcolor: 'rgba(30, 30, 40, 0.4)',
            font: { color: '#ffffff', family: 'Inter, sans-serif' },
            margin: { t: 40, b: 40, l: 40, r: 40 },
            scene: {
                xaxis: { title: 'X', gridcolor: 'rgba(255,255,255,0.1)', backgroundcolor: 'rgba(0,0,0,0.2)', showbackground: true },
                yaxis: { title: 'Y', gridcolor: 'rgba(255,255,255,0.1)', backgroundcolor: 'rgba(0,0,0,0.2)', showbackground: true },
                zaxis: { title: 'Z', gridcolor: 'rgba(255,255,255,0.1)', backgroundcolor: 'rgba(0,0,0,0.2)', showbackground: true },
            },
            showlegend: true,
            legend: { x: 0, y: 1.1, orientation: 'h' }
        };

        Plotly.newPlot(plotDiv, [traceNebula, traceCand], layout, { responsive: true });
    }
}

// Función Puente para transferir ecuaciones y aproximaciones iniciales sugeridas a Newton Raphson
function transferToNewtonRaphson(dim, rawEq1, rawEq2, rawEq3, target) {
    if (!window.triggerMethodLoad) {
        alert("Error de enlace: No se pudo cargar el enrutador de métodos.");
        return;
    }

    // Cambiar al solver de Newton-Raphson
    window.triggerMethodLoad("Newton Raphson");

    // Esperar a que la UI de Newton-Raphson esté totalmente en el DOM
    setTimeout(() => {
        const nrTypeSelect = document.getElementById("nrTypeSelect");
        if (!nrTypeSelect) {
            console.error("No se encontró el selector de tipo de Newton-Raphson.");
            return;
        }

        // Establecer el tipo adecuado en el selector
        nrTypeSelect.value = dim;

        // Disparar manualmente el evento 'change' para que se genere el formulario del sistema
        const event = new Event('change');
        nrTypeSelect.dispatchEvent(event);

        // Volver a esperar un instante corto para que se dibuje la cuadrícula
        setTimeout(() => {
            const eq1Input = document.getElementById("eq1Input");
            const eq2Input = document.getElementById("eq2Input");
            const eq3Input = document.getElementById("eq3Input");
            const xoInput = document.getElementById("xoInput");
            const yoInput = document.getElementById("yoInput");
            const zoInput = document.getElementById("zoInput");

            // Rellenar valores preservando el formato LaTeX exacto
            if (eq1Input) eq1Input.value = rawEq1;
            if (eq2Input) eq2Input.value = rawEq2;
            if (dim === "system3" && eq3Input && rawEq3) eq3Input.value = rawEq3;

            if (xoInput) xoInput.value = target.x.toFixed(6);
            if (yoInput) yoInput.value = target.y.toFixed(6);
            if (dim === "system3" && zoInput) zoInput.value = target.z.toFixed(6);

            // Resaltar visualmente la carga exitosa
            const form = document.getElementById("mathForm_RootSearcher");
            if (form) {
                form.animate([
                    { boxShadow: '0 0 0 rgba(79, 172, 254, 0)' },
                    { boxShadow: '0 0 20px rgba(79, 172, 254, 0.8)', offset: 0.5 },
                    { boxShadow: '0 0 0 rgba(79, 172, 254, 0)' }
                ], {
                    duration: 1000,
                    easing: 'ease-out'
                });
            }
        }, 50);

    }, 100);
}
