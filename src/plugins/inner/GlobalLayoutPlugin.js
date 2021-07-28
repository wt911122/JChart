class GlobalLayoutPlugin {
    constructor() {
        this.name = 'GlobalLayoutPlugin';

    }
    apply(globalCtx) {
        globalCtx.hooks.initGlobalLayout.tap(this.name, (container, layoutContext) =>{
            container.style.position = 'relative';
            container.style.display = 'flex';
            container.style['flex-direction'] = 'column';
            container.style['justify-content'] = 'flex-end';
            const chartcontainer = document.createElement('div');
            chartcontainer.setAttribute('style', `
                flex: 1;
                width: 100%;
                position: relative;
            `);

            container.prepend(chartcontainer);
            layoutContext.canvasWrapper = chartcontainer;
            const box = chartcontainer.getBoundingClientRect();
            globalCtx.boundingBox.width = box.width;
            globalCtx.boundingBox.height = box.height;
        });
    }
}

export default GlobalLayoutPlugin;