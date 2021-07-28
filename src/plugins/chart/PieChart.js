import { effect } from '@vue/reactivity';
import {
    vec2
} from 'gl-matrix';
import colorString from 'color-string';
import { clone } from 'lodash';
import { AnimeArray, makeRenderCallback } from '../../animation/anime';

class PieChart {
    constructor(options = {}) {
        this.name = "PieChart";
        this.options = options;
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
            const {
                data,
                legend,
            } = globalCtx.globalData.source;

            const {
                spanHorizontal,
                spanVertical,
            } = globalCtx.Layout;
            const {
                getColor,
            } = globalCtx.theme;
            const padding = 50;
            const radius = (Math.min(spanHorizontal, spanVertical) - padding) /2;
            this.radius = radius;
            let sumup = 0;
            
            legend.forEach((l, sid) => {
                if(!l.disabled) {
                    sumup += data[sid];
                } 
            });
            const seriesInCoord = [];
            // const seriesMeta = [];
            let accu = 0;
            legend.forEach((l, sid) => {
                const theme = getColor(sid);
                let spanRadius = 0;
                const p =  {
                    startAngle: accu,
                    middleAngle: accu + spanRadius / 2,
                    endAngle: accu + spanRadius,
                    radius,
                    spanRadius,
                };
                if(!l.disabled) {
                    const d = data[sid];
                    const ratio = d / sumup;
                    spanRadius = ratio * Math.PI * 2;
                    Object.assign(p, {
                        middleAngle: accu + spanRadius / 2,
                        endAngle: accu + spanRadius,
                        spanRadius,
                    });

                    accu += spanRadius;
                    
                }
                
                seriesInCoord.push({
                    theme,
                    radius,
                    legend: l,
                    p,
                });
            });

            if(!this.animationContext.arcs) {
                const animeArr = legend.map(() => ({
                    startAngle: 0,
                    middleAngle: 0,
                    endAngle: 0,
                    spanRadius: 0,
                    radius,
                }));
                this.animationContext.arcs = 
                    new AnimeArray({
                        startArray: animeArr,
                        duration: 550,
                        renderCallback,
                        callBackOnMakeUp(makeup) {
                            return makeup.map(() => ({
                                startAngle: 0,
                                middleAngle: 0,
                                endAngle: 0,
                                radius,
                                spanRadius: 0,
                            }));
                        },
                        callbackOnElement(newState, oldState, idx, ratio, currentArray) {
                            if(ratio === 'end') {
                                currentArray[idx] = {...newState};
                            } else {
                                currentArray[idx] = {
                                    startAngle: oldState.startAngle + (newState.startAngle-oldState.startAngle) * ratio,
                                    middleAngle: oldState.middleAngle + (newState.middleAngle-oldState.middleAngle) * ratio, 
                                    endAngle: oldState.endAngle + (newState.endAngle-oldState.endAngle) * ratio, 
                                    spanRadius: oldState.spanRadius + (newState.spanRadius-oldState.spanRadius) * ratio,
                                    radius: oldState.radius + (newState.radius-oldState.radius) * ratio,
                                };
                            }
                        }
                    });
                
            }
            
            Object.assign(globalCtx.Chart.chartMeta, {
                seriesInCoord,
            });
        });

        effect(() => {
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            const { 
                x, y
            } = globalCtx._mouse;
            const {
                top,
                bottom,
                left,
                right
            } = globalCtx.Layout;
            const {
                transformMtxRawInvert,
            } = globalCtx.Coordinate.transformMeta;

            if(y > bottom || y < top || x < left || x > right) {
                globalCtx.Chart.chartMeta.focused = null;
                return;
            }

            const vec = vec2.fromValues(x, y);
            vec2.transformMat2d(vec, vec, transformMtxRawInvert);
            const x1 = vec[0];
            const y1 = vec[1];
            const dist = Math.hypot(x1, y1);
            if(dist > this.radius) {
                globalCtx.Chart.chartMeta.focused = undefined;
                return;
            }

            const x2 = 0;
            const y2 = 1;
            const dot = x1*x2 + y1*y2;
            const det = x1*y2 - y1*x2;

            let angle = Math.atan2(dot, det);
            if(angle < 0) {
                angle = Math.PI*2 + angle;
            }
            globalCtx.Chart.chartMeta.focused = seriesInCoord.findIndex((s) => {
                const { startAngle, endAngle } = s.p;
                return angle > startAngle && angle < endAngle;
            });

        });
    }

    render(ctx, globalCtx) {
        const {
            seriesInCoord,
        } = globalCtx.Chart.chartMeta;
        const {
            fontSize,
        } = globalCtx.theme;

        seriesInCoord.forEach(({ theme, legend, radius }, sid) => {
            const textRadius = radius + 20;
            // const lgname = legend.name;
            ctx.addConditionBlockBegin(() => this.animationContext.arcs.value[sid].spanRadius === 0);
            ctx.functionsCall(
                (ctx) => {
                    ctx.save();
                    ctx.beginPath();
                    const curArc = this.animationContext.arcs.value[sid];
                    ctx.fillStyle = ctx.strokeStyle = colorString.to.rgb(theme.color);
                    ctx.moveTo(0, 0);
                    ctx.arc(0,0,curArc.radius, curArc.startAngle, curArc.endAngle);
                    ctx.lineTo(0, 0);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(0, 0);

                    const middleAngle = curArc.middleAngle;
                    const sinr = Math.sin(middleAngle);
                    const cosr = Math.cos(middleAngle);
                    const textx = textRadius * cosr;
                    const texty = textRadius * sinr;
                    const dir = cosr / Math.abs(cosr);
                    const textsx = textx + dir * 20;

                    ctx.lineTo(textx, texty);
                    ctx.lineTo(textsx, texty);

                    ctx.stroke();
                    ctx.restore();
                            
                    ctx.textAlign = dir > 0 ? 'left' : 'right';
                    
                    ctx.fillText(`${legend.name}`,
                        textsx + dir * 10,
                        texty + fontSize/2);

                    ctx.restore();
                }
            );
            ctx.addConditionBlockEnd();
        });
    }

    afterRender(context2d, globalCtx) {
        globalCtx.effect(() => {
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            this.animationContext.arcs.animeTo(seriesInCoord.map(s => clone(s.p)));
        });

        globalCtx.effect(() => {
            const focused = globalCtx.Chart.chartMeta.focused;
            const legend = globalCtx.globalData.source.legend;
            const {
                seriesInCoord,
            } = globalCtx.Chart.chartMeta;
            const ps = seriesInCoord.map(s => clone(s.p)) 
            legend.forEach((l, lid) => {
                if(focused === lid) {
                    ps[lid].radius = this.radius * 1.15;
                } else {
                    ps[lid].radius = this.radius;
                }
            });
            this.animationContext.arcs.animeTo(ps);
        })
    }
}

export default PieChart;