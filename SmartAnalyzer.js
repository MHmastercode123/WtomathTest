import { evaluateFunction } from "./MathLogistic.js";

// Limpiar contenedor padre
function clearMathContainer() {
    document.getElementById("mathContainer").innerHTML = "";
}

function latexToMathExpr(latex) {
    let expr = latex
        .replace(/\$\$/g, '') // Eliminar tokens de modo matemático ($$)
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\mleft/g, '')
        .replace(/\\mright/g, '')
        .replace(/\s+/g, ''); // Eliminar todos los espacios en blanco

    // Eliminar P(x)= o f(x)= si el usuario pegó la expresión con nombre o convertir A=B a (A)-(B)
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
    for(let i=0; i<3; i++){
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
        .replace(/([0-9]+)([xy])/g, '$1*$2')
        .replace(/([xy])([0-9]+)/g, '$1*$2')
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\div/g, '/')
        
        // Limpiar cualquier barra invertida restante
        .replace(/\\/g, '');

    return expr;
}

let _analyzerDOM = null;

export function loadSmartAnalyzer() {
    clearMathContainer();
    const container = document.getElementById("mathContainer");

    if (_analyzerDOM) {
        container.appendChild(_analyzerDOM);
        return;
    }

    _analyzerDOM = document.createElement("div");
    _analyzerDOM.style.width = "100%";
    _analyzerDOM.style.height = "100%";
    _analyzerDOM.style.display = "flex";
    _analyzerDOM.style.flexDirection = "column";

    // Título
    const lblTitle = document.createElement("div");
    lblTitle.className = "math-title-container";
    lblTitle.innerHTML = `<h2 class="math-title"><i class="fa-solid fa-brain"></i> Analizador Matemático de Ecuaciones</h2>`;
    _analyzerDOM.appendChild(lblTitle);

    // Tarjeta principal (Input)
    const formCard = document.createElement("div");
    formCard.className = "dashboard-card";
    
    const formTitle = document.createElement("h3");
    formTitle.className = "card-title";
    formTitle.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Análisis Avanzado`;
    formCard.appendChild(formTitle);

    const description = document.createElement("p");
    description.style.color = "#ccc";
    description.style.marginBottom = "15px";
    description.innerText = "Ingresa tu ecuación. El sistema la analizará, buscará posibles raíces, evaluará el mejor método numérico y te guiará paso a paso.";
    formCard.appendChild(description);

    const equationMathField = document.createElement("math-field");
    equationMathField.value = "x^3 - 4x - 9";
    equationMathField.id = "smartEquationInput";
    equationMathField.style.width = "100%";
    equationMathField.style.marginBottom = "15px";

    const rangeContainer = document.createElement("div");
    rangeContainer.style.display = "flex";
    rangeContainer.style.gap = "15px";
    rangeContainer.style.marginBottom = "15px";
    
    const minRangeInput = document.createElement("input");
    minRangeInput.type = "number";
    minRangeInput.value = "-10";
    minRangeInput.className = "styled-select";
    minRangeInput.style.flex = "1";
    minRangeInput.placeholder = "Rango Mínimo (ej: -10)";

    const maxRangeInput = document.createElement("input");
    maxRangeInput.type = "number";
    maxRangeInput.value = "10";
    maxRangeInput.className = "styled-select";
    maxRangeInput.style.flex = "1";
    maxRangeInput.placeholder = "Rango Máximo (ej: 10)";
    
    rangeContainer.appendChild(minRangeInput);
    rangeContainer.appendChild(maxRangeInput);
    
    const btnAnalyze = document.createElement("button");
    btnAnalyze.className = "btn-analyze";
    btnAnalyze.innerHTML = `<i class="fa-solid fa-magnifying-glass-chart"></i> Analizar Función`;
    btnAnalyze.style.padding = "10px 20px";
    btnAnalyze.style.backgroundColor = "var(--primary-color, #4facfe)";
    btnAnalyze.style.color = "white";
    btnAnalyze.style.border = "none";
    btnAnalyze.style.borderRadius = "8px";
    btnAnalyze.style.cursor = "pointer";
    btnAnalyze.style.fontWeight = "bold";

    formCard.appendChild(equationMathField);
    formCard.appendChild(rangeContainer);
    formCard.appendChild(btnAnalyze);
    
    _analyzerDOM.appendChild(formCard);

    // Contenedor de resultados
    const resultsContainer = document.createElement("div");
    resultsContainer.id = "smartResults";
    resultsContainer.style.display = "none";
    resultsContainer.style.gap = "20px";
    resultsContainer.style.marginTop = "20px";
    
    _analyzerDOM.appendChild(resultsContainer);
    
    container.appendChild(_analyzerDOM);

    btnAnalyze.addEventListener("click", () => {
        let minVal = parseFloat(minRangeInput.value);
        let maxVal = parseFloat(maxRangeInput.value);
        if (isNaN(minVal)) minVal = -10;
        if (isNaN(maxVal)) maxVal = 10;
        if(minVal >= maxVal) {
            alert("El rango mínimo debe ser menor al máximo.");
            return;
        }
        performAnalysis(equationMathField.value, resultsContainer, minVal, maxVal);
    });
}

function performAnalysis(latexExpr, resultsContainer, minRange = -10, maxRange = 10) {
    resultsContainer.innerHTML = "";
    resultsContainer.style.display = "flex";
    resultsContainer.style.flexDirection = "column";

    if(!latexExpr || !latexExpr.includes('x')){
        alert("Por favor, ingresa una función válida con al menos una variable 'x'.");
        return;
    }

    try {
        const mathExprStr = latexToMathExpr(latexExpr);
        const compiled = math.parse(mathExprStr).compile();
        const derivative = math.derivative(mathExprStr, 'x');
        const compiledDeriv = derivative.compile();

        // 1. Clasificación
        const clasification = classifyFunction(mathExprStr);
        
        // 2. Exploración de Intervalos
        const { intervals, singularities } = exploreIntervals(compiled, minRange, maxRange);

        // 3. Recomendación de método
        const recommendation = recommendMethod(clasification, intervals, singularities, compiledDeriv, minRange, maxRange);

        // Estrellas
        let score = recommendation.scores[recommendation.method];
        let starCount = Math.min(5, Math.max(3, Math.round((score / 15) * 5))); 
        if(score > 8) starCount = 5;
        else if(score > 5) starCount = 4;
        else starCount = 3;
        
        let starsHtml = "";
        for(let i=0; i<5; i++){
            if(i < starCount) starsHtml += '<i class="fa-solid fa-star" style="color: gold; margin-right:2px;"></i>';
            else starsHtml += '<i class="fa-regular fa-star" style="color: gray; margin-right:2px;"></i>';
        }

        // Panel: Clasificación y Análisis
        const analysisCard = createCard("Análisis de Función", "fa-microscope");
        
        // Reemplazar exponentialE por 'e' en la derivada
        let latexDeriv = derivative.toTex().replace(/exponentialE/g, 'e');

        analysisCard.innerHTML += `
            <div style="margin-top: 10px;">
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                    <strong>Expresión evaluada:</strong>
                    <math-field read-only style="border:none; pointer-events:none; background:transparent; font-size:1.2em; outline:none; margin:0;">${latexExpr}</math-field>
                </div>
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                    <strong>Derivada detectada:</strong>
                    <math-field read-only style="border:none; pointer-events:none; background:transparent; font-size:1.2em; outline:none; margin:0;">${latexDeriv}</math-field>
                </div>
                <p style="margin-bottom:10px;"><strong>Tipo de Función:</strong> <span style="color:var(--primary-color); font-weight:bold;">${clasification}</span></p>
                <p><strong>Discontinuidades posibles:</strong> ${singularities.length > 0 ? singularities.length + " zonas de riesgo" : "Ninguna detectada en el rango seleccionado"}</p>
            </div>
        `;
        
        // Panel: Recomendación
        const recCard = createCard("Método Sugerido", "fa-star");
        
        let otherMethodsHtml = Object.entries(recommendation.scores)
            .filter(([m, s]) => m !== recommendation.method)
            .sort((a,b) => b[1] - a[1])
            .map(([m, s]) => {
                let sCount = Math.min(5, Math.max(1, Math.round((s / 15) * 5)));
                let sHtml = "";
                for(let i=0; i<5; i++){
                    if(i < sCount) sHtml += '<i class="fa-solid fa-star" style="color: gold; margin-right:2px; font-size:0.8em;"></i>';
                    else sHtml += '<i class="fa-regular fa-star" style="color: gray; margin-right:2px; font-size:0.8em;"></i>';
                }
                return `
                <div style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.1);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:var(--primary-color);">${m}</strong> 
                        <span>${sHtml}</span>
                    </div>
                    <div style="font-size:0.85em; color:#bbb;">
                        <em>Parámetros sugeridos:</em> ${recommendation.params[m]}
                    </div>
                </div>`;
            }).join('');

        recCard.innerHTML += `
            <div style="margin-top: 10px; background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap;">
                    <h4 style="margin:0; color:var(--primary-color); font-size:1.2em;">🏆 ${recommendation.method}</h4>
                    <div>${starsHtml}</div>
                </div>
                <p style="margin:0 0 10px 0;"><strong>Razón:</strong> ${recommendation.reason}</p>
                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin-top:10px;">
                    <p style="margin:0; font-size:0.9em;"><strong>Parámetros de Configuración Óptimos:</strong><br> ${recommendation.params[recommendation.method]}</p>
                </div>
            </div>
            
            <div style="margin-top:15px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px;">
                <h5 style="margin:0 0 5px 0; color:#ccc;">Calificación de todos los métodos:</h5>
                <p style="font-size:0.8em; color:#ff6b6b; margin-bottom:15px; border-left: 2px solid #ff6b6b; padding-left:8px;">
                    ⚠️ <strong>Atención:</strong> Entre menos estrellas tenga un método, más complicado se le hará al sistema hallar raíces con él. Hay altísimas probabilidades de estancamiento, divergencia o fracaso si decides no utilizar el método sugerido.
                </p>
                ${otherMethodsHtml}
            </div>

            ${intervals.length > 0 ? 
                `<div style="margin-top:15px">
                    <p><strong>Intervalos recomendados para la búsqueda:</strong></p>
                    <ul style="padding-left:20px;">
                        ${intervals.map(i => `<li>[${i.a.toFixed(2)}, ${i.b.toFixed(2)}] (Cambio de signo detectado)</li>`).join('')}
                    </ul>
                 </div>` 
                 : 
                 `<p style="color:#ff6b6b; margin-top:15px;">⚠️ No se detectaron cruces con el eje X en el rango actual [${minRange}, ${maxRange}]. Prueba ampliar el rango o verifica la función.</p>`
            }
        `;

        resultsContainer.appendChild(analysisCard);
        resultsContainer.appendChild(recCard);

        // Gráfico Plotly
        const plotCard = createCard("Visualización Interactiva", "fa-chart-area");
        const plotDiv = document.createElement("div");
        plotDiv.id = "plotly-chart";
        plotDiv.style.width = "100%";
        plotDiv.style.height = "400px";
        plotCard.appendChild(plotDiv);
        resultsContainer.appendChild(plotCard);

        drawPlotlyChart(plotDiv, compiled, intervals, singularities, minRange, maxRange);

        // Panel Educativo
        const eduCard = createCard("Tutor Matemático", "fa-graduation-cap");
        eduCard.innerHTML += `
            <div style="margin-top:10px; line-height:1.6;">
                <p><strong>¿Qué sucede aquí?</strong></p>
                <p>Para encontrar las raíces (donde <code>f(x) = 0</code>), el sistema primero rastreó la curva de tu función. Al observar que la curva cruza el eje X (cambio de signo), hemos delimitado intervalos seguros.</p>
                <p><strong>Sobre el método elegido (${recommendation.method}):</strong></p>
                <p>${getEducationalText(recommendation.method)}</p>
            </div>
        `;
        resultsContainer.appendChild(eduCard);



    } catch (e) {
        alert("Error en el análisis matemático: " + e.message);
        console.error(e);
    }
}

function createCard(titleText, iconClass) {
    const card = document.createElement("div");
    card.className = "dashboard-card";
    card.style.height = "100%";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${titleText}`;
    card.appendChild(title);
    return card;
}

