import colorString from 'color-string';
import { effect } from '@vue/reactivity';
import {
    vec2,
} from 'gl-matrix';
import { AnimeArray, AnimeNumber, makeRenderCallback } from '../../animation/anime';
import {
    // REFERENCE_TYPE,
    distToSegmentSquared,
    pointInPolygon,
    distToBezierSegmentSquared,
    bezierPoints,
} from '../../shared/utils';
import { findDataInSeries } from './utils';


class LineChart {
    constructor(options) {
        this.name = 'LineChart';
        this.options = Object.assign({
            smooth: false,
            pointRadius: 0,
            fill: false,
        }, options);

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
            // const {
            //     spanHorizontal,
            // } = globalCtx.Layout;
            const {
                convertDataToCoordX,
                convertDataToCoordY,
            } = globalCtx.Coordinate.transformMeta;
            const {
                getColor,
            } = globalCtx.theme;

            const seriesInCoord = [];
            const seriesMeta = [];
            const series = data.slice();
            legend.slice().forEach((d, sid) => {
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
                    const p = { x, y, lastY };
                    const lastp = { x, y: lastY };

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
                    });
                        
                    animeArr.push({
                        x, y, lastY 
                    });
                    points.push({
                        x, y, lastY 
                    });
                });

                seriesInCoord.push({
                    theme,
                    legend: { ...d },
                    isStack,
                    points,
                });

                if(!this.animationContext[d.name]) {
                    this.animationContext[d.name] = {
                        points: new AnimeArray({
                            startArray: animeArr,
                            duration: 550,
                            renderCallback,
                            callBackOnMakeUp(makeup, ratio) {
                                return makeup.map(p => ({
                                    x: p.x * ratio,
                                    y: p.y,
                                    lastY: p.lastY,
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
                                    };
                                }
                            }
                        }),
                        clipX: new AnimeNumber({
                            startNumber: 0,
                            duration: 1000,
                            renderCallback,
                        }),
                        opacity: new AnimeNumber({
                            startNumber: 0.4,
                            duration: 250,
                            renderCallback,
                        }),
                        subOpacity: new AnimeNumber({
                            startNumber: 1,
                            duration: 250,
                            renderCallback,
                        }),
                    };
                }
            });
            Object.assign(globalCtx.Chart.chartMeta, {
                seriesInCoord,
                seriesMeta: Object.values(seriesMeta).sort((a, b) => a.x - b.x),
            });
        });

        effect(() => {
            // 避免主图多次重绘
            const {
                seriesMeta,
            } = globalCtx.Chart.chartMeta;
            const { 
                x, y
            } = globalCtx._mouse;
            const {
                top,
                bottom,
            } = globalCtx.Layout;
            const {
                transformMtxRawInvert,
                xAxisY,
            } = globalCtx.Coordinate.transformMeta;
            const stack = globalCtx.globalData.source.stack;
            if(y > bottom || y < top) {
                globalCtx.Chart.chartMeta.focused = null;
                return;
            }
            const vec = vec2.fromValues(x, y);
            vec2.transformMat2d(vec, vec, transformMtxRawInvert);
            const segment = findDataInSeries(vec[0], seriesMeta);

            if (segment) {
                const [ x, y ] = vec;
                const {
                    curr, next,
                } = segment;
                const l = curr.series.length;
                const cs = curr.series;
                const ns = next.series;
                let sfocus = null;
                if (stack && this.options.fill) {
                    for (let i = 0; i < l; i++) {
                        const b1 = [ cs[i].p.x, cs[i].p.y ];
                        const b2 = cs[i - 1] ? [ cs[i - 1].p.x, cs[i - 1].p.y ] : [ curr.x, xAxisY ];

                        const c1 = [ ns[i].p.x, ns[i].p.y ];
                        const c2 = ns[i - 1] ? [ ns[i - 1].p.x, ns[i - 1].p.y ] : [ next.x, xAxisY ];
                        if (pointInPolygon([ x, y ], [ b2, b1, c1, c2 ])) {
                            sfocus = i;
                        }
                    }
                } else {
                    for (let i = 0; i < l; i++) {
                        if (!ns[i]) continue;
                        const b = cs[i].p;
                        const c = ns[i].p;
                        const func = this.options.smooth ? distToBezierSegmentSquared : distToSegmentSquared;
                        const distance = func(vec, [ b.x, b.y ], [ c.x, c.y ]);
                        if (distance < 100) {
                            sfocus = i;
                        }
                    }
                }

                const belong = segment[segment.belong];
                const meta = { belong, mouse: { x, y } };
                if (sfocus !== null) {
                    meta.currLegend = curr.series[sfocus].legend;
                }  
                globalCtx.Chart.chartMeta.focused = meta;
            } else {
                globalCtx.Chart.chartMeta.focused = null;
            }
        });
    }

    drawSeriesLine(ctx, data, smooth, getPoint) {
        for (let l = 0; l < data.length - 1; l++) {
            const p2 = data[l + 1];
            if (smooth) {
                const p1 = data[l];
                const points = bezierPoints(getPoint(p1), getPoint(p2));
                ctx.bezierCurveTo(...points);
            } else {
                ctx.lineTo.apply(ctx, getPoint(p2));
            }
        }
    }

    drawLine(lgname, theme, spanVertical, ctx, xAxisY, isStack) {
        const currentAnimeContext = this.animationContext[lgname];
        const {
            smooth, 
            fill
        } = this.options;
        ctx.beginPath();
        ctx.functionCallWithDynamicParameter(
            'rect', 0, 0,
            () => currentAnimeContext.clipX.value,
            spanVertical
        );
        ctx.clip();
        ctx.beginPath();

        const getP = p => [p.x, p.y];
        const getPlast = p => [p.x, p.lastY];

        ctx.functionsCall(
            (ctx) => {
                const data = currentAnimeContext.points.value;
                
                ctx.moveTo(data[0].x, data[0].y);
                this.drawSeriesLine(ctx, data, smooth, getP);
                ctx.stroke();
                if(fill) {
                    const fillColor = colorString.to.rgb([
                        ...theme.color.slice(0, 3),
                        currentAnimeContext.opacity.value,
                    ]);
                    if(isStack) {
                        const reversedDATA = data.slice().reverse();
                        ctx.lineTo(reversedDATA[0].x, reversedDATA[0].lastY);
                        this.drawSeriesLine(ctx, reversedDATA, smooth, getPlast);
                        ctx.closePath();
                    }else {
                        ctx.lineTo(data[data.length - 1].x, xAxisY);
                        ctx.lineTo(data[0].x, xAxisY);
                        ctx.closePath();
                    }
                    ctx.fillStyle = fillColor;
                    ctx.fill();
                }
            }
        );
    }

    render(ctx, globalCtx) {
        console.log('render');
        const {
            spanVertical,
        } = globalCtx.Layout;
        const seriesInCoord = globalCtx.Chart.chartMeta.seriesInCoord;
        const xAxisY = globalCtx.Coordinate.transformMeta.xAxisY;

        seriesInCoord.forEach(({ legend, theme, isStack }) => {
            ctx.addConditionBlockBegin(() => legend.disabled);
            const lgname = legend.name;
            const currentAnimeContext = this.animationContext[lgname];
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = ctx.fillStyle = colorString.to.rgb([
                ...theme.color.slice(0, 3),
                currentAnimeContext.subOpacity.value,
            ]);

            this.drawLine(lgname, theme, spanVertical, ctx, xAxisY, isStack);
            ctx.restore();
            ctx.addConditionBlockEnd();
        });
    }

    afterRender(context2d, globalCtx) {
        globalCtx.effect(() => {
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            const {
                spanHorizontal,
            } = globalCtx.Layout;

            seriesInCoord.forEach(({ legend, points }) => {
                this.animationContext[legend.name].clipX.animeTo(spanHorizontal);
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
                        curr.opacity.animeTo(0.4);
                        curr.subOpacity.animeTo(1);
                    } else {
                        curr.opacity.animeTo(0.1);
                        curr.subOpacity.animeTo(0.6);
                    }
                } else {
                    curr.opacity.animeTo(0.4);
                    curr.subOpacity.animeTo(1);
                }
            });
        });
    }
    
}

export default LineChart;