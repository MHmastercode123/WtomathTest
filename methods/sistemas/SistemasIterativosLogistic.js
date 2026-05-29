// SistemasIterativosLogistic.js
// Implementación educativa e interactiva individual para los métodos iterativos de Jacobi y Gauss-Seidel
import { latexToMathExpr } from "../utils.js";

function clearMathContainer() {
    document.getElementById("mathContainer").innerHTML = "";
}

// Estilos locales inyectados adaptados para el flujo vertical ("horizontales hacia abajo")
const styles = `
.sistemas-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.matrix-container {
    margin: 20px 0;
    overflow-x: auto;
}
.matrix-grid-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    min-width: 500px;
}
.matrix-bracket {
    font-size: 5rem;
    font-weight: 300;
    color: var(--mod-primary, #6366f1);
    user-select: none;
    line-height: 1;
}
.theme-retro .matrix-bracket {
    color: var(--ret-border, #00ff00);
}
.theme-space .matrix-bracket {
    color: var(--spc-primary, #38bdf8);
}
.matrix-grid-A {
    display: grid;
    gap: 10px;
    padding: 10px;
}
.matrix-vector-X {
    display: grid;
    gap: 10px;
    text-align: center;
    font-size: 1.2em;
    font-weight: bold;
}
.matrix-grid-b, .matrix-grid-x0 {
    display: grid;
    gap: 10px;
}
.matrix-input-cell {
    width: 65px;
    height: 45px;
    text-align: center;
    font-size: 1.1em;
    border-radius: 6px;
    border: 1px solid var(--mod-border, rgba(255,255,255,0.15));
    background-color: rgba(0, 0, 0, 0.05);
    color: inherit;
    transition: all 0.3s;
}
.theme-retro .matrix-input-cell {
    border-radius: 0;
    border: 2px solid var(--ret-border);
    background-color: var(--ret-bg);
    color: var(--ret-text);
    font-family: var(--ret-font);
}
.theme-space .matrix-input-cell {
    border-radius: 6px;
    border: 1px solid var(--spc-border);
    background-color: rgba(0, 0, 0, 0.3);
    color: var(--spc-text);
}
.matrix-input-cell:focus {
    outline: none;
    border-color: var(--mod-primary, #6366f1);
    box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
}
.theme-retro .matrix-input-cell:focus {
    box-shadow: var(--ret-shadow);
}
.theme-space .matrix-input-cell:focus {
    border-color: var(--spc-primary);
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}
.preset-badge {
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.85em;
    cursor: pointer;
    background-color: rgba(99, 102, 241, 0.1);
    color: var(--mod-primary, #6366f1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    transition: all 0.3s;
    font-weight: 600;
}
.preset-badge:hover {
    background-color: var(--mod-primary, #6366f1);
    color: white;
}
.theme-retro .preset-badge {
    border-radius: 0;
    border: 1px solid var(--ret-border);
    color: var(--ret-text);
    background-color: transparent;
}
.theme-retro .preset-badge:hover {
    background-color: var(--ret-primary);
    color: var(--ret-bg);
}
.theme-space .preset-badge {
    border-radius: 15px;
    background-color: rgba(56, 189, 248, 0.1);
    color: var(--spc-primary);
    border: 1px solid rgba(56, 189, 248, 0.2);
}
.theme-space .preset-badge:hover {
    background-color: var(--spc-primary);
    color: var(--spc-bg);
}
.warning-box {
    padding: 15px;
    border-radius: 10px;
    background-color: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
    color: #eab308;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.theme-retro .warning-box {
    border-radius: 0;
    border: 2px solid var(--ret-border);
    background-color: transparent;
    color: var(--ret-text);
}
.info-box {
    padding: 15px;
    border-radius: 10px;
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10b981;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.theme-retro .info-box {
    border-radius: 0;
    border: 2px solid var(--ret-border);
    background-color: transparent;
    color: var(--ret-text);
}
.step-item {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px dashed var(--mod-border, rgba(255,255,255,0.1));
}
.collapsible-header {
    background-color: rgba(0, 0, 0, 0.03);
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
}
.theme-retro .collapsible-header {
    background-color: rgba(0, 255, 0, 0.1);
    border: 1px solid var(--ret-border);
    border-radius: 0;
}
.theme-space .collapsible-header {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--spc-border);
}
.collapsible-content {
    padding: 15px;
    border: 1px solid var(--mod-border, rgba(255,255,255,0.1));
    border-top: none;
    border-radius: 0 0 8px 8px;
}
.theme-retro .collapsible-content {
    border: 1px solid var(--ret-border);
    border-top: none;
    border-radius: 0;
}
.table-scrollable {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--mod-border, rgba(255,255,255,0.1));
    border-radius: 8px;
    margin-top: 10px;
}
.theme-retro .table-scrollable {
    border: 2px solid var(--ret-border);
    border-radius: 0;
}
`;

// Helper para dibujar la barra de título superior a juego con WToMath
function prepareLocalTitle(method) {
    const lblTitle = document.createElement("div");
    lblTitle.id = "lblTitle";

    const Title = document.createElement("h2");
    Title.id = "Title";
    Title.className = "math-title";
    Title.innerHTML = `<i class="fa-solid fa-square-root-variable"></i> Método de ${method}`;

    lblTitle.appendChild(Title);
    document.getElementById("mathContainer").appendChild(lblTitle);
}

export function loadSistemasIterativos(method) {
    clearMathContainer();
    const container = document.getElementById("mathContainer");

    // Inyectar estilos locales
    let styleTag = document.getElementById("sistemas-iterativos-styles");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "sistemas-iterativos-styles";
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);
    }

    // Dibujar Barra Superior
    prepareLocalTitle(method);

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "sistemas-container drop-animate";

    // 1. Tarjeta Teórica (Arriba)
    const theoryCard = document.createElement("div");
    theoryCard.className = "dashboard-card";
    renderTheoryCard(theoryCard, method);
    mainWrapper.appendChild(theoryCard);

    // 2. Tarjeta del Formulario (Configuración del Sistema)
    const formCard = document.createElement("div");
    formCard.className = "dashboard-card";
    renderFormCard(formCard, method);
    mainWrapper.appendChild(formCard);

    // 3. Panel de Resultados (Oculto inicialmente, se muestra al iterar)
    const resultsCard = document.createElement("div");
    resultsCard.id = "iterResultsPanel";
    resultsCard.className = "dashboard-card";
    resultsCard.style.display = "none";
    renderResultsTemplate(resultsCard, method);
    mainWrapper.appendChild(resultsCard);

    container.appendChild(mainWrapper);

    // Inicializar fórmulas teóricas e inline en KaTeX
    renderTheoryKatex(method);

    // Inicializar los controles de entrada (Grid y Ecuaciones)
    setupMatrixGrid(3);
    setupEquationInputs(3);

    // Agregar listeners del formulario
    setupFormListeners(method);

    // Sincronizar visibilidad del criterio de parada al cargar
    updateStopCriteriaVisibility();
}