function classifyFunction(expr) {
    let type = "Polinomio";
    if(expr.includes("sin") || expr.includes("cos") || expr.includes("tan")) type = "Trigonométrica";
    else if(expr.includes("exp")) type = "Exponencial";
    else if(expr.includes("log")) type = "Logarítmica";
    else if(expr.includes("/")) type = "Racional";
    
    // Determinar si la función es mixta
    let types = 0;
    if(/sin|cos|tan/.test(expr)) types++;
    if(/exp/.test(expr)) types++;
    if(/log/.test(expr)) types++;
    if(types > 1) type = "Mixta";
    
    return type;
}

function exploreIntervals(compiled, start = -10, end = 10, step = 0.1) {
    let intervals = [];
    let singularities = [];
    let prevX = start;
    let prevY = null;

    try { 
        let res = compiled.evaluate({x: start}); 
        if (typeof res === 'number' && !isNaN(res)) prevY = res;
    } catch(e) {}

    for (let x = start + step; x <= end; x += step) {
        let y = null;
        try { 
            let res = compiled.evaluate({x: x}); 
            if (typeof res === 'number' && !isNaN(res)) y = res;
        } catch(e) {}
        
        if (prevY !== null && y !== null) {
            // Detección de asíntotas (salto brusco)
            if (Math.abs(y - prevY) > 50) {
                singularities.push(x - step/2);
            } 
            // Detección de cambio de signo
            else if (prevY * y < 0) {
                intervals.push({a: prevX, b: x});
            }
            // Detección de raíz exacta
            else if (y === 0) {
                intervals.push({a: x, b: x});
            }
        }
        
        if (y !== null) {
            prevX = x;
        }
        prevY = y;
    }

    return { intervals, singularities };
}

