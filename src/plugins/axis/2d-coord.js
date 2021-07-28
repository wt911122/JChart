import {
    mat2d, vec2,
} from 'gl-matrix';
import { setTransform } from '../../context/utils';
import { AnimeArray, AnimeNumber, makeRenderCallback } from '../../animation/anime';
const cacheCanvas = document.createElement('canvas');
const cachhCanvasContext = cacheCanvas.getContext('2d');

class Coord2D{
    constructor() {
        this.name = 'Coord2D';
        this.animationContext = {};
    }

    apply(globalCtx) {
        globalCtx.Coordinate.hooks.initCoord.tap(this.name, (context2d) => {
            this.init(context2d, globalCtx);
        });
        globalCtx.Coordinate.hooks.renderCoord.tap(this.name, (context2d) => {
            this.render(context2d, globalCtx);
        });
        globalCtx.Coordinate.hooks.afterRenderChart.tap(this.name, context2d => {
            this.afterRender(context2d, globalCtx);
        });
        globalCtx.hooks.afterDataAndLayoutReady.tap(this.name, () => {
            this.reFlow(globalCtx);
        });
    }

    reFlow(globalCtx) {
        globalCtx.effect(() => {
            console.log('effect coord2d layout');
            const {
                bounding,
            } = globalCtx.Layout;
            const {
                /* eslint-disable-next-line*/
                legend, // don't remove !!!!  for no break function dependant chain
            } = globalCtx.globalData.source;
            const boundingBox = globalCtx.boundingBox;
            const {
                xMeta,
                yMeta,
            } = globalCtx.globalData.sourceMeta;
            const {
                fontSize,
            } = globalCtx.theme;

            
            let yTextWidth = 0;
            const textmin = yMeta.formatter(yMeta.min);
            const textmax = yMeta.formatter(yMeta.max);
            cachhCanvasContext.save();
            cachhCanvasContext.font = `${fontSize / 1.4}px arial`;
            cachhCanvasContext.lineWidth = 1.4;
            const ytext = textmin.length > textmax.length ? textmin : textmax;
            yTextWidth = cachhCanvasContext.measureText(`${ytext}000`).width;
            // console.log(ytext, yTextWidth);
            cachhCanvasContext.restore();
            const spanHorizontal = boundingBox.width - bounding.left - bounding.right - yTextWidth;
            const spanVertical = boundingBox.height - bounding.top - bounding.bottom;
            const {
                data,
            } = globalCtx.globalData.source;
            let series_size = 0;
            data.forEach(d => {
                series_size = Math.max(d.length, series_size);
            });
            const spanHorizontalwithpadding = (spanHorizontal - bounding.xFloat * 2);
            let seriesStep = spanHorizontalwithpadding / series_size;
                
            const mtx = mat2d.fromValues(1, 0, 0, 1, bounding.left + yTextWidth, bounding.top);
            const imtx = mat2d.create();
            mat2d.invert(imtx, mtx);
                
            Object.assign(globalCtx.Layout, {
                translateMtx: mtx,
                translateMtxInvert: imtx,
                spanHorizontal, 
                spanVertical,
                seriesStep,
                xStep: (spanHorizontal - bounding.xFloat * 2) / (xMeta.values.length - 1),
                xScaler: (spanHorizontal - bounding.xFloat * 2) / (xMeta.max - xMeta.min),
                yStep: spanVertical / (yMeta.values.length - 1),
                yScaler: spanVertical / (yMeta.max - yMeta.min),
                left: bounding.left + yTextWidth,
                right: boundingBox.width - bounding.left - yTextWidth,
                top: bounding.top,
                bottom: boundingBox.height - bounding.bottom,
                xFloat: bounding.xFloat,
                rawSpanHorizontal: boundingBox.width - bounding.left - bounding.right,
            });
            console.log(globalCtx.Layout)
        });
    }

