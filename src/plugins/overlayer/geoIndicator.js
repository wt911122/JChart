import colorString from 'color-string';

function getDefaultFloatContent(container) {
    const element = document.createElement('div');
    element.setAttribute('style', `
        position:absolute;
        left:0;
        top:0;
        border: 1px solid #ddd;
        border-radius: 5px;
        color: #fff;
        font-size: .8em;
        z-index: 999;
        background: rgba(0, 0, 0, 0.6);
        pointer-events: none;
    `);
    element.style.display = 'none';
    const p = document.createElement('p');
    element.appendChild(p);
    p.setAttribute('style', `padding: 5px 10px;`);
    const colorspan = document.createElement('span');
    colorspan.setAttribute('style', `
        display:inline-block;
        width:.8em;
        height:.8em;
        border-radius:100%;
        margin-right:.5em;`);
    p.appendChild(colorspan);
    const titlespan = document.createElement('span');
    p.appendChild(titlespan);
    container.appendChild(element);
    return function(meta) {
        if(!meta.display) {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
            element.style.transform = `translate(${meta.x}px, ${meta.y}px)`;
            colorspan.style.background = meta.sery.color;
            titlespan.innerText = `${meta.sery.name}: ${meta.sery.data}`;
        }
        
    };
}
class GeoIndicator {
    constructor(options = {}) {
        this.name = 'GeoIndicator';
        this.options = options;
    }

    apply(globalCtx) {
        globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, (container, context2d) => {
            this.floatContentCallback = this.options.callback || getDefaultFloatContent(container);
            this.init(container, context2d, globalCtx);
        });
    }

    init(container, ctx, globalCtx) {
        const {
            formatter
        } = globalCtx.globalData.sourceMeta;
        globalCtx.effect(() => {
            const focused = globalCtx.Chart.chartMeta.focused;
            if (!focused) {
                this.floatContentCallback && this.floatContentCallback({
                    display: false
                });
            } else {
                const { x, y } = globalCtx._mouse;
                // console.log(focused.mouse.x, focused.mouse.y)
                this.floatContentCallback && this.floatContentCallback({
                    display: true,
                    x,
                    y,
                    // xDimension: xMeta.formatter(belong.series[0].dx),
                    sery: {
                        name: focused.legend.name,
                        color: colorString.to.rgb(focused.theme.color),
                        data: formatter(focused.dy),
                        rawData: focused.dy,
                    },
                });
            }
        });
    }
}

export default GeoIndicator;