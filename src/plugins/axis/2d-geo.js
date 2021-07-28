import {
    mat2d, vec2,
} from 'gl-matrix';

class Geo2D{
    constructor() {
        this.name = 'Geo2D';
        this.animationContext = {};
    }

    apply(globalCtx) {
        globalCtx.hooks.afterDataAndLayoutReady.tap(this.name, () => {
            this.reFlow(globalCtx);
        });
        globalCtx.Coordinate.hooks.initCoord.tap(this.name, (context2d) => {
            this.init(context2d, globalCtx);
        });
    }

    reFlow(globalCtx) {
        globalCtx.effect(() => {
            console.log('effect Geo2D layout');
            const {
                bounding
            } = globalCtx.Layout;
            const boundingBox = globalCtx.boundingBox;

            const mtx = mat2d.fromValues(1, 0, 0, 1, bounding.left, bounding.top);
            const imtx = mat2d.create();
            mat2d.invert(imtx, mtx);

            Object.assign(globalCtx.Layout, {
                translateMtx: mtx,
                translateMtxInvert: imtx,
                spanHorizontal: boundingBox.width - bounding.left - bounding.right,
                spanVertical: boundingBox.height - bounding.top - bounding.bottom
            });
        });
    }

    init(context2d, globalCtx) {
        globalCtx.effect(() => {
            console.log('effect init coord')
            const {
                translateMtx,
                translateMtxInvert,
                spanHorizontal,
                spanVertical,
            } = globalCtx.Layout;

            /**
                                              | 1  0  spanHorizontal/2 |
                mtx = DPRMAT * translateMtx * | 0  1  spanVertical/2   |
                                              | 0  0  1                |
             */
            
            const mtx = mat2d.fromValues(1, 0, 0, 1, spanHorizontal/2, spanVertical/2);
            const imtx = mat2d.create();
            mat2d.invert(imtx, mtx);
            mat2d.multiply(mtx, translateMtx, mtx);
            mat2d.multiply(imtx, imtx, translateMtxInvert);

            const a = mat2d.create();
            const ia = mat2d.create();
            mat2d.multiply(a, globalCtx.DPRMat, mtx);
            mat2d.invert(ia, a);

            const originVec = vec2.fromValues(spanHorizontal/2, spanVertical/2);
            vec2.transformMat2d(originVec, originVec, imtx);

            Object.assign(globalCtx.Coordinate.transformMeta, {
                originVec,
                transformMtxRaw: mat2d.clone(mtx),
                transformMtxRawInvert: mat2d.clone(imtx),
                transformMtx: mat2d.clone(a),
                transformMtxInvert: mat2d.clone(ia),
            });

        });
    }
}

export default Geo2D;