export function findDataInSeries(x, seriesMeta) {
    for (let i = 0; i < seriesMeta.length - 1; i++) {
        const x1 = seriesMeta[i].x;
        const x2 = seriesMeta[i + 1].x;

        if (x > x1 && x < x2) {
            return {
                belong: x - x1 > x2 - x ? 'next' : 'curr',
                curr: seriesMeta[i],
                next: seriesMeta[i + 1],
            };
        }
    }
    return null;
}

export function findDataInBarSeries(x, y, seriesMeta, seriesStep) {
    const halfStep = seriesStep/2;
    for(let i = 0; i < seriesMeta.length; i++) {
        const currMeta = seriesMeta[i];
        const pre = seriesMeta[i - 1];
        const next = seriesMeta[i + 1];

        const x1 = pre ? pre.x + halfStep : currMeta.x - halfStep;
        const x2 = next ? next.x - halfStep : currMeta.x + halfStep;
        
        if(x > x1 && x < x2) {
            const series = currMeta.series;
            let currLegend;
            for(let j = 0; j < series.length; j++) {
                const curSeries = series[j];

                const curPoint = curSeries.p;
                const barWidth = curSeries.barWidth;
                const x1 = curPoint.x;
                const ys = curPoint.lastY;
                const y1 = curPoint.y;
                const x2 = x1 + barWidth;

                if(x > x1 && x < x2 && y < y1 && y > ys) {
                    currLegend = series[j].legend;
                    break;
                }
            }
            return {
                belong: currMeta,
                mouse: { x, y },
                currLegend,
            };
        }
    }
    return null;
}