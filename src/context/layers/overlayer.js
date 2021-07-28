import { reactive } from '@vue/reactivity';
import { SyncHook } from 'tapable';
import BaseContext from './base';

class Overlayer extends BaseContext {
    constructor() {
        super();
        this.hooks = {
            registOverlayer: new SyncHook(),
            initOverlayer: new SyncHook([ 'container', 'context2d' ]),
            renderOverLayer: new SyncHook([ 'context2d' ]),
            afterRenderChart: new SyncHook([ 'context2d' ]),
        };

        this.overLayerMeta = reactive({
            focus: undefined, // 聚焦的类别
        });
        this.registedRenderFunction = [];
        this.initFunctionCache = [];
        this.tempCache = {};
    }

    registElement() {
        this.hooks.registOverlayer.call();
    }

    init(container) {
        this.hooks.initOverlayer.call(container, this.context2d);
    }

    render() {
        this.hooks.renderOverLayer.call(this.context2d);
    }

    afterRender() {
        this.hooks.afterRenderChart.call(this.context2d);
    }
}
export default Overlayer;