function renderTheoryCard(card, method) {
    if (method === "Jacobi") {
        card.innerHTML = `
            <h3 class="card-title" style="color: var(--mod-primary, #6366f1);"><i class="fa-solid fa-book-open"></i> Concepto del Método de Jacobi</h3>
            <p style="line-height: 1.6; margin-bottom: 12px;">
                El <strong>Método de Jacobi</strong> es un algoritmo iterativo diseñado para resolver sistemas de ecuaciones lineales de la forma <strong>A x = b</strong>. 
                Es una herramienta esencial para resolver matrices muy grandes y dispersas donde los métodos directos (como la eliminación gaussiana) son ineficientes.
            </p>
            <p style="line-height: 1.6; margin-bottom: 12px;">
                Su característica fundamental es que <strong>las ecuaciones están completamente desacopladas</strong>. Para calcular las nuevas aproximaciones <span id="theory_x_next"></span>, 
                el método utiliza <strong>únicamente</strong> el vector solución del paso anterior <span id="theory_x_prev"></span>:
            </p>
            <div id="katexFormula" style="text-align: center; margin: 15px 0;"></div>
            <p style="line-height: 1.6; font-size: 0.95em; opacity: 0.9;">
                💡 <em>Propiedad de Paralelismo:</em> Debido a que ninguna variable nueva del paso actual interfiere en el cálculo de las otras, todas las componentes se pueden calcular de forma paralela en hilos de procesamiento independientes.
            </p>
        `;
    } else {
        card.innerHTML = `
            <h3 class="card-title" style="color: var(--mod-primary, #6366f1);"><i class="fa-solid fa-book-open"></i> Concepto del Método de Gauss-Seidel</h3>
            <p style="line-height: 1.6; margin-bottom: 12px;">
                El <strong>Método de Gauss-Seidel</strong> es un algoritmo iterativo que optimiza significativamente la velocidad de convergencia del método de Jacobi. 
                Parte del mismo sistema de ecuaciones <strong>A x = b</strong>, pero introduce una regla de actualización inmediata.
            </p>
            <p style="line-height: 1.6; margin-bottom: 12px;">
                En lugar de esperar a que termine el paso completo para usar las nuevas componentes, <strong>Gauss-Seidel reutiliza de inmediato</strong> los valores ya actualizados de las variables en la misma iteración en curso. Es decir, para obtener <span id="theory_x_next_gs"></span> se usan de inmediato los valores actualizados de esa misma iteración:
            </p>
            <div id="katexFormula" style="text-align: center; margin: 15px 0;"></div>
            <p style="line-height: 1.6; font-size: 0.95em; opacity: 0.9;">
                🚀 <em>Velocidad Superior:</em> Al incorporar de inmediato la información más fresca disponible, Gauss-Seidel suele converger aproximadamente el <strong>doble de rápido</strong> que Jacobi. No obstante, esto introduce una dependencia secuencial que limita su paralelización.
            </p>
        `;
    }
}

function renderTheoryKatex(method) {
    const formulaEl = document.getElementById("katexFormula");
    if (formulaEl) {
        try {
            if (method === "Jacobi") {
                katex.render("x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j \\neq i} a_{ij} x_j^{(k)} \\right)", formulaEl, { displayMode: true, throwOnError: false });
            } else {
                katex.render("x_i^{(k+1)} = \\frac{1}{a_{ii}} \\left( b_i - \\sum_{j < i} a_{ij} x_j^{(k+1)} - \\sum_{j > i} a_{ij} x_j^{(k)} \\right)", formulaEl, { displayMode: true, throwOnError: false });
            }
        } catch (e) {
            console.error("Error renderizando KaTeX teórico:", e);
        }
    }

    // Renderizar pequeños fragmentos inline de LaTeX en la teoría para que se vean profesionales
    try {
        if (method === "Jacobi") {
            const nextEl = document.getElementById("theory_x_next");
            const prevEl = document.getElementById("theory_x_prev");
            if (nextEl) katex.render("x_i^{(k+1)}", nextEl, { throwOnError: false });
            if (prevEl) katex.render("x^{(k)}", prevEl, { throwOnError: false });
        } else {
            const nextGsEl = document.getElementById("theory_x_next_gs");
            if (nextGsEl) katex.render("x_i^{(k+1)}", nextGsEl, { throwOnError: false });
        }
    } catch (err) {
        console.error("Error renderizando fragmentos inline teóricos:", err);
    }
}

function renderFormCard(card, method) {
    card.innerHTML = `
        <h3 class="card-title"><i class="fa-solid fa-sliders"></i> Configuración de los Datos</h3>
        <p style="opacity:0.8; font-size:0.9em; margin-bottom:15px;">
            Elige el formato de entrada de datos (Matriz tradicional o Ecuaciones algebraicas), define los parámetros y presiona iterar.
        </p>

        <!-- Selector de Formato de Entrada e ID de Dimensión -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap: 15px; flex-wrap: wrap;">
            <div style="display:flex; gap:15px; align-items:center;">
                <div>
                    <label style="font-weight:bold; margin-right:8px;">Formato de Entrada:</label>
                    <select id="inputFormatSelect" class="styled-select" style="width:200px; display:inline-block; padding: 6px 10px;">
                        <option value="matrix" selected>Matriz de Coeficientes</option>
                        <option value="equations">Sistema de Ecuaciones</option>
                    </select>
                </div>
                <div>
                    <label style="font-weight:bold; margin-right:8px;">Dimensión:</label>
                    <select id="matrixDimSelect" class="styled-select" style="width:100px; display:inline-block; padding: 6px 10px;">
                        <option value="2">2 x 2</option>
                        <option value="3" selected>3 x 3</option>
                        <option value="4">4 x 4</option>
                    </select>
                </div>
            </div>
            
            <div style="display:flex; gap:8px;">
                <span class="preset-badge" id="presetDDBtn">Preset EDD (Convergente)</span>
                <span class="preset-badge" id="presetNoDDBtn">Preset No-EDD</span>
                <span class="preset-badge" id="presetDivBtn">Preset Divergente</span>
            </div>
        </div>

        <!-- 1. Formato de Matriz Tradicional -->
        <div class="matrix-container" style="display:block;">
            <div class="matrix-grid-wrapper">
                <span class="matrix-bracket">[</span>
                <div id="gridAContainer" class="matrix-grid-A"></div>
                <span class="matrix-bracket">]</span>
                <div class="matrix-vector-X" id="vectorXLabel"></div>
                <span class="matrix-bracket">=</span>
                <span class="matrix-bracket">[</span>
                <div id="gridBContainer" class="matrix-grid-b"></div>
                <span class="matrix-bracket">]</span>
            </div>
        </div>

        <!-- 2. Formato de Sistema de Ecuaciones (usando math-field) -->
        <div id="equationsContainer" style="display:none; flex-direction:column; gap:15px; margin: 20px 0;">
            <!-- Contenedor dinámico de math-fields para ingresar funciones con formato LaTeX -->
        </div>

        <h4 style="font-weight:bold; margin-top:20px; margin-bottom:10px;"><i class="fa-solid fa-map-pin"></i> Estimación Inicial del Vector <span id="lbl_vector_x0_title"></span></h4>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
            <span class="matrix-bracket" style="font-size:3rem;">[</span>
            <div id="gridX0Container" style="display:flex; gap:10px;"></div>
            <span class="matrix-bracket" style="font-size:3rem;">]</span>
        </div>

        <div class="form-grid">
            <div id="tolWrapper">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Tolerancia de Convergencia (ε):</label>
                <input type="number" id="tolInput" class="matrix-input-cell" style="width:100%; text-align:left; padding:10px;" value="0.0001" step="any">
            </div>
            <div id="maxIterWrapper" style="display:none;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">Cantidad de Iteraciones:</label>
                <input type="number" id="maxIterInput" class="matrix-input-cell" style="width:100%; text-align:left; padding:10px;" value="10">
            </div>
        </div>

        <button id="btnSolveSystem" class="btn-analyze" style="width:100%; padding:14px; margin-top:20px; background:var(--mod-primary,#6366f1); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1.1em; display:flex; align-items:center; justify-content:center; gap:8px;">
            <i class="fa-solid fa-play"></i> Ejecutar Método de ${method}
        </button>
    `;

    // Renderizar KaTeX en los textos del formulario
    setTimeout(() => {
        try {
            const lblx0Title = document.getElementById("lbl_vector_x0_title");
            if (lblx0Title) katex.render("x^{(0)}", lblx0Title, { throwOnError: false });
        } catch (err) {
            console.error("Error al renderizar KaTeX en etiquetas del formulario:", err);
        }
    }, 20);
}

