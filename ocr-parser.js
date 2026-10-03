/**
 * ocr-parser.js
 * Enhanced OCR parser with multiple strategies for math recognition.
 * Uses multiple OCR passes with different preprocessing to get best results.
 */
const OCRParser = (() => {

  // Strategy 1: Light preprocessing — just enhance contrast, no harsh threshold
  function preprocessLight(imgSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        const scale = 3;
        c.width = img.width * scale;
        c.height = img.height * scale;
        const ctx = c.getContext('2d');
        // White background first
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        // Increase contrast
        const id = ctx.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
          // Contrast stretch: make darks darker, lights lighter
          const v = gray < 160 ? Math.max(0, gray * 0.5) : Math.min(255, gray * 1.2 + 30);
          d[i] = v; d[i+1] = v; d[i+2] = v;
        }
        ctx.putImageData(id, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    });
  }

  // Strategy 2: Heavy threshold — sharp B&W for clear text
  function preprocessHeavy(imgSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        const scale = 3;
        c.width = img.width * scale;
        c.height = img.height * scale;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
          const v = gray < 180 ? 0 : 255;
          d[i] = v; d[i+1] = v; d[i+2] = v;
        }
        ctx.putImageData(id, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    });
  }

  // Strategy 3: Invert if dark background
  function preprocessInvert(imgSrc) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        const scale = 3;
        c.width = img.width * scale;
        c.height = img.height * scale;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        // Check if image is predominantly dark
        let totalBright = 0;
        for (let i = 0; i < d.length; i += 4) {
          totalBright += (d[i] + d[i+1] + d[i+2]) / 3;
        }
        const avgBright = totalBright / (d.length / 4);
        if (avgBright < 128) {
          // Dark image — invert it
          for (let i = 0; i < d.length; i += 4) {
            d[i] = 255 - d[i]; d[i+1] = 255 - d[i+1]; d[i+2] = 255 - d[i+2];
          }
        }
        // Then threshold
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
          const v = gray < 160 ? 0 : 255;
          d[i] = v; d[i+1] = v; d[i+2] = v;
        }
        ctx.putImageData(id, 0, 0);
        resolve(c.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    });
  }

  // Run Tesseract with specific config
  async function runOCR(imgData) {
    const result = await Tesseract.recognize(imgData, 'eng', {
      logger: () => {}
    });
    return result.data.text || '';
  }

  // Clean text
  function cleanText(t) {
    return t.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // Extract all numbers and math-like fragments from OCR text
  function extractFragments(text) {
    const nums = text.match(/\d+/g) || [];
    const hasX = /x/i.test(text);
    const hasDx = /dx/i.test(text);
    const hasSin = /sin/i.test(text);
    const hasCos = /cos/i.test(text);
    const hasE = /e\^|e-|exp/i.test(text);
    const hasLog = /log|ln/i.test(text);
    const hasPlus = /\+/.test(text);
    const hasMinus = /-|—|−/.test(text);
    const hasFrac = /\/|÷/.test(text);
    const hasParen = /[()]/.test(text);
    const hasSqrt = /√|sqrt/i.test(text);
    const hasInf = /∞|inf|oo/i.test(text);
    return { nums, hasX, hasDx, hasSin, hasCos, hasE, hasLog, hasPlus, hasMinus, hasFrac, hasParen, hasSqrt, hasInf };
  }

  // Try to parse a Gamma integral from text
  function parseGammaIntegral(text) {
    const raw = text;

    // ⁴√x * e^(-√x)
    if (/4.*[√v].*x.*e|x.*1\/4.*e.*1\/2|fourth.*root/i.test(raw)) {
      return { a: '1/4', b: '1', c: '1/2', type: 'type1' };
    }
    // √x * e^(-(x)^(1/3))
    if (/[√v].*x.*e.*x.*1\/3|sqrt.*x.*e.*x.*1.*3/i.test(raw)) {
      return { a: '1/2', b: '1', c: '1/3', type: 'type1' };
    }
    // √x * e^(-x³) or √y * e^(-y³)
    if (/[√v].*[xy].*e.*[xy].*[³3]/i.test(raw)) {
      return { a: '1/2', b: '1', c: '3', type: 'type1' };
    }
    // √y * e^(-√y)
    if (/[√v].*[xy].*e.*[√v].*[xy]/i.test(raw)) {
      return { a: '1/2', b: '1', c: '1/2', type: 'type1' };
    }
    // e^(-x²)
    if (/e.*[-−].*x.*[²2]/i.test(raw) && !/x.*\d.*e/i.test(raw)) {
      return { a: '0', b: '1', c: '2', type: 'type1' };
    }
    // e^(-x^4)
    if (/e.*[-−].*x.*4/i.test(raw) && !/x.*\d.*e/i.test(raw)) {
      return { a: '0', b: '1', c: '4', type: 'type1' };
    }
    // x^7 * e^(-2x²)
    const m1 = raw.match(/x\D*(\d+)\D*e\D*[-−]\D*(\d+)\D*x\D*[²2]/i);
    if (m1) return { a: m1[1], b: m1[2], c: '2', type: 'type1' };
    // x^n * e^(-bx^c) generic
    const m2 = raw.match(/x\D*(\d+(?:\/\d+)?)\D*e\D*[-−]\D*(\d+)?\D*x\D*(\d+(?:\/\d+)?)/i);
    if (m2) return { a: m2[1]||'0', b: m2[2]||'1', c: m2[3]||'1', type: 'type1' };
    // e^(-x^n) alone
    const m3 = raw.match(/e\D*[-−]\D*x\D*(\d+)/i);
    if (m3) return { a: '0', b: '1', c: m3[1], type: 'type1' };
    // x^A / B^x
    const mexp = raw.match(/x\D*(\d+)\D*(\d+)\D*\^\D*x/i);
    if (mexp) return { a: mexp[1], b: mexp[2], type: 'type3' };
    // 1/√(x·log(1/x))
    if (/1\D*[√v]\D*x\D*log/i.test(raw)) return { type: 'type4' };
    // Log type
    if (/log|ln/i.test(raw)) {
      const ml = raw.match(/x\D*(\d+)\D*(?:log|ln)\D*(\d+)/i);
      if (ml) return { a: ml[1], b: ml[2], type: 'type2' };
    }
    return null;
  }

  // Try to parse a Beta integral from text
  function parseBetaIntegral(text) {
    const raw = text;

    // Trig: sin^m * cos^n
    if (/sin|cos/i.test(raw)) {
      const tm = raw.match(/sin\D*(\d+(?:\/\d+)?)\D*cos\D*(\d+(?:\/\d+)?)/i);
      if (tm) return { type: 'trig', m: tm[1], n: tm[2] };
      const tm2 = raw.match(/cos\D*(\d+(?:\/\d+)?)\D*sin\D*(\d+(?:\/\d+)?)/i);
      if (tm2) return { type: 'trig', m: tm2[2], n: tm2[1] };
    }

    // (x-a)^m(b-x)^n
    const ab = raw.match(/\(x\D*(\d+)\)\D*(\d+(?:\/\d+)?)\D*\((\d+)\D*x\)\D*(\d+(?:\/\d+)?)/i);
    if (ab) return { type: 'ab', a: ab[1], b: ab[3], m: ab[2], n: ab[4] };

    // x^a(1-x^n)^b
    const pw = raw.match(/x\D*(\d+(?:\/\d+)?)\D*\(?\D*1\D*[-−]\D*x\D*(\d+(?:\/\d+)?)\D*\)?\D*(\d+(?:\/\d+)?)/i);
    if (pw) return { type: 'power', a: pw[1], n: pw[2], b: pw[3] };

    // x^m(A-x)^n from 0 to A
    const rg = raw.match(/x\D*(\d+(?:\/\d+)?)\D*\(?\D*(\d+)\D*[-−]\D*x\D*\)?\D*(\d+(?:\/\d+)?)/i);
    if (rg) return { type: 'range', m: rg[1], n: rg[3], A: rg[2] };

    // Rational: x^n/(1+x^k)^m or dx/(1+x^4) etc
    const rat = raw.match(/x\D*(\d+)?\D*(?:dx)?\D*[\/÷]\D*\(?\D*1\D*\+\D*x\D*(\d+)?\D*\)?\D*(\d+)?/i);
    if (rat) {
      const xpow = parseInt(rat[1] || '0');
      const basepow = parseInt(rat[2] || '1');
      const outpow = parseInt(rat[3] || '1');
      // Map to B(m,n) using substitution
      const p = (xpow + 1) / basepow;
      const q = outpow - p;
      if (q > 0 && p > 0) return { type: 'rational', m: String(p), n: String(q) };
      // Fallback
      return { type: 'rational', m: String(p || 1), n: String(Math.max(q, 1)) };
    }

    return null;
  }

  // Auto-detect type from text
  function autoDetectType(text) {
    const t = text.toLowerCase();
    if (/sin|cos|tan|cot/i.test(t)) return 'beta';
    if (/\(x\D*\d+\)\D*\(\d+\D*x\)/i.test(t)) return 'beta';
    if (/beta/i.test(t)) return 'beta';
    if (/e\s*[\^]|e\s*[-−]|exp/i.test(t)) return 'gamma';
    if (/gamma|Γ/i.test(t)) return 'gamma';
    if (/log|ln/i.test(t)) return 'gamma';
    // (1+x) pattern in denominator → beta rational
    if (/\(\s*1\s*\+\s*x/i.test(t) || /1\s*\+\s*x/i.test(t)) return 'beta';
    if (/∞|inf/i.test(t)) return 'gamma';
    return null;
  }

  // Main: run multiple OCR passes with different preprocessing
  async function recognizeAndParse(imgSrc, integralType) {
    try {
      // Run 3 different preprocessing strategies in parallel
      const [imgLight, imgHeavy, imgInvert] = await Promise.all([
        preprocessLight(imgSrc),
        preprocessHeavy(imgSrc),
        preprocessInvert(imgSrc)
      ]);

      // Run OCR on all 3 + original
      const [t1, t2, t3, t4] = await Promise.all([
        runOCR(imgSrc),
        runOCR(imgLight),
        runOCR(imgHeavy),
        runOCR(imgInvert)
      ]);

      const texts = [t1, t2, t3, t4].map(cleanText);
      console.log('OCR Results:', texts);

      // Combine all texts for maximum chance of matching
      const allText = texts.join(' | ');

      // Try each text individually for better parsing
      let bestResult = null;
      let bestType = null;

      for (const text of texts) {
        if (!text || text.length < 3) continue;

        let detType = integralType;
        if (!detType || detType === 'auto') {
          detType = autoDetectType(text);
        }

        if (detType === 'gamma') {
          const p = parseGammaIntegral(text);
          if (p) { bestResult = p; bestType = 'gamma'; break; }
        } else if (detType === 'beta') {
          const p = parseBetaIntegral(text);
          if (p) { bestResult = p; bestType = 'beta'; break; }
        }

        // Try both if no type detected
        if (!detType) {
          const gp = parseGammaIntegral(text);
          if (gp) { bestResult = gp; bestType = 'gamma'; break; }
          const bp = parseBetaIntegral(text);
          if (bp) { bestResult = bp; bestType = 'beta'; break; }
        }
      }

      // If still nothing, try combined text
      if (!bestResult) {
        let detType = integralType;
        if (!detType || detType === 'auto') detType = autoDetectType(allText);
        if (detType === 'gamma') bestResult = parseGammaIntegral(allText);
        else if (detType === 'beta') bestResult = parseBetaIntegral(allText);
        if (bestResult) bestType = detType;
        
        if (!bestResult) {
          const gp = parseGammaIntegral(allText);
          if (gp) { bestResult = gp; bestType = 'gamma'; }
          else {
            const bp = parseBetaIntegral(allText);
            if (bp) { bestResult = bp; bestType = 'beta'; }
          }
        }
      }

      return { text: allText, parsed: bestResult, detectedType: bestType };
    } catch (e) {
      console.error('OCR Error:', e);
      return { text: '', parsed: null, error: e.message };
    }
  }

  return { recognizeAndParse, parseGammaIntegral, parseBetaIntegral, autoDetectType };
})();
