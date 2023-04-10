// import colorString from 'color-string';

const DEFAULT_COLORS = [
    [ 103, 170, 245 ],
    [ 255, 174, 60 ],
    [ 78, 201, 171 ],
    [ 245, 131, 122 ],
    [ 158, 156, 246 ],
    [ 30, 192, 216 ],
    [ 138, 205, 78 ],
    [ 237, 139, 204 ],
    [ 135, 206, 232 ],
    [ 97, 218, 198 ],
    [ 198, 156, 246 ],
    [ 137, 170, 247 ],
    [ 134, 187, 231 ],
    [ 245, 196, 80 ],
    [ 135, 206, 232 ],
    [ 239, 216, 22 ],
    [ 92, 208, 133 ],
    [ 241, 126, 248 ]
];


class ThemePlugin {
    constructor(options = {}) {
        this.name = 'ThemePlugin';
        const {
            colors,
            disabledOpacity,
            fadeOpacity,
        } = options;
        this.colors = colors || DEFAULT_COLORS;
        this.disabledOpacity = disabledOpacity || 0.1;
        this.fadeOpacity = fadeOpacity || 0.4;

    }

    apply(globalCtx) {
        globalCtx.hooks.initTheme.tap(this.name,
            (container) => {
                const {
                    colors, disabledOpacity, fadeOpacity
                } = this;
                const length = colors.length;
                const disabledColors = colors.map(c => [...c, disabledOpacity]);
                const fadeColors = colors.map(c => [...c, fadeOpacity]);
                const fontSize = parseFloat(getComputedStyle(container).fontSize);

                globalCtx.theme = {
                    getColor(idx) {
                        const i = idx % length;
                        return {
                            color: colors[i],
                            disabledColor: disabledColors[i],
                            fadeColor: fadeColors[i],
                        };
                    },
                    fontSize,
                    axis: {
                        strokeStyle: '#eee',
                        lineWidth: 1,
                    },
                };
            });
    }
}

export default ThemePlugin;