function recommendMethod(classification, intervals, singularities, compiledDeriv, minRange, maxRange) {
    let scores = {
        "Newton Raphson": 0,
        "Bisección": 0,
        "Secante": 0,
        "Regla Falsa": 0,
        "Müller": 0,
        "Taylor": 0
    };

    // Bisección es muy seguro pero lento
    scores["Bisección"] += 2;
    scores["Regla Falsa"] += 2;
    scores["Secante"] += 3; // En general secante suele ser un buen todo-terreno
    
    if (intervals.length > 0) {
        scores["Bisección"] += 2; // Tenemos intervalos claros, Bisección sube
        scores["Secante"] += 2;
        scores["Regla Falsa"] += 2;
    }

    // Análisis de la derivada para Newton
    let derivativeStable = true;
    if (intervals.length > 0) {
        const midPoint = (intervals[0].a + intervals[0].b) / 2;
        try {
            const dVal = compiledDeriv.evaluate({x: midPoint});
            if (Math.abs(dVal) < 0.1) {
                derivativeStable = false; // Derivada cercana a cero, malo para Newton
            } else {
                scores["Newton Raphson"] += 6; // Derivada sólida
            }
        } catch(e) {
            derivativeStable = false;
        }
    } else {
        scores["Newton Raphson"] += 2; 
    }

    if(singularities.length > 0) {
        scores["Newton Raphson"] -= 5; // Newton es terrible cerca de asíntotas
        scores["Bisección"] += 4; // Bisección es más robusta
        scores["Regla Falsa"] += 3;
    }

    if(classification === "Polinomio") {
        scores["Müller"] += 6; // Müller es genial para polinomios (raíces complejas)
        scores["Newton Raphson"] += 2;
    }

    if(classification === "Trigonométrica" || classification === "Exponencial / Logarítmica") {
        scores["Taylor"] += 9; // Series son excelentes para aproximar estas funciones
    }

    let bestMethod = "Bisección";
    let maxScore = -999;
    for (let method in scores) {
        if (scores[method] > maxScore) {
            maxScore = scores[method];
            bestMethod = method;
        }
    }

    let reason = "";
    if (bestMethod === "Newton Raphson") reason = "La función es diferenciable y no presenta derivadas nulas cerca de la raíz, lo que permite una convergencia cuadrática rapidísima.";
    else if (bestMethod === "Bisección") reason = "Se eligió por su garantía de convergencia ante posibles discontinuidades o derivadas inestables.";
    else if (bestMethod === "Müller") reason = "Al ser un polinomio, Müller es ideal e incluso puede hallar raíces complejas si existen.";
    else if (bestMethod === "Secante") reason = "Ofrece una velocidad de convergencia casi tan buena como Newton sin necesidad de calcular la derivada analítica explícita.";
    else if (bestMethod === "Taylor") reason = "Dada la naturaleza trascendental de la función, una expansión en serie analítica puede proveer una excelente aproximación local antes de buscar raíces.";
    else reason = "Es el método más equilibrado para la topología de esta función.";

    let a = minRange, b = maxRange;
    if (intervals.length > 0) {
        a = intervals[0].a;
        b = intervals[0].b;
    }
    let mid = (a + b) / 2;

    let params = {
        "Bisección": `Intervalo: a = [${a.toFixed(2)}], b = [${b.toFixed(2)}]`,
        "Regla Falsa": `Intervalo: a = [${a.toFixed(2)}], b = [${b.toFixed(2)}]`,
        "Newton Raphson": `Aproximación inicial (x0): [${mid.toFixed(2)}]`,
        "Secante": `Aproximaciones iniciales: x0 = [${a.toFixed(2)}], x1 = [${b.toFixed(2)}]`,
        "Müller": `Puntos iniciales: x0 = [${a.toFixed(2)}], x1 = [${mid.toFixed(2)}], x2 = [${b.toFixed(2)}]`,
        "Taylor": `Sustitución 'a' = [${mid.toFixed(2)}] (coloca 0 para Maclaurin), Orden (n) = 4, ε = 0.0001`
    };

    return {
        method: bestMethod,
        reason: reason,
        scores: scores,
        params: params
    };
}

