import React, { useEffect, useState } from "react";
import Layout from "../components/layout"
import Seo from "../components/seo"
import { Fetcher, solaceUtils, Policyholder } from "@solace-fi/sdk"
import solaceGif from '../images/party.gif'
import Spreadsheet from "react-spreadsheet";
import { Link } from "gatsby"

// Create new Fetcher instance (contains blockchain read-only methods), connected to Ethereum mainnet (chainID = 1)
const fetcher = new Fetcher(1)

const SearchForm = ({accountIn}) => {
  const [account, setAccounts] = useState(accountIn)
  const [fetchedData, setFetchedData] = useState('')
  const [isLoading, setLoading] = useState(false)
  async function fetchData() {
    console.log(account)
    setLoading(true)
    // Trying to keep this free from needing wallet access
    // TODO STILL- proper account validation, Can we use web3.utils.isAddress(account) without logging in?   
    if (account.length === 42 && account.substring(0,2) === '0x') {
      const holdPortfolio = await fetcher.getSolaceRiskBalances(account);
      //const holdPortfolio = await fetcher.getSolaceRiskBalances_MultiChain(account,[1]);
      console.log(holdPortfolio)
      if (holdPortfolio.length > 0) {
      let scores = await fetcher.getSolaceRiskScores(account, holdPortfolio);    
      console.log(scores)
      let dailyPremium = "$"+parseFloat(scores.address_rp / 365.25).toFixed(2);
      setFetchedData(dailyPremium)
      setLoading(false)
      } else {
        setFetchedData("no DeFi protocols found")
      setLoading(false)
      }
    } else {
      setFetchedData("Invalid address try: 0xbdF81b19af7848F7384c38E68208885ff0C9F390")
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
      <h2>Enter Ethereum Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input style={{color: "purple", fontSize: "15px", width:"375px"}} 
            placeholder="0xbdF81b19af7848F7384c38E68208885ff0C9F390"
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
        <h2> Estimated daily rate: {fetchedData}</h2>
        <h3> Purchase policy at</h3>
        <a href="https://solace.fi/cover?rc=0x65e3bde23bd82c8fad7877eda7b8fe03617c2016a99beab59e12b70a40563f4a166f94c20965ead1c3148dbb0cb49204ca27e26bc83a754ec573344c219e23911c">
          <img src="https://www.solace.fi/images/sharing.png" alt="Solace" width="200" height="100" />
        </a>
        <h3> Check out the <Link to="/page2">portfolio simulator</Link>!</h3>
        <h3> Review policy <Link to="/page3"> details</Link>!</h3>
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
    <SearchForm accountIn='0xbdF81b19af7848F7384c38E68208885ff0C9F390'/>
    {/* <UpdateScore /> */}
  </Layout>
)

export default IndexPage
