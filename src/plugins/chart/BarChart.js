import { effect } from '@vue/reactivity';
import {
    vec2,
} from 'gl-matrix';
import colorString from 'color-string';
import { AnimeArray, AnimeNumber, makeRenderCallback } from '../../animation/anime';
import { findDataInBarSeries } from './utils';
class BarChart {
    constructor() {
        this.name = 'BarChart';
        // this.options = Object.assign({
        //     gap: 5,
        // }, options);

        this.animationContext = {};
    }

    apply(globalCtx) {
        globalCtx.Chart.hooks.initChart.tap(this.name, context2d => {
            this.init(context2d, globalCtx);
        });
        globalCtx.Chart.hooks.renderChart.tap(this.name, context2d => {
            this.render(context2d, globalCtx);
        });
        globalCtx.Chart.hooks.afterRenderChart.tap(this.name, context2d => {
            this.afterRender(context2d, globalCtx);
        });
    }

    init(context2d, globalCtx) {
        const render = context2d.render.bind(context2d);
        const renderCallback = makeRenderCallback(render);
        globalCtx.effect(() => {
            console.log('effect init linechart');
            const {
                data,
                legend,
                stack: isStack,
            } = globalCtx.globalData.source;

            const {
                spanHorizontal
            } = globalCtx.Layout;

            const {
                convertDataToCoordX,
                convertDataToCoordY,
                xFloat,
            } = globalCtx.Coordinate.transformMeta;

            const {
                getColor,
            } = globalCtx.theme;

            let barWidth;
            let gap;
            let series_size = 0;

            data.forEach(d => {
                series_size = Math.max(d.length, series_size);
            });
            const legendLength = legend.filter(l => !l.disabled).length;
            
            const spanHorizontalwithpadding = (spanHorizontal - xFloat * 2);
            let series_step = spanHorizontalwithpadding / series_size;
            if (isStack) {
                const barLength = series_size + series_size - 1;
                if(barLength > 100) {
                    barWidth = spanHorizontalwithpadding / series_size;
                    gap = 0;
                } else {
                    barWidth = spanHorizontalwithpadding / barLength;
                    gap = barWidth/2;
                }
            } else {
                const barLength = series_size * legendLength + series_size - 1;
                if(barLength > 100) {
                    barWidth = spanHorizontalwithpadding / series_size / legendLength;
                    gap = 0;
                } else {
                    barWidth = spanHorizontalwithpadding / barLength;
                    gap = barWidth/2;
                }
            }

            const seriesInCoord = [];
            const seriesMeta = [];
            const series = data.slice();
            let lid = 0;
            legend.forEach((d, sid) => {
                const seri = series[sid].slice();
                const theme = getColor(sid);
                const animeArr = [];
                const points = [];
                
                seri.forEach((v) => {
                    const dx = v[0];
                    let dy;
                    let dyraw;
                    let ref;
                    if (isStack) {
                        dyraw = v[3];
                        dy = v[1];
                    } else {
                        dy = dyraw = v[1];
                    }

                    ref = dx;

                    const x = convertDataToCoordX(ref);
                    const y = convertDataToCoordY(dy);
                    const lastY = isStack ? convertDataToCoordY(v[2]) : 0;
                    const barx = isStack ? (x - gap) : (x - series_step/2 + gap + barWidth * lid);
                    const p = { 
                        x: barx, y, lastY
                    };
                    const lastp = { x: barx, y: lastY };

                    if (!seriesMeta[ref]) {
                        seriesMeta[ref] = {
                            x,
                            series: [],
                        };
                    }

                    seriesMeta[ref].series.push({
                        legend: { ...d },
                        p,
                        dx,
                        dy: dyraw,
                        theme,
                        lastp,
                        barWidth
                    });

                    animeArr.push({
                        x: barx, y: 0, lastY: 0, barWidth
                    });
                    points.push({
                        x: barx, y, lastY, barWidth
                    });
                });
                seriesInCoord.push({
                    theme,
                    legend: { ...d },
                    isStack,
                    points,
                });
                if(!d.disabled){
                    lid++;
                }
                if(!this.animationContext[d.name]) {
                    this.animationContext[d.name] = {
                        points: new AnimeArray({
                            startArray: animeArr,
                            duration: 550,
                            renderCallback,
                            callBackOnMakeUp(makeup, ratio, start) {
                                const startx = start ? start.x : 0;
                                console.log(ratio, startx)
                                return makeup.map(p => ({
                                    x: (p.x - startx) * ratio,
                                    y: 0,
                                    lastY: 0,
                                    barWidth,
                                }));
                            },
                            callbackOnElement(newState, oldState, idx, ratio, currentArray) {
                                if(ratio === 'end') {
                                    currentArray[idx] = {...newState};
                                } else {
                                    currentArray[idx] = {
                                        x: oldState.x + (newState.x-oldState.x) * ratio,
                                        y: oldState.y + (newState.y-oldState.y) * ratio, 
                                        lastY: oldState.lastY + (newState.lastY-oldState.lastY) * ratio, 
                                        barWidth: oldState.barWidth + (newState.barWidth-oldState.barWidth) * ratio,
                                    };
                                }
                            }
                        }),
                        // clipX: new AnimeNumber({
                        //     startNumber: 0,
                        //     duration: 1000,
                        //     renderCallback,
                        // }),
                        opacity: new AnimeNumber({
                            startNumber: 1,
                            duration: 250,
                            renderCallback,
                        }),
                        // subOpacity: new AnimeNumber({
                        //     startNumber: 1,
                        //     duration: 250,
                        //     renderCallback,
                        // }),
                    };
                }
            });
            
            Object.assign(globalCtx.Chart.chartMeta, {
                seriesInCoord,
                seriesMeta: Object.values(seriesMeta).sort((a, b) => a.x - b.x),
            });
        });

        effect(() => {
            const {
                seriesMeta,
            } = globalCtx.Chart.chartMeta;
            const { 
                x, y
            } = globalCtx._mouse;

            const {
                top,
                bottom,
                seriesStep
            } = globalCtx.Layout;
            const {
                transformMtxRawInvert,
            } = globalCtx.Coordinate.transformMeta;

            if(y > bottom || y < top) {
                globalCtx.Chart.chartMeta.focused = null;
                return;
            }

            const vec = vec2.fromValues(x, y);
            vec2.transformMat2d(vec, vec, transformMtxRawInvert);
            const meta = findDataInBarSeries(vec[0], vec[1], seriesMeta, seriesStep);
            if(meta) {
                globalCtx.Chart.chartMeta.focused = meta;
            } else {
                globalCtx.Chart.chartMeta.focused = null;
            }

        });
    }

