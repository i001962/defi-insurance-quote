import React, { useEffect, useState } from "react";
import Layout from "../components/layout"
import Seo from "../components/seo"
import { Fetcher, solaceUtils, Policyholder } from "@solace-fi/sdk"
import solaceGif from '../images/party.gif'
import Spreadsheet from "react-spreadsheet";
import { Link } from "gatsby"
import { hydrateLibrary, metalog, simulateSIP, listSIPs } from '../components/hydrate'
import example_tokens from '../examples/example_tokens.json'
import example_bounded from '../examples/example_bounded.json'
import example_gaussian from '../examples/example_gaussian.json'

const fetcher = new Fetcher(1)

const SearchForm = ({accountIn}) => {
  const [account, setAccounts] = useState(accountIn.toUpperCase())
  const [fetchedData, setFetchedData] = useState('')
  const [isLoading, setLoading] = useState(false)
  
  async function fetchData() {
    console.log(account)
    setLoading(true)
    const allSips = listSIPs(example_tokens)
    console.log(allSips)
    if (allSips.includes(account) === true) {
      console.log('yep') // Simulate all sips in library
      let dailyPremium = simulateSIP(example_tokens, account, 10) // Simulate a sips from library
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
      <h2>Enter Token Symbol</h2>
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
        <h2> name: {fetchedData}</h2>
        <h3> trials</h3>
        <a href="https://solace.fi/cover?rc=0x65e3bde23bd82c8fad7877eda7b8fe03617c2016a99beab59e12b70a40563f4a166f94c20965ead1c3148dbb0cb49204ca27e26bc83a754ec573344c219e23911c">
          <img src="https://www.solace.fi/images/sharing.png" alt="Solace" width="200" height="100" />
        </a>
       </div>
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
