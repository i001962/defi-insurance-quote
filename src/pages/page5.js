import Layout from '../components/layout'
import Seo from '../components/seo'
import React from 'react'
import { useState, useEffect } from 'react'
import solaceGif from '../images/party.gif'
import vegaEmbed from 'vega-embed'
import { hydrateLibrary, metalog, simulateSIP, listSIPs, p, q } from "@solace-fi/hydrate"
import example_tokens from '../examples/example_tokens.json'
import priceHist from '../examples/price-history.json'

function EnterForm({ accountIn }) {
  const [account, setAccounts] = useState(accountIn.toUpperCase())
  const [isLoading, setLoading] = useState(false)
  const [getVar, setVar] = useState({ x: [1, 1], p: [100, 100], r: [1, 1] })

  const getVegaHistogramSpec = (dataInHere) => {
    // console.log(dataInHere)
    return {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "description": "Google's stock price over time.",
      "title": ["Token Price Volatility", "Tap to select a range..."],
  
      "data": {
        "values": dataInHere
      },
      layer: [{
        mark: "bar",
        params: [{
          name: "brush",
          select: { type: "interval", encodings: ["x"] }
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
          x: { field: "data", type: "quantitative" },
          color: { value: "black" },
          size: { value: 3 }
        }
      }],
      datasets: {
        splitvalues: [1, 1]
      }
    }
  }

  function fetchData(dataIn) {
    // console.log('fetching data', dataIn)
    vegaEmbed('#vis', getVegaHistogramSpec(dataIn)).then((result) => {
      const view = result.view
      const spec = result.vgSpec
      // console.log(spec)

      view.addSignalListener("brush", (name, value) => {
        // console.log('New ' + name + ' event:\n', JSON.stringify(value, null, 2))
        if (Object.keys(value).length === 0) {
          setVar({ x: [1, 1], p: [100, 100], r: [1, 1] })
        } else {
            function isSip(sip) {
              return sip.name === account;
            }
            const sipInfo = example_tokens.sips.find(isSip);

            value.p = p(value.x, sipInfo.arguments.aCoefficients, "", "")
            value.r = [value.x[1] - value.x[0], value.p[1] - value.p[0]]
            setVar(value)
        }
      })
    })
  }

  async function fetchOnSubmit() {
    const response = await fetch(`https://risk-data.solace.fi/price-history?tickers=${account}&window=365`)
      .then(res => res.json())
      .then((inhere) => {console.log(inhere);
        let priceArry = []
        priceHist[account].forEach((element, index) => {
          // console.log(element.price)
          //  { "x": 1, "y": 5 },
          priceArry.push({x: element.change, y: index})
        });
       // console.log(priceArry)
        return priceArry
      }).catch(err => console.log(err))
    // console.log(response)
    // console.log(priceHist)
    
  }

  useEffect(() => {
    // console.log(getVar)
  }, [getVar])

  const handleSubmit = e => {
    e.preventDefault()
    async function fetchOnSubmit1() {
      const response = await fetch(`https://risk-data.solace.fi/price-history?tickers=${account}&window=365`)
        .then(res => res.json())
        .then((inhere) => {console.log(inhere);
          let priceArry = []
          inhere[account].forEach((element, index) => {
            // console.log(element.price)
            //  { "x": 1, "y": 5 },
            priceArry.push({x: element.change, y: index})
          });
         // console.log(priceArry)
          return priceArry
        }).catch(err => console.log(err))
      // console.log(response)
      // console.log(priceHist)
      fetchData(response)
    }
    fetchOnSubmit1()
    //const data = await fetchOnSubmit1()
    // console.log(data)
    //fetchData(data)
  }

  return isLoading ? ( //Checkif if is loading
    <Loader />
  ) : (
    <div id="vis">
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input style={{ color: "purple", fontSize: "15px", width: "375px" }}
            placeholder="AAVE"
            type="text"
            value={account}
            onChange={e => setAccounts(e.target.value)} />
          <div>
            <button style={{ 'marginTop': '5px', 'background': 'rgba(95,93,249,1)', 'borderRadius': '8px', color: "white", fontSize: "15px", width: "175px", 'fontFamily': 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif', 'fontWeight': 'normal' }}
              type="submit">Get Quote
            </button>
          </div>
        </div>
      </form>
      <p>Left tail: {getVar.x[0].toFixed(2)} probability: {getVar.p[0].toFixed(4)}</p>
      <p>Right tail: {getVar.x[1].toFixed(2)} probability: {getVar.p[1].toFixed(4)}</p>
      <p>Range tail: {getVar.r[0].toFixed(2)} Range prob: {getVar.r[1].toFixed(4)}</p>

    </div>
  )
}
const Loader = () => (
  <div className="loader">
     <h1> Loading....</h1>
     <img src={solaceGif} alt="Solace ring cube" />
     <p>If this doesn't work <a href="https://discord.solace.fi">blame Olaf!</a></p>
  </div>
)
const IndexPage = () => (
    <Layout>
      <Seo title="Value at Risk" />
      <h1>Token Symbol</h1>
      <EnterForm accountIn='AAVE'/>
    </Layout>
  )
  
  export default IndexPage