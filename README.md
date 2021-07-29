# JChart

[![License](http://img.shields.io/badge/license-apache%20v2-blue.svg)](https://github.com/kubecube-io/kubecube/blob/main/LICENSE)

JChart consist of line chart, bar chart and pie chart which designed for basic data visualization. 

<b>[demo](https://wt911122.github.io/JChart/demo/dist/index.html)</b>

## Features
+ Reactive Data
+ Plugin based
+ 3 canvas layers
+ auto layout (y-axis margin adaptive)

## Conceptions
### Layer
JChart include 3 layers from bottom to top, one layer corresponds to a canvas element:

1. Coodinate Layer
    + Calculate basic transform matric based on layout, global DPR, origin data and axis.
    + Paint axis
    + Reactive to mouse pointer event
2. Chart Layer
    + Calculate chart point based on coordinate transform matric and origin data.
    + Paint Chart 
    + Reactive to mouse pointer event
3. Over Layer
    + Handle mouse event and emit to Coodinate and Chart
    + Paint Indicator

### Data
Data is reactive. Every Layer will react to data change in fixed order.

### Plugins
Plugins devided into 4 parts:
1. Data
   + [2d-data](./src/plugins/data/2d-data)
   + [1d-data](./src/plugins/data/1d-data) 
2. Coodinate
   + [2d-coord](./src/plugins/axis/2d-coord)
   + [2d-geo](./src/plugins/axis/2d-geo) 
3. Chart
   + [BarChart](./src/plugins/chart/BarChart)
   + [LineChart](./src/plugins/chart/LineChart)
   + [PieChart](./src/plugins/chart/PieChart)
4. Over
   + [Legend](./src/plugins/overlayer/Legend)
   + [LineIndicator](./src/plugins/overlayer/LineIndicator)

## Configure
### Data Configure
1. [2d-data](./src/plugins/data/2d-data)
[BarChart](./src/plugins/chart/BarChart) and [LineChart](./src/plugins/chart/LineChart) use 2d data
```javascript
{
    reference: {
        // data x dimension type [continuous | discrete]
        type: 'continuous', 
    },
    series: [
        {
            name: 'foo',
            values: [
                [1626150094.407, 40],
                [1626150694.407, 30],
                [1626151294.407, 10],
                ...
            ],
        },
        {
            name: 'bar',
            values: [
                [1626150094.407, 20],
                [1626150694.407, 70],
                [1626151294.407, 50],
                ...
            ],
        },
        ...
    ],
    stack: true, // stack mode or not
    xAxis: {
        span: 6, // display in 6 parts
        format(value) {
            // x dimension formatter
            const datetime = new Date(value);
            return dataFormatter.format(datetime);
        },
    },
    yAxis: {
        min: 0, // min is 0
        format(value) {
            // y dimension formatter
            return NumberFormatter.format(value);
        },
    },
```  

2. [1d-data](./src/plugins/data/1d-data) 
[PieChart](./src/plugins/chart/PieChart) use 1d data
```javascript
{
    series: [
        {
            name: 'foo',
            value: 4
        },
        {
            name: 'bar',
            value: 8
        },
        ...
    ]
}
```

### LineChart Configure 
``` javascript
{
    smooth: Boolean,
    fill: Boolean,
}
```

### Legend Configure
``` javascript
{
    /*
        @parameter
        legendMeta is Array of { legend, color }

        legend : {
            disabled: Boolean, 
            name: String,
        }
        color: {
            enable: String,
            disable: String
        }

        legend is reactive, change disabled will trigger change

        this is usefull when customiz legend style
    */
    callback(legendMeta) {
        ...
    }
}
```

### LineIndicator Configure
``` javascript
{
    /*
        @parameter
        meta: {
            display: Boolean,
            x: Number,
            y: Number,
            xDimension: String,
            series: Array of {
                name: String<legend name>, 
                color: String<legend color>, 
                data: String<fomatted legend data>, 
                rawData: Number<legend data>, 
            }
        }

        this is usefull when customiz Indicator style
    */
    callback(meta) {
        ...
    },

    bar: Boolean, // appear line or bar shape
}
```

### Additional Configure
+ Global chart layout
```javascript
{
    layout: {
        left: 0,
        top: 20,
        bottom: 40,
        right: 30,
        xFloat: 20 // chart Layer padding 
    }
}
```
+ Global chart theme
```javascript
{
    theme: {
        colors: [
            // [r, g, b]
            [ 103, 170, 245 ],
            [ 255, 174, 60 ],
            [ 78, 201, 171 ],
            ... 
        ],
        disabledOpacity: 0.1 // disabled legend opacity
        fadeOpacity: 0.4     // not focus serie opacity 
    }
}
```

## Who use Jchart
[KubeCube](https://github.com/kubecube-io/kubecube-front)

KubeCube is an open source enterprise-level container platform



