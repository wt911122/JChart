import { reactive } from '@vue/reactivity';
import { SyncHook } from 'tapable';
class Data {
    constructor() {
        this.source = reactive({});
        this.sourceMeta = reactive({});

        this.hooks = Object.freeze({
            initData: new SyncHook([ 'dataOptions', 'source', 'sourceMeta' ]),
            // afterInitData: new SyncHook(),
            resetData: new SyncHook([ 'dataOptions', 'source', 'sourceMeta' ]),
        });
    }

    init(dataOptions) {
        this.hooks.initData.call(dataOptions, this.source, this.sourceMeta);
        // this.hooks.afterInitData.call();
    }

    resetData(dataOptions) {
        this.hooks.resetData.call(dataOptions, this.source, this.sourceMeta);
    }
}

export default Data;