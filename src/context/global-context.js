import { SyncHook } from 'tapable';
import { effect, reactive } from '@vue/reactivity';
import { initSchedule } from '../schedule/index.js';
import Data from './layers/data';
import Coordinate from './layers/coordinate';
import Chart from './layers/chart';
import Overlayer from './layers/overlayer';
import { createCanvas, clearCanvas, destroyCanvas } from './utils';
import contextProxy from '../context-api/context-proxy';

class GlobalContext {
    constructor() {
        const {
            queueJob,
            nextTick,
        } = initSchedule();
        this.effect = (fn) => {
            effect(fn, { scheduler: queueJob });
        };
        this.$nextTick = nextTick;
        // this.globalData = globalData;

        this.boundingBox = reactive({
            width: 0,
            height: 0,
        });
        this.DPRMat = null;
        this.DPR = 0;
        this.theme = {
            getColor: undefined,
            fontSize: undefined,
        };

        this._mouse = reactive({
            x: undefined,
            y: undefined,
            event: undefined,
        });

        this.Layout = reactive({
            translateMtx: undefined,
            translateMtxInvert: undefined,
            spanHorizontal: undefined,
            rawSpanHorizontal: undefined,
            spanVertical: undefined,
            xStep: undefined,
            xScaler: undefined,
            yStep: undefined,
            yScaler: undefined,
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined,
            xFloat: undefined
        });

        this.hooks = Object.freeze({
            initTheme: new SyncHook([ 'container' ]),
            beforeInitGlobalLayout: new SyncHook([ 'container', 'layoutContext' ]),
            initGlobalLayout: new SyncHook([ 'container', 'layoutContext' ]),
            afterDataAndLayoutReady: new SyncHook(),
            initCanvas: new SyncHook([ 'canvas' ]),
            initContext: new SyncHook([ 'context', 'canvasElem', 'container' ]),
        });
        this.globalData = new Data();
        this.Coordinate = new Coordinate();
        this.Chart = new Chart();
        this.Overlayer = new Overlayer();
    }

    init(container, dataOptions) {
        this.hooks.initTheme.call(container);

        this.container = container;
        
        this.globalData.init(dataOptions);
        const layoutContext = {
            canvasWrapper: null,
            legendWrapper: null,
        };
        this.hooks.beforeInitGlobalLayout.call(container, layoutContext);
        
        return new Promise(r => {
            this.$nextTick(() => {
                this.hooks.initGlobalLayout.call(container, layoutContext);

                this.hooks.afterDataAndLayoutReady.call();
                this.initContext(layoutContext.canvasWrapper, (ContextProxy, canvas) => {
                    this.Coordinate.context2d = ContextProxy;
                    this.Coordinate.canvasElm = canvas;
                    this.Coordinate.init();
                });

                this.initContext(layoutContext.canvasWrapper, (ContextProxy, canvas) => {
                    this.Chart.context2d = ContextProxy;
                    this.Chart.canvasElm = canvas;
                    this.Chart.init();
                });

                this.initContext(layoutContext.canvasWrapper, (ContextProxy, canvas) => {
                    this.Overlayer.context2d = ContextProxy;
                    this.Overlayer.canvasElm = canvas;
                    this.Overlayer.init(layoutContext.canvasWrapper);
                });
                r();
            });
        });
    }

    initContext(container, callback) {
        const {
            context2d,
            canvas
        } = createCanvas(container);
        this.hooks.initCanvas.call(canvas);
        const ContextProxy = new contextProxy(context2d, true);
        this.hooks.initContext.call(ContextProxy, canvas, container);
        callback(ContextProxy, canvas);
    }

    setTransform(ctx) {
        const mtx = this.Coordinate.transformMeta.transformMtx;
        ctx.setTransform(mtx[0], mtx[1], mtx[2], mtx[3], mtx[4], mtx[5]);
    }

    render() {
        this.effect(() => {
            const {
                context2d,
                canvasElm
            } = this.Coordinate;
            clearCanvas(context2d, canvasElm);
            this.setTransform(context2d);
            this.Coordinate.render();
        });

        this.effect(() => {
            console.log('render begin');
            const {
                context2d,
                canvasElm
            } = this.Chart;
            clearCanvas(context2d, canvasElm);
            this.setTransform(context2d);
            this.Chart.render();
        });

        this.effect(() => {
            const {
                context2d,
                canvasElm,
            } = this.Overlayer;
            clearCanvas(context2d, canvasElm);
            this.setTransform(context2d);
            this.Overlayer.render();
        });

        this.Coordinate.afterRender();
        this.Chart.afterRender();
        this.Overlayer.afterRender();
    }

    resetData(options) {
        this.globalData.resetData(options);
    }

    destroy() {
        destroyCanvas(this.container, this.Overlayer.canvasElm);
        destroyCanvas(this.container, this.Chart.canvasElm);
        destroyCanvas(this.container, this.Coordinate.canvasElm);
    }
}

export default GlobalContext;