function renderResultsTemplate(card, method) {
    card.innerHTML = `
        <h3 class="card-title"><i class="fa-solid fa-square-poll-vertical"></i> Resultados de la Simulación</h3>
        <div id="eddFeedbackBox"></div>

        <!-- Ficha de Estadísticas de Solución -->
        <div style="margin-bottom: 20px;" id="solutionStatsWrapper"></div>

        <!-- Gráfico de Representación Geométrica (2D para 2x2, 3D para 3x3, se oculta para 4x4) -->
        <div id="sysPlotlyGeometryContainer" style="width:100%; height:380px; border-radius:8px; margin: 15px 0; overflow:hidden; display:none;"></div>

        <!-- Contenedores de los Gráficos de Plotly (Valores y Error) -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:15px; margin: 15px 0;">
            <div id="sysPlotlyValuesContainer" style="height:320px; border-radius:8px; overflow:hidden;"></div>
            <div id="sysPlotlyErrorContainer" style="height:320px; border-radius:8px; overflow:hidden;"></div>
        </div>

        <!-- Descarga en Excel -->
        <div id="excelDisplay" style="margin-bottom: 20px;"></div>

        <!-- Sección Paso a Paso -->
        <div class="collapsible-header" id="stepByStepHeader">
            <span><i class="fa-solid fa-graduation-cap"></i> Explicación Didáctica Paso a Paso (Iteración 1)</span>
            <i class="fa-solid fa-chevron-down" id="stepByStepChevron"></i>
        </div>
        <div class="collapsible-content" id="stepByStepContent" style="display:none;">
            <div id="stepExplanatoryText"></div>
        </div>

        <!-- Tabla de Iteraciones -->
        <div class="collapsible-header" id="tablesHeader" style="margin-top:15px;">
            <span><i class="fa-solid fa-table"></i> Tabla Completa de Valores Iterativos</span>
            <i class="fa-solid fa-chevron-down" id="tablesChevron"></i>
        </div>
        <div class="collapsible-content" id="tablesContent" style="display:none;">
            <div id="tableScrollableContainer" class="table-scrollable"></div>
        </div>
    `;
}

function setupMatrixGrid(n) {
    const gridAContainer = document.getElementById("gridAContainer");
    const gridBContainer = document.getElementById("gridBContainer");
    const gridX0Container = document.getElementById("gridX0Container");
    const vectorXLabel = document.getElementById("vectorXLabel");

    if (!gridAContainer || !gridBContainer || !gridX0Container || !vectorXLabel) return;

    gridAContainer.innerHTML = "";
    gridBContainer.innerHTML = "";
    gridX0Container.innerHTML = "";
    vectorXLabel.innerHTML = "";

    gridAContainer.style.gridTemplateColumns = `repeat(${n}, 65px)`;
    gridBContainer.style.gridTemplateColumns = "65px";

    for (let i = 0; i < n; i++) {
        // Label x_i
        const lbl = document.createElement("div");
        lbl.style.height = "45px";
        lbl.style.display = "flex";
        lbl.style.alignItems = "center";
        lbl.style.justifyContent = "center";
        
        // Renderizar x_i con KaTeX para máxima fidelidad visual
        const xSpan = document.createElement("span");
        lbl.appendChild(xSpan);
        gridX0Container.appendChild(lbl.cloneNode(true)); // Placeholder estético
        vectorXLabel.appendChild(lbl);
        
        try {
            katex.render(`x_{${i+1}}`, xSpan, { throwOnError: false });
        } catch (e) {
            lbl.innerHTML = `x<sub>${i+1}</sub>`;
        }

        // Entrada b_i
        const cellB = document.createElement("input");
        cellB.type = "number";
        cellB.id = `b_${i}`;
        cellB.className = "matrix-input-cell";
        cellB.value = "0";
        gridBContainer.appendChild(cellB);

        // Entrada x0_i
        const cellX0 = document.createElement("input");
        cellX0.type = "number";
        cellX0.id = `x0_${i}`;
        cellX0.className = "matrix-input-cell";
        cellX0.value = "0";
        
        // Reemplazar la última celda agregada en gridX0 por la caja de input
        gridX0Container.replaceChild(cellX0, gridX0Container.childNodes[i]);

        // Entradas fila A
        for (let j = 0; j < n; j++) {
            const cellA = document.createElement("input");
            cellA.type = "number";
            cellA.id = `A_${i}_${j}`;
            cellA.className = "matrix-input-cell";
            cellA.value = (i === j) ? "1" : "0";
            gridAContainer.appendChild(cellA);
        }
    }
}

function setupEquationInputs(n) {
    const container = document.getElementById("equationsContainer");
    if (!container) return;

    container.innerHTML = "";

    const varsMap = {
        2: ['x', 'y'],
        3: ['x', 'y', 'z'],
        4: ['x', 'y', 'z', 'w']
    };
    const vars = varsMap[n] || ['x', 'y', 'z'];

    // Valores estándar por defecto de presets para guiar al usuario
    const defaultsMap = {
        2: ["4*x + y = 5", "x + 5*y = 7"],
        3: ["4*x + y - z = 5", "x + 5*y + z = 7", "2*x - y + 6*z = 10"],
        4: ["5*x + y - z + w = 6", "x + 6*y + z - w = 7", "2*x - y + 7*z + w = 9", "x + y - z + 8*w = 9"]
    };

    const defaults = defaultsMap[n] || defaultsMap[3];

    for (let i = 0; i < n; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.flexDirection = "column";
        rowDiv.style.gap = "5px";

        const label = document.createElement("label");
        label.style.fontSize = "0.9em";
        label.style.fontWeight = "bold";
        label.innerHTML = `Ecuación ${i+1} (para x<sub>${i+1}</sub>):`;

        // Crear math-field dinámico del módulo de entrada LaTeX de WToMath
        const mathField = document.createElement("math-field");
        mathField.id = `eqInput_${i}`;
        mathField.style.width = "100%";
        mathField.style.marginBottom = "5px";
        mathField.value = defaults[i] || "";
        mathField.placeholder = `Ejemplo: 4${vars[0]} + ${vars[1]} = 5`;

        rowDiv.appendChild(label);
        rowDiv.appendChild(mathField);
        container.appendChild(rowDiv);
    }
}

