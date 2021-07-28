export function createCanvas(container) {
    const canvasElem = document.createElement('canvas');
    const rect = container.getBoundingClientRect();
    canvasElem.width = rect.width;
    canvasElem.height = rect.height;
    container.appendChild(canvasElem);
    canvasElem.style.position = 'absolute';
    const context2d = canvasElem.getContext('2d');
    return { canvas: canvasElem, context2d };
}

export function clearCanvas(ctx, canvasElem) {
    ctx.clearCommands && ctx.clearCommands();
    const width = canvasElem.width;
    const height = canvasElem.height;
    ctx.setTransform();
    ctx.clearRect(0, 0, width, height);
}

export function setTransform(ctx, mtx) {
    ctx.setTransform(mtx[0], mtx[1], mtx[2], mtx[3], mtx[4], mtx[5]);
}

export function destroyCanvas(container, canvas) {
    container.removeChild(canvas);
}
// export function createRenderEffect(target, mtx) {
//     const {
//         context2d,
//         canvasElm,
//     } = target;
//     clearCanvas(context2d, canvasElm);
//     setTransform(context2d, mtx);
//     target.render();
// }