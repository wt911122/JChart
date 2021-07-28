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

    init(globalCtx, dataOptions, source) {
        Object.assign(source, {
            data: [],
            legend: [],
        });

        this.resetData(dataOptions, source);
    }

    resetData(dataOptions, source) {
        const s = dataOptions.series;

        Object.assign(source, {
            originSeries: dataOptions.series,
            legend: s.map(seri => ({
                name: seri.name,
                disabled: false,
            })),
            data: s.map(seri => seri.value),
        });
    }
}

export default Data1D;