// Función para cambiar de forma dinámica e inteligente los parámetros mostrados
function updateStopCriteriaVisibility() {
    const repeatOptions = document.getElementById("repeatOptions");
    const repeatOption = repeatOptions ? repeatOptions.value : "Cumplir Tolerancia";

    const tolWrapper = document.getElementById("tolWrapper");
    const maxIterWrapper = document.getElementById("maxIterWrapper");

    if (!tolWrapper || !maxIterWrapper) return;

    if (repeatOption === "Cumplir Tolerancia") {
        tolWrapper.style.display = "block";
        maxIterWrapper.style.display = "none";
    } else {
        tolWrapper.style.display = "none";
        maxIterWrapper.style.display = "block";
    }
}

function setupFormListeners(method) {
    const matrixDimSelect = document.getElementById("matrixDimSelect");
    const inputFormatSelect = document.getElementById("inputFormatSelect");
    const matrixContainer = document.querySelector(".matrix-container");
    const equationsContainer = document.getElementById("equationsContainer");

    if (matrixDimSelect) {
        matrixDimSelect.addEventListener("change", () => {
            const dim = parseInt(matrixDimSelect.value);
            setupMatrixGrid(dim);
            setupEquationInputs(dim);
        });
    }

    if (inputFormatSelect) {
        inputFormatSelect.addEventListener("change", () => {
            const format = inputFormatSelect.value;
            if (format === "matrix") {
                matrixContainer.style.display = "block";
                equationsContainer.style.display = "none";
            } else {
                matrixContainer.style.display = "none";
                equationsContainer.style.display = "flex";
                setupEquationInputs(parseInt(matrixDimSelect.value));
            }
        });
    }

    // Agregar escucha al criterio de parada lateral (repeatOptions)
    const repeatOptions = document.getElementById("repeatOptions");
    if (repeatOptions) {
        repeatOptions.addEventListener("change", () => {
            updateStopCriteriaVisibility();
        });
    }

    // Presets
    const presets = {
        edd: {
            n: 3,
            A: [[4, 1, -1], [1, 5, 1], [2, -1, 6]],
            b: [5, 7, 10],
            x0: [0, 0, 0]
        },
        noEdd: {
            n: 3,
            A: [[2, 1, 1], [1, 3, 1], [1, 1, 4]],
            b: [4, 5, 6],
            x0: [0, 0, 0]
        },
        divergent: {
            n: 3,
            A: [[1, 3, 1], [4, 1, -1], [1, 1, 2]],
            b: [5, 4, 4],
            x0: [0, 0, 0]
        }
    };

    function applyPreset(preset) {
        if (!matrixDimSelect) return;
        matrixDimSelect.value = preset.n.toString();
        setupMatrixGrid(preset.n);
        setupEquationInputs(preset.n);
        
        for (let i = 0; i < preset.n; i++) {
            document.getElementById(`b_${i}`).value = preset.b[i];
            document.getElementById(`x0_${i}`).value = preset.x0[i];
            for (let j = 0; j < preset.n; j++) {
                document.getElementById(`A_${i}_${j}`).value = preset.A[i][j];
            }
        }
    }

    const presetDDBtn = document.getElementById("presetDDBtn");
    const presetNoDDBtn = document.getElementById("presetNoDDBtn");
    const presetDivBtn = document.getElementById("presetDivBtn");

    if (presetDDBtn) presetDDBtn.addEventListener("click", () => applyPreset(presets.edd));
    if (presetNoDDBtn) presetNoDDBtn.addEventListener("click", () => applyPreset(presets.noEdd));
    if (presetDivBtn) presetDivBtn.addEventListener("click", () => applyPreset(presets.divergent));

    // Cargar preset EDD por defecto
    applyPreset(presets.edd);

    // Collapsibles
    const setupCollapsible = (headerId, contentId, chevronId) => {
        const header = document.getElementById(headerId);
        const content = document.getElementById(contentId);
        const chevron = document.getElementById(chevronId);
        if (header && content && chevron) {
            header.addEventListener("click", () => {
                if (content.style.display === "none") {
                    content.style.display = "block";
                    chevron.className = "fa-solid fa-chevron-up";
                } else {
                    content.style.display = "none";
                    chevron.className = "fa-solid fa-chevron-down";
                }
            });
        }
    };
    setupCollapsible("stepByStepHeader", "stepByStepContent", "stepByStepChevron");
    setupCollapsible("tablesHeader", "tablesContent", "tablesChevron");

    // Ejecutar Bucle de Resolución
    const btnSolveSystem = document.getElementById("btnSolveSystem");
    if (btnSolveSystem) {
        btnSolveSystem.addEventListener("click", () => {
            solveLinearSystem(method);
        });
    }
}

// Analizador robusto de ecuaciones lineales (Calcula coeficientes a_ij mediante diferencias de evaluación)
function parseLinearEquations(n, equationsList) {
    const A = [];
    const b = [];
    
    const varsMap = {
        2: ['x', 'y'],
        3: ['x', 'y', 'z'],
        4: ['x', 'y', 'z', 'w']
    };
    const vars = varsMap[n] || ['x', 'y', 'z'];
    
    for (let i = 0; i < n; i++) {
        let eqStr = equationsList[i].trim();
        if (eqStr === "") {
            throw new Error(`La ecuación ${i+1} está vacía.`);
        }
        
        // Convertir el LaTeX proveniente del math-field a una expresión de math.js estándar
        let parsedExpr = latexToMathExpr(eqStr);
        
        // Convertir a minúsculas y quitar espacios en blanco
        parsedExpr = parsedExpr.toLowerCase().replace(/\s+/g, '');
        
        // Si no tiene '=', asumir '=0'
        if (!parsedExpr.includes("=")) {
            parsedExpr += "=0";
        }
        
        const parts = parsedExpr.split("=");
        const lhs = parts[0];
        const rhs = parts[1] === "" ? "0" : parts[1];
        
        // Construir la expresión f(x) = (LHS) - (RHS)
        let normalizedExpr = `(${lhs}) - (${rhs})`;
        
        // Agregar multiplicación implícita básica para math.js
        vars.forEach(v => {
            // Número seguido de variable
            const numVarRegex = new RegExp(`([0-9.]+)([${v}])`, 'g');
            normalizedExpr = normalizedExpr.replace(numVarRegex, '$1*$2');
            
            // Variable seguida de número
            const varNumRegex = new RegExp(`([${v}])([0-9.]+)`, 'g');
            normalizedExpr = normalizedExpr.replace(varNumRegex, '$1*$2');
        });
        
        let compiled;
        try {
            compiled = math.compile(normalizedExpr);
        } catch (e) {
            throw new Error(`Error de sintaxis en la ecuación ${i+1}: "${equationsList[i]}". Asegúrate de escribirla correctamente.`);
        }
        
        // 1. Evaluar término constante b_i = -f(0,0,0)
        const zeroScope = {};
        vars.forEach(v => zeroScope[v] = 0);
        
        let constantTerm;
        try {
            constantTerm = compiled.evaluate(zeroScope);
        } catch (e) {
            throw new Error(`La ecuación ${i+1} no se pudo evaluar. Revisa que contenga variables lineales válidas.`);
        }
        
        const bi = -constantTerm;
        b.push(bi);
        
        // 2. Extraer coeficientes usando diferencias de evaluación f(e_j) - f(0) = a_ij
        const row = [];
        for (let j = 0; j < n; j++) {
            const unitScope = {};
            vars.forEach((v, idx) => {
                unitScope[v] = (idx === j) ? 1 : 0;
            });
            
            let valUnit;
            try {
                valUnit = compiled.evaluate(unitScope);
            } catch (e) {
                throw new Error(`Error al evaluar la variable ${vars[j]} en la ecuación ${i+1}.`);
            }
            
            const coeff = valUnit - constantTerm;
            
            // Validar linealidad evaluando en x_j = 2: f(2*e_j) - f(0) = 2 * coeff
            const doubleScope = {};
            vars.forEach((v, idx) => {
                doubleScope[v] = (idx === j) ? 2 : 0;
            });
            
            let valDouble = compiled.evaluate(doubleScope);
            let checkCoeff = valDouble - constantTerm;
            
            if (Math.abs(checkCoeff - 2 * coeff) > 1e-7) {
                throw new Error(`La ecuación ${i+1} no es lineal para la variable '${vars[j]}'. No se permiten potencias (ej: x^2), multiplicaciones de variables (ej: x*y) ni funciones no lineales.`);
            }
            
            row.push(coeff);
        }
        A.push(row);
    }
    
    return { A, b };
}

