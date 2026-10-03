import streamlit as st
import streamlit.components.v1 as components
import base64
import os

st.set_page_config(
    page_title="Gamma & Beta Function Calculator — Step-by-Step Solver | PCCOE",
    page_icon="🧮",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Make the original web app take 100% of the screen without Streamlit UI interference
st.markdown("""
<style>
    #MainMenu, header, footer, [data-testid="stSidebar"], [data-testid="stHeader"] {
        display: none !important;
        visibility: hidden !important;
    }
    div.block-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100vw !important;
        width: 100vw !important;
        height: 100vh !important;
    }
    iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
        z-index: 999999 !important;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def get_full_bundle():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    with open("style.css", "r", encoding="utf-8") as f:
        css = f.read()

    with open("math-engine.js", "r", encoding="utf-8") as f:
        math_js = f.read()

    with open("ocr-parser.js", "r", encoding="utf-8") as f:
        ocr_js = f.read()

    with open("app.js", "r", encoding="utf-8") as f:
        app_js = f.read()

    # Embed PCCOE Logo
    if os.path.exists("pccoe_logo.png"):
        with open("pccoe_logo.png", "rb") as f:
            logo_b64 = base64.b64encode(f.read()).decode("utf-8")
        html = html.replace('src="pccoe_logo.png"', f'src="data:image/png;base64,{logo_b64}"')

    # Embed math_bg.png in CSS if exists
    if os.path.exists("math_bg.png"):
        with open("math_bg.png", "rb") as f:
            bg_b64 = base64.b64encode(f.read()).decode("utf-8")
        css = css.replace("url('math_bg.png')", f"url('data:image/png;base64,{bg_b64}')")

    # Replace CSS
    html = html.replace('<link rel="stylesheet" href="style.css" />', f'<style>\n{css}\n</style>')

    # Replace JS scripts
    html = html.replace('<script src="math-engine.js"></script>', f'<script>\n{math_js}\n</script>')
    html = html.replace('<script src="ocr-parser.js"></script>', f'<script>\n{ocr_js}\n</script>')
    html = html.replace('<script src="app.js"></script>', f'<script>\n{app_js}\n</script>')

    return html

full_html = get_full_bundle()
components.html(full_html, height=1200, scrolling=True)