    render(ctx, globalCtx) {
        const {
            seriesInCoord,
        } = globalCtx.Chart.chartMeta;
        seriesInCoord.forEach(({ theme, legend }) => {
            ctx.addConditionBlockBegin(() => legend.disabled);
            const lgname = legend.name;
            const currentAnimeContext = this.animationContext[lgname];
            ctx.save();
            ctx.lineWidth = 1;
            ctx.functionsCall(
                (ctx) => {
                    ctx.fillStyle = ctx.strokeStyle = colorString.to.rgb([
                        ...theme.color.slice(0, 3),
                        currentAnimeContext.opacity.value,
                    ]);
                    const data = currentAnimeContext.points.value;
                    for (let l = 0; l < data.length; l++) {
                        const p = data[l];
                        ctx.fillRect(p.x, p.lastY, p.barWidth, p.y - p.lastY);
                        ctx.strokeRect(p.x, p.lastY, p.barWidth, p.y - p.lastY);
                    }
                }
            );
            ctx.restore();
            ctx.addConditionBlockEnd();
        });
    }

    afterRender(context2d, globalCtx) {
        globalCtx.effect(() => {
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            seriesInCoord.forEach(({ legend, points }) => {             
                this.animationContext[legend.name].points.animeTo(points.slice());
            });
        });

        globalCtx.effect(() => {
            const focused = globalCtx.Chart.chartMeta.focused;
            const legend = globalCtx.globalData.source.legend;
            legend.filter(l => !l.disabled).forEach(l => {
                const name = l.name;
                const curr = this.animationContext[name];
                if(focused && focused.currLegend) {
                    if(name === focused.currLegend.name) {
                        curr.opacity.animeTo(1);
                    } else {
                        curr.opacity.animeTo(0.6);
                    }
                } else {
                    curr.opacity.animeTo(1);
                }
            });
        });
    }
}

export default BarChart;