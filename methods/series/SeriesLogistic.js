import { latexToMathExpr } from "../utils.js";

function clearFields() {
        let functionDisplay = document.getElementById("functionDisplay");
        let evaluationDisplay = document.getElementById("evaluationDisplay");
        let derivativeDisplay = document.getElementById("derivativeDisplay");
        let serieDisplay = document.getElementById("serieDisplay");
        let comparationDisplay = document.getElementById("comparationDisplay");
        if(functionDisplay) functionDisplay.innerHTML = "";
        if(evaluationDisplay) evaluationDisplay.innerHTML = "";
        if(derivativeDisplay) derivativeDisplay.innerHTML = "";
        if(serieDisplay) serieDisplay.innerHTML = "";
        if(comparationDisplay) comparationDisplay.innerHTML = "";
}

function clearMathContainer() {
    const container = document.getElementById("mathContainer");
    if (container) container.innerHTML = "";
}

function prepareTitle(method, type) {
    const lblTitle = document.createElement("div");
    lblTitle.className = "dashboard-card";
    lblTitle.style.marginBottom = "20px";
    
    const Title = document.createElement("h2");
    Title.className = "math-title";
    Title.style.margin = "0";
    Title.style.color = "var(--primary-color)";

    if (type === "Serie") {
        Title.innerHTML = `<i class="fa-solid fa-wave-square"></i> Serie de ${method}`;
    } else if (type === "Root") {
        Title.innerHTML = `<i class="fa-solid fa-calculator"></i> M§todo de ${method}`;
    }

    lblTitle.appendChild(Title);
    document.getElementById("mathContainer").appendChild(lblTitle);
}



