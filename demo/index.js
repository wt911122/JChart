import JChart, {
    Data2D,
    Data1D,
    Coord2D,
    Geo2D,
    LineChart,
    BarChart,
    PieChart,
    LineIndicator,
    Legend,
    GeoIndicator,
} from '../src/index';
import data1 from './data-big-1.json';
import data2 from './data-big-2.json';

import { flatten, get } from 'lodash';

const chartModel = JChart([
    new Data2D(),
    new Coord2D({
        type: 'vertical',
        grid: {
            vertical: true,
            horizontal: true,
        }
    }),
    new LineChart({
        smooth: true,
        fill: true,
    }),
    // new BarChart(),
    new LineIndicator(),
    new Legend(),
], {
    layout: {
        left: 0,
        top: 20,
        bottom: 40,
        right: 30,
        xFloat: 20
    }
});

const container = document.createElement('div');
container.setAttribute('style', `
    position: relative;
    margin: 30px;
    width: 680px;
    height: 320px;
    border: 1px solid rebeccapurple;`);

document.body.appendChild(container);

const dataFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
});
const NumberFormatter = new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    compactDisplay: 'short',
});

function getSeries(data) {
    let largest;
    let l = 0;
    const results = get(data, 'data.result', []);
    results.forEach(r => {
        const length = r.values.length;
        if (length > l) {
            l = length;
            largest = r.values.map(v => v[0]);
        }
    });
    return flatten(
        get(data, 'data.result', []).map(r => {
            const values = r.values.map(v => [ v[0] * 1000, +v[1] ]);
            let vs = [];
            if (values.length < l) {
                largest.forEach(t => {
                    const time = t * 1000;
                    const q = values.find(v => v[0] === time);
                    if (q) {
                        vs.push(q);
                    } else {
                        vs.push([ t * 1000, 0 ]);
                    }
                });
            } else {
                vs = values;
            }

            return {
                name: r.metric.pod,
                values: vs,
            };
        }));
}



const globalCtx = chartModel(container, {
    reference: {
        type: 'continuous',
    },
    series: getSeries(data1),
    stack: true,
    xAxis: {
        span: 6,
        format(value) {
            const datetime = new Date(value);
            return dataFormatter.format(datetime);
        },
    },
    yAxis: {
        min: 0,
        format(value) {
            return NumberFormatter.format(value);
        },
    },
});

const button = document.createElement('button');
button.innerText = "click!!";
let flag = false;
button.addEventListener('click', () => {
    globalCtx.resetData({
        reference: {
            type: 'continuous',
        },
        series: getSeries(flag ? data1: data2),
        stack: true,
        xAxis: {
            span: 6,
            format(value) {
                const datetime = new Date(value);
                return dataFormatter.format(datetime);
            },
        },
        yAxis: {
            min: 0,
            format(value) {
                return NumberFormatter.format(value);
            },
        },
    });
    flag = !flag;
});

document.body.appendChild(button);

const containerdiscrete = document.createElement('div');
containerdiscrete.setAttribute('style', `
    position: relative;
    margin: 30px;
    width: 680px;
    height: 320px;
    border: 1px solid rebeccapurple;`);

document.body.appendChild(containerdiscrete);
function randomData() {
    const keys = ['a', 'b', 'c'];
    const date = ['2012', '2013', '2014', '2015', '2016', '2017', '2018'];
    const slicedData = date.slice(Math.floor(Math.random() * 4));
    return keys.map(k => ({
        name: k,
        values: slicedData.map(d => [d, 300 + Math.round(Math.random() * 1700)])
    }));
}
const chartModelDiscrete = JChart([
    new Data2D(),
    new Coord2D({
        type: 'vertical',
        grid: {
            vertical: true,
            horizontal: true,
        }
    }),
    // new LineChart({
    //     smooth: true,
    //     fill: true,
    // }),
    new BarChart(),
    new LineIndicator({
        bar: true,
    }),
    new Legend(),
], {
    layout: {
        left: 0,
        top: 20,
        bottom: 20,
        right: 30,
        xFloat: 50
    }
});
const g2 = chartModelDiscrete(containerdiscrete, {
    reference: {
        type: 'discrete',
    },
    series: randomData(),
    stack: true,
    xAxis: {
        span: 6,
    },
    yAxis: {
        min: 0,
        format(value) {
            return NumberFormatter.format(value);
        },
    },
});

const button2 = document.createElement('button');
button2.innerText = "click!!";
button2.addEventListener('click', () => {
    g2.resetData({
        reference: {
            type: 'discrete',
        },
        series: randomData(),
        stack: true,
        xAxis: {
            span: 6,
        },
        yAxis: {
            min: 0,
            format(value) {
                return NumberFormatter.format(value);
            },
        },
    });
});

document.body.appendChild(button2);



const containerPie = document.createElement('div');
containerPie.setAttribute('style', `
    position: relative;
    margin: 30px;
    width: 680px;
    height: 320px;
    border: 1px solid rebeccapurple;`);

document.body.appendChild(containerPie);
const dataRandom = () => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 6;
    const data = [];
    for(let i=0;i<length;i++) {
        data.push({
            value: 300 + Math.round(Math.random() * 1700),
            name: possible.charAt(i),
        });
    }
    return data;
};

const chartModelPie = JChart([
    new Data1D(),
    new Geo2D(),
    // new LineChart({
    //     smooth: true,
    //     fill: true,
    // }),
    new PieChart(),
    new Legend({
        disableselect: true
    }),
    new GeoIndicator(),
], {
    layout: {
        left: 0,
        top: 20,
        bottom: 20,
        right: 30,
    }
});

const g3 = chartModelPie(containerPie, {
    series: dataRandom(),
    format(value) {
        return NumberFormatter.format(value);
    },
});

const button3 = document.createElement('button');
button3.innerText = "click!!";
button3.addEventListener('click', () => {
    g3.resetData({
        series: dataRandom(),
    });
});

document.body.appendChild(button3);
