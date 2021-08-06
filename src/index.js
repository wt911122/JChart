import { initContext } from './context/index.js';

export default function(
    plugins, 
    options
) {
    const globalCtx = initContext(plugins, options);
    return (container, data) => {
        globalCtx.init(container, data).then(() => {
            globalCtx.render();
        });
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
export { default as GeoIndicator } from './plugins/overlayer/geoIndicator';