import colorString from 'color-string';

function getDefaultLegendContent(container, disableselect) {
    const element = document.createElement('div');
    element.setAttribute('style', `
        z-index: 1;
        max-height: 35%;
        overflow-y: scroll;
        line-height: 1em;
        padding: 5px 20px;
    `);
    let focused;
    function createLegendElem(meta, legendMeta) {
        const elem = document.createElement('div');
        elem.setAttribute('style', `
            white-space: nowrap;
            cursor: pointer;
            user-select: none;
            font-size: .8em;
            line-height: 1em;
            display: inline-block;
            padding: 0 .5em;
        `);
        elem.setAttribute('active', meta.legend.disabled);
        const span = document.createElement('span');
        span.setAttribute('style', `
            display:inline-block;
            width:.5em;
            height:.5em;
            border-radius:100%;
            margin-right: .1em;
            vertical-align: middle;
            background: ${meta.color[meta.legend.disabled ? 'disable' : 'enable']}
        `);
        
        const name = document.createElement('span');
        name.innerText = meta.legend.name;

        elem.appendChild(span);
        elem.appendChild(name);
        
        elem.addEventListener('click', () => {
            if(disableselect) {
                meta.legend.disabled = !meta.legend.disabled;
                elem.setAttribute('active', meta.legend.disabled);
                span.style.background = meta.color[meta.legend.disabled ? 'disable' : 'enable'];
            } else {
                if (focused && focused.name === meta.legend.name) {
                    legendMeta.forEach(l => {
                        l.legend.disabled = false;
                        elem.setAttribute('active', false);
                        span.style.background = meta.color.enable;
                    });
                    focused = null;
                } else {
                    focused = meta.legend;
                    legendMeta.forEach(l => {
                        l.legend.disabled = (focused.name !== l.legend.name);
                        elem.setAttribute('active', l.legend.disabled);
                        span.style.background = meta.color[l.legend.disabled ? 'disable' : 'enable'];
                    });
                }
            }
            
        });

        return elem;
    }

    container.appendChild(element);
    return function (legendMeta) {
        element.innerHTML = '';
        console.log(legendMeta);
        legendMeta.forEach(meta => {
            const elem = createLegendElem(meta, legendMeta);
            element.appendChild(elem);
        });
        return element;
    };
}

class Legend {
    constructor(options = {}) {
        this.name = 'LegendPlugin';
        this.options = options;
    }

    apply(globalCtx) {
        globalCtx.hooks.beforeInitGlobalLayout.tap(this.name, (container, layoutContext) =>{
            this.legendContentCallback = this.options.callback || getDefaultLegendContent(container, this.options.disableselect);
            this.init(container, globalCtx, layoutContext);
        });
        // globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, container => {
        //     this.init(container, globalCtx);
        // });
    }

    init(container, globalCtx, layoutContext) {
        globalCtx.effect(() => {
            const {
                legend,
            } = globalCtx.globalData.source;
            const getColor = globalCtx.theme.getColor;
            const legendMeta = legend.map((l, idx) => ({
                legend: l,
                color: {
                    enable: colorString.to.rgb(getColor(idx).color),
                    disable: colorString.to.rgb(getColor(idx).disabledColor),
                },
            }));
            const elem = this.legendContentCallback && this.legendContentCallback(legendMeta);
            layoutContext.legendWrapper = elem;
        });
    }
}

export default Legend;