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
import Stakedao from '../examples/0x1531c1a63a169ac75a2daae399080745fa51de44.json'
//import Stakedao from '../examples/0xfd3300a9a74b3250f1b2abc12b47611171910b07.json'

const currentPrice = 1.1 //plug for now
const noChange = 1 // plug for now, represents last close price
function EnterForm({ accountIn  }) {
  const [account, setAccounts] = useState(accountIn.toUpperCase())
  const [isLoading, setLoading] = useState(false)
  const [getVar, setVar] = useState({ x: [1, 1], p: [100, 100], r: [1, 1], a: ['NA', 'NA'],cl: [0,0.025] })
  const rateOnLine = 0.025 // TODO need contract to appId Mapping then fetch from series
  const getVegaHistogramSpec = (dataInHere) => {
 
    console.log(dataInHere.balance)
    //currentPriceIn = 1.111
    return {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "Google's stock price over time.",
      "title": ["Contract Token Holders", "Tap to select a range..."],
      "data": {
        "values": dataInHere
      },
      "layer": [
        {
          "selection": {
            "brush": {"type": "interval", "encodings": ["x"]}
          },
          "mark": "line",
          "encoding": {
            "x": {"field": "balance", "bin": true},
            "y": {"aggregate": "count"}
          },
          //"mark": "rule",
          //"encoding": {"x": {"field": "balance", "type": "temporal"}}
        },
        {
          "transform": [{"filter": {"selection": "brush"}}],
          "mark": "line",
          "encoding": {
            "x": {"field": "balance", "bin": true},
            "y": {"aggregate": "count"},
            "color": {"value": "goldenrod"}
          }
        }
      ]
    }
  }

  function fetchData(dataIn) {
    // console.log('fetching data', dataIn)
    vegaEmbed('#vis', getVegaHistogramSpec(dataIn)).then((result) => {
      const view = result.view
      const spec = result.vgSpec
      // console.log(spec)

      view.addEventListener('click', function(event, item) {
        console.log('CLICK', event, item);

      });
/*        view.data('data_0').slice().map(function(d) {
         console.log(d); // fires for each data item in the view
      });  */

      view.addSignalListener("brush", (name, value) => {
        console.log('New ' + name + ' event:\n', JSON.stringify(value, null, 2))
        if (Object.keys(value).length === 0) {
          setVar({ x: [1, 1], p: [100, 100], r: [1, 1], a: [1, 1], cl: [0, 0.025] })
        } else {
            function isSip(sip) {
              return //sip.name === account;
            }
            //const sipInfo = example_tokens.sips.find(isSip);
            // todo need bursh value to be on the change not the absolute price or convert it
            //const converted = value.balance.map(function(x) { return x / 1; });
            // value.p = p(converted, sipInfo.arguments.aCoefficients, "", "")
            // value.r = [value.x[1] - value.x[0], value.p[1] - value.p[0]]
            value.x = [value.balance[0], value.balance[1]] // Balances within CL 
            value.r = [value.balance[1] - value.balance[0], value.balance[1] - value.balance[0]]  
  
            let coveredUsers = dataIn.reduce((acc, cur) => cur.balance <= value.r[0] ? ++acc : acc, 0);
            value.p = [value.balance[1] - value.balance[0], coveredUsers]  
            console.log(coveredUsers);

            let tvl = dataIn.map(item => item.balance).reduce((prev, curr) => prev + curr, 0)
            value.a = [dataIn.length, tvl]

            let perctCoveredUsers = (coveredUsers / dataIn.length) * 100
            value.cl = [value.r[1], rateOnLine ]

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
      /* const currentPrice = await fetch(`https://share.solace.fi/holders/0x24129B935AfF071c4f0554882C0D9573F4975fEd.json${account}&key=ckey_800c35e3d0564345b0d37661f89`)
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
       */
     /* const response1 = await fetch(`https://share.solace.fi/holders/${account}.json`)
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
        TODO: need to get the ROL too. Need contract to appId mapping
        */
      const response = Stakedao
      console.log(response)
      //fetchData(response, currentPrice)
      fetchData(response)
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
            placeholder="0x1531c1a63a169ac75a2daae399080745fa51de44"
            type="text"
            value={account}
            onChange={e => setAccounts(e.target.value)} />
           {/* <input style={{ color: "purple", fontSize: "15px", width: "375px" }}
            placeholder= "1000"
            type="number"
            value={coverLimit}
            onChange={e => setCoverLimit(e.target.value)} />   */}
          <div>
            <button style={{ 'marginTop': '5px', 'background': 'rgba(95,93,249,1)', 'borderRadius': '8px', color: "white", fontSize: "15px", width: "175px", 'fontFamily': 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif', 'fontWeight': 'normal' }}
              type="submit">Get Solace Native Quote
            </button>
          </div>
        </div>
      </form>
      <table>
      <tbody>
        <tr>
          <th></th>
          <th>Cover Limit</th>
          <th>Rate</th>
          <th>Annual Premium</th>
        </tr>
        <tr>
          <th>Premium</th>
          <td>{getVar.r[0].toLocaleString('en-US')}</td>
          <td>{getVar.cl[1]}</td>
          <td>${(getVar.r[0] * getVar.cl[1]).toLocaleString('en-US')}</td>
        </tr>
        </tbody>
      </table>
      <table>
      <tr>
          <th></th>
          <th>Users</th>
          <th></th>
          <th>TVL</th>
        </tr>
        <tbody>
        <tr>
          <th>Total</th>
          <td>{(getVar.a[0])}</td>
          <td></td>
          <td>{getVar.a[1].toLocaleString("en-US")}</td>
        </tr>
        <tr>
          <th>Selected</th>
          <td>{(getVar.p[1]).toFixed(0)}</td>
          <td>{(getVar.p[1] / getVar.a[0] * 100 ).toFixed(2)}%</td>
          <td>{(getVar.r[0] / getVar.a[1] * 100 ).toFixed(2)}%</td>
        </tr>
        </tbody>
        </table>

       {/*  <tr>
          <th></th>
          <th>Left</th>
          <th>Right</th>
          <th>Range</th>
        </tr>
        <tbody>
        <tr>
          <th>Value</th>
          <td>{getVar.x[0].toLocaleString('en-US')}</td>
          <td>{getVar.x[1].toLocaleString("en-US")}</td>
          <td>{getVar.r[0].toLocaleString("en-US")}</td>
        </tr>
        </tbody>
        <br></br> */}

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
      {/* <h1>Token Contract Address</h1> */}
      <EnterForm accountIn='0x1531c1a63a169ac75a2daae399080745fa51de44'/>
      <SipState />
    </Layout>
  )
  
  export default IndexPage