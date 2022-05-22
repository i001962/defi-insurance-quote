import Layout from '../components/layout'
import Seo from '../components/seo'
import React from 'react'
import { useState, useEffect } from 'react'
import solaceGif from '../images/party.gif'
import vegaEmbed from 'vega-embed'
import { hydrateLibrary, metalog, simulateSIP, listSIPs, p, q } from "@solace-fi/hydrate"
import example_tokens from '../examples/example_tokens.json'
import priceHist from '../examples/price-history.json'
import SipState from '../components/sipState'
import GetPrice from '../components/getPrices'
import { last } from 'lodash'

const currentPrice = 1.1 //plug for now
const noChange = 1 // plug for now, represents last close price
function EnterForm({ accountIn }) {
  const [account, setAccounts] = useState(accountIn.toUpperCase())
  const [isLoading, setLoading] = useState(false)
  const [getVar, setVar] = useState({ x: [1, 1], p: [100, 100], r: [1, 1] })

  const getVegaHistogramSpec = (dataInHere, currentPriceIn) => {
 
    console.log(currentPriceIn)
    //currentPriceIn = 1.111
    return {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "description": "Google's stock price over time.",
      "title": ["Token Price Volatility", "Tap to select a range..."],
  
      "data": {
        "values": dataInHere
      },
      layer: [{
        mark: "area",
        params: [{
          name: "brush",
          select: { type: "interval", encodings: ["x"] }
        }],
        encoding: {
          x: { field: "x", bin: true}, //, scale: {domain: [0.5,1.5 ]} },
          y: { aggregate: "count" },
          autosize:{type:"none"}
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
          name: "lastClose"
        },
        mark: {
          type: "rule",
          "strokeDash": [4,6]
        },
        encoding: {
          x: { field: "data", type: "quantitative" },
          color: { value: "black" },
          size: { value: 3 }
        }
      },{
        data: {
          name: "currentPrice"
        },
        mark: {
          type: "rule",
        },
        encoding: {
          x: { field: "data", type: "quantitative" },
          color: { value: "green" },
          size: { value: 3 }
        }
      }],
      datasets: {
        lastClose: [dataInHere[0].x],
        currentPrice: [currentPriceIn]

      }
    }
  }

  function fetchData(dataIn, cuurentPriceIn) {
    // console.log('fetching data', dataIn)
    vegaEmbed('#vis', getVegaHistogramSpec(dataIn,cuurentPriceIn)).then((result) => {
      const view = result.view
      const spec = result.vgSpec
      // console.log(spec)

      view.addSignalListener("brush", (name, value) => {
        // console.log('New ' + name + ' event:\n', JSON.stringify(value, null, 2))
        if (Object.keys(value).length === 0) {
          setVar({ x: [1, 1], p: [100, 100], r: [1, 1],  })
        } else {
            function isSip(sip) {
              return sip.name === account;
            }
            const sipInfo = example_tokens.sips.find(isSip);
            // todo need bursh value to be on the change not the absolute price or convert it
            const converted = value.balance.map(function(x) { return x / cuurentPriceIn; });
            value.p = p(converted, sipInfo.arguments.aCoefficients, "", "")
            value.r = [value.x[1] - value.x[0], value.p[1] - value.p[0]]
            setVar(value)
        }
      })
    })
  }

  useEffect(() => {
    // console.log(getVar)
  }, [getVar])

  const handleSubmit = e => {
    e.preventDefault()

    async function fetchOnSubmit1() {
      let priceArry; 
      const currentPrice = await fetch(`https://api.covalenthq.com/v1/pricing/tickers/?quote-currency=USD&format=JSON&tickers=${account}&key=ckey_800c35e3d0564345b0d37661f89`)
              .then(res => res.json())
              .then((inhere) => {console.log(inhere);
                //let priceArry = []
                inhere.data.items.forEach((element, index) => {
                  console.log(element.quote_rate)
                  //priceArry.push(element.quote_rate)
                  priceArry =element.quote_rate
                });
               console.log(priceArry)
                return priceArry
              }).catch(err => console.log(err))
      
      const response = await fetch(`https://risk-data.solace.fi/price-history?tickers=${account}&window=365`)
        .then(res => res.json())
        .then((inhere) => {console.log(inhere);
          const lastNightPrice = inhere[account][0].price
          console.log(lastNightPrice)
          let priceArry = []
          inhere[account].forEach((element, index) => {
            priceArry.push({x: element.change * lastNightPrice, y: index, p: element.change})
          });
          return priceArry
        }).catch(err => console.log(err))
      
      fetchData(response, currentPrice)
    }

    fetchOnSubmit1()
    //const data = await fetchOnSubmit1()
    //  /console.log(data)
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
      <table>
        <tr>
        <th></th>
        <th>Left</th>
        <th>Right</th>
        <th>Range</th>
        </tr>
        <tbody>
        <tr>
        <th>Value</th>
          <td>{getVar.x[0].toFixed(3)}</td>
          <td>{getVar.x[1].toFixed(3)}</td>
          <td>{getVar.r[0].toFixed(3)}</td>
        </tr>
        <tr>
        <th>Probability of Value (or less)</th>
          <td>{(getVar.p[0].toFixed(4)*100).toFixed(3)}%</td>
          <td>{(getVar.p[1].toFixed(4)*100).toFixed(3)}%</td>
          <td>{(getVar.r[1].toFixed(4)* 100).toFixed(3)}%</td>
        </tr>
        </tbody>
      </table>
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
      <SipState />
    </Layout>
  )
  
  export default IndexPage