function solveLinearSystem(method) {
    const matrixDimSelect = document.getElementById("matrixDimSelect");
    const inputFormatSelect = document.getElementById("inputFormatSelect");
    const repeatOptions = document.getElementById("repeatOptions");
    
    const n = parseInt(matrixDimSelect.value);
    const tol = parseFloat(document.getElementById("tolInput").value) || 0.0001;
    const maxIter = parseInt(document.getElementById("maxIterInput").value) || 10;
    const format = inputFormatSelect ? inputFormatSelect.value : "matrix";
    const repeatOption = repeatOptions ? repeatOptions.value : "Cumplir Tolerancia";

    let A = [];
    let b = [];
    const x0 = [];

    // Leer estimación inicial del vector x0 (es común para ambos formatos)
    for (let i = 0; i < n; i++) {
        x0.push(parseFloat(document.getElementById(`x0_${i}`).value) || 0);
    }

    if (format === "matrix") {
        for (let i = 0; i < n; i++) {
            b.push(parseFloat(document.getElementById(`b_${i}`).value) || 0);
            const row = [];
            for (let j = 0; j < n; j++) {
                row.push(parseFloat(document.getElementById(`A_${i}_${j}`).value) || 0);
            }
            A.push(row);
        }
    } else {
        // Formato ecuaciones (obtenido desde los math-field)
        const equationsList = [];
        for (let i = 0; i < n; i++) {
            const eqInput = document.getElementById(`eqInput_${i}`);
            equationsList.push(eqInput ? eqInput.value : "");
        }
        
        try {
            const parsed = parseLinearEquations(n, equationsList);
            A = parsed.A;
            b = parsed.b;
        } catch (err) {
            alert(err.message);
            return;
        }
    }

    // 1. Criterio de Dominancia Diagonal (EDD)
    let isEDD = true;
    const detailsEDD = [];

    for (let i = 0; i < n; i++) {
        const diagVal = Math.abs(A[i][i]);
        let sumOffDiag = 0;
        for (let j = 0; j < n; j++) {
            if (j !== i) sumOffDiag += Math.abs(A[i][j]);
        }
        const isRowEDD = diagVal > sumOffDiag;
        if (!isRowEDD) isEDD = false;
        detailsEDD.push({ row: i + 1, diagVal, sumOffDiag, isRowEDD });
    }

    // Dibujar caja informativa de estabilidad
    const eddFeedbackBox = document.getElementById("eddFeedbackBox");
    if (isEDD) {
        eddFeedbackBox.innerHTML = `
            <div class="info-box">
                <strong><i class="fa-solid fa-circle-check"></i> Matriz Estrictamente Dominante por Diagonales (EDD).</strong>
                <p style="font-size:0.92em; opacity:0.9;">
                    Condición suficiente de convergencia cumplida (<span id="info_edd_formula"></span>). El algoritmo de ${method} convergerá con total estabilidad matemática.
                </p>
            </div>
        `;
        setTimeout(() => {
            const formSpan = document.getElementById("info_edd_formula");
            if (formSpan) katex.render("|a_{ii}| > \\sum_{j \\neq i} |a_{ij}|", formSpan, { throwOnError: false });
        }, 10);
    } else {
        eddFeedbackBox.innerHTML = `
            <div class="warning-box">
                <strong><i class="fa-solid fa-circle-exclamation"></i> Matriz NO Diagonalmente Dominante.</strong>
                <p style="font-size:0.92em; opacity:0.9;">
                    El elemento en la diagonal de al menos una fila es menor o igual que la suma de los otros coeficientes de esa fila. La convergencia matemática no está garantizada y los resultados podrían divergir.
                </p>
                <details style="font-size: 0.85em; cursor:pointer; margin-top:5px;">
                    <summary>Ver análisis de coeficientes por fila</summary>
                    <ul style="margin-left: 15px; margin-top: 5px;">
                        ${detailsEDD.map(d => `
                            <li>Fila ${d.row}: |a<sub>${d.row},${d.row}</sub>| = ${d.diagVal} ${d.isRowEDD ? '&gt;' : '&le;'} &sum;|a<sub>${d.row},j</sub>| = ${d.sumOffDiag} ${d.isRowEDD ? '✔️' : '❌'}</li>
                        `).join('')}
                    </ul>
                </details>
            </div>
        `;
    }

    // 2. Ejecutar Solución Iterativa
    const history = [{ iter: 0, x: [...x0], error: null }];
    let x = [...x0];
    let convergent = false;
    let diverged = false;

    // Determinar bucle según criterio de parada lateral
    const limit = (repeatOption === "Definir Iteraciones") ? maxIter : 200; // 200 es el límite máximo de seguridad offline

    if (method === "Jacobi") {
        for (let k = 1; k <= limit; k++) {
            const next_x = [];
            let maxError = 0;

            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (j !== i) sum += A[i][j] * x[j];
                }
                if (A[i][i] === 0) {
                    diverged = true;
                    break;
                }
                const xi = (b[i] - sum) / A[i][i];
                next_x.push(xi);

                const absErr = Math.abs(xi - x[i]);
                if (absErr > maxError) maxError = absErr;
            }

            if (diverged || next_x.some(val => isNaN(val) || !isFinite(val))) {
                diverged = true;
                break;
            }

            x = [...next_x];
            history.push({ iter: k, x: [...x], error: maxError });

            // Detener por tolerancia si esa es la opción
            if (repeatOption === "Cumplir Tolerancia" && maxError < tol) {
                convergent = true;
                break;
            }

            if (maxError > 1e10) {
                diverged = true;
                break;
            }
        }
        
        if (repeatOption === "Definir Iteraciones" && !diverged) {
            convergent = true; // Por definición, finalizó con éxito las iteraciones pedidas
        }
    } else {
        // Gauss-Seidel
        for (let k = 1; k <= limit; k++) {
            const next_x = [...x];
            let maxError = 0;

            for (let i = 0; i < n; i++) {
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    if (j !== i) sum += A[i][j] * next_x[j]; // Usa los valores más recientes inmediatamente
                }
                if (A[i][i] === 0) {
                    diverged = true;
                    break;
                }
                const xi = (b[i] - sum) / A[i][i];
                const prev = x[i];
                next_x[i] = xi;

                const absErr = Math.abs(xi - prev);
                if (absErr > maxError) maxError = absErr;
            }

            if (diverged || next_x.some(val => isNaN(val) || !isFinite(val))) {
                diverged = true;
                break;
            }

            x = [...next_x];
            history.push({ iter: k, x: [...x], error: maxError });

            // Detener por tolerancia si esa es la opción
            if (repeatOption === "Cumplir Tolerancia" && maxError < tol) {
                convergent = true;
                break;
            }

            if (maxError > 1e10) {
                diverged = true;
                break;
            }
        }

        if (repeatOption === "Definir Iteraciones" && !diverged) {
            convergent = true;
        }
    }

    // Mostrar Panel de Resultados
    document.getElementById("iterResultsPanel").style.display = "block";

    // 3. Renderizar estadísticas
    const solutionStatsWrapper = document.getElementById("solutionStatsWrapper");
    let statusText = "";
    let statusColor = "";
    if (diverged) {
        statusText = "Divergente (Valores inestables o NaN) ❌";
        statusColor = "#ef4444";
    } else if (convergent) {
        statusText = "Convergente (Aproximación exitosa) ✔️";
        statusColor = "#10b981";
    } else {
        statusText = "Sin converger (Se alcanzó el límite de iteraciones) ⚠️";
        statusColor = "#f59e0b";
    }

    solutionStatsWrapper.innerHTML = `
        <div style="background-color:rgba(99, 102, 241, 0.08); border:1px solid rgba(99, 102, 241, 0.2); border-radius:10px; padding:15px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; font-size:1.05em;">Estado del Solucionador:</span>
                <span style="font-weight:bold; color:${statusColor}; font-size:1.05em;">${statusText}</span>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px; margin-top:5px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
                <div>
                    <span style="font-size:0.85em; opacity:0.75; display:block;">Iteraciones Realizadas:</span>
                    <span style="font-size:1.2em; font-weight:800;">${history.length - 1}</span>
                </div>
                <div>
                    <span style="font-size:0.85em; opacity:0.75; display:block;">Último Error Absoluto (E<sub>max</sub>):</span>
                    <span style="font-size:1.2em; font-weight:800;">${history[history.length - 1].error !== null ? history[history.length - 1].error.toExponential(4) : '-'}</span>
                </div>
            </div>
            <div style="margin-top:5px;">
                <span style="font-size:0.85em; opacity:0.75; display:block; margin-bottom:3px;">Vector Solución Final x:</span>
                <span style="font-family: monospace; font-size:1.15em; font-weight:bold; color:var(--mod-primary, #6366f1);">
                    [ ${x.map(v => v.toFixed(6)).join(', ')} ]
                </span>
            </div>
        </div>
    `;

    // 4. Graficar en Plotly (Geometría, Valores y Errores)
    const currentTheme = document.body.className;
    let paperBg = '#ffffff';
    let plotBg = '#f8fafc';
    let fontColor = '#1e293b';
    let gridColor = '#e2e8f0';

    if (currentTheme.includes("theme-retro")) {
        paperBg = '#000000';
        plotBg = '#111111';
        fontColor = '#00ff00';
        gridColor = '#005500';
    } else if (currentTheme.includes("theme-space")) {
        paperBg = 'rgba(30, 41, 59, 0.4)';
        plotBg = 'rgba(15, 23, 42, 0.6)';
        fontColor = '#f8fafc';
        gridColor = 'rgba(255, 255, 255, 0.1)';
    }

    // --- GRÁFICO GEOMÉTRICO (2D para 2x2, 3D para 3x3, ocultar para 4x4) ---
    const sysPlotlyGeometryContainer = document.getElementById("sysPlotlyGeometryContainer");
    if (sysPlotlyGeometryContainer) {
        if (n === 2 || n === 3) {
            sysPlotlyGeometryContainer.style.display = "block";
            if (n === 2) {
                // Trazar rectas 2D cruzándose en el plano y la trayectoria iterativa
                let xMin = -10, xMax = 10;
                if (convergent && !diverged) {
                    xMin = x[0] - 6;
                    xMax = x[0] + 6;
                }
                const xVals = [];
                for (let val = xMin; val <= xMax; val += (xMax - xMin)/20) xVals.push(val);

                const traces2D = [];
                for (let i = 0; i < 2; i++) {
                    const yVals = [];
                    const a1 = A[i][0];
                    const a2 = A[i][1];
                    const bi = b[i];

                    if (a2 !== 0) {
                        xVals.forEach(xv => yVals.push((bi - a1 * xv) / a2));
                        traces2D.push({
                            x: xVals,
                            y: yVals,
                            mode: 'lines',
                            name: `Ecuación ${i+1}`,
                            line: { width: 2.5 }
                        });
                    } else if (a1 !== 0) {
                        const xFixed = bi / a1;
                        traces2D.push({
                            x: [xFixed, xFixed],
                            y: [xMin - 4, xMax + 4],
                            mode: 'lines',
                            name: `Ecuación ${i+1} (Vert.)`,
                            line: { width: 2.5 }
                        });
                    }
                }

                // Trayectoria iterativa 2D
                traces2D.push({
                    x: history.map(h => h.x[0]),
                    y: history.map(h => h.x[1]),
                    mode: 'lines+markers',
                    name: 'Trayectoria Iterativa',
                    line: { color: '#eab308', width: 3 },
                    marker: { size: 6, color: '#eab308' }
                });

                const layout2D = {
                    title: {
                        text: `Representación Geométrica 2D (Líneas e Intersección) - ${method}`,
                        font: { color: fontColor, family: 'inherit', size: 14 }
                    },
                    xaxis: {
                        title: 'x₁',
                        titlefont: { color: fontColor },
                        tickfont: { color: fontColor },
                        gridcolor: gridColor,
                        zerolinecolor: gridColor
                    },
                    yaxis: {
                        title: 'x₂',
                        titlefont: { color: fontColor },
                        tickfont: { color: fontColor },
                        gridcolor: gridColor,
                        zerolinecolor: gridColor
                    },
                    paper_bgcolor: paperBg,
                    plot_bgcolor: plotBg,
                    margin: { l: 65, r: 20, t: 40, b: 50 },
                    legend: { font: { color: fontColor } }
                };

                Plotly.newPlot('sysPlotlyGeometryContainer', traces2D, layout2D, { responsive: true, displayModeBar: false });

            } else {
                // Trazar planos 3D semi-transparentes intersecándose en el espacio y la trayectoria iterativa
                let xMin = -5, xMax = 5;
                let yMin = -5, yMax = 5;
                if (convergent && !diverged) {
                    xMin = x[0] - 4; xMax = x[0] + 4;
                    yMin = x[1] - 4; yMax = x[1] + 4;
                }

                const x3d = [];
                const y3d = [];
                for (let v = xMin; v <= xMax; v += (xMax - xMin)/10) x3d.push(v);
                for (let v = yMin; v <= yMax; v += (yMax - yMin)/10) y3d.push(v);

                const traces3D = [];
                const planeColors = ['#38bdf8', '#ec4899', '#10b981'];

                for (let i = 0; i < 3; i++) {
                    const z3d = [];
                    const a1 = A[i][0];
                    const a2 = A[i][1];
                    const a3 = A[i][2];
                    const bi = b[i];

                    y3d.forEach(yv => {
                        const rowZ = [];
                        x3d.forEach(xv => {
                            if (a3 !== 0) {
                                rowZ.push((bi - a1 * xv - a2 * yv) / a3);
                            } else {
                                rowZ.push(0); // Fallback para planos verticales
                            }
                        });
                        z3d.push(rowZ);
                    });

                    traces3D.push({
                        x: x3d,
                        y: y3d,
                        z: z3d,
                        type: 'surface',
                        opacity: 0.45,
                        name: `Ecuación ${i+1}`,
                        showscale: false,
                        colorscale: [[0, planeColors[i]], [1, planeColors[i]]]
                    });
                }

                // Trayectoria iterativa Scatter3D
                traces3D.push({
                    x: history.map(h => h.x[0]),
                    y: history.map(h => h.x[1]),
                    z: history.map(h => h.x[2]),
                    type: 'scatter3d',
                    mode: 'lines+markers',
                    name: 'Trayectoria Iterativa',
                    line: { color: '#eab308', width: 4 },
                    marker: { size: 5, color: '#eab308' }
                });

                const layout3D = {
                    title: {
                        text: `Representación Geométrica 3D (Planos e Intersección) - ${method}`,
                        font: { color: fontColor, family: 'inherit', size: 14 }
                    },
                    scene: {
                        xaxis: { title: 'x₁', titlefont: { color: fontColor }, tickfont: { color: fontColor }, gridcolor: gridColor },
                        yaxis: { title: 'x₂', titlefont: { color: fontColor }, tickfont: { color: fontColor }, gridcolor: gridColor },
                        zaxis: { title: 'x₃', titlefont: { color: fontColor }, tickfont: { color: fontColor }, gridcolor: gridColor }
                    },
                    paper_bgcolor: paperBg,
                    margin: { l: 0, r: 0, t: 40, b: 0 },
                    legend: { font: { color: fontColor } }
                };

                Plotly.newPlot('sysPlotlyGeometryContainer', traces3D, layout3D, { responsive: true, displayModeBar: false });
            }
        } else {
            sysPlotlyGeometryContainer.style.display = "none";
        }
    }

    // --- GRÁFICO 1: TRAYECTORIA DE APROXIMACIÓN (VALORES x_i) ---
    const tracesValues = [];
    const varsSymbols = ['x₁', 'x₂', 'x₃', 'x₄'];
    
    for (let idx = 0; idx < n; idx++) {
        tracesValues.push({
            x: history.map(h => h.iter),
            y: history.map(h => h.x[idx]),
            mode: 'lines+markers',
            name: varsSymbols[idx] || `x_{${idx+1}}`,
            line: { width: 2.5 },
            marker: { size: 5 }
        });
    }

    const layoutValues = {
        title: {
            text: `Trayectoria de Valores - Aproximación al Objetivo (${method})`,
            font: { color: fontColor, family: 'inherit', size: 13 }
        },
        xaxis: {
            title: 'Iteración',
            titlefont: { color: fontColor },
            tickfont: { color: fontColor },
            gridcolor: gridColor,
            zerolinecolor: gridColor
        },
        yaxis: {
            title: 'Valor Evaluado',
            titlefont: { color: fontColor },
            tickfont: { color: fontColor },
            gridcolor: gridColor,
            zerolinecolor: gridColor
        },
        paper_bgcolor: paperBg,
        plot_bgcolor: plotBg,
        margin: { l: 65, r: 20, t: 40, b: 50 },
        legend: { font: { color: fontColor } }
    };

    Plotly.newPlot('sysPlotlyValuesContainer', tracesValues, layoutValues, { responsive: true, displayModeBar: false });

    // --- GRÁFICO 2: HISTORIAL DEL ERROR (CONVERGENCIA LOGARÍTMICA) ---
    const iterErrors = history.map(h => h.error !== null ? Math.log10(h.error + 1e-16) : null);
    const colorLine = (method === "Jacobi") ? "#38bdf8" : "#ec4899"; // Jacobi Celeste, GS Rosa
    const iterLabels = history.map(h => h.iter);

    const traceError = {
        x: iterLabels.slice(1),
        y: iterErrors.slice(1),
        mode: 'lines+markers',
        name: `Log₁₀(Error)`,
        line: { color: colorLine, width: 3 },
        marker: { size: 6 }
    };

    const layoutError = {
        title: {
            text: `Curva de Error de Convergencia (${method})`,
            font: { color: fontColor, family: 'inherit', size: 13 }
        },
        xaxis: {
            title: 'Iteración',
            titlefont: { color: fontColor },
            tickfont: { color: fontColor },
            gridcolor: gridColor,
            zerolinecolor: gridColor
        },
        yaxis: {
            title: 'Log₁₀(Error Absoluto)',
            titlefont: { color: fontColor },
            tickfont: { color: fontColor },
            gridcolor: gridColor,
            zerolinecolor: gridColor
        },
        paper_bgcolor: paperBg,
        plot_bgcolor: plotBg,
        margin: { l: 65, r: 20, t: 40, b: 50 },
        legend: { font: { color: fontColor } }
    };

    Plotly.newPlot('sysPlotlyErrorContainer', [traceError], layoutError, { responsive: true, displayModeBar: false });

    // 5. Explicación Didáctica Paso a Paso de la Iteración 1
    renderStepByStepExplanatory(n, A, b, x0, history[1]?.x, method);

    // 6. Cargar Tabla de Valores
    renderDetailTable(n, history);

    // 7. Configurar Exportación a Excel
    setupExcelGenerator(n, A, b, x0, history, isEDD, method);
}