function getEducationalText(method) {
    const texts = {
        "Newton Raphson": "Newton-Raphson traza una línea tangente a la curva en el punto de tu aproximación inicial. El punto donde esa tangente cruza el eje X se convierte en la nueva aproximación. Repite esto y 'caerá' rápidamente hacia la raíz. Peligro: Si la curva es muy plana (derivada cercana a 0), la tangente se dispara al infinito y el método falla.",
        "Bisección": "La Bisección es como buscar una palabra en un diccionario: abres a la mitad, ves de qué lado está, y descartas la otra mitad. Es un método cerrado, lo que significa que atrapa la raíz en un intervalo [a,b]. Es lento, pero 100% seguro si hay cambio de signo.",
        "Regla Falsa": "Similar a Bisección, pero en lugar de cortar a la mitad, traza una línea recta entre f(a) y f(b). Donde la línea cruza el eje X, ahí hace el nuevo corte. A veces es más rápido que Bisección, a veces se estanca en curvas muy pronunciadas.",
        "Secante": "La Secante es el hermano menor de Newton. No sabe cómo calcular la derivada (tangente exacta), así que toma dos puntos cercanos y traza una línea secante entre ellos para simular la tangente. Es muy eficiente y no requiere derivadas analíticas.",
        "Müller": "Müller utiliza tres puntos de la curva para trazar una parábola (no una recta) e interceptar el eje X. Es extremadamente potente para polinomios e incluso puede encontrar raíces imaginarias.",
        "Taylor": "La Serie de Taylor no busca raíces, sino que transforma una función compleja (como senos o logaritmos) en un polinomio súper fácil de calcular, alrededor de un punto 'a'. Es la base de cómo tu propia calculadora saca resultados. Para obtener el método de Maclaurin, simplemente establece el valor del punto 'a' a 0."
    };
    return texts[method] || "El método iterará utilizando tus parámetros para reducir el error gradualmente hasta encontrar la raíz deseada.";
}

