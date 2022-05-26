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
import { forEach, last } from 'lodash'
import Stakedao from '../examples/0x1531c1a63a169ac75a2daae399080745fa51de44.json'
import MeanVar from '../examples/mean_variance.json'
import {Variance} from '../components/variance'
import {Sumproduct} from '../components/sumproduct'

const currentPrice = 1.1 //plug for now
const noChange = 1 // plug for now, represents last close price
let mean_variance = []

function EnterForm({ accountIn  }) {
  const [account, setAccounts] = useState(accountIn.toUpperCase())
  const [isLoading, setLoading] = useState(false)
  const [getVar, setVar] = useState({ x: [1, 1], p: [100, 100], r: [1, 1], a: ['NA', 'NA'],cl: [0,0.025] })
  const rateOnLine = 0.025 // TODO need contract to appId Mapping then fetch from series
  
  const getVegaHistogramSpec = (dataInHere) => {
    let tickers=[]

    const trials = 110 // in each simulated portfolio
    const simulatedPortfolios = 2000 // number of simulated portfolios
    const historicalPriceMovements = hydrateLibrary(example_tokens,trials)
    // console.log(historicalPriceMovements)
    // console.log(simulateSIP(example_tokens,"AAVE",trials))

    for (let k = 0; k < simulatedPortfolios; k++) {
      let weights=[]
      let tooltip = []
      // set weights and tickers
      for (let j = 0; j < Object.keys(historicalPriceMovements).length; j++) {
        let weight = Math.random()
        weights.push(weight)
        tickers[j] = Object.keys(historicalPriceMovements)[j];
      }

      let total_weight = weights.reduce((a, b) => a + b, 0)  
      weights.forEach((weight, index) => {
        weights[index] = weight / total_weight
         // create tooltip for each portfolio
         tooltip[index] = tickers[index].toString() + ": " + weights[index].toFixed(2).toString()
      })

      console.log('There are the tickers: ',tickers)
      console.log('These are the weights: ',weights)
      console.log('These are the tooltip: ',tooltip)
      // set tickersTrials array for sumproduct
      let portfolio = []
      let tickersTrials=[]


      //
      //mus = (1+ daily_returns.mean())**365.25 - 1
      //
      for (let i = 0; i < trials; i++) {
        let tickerTrials=[]
        for (let j = 0; j < tickers.length; j++) {
          tickerTrials[j] = Object.values(historicalPriceMovements)[j][i]
          //console.log(tickerTrials[j])
        }
        tickersTrials.push(tickerTrials)
        portfolio[i] =Sumproduct((tickerTrials, weights) => tickerTrials > 0, tickerTrials, weights)
      }
      const expectedMeanReturn = portfolio.reduce((a, b) => a + b) / portfolio.length;
      const tickersTrialsMean = tickersTrials.map(tickersTrials => tickersTrials.reduce((a, b) => a + b) / tickersTrials.length);
       // const expectedVariance = portfolio.reduce((a, b) => a + Math.pow(b - expectedMeanReturn, 2), 0) / portfolio.length;
      
      const expectedVariance = Variance(portfolio)

      console.log('These are the expected returns: ',(1+expectedMeanReturn)**365.25 - 1)
      console.log('These are the tickersTrials: ',tickersTrialsMean)
      console.log('This is the weighted portfolio simulation: ', portfolio)
      console.log('This is the Variance: ', expectedVariance)
      console.log('This is the tooltip: ', tooltip)

      //-- Skip over dominated portfolios
      //    if ((y > portfolio_E_Return) && (x < portfolio_E_Variance)){
      //portfolio.forEach((mean, index) => {
        //console.log('This is the mean: ', (1+mean)**365.25 - 1)
        console.log('This is the expected mean: ', (1+expectedMeanReturn)**365.25 - 1)
        console.log('This is the variance: ', Variance(portfolio))
       //if ((1+expectedMeanReturn)**365.25 - 1 > (1+expectedMeanReturn)**365.25 - 1) {
          mean_variance.push(
            {
              Weights: tooltip.join(),
              Portfolio: "Simulated Portfolio", 
              y: (1+expectedMeanReturn)**365.25 - 1,
              x: expectedVariance
            }
          )
       // }
     // }
     // )
    
      // /console.log('These are the tickerTrial: ',tickerTrials)
      // let tie_out = weights.reduce((a, b) => a + b, 0)
      // console.log(tie_out)
    }
    // add current portfolio to mean_variance
    mean_variance.push(
      {
        Weights: 'ETH: .1, DAI: .9',
        Portfolio: "Current", 
        y: (1+1)** 365.25 - 1,
        x: 0.002
      }
    )
    console.log('This is the mean_variance: ', mean_variance)

    let spec1 = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A scatterplot.",
      "data": {
        "values": mean_variance
      },
      "mark": "point",
      /* "transform": [{
        "calculate": "'https://www.google.com/search?q=' + datum.Name", "as": "url"
      }], */
      "encoding": {
        "x": {"field": "x", "type": "quantitative"},
        "y": {"field": "y", "type": "quantitative"},
        "color": {"field": "Portfolio", "type": "nominal"},
        "tooltip": {"field": "Weights", "type": "nominal"},
        //"href": {"field": "url", "type": "nominal"}
      },
      "config": {
        "axisY": {
          "minExtent": 2
        }
      }
    }
    return spec1
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
    })
  }

  useEffect(() => {
    // console.log(getVar)
  }, [getVar])

  const handleSubmit = e => {
    e.preventDefault()
    async function processOnSubmit() {
      let priceArry; 
      // TODO Get the date from API here
      const response = MeanVar
      // Reformat mean_variance.json to vega-embed format
      const data = response.map((element, index) => {
      // /console.log(element,index)
      // y = mean ie Reward
      // x = variance ie Risk
      // z = type of Portfolio ie simulted EF or Current portfolio
        return {
          Weights: element.Weights,
          Portfolio: "Efficeint Frontier", // the simulated portfolios here
          y: element[0],
          x:  element[1]
        }
      })
      
      // Add current actual portfolio value to data
      // [poisitons] / total portfolio value = [percentages] 
      // sumproduct(percentages, positions) = [total portfolio value]
      // Variance([total portfolio value]), Mean([total portfolio value])
      data.push({
        Weights: "ETH 25,FRAX 25,SOLACE 25,DAI 25",
        Portfolio: "Current Portfolio", 
        y: 1.1884235164292459e+111,
        x: 2
      })

      //console.log(data)
      fetchData(data)
    }
    processOnSubmit()
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