function renderStepByStepExplanatory(n, A, b, x0, firstIterValues, method) {
    const container = document.getElementById("stepExplanatoryText");
    if (!container) return;

    if (!firstIterValues) {
        container.innerHTML = "<p>El sistema divergió o falló inmediatamente, por lo que no es posible desplegar el paso a paso.</p>";
        return;
    }

    let html = "";
    if (method === "Jacobi") {
        html = `
            <p style="font-size:0.92em; line-height:1.5; margin-bottom:12px;">
                En el método de <strong>Jacobi</strong>, todas las coordenadas del vector se calculan utilizando <strong>únicamente</strong> los valores del paso inicial x<sup>(0)</sup> = [${x0.join(', ')}]<sup>T</sup>. 
                No se utilizan valores intermedios actualizados en el paso actual. A continuación se detalla la aritmética fila por fila:
            </p>
        `;

        for (let i = 0; i < n; i++) {
            let sumStr = "";
            let valSumStr = "";
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    sumStr += ` - (${A[i][j]}) x_{${j+1}}^{(0)}`;
                    valSumStr += ` - (${A[i][j]})(${x0[j]})`;
                }
            }

            const rawFormula = `x_{${i+1}}^{(1)} = \\frac{b_{${i+1}} ${sumStr}}{a_{${i+1},${i+1}}}`;
            const substitutedFormula = `x_{${i+1}}^{(1)} = \\frac{${b[i]} ${valSumStr}}{${A[i][i]}}`;
            const resultFormula = `x_{${i+1}}^{(1)} = ${firstIterValues[i].toFixed(6)}`;

            const divFormulaId = `jacobi_raw_${i}`;
            const divSubstitutedId = `jacobi_sub_${i}`;

            html += `
                <div class="step-item">
                    <div style="font-weight:bold; font-size:0.95em; margin-bottom:3px; color:var(--mod-primary, #6366f1);">Variable x<sub>${i+1}</sub>:</div>
                    <div id="${divFormulaId}" style="margin: 8px 0; overflow-x:auto;"></div>
                    <div id="${divSubstitutedId}" style="margin: 8px 0; overflow-x:auto;"></div>
                </div>
            `;

            setTimeout(() => {
                try {
                    katex.render(rawFormula, document.getElementById(divFormulaId), { displayMode: true, throwOnError: false });
                    katex.render(`${substitutedFormula} = ${resultFormula}`, document.getElementById(divSubstitutedId), { displayMode: true, throwOnError: false });
                } catch (e) {
                    console.error(e);
                }
            }, 10);
        }
    } else {
        // Gauss-Seidel
        html = `
            <p style="font-size:0.92em; line-height:1.5; margin-bottom:12px;">
                En el método de <strong>Gauss-Seidel</strong>, las variables se resuelven secuencialmente. 
                Tan pronto como calculamos un valor para x<sub>j</sub><sup>(1)</sup>, este <strong>se reutiliza inmediatamente</strong> en la misma iteración para obtener las siguientes coordenadas:
            </p>
        `;

        for (let i = 0; i < n; i++) {
            let sumStr = "";
            let valSumStr = "";
            const termsUsed = [];

            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const isNew = j < i;
                    const superScript = isNew ? "(1)" : "(0)";
                    const valUsed = isNew ? firstIterValues[j] : x0[j];
                    sumStr += ` - (${A[i][j]}) x_{${j+1}}^{${superScript}}`;

                    if (isNew) {
                        valSumStr += ` - (${A[i][j]}) \\mathbf{(${valUsed.toFixed(4)})}`;
                        termsUsed.push(`x<sub>${j+1}</sub><sup>(1)</sup> = ${valUsed.toFixed(4)} (¡Nuevo valor!)`);
                    } else {
                        valSumStr += ` - (${A[i][j]}) (${valUsed})`;
                        termsUsed.push(`x<sub>${j+1}</sub><sup>(0)</sup> = ${valUsed} (Aproximación previa)`);
                    }
                }
            }

            const rawFormula = `x_{${i+1}}^{(1)} = \\frac{b_{${i+1}} ${sumStr}}{a_{${i+1},${i+1}}}`;
            const substitutedFormula = `x_{${i+1}}^{(1)} = \\frac{${b[i]} ${valSumStr}}{${A[i][i]}}`;
            const resultFormula = `x_{${i+1}}^{(1)} = ${firstIterValues[i].toFixed(6)}`;

            const divFormulaId = `gs_raw_${i}`;
            const divSubstitutedId = `gs_sub_${i}`;

            html += `
                <div class="step-item">
                    <div style="font-weight:bold; font-size:0.95em; margin-bottom:3px; color:#ec4899;">Variable x<sub>${i+1}</sub>:</div>
                    <div id="${divFormulaId}" style="margin: 8px 0; overflow-x:auto;"></div>
                    <div id="${divSubstitutedId}" style="margin: 8px 0; overflow-x:auto;"></div>
                    <div style="font-size:0.85em; opacity:0.8; margin-top:5px; padding-left:10px; border-left: 2px solid #ec4899;">
                        📝 Aritmética de Gauss-Seidel: Se usaron ${termsUsed.join(' y ')}.
                    </div>
                </div>
            `;

            setTimeout(() => {
                try {
                    katex.render(rawFormula, document.getElementById(divFormulaId), { displayMode: true, throwOnError: false });
                    katex.render(`${substitutedFormula} = ${resultFormula}`, document.getElementById(divSubstitutedId), { displayMode: true, throwOnError: false });
                } catch (e) {
                    console.error(e);
                }
            }, 10);
        }
    }

    container.innerHTML = html;
}

