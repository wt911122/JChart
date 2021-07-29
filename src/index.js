import { initContext } from './context/index.js';

export default function(
    plugins, 
    options
) {
    const globalCtx = initContext(plugins, options);
    return (container, data) => {
        globalCtx.init(container, data);
        globalCtx.render();
        return globalCtx;
    };
}
export { default as Data2D } from './plugins/data/2d-data';
export { default as Data1D } from './plugins/data/1d-data';
export { default as Coord2D } from './plugins/axis/2d-coord';
export { default as Geo2D } from './plugins/axis/2d-geo';
export { default as LineChart } from './plugins/chart/LineChart';
export { default as BarChart } from './plugins/chart/BarChart';
export { default as PieChart } from './plugins/chart/PieChart';
export { default as LineIndicator } from './plugins/overlayer/LineIndicator';
export { default as Legend } from './plugins/overlayer/Legend';
// import Data2D from '../src/plugins/data/2d-data';
// import Data1D from '../src/plugins/data/1d-data';
// import Coord2D from '../src/plugins/axis/2d-coord';
// import Geo2D from '../src/plugins/axis/2d-geo';
// import LineChart from '../src/plugins/chart/LineChart';
// import BarChart from '../src/plugins/chart/BarChart';
// import PieChart from '../src/plugins/chart/PieChart';
// import LineIndicator from '../src/plugins/overlayer/LineIndicator';
// import Legend from '../src/plugins/overlayer/Legend.js';
