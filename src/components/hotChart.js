import React, { useEffect, useRef, useState } from 'react';
import { VegaLite, View } from 'react-vega';
import { VisualizationSpec } from 'vega-embed';
import * as vega from 'vega';
import { hydrateLibrary, metalog, simulateSIP, listSIPs, p, q } from "@solace-fi/hydrate"
import example_tokens from '../examples/example_tokens.json'

const sineDataSupplier = (x) => {
      console.log('yep')
      let dailyPremium = simulateSIP(example_tokens, 'AAVE', 1000) // Math.floor(Math.random() * 100 Simulate a sips from library
      console.log(dailyPremium)

      return { x: dailyPremium[Math.floor(Math.random() * 1000)], value: 1 };
};

export function HotChart() {
  const [view, setView] = useState();
  const z = -1;
  const x = 50; //

  const ref = useRef({
    x,
    z,
  });

  useEffect(() => {
    function updateGraph() {
      const data = sineDataSupplier(ref.current.x);
      ref.current.x++;
      ref.current.z++;

      const cs = vega
        .changeset()
        .insert(data)
        //.remove((t) => {return t.x < ref.current.z;})
        ;

      view.change('data', cs).run();
    }

    if (view) {
      updateGraph();
      //const interval = setInterval(updateGraph, 111);
      return //() => clearInterval(interval);
    }
  }, [view]);

  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    description: 'Streaming Data',
    height: 200,
    width: 600,
    data: { name: 'data' },
    layer: [{
        mark: "bar",
        params: [{
            name: "brush",
            select: {type: "interval", encodings: ["x"]}
          }],
        encoding: {
            x: { field: "x", bin: true },
            y: { aggregate: "count" }
        },
        opacity: {
            condition: {
              param: "brush", value: 1
            },
            value: 0.7
          }
    },
    {
        data: {
          name: "splitvalues"
        },
        mark: {
          type: "rule",

          //"strokeDash": [4,6]
        },
        encoding: {
          x: {field: "data", type: "quantitative"},
          color: { value: "black" },
          size: { value: 3 }
        }
      }],
      datasets:  {
        splitvalues: [1, 1]
      }
  };

  return (
    <>
      <h3>React Vega Streaming Data</h3>
      <div>
        <VegaLite
          spec={spec}
          actions={false}
          renderer={'svg'}
          onNewView={(view) => setView(view)}
        />
      </div>
    </>
  );
}
export default HotChart;