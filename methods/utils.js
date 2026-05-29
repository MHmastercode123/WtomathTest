// Módulo de utilidades matemáticas y de conversión compartido por los métodos numéricos

/**
 * Evalúa una función matemática compilada por math.js en un valor X dado y
 * determina si el resultado es menor que cero.
 * @param {Object} mathFunction - Objeto de función/expresión compilado de math.js o nerdamer
 * @param {number} xValue - Valor en el cual evaluar f(x)
 * @returns {Object} Objeto con el resultado y un booleano indicando si es menor que 0
 */
export function evaluateFunction(mathFunction, xValue) {
    let result = mathFunction.evaluate({ x: xValue });
    let lessThanZero = result < 0;

    return {
        lessThanZero,
        result
    };
}

/**
 * Convierte una expresión en formato LaTeX a una expresión matemática compatible con math.js/nerdamer.
 * @param {string} latex - Expresión en LaTeX
 * @returns {string} Expresión matemática formateada
 */
export function latexToMathExpr(latex) {
    let expr = latex
        // 1. Limpiar espacios y saltos
        .replace(/\n/g, '')
        .replace(/\s+/g, '');

    // Convert curly brace superscripts to parentheses and replace unicode minus
    expr = expr.replace(/\^{([^}]*)}/g, '^($1)').replace(/−/g, '-');

    // Eliminar f(x)=, P(x)=, y=, etc. o convertir A=B a (A)-(B)
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

    return expr
        // 2. Eliminar left/right
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')

        // 3. Normalizar funciones SIN backslash primero (IMPORTANTE)
        .replace(/\bln\b/g, 'log')
        .replace(/\blog\b/g, 'log')
        .replace(/\bsin\b/g, 'sin')
        .replace(/\bcos\b/g, 'cos')
        .replace(/\btan\b/g, 'tan')
        .replace(/\bexp\b/g, 'exp')

        // 4. Proteger funciones con backslash
        .replace(/\\sin/g, '§sin')
        .replace(/\\cos/g, '§cos')
        .replace(/\\tan/g, '§tan')
        .replace(/\\sec/g, '§sec')
        .replace(/\\csc/g, '§csc')
        .replace(/\\cot/g, '§cot')
        .replace(/\\log/g, '§log')
        .replace(/\\ln/g, '§log')
        .replace(/\\exp/g, '§exp')

        // 5. Log con base
        .replace(/\\log_\{([^}]*)\}\(([^)]*)\)/g, 'log($2,$1)')
        .replace(/\\log_\{([^}]*)\}\{([^}]*)\}/g, 'log($2,$1)')
        .replace(/\\log_([0-9a-zA-Z]+)\(([^)]*)\)/g, 'log($2,$1)')

        // 6. Fracciones
        .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)')

        // 7. Raíces
        .replace(/\\sqrt{([^}]*)}/g, 'sqrt($1)')

        // 8. Factorial
        .replace(/([0-9]+)!/g, 'factorial($1)')

        // 9. Constantes
        .replace(/\\pi/g, 'pi')

        // 10. Euler (e^x)
        .replace(/e\^{([^}]*)}/g, 'exp($1)')
        .replace(/e\^\(([^)]+)\)/g, 'exp($1)')
        .replace(/e\^([\-\+]?[a-zA-Z0-9\.]+)/g, 'exp($1)')
        .replace(/§exp\(([^)]*)\)/g, 'exp($1)')

        // 11. Potencias (más seguras)
        .replace(/([a-zA-Z0-9\)\]])\^{([^}]*)}/g, 'pow($1,$2)')
        .replace(/([a-zA-Z0-9\)\]])\^([a-zA-Z0-9]+)/g, 'pow($1,$2)')

        // 12. Operadores
        .replace(/\\cdot/g, '*')
        .replace(/\\times/g, '*')
        .replace(/\\div/g, '/')

        // 13. Restaurar funciones
        .replace(/§/g, '');
}

/**
 * Convierte una expresión en formato LaTeX a una ecuación limpia.
 * @param {string} expr - Expresión en LaTeX
 * @returns {string} Ecuación matemática normalizada
 */
export function latexToMathEquation(expr) {
    return expr
        .replace(/\\frac{([^}]*)}{([^}]*)}/g, '($1)/($2)') // fracciones
        .replace(/\\left|\\right/g, '') // quitar left/right
        .replace(/\\/g, '') // quitar \ restantes
        .trim();
}
