import GlobalContext from './global-context';
import DPIPlugin from '../plugins/inner/DPIPlugin';
import ThemePlugin from '../plugins/inner/ThemePlugin';
import LayoutPlugin from '../plugins/inner/LayoutPlugin';
import EventListenerPlugin from '../plugins/inner/EventListenerPlugin';
import GlobalLayoutPlugin from '../plugins/inner/GlobalLayoutPlugin';
export function initContext(plugins, options = {}) {
    const globalCtx = new GlobalContext();
    const innerPlugins = [
        
        new ThemePlugin(options.theme),
        new LayoutPlugin(options.layout),
        new EventListenerPlugin(),
        new GlobalLayoutPlugin(),
        new DPIPlugin(),
    ];

    plugins = innerPlugins.concat(plugins);
    plugins.forEach(plugin => {
        plugin.apply(globalCtx);
    });
    return globalCtx;
}
