# 🧮 Gamma & Beta Function Calculator — Step-by-Step Solver

[![Institution: PCCOE](https://img.shields.io/badge/Institution-PCCOE-orange.svg)](https://www.pccoepune.com)
[![Project: Engineering Mathematics](https://img.shields.io/badge/Domain-Engineering%20Mathematics-blue.svg)](#)
[![Tech: HTML5 / CSS3 / Vanilla JS](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS-yellow.svg)](#)
[![Math: KaTeX & Lanczos](https://img.shields.io/badge/Rendering-KaTeX%20TeX%2FLaTeX-green.svg)](#)
[![OCR: Tesseract.js](https://img.shields.io/badge/OCR-Tesseract.js%20v5-blueviolet.svg)](#)

> An interactive, high-precision web-based mathematical suite and solver for **Eulerian Integrals (Gamma and Beta Functions)** featuring complete step-by-step analytical derivations, interactive 2D graph visualization, handwritten equation scanning (OCR), and companion MATLAB implementations.

---

## 📸 Application Preview

<p align="center">
  <img src="app_preview.png" alt="Gamma & Beta Function Calculator UI" width="100%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" />
</p>

---

## 🏛️ Academic Information

<p align="center">
  <img src="pccoe_logo.png" alt="PCCOE Logo" width="110" />
</p>

- **Institution:** Pimpri Chinchwad College of Engineering (PCCOE), Pune
- **Department:** Engineering Sciences & Humanities
- **Subject:** Engineering Mathematics
- **Developed By:** **Tejas Wandhekar**
- **Project Guide:** **Prof. Nishi Gupta**
- **Year:** 2025

<details>
<summary><b>View Splash Screen Preview</b></summary>
<br>

<p align="center">
  <img src="splash_preview.png" alt="PCCOE Splash Screen" width="90%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" />
</p>

</details>

---

## 🌟 Key Highlights & Features

### 1. ⚡ High-Precision Special Function Solvers
- **Gamma Function $\Gamma(n)$**:
  - Handles positive integers using factorial relationship: $\Gamma(n) = (n-1)!$.
  - Exact evaluations for half-integers using recursion and $\Gamma(1/2) = \sqrt{\pi}$.
  - Support for negative non-integers using Euler's Reflection Formula: $\Gamma(z)\Gamma(1-z) = \frac{\pi}{\sin(\pi z)}$.
  - Arbitrary real numbers calculated via the high-accuracy 9-term **Lanczos approximation**.
  - Identifies non-positive integer poles/singularities ($0, -1, -2, \dots$).
- **Beta Function $B(m, n)$**:
  - Direct connection to Gamma functions: $B(m, n) = \frac{\Gamma(m)\Gamma(n)}{\Gamma(m+n)}$.
  - Symmetric verification: $B(m, n) = B(n, m)$.

### 2. 📝 Automated Step-by-Step Analytical Derivations
- Dynamic LaTeX-rendered math steps powered by **KaTeX**.
- Clearly highlights:
  - Integral identification and classification.
  - Variable substitutions ($u$-substitutions, power changes, logarithmic transformations).
  - Intermediate reduction steps.
  - Boxed final results in both exact fractional/radical forms and 6-decimal floating-point approximations.

### 3. 📐 Advanced Integral Templates & Problem Types
- **Standard Gamma Form:** $\int_0^{\infty} x^{n-1} e^{-ax}\, dx$
- **Logarithmic Gamma Transformation:** $\int_0^1 \left(\ln \frac{1}{x}\right)^{n-1} dx$
- **Special Fractional Gamma Form:** $\int_0^1 \frac{dx}{\sqrt{x \ln(1/x)}} = \sqrt{2\pi}$
- **Exponential Base Form:** $\int_0^{\infty} a^{-x^b} x^{m}\, dx$
- **Standard Beta Form:** $\int_0^1 x^{m-1} (1-x)^{n-1}\, dx$
- **Trigonometric Form:** $\int_0^{\pi/2} \sin^p\theta \cos^q\theta\, d\theta = \frac{1}{2} B\left(\frac{p+1}{2}, \frac{q+1}{2}\right)$
- **Rational / Infinite Limits Form:** $\int_0^{\infty} \frac{x^{m-1}}{(1+x)^{m+n}}\, dx = B(m, n)$
- **Generalized Rational Form:** $\int_0^{\infty} \frac{x^{m-1}}{(a+bx)^{m+n}}\, dx = \frac{B(m, n)}{a^n b^m}$
- **Arbitrary Range Form:** $\int_a^b (x-a)^{m-1} (b-x)^{n-1}\, dx = (b-a)^{m+n-1} B(m, n)$

### 4. 📷 Intelligent Math OCR Scanner
- Upload image files or take snapshots of handwritten/printed equations.
- Multi-pass canvas image enhancement:
  - **Strategy 1:** Contrast stretching with soft luminance scaling.
  - **Strategy 2:** Adaptive binarization (heavy black-and-white thresholding).
- Integrated with **Tesseract.js v5** engine.
- Heuristic regex parser extracts expressions, limits, and exponents automatically into the calculator inputs.

### 5. 📈 Interactive Function Visualizer
- Canvas-based 2D plotter for $\Gamma(x)$ over continuous real intervals.
- Visualizes vertical asymptotes and poles at zero and negative integers.
- Highlights discrete integer points to demonstrate factorial interpolation $\Gamma(n) = (n-1)!$.
- Responsive coordinate grid with dynamic cursor readout.

### 6. 🎨 Modern Engineering Design System
- Sleek modern dark mode by default with light mode switch.
- Animated particle constellation network on HTML5 canvas.
- PCCOE branded splash screen with smooth entry transitions.
- Interactive formula cheat sheet and one-click auto-fill problem library.

### 7. 💻 MATLAB Code Companion
- Pre-built, verified MATLAB code snippets directly available inside the interface for cross-verification.

---

## 📂 Project Architecture

```
gamma-beta-cal/
│
├── index.html          # Semantic application layout, KaTeX headers, modal dialogs,
│                       # splash screen, and structured sections (Hero, Calculator,
│                       # Graph, Theory, Examples, MATLAB, Footer).
│
├── style.css           # Full styling system (CSS variables, dark/light themes,
│                       # glassmorphism, responsive grid layout, keyframe animations).
│
├── math-engine.js      # Core computational library:
│                       #  - Lanczos approximation algorithm
│                       #  - Exact arithmetic & fraction parser
│                       #  - Reflection & recurrence rules
│                       #  - Step-by-step LaTeX solution builder for 10+ integral forms
│
├── ocr-parser.js       # OCR processing pipeline:
│                       #  - Dual-strategy canvas preprocessing
│                       #  - Tesseract.js worker controller
│                       #  - Regex pattern matching for math equations
│
├── app.js              # Application controller:
│                       #  - Particle simulation engine
│                       #  - Splash screen sequencing & theme toggle
│                       #  - Tab switching & form bindings
│                       #  - KaTeX batch rendering & 2D graph plotter
│
├── pccoe_logo.png      # High-resolution PCCOE institutional emblem
├── math_bg.png         # Mathematical background overlay asset
├── app_preview.png     # Full-resolution screenshot of the main application UI
├── splash_preview.png  # Screenshot of the animated PCCOE splash screen
└── README.md           # Project documentation and user manual
```

---

## 🔬 Mathematical Formulas Reference

### 1. Gamma Function Definition
$$\Gamma(n) = \int_0^{\infty} t^{n-1} e^{-t}\, dt \quad (\text{for } n > 0)$$

### 2. Fundamental Properties
- **Recurrence Relation:** $\Gamma(n+1) = n \cdot \Gamma(n)$
- **Factorial Relationship:** $\Gamma(n) = (n-1)! \quad (\forall n \in \mathbb{N})$
- **Special Half-Integer Value:** $\Gamma\left(\frac{1}{2}\right) = \sqrt{\pi}$
- **Euler's Reflection Formula:**
  $$\Gamma(z)\Gamma(1-z) = \frac{\pi}{\sin(\pi z)} \quad (z \notin \mathbb{Z})$$

### 3. Beta Function Definition
$$B(m, n) = \int_0^1 x^{m-1} (1-x)^{n-1}\, dx \quad (\text{for } m > 0, n > 0)$$

### 4. Connection Between Beta and Gamma
$$B(m, n) = \frac{\Gamma(m) \cdot \Gamma(n)}{\Gamma(m+n)}$$

### 5. Trigonometric Form
$$B(m, n) = 2 \int_0^{\pi/2} \sin^{2m-1}\theta \cos^{2n-1}\theta\, d\theta$$
$$\implies \int_0^{\pi/2} \sin^p\theta \cos^q\theta\, d\theta = \frac{1}{2} B\left(\frac{p+1}{2}, \frac{q+1}{2}\right) = \frac{\Gamma\left(\frac{p+1}{2}\right)\Gamma\left(\frac{q+1}{2}\right)}{2\,\Gamma\left(\frac{p+q+2}{2}\right)}$$

---

## 💻 MATLAB Code Examples

### Gamma Function (`gamma_solver.m`)
```matlab
% Gamma function evaluation in MATLAB
n = input('Enter value of n: ');
result = gamma(n);
fprintf('Γ(%g) = %g\n', n, result);

% If integer, verify using factorial
if n == floor(n) && n > 0
    fprintf('Γ(%d) = (%d)! = %d\n', n, n-1, factorial(n - 1));
end

% Symbolic verification via definite integral
syms t
f = t^(n - 1) * exp(-t);
symbolic_result = int(f, t, 0, inf);
disp('Symbolic Integral Result:');
disp(symbolic_result);
```

### Beta Function (`beta_solver.m`)
```matlab
% Beta function evaluation in MATLAB
x = input('Enter x: ');
y = input('Enter y: ');

% Built-in beta function
result = beta(x, y);
fprintf('B(%g, %g) = %g\n', x, y, result);

% Relationship via Gamma functions
gamma_result = (gamma(x) * gamma(y)) / gamma(x + y);
fprintf('Using Gamma: Γ(%g)Γ(%g) / Γ(%g) = %g\n', x, y, x + y, gamma_result);

% Definite integral definition
syms t
f = t^(x - 1) * (1 - t)^(y - 1);
integral_result = int(f, t, 0, 1);
disp('Integral Evaluation:');
disp(integral_result);
```

---

## 🚀 Running Locally

### Option A: Using Streamlit (Python App — Recommended)
```bash
# Start Streamlit application
streamlit run streamlit_app.py
```
This automatically launches your interactive Python app in your default browser at **http://localhost:8501**!

### Option B: Using Node.js `http-server` (Web Suite)
If you have Node.js installed:
```bash
# Navigate to the project directory
cd gamma-beta-cal

# Start local server on port 8080
npx http-server ./ -p 8080 -c-1
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

### Option B: Using Python
If you have Python 3 installed:
```bash
python -m http.server 8080
```
Then visit **[http://localhost:8080](http://localhost:8080)**.

### Option C: VS Code Live Server Extension
1. Open the folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

---

## 🚀 Live Deployment Guide (हे कसे Deploy करावे)

### 🎈 Method 1: Streamlit Community Cloud (100% Free for Streamlit Apps)
1. Push this project to GitHub (if not already pushed):
   ```bash
   git add .
   git commit -m "Streamlit app update"
   git push -u origin main
   ```
2. Go to **[share.streamlit.io](https://share.streamlit.io)** and log in with your GitHub account.
3. Click **"New app"** (or "Create app").
4. Select:
   - **Repository:** `your-username/gamma-beta-cal`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app.py`
5. Click **"Deploy!"**
6. Within 1 minute, you will receive a public live URL like:
   `https://gamma-beta-cal.streamlit.app`
   which you can directly submit for college and project evaluation!

---

### 🌐 Method 2: Vercel (1-Click CLI Deployment - Fastest)
1. Open Terminal in the project directory:
   ```bash
   npx vercel
   ```
2. Follow the quick prompts in your terminal:
   - Set up and deploy: **`Y`**
   - Which scope: *(Select your account)*
   - Link to existing project: **`N`**
   - What's your project's name: **`gamma-beta-cal`**
   - In which directory is your code located: **`./`**
3. Done! Vercel gives you an instant live URL like `https://gamma-beta-cal.vercel.app`.

---

### 🌐 Method 2: Netlify Drop (No Terminal, Drag & Drop in 10 Seconds)
1. Go to **[https://app.netlify.com/drop](https://app.netlify.com/drop)** in your browser.
2. Log in or sign up (Free).
3. Drag and drop the `gamma-beta-cal` folder right onto the page.
4. Your website is immediately live with a custom URL like `https://peaceful-mathexplorer.netlify.app`!

---

### 🌐 Method 3: GitHub Pages (Free College Project Hosting)
1. Initialize Git and commit:
   ```bash
   git init
   git add .
   git commit -m "Gamma & Beta Calculator 2025 - Initial Commit"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `gamma-beta-cal`.
3. Push your repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/gamma-beta-cal.git
   git push -u origin main
   ```
4. On GitHub, go to **Settings** → **Pages** → under **Build and deployment**, select source: **Deploy from a branch** (`main` / `/root`) → Click **Save**.
5. Your project will be live at `https://<your-username>.github.io/gamma-beta-cal/`!

---

### 🌐 Method 4: Surge.sh (Direct CLI Free Host)
```bash
npx surge .
```
Enter your email and choose a domain (e.g. `pccoe-gamma-beta-2025.surge.sh`).

---

## 🌐 Dependencies via CDN

The project is built entirely on zero-configuration client-side technologies:
- **KaTeX (v0.16.9)** — Fast, accessible math rendering (`katex.min.js`, `katex.min.css`).
- **Tesseract.js (v5)** — Optical Character Recognition directly in the browser (`tesseract.min.js`).
- **Google Fonts** — Inter, JetBrains Mono, and Playfair Display typography.

---

## 📜 Academic Attribution

This project was conceived and implemented as part of the Engineering Mathematics curriculum at **Pimpri Chinchwad College of Engineering (PCCOE)**.

- **Developer:** Tejas Wandhekar
- **Faculty Mentor:** Prof. Nishi Gupta
- **Year:** 2025
