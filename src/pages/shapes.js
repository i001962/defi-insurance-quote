import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import HistogramLive from '../components/HistogramLive.js';
import { Vega } from "react-vega";

import Layout from "../components/layout"
import Seo from "../components/seo"
import { Policy,  Coverage, solaceUtils, utils } from "@solace-fi/sdk-nightly"
import solaceGif from '../images/party.gif'
import Spreadsheet from "react-spreadsheet";
import { Link } from "gatsby"
//import { hydrateLibrary, metalog, simulateSIP, listSIPs } from '../components/hydrate'
import { hydrateLibrary, metalog, simulateSIP, listSIPs, p, q } from "@solace-fi/hydrate"
import example_tokens from '../examples/example_tokens.json'
import example_bounded from '../examples/example_bounded.json'
import example_gaussian from '../examples/example_gaussian.json'
import { forEach } from "lodash";
// Testing for hydrate in Solace SDK
// Idea is that these methods be part of SDK
// These fucntions will be used with the /volatility endpoint which generates files like example_tokens.json

console.log(hydrateLibrary(example_tokens,10) )
//console.log(metalog(example_tokens))
console.log( simulateSIP(example_tokens, 'AAVE', 10))
console.log(listSIPs(example_tokens))
const y = 0.9 // variable represents the probability that a value will be occur
const a = example_tokens.sips[1].arguments.aCoefficients
const bu = example_bounded.sips[3].arguments.upperBound // || ""
const bl = example_bounded.sips[3].arguments.lowerBound // || ""
// console.log(metalog(y, bl, bu)) // returns the value at a probability of y or lower
console.log(metalog(y, a, bl, bu))
console.log(example_bounded)
console.log(simulateSIP(example_bounded, 'Bounded', 10))
console.log(p([.89,1,1.1],a, undefined, undefined))
console.log(q([.05,.95],a, undefined, undefined))
const coverage = new Coverage(1)

const {formatUnits} = utils


const SearchForm = ({accountIn}) => {
  const [account, setAccounts] = useState(accountIn.toUpperCase())
  const [fetchedData, setFetchedData] = useState('')
  const [vaRData, setVaRData] = useState('')
  const [isLoading, setLoading] = useState(false)
  var obj;

  async function fetchData() {
    console.log(account)
    let trythis = await coverage.activeCoverLimit()
    console.log(parseFloat(formatUnits( trythis.toString(), 18)))
    var arrayTokens = account.split(',')
    console.log(arrayTokens)
  /*   const response = await fetch(`https://risk-data.solace.fi/price-history?tickers=${account}&window=365`)
      .then(res => res.json())
      .then(data => obj = data)
      //.then(() => console.log(obj))
    console.log(obj)  // /price-history?tickers=${account}&window=365
    // call /volatility endpoint here
    // call hydrate with the data from the /volatility response
    const rawResponse = await fetch('https://risk-data.solace.fi/volatility', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    }); 
    const content = await rawResponse.json();

    console.log(content);
    */
    // call metalog with the data from the /volatility response

    setLoading(true)
    const allSips = listSIPs(example_tokens)
    console.log(allSips)
    if (allSips.includes(arrayTokens[0]) === true) {
      console.log('yep') // Simulate all sips in library
     // setVaRData(metalog(y, example_tokens.sips[1].arguments.aCoefficients,"", ""))
     // console.log(vaRData)
     // Set Var or CVar left and right tail value markers
     // TODO make interactive brush rather value inputs

      setVaRData(q([0.05,0.95], example_tokens.sips[1].arguments.aCoefficients,"", ""))
      let dailyPremium = simulateSIP(example_tokens, arrayTokens[0], 1000) // Simulate a sips from library
      setFetchedData(dailyPremium)
      setLoading(false)
      } else {
        setFetchedData("Token symbol not in library")
      setLoading(false)
      }
    } 
  

  async function fetchScore() {
    console.log('reprocessing')
    //setLoading(true)

  }
  useEffect(() => {
    fetchScore()
  }, [])

  const handleSubmit = e => {
    e.preventDefault()
    fetchData()
  }

  return isLoading ? (   //Checkif if is loading
    <Loader/>
    ) : (
    <div>
      <h2>Enter Token Symbols seperated by commas</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input style={{color: "purple", fontSize: "15px", width:"375px"}} 
            placeholder="AAVE"
            type="text"
            value={account}
            onChange={e => setAccounts(e.target.value)}
          />
          <div>
            <button style={{'marginTop':'5px','background': 'rgba(95,93,249,1)','borderRadius': '8px', color: "white", fontSize: "15px", width:"175px", 'fontFamily': 'Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif','fontWeight': 'normal'}} 
              type="submit">Get Quote
            </button>   
          </div> 
        </div>
      </form>
      <div>
        <h2> name: </h2>
        <h3> trials</h3>
        <a href="https://solace.fi/cover?rc=0x65e3bde23bd82c8fad7877eda7b8fe03617c2016a99beab59e12b70a40563f4a166f94c20965ead1c3148dbb0cb49204ca27e26bc83a754ec573344c219e23911c">
          <img src="https://www.solace.fi/images/sharing.png" alt="Solace" width="200" height="100" />
        </a>
       </div>
       <HistogramLive data={fetchedData} spec='bar' var={vaRData}/>
    </div>
  )
}

const UpdateScore = () => {
  const [portfolio, setPorfolio] = useState([[{ value: "Protocol" }, { value: "Position Size (USD)" },{value:"Risk Level"}]]);
  //scores.protocols.forEach(position => {
  //      portfolio.push([{value:position.appId}, {value:position.balanceUSD},{value:position.tier}])
  //    });
      console.log(portfolio)
  //    setPorfolio(portfolio)
 
  return <Spreadsheet data={portfolio} onChange={setPorfolio} />;
};

const Loader = () => (
  <div className="loader">
     <h1> Loading....</h1>
     <img src={solaceGif} alt="Solace ring cube" />
     <p>If this doesn't work <a href="https://discord.solace.fi">blame Olaf!</a></p>
  </div>
)

const IndexPage = () => (
  <Layout>
    <Seo title="DeFi Insurance Quote" />
    <SearchForm accountIn=''/>
    {/* <UpdateScore /> */}
  </Layout>
)

export default IndexPage