    init(context2d, globalCtx) {
        const render = context2d.render.bind(context2d);
        const renderCallback = makeRenderCallback(render);
        globalCtx.effect(() => {
            console.log('effect init coord');
            const {
                legend,
            } = globalCtx.globalData.source;

            const {
                xMeta,
                yMeta,
            } = globalCtx.globalData.sourceMeta;
            
            // 没有可显示的legend 不需要重绘坐标系
            const disabledNum = legend.filter(l => l.disabled).length;
            const legendNum = legend.length;
            if (disabledNum === legendNum) {
                return;
            }

            const {
                translateMtx,
                translateMtxInvert,
                spanHorizontal,
                spanVertical,
                xFloat,
                xScaler,
                yScaler,
            } = globalCtx.Layout;

            /**
                                              | 1  0  0            |
                mtx = DPRMAT * translateMtx * | 0 -1  spanVertical |
                                              | 0  0  1            |
             */ 
            
            const mtx = mat2d.fromValues(1, 0, 0, -1, 0, spanVertical);
            const imtx = mat2d.create();
            mat2d.invert(imtx, mtx);
            mat2d.multiply(imtx, imtx, translateMtxInvert);
            mat2d.multiply(mtx, translateMtx, mtx);
            // widthDPI
            const a = mat2d.create();
            const ia = mat2d.create();
            mat2d.multiply(a, globalCtx.DPRMat, mtx);
            mat2d.invert(ia, a);

            // origin point ( left top point )
            const originVec = vec2.fromValues(0, 0);
            vec2.transformMat2d(originVec, originVec, imtx);

            // origin point ( right bottom point )
            const borderVec = vec2.fromValues(spanHorizontal, spanVertical);
            vec2.transformMat2d(borderVec, borderVec, imtx);

            const convertDataToCoordX = x => (x - xMeta.min) * xScaler + xFloat;
            const convertDataToCoordY = y => (y - yMeta.min) * yScaler;
            
            Object.assign(globalCtx.Coordinate.transformMeta, {
                originVec,
                borderVec,
                xAxisY: Math.max(0, convertDataToCoordY(0)),
                transformMtxRaw: mat2d.clone(mtx),
                transformMtxRawInvert: mat2d.clone(imtx),
                transformMtx: mat2d.clone(a),
                transformMtxInvert: mat2d.clone(ia),
                convertDataToCoordX,
                convertDataToCoordY,
            });
           

            if(!this.animationContext.yAxis) {
                
                this.animationContext.yAxis = new AnimeArray({
                    startArray: this.getNewYAxis(globalCtx),
                    duration: 550,
                    key: 'name',
                    renderCallback,
                    callbackOnElement(newState, oldState, idx, ratio, currentArray) {
                        if(ratio === 'end') {
                            currentArray[idx] = {...newState};
                        } else {
                            currentArray[idx] = {
                                name: newState.name,
                                value: oldState.value + (newState.value-oldState.value) * ratio,
                                fontvecX: oldState.fontvecX + (newState.fontvecX-oldState.fontvecX) * ratio,
                                fontvecY: oldState.fontvecY + (newState.fontvecY-oldState.fontvecY) * ratio,
                            };
                        }
                    }
                });

                this.animationContext.xAxisY = new AnimeNumber({
                    startNumber: Math.max(0, convertDataToCoordY(0)),
                    duration: 550,
                    renderCallback,
                });
            }
        });
    }

    getNewYAxis(globalCtx) {
        const xAxisbottom = globalCtx.theme.fontSize/2;
        const transformMtxRaw = globalCtx.Coordinate.transformMeta.transformMtxRaw;
        const yStep = globalCtx.Layout.yStep;
        return globalCtx.globalData.sourceMeta.yMeta.values.slice().map((target, idx) => {
            const value = yStep * idx;
            const vec = vec2.fromValues(-xAxisbottom, value);
            vec2.transformMat2d(vec, vec, transformMtxRaw);
            return {
                name: target,
                value,
                fontvecX: vec[0],
                fontvecY: vec[1],
            };
        });
    }

    drawGrid(ctx, globalCtx) {
        const {
            spanHorizontal,
        } = globalCtx.Layout;
        ctx.functionCallWithLooping(
            () => {
                return this.animationContext.yAxis.value;
            },
            (ctx, loopTarget, v) => {
                ctx.beginPath();
                ctx.moveTo(0, v.value);
                ctx.lineTo(spanHorizontal, v.value);
                ctx.stroke();
            });      
    }

    drawAxis(ctx, globalCtx) {
        const {
            xMeta,
            yMeta,
        } = globalCtx.globalData.sourceMeta;
        const DPRMat = globalCtx.DPRMat;
        const {
            spanHorizontal,
            spanVertical,
            xStep,
        } = globalCtx.Layout;
        const {
            transformMtxRaw,
            convertDataToCoordX,
        } = globalCtx.Coordinate.transformMeta;
        const {
            fontSize,
        } = globalCtx.theme;
        
        ctx.font = `${fontSize / 1.4}px arial`;
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.functionCallWithDynamicParameter('moveTo',
            spanHorizontal,
            () => this.animationContext.xAxisY.value);
        ctx.functionCallWithDynamicParameter('lineTo',
            0,
            () => this.animationContext.xAxisY.value);
        ctx.stroke();


        ctx.lineWidth = 0.7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        ctx.save();
        setTransform(ctx, DPRMat);
        ctx.functionCallWithLooping(
            () => {
                return this.animationContext.yAxis.value;
            },
            (ctx, loopTarget, v) => {
                const text = yMeta.formatter(v.name);
                ctx.fillText(text, v.fontvecX, v.fontvecY);
            });
        ctx.restore();

        // x轴数字
        ctx.textAlign = 'center';
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#e8e8e8';
        const xValues = xMeta.values;
        for (let i = 0; i < xValues.length; i++) {
            const xValue = xValues[i];
            const value = xValue.value;
            const x = convertDataToCoordX(value);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, spanVertical);

            ctx.stroke();
            ctx.save();
            const vec = vec2.fromValues(x, -fontSize);
            vec2.transformMat2d(vec, vec, transformMtxRaw);
            setTransform(ctx, DPRMat);
            const text = xMeta.formatter(value);
            ctx.wrapText(text, vec[0], vec[1], xStep / 2, fontSize);
            ctx.restore();
        }
    }

    render(ctx, globalCtx) {
        const { axis } = globalCtx.theme;
        ctx.lineWidth = axis.lineWidth;
        ctx.strokeStyle = axis.strokeStyle;
        ctx.save();
        this.drawGrid(ctx, globalCtx);
        this.drawAxis(ctx, globalCtx); 
        ctx.restore();


    }

    afterRender(context2d, globalCtx) {
        globalCtx.effect(() => {
            console.log('after effect coord');
            this.animationContext.yAxis.animeTo(this.getNewYAxis(globalCtx));
            this.animationContext.xAxisY.animeTo(globalCtx.Coordinate.transformMeta.xAxisY);
        });
    }
}
export default Coord2D;