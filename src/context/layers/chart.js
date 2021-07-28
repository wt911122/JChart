import { reactive } from '@vue/reactivity';
import { SyncHook } from 'tapable';
import BaseContext from './base';
class Chart extends BaseContext {
    constructor() {
        super();
        this.hooks = {
            initChart: new SyncHook([ 'context2d' ]),
            renderChart: new SyncHook([ 'context2d' ]),
            afterRenderChart: new SyncHook([ 'context2d' ]),
        };
        this.chartMeta = reactive({
            seriesInCoord:      [], // legend 维度区分的信息   数据经过坐标系变换后的位置
            seriesMeta:         [], // x 维度纵向的信息   元数据信息
            // legendXInCoord:     {}, // 以x为索引的数据 x: [series1, series2, ... ]
            // xSeries:            [], // x索引列表
            // indexMapping:       [], // legend过滤后序列图
            focused:            null, // 当前聚焦数据集
            // lastFocused:        undefined, // 上一次聚焦数据集
            // focusSource:        undefined,
        });
    }

    init() {
        this.hooks.initChart.call(this.context2d);
    }

    render() {
        this.hooks.renderChart.call(this.context2d);
    }

    afterRender() {
        this.hooks.afterRenderChart.call(this.context2d);
    }
}
export default Chart;
