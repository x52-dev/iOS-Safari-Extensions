//This is for comic/manga reading, it fetches all images from website even if images has been lazy loaded. It then creates
// a seperate window with all the images(Theatre).
(function() {
     // Array to store valid manga page image URLs
     let discoveredImages = new Set();
     let currentImageIndex = 0;
     let zoomScale = 1;

     // UI Elements (Living inside our safe Shadow DOM)
     let readerContainer = null;
     let shadowRoot = null;

     // 1. Core Scraper: Inspect and filter images based on sizing and rules
     function extractMangaImages() {
         // Scan all img tags on the page
         const imgElements = document.querySelectorAll('img');

         imgElements.forEach(img => {
             // Manga sites love hiding actual images behind lazy loading attributes
             const targetSrc = img.getAttribute('data-src') ||
                               img.getAttribute('data-lazy') ||
                               img.getAttribute('data-original') ||
                               img.src;

             if (!targetSrc || targetSrc.startsWith('data:image/svg') || discoveredImages.has(targetSrc)) return;

             // Pre-filter mechanism using image dimensions
             // naturalWidth/Height checks actual file pixels instead of CSS presentation sizing
             if (img.complete) {
                 validateAndAdd(img.naturalWidth, img.naturalHeight, targetSrc);
             } else {
                 // If the image hasn't loaded yet, wait for its metadata to process sizing
                 img.addEventListener('load', function() {
                     validateAndAdd(this.naturalWidth, this.naturalHeight, targetSrc);
                 });
             }
         });
     }

     function validateAndAdd(width, height, src) {
         // Filter out icons, small emojis, tracking pixels, and tiny interface banners
         if (width >= 200 && height >= 200) {
             discoveredImages.add(src);
             updateReaderCounter();
         }
     }

     // 2. Setup MutationObserver to grab images that lazy-load while scrolling
     const observer = new MutationObserver(() => {
         extractMangaImages();
     });
     observer.observe(document.documentElement, { childList: true, subtree: true });
     extractMangaImages(); // Initial run

     // 3. Inject a Floating Launch Button into the main webpage
     function injectLaunchButton() {
         if (document.getElementById('manga-fetcher-trigger')) return;

         const launchBtn = document.createElement('div');
         launchBtn.id = 'manga-fetcher-trigger';
         launchBtn.innerHTML = '📖 Read Manga';
         
         // Style the floating activator pill
         Object.assign(launchBtn.style, {
             position: 'fixed',
             bottom: '20px',
             right: '20px',
             zIndex: '2147483646',
             background: '#007aff',
             color: '#ffffff',
             padding: '12px 20px',
             borderRadius: '30px',
             fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
             fontSize: '14px',
             fontWeight: 'bold',
             cursor: 'pointer',
             boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
             userSelect: 'none'
         });

         launchBtn.addEventListener('click', () => {
             if (discoveredImages.size > 0) {
                 openMangaReader();
             } else {
                 alert('No manga sheets (images > 200x200) detected on this layout page yet.');
             }
         });

         document.documentElement.appendChild(launchBtn);
     }
     
     injectLaunchButton();

     function updateReaderCounter() {
         const btn = document.getElementById('manga-fetcher-trigger');
         if (btn) {
             btn.innerHTML = `📖 Read Manga (${discoveredImages.size})`;
         }
     }

     // 4. Create the Immersive Reader UI Framework (Inside Shadow DOM)
     function openMangaReader() {
         if (readerContainer) readerContainer.remove();

         currentImageIndex = 0;
         zoomScale = 1;
         const imgArray = Array.from(discoveredImages);

         readerContainer = document.createElement('div');
         readerContainer.id = 'manga-reader-overlay';
         shadowRoot = readerContainer.attachShadow({ mode: 'open' });

         const styles = document.createElement('style');
         styles.innerHTML = `
             .overlay {
                 position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                 background: rgba(10, 10, 10, 0.98); z-index: 2147483647;
                 display: flex; align-items: center; justify-content: center;
                 font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                 overflow: hidden; touch-action: none;
             }
             .close-btn {
                 position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.15);
                 color: white; border: none; padding: 10px 16px; border-radius: 20px;
                 cursor: pointer; font-size: 14px; font-weight: bold; z-index: 10;
             }
             .nav-btn {
                 position: absolute; top: 50%; transform: translateY(-50%);
                 background: rgba(0, 0, 0, 0.6); color: white; border: none;
                 width: 50px; height: 50px; border-radius: 50%; cursor: pointer;
                 font-size: 24px; display: flex; align-items: center; justify-content: center;
                 z-index: 5; user-select: none; transition: background 0.2s;
             }
             .nav-btn:hover { background: rgba(0, 74, 153, 0.8); }
             .prev-btn { left: 20px; }
             .next-btn { right: 20px; }
             
             .viewport {
                 width: 100%; height: 100%; display: flex; align-items: center;
                 justify-content: center; overflow: hidden;
             }
             .manga-img {
                 max-width: 95%; max-height: 95%; object-fit: contain;
                 transition: transform 0.15s ease-out;
                 transform: scale(${zoomScale});
                 user-select: none; -webkit-user-drag: none;
             }
             .counter {
                 position: absolute; bottom: 20px; background: rgba(0,0,0,0.7);
                 color: #aaa; padding: 6px 14px; border-radius: 15px; font-size: 12px;
             }
             .zoom-controls {
                 position: absolute; top: 20px; left: 20px; display: flex; gap: 8px; z-index: 10;
             }
             .zoom-btn {
                 background: rgba(255,255,255,0.15); color: white; border: none;
                 width: 36px; height: 36px; border-radius: 8px; font-size: 18px; cursor: pointer;
             }
         `;
         shadowRoot.appendChild(styles);

         const overlay = document.createElement('div');
         overlay.className = 'overlay';

         overlay.innerHTML = `
             <div class="zoom-controls">
                 <button class="zoom-btn" id="z-in">+</button>
                 <button class="zoom-btn" id="z-out">-button>
             </div>
             <button class="close-btn" id="close-reader">Exit</button>
             <button class="nav-btn prev-btn" id="prev-page">‹</button>
             <div class="viewport">
                 <img class="manga-img" id="manga-sheet" src="${imgArray[currentImageIndex]}">
             </div>
             <button class="nav-btn next-btn" id="next-page">›</button>
             <div class="counter" id="page-counter">1 / ${imgArray.length}</div>
         `;

         shadowRoot.appendChild(overlay);
         document.documentElement.appendChild(readerContainer);

         // UI Target References
         const mangaImg = shadowRoot.getElementById('manga-sheet');
         const counter = shadowRoot.getElementById('page-counter');

         function renderPage() {
             zoomScale = 1;
             mangaImg.style.transform = `scale(${zoomScale})`;
             mangaImg.src = imgArray[currentImageIndex];
             counter.innerHTML = `${currentImageIndex + 1} / ${imgArray.length}`;
         }

         // Navigation Controllers
         function nextPage() {
             if (currentImageIndex < imgArray.length - 1) {
                 currentImageIndex++;
                 renderPage();
             }
         }

         function prevPage() {
             if (currentImageIndex > 0) {
                 currentImageIndex--;
                 renderPage();
             }
         }

         // Click Event Bindings
         shadowRoot.getElementById('next-page').addEventListener('click', (e) => { e.stopPropagation(); nextPage(); });
         shadowRoot.getElementById('prev-page').addEventListener('click', (e) => { e.stopPropagation(); prevPage(); });
         shadowRoot.getElementById('close-reader').addEventListener('click', () => readerContainer.remove());
         
         // Zoom Engine Binding
         shadowRoot.getElementById('z-in').addEventListener('click', (e) => {
             e.stopPropagation(); zoomScale += 0.25; mangaImg.style.transform = `scale(${zoomScale})`;
         });
         shadowRoot.getElementById('z-out').addEventListener('click', (e) => {
             e.stopPropagation(); if(zoomScale > 0.5) zoomScale -= 0.25; mangaImg.style.transform = `scale(${zoomScale})`;
         });

         // Laptop / Hardware Keyboard Listener (Left/Right Arrows)
         const keyListener = (e) => {
             if (e.key === "ArrowRight") nextPage();
             if (e.key === "ArrowLeft") prevPage();
             if (e.key === "Escape") {
                 readerContainer.remove();
                 window.removeEventListener('keydown', keyListener);
             }
         };
         window.addEventListener('keydown', keyListener);

         // Cross-Platform Mobile Swiping & Trackpad Gestures (Touch Integration)
         let touchStartX = 0;
         overlay.addEventListener('touchstart', (e) => {
             touchStartX = e.changedTouches[0].screenX;
         }, { passive: true });

         overlay.addEventListener('touchend', (e) => {
             let touchEndX = e.changedTouches[0].screenX;
             let swipeDistance = touchEndX - touchStartX;
             
             // Safe swipe detection thresholds (greater than 60 pixels horizontal movement)
             if (swipeDistance < -60) nextPage();
             if (swipeDistance > 60) prevPage();
         }, { passive: true });
     }
 })();
