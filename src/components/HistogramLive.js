import React, { useEffect, useRef, useState } from 'react';
import { Vega, VegaLite, View } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';
import * as vega from 'vega';

/* Example https://vega.github.io/vega-lite/examples/bar.html */
const HistogramLive = (props) => {
    const [inputValue, setInputValue] = useState("");
    const count = useRef(inputValue);
    useEffect(() => {
        count.current = inputValue;
      });

    //const sipList = useAppSelector((state) => state.slurpList.slurpList);
    //console.log('Use this in props in embed ', props);
    console.log('Use this in props in embed ', props);

    if (props=="" || props==undefined) {
        return <div></div>; // no data TODO: hack for initial state of sipList is empty crying face
    }
    let upperVar = props.var[1]
    let lowerVar = props.var[0]
    //console.log('Use this in props in embed ', props);
    let vegaData = {
        table: [
            { a: 1, b: 10 },
            { a: 2, b: 10 },
            { a: 3, b: 10 },
            { a: 4, b: 10 },
        ]
    };
    let currentPriceColor = "black";
    const sum = 12;
    const avg =  0;

    //console.log('average ', avg);
    //if (props.currentPrice < avg) { currentPriceColor = "red" }
    //else { currentPriceColor = "green" }
    
    // if (sipList[0].location !== "init state") { // TODO hack until figure out init state defaults
    // console.log('Use this in textChar props ', props);
    Object.values(props.data).forEach(function (element, index1) {
    //props.keys.forEach((element, index1) => {
   // props.entries.forEach((element, index1) => {
        vegaData.table[index1] = {
            "a": index1,
            "b": element,
            "upperVar": props.var[1],
            "lowerVar": props.var[0],
        };
    });

    //console.log(vegaData.table.reduce((acc: number, trials) => acc = acc > trials.b ? acc : trials.b, 0));
    // }
    //console.log('Use this max value in selected sip ', vegaData.table);

    const specBarColored = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": { "text": "Simulated Daily Price", "color": "white" },
        "background": null,

        "config": {
            "style": {
                "cell": {
                    "stroke": "transparent"
                }
            },
            "axis": {
                "labelColor": {
                    "value": "white"
                }
            }
            /*         "autosize": {
                        "type": "fit",
                        "contains": "padding"
                    }, */
        },
        "data": {
            "name": "table"
        },
        "layer": [{
            "transform": [{
                "bin": true, "field": "b", "as": "bin_Range"
            }, {
                "aggregate": [{ "op": "count", "as": "Count" }],
                "groupby": ["bin_Range", "bin_Range_end"]
            }, {
                "joinaggregate": [{ "op": "sum", "field": "Count", "as": "TotalCount" }]
            }, {
                "calculate": "datum.Count/datum.TotalCount", "as": "PercentOfTotal"
            }
            ],
            "mark": {
                "type": "bar", "tooltip": false,
                "line": { "color": "darkgreen" },
            },
            "encoding": {
                "x": {
                    "field": "bin_Range",
                    "bin": { "binned": true },
                    "title": { "text": "", "color": "white" },

                },
                "x2": {
                    "field": "bin_Range_end",
                },
                "y": {
                    "title": { "text": "Relative Frequency", "color": "white" },
                    "field": "PercentOfTotal",
                    "type": "quantitative",
                    "axis": {
                        "format": ".1~%"
                    }
                }
            }
        },
        {
            "mark": "rule",
            "encoding": {
                "x": { "aggregate": "mean", "field": "lowerVar" },
                "color": { "value": "yellow" },
                "size": { "value": 3 }
            }
        },
        {
            "mark": "rule",
            "encoding": {
                "x": { "aggregate": "mean", "field": "upperVar" },
                "color": { "value": currentPriceColor },
                "size": { "value": 5 }
            }
        }]
    }
    const specLineColoredTesting = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Simulated Daily Price",
        "config": {
            "style": {
                "cell": {
                    "stroke": "transparent"
                }
            }
        },
        "width": 250,
        "height": 125,
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "data": {
            "name": "table"
        },
        "transform": [{
            "bin": true, "field": "b", "as": "bin_Range"
        }, {
            "aggregate": [{ "op": "count", "as": "Count" }],
            "groupby": ["bin_Range", "bin_Range_end"]
        }, {
            "joinaggregate": [{ "op": "sum", "field": "Count", "as": "TotalCount" }]
        }, {
            "calculate": "datum.Count/datum.TotalCount", "as": "PercentOfTotal"
        }
        ],
        "mark": {
            "type": "bar", "binSpacing": 0, "cornerRadius": 4, "tooltip": true,
            "color": {
                "x1": 0,
                "y1": 0,
                "x2": 1,
                "y2": 0,
                "gradient": "linear",
                "stops": [
                    { "offset": 0, "color": "red" },
                    { "offset": 0.5, "color": "yellow" },
                    { "offset": 1, "color": "darkgreen" }
                ]
            }
        },
        "encoding": {
            "x": {
                "title": "Range",
                "field": "bin_Range",
                "bin": { "binned": true }
            },
            "x2": { "field": "bin_Range_end" },
            "y": {
                "title": "Relative Frequency",
                "field": "PercentOfTotal",
                "type": "quantitative",
                "axis": {
                    "format": ".1~%"
                }
            }
        }
    }
    const specBar = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Simulated Daily Price",
        "config": {
            "style": {
                "cell": {
                    "stroke": "transparent"
                }
            }
        },
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "data": {
            "name": "table"
        },

        "mark": {
            "type": "bar", "binSpacing": 0, "cornerRadius": 4, "tooltip": true,
            "color": {
                "x1": 0,
                "y1": 0,
                "x2": 1,
                "y2": 0,
                "gradient": "linear",
                "stops": [
                    { "offset": 0, "color": "green" },
                    { "offset": 0.5, "color": "lightgreen" },
                    { "offset": 1, "color": "darkgreen" }
                ]
            }
        },
        "encoding": {
            "x": {
                "bin": { "maxbins": 50 },
                "title": "",
                "field": "b"
            },

            "y": {
                "title": "frequency",
                "aggregate": "count"
            }
        }
    }
    const specDensity = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": "Simulated Daily Price",
        "config": {
            "style": {
                "cell": {
                    "stroke": "transparent"
                }
            }
        },
        "width": 250,
        "height": 125,
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "data": {
            "name": "table"
        },
        "transform": [{
            "density": "b",
            "bandwidth": 0.3
        }],
        "mark": {
            "type": "area", "color": {
                "x1": 0,
                "y1": 0,
                "x2": 1,
                "y2": 0,
                "gradient": "linear",
                "stops": [
                    { "offset": 0, "color": "red" },
                    { "offset": 0.5, "color": "yellow" },
                    { "offset": 1, "color": "darkgreen" }
                ]
            }
        },
        "encoding": {
            "x": {
                "field": "value",
                "title": "Range",
                "type": "quantitative"
            },
            "y": {
                "field": "density",
                "type": "quantitative"
            }
        }
    }
    const specSimpleLine = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": "Google's stock price over time.",
        "data": {
            "name": "table"
        },
        "mark": "line",
        "encoding": {
            "x": { "field": "a", "type": "temporal" },
            "y": { "field": "b", "type": "quantitative" }
        }
    }
    const specSimpleBarMean = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "data": {
            "name": "table"
        },
        "layer": [{
            "mark": "bar",
            "params": [{
                "name": "brush",
                "select": {"type": "interval", "encodings": ["x"]}
              }],
            "encoding": {
                "x": { "field": "b", "bin": true },
                "y": { "aggregate": "count" }
            },
            "opacity": {
                "condition": {
                  "param": "brush", "value": 1
                },
                "value": 0.7
              }
        }, /* {
            "mark": "rule",
            "encoding": {
                "x": { "aggregate": "mean", "field": "lowerVar" },
                "color": { "value": "black" },
                "size": { "value": 5 }
            }
        }, {
            "mark": "rule",
            "encoding": {
                "x": { "field": "upperVar", "aggregate": "mean" },
                "color": { "value": "black" },
                "size": { "value": 5 }
        }
        },
        {
            "transform": [{"filter": {"param": "brush"}}],
            "mark": "bar",
            "encoding": {
              "x": {"field": "b", "bin": true},
              "y": {"aggregate": "count"},
              "color": {"value": "goldenrod"}
            }
          }, */{
            "data": {
              "name": "splitvalues"
            },
            "mark": {
              "type": "rule",

              //"strokeDash": [4,6]
            },
            "encoding": {
              "x": {"field": "data", "type": "quantitative"},
              "color": { "value": "black" },
              "size": { "value": 3 }
            }
          }
        ],
        "datasets": {
          "splitvalues": [lowerVar, upperVar]
        }
    }
    console.log(props.spec)
    let charSpec = props.spec;
    //let useThisChartSpec = charSpec === "bar" ? specBarColored : specSimpleBarMean;
    let useThisChartSpec = specSimpleBarMean;
    
    return (
        <div id="vis" className="Demo" >
            <VegaLite  spec={useThisChartSpec} data={vegaData} kmm={'hi mom'} onNewView={(view) => {
                const range = [100+Math.random()*900, 100+Math.random()*900] //mind the 100 offset

                const scaledRange = [view.scale("x")(range[0]), view.scale("x")(range[1])];

                //setInputValue(view._runtime.data.splitvalues.values.value)
                console.log(range, scaledRange);
                //view.signal("brush_x_1", scaledRange);
                console.log('ttttt ', view.signal("brush_x_1", scaledRange));
                //view.runAsync(); 
                }} />
                <div>
                    <h1>Render Count: {count.current}</h1>

                </div>
                
        </div >
    );
}
export default HistogramLive;