 (function() {
     // 1. Inject the Engine with the Media Shield Patch
     function injectVariableEngine() {
         if (document.getElementById("slider-dark-engine")) return;

         const style = document.createElement("style");
         style.id = "slider-dark-engine";
         style.innerHTML = `
             :root {
                 color-scheme: dark !important;
                 --ext-bg: #1c1c1e;
                 --ext-surface: #2c2c2e;
                 --ext-text: #e5e5ea;
                 --ext-links: #64d2ff;
             }

             html, body, table, tbody, tr, html raw, embed {
                 background-color: var(--ext-bg) !important;
                 color: var(--ext-text) !important;
             }

             div, section, article, main, header, footer, nav, aside, blockquote, ul, ol, li, fieldset, form {
                 border-color: var(--ext-surface) !important;
             }

             /* Forum / Board Layout Specific Handles */
             .reply, .post, .thread, .dialog, .boxcontent, .boxbar, .postForm, .amber, .pagelist {
                 background-color: var(--ext-surface) !important;
                 color: var(--ext-text) !important;
                 border: 1px solid var(--ext-surface) !important;
             }

             p, span, b, strong, i, em, h1, h2, h3, h4, h5, h6, label, td, th {
                 color: var(--ext-text) !important;
             }

             a { color: var(--ext-links) !important; }
             
             input, textarea, select, button {
                 background-color: var(--ext-surface) !important;
                 color: var(--ext-text) !important;
                 border: 1px solid var(--ext-surface) !important;
             }

             /* CRITICAL BUG FIX: THE MEDIA SHIELD 
                This completely protects video players, player wrapper divisions, 
                and hovering interface bars from turning into opaque solid blocks. */
             video, iframe, canvas, object, svg, img,
             [class*="video"], [class*="player"], [class*="controls"],
             [id*="video"], [id*="player"], [id*="controls"],
             .html5-video-container, .video-stream, .mejs-container {
                 background-color: transparent !important;
                 background: transparent !important;
                 opacity: unset !important;
             }
         `;
         document.documentElement.appendChild(style);
     }

     injectVariableEngine();

     // 2. Math Processor to shift darkness levels dynamically
     function updateDarknessLevel(value) {
         const percent = parseInt(value);
         const bgLightness = 22 - (percent * 0.22);
         const surfaceLightness = 30 - (percent * 0.26);
         const textLightness = 75 + (percent * 0.25);

         document.documentElement.style.setProperty('--ext-bg', `hsl(240, 4%, ${bgLightness}%)`, 'important');
         document.documentElement.style.setProperty('--ext-surface', `hsl(240, 4%, ${surfaceLightness}%)`, 'important');
         document.documentElement.style.setProperty('--ext-text', `hsl(0, 0%, ${textLightness}%)`, 'important');
     }

     const savedVal = localStorage.getItem('ext-dark-val');
     updateDarknessLevel(savedVal || 50);

     // 3. Create the UI Panel Container inside an isolated Shadow DOM
     let uiContainer = null;
     let shadowRoot = null;

     function createSliderUI(x, y) {
         if (uiContainer) uiContainer.remove();

         uiContainer = document.createElement('div');
         uiContainer.id = "ext-darkness-slider-container";
         
         uiContainer.addEventListener('click', (e) => e.stopPropagation());
         uiContainer.addEventListener('dblclick', (e) => e.stopPropagation());

         shadowRoot = uiContainer.attachShadow({ mode: 'open' });

         const styles = document.createElement('style');
         styles.innerHTML = `
             .floating-trigger {
                 position: fixed;
                 left: ${x}px;
                 top: ${y}px;
                 z-index: 2147483647;
                 background: #3a3a3c;
                 border: 2px solid #64d2ff;
                 border-radius: 50%;
                 width: 40px;
                 height: 40px;
                 cursor: pointer;
                 box-shadow: 0px 4px 12px rgba(0,0,0,0.5);
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 font-size: 18px;
                 transition: transform 0.2s ease;
             }
             .floating-trigger:hover { transform: scale(1.1); }
             
             .slider-card {
                 position: fixed;
                 left: ${x}px;
                 top: ${y + 50}px;
                 z-index: 2147483647;
                 background: #1c1c1e;
                 border: 1px solid #3a3a3c;
                 border-radius: 12px;
                 padding: 12px 16px;
                 box-shadow: 0px 8px 24px rgba(0,0,0,0.6);
                 display: none;
                 flex-direction: column;
                 gap: 8px;
                 width: 200px;
                 font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
             }
             .slider-card label {
                 color: #ffffff;
                 font-size: 12px;
                 font-weight: bold;
             }
             .range-input {
                 -webkit-appearance: none;
                 width: 100%;
                 background: #3a3a3c;
                 height: 6px;
                 border-radius: 3px;
                 outline: none;
             }
             .range-input::-webkit-slider-thumb {
                 -webkit-appearance: none;
                 background: #64d2ff;
                 width: 16px;
                 height: 16px;
                 border-radius: 50%;
                 cursor: pointer;
             }
         `;
         shadowRoot.appendChild(styles);

         const trigger = document.createElement('div');
         trigger.className = 'floating-trigger';
         trigger.innerHTML = '🌓';
         
         const card = document.createElement('div');
         card.className = 'slider-card';
         card.innerHTML = `
             <label>Darkness Intensity</label>
             <input type="range" class="range-input" min="0" max="100" value="${localStorage.getItem('ext-dark-val') || 50}">
         `;

         shadowRoot.appendChild(trigger);
         shadowRoot.appendChild(card);
         document.documentElement.appendChild(uiContainer);

         trigger.addEventListener('click', () => {
             const isVisible = card.style.display === 'flex';
             card.style.display = isVisible ? 'none' : 'flex';
         });

         const slider = card.querySelector('.range-input');
         slider.addEventListener('input', (e) => {
             updateDarknessLevel(e.target.value);
             localStorage.setItem('ext-dark-val', e.target.value);
         });
     }

     // 4. Laptop Gesture Handler: Watch for double clicks/taps
     window.addEventListener('dblclick', (e) => {
         if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'VIDEO') return;

         const spawnX = Math.min(e.clientX, window.innerWidth - 240);
         const spawnY = Math.min(e.clientY, window.innerHeight - 150);

         createSliderUI(spawnX, spawnY);
     });

     window.addEventListener('click', () => {
         if (uiContainer) {
             const card = shadowRoot.querySelector('.slider-card');
             if (card) card.style.display = 'none';
         }
     });
 })();