function drawPlotlyChart(container, compiled, intervals, singularities, minRange = -10, maxRange = 10) {
    const xValues = [];
    const yValues = [];
    
    let step = (maxRange - minRange) / 200; // mantener 200 puntos independientemente del rango
    if(step <= 0) step = 0.1;

    for (let x = minRange; x <= maxRange; x += step) {
        let y = null;
        try { 
            let res = compiled.evaluate({x: x}); 
            if (typeof res === 'number' && !isNaN(res)) y = res;
        } catch(e){}
        if(y !== null && isFinite(y) && Math.abs(y) < 100) {
            xValues.push(x);
            yValues.push(y);
        } else {
            xValues.push(x);
            yValues.push(null);
        }
    }

    const trace1 = {
        x: xValues,
        y: yValues,
        mode: 'lines',
        name: 'f(x)',
        line: {color: '#4facfe', width: 3}
    };

    const data = [trace1];

    // Marcar intervalos/raíces
    if (intervals.length > 0) {
        const xRoots = intervals.map(i => (i.a + i.b) / 2);
        const yRoots = xRoots.map(x => 0);
        const traceRoots = {
            x: xRoots,
            y: yRoots,
            mode: 'markers',
            name: 'Posibles Raíces',
            marker: {color: '#ff2a2a', size: 10, symbol: 'circle'}
        };
        data.push(traceRoots);
    }

    const isModern = document.body.classList.contains('theme-modern');
    const txtColor = isModern ? '#1e293b' : '#ffffff';
    const gridColor = isModern ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    const zColor = isModern ? '#94a3b8' : '#ffffff';

    const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: txtColor },
        xaxis: {
            zeroline: true,
            zerolinecolor: zColor,
            zerolinewidth: 2,
            gridcolor: gridColor
        },
        yaxis: {
            zeroline: true,
            zerolinecolor: zColor,
            zerolinewidth: 2,
            gridcolor: gridColor
        },
        margin: {l: 40, r: 20, t: 30, b: 40},
        hovermode: 'closest'
    };

    Plotly.newPlot(container, data, layout, {responsive: true});
}
