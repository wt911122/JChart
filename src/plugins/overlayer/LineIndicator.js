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
    const title = document.createElement('p');
    element.appendChild(title);
    title.setAttribute('style', `
     text-align: center;
    margin: 0;
    line-height: 1.5em;`);
    element.style.display = 'none';

    const tablewrapper = document.createElement('table');
    tablewrapper.setAttribute('style', `
        color: #fff;
        font-size: 1em;
    `);
    function createtr(legend, color, data) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.setAttribute('style', 'padding: 2px 4px;');
        const colorspan = document.createElement('span');
        colorspan.setAttribute('style', `
            display:inline-block;
            width:.8em;
            height:.8em;
            border-radius:100%;
            margin-right:.5em;
            background:${color};`);
        td1.appendChild(colorspan);
        const titlespan = document.createElement('span');
        titlespan.innerText = legend;
        td1.appendChild(titlespan);
        const td2 = document.createElement('td');
        const dataspan = document.createElement('span');
        dataspan.innerText = data;
        td2.appendChild(dataspan);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.colorspan = colorspan;
        tr.titlespan = titlespan;
        tr.dataspan = dataspan;
        return tr;
    }
    function editTr(tr, legend, color, data) {
        tr.style.display = 'table-row';
        tr.colorspan.style.background = color;
        tr.titlespan.innerText = legend;
        tr.dataspan.innerText = data;
    }
    element.appendChild(title);
    element.appendChild(tablewrapper);
    container.appendChild(element);
    const trBuffer = [];
    return function(meta) {
        element.style.display = 'block';
        if(!meta.display) {
            element.style.display = 'none';
        } else {
            title.innerText = meta.xDimension;
            element.style.display = 'block';
            element.style.transform = `translate(${meta.x}px, ${meta.y}px)`;
            
            for(let idx in meta.series) {
                const s = meta.series[idx];
                if(trBuffer[idx]) {
                    editTr(trBuffer[idx], s.name, s.color, s.data);
                } else {
                    const trelem = createtr(s.name, s.color, s.data);

                    trBuffer[idx] = trelem;
                    tablewrapper.appendChild(trelem);
                }
            }

            const span = trBuffer.length - meta.series;
            if(span > 0){
                trBuffer.slice(meta.series.length).forEach(e => {e.style.display = 'none';});
            }
        }
    };

}
class LineIndicator {
    constructor(options = {}) {
        this.name = 'LineIndicator';
        this.overlayerAnimeCache = {};
        this.options = Object.assign({
            bar: false,
        }, options);
        
    }

    apply(globalCtx) {
        globalCtx.Overlayer.hooks.initOverlayer.tap(this.name, (container, context2d) => {
            this.floatContentCallback = this.options.callback || getDefaultFloatContent(container);
            this.init(container, context2d, globalCtx);
        });
        globalCtx.Overlayer.hooks.renderOverLayer.tap(this.name, (context2d) => {
            this.render(context2d, globalCtx);
        });
    }

    init(container, ctx, globalCtx) {
        const render = ctx.render.bind(ctx);
        const {
            xMeta,
            yMeta,
        } = globalCtx.globalData.sourceMeta;

        globalCtx.effect(() => {
            const cache = this.overlayerAnimeCache;
            const focused = globalCtx.Chart.chartMeta.focused;
            const sv = globalCtx.Layout.spanVertical;
            cache.spanVertical = sv;
            if (!focused) {
                cache.x = null;
                this.floatContentCallback && this.floatContentCallback({
                    display: false
                });
            } else {
                const belong = focused.belong;
                const { x, y } = globalCtx._mouse;
                // console.log(focused.mouse.x, focused.mouse.y)
                this.floatContentCallback && this.floatContentCallback({
                    display: true,
                    x,
                    y,
                    xDimension: xMeta.formatter(belong.series[0].dx),
                    series: belong.series.filter(s => !s.legend.disabled)
                        .map(({ legend, dy, theme }) => ({
                            name: legend.name,
                            color: colorString.to.rgb(theme.color),
                            data: yMeta.formatter(dy),
                            rawData: dy,
                        })),
                });
                cache.x = focused.belong.x;
            }
            render();
        });
    }

    render(ctx, globalCtx) {
        const bar = this.options.bar;
        const {
            seriesStep,
            spanVertical
        } = globalCtx.Layout;
        ctx.addConditionBlockBegin(() => !this.overlayerAnimeCache.x);
        ctx.lineWidth = 2;
        ctx.save();
        ctx.beginPath();
        ctx.functionsCall(
            (ctx) => {
                if(bar) {
                    ctx.fillStyle = 'rgba(233, 233, 233, 0.4)';
                    ctx.fillRect(
                        this.overlayerAnimeCache.x - seriesStep / 2,
                        0,
                        seriesStep,
                        spanVertical
                    );
                } else {
                    ctx.moveTo(this.overlayerAnimeCache.x, 0);
                    ctx.lineTo(this.overlayerAnimeCache.x, this.overlayerAnimeCache.spanVertical);
                }
  
            });
        ctx.strokeStyle = 'rgb(238, 238, 238)';
        ctx.stroke();
        ctx.restore();
        ctx.addConditionBlockEnd();
    }
}

export default LineIndicator;