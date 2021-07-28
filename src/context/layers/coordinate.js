import { reactive } from '@vue/reactivity';
import { SyncHook } from 'tapable';
import { mat2d, vec2 } from 'gl-matrix';
import BaseContext from './base';
class Coordinate extends BaseContext {
    constructor() {
        super();
        this.hooks = {
            initCoord: new SyncHook([ 'context2d' ]),
            renderCoord: new SyncHook([ 'context2d' ]),
            afterRenderChart: new SyncHook([ 'context2d' ]),
        };

        this.transformMeta = reactive({
            originVec:              vec2.create(),
            borderVec:              vec2.create(),
            transformMtxRaw:        mat2d.create(),
            transformMtxRawInvert:  mat2d.create(),
            transformMtx:           mat2d.create(),
            transformMtxInvert:     mat2d.create(),
            convertDataToCoordX:    undefined,
            convertDataToCoordY:    undefined,
            x_scaler:               1,
            xFloat:                 0,
            formatFunc:             { xFormat: x => x },
        });
    }

    init() {
        this.hooks.initCoord.call(this.context2d);
    }

    render() {
        this.hooks.renderCoord.call(this.context2d);
    }

    afterRender() {
        this.hooks.afterRenderChart.call(this.context2d);
    }
}

export default Coordinate;