function renderDetailTable(n, history) {
    const container = document.getElementById("tableScrollableContainer");
    if (!container) return;

    let headersHTML = `<th>Iteración</th>`;
    for (let i = 0; i < n; i++) {
        headersHTML += `<th>x<sub>${i+1}</sub></th>`;
    }
    headersHTML += `<th>Error Máximo Absoluto</th>`;

    let rowsHTML = "";
    history.forEach(row => {
        let cellsHTML = `<td>${row.iter}</td>`;
        row.x.forEach(val => {
            cellsHTML += `<td>${val.toFixed(8)}</td>`;
        });
        cellsHTML += `<td>${row.error !== null ? row.error.toExponential(4) : '-'}</td>`;
        rowsHTML += `<tr>${cellsHTML}</tr>`;
    });

    container.innerHTML = `
        <table>
            <thead>
                <tr>${headersHTML}</tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>
    `;
}

function setupExcelGenerator(n, A, b, x0, history, isEDD, method) {
    const container = document.getElementById("excelDisplay");
    if (!container) return;

    container.innerHTML = "";

    const excelBtn = document.createElement("button");
    excelBtn.id = "excelFile_btn";
    excelBtn.innerHTML = `<i class="fa-solid fa-file-excel"></i> Descargar Reporte en Excel`;
    excelBtn.className = "btn-analyze";
    excelBtn.style.marginTop = "15px";

    excelBtn.addEventListener("click", async () => {
        const workbook = new ExcelJS.Workbook();
        
        // Hoja 1: Resumen y Datos del Sistema
        const summarySheet = workbook.addWorksheet("Resumen");
        summarySheet.getColumn(1).width = 25;
        summarySheet.getColumn(2).width = 35;

        summarySheet.addRow([`REPORTE DE SISTEMA ITERATIVO - MÉTODO DE ${method.toUpperCase()}`]).font = { bold: true, size: 13 };
        summarySheet.addRow([]);

        summarySheet.addRow(["Parámetro", "Valor"]);
        summarySheet.getRow(3).font = { bold: true };

        summarySheet.addRow(["Dimensión de Matriz", `${n} x ${n}`]);
        summarySheet.addRow(["Dominancia Diagonal (EDD)", isEDD ? "SÍ (Convergencia Estable)" : "NO (Posible Divergencia)"]);
        summarySheet.addRow(["Total de Iteraciones", history.length - 1]);
        
        const lastRow = history[history.length - 1];
        summarySheet.addRow(["Aproximación Final x", `[${lastRow.x.map(v => v.toFixed(5)).join(', ')}]`]);
        summarySheet.addRow(["Último Error Absoluto", lastRow.error !== null ? lastRow.error : "-"]);
        
        summarySheet.addRow([]);
        summarySheet.addRow(["Coeficientes Matriciales (A | b)"]).font = { bold: true };
        for (let i = 0; i < n; i++) {
            const matrixRow = [...A[i], "|", b[i]];
            summarySheet.addRow(matrixRow);
        }

        // Hoja 2: Tabla de Iteraciones
        const tableSheet = workbook.addWorksheet("Tabla Iteraciones");
        const headers = ["Iteración"];
        for (let i = 0; i < n; i++) headers.push(`x_${i+1}`);
        headers.push("Error Máximo Absoluto");

        const headerRow = tableSheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        
        const sheetColor = (method === "Jacobi") ? "FF38BDF8" : "FFEC4899";
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: sheetColor }
        };

        history.forEach(row => {
            const dataRow = [row.iter, ...row.x, row.error !== null ? row.error : "-"];
            tableSheet.addRow(dataRow);
        });

        // Crear búfer y gatillar la descarga
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `WToMath_${method}_Reporte_${n}x${n}.xlsx`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    container.appendChild(excelBtn);
}
