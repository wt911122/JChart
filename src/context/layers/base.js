class BaseContext {
    get context2d() {
        return this._context2d;
    }
    get canvasElm() {
        return this._canvasElm;
    }
    set context2d(val) {
        if (this._context2d) {
            throw 'you cannot replace context2d!';
        }
        this._context2d = val;
    }
    set canvasElm(val) {
        if (this._canvasElm) {
            throw 'you cannot replace canvasElm!';
        }
        this._canvasElm = val;
    }

    get canvasCacheImage() {
        const width = this._canvasElm.width;
        const height = this._canvasElm.height;
        return this.context2d.createImageData(width, height);
    }
}
export default BaseContext;