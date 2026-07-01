

const lowResCache = new Map();
const fullResCache = new Map();
const pendingElements = new Map();
let allLowResLoaded = false;

export function getProgressiveImage(url){
    return lowResCache.get(url) || url;
}

export function registerImageElement(url, element){
    if (!pendingElements.has(url)){
        pendingElements.set(url, new Set());
    }
    pendingElements.get(url).add(element);

    if (fullResCache.has(url)){
        element.src = url;
    } else{
        element.src = lowResCache.get(url) || url;
    }
}

export function preloadImagesLowRes(urls){
    return new Promise((resolve) => {
        let completed = 0;
        const total = urls.length;
        if (total === 0){
            resolve();
            return;
        }
    
        urls.forEach((url) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const w = img.width * 0.25;
                const h = img.height * 0.25;
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = img.width;
                finalCanvas.height = img.height;
                const finalCtx = finalCanvas.getContext('2d');
                finalCtx.imageSmoothingEnabled = false;
                finalCtx.drawImage(canvas, 0, 0, img.width, img.height);
                const lowResDataUrl = finalCanvas.toDataURL('image/jpeg', 0.7);
                lowResCache.set(url, lowResDataUrl);
                completed++;
                if (completed === total){
                    allLowResLoaded = true;
                    resolve();
                }
            };
            img.onerror = () => {
                completed++;
                if (completed === total){
                    allLowResLoaded = true;
                    resolve();
                }
            };
            img.src = url;
        });
    });
}

export function loadFullResImages(urls){
    urls.forEach((url) => {
        if (fullResCache.has(url)) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            fullResCache.set(url, true);
            if (pendingElements.has(url)){
                pendingElements.get(url).forEach(el => {
                    el.src = url;
                });
            }
        };
        img.onerror = () => { };
        img.src = url;
    });
}

export function getImageLoaadStatus(){
    return{
        lowResLoaded: allLowResLoaded,
        lowResCount: lowResCache.size,
    };
}

export function registerImagesInContainer(container) {
    if (!container) return;
    const images = container.querySelectorAll('img');
    images.forEach(img => {
        if (img.src) {
            registerImageElement(img.src, img);
        }
    });
}