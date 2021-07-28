import { mat2d } from 'gl-matrix';

class DPIPlugin {
    apply(globalCtx) {
        globalCtx.hooks.initCanvas.tap('DPIPlugin', (canvasElem) => {
            globalCtx.effect(() => {
                const dpr = window.devicePixelRatio || 1;
                const rect = globalCtx.boundingBox;
                canvasElem.width = rect.width * dpr;
                canvasElem.height = rect.height * dpr;

                if(!globalCtx.DPRMat){
                    globalCtx.DPR = dpr;
                    globalCtx.DPRMat = mat2d.create();
                    mat2d.multiplyScalar(globalCtx.DPRMat, globalCtx.DPRMat, dpr);
                }

                canvasElem.style.position = "absolute";
                canvasElem.style.left = "0";
                canvasElem.style.top = "0";
                canvasElem.style.width = `${rect.width}px`;
                canvasElem.style.height = `${rect.height}px`;
            });
        });
    }
}

export default DPIPlugin;
