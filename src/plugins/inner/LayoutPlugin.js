const DEFAULT_OPTION = {
    left: 0, right: 0, bottom: 0, top: 0,
};

class LayoutPlugin {
    constructor(options) {
        this.name = 'layoutPlugin';
        this.options = Object.assign({}, DEFAULT_OPTION, options);
    }
    apply(globalCtx) {
        globalCtx.hooks.afterDataAndLayoutReady.tap(this.name, () => {
            globalCtx.effect(() => {
                console.log('effect init layout');
                const {
                    left, right, bottom, top,
                    xFloat = 10,
                } = this.options;

                Object.assign(globalCtx.Layout, {
                    bounding: {
                        left, right, bottom, top,
                        xFloat
                    }
                });
                // console.log(globalCtx.Layout);
            });
        });
    }
}

export default LayoutPlugin;
