import { initContext } from './context';

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