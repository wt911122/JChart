class Data1D {
    apply(globalCtx) {
        const name = 'Data1D';
        globalCtx.globalData.hooks.initData.tap(name, (dataOptions, source, sourceMeta) => {
            this.init(globalCtx, dataOptions, source, sourceMeta);
        });
        globalCtx.globalData.hooks.resetData.tap(name, (dataOptions, source) => {
            this.resetData(dataOptions, source);
        });
    }

    init(globalCtx, dataOptions, source, sourceMeta) {
        Object.assign(source, {
            data: [],
            legend: [],
        });
        Object.assign(sourceMeta, {
            formatter: null,
        });

        this.resetData(dataOptions, source, sourceMeta);
    }

    resetData(dataOptions, source, sourceMeta) {
        const s = dataOptions.series;

        Object.assign(source, {
            originSeries: dataOptions.series,
            legend: s.map(seri => ({
                name: seri.name,
                disabled: false,
            })),
            data: s.map(seri => seri.value),
        });
        Object.assign(sourceMeta, {
            formatter: dataOptions.format || (d => d),
        });
    }
}

export default Data1D;