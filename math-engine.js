/**
 * math-engine.js
 * Core mathematical engine for Gamma and Beta function computation
 * with step-by-step solution generation.
 */

const MathEngine = (() => {
  // ========================
  // Utility: Parse user input
  // ========================
  // Safe arithmetic expression evaluator (no eval)
  function safeEvalExpr(expr) {
    expr = expr.replace(/\s/g, '');
    // Only allow digits, +, -, *, /, (, ), .
    if (!/^[\d+\-*/().]+$/.test(expr)) return NaN;
    try {
      // Use Function constructor (safer than eval, no access to scope)
      const result = new Function('return (' + expr + ')')();
      if (typeof result === 'number' && isFinite(result)) return result;
      return NaN;
    } catch (e) {
      return NaN;
    }
  }

  function parseInput(str) {
    str = str.trim();
    if (str === '') return null;

    // Handle fractions like 1/2, -3/2, 5/2
    const fracMatch = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (fracMatch) {
      const num = parseInt(fracMatch[1], 10);
      const den = parseInt(fracMatch[2], 10);
      if (den === 0) return null;
      return { value: num / den, num, den, isFraction: true, original: str };
    }

    // Handle decimals and integers
    let val = parseFloat(str);

    // If parseFloat fails, try evaluating as arithmetic expression (e.g. "3-1", "5+2", "4*2")
    if (isNaN(val)) {
      val = safeEvalExpr(str);
      if (isNaN(val)) return null;
    }

    // Check if it's secretly a nice fraction
    if (Number.isInteger(val)) {
      return { value: val, num: val, den: 1, isFraction: false, isInteger: true, original: str };
    }

    // Check common decimal fractions
    const knownFracs = [
      [0.5, 1, 2], [-0.5, -1, 2], [1.5, 3, 2], [-1.5, -3, 2],
      [2.5, 5, 2], [-2.5, -5, 2], [3.5, 7, 2], [0.25, 1, 4],
      [0.75, 3, 4], [1.25, 5, 4], [1.75, 7, 4],
      [0.333333, 1, 3], [0.666667, 2, 3], [1.333333, 4, 3],
    ];

    for (const [dec, n, d] of knownFracs) {
      if (Math.abs(val - dec) < 1e-4) {
        return { value: val, num: n, den: d, isFraction: true, original: str };
      }
    }

    return { value: val, num: val, den: 1, isFraction: false, isInteger: false, original: str };
  }

  // ========================
  // Format numbers nicely
  // ========================
  function formatNum(parsed) {
    if (!parsed) return '?';
    if (parsed.isFraction) return `\\frac{${parsed.num}}{${parsed.den}}`;
    if (parsed.isInteger) return String(parsed.value);
    return String(Math.round(parsed.value * 1e8) / 1e8);
  }

  function formatVal(v) {
    if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < 1e-10) return String(Math.round(v));
    // Check for common fractions
    const fracs = [
      [1/2, '\\frac{1}{2}'], [1/3, '\\frac{1}{3}'], [2/3, '\\frac{2}{3}'],
      [1/4, '\\frac{1}{4}'], [3/4, '\\frac{3}{4}'], [1/6, '\\frac{1}{6}'],
      [5/6, '\\frac{5}{6}'], [3/2, '\\frac{3}{2}'], [5/2, '\\frac{5}{2}'],
      [7/2, '\\frac{7}{2}'], [4/3, '\\frac{4}{3}'], [5/3, '\\frac{5}{3}'],
    ];
    for (const [fv, fs] of fracs) {
      if (Math.abs(v - fv) < 1e-8) return fs;
    }
    return String(Math.round(v * 1e8) / 1e8);
  }

  // ========================
  // Gamma function computation (Lanczos)
  // ========================
  function gammaLanczos(z) {
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * gammaLanczos(1 - z));
    }
    z -= 1;
    const g = 7;
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  // ========================
  // Check for known exact values
  // ========================
  function knownGammaExact(n) {
    // Positive integers: Γ(n) = (n-1)!
    if (Number.isInteger(n) && n > 0 && n <= 20) {
      return { value: factorial(n - 1), latex: `${factorial(n - 1)}`, isFactorial: true };
    }

    // Half-integers
    const halfInts = {
      0.5: { value: Math.sqrt(Math.PI), latex: '\\sqrt{\\pi}' },
      1.5: { value: Math.sqrt(Math.PI) / 2, latex: '\\frac{\\sqrt{\\pi}}{2}' },
      2.5: { value: 3 * Math.sqrt(Math.PI) / 4, latex: '\\frac{3\\sqrt{\\pi}}{4}' },
      3.5: { value: 15 * Math.sqrt(Math.PI) / 8, latex: '\\frac{15\\sqrt{\\pi}}{8}' },
      4.5: { value: 105 * Math.sqrt(Math.PI) / 16, latex: '\\frac{105\\sqrt{\\pi}}{16}' },
      '-0.5': { value: -2 * Math.sqrt(Math.PI), latex: '-2\\sqrt{\\pi}' },
      '-1.5': { value: 4 * Math.sqrt(Math.PI) / 3, latex: '\\frac{4\\sqrt{\\pi}}{3}' },
      '-2.5': { value: -8 * Math.sqrt(Math.PI) / 15, latex: '\\frac{-8\\sqrt{\\pi}}{15}' },
    };

    const key = String(n);
    if (halfInts[key]) return halfInts[key];

    return null;
  }

  // ========================
  // SOLVE: Gamma Function Γ(n)
  // ========================
  function solveGamma(inputStr) {
    const parsed = parseInput(inputStr);
    if (!parsed) return { error: 'Invalid input. Please enter a number like 5, 1/2, or 3.5' };

    const n = parsed.value;
    const nLatex = formatNum(parsed);
    const steps = [];

    // Step 1: Identify
    steps.push({
      title: 'Identify the Problem',
      content: `We need to evaluate:`,
      math: `\\Gamma\\left(${nLatex}\\right)`
    });

    // Check for non-positive integers (poles)
    if (Number.isInteger(n) && n <= 0) {
      steps.push({
        title: 'Result',
        content: `Γ(n) is undefined for non-positive integers (n = 0, −1, −2, …). These are poles of the Gamma function.`,
        math: `\\Gamma(${n}) = \\text{undefined (pole)}`
      });
      return { steps, error: null, final: '\\text{Undefined}' };
    }

    // Step 2: Recall definition
    steps.push({
      title: 'Recall the Definition',
      content: `The Gamma function is defined as:`,
      math: `\\Gamma(n) = \\int_0^{\\infty} t^{n-1} e^{-t}\\, dt \\quad \\text{for } n > 0`
    });

    // Case: positive integer
    if (Number.isInteger(n) && n > 0) {
      steps.push({
        title: 'Apply the Factorial Property',
        content: `For positive integers, we have the fundamental property:`,
        math: `\\Gamma(n) = (n-1)!`
      });

      steps.push({
        title: 'Substitute the Value',
        content: `Substituting n = ${n}:`,
        math: `\\Gamma(${n}) = (${n} - 1)! = ${n - 1}!`
      });

      const result = factorial(n - 1);
      if (n - 1 > 1) {
        const factExpansion = [];
        for (let i = n - 1; i >= 1; i--) factExpansion.push(i);
        steps.push({
          title: 'Compute the Factorial',
          content: `Expanding ${n - 1}!:`,
          math: `${n - 1}! = ${factExpansion.join(' \\times ')} = ${result}`
        });
      }

      steps.push({
        title: 'Final Answer',
        content: '',
        math: `\\boxed{\\Gamma(${n}) = ${result}}`,
        isFinal: true
      });

      return { steps, error: null, final: `\\Gamma(${n}) = ${result}`, numericValue: result };
    }

    // Case: half-integer (positive)
    if (parsed.isFraction && parsed.den === 2 && n > 0) {
      steps.push({
        title: 'Identify as Half-Integer',
        content: `Since n = ${nLatex} is a half-integer, we use the recurrence relation repeatedly to reduce to Γ(1/2).`,
        math: `\\Gamma(n) = (n-1) \\cdot \\Gamma(n-1)`
      });

      // Build the chain
      let current = n;
      const chain = [];
      while (current > 1) {
        current -= 1;
        chain.push(formatVal(current));
      }

      if (chain.length > 0) {
        let expr = `\\Gamma\\left(${nLatex}\\right) = `;
        let temp = n;
        const factors = [];
        while (temp > 1) {
          factors.push(formatVal(temp - 1));
          temp -= 1;
        }
        expr += factors.map(f => `${f}`).join(' \\cdot ') + ` \\cdot \\Gamma\\left(\\frac{1}{2}\\right)`;

        steps.push({
          title: 'Apply Recurrence Relation',
          content: `Using Γ(n) = (n−1)·Γ(n−1) repeatedly:`,
          math: expr
        });
      }

      // Γ(1/2) = √π
      steps.push({
        title: 'Use the Known Value',
        content: `We know the famous result:`,
        math: `\\Gamma\\left(\\frac{1}{2}\\right) = \\sqrt{\\pi}`
      });

      const exact = knownGammaExact(n);
      if (exact) {
        steps.push({
          title: 'Compute the Product',
          content: `Multiplying all the factors together:`,
          math: `\\Gamma\\left(${nLatex}\\right) = ${exact.latex}`
        });

        steps.push({
          title: 'Numerical Value',
          content: `Approximately:`,
          math: `\\Gamma\\left(${nLatex}\\right) \\approx ${exact.value.toFixed(6)}`
        });

        steps.push({
          title: 'Final Answer',
          content: '',
          math: `\\boxed{\\Gamma\\left(${nLatex}\\right) = ${exact.latex} \\approx ${exact.value.toFixed(6)}}`,
          isFinal: true
        });

        return { steps, error: null, final: `\\Gamma\\left(${nLatex}\\right) = ${exact.latex}`, numericValue: exact.value };
      }
    }

    // Case: negative half-integer
    if (parsed.isFraction && parsed.den === 2 && n < 0) {
      steps.push({
        title: 'Apply the Reflection/Recurrence Formula',
        content: `For negative arguments, we use the recurrence relation in reverse:`,
        math: `\\Gamma(n) = \\frac{\\Gamma(n+1)}{n}`
      });

      let current = n;
      const chainSteps = [];
      while (current < 0.5) {
        chainSteps.push({ from: current, to: current + 1 });
        current += 1;
      }

      let expr = `\\Gamma\\left(${nLatex}\\right)`;
      for (const cs of chainSteps) {
        expr += ` = \\frac{\\Gamma\\left(${formatVal(cs.to)}\\right)}{${formatVal(cs.from)}}`;
      }

      steps.push({
        title: 'Repeatedly Apply the Recurrence',
        content: `Applying the recurrence until we reach a positive argument:`,
        math: expr
      });

      const posVal = current;
      const posExact = knownGammaExact(posVal);
      if (posExact) {
        steps.push({
          title: 'Evaluate the Positive Gamma Value',
          content: `We know:`,
          math: `\\Gamma\\left(${formatVal(posVal)}\\right) = ${posExact.latex}`
        });
      }

      const exact = knownGammaExact(n);
      const numVal = gammaLanczos(n);

      steps.push({
        title: 'Compute the Final Value',
        content: `Dividing through:`,
        math: `\\Gamma\\left(${nLatex}\\right) = ${exact ? exact.latex : numVal.toFixed(6)}`
      });

      steps.push({
        title: 'Numerical Value',
        content: '',
        math: `\\Gamma\\left(${nLatex}\\right) \\approx ${numVal.toFixed(6)}`
      });

      steps.push({
        title: 'Final Answer',
        content: '',
        math: `\\boxed{\\Gamma\\left(${nLatex}\\right) ${exact ? '= ' + exact.latex + ' ' : ''}\\approx ${numVal.toFixed(6)}}`,
        isFinal: true
      });

      return { steps, error: null, final: `\\Gamma\\left(${nLatex}\\right) \\approx ${numVal.toFixed(6)}`, numericValue: numVal };
    }

    // General case
    const numVal = gammaLanczos(n);
    if (isNaN(numVal) || !isFinite(numVal)) {
      steps.push({
        title: 'Result',
        content: `The Gamma function is not defined for this value.`,
        math: `\\Gamma\\left(${nLatex}\\right) = \\text{undefined}`
      });
      return { steps, error: null, final: '\\text{Undefined}' };
    }

    steps.push({
      title: 'Compute Using the Lanczos Approximation',
      content: `For general real values, we use the Lanczos numerical approximation of the Gamma function:`,
      math: `\\Gamma\\left(${nLatex}\\right) \\approx ${numVal.toFixed(8)}`
    });

    steps.push({
      title: 'Final Answer',
      content: '',
      math: `\\boxed{\\Gamma\\left(${nLatex}\\right) \\approx ${numVal.toFixed(6)}}`,
      isFinal: true
    });

    return { steps, error: null, final: `\\Gamma\\left(${nLatex}\\right) \\approx ${numVal.toFixed(6)}`, numericValue: numVal };
  }

  // ========================
  // SOLVE: Beta Function B(x, y)
  // ========================
  function solveBeta(inputX, inputY) {
    const px = parseInput(inputX);
    const py = parseInput(inputY);

    if (!px) return { error: 'Invalid input for x.' };
    if (!py) return { error: 'Invalid input for y.' };

    const x = px.value;
    const y = py.value;
    const xLatex = formatNum(px);
    const yLatex = formatNum(py);

    if (x <= 0 || y <= 0) {
      return { error: 'Both x and y must be positive for the Beta function.' };
    }

    const steps = [];

    // Step 1
    steps.push({
      title: 'Identify the Problem',
      content: `We need to evaluate:`,
      math: `B\\left(${xLatex},\\, ${yLatex}\\right)`
    });

    // Step 2: Definition
    steps.push({
      title: 'Recall the Integral Definition',
      content: `The Beta function is defined as:`,
      math: `B(x, y) = \\int_0^1 t^{x-1}(1-t)^{y-1}\\, dt`
    });

    // Step 3: Gamma relationship
    steps.push({
      title: 'Use the Gamma Function Relationship',
      content: `The Beta function can be expressed in terms of Gamma functions:`,
      math: `B(x, y) = \\frac{\\Gamma(x) \\cdot \\Gamma(y)}{\\Gamma(x + y)}`
    });

    // Step 4: Substitute
    const xySum = x + y;
    steps.push({
      title: 'Substitute Values',
      content: `Plugging in x = ${xLatex} and y = ${yLatex}:`,
      math: `B\\left(${xLatex},\\, ${yLatex}\\right) = \\frac{\\Gamma\\left(${xLatex}\\right) \\cdot \\Gamma\\left(${yLatex}\\right)}{\\Gamma\\left(${formatVal(xySum)}\\right)}`
    });

    // Step 5: Evaluate each Gamma
    const gammaX = gammaLanczos(x);
    const gammaY = gammaLanczos(y);
    const gammaXY = gammaLanczos(xySum);

    const exactX = knownGammaExact(x);
    const exactY = knownGammaExact(y);
    const exactXY = knownGammaExact(xySum);

    const gxStr = exactX ? exactX.latex : gammaX.toFixed(6);
    const gyStr = exactY ? exactY.latex : gammaY.toFixed(6);
    const gxyStr = exactXY ? exactXY.latex : gammaXY.toFixed(6);

    steps.push({
      title: `Evaluate Γ(${xLatex})`,
      content: `Computing:`,
      math: `\\Gamma\\left(${xLatex}\\right) = ${gxStr}${exactX ? ' \\approx ' + gammaX.toFixed(6) : ''}`
    });

    steps.push({
      title: `Evaluate Γ(${yLatex})`,
      content: `Computing:`,
      math: `\\Gamma\\left(${yLatex}\\right) = ${gyStr}${exactY ? ' \\approx ' + gammaY.toFixed(6) : ''}`
    });

    steps.push({
      title: `Evaluate Γ(${formatVal(xySum)})`,
      content: `Computing:`,
      math: `\\Gamma\\left(${formatVal(xySum)}\\right) = ${gxyStr}${exactXY ? ' \\approx ' + gammaXY.toFixed(6) : ''}`
    });

    // Step 6: Compute the result
    const betaVal = gammaX * gammaY / gammaXY;

    // Try to find exact form
    let exactBeta = null;
    if (exactX && exactY && exactXY) {
      // For integer cases: B(x,y) = (x-1)!(y-1)!/(x+y-1)!
      if (Number.isInteger(x) && Number.isInteger(y) && x > 0 && y > 0) {
        const num = factorial(x - 1) * factorial(y - 1);
        const den = factorial(x + y - 1);
        // Simplify
        const g = gcd(num, den);
        if (g === den) {
          exactBeta = `${num / den}`;
        } else {
          exactBeta = `\\frac{${num / g}}{${den / g}}`;
        }
      }
    }

    steps.push({
      title: 'Compute the Result',
      content: `Putting it all together:`,
      math: `B\\left(${xLatex},\\, ${yLatex}\\right) = \\frac{${gxStr} \\cdot ${gyStr}}{${gxyStr}} ${exactBeta ? '= ' + exactBeta : ''}\\approx ${betaVal.toFixed(6)}`
    });

    // For integer case, show factorial form too
    if (Number.isInteger(x) && Number.isInteger(y) && x > 0 && y > 0) {
      steps.push({
        title: 'Alternative: Factorial Formula',
        content: `For positive integers, we can also use:`,
        math: `B(${x}, ${y}) = \\frac{(${x}-1)!\\,(${y}-1)!}{(${x}+${y}-1)!} = \\frac{${factorial(x-1)} \\times ${factorial(y-1)}}{${factorial(x+y-1)}} = ${exactBeta || betaVal.toFixed(6)}`
      });
    }

    const finalStr = exactBeta ? `B\\left(${xLatex},\\, ${yLatex}\\right) = ${exactBeta} \\approx ${betaVal.toFixed(6)}` : `B\\left(${xLatex},\\, ${yLatex}\\right) \\approx ${betaVal.toFixed(6)}`;

    steps.push({
      title: 'Final Answer',
      content: '',
      math: `\\boxed{${finalStr}}`,
      isFinal: true
    });

    return { steps, error: null, final: finalStr, numericValue: betaVal };
  }

  // ========================
  // SOLVE: Gamma Integral ∫₀^∞ x^a · e^(-b·x^c) dx
  // ========================
  function solveGammaIntTemplate(aStr, bStr, cStr) {
    const pa=parseInput(aStr), pb=parseInput(bStr), pc=parseInput(cStr);
    if(!pa) return {error:'Invalid A. Please enter a number (e.g. 2, -1/2, 0.5), not a variable name.'};
    if(!pb) return {error:'Invalid B. Please enter a number (e.g. 1, 3/2), not a variable name.'};
    if(!pc) return {error:'Invalid C. Please enter a number (e.g. 2, 1/2), not a variable name.'};
    const a=pa.value, b=pb.value, c=pc.value;
    const aL=formatNum(pa), bL=formatNum(pb), cL=formatNum(pc);
    if(c<=0) return {error:'C must be positive.'};
    if(b<=0) return {error:'B must be positive.'};
    if((a+1)/c<=0) return {error:'(A+1)/C must be positive for the Gamma function to converge.'};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'We need to evaluate:',math:`\\int_0^{\\infty} x^{${aL}} \\cdot e^{-${bL} \\cdot x^{${cL}}}\\, dx`});
    steps.push({title:'Apply Substitution',content:`Let t = ${bL} · x^${cL}`,math:`t = ${bL} \\cdot x^{${cL}}, \\quad x = \\left(\\frac{t}{${bL}}\\right)^{1/${cL}}, \\quad dx = \\frac{1}{${cL} \\cdot ${bL}^{1/${cL}}} \\cdot t^{\\frac{1}{${cL}}-1}\\, dt`});
    const gammaArg = (a+1)/c;
    const coeff_exp = (a+1)/c;
    steps.push({title:'Transform the Integral',content:'After substitution, the integral becomes:',math:`= \\frac{1}{${cL} \\cdot ${bL}^{${formatVal(coeff_exp)}}} \\int_0^{\\infty} t^{${formatVal(gammaArg)}-1} \\cdot e^{-t}\\, dt`});
    steps.push({title:'Recognize the Gamma Function',content:'The integral is now in the standard Gamma form:',math:`= \\frac{1}{${cL} \\cdot ${bL}^{${formatVal(coeff_exp)}}} \\cdot \\Gamma\\left(${formatVal(gammaArg)}\\right)`});
    const gVal=gammaLanczos(gammaArg);
    const exact=knownGammaExact(gammaArg);
    const gStr=exact?exact.latex:gVal.toFixed(6);
    steps.push({title:`Evaluate Γ(${formatVal(gammaArg)})`,content:'Computing:',math:`\\Gamma\\left(${formatVal(gammaArg)}\\right) = ${gStr}${exact?' \\approx '+gVal.toFixed(6):''}`});
    const denom = c * Math.pow(b, coeff_exp);
    const result = gVal / denom;
    steps.push({title:'Compute the Result',content:'Putting it all together:',math:`= \\frac{${gStr}}{${cL} \\cdot ${bL}^{${formatVal(coeff_exp)}}} = \\frac{${gStr}}{${formatVal(denom)}} \\approx ${result.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\int_0^{\\infty} x^{${aL}} e^{-${bL} x^{${cL}}} dx = \\frac{\\Gamma\\left(${formatVal(gammaArg)}\\right)}{${cL} \\cdot ${bL}^{${formatVal(coeff_exp)}}} \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps, error:null, final:`\\approx ${result.toFixed(6)}`, numericValue:result};
  }

  // Log-type: ∫₀¹ x^a · [log(1/x)]^b dx
  function solveGammaLogInt(aStr, bStr) {
    const pa=parseInput(aStr), pb=parseInput(bStr);
    if(!pa) return {error:'Invalid A. Please enter a number (e.g. 2, -1/2, 0.5), not a variable name.'};
    if(!pb) return {error:'Invalid B. Please enter a number (e.g. 3, 1/2, 0), not a variable name. If your question says B = n−1, first calculate the value of n−1 and enter that number.'};
    const a=pa.value, b=pb.value;
    const aL=formatNum(pa), bL=formatNum(pb);
    if(a+1<=0) return {error:'A must satisfy A > −1 (so that A+1 > 0 for convergence).'};
    if(b+1<=0) return {error:'B must satisfy B > −1 (so that Γ(B+1) is defined).'};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'We need to evaluate:',math:`\\int_0^1 x^{${aL}} \\left[\\log\\frac{1}{x}\\right]^{${bL}} dx`});
    steps.push({title:'Apply Substitution',content:'Let t = log(1/x), so x = e^(−t), dx = −e^(−t) dt. When x=0, t=∞; when x=1, t=0.',math:`= \\int_0^{\\infty} e^{-${formatVal(a+1)}t} \\cdot t^{${bL}}\\, dt`});
    steps.push({title:'Second Substitution',content:`Let u = ${formatVal(a+1)} · t:`,math:`= \\frac{1}{${formatVal(a+1)}^{${formatVal(b+1)}}} \\int_0^{\\infty} u^{${bL}} e^{-u}\\, du = \\frac{\\Gamma(${formatVal(b+1)})}{${formatVal(a+1)}^{${formatVal(b+1)}}}`});
    const gArg=b+1, denom=Math.pow(a+1,b+1);
    const gVal=gammaLanczos(gArg);
    const exact=knownGammaExact(gArg);
    const gStr=exact?exact.latex:gVal.toFixed(6);
    steps.push({title:`Evaluate Γ(${formatVal(gArg)})`,content:'',math:`\\Gamma(${formatVal(gArg)}) = ${gStr}`});
    const result=gVal/denom;
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\int_0^1 x^{${aL}} \\left[\\log\\frac{1}{x}\\right]^{${bL}} dx = \\frac{${gStr}}{${formatVal(denom)}} \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // ========================
  // SOLVE: Beta Integral Templates
  // ========================
  // ∫₀¹ x^a(1-x^n)^b dx
  function solveBetaIntPower(aStr, nStr, bStr) {
    const pa=parseInput(aStr),pn=parseInput(nStr),pb=parseInput(bStr);
    if(!pa) return {error:'Invalid A. Please enter a number (e.g. 3, 1/2), not a variable name like "m". If your question says A = m−1, first calculate m−1 and enter that number.'};
    if(!pn) return {error:'Invalid N. Please enter a number (e.g. 2, 1), not a variable name.'};
    if(!pb) return {error:'Invalid B. Please enter a number (e.g. 1/2, 0), not a variable name. If your question says B = n−1, first calculate n−1 and enter that number.'};
    const a=pa.value,n=pn.value,b=pb.value;
    const aL=formatNum(pa),nL=formatNum(pn),bL=formatNum(pb);
    if(n<=0) return {error:'N must be positive.'};
    const p=(a+1)/n, q=b+1;
    if(p<=0) return {error:`(A+1)/N = ${p.toFixed(4)} must be positive. Check your values of A and N.`};
    if(q<=0) return {error:`B+1 = ${q.toFixed(4)} must be positive. B must be greater than −1.`};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'',math:`\\int_0^1 x^{${aL}}(1-x^{${nL}})^{${bL}}\\, dx`});
    steps.push({title:'Substitution',content:`Let t = x^${nL}, so x = t^(1/${nL})`,math:`= \\frac{1}{${nL}} \\int_0^1 t^{\\frac{${aL}+1}{${nL}}-1}(1-t)^{${bL}}\\, dt`});
    steps.push({title:'Recognize Beta Form',content:'This is the Beta function:',math:`= \\frac{1}{${nL}} \\cdot B\\left(${formatVal(p)},\\, ${formatVal(q)}\\right)`});
    const bv=gammaLanczos(p)*gammaLanczos(q)/gammaLanczos(p+q);
    const result=bv/n;
    steps.push({title:'Evaluate',content:`B(${formatVal(p)}, ${formatVal(q)}) using Gamma:`,math:`B\\left(${formatVal(p)}, ${formatVal(q)}\\right) = \\frac{\\Gamma(${formatVal(p)})\\Gamma(${formatVal(q)})}{\\Gamma(${formatVal(p+q)})} \\approx ${bv.toFixed(6)}, \\quad \\text{Result} = \\frac{${bv.toFixed(6)}}{${nL}} \\approx ${result.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\frac{1}{${nL}} B\\left(${formatVal(p)},${formatVal(q)}\\right) \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // ∫₀^A x^m(A-x)^n dx
  function solveBetaIntRange(mStr,nStr,AStr) {
    const pm=parseInput(mStr),pn=parseInput(nStr),pA=parseInput(AStr);
    if(!pm) return {error:'Invalid M. Please enter a number (e.g. 3, 1/2), not a variable name.'};
    if(!pn) return {error:'Invalid N. Please enter a number (e.g. 1/2, 2), not a variable name.'};
    if(!pA) return {error:'Invalid A. Please enter a number (e.g. 2, 1).'};
    const m=pm.value,n=pn.value,A=pA.value;
    const mL=formatNum(pm),nL=formatNum(pn),AL=formatNum(pA);
    const steps=[];
    steps.push({title:'Identify the Integral',content:'',math:`\\int_0^{${AL}} x^{${mL}}(${AL}-x)^{${nL}}\\, dx`});
    steps.push({title:'Substitution',content:`Let x = ${AL}·t, dx = ${AL} dt:`,math:`= ${AL}^{${formatVal(m+n+1)}} \\int_0^1 t^{${mL}}(1-t)^{${nL}}\\, dt`});
    steps.push({title:'Beta Form',content:'',math:`= ${AL}^{${formatVal(m+n+1)}} \\cdot B(${formatVal(m+1)},\\, ${formatVal(n+1)})`});
    const bv=gammaLanczos(m+1)*gammaLanczos(n+1)/gammaLanczos(m+n+2);
    const coeff=Math.pow(A,m+n+1);
    const result=coeff*bv;
    steps.push({title:'Evaluate',content:`B(${formatVal(m+1)},${formatVal(n+1)}) ≈ ${bv.toFixed(6)}`,math:`= ${formatVal(coeff)} \\times ${bv.toFixed(6)} \\approx ${result.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{${AL}^{${formatVal(m+n+1)}} \\cdot B(${formatVal(m+1)},${formatVal(n+1)}) \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // ∫ₐᵇ (x-a)^m(b-x)^n dx
  function solveBetaIntAB(mStr,nStr,aStr,bStr) {
    const pm=parseInput(mStr),pn=parseInput(nStr),pa=parseInput(aStr),pb=parseInput(bStr);
    if(!pm) return {error:'Invalid M. Please enter a number (e.g. 2, 1/2), not a variable name.'};
    if(!pn) return {error:'Invalid N. Please enter a number (e.g. 3, 1/2), not a variable name.'};
    if(!pa) return {error:'Invalid a. Please enter a number (e.g. -1, 0, 2).'};
    if(!pb) return {error:'Invalid b. Please enter a number (e.g. 1, 5).'};
    const m=pm.value,n=pn.value,a=pa.value,b=pb.value;
    const mL=formatNum(pm),nL=formatNum(pn),aL=formatNum(pa),bL=formatNum(pb);
    const diff=b-a;
    if(diff<=0) return {error:'b must be greater than a.'};
    if(m+1<=0) return {error:`M+1 = ${m+1} must be positive. M must be greater than −1.`};
    if(n+1<=0) return {error:`N+1 = ${n+1} must be positive. N must be greater than −1.`};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'',math:`\\int_{${aL}}^{${bL}} (x-${aL !=='0' ? '('+aL+')' : aL})^{${mL}}(${bL}-x)^{${nL}}\\, dx`});
    steps.push({title:'Substitution',content:`Let x − (${aL}) = ${formatVal(diff)}·t:`,math:`= ${formatVal(diff)}^{${formatVal(m+n+1)}} \\int_0^1 t^{${mL}}(1-t)^{${nL}}\\, dt`});
    steps.push({title:'Beta Form',content:'',math:`= ${formatVal(diff)}^{${formatVal(m+n+1)}} \\cdot B(${formatVal(m+1)},${formatVal(n+1)})`});
    const bv=gammaLanczos(m+1)*gammaLanczos(n+1)/gammaLanczos(m+n+2);
    const coeff=Math.pow(diff,m+n+1);
    const result=coeff*bv;
    steps.push({title:'Evaluate',content:`B(${formatVal(m+1)},${formatVal(n+1)}) ≈ ${bv.toFixed(6)}`,math:`= ${formatVal(coeff)} \\times ${bv.toFixed(6)} \\approx ${result.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{${formatVal(diff)}^{${formatVal(m+n+1)}} B(${formatVal(m+1)},${formatVal(n+1)}) \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // ∫₀^(π/2) sin^m(θ)cos^n(θ) dθ
  function solveBetaTrig(mStr,nStr) {
    const pm=parseInput(mStr),pn=parseInput(nStr);
    if(!pm) return {error:'Invalid M. Please enter a number (e.g. 4, 3/2), not a variable name.'};
    if(!pn) return {error:'Invalid N. Please enter a number (e.g. 3, 1/2), not a variable name.'};
    const m=pm.value,n=pn.value;
    const mL=formatNum(pm),nL=formatNum(pn);
    const steps=[];
    steps.push({title:'Identify the Integral',content:'',math:`\\int_0^{\\pi/2} \\sin^{${mL}}\\theta\\,\\cos^{${nL}}\\theta\\, d\\theta`});
    steps.push({title:'Apply the Beta-Trig Identity',content:'We know:',math:`\\int_0^{\\pi/2} \\sin^{m}\\theta\\,\\cos^{n}\\theta\\, d\\theta = \\frac{1}{2} B\\left(\\frac{m+1}{2},\\frac{n+1}{2}\\right)`});
    const p=(m+1)/2,q=(n+1)/2;
    steps.push({title:'Substitute',content:'',math:`= \\frac{1}{2} B\\left(${formatVal(p)},${formatVal(q)}\\right)`});
    const bv=gammaLanczos(p)*gammaLanczos(q)/gammaLanczos(p+q);
    const result=bv/2;
    steps.push({title:'Evaluate',content:`Using B(x,y) = Γ(x)Γ(y)/Γ(x+y):`,math:`= \\frac{1}{2} \\cdot ${bv.toFixed(6)} \\approx ${result.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\frac{1}{2} B\\left(${formatVal(p)},${formatVal(q)}\\right) \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // Keep old simple versions for backward compat
  function solveGammaIntegral(inputStr) {
    const parsed = parseInput(inputStr);
    if (!parsed) return { error: 'Invalid input.' };
    const n = parsed.value, nLatex = formatNum(parsed), steps = [];
    steps.push({title:'Identify',content:'',math:`\\int_0^{\\infty} t^{${nLatex}-1} e^{-t} dt = \\Gamma(${nLatex})`});
    const r = solveGamma(inputStr);
    if (r.error) return r;
    for (let i=2;i<r.steps.length;i++) steps.push(r.steps[i]);
    return {steps,error:null,final:r.final,numericValue:r.numericValue};
  }
  function solveBetaIntegral(inputX, inputY) {
    const px=parseInput(inputX),py=parseInput(inputY);
    if(!px||!py) return {error:'Invalid input.'};
    const r=solveBeta(inputX,inputY);
    return r;
  }

  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) { [a, b] = [b, a % b]; }
    return a;
  }

  // ========================
  // NEW: Gamma Integral Type 3 — ∫₀^∞ x^A / B^x dx
  // ========================
  function solveGammaExpBase(aStr, bStr) {
    const pa=parseInput(aStr), pb=parseInput(bStr);
    if(!pa) return {error:'Invalid A.'};
    if(!pb) return {error:'Invalid B.'};
    const a=pa.value, b=pb.value;
    const aL=formatNum(pa), bL=formatNum(pb);
    if(b<=1) return {error:'B must be greater than 1.'};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'We need to evaluate:',math:`\\int_0^{\\infty} \\frac{x^{${aL}}}{${bL}^{x}}\\, dx`});
    steps.push({title:'Rewrite the Integrand',content:'Since B^x = e^(x ln B):',math:`= \\int_0^{\\infty} x^{${aL}} \\cdot e^{-x \\ln ${bL}}\\, dx`});
    steps.push({title:'Substitution',content:'Let t = x ln B:',math:`= \\frac{1}{(\\ln ${bL})^{${formatVal(a+1)}}} \\int_0^{\\infty} t^{${aL}} e^{-t}\\, dt = \\frac{\\Gamma(${formatVal(a+1)})}{(\\ln ${bL})^{${formatVal(a+1)}}}`});
    const gArg=a+1;
    const gVal=gammaLanczos(gArg);
    const exact=knownGammaExact(gArg);
    const gStr=exact?exact.latex:gVal.toFixed(6);
    steps.push({title:`Evaluate Γ(${formatVal(gArg)})`,content:'',math:`\\Gamma(${formatVal(gArg)}) = ${gStr}`});
    const denom=Math.pow(Math.log(b),a+1);
    const result=gVal/denom;
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\int_0^{\\infty} \\frac{x^{${aL}}}{${bL}^x} dx = \\frac{${gStr}}{(\\ln ${bL})^{${formatVal(a+1)}}} \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // NEW: Gamma Integral Type 4 — ∫₀¹ 1/√(x·log(1/x)) dx = √(2π)
  function solveGammaSpecial() {
    const steps=[];
    steps.push({title:'Identify the Integral',content:'We need to evaluate:',math:`\\int_0^1 \\frac{1}{\\sqrt{x \\cdot \\log(1/x)}}\\, dx`});
    steps.push({title:'Substitution',content:'Let t = log(1/x), so x = e^(−t), dx = −e^(−t) dt:',math:`= \\int_0^{\\infty} \\frac{e^{-t/2}}{\\sqrt{t}}\\, dt`});
    steps.push({title:'Recognize Gamma Form',content:'This is of the form ∫₀^∞ t^(−1/2) e^(−t/2) dt:',math:`= 2^{1/2} \\int_0^{\\infty} u^{-1/2} e^{-u}\\, du \\cdot \\sqrt{2} = \\sqrt{2} \\cdot \\Gamma(1/2) = \\sqrt{2} \\cdot \\sqrt{\\pi}`});
    const result=Math.sqrt(2*Math.PI);
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\int_0^1 \\frac{1}{\\sqrt{x \\log(1/x)}}\\, dx = \\sqrt{2\\pi} \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`= \\sqrt{2\\pi} \\approx ${result.toFixed(6)}`,numericValue:result};
  }

  // NEW: Beta Rational — ∫₀^∞ x^(m-1)/(1+x)^(m+n) dx = B(m,n)
  function solveBetaRational(mStr,nStr) {
    const pm=parseInput(mStr),pn=parseInput(nStr);
    if(!pm||!pn) return {error:'Invalid input.'};
    const m=pm.value,n=pn.value;
    const mL=formatNum(pm),nL=formatNum(pn);
    if(m<=0||n<=0) return {error:'m and n must be positive.'};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'',math:`\\int_0^{\\infty} \\frac{x^{${mL}-1}}{(1+x)^{${mL}+${nL}}}\\, dx`});
    steps.push({title:'Apply Known Identity',content:'We know that:',math:`\\int_0^{\\infty} \\frac{x^{m-1}}{(1+x)^{m+n}} dx = B(m, n) = \\frac{\\Gamma(m)\\Gamma(n)}{\\Gamma(m+n)}`});
    steps.push({title:'Substitute',content:'',math:`= B\\left(${mL}, ${nL}\\right)`});
    const bv=gammaLanczos(m)*gammaLanczos(n)/gammaLanczos(m+n);
    steps.push({title:'Evaluate',content:'Using Gamma functions:',math:`= \\frac{\\Gamma(${mL})\\Gamma(${nL})}{\\Gamma(${formatVal(m+n)})} \\approx ${bv.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{B\\left(${mL}, ${nL}\\right) \\approx ${bv.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${bv.toFixed(6)}`,numericValue:bv};
  }

  // NEW: Beta Symmetric — ∫₀^∞ x^(m-1)/(a+bx)^(m+n) dx = B(m,n)/(a^n · b^m)
  function solveBetaSymm(mStr,nStr,aStr,bStr) {
    const pm=parseInput(mStr),pn=parseInput(nStr),pa=parseInput(aStr),pb=parseInput(bStr);
    if(!pm||!pn||!pa||!pb) return {error:'Invalid input.'};
    const m=pm.value,n=pn.value,a=pa.value,b=pb.value;
    const mL=formatNum(pm),nL=formatNum(pn),aL=formatNum(pa),bL=formatNum(pb);
    if(a<=0||b<=0) return {error:'a and b must be positive.'};
    const steps=[];
    steps.push({title:'Identify the Integral',content:'',math:`\\int_0^{\\infty} \\frac{x^{${mL}-1}}{(${aL}+${bL}x)^{${mL}+${nL}}}\\, dx`});
    steps.push({title:'Apply Known Identity',content:'We know:',math:`\\int_0^{\\infty} \\frac{x^{m-1}}{(a+bx)^{m+n}} dx = \\frac{B(m,n)}{a^n \\cdot b^m}`});
    const bv=gammaLanczos(m)*gammaLanczos(n)/gammaLanczos(m+n);
    const denom=Math.pow(a,n)*Math.pow(b,m);
    const result=bv/denom;
    steps.push({title:'Compute',content:'',math:`= \\frac{B(${mL},${nL})}{${aL}^{${nL}} \\cdot ${bL}^{${mL}}} = \\frac{${bv.toFixed(6)}}{${formatVal(denom)}} \\approx ${result.toFixed(6)}`});
    steps.push({title:'Final Answer',content:'',math:`\\boxed{\\frac{B(${mL},${nL})}{${aL}^{${nL}} \\cdot ${bL}^{${mL}}} \\approx ${result.toFixed(6)}}`,isFinal:true});
    return {steps,error:null,final:`\\approx ${result.toFixed(6)}`,numericValue:result};
  }

  return {
    solveGamma, solveBeta, solveGammaIntegral, solveBetaIntegral,
    solveGammaIntTemplate, solveGammaLogInt, solveGammaExpBase, solveGammaSpecial,
    solveBetaIntPower, solveBetaIntRange, solveBetaIntAB, solveBetaTrig,
    solveBetaRational, solveBetaSymm,
    parseInput, formatNum, formatVal, gammaLanczos, factorial, knownGammaExact
  };
})();