function CalcTaylorLagrangeRest() {
    let previousCalcBox = document.getElementById("TaylorLagrangeRestCalcBx");

    if (previousCalcBox) {
        document.getElementById("mathContainer").removeChild(previousCalcBox);
    }

    let assignmentField = document.getElementById("aInput");
    let assignmentlatex = assignmentField.value;

    let assignmentNode;
    let assignmentValue;

    try {
        assignmentNode = math.parse(latexToMathExpr(assignmentlatex));
        assignmentValue = assignmentNode.evaluate();
    }
    catch (e) {
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (assignmentNode.value === undefined && assignmentNode.name === undefined) {
        alert("Se requiere un valor de sustitución 'a'.");
        return;
    }
    else if (typeof assignmentNode.value !== "number") {
        alert("El valor de sustitución 'a' debe ser de tipo entero o decimal.");
        return;
    }

    let serieField = document.getElementById("functionInput");
    let serielatex = serieField.value;

    if (!serielatex.includes('x')) {
        alert("La expresión debe contener al menos una 'x'...")
        return;
    }

    let serie;

    try {
        serie = math.parse(latexToMathExpr(serielatex));
    }
    catch (e) {
        clearFields();
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    let xField = document.getElementById("xInput");

    let xlatex = xField.value;

    let xValue;
    let xNode;

    try {
        xNode = math.parse(latexToMathExpr(xlatex));
        xValue = xNode.evaluate();
    }
    catch (e) {
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (xNode.value === undefined && xNode.name === undefined) {
        alert("Se requiere un valor para 'x'.");
        return;
    }
    else if (typeof xNode.value !== "number") {
        alert("El valor de 'x' debe ser de tipo entero o decimal.");
        return;
    }

    let derivativesField = document.getElementById("nInput");
    let derivativeslatex = derivativesField.value;

    let derivatives;

    try {
        derivatives = math.parse(latexToMathExpr(derivativeslatex));
    }
    catch (e) {
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (derivatives.value < 1 || derivatives.value === undefined || !(typeof derivatives.value === "number" && Number.isInteger(derivatives.value))) {
        alert("Debe haber al menos una derivada 'n' en la serie y su valor debe ser un número entero.")
        return;
    }

    let epsilonField = document.getElementById("epsilonInput");

    let epsilonlatex = epsilonField.value;

    let epsilonValue;
    let epsilonNode;

    try {
        epsilonNode = math.parse(latexToMathExpr(epsilonlatex));
        epsilonValue = epsilonNode.evaluate();
    }
    catch (e) {
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (epsilonNode.value === undefined && epsilonNode.name === undefined) {
        alert("Se requiere un valor para 'ε'.");
        return;
    }
    else if (typeof epsilonNode.value !== "number") {
        alert("El valor de 'ε' debe ser de tipo entero o decimal.");
        return;
    }

    let lagrangeRest;
    let lagrangeRestResult;


    let serieWithoutConst = serie; // copia
    let coeff = 1;

    if (serie.type === 'OperatorNode' && serie.op === '*') {
        // si es multiplicación, tomamos el nodo que no depende de x
        if (serie.args[0].isConstantNode) {
            coeff = serie.args[0].value;  // 100
            serieWithoutConst = serie.args[1]; // e^x
        }
        else if (serie.args[1].isConstantNode) {
            coeff = serie.args[1].value;
            serieWithoutConst = serie.args[0];
        }
    }

    let nextDerivative = math.derivative(serieWithoutConst, 'x');

    let steps = 100; // Número de puntos para aproximar el máximo
    let M = 0;

    for (let i = 0; i <= steps; i++) {
        let xi = assignmentValue + i * (xValue - assignmentValue) / steps; // Puntos entre a y x
        let val = Math.abs(math.evaluate(String(nextDerivative), { x: xi }));
        if (val > M) M = val;
    }


    lagrangeRest = `${M}*(${math.abs(Number(xValue) - Number(assignmentValue))})^(${Number(derivatives) + 1})/${Number(derivatives) + 1}!`;
    lagrangeRestResult = math.evaluate(lagrangeRest);

    let lagrangeRestResultLatex = document.createElement("p");
    lagrangeRestResultLatex.innerHTML = `R_${derivatives}(${xValue}) = ${lagrangeRestResult}`;
    
    let TaylorResultBox = document.getElementById("TaylorResultBox");
    let taylorResult = TaylorResultBox.innerHTML.replace("Aproximación = ", "");

    let originalFunction = document.createElement("p");
    originalFunction.innerHTML = `Función original = ${Number(lagrangeRestResult) + Number(taylorResult)}`;
    
    const lagrangeRestDisplay = document.createElement("div");
    lagrangeRestDisplay.id = "lagrangeRestDisplay";


    let RealErrorBox = document.getElementById("RealErrorBox");
    let realErrorResult = RealErrorBox.innerHTML.replace("Error Real = ", "");

    let errorLaw = document.createElement("p");

    // Comprobar si la cota cubre el error real
    if (realErrorResult <= lagrangeRestResult) {
        errorLaw.innerHTML = "La cota de Lagrange es válida.";
    } else {
        errorLaw.innerHTML = "La cota de Lagrange no cubre el error.";
    }

    let epsilonLaw = document.createElement("p");

    // Comprobar si cumple la tolerancia
    if (lagrangeRestResult <= epsilonValue) {
        epsilonLaw.innerHTML = "Cumple la tolerancia ε.";
    } else {
        epsilonLaw.innerHTML = "No cumple la tolerancia ε.";
    }

    lagrangeRestDisplay.appendChild(lagrangeRestResultLatex);
    lagrangeRestDisplay.appendChild(errorLaw);
    lagrangeRestDisplay.appendChild(epsilonLaw);
    lagrangeRestDisplay.appendChild(originalFunction);

    const taylorLagrangeRestCalcBox = document.createElement("div");
    taylorLagrangeRestCalcBox.id = "TaylorLagrangeRestCalcBx";

    lagrangeRestDisplay.style.visibility = "visible";
    taylorLagrangeRestCalcBox.appendChild(lagrangeRestDisplay);

    document.getElementById("mathContainer").appendChild(taylorLagrangeRestCalcBox);
}

function loadCalcTaylorLagrangeRest() {
    let lagrangeRestBx = document.getElementById("dynamicLagrangeRest");
    if (lagrangeRestBx) return;

    const txtField = document.createElement("div");
    txtField.className = "txtField";
    txtField.id = "dynamicLagrangeRest";

    const field = document.createElement("div");
    field.className = "Field";
    field.id = "CalcLagrangeRest_Field";


    const form = document.createElement("div");
    form.id = "mathForm_CalcTaylorLagrangeRest"

    const epsilonMathField = document.createElement("math-field");
    epsilonMathField.value = "";
    epsilonMathField.restrict = '0123456789.';
    epsilonMathField.virtualKeyboardLayout = 'numeric';
    epsilonMathField.placeholder = 'Valor\u2008de\u2008(ε)...';
    epsilonMathField.id = "epsilonInput";

    const btnCalcTaylorLagrangeRest = document.createElement("button");
    btnCalcTaylorLagrangeRest.type = "submit";
    btnCalcTaylorLagrangeRest.id = "btnTaylorLagrangeRest";
    btnCalcTaylorLagrangeRest.textContent = "Estimar";
    btnCalcTaylorLagrangeRest.addEventListener("click", () => {
        CalcTaylorLagrangeRest();
    });

    form.appendChild(epsilonMathField);
    form.appendChild(btnCalcTaylorLagrangeRest);

    field.appendChild(form)
    txtField.appendChild(field)

    document.getElementById("mathContainer").appendChild(txtField);
}

;

function CalcTaylor() {
    let derivativeDisplay = document.getElementById("derivativeDisplay");
    let evaluationDisplay = document.getElementById("evaluationDisplay");
    let serieDisplay = document.getElementById("serieDisplay");
    let functionDisplay = document.getElementById("functionDisplay");
    let comparationDisplay = document.getElementById("comparationDisplay");
    let maxErrorDisplay = document.getElementById("maxErrorDisplay");

    function clearFields() {
        functionDisplay.innerHTML = "";
        evaluationDisplay.innerHTML = "";
        derivativeDisplay.innerHTML = "";
        serieDisplay.innerHTML = "";
        comparationDisplay.innerHTML = "";

        functionDisplay.style.visibility = "hidden";
        derivativeDisplay.style.visibility = "hidden";
        evaluationDisplay.style.visibility = "hidden";
        serieDisplay.style.visibility = "hidden";
        comparationDisplay.style.visibility = "hidden";
    }

    clearFields();

    let assignmentField = document.getElementById("aInput");
    let assignmentlatex = assignmentField.value;

    let assignmentNode;
    let assignmentValue;

    try {
        assignmentNode = math.parse(latexToMathExpr(assignmentlatex));
        assignmentValue = assignmentNode.evaluate();
    }
    catch (e) {
        clearFields();
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (assignmentNode.value === undefined && assignmentNode.name === undefined) {
        clearFields();
        alert("Se requiere un valor de sustitución 'a'.");
        return;
    }
    else if (typeof assignmentNode.value !== "number") {
        clearFields();
        alert("El valor de sustitución 'a' debe ser de tipo entero o decimal.");
        return;
    }
    
    let derivativesField = document.getElementById("nInput");
    let derivativeslatex = derivativesField.value;
    let derivatives;

    try {
        derivatives = math.parse(latexToMathExpr(derivativeslatex));
    }
    catch (e) {
        clearFields();
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (derivatives.value < 1 || derivatives.value === undefined || !(typeof derivatives.value === "number" && Number.isInteger(derivatives.value))) {
        clearFields();
        alert("Debe haber al menos una derivada 'n' en la serie y su valor debe ser un número entero.")
        return;
    }

    let latex;

    let serieField = document.getElementById("functionInput");
    let serielatex = serieField.value;

    let serie;

    if (!serielatex.includes('x')) {
        clearFields();
        alert("La expresión debe contener al menos una 'x'...")
        return;
    }

    try {
        serie = math.parse(latexToMathExpr(serielatex));
    }
    catch (e) {
        clearFields();
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    let xField = document.getElementById('xInput');
    let xlatex = xField.value;

    let xValue;
    let xNode;

    try {
        xNode = math.parse(latexToMathExpr(xlatex));
        xValue = xNode.evaluate();
    }
    catch (e) {
        clearFields();
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    if (xNode.value === undefined && xNode.name === undefined) {
        clearFields();
        alert("Se requiere un valor para 'x'.");
        return;
    }
    else if (typeof xNode.value !== "number") {
        clearFields();
        alert("El valor de 'x' debe ser de tipo entero o decimal.");
        return;
    }

    try {
        katex.render(`{f(x)} = ${serielatex}`, functionDisplay);
    }
    catch (e) {
        clearFields();
        alert("SYNTAX ERROR - La expresión escrita no es válida para la calculadora.");
        return;
    }

    let derivative;

    try {
        derivative = math.derivative(serie, 'x');
    }
    catch (e) {
        clearFields();
        alert("MATH ERROR - No es posible derivar la expresión.");
        return;
    }

    let succession = "'";
    latex = `{f${succession}(x)} = ${serie.toTex()} = ${derivative.toTex()}`;

    let derivativeBox = document.createElement("p");

    derivativeBox.innerHTML = latex;
    derivativeDisplay.appendChild(derivativeBox);
    katex.render(latex, derivativeBox);

    let evaluationBox = document.createElement("p");

    let derivativeEvaluation = math.evaluate(String(derivative), { x:assignmentValue });
    latex = `{f${succession}(${assignmentValue})} = ${derivativeEvaluation}`;
    
    evaluationBox.innerHTML = latex;
    evaluationDisplay.appendChild(evaluationBox);
    
    try {
        katex.render(latex, evaluationBox);
    }
    catch (e) {
        functionDisplayError.innerHTML = "SYNTAX ERROR - The expression written is not supported by the calculator.";
        clearFields();
        return;
    }

    let currentIteration = 1; // Mantener la cuenta de las iteraciones

    let TaylorBox = document.createElement("p");
    let TaylorSeries = "";

    // Para mostrar con KaTeX (visual)
    TaylorSeries += `
        f(x) = ${math.evaluate(String(serie), { x: assignmentValue })}
        + \\frac{${derivativeEvaluation} (x-${assignmentValue})^{${currentIteration}}}
            {${currentIteration}!}
    `;
    TaylorBox.innerHTML = TaylorSeries;

    // Para evaluar con Math.js (usando sintaxis válida)
    let TaylorResultBox = document.createElement("p");
    TaylorResultBox.id = "TaylorResultBox";

    let TaylorSeriesEval = "";
    TaylorSeriesEval += `${math.evaluate(String(serie), { x: assignmentValue })} + (${derivativeEvaluation} * pow(x - ${assignmentValue}, ${currentIteration})) / factorial(${currentIteration})`;

    try {
        katex.render(TaylorSeries, TaylorBox);
    }
    catch (e) {
        functionDisplayError.innerHTML = "SYNTAX ERROR - The expression written is not supported by the calculator.";
        clearFields();
        return;
    }

    function generateDerivatives() {
        while (currentIteration < derivatives) {
            // Calculamos la siguiente derivada primero
            derivative = math.derivative(derivative, 'x');
            derivativeEvaluation = math.evaluate(String(derivative), { x: assignmentValue });

            currentIteration++;
            succession += "'";

            // Mostrar derivada
            derivativeBox = document.createElement("p");
            latex = `{f${succession}(x)} = ${derivative.toTex()} = ${derivativeEvaluation}`;
            derivativeBox.innerHTML = latex;
            derivativeDisplay.appendChild(derivativeBox);
            try { katex.render(latex, derivativeBox); } catch (e) { clearFields(); alert("SYNTAX ERROR"); return; }

            // Mostrar evaluación en a
            evaluationBox = document.createElement("p");
            latex = `{f${succession}(${assignmentValue})} = ${derivativeEvaluation}`;
            evaluationBox.innerHTML = latex;
            evaluationDisplay.appendChild(evaluationBox);
            try { katex.render(latex, evaluationBox); } catch (e) { clearFields(); alert("SYNTAX ERROR"); return; }

            // Agregar término a la serie
            TaylorSeries += `+\\frac{${derivativeEvaluation}(x-${assignmentValue})^{${currentIteration}}}{${currentIteration}!}`;
            TaylorSeriesEval += `+(${derivativeEvaluation}*pow(x-${assignmentValue},${currentIteration}))/factorial(${currentIteration})`;
            TaylorBox.innerHTML = TaylorSeries;
            try { katex.render(TaylorSeries, TaylorBox); } catch (e) { clearFields(); alert("SYNTAX ERROR"); return; }
        }
    }

    // Llamar a la función de generación de derivadas
    generateDerivatives();

    let TaylorResult = math.evaluate(TaylorSeriesEval, { x:xValue });
    TaylorResultBox.innerHTML = `Aproximación = ${TaylorResult}`;

    let EvaluationResultBox = document.createElement("p");
    
    let EvaluationResult = math.evaluate(String(serie), { x:xValue });
    EvaluationResultBox.innerHTML = `Calculadora = ${EvaluationResult}`;

    let RealErrorBox = document.createElement("p");
    RealErrorBox.id = "RealErrorBox";
    RealErrorBox.innerHTML = `Error Real = ${Math.abs(EvaluationResult - TaylorResult)}`


    functionDisplay.style.visibility = "visible";
    derivativeDisplay.style.visibility = "visible";
    evaluationDisplay.style.visibility = "visible";
    serieDisplay.style.visibility = "visible";
    comparationDisplay.style.visibility = "visible";

    serieDisplay.appendChild(TaylorBox);
    
    comparationDisplay.appendChild(TaylorResultBox);
    comparationDisplay.appendChild(EvaluationResultBox);
    comparationDisplay.appendChild(RealErrorBox);

    loadCalcTaylorLagrangeRest();
}

export function loadCalcTaylor() {
    clearMathContainer();
    prepareTitle("Taylor", "Serie");

    let previousform = document.getElementById("mathForm_CalcMac");
    let previousCalcBx = document.getElementById("MacCalcBx")

    if (previousform !== null && previousCalcBx !== null) {
        let mathContainer = document.getElementById("mathContainer");
        let calcBx = document.getElementById("Calc_Field");

        let lagrangeRestBx = document.getElementById("dynamicLagrangeRest");
        let MacLagrangeRestCalcBx = document.getElementById("MacLagrangeRestCalcBx");

        if (lagrangeRestBx) {
            mathContainer.removeChild(lagrangeRestBx);
        }

        if (MacLagrangeRestCalcBx) {
            mathContainer.removeChild(MacLagrangeRestCalcBx);
        }

        mathContainer.removeChild(previousCalcBx);
        calcBx.removeChild(previousform);
    }

    if (document.getElementById("mathForm_CalcTaylor")) {
        return;
    }

    const form = document.createElement("div");
    form.id = "mathForm_CalcTaylor";

    const aMathField = document.createElement("math-field");
    aMathField.value = "";
    aMathField.restrict = '0123456789.';
    aMathField.virtualKeyboardLayout = 'numeric';
    aMathField.placeholder = 'Valor\u2008de\u2008Sustitución\u2008(a)\u2008[Coloca\u20080\u2008aquí\u2008para\u2008Maclaurin]...';
    aMathField.id = "aInput";

    const nMathField = document.createElement("math-field");
    nMathField.value = "";
    nMathField.restrict = '0123456789';
    nMathField.virtualKeyboardLayout = 'numeric';
    nMathField.placeholder = 'Cantidad\u2008de\u2008Derivadas\u2008a\u2008Calcular...';
    nMathField.id = "nInput";

    const iMathField = document.createElement("math-field");
    iMathField.value = "";
    iMathField.placeholder = 'Expresión\u2008Matemática...';
    iMathField.id = "functionInput";

    const xMathField = document.createElement("math-field");
    xMathField.value = "";
    xMathField.restrict = '0123456789.';
    xMathField.virtualKeyboardLayout = 'numeric';
    xMathField.placeholder = 'Valor\u2008de\u2008(x)...';
    xMathField.id = "xInput";

    const btnCalcTaylor = document.createElement("button");
    btnCalcTaylor.type = "submit";
    btnCalcTaylor.id = "btnTaylor";
    btnCalcTaylor.textContent = "Calcular";
    btnCalcTaylor.addEventListener("click", () => {
        CalcTaylor();
    });

    form.appendChild(aMathField);
    form.appendChild(nMathField);
    form.appendChild(iMathField);
    form.appendChild(xMathField);
    form.appendChild(btnCalcTaylor);

    const calcBox = document.createElement("div");
    calcBox.id = "TaylorCalcBx";

    const functionDisplay = document.createElement("div");
    functionDisplay.id = "functionDisplay";

    const derivativeDisplay = document.createElement("div");
    derivativeDisplay.id = "derivativeDisplay";

    const evaluationDisplay = document.createElement("div");
    evaluationDisplay.id = "evaluationDisplay";

    const serieDisplay = document.createElement("div");
    serieDisplay.id = "serieDisplay";

    const comparationDisplay = document.createElement("div");
    comparationDisplay.id = "comparationDisplay";

    calcBox.appendChild(functionDisplay);
    calcBox.appendChild(derivativeDisplay);
    calcBox.appendChild(evaluationDisplay);
    calcBox.appendChild(serieDisplay);
    calcBox.appendChild(comparationDisplay);

    // CONTENEDOR PARA LAS OPERACIONES //
    const Field = document.createElement("div");
    Field.className = "Field";
    Field.id = "Calc_Field";
    // =============================== //


    // CONTENEDOR PADRE //
    const txtField = document.createElement("div");;
    txtField.className = "txtField";
    // ================ //

    Field.appendChild(form);

    // INSERCI§ N DE CONTENEDORES DE PANELES //
    txtField.appendChild(Field);
    // ==================================== //


    document.getElementById("mathContainer").appendChild(txtField);
    document.getElementById("mathContainer").appendChild(calcBox);
}

function loadSeriesStyle() {
    let Title = document.getElementById("Title");
    Title.style.innerHTML = "Calculadora de Series";
    
    let lblTitle = document.getElementById("lblTitle");
    lblTitle.style.visibility = "visible";
}
