import React, { useEffect, useState } from "react";
import Layout from "../components/layout"
import Seo from "../components/seo"
import { Fetcher, solaceUtils, BigNumber, utils } from "@solace-fi/sdk"
import solaceGif from '../images/party.gif'
import Spreadsheet from "react-spreadsheet";
import { Link } from "gatsby"

// Create new Fetcher instance (contains blockchain read-only methods), connected to Ethereum mainnet (chainID = 1)
const fetcher = new Fetcher(1)
const {formatUnits} = utils

const SearchForm = ({accountIn}) => {
  const [account, setAccounts] = useState(accountIn)
  const [fetchedData, setFetchedData] = useState('')
  const [metaData, setMetaData] = useState('')

  const [isLoading, setLoading] = useState(false)
  async function fetchData() {
    console.log(account)
    setLoading(true)
    // Trying to keep this free from needing wallet access
    // TODO STILL- proper account validation, Can we use web3.utils.isAddress(account) without logging in?   
    if (account.length === 42 && account.substring(0,2) === '0x') {
      var stats = {};
    //setLoading(true)
    const activeCoverLimit = await fetcher.activeCoverLimit()
    stats.activeCoverLimit = parseFloat(formatUnits(activeCoverLimit.toString(), 18))
    const availableCoverCapacity = await fetcher.availableCoverCapacity() // BigNumber { _hex: '0x13419b9a2817b2b8ca00', _isBigNumber: true }
    stats.availableCoverCapacity = parseFloat(formatUnits(availableCoverCapacity.toString(), 18))    
    const maxCover = await fetcher.maxCover() 
    stats.maxCover = parseFloat(formatUnits(maxCover.toString()))
    const policyCount = await fetcher.policyCount() 
    stats.policyCount =parseFloat(formatUnits(  policyCount.toString(),0))    
    const accountBalanceOf = await fetcher.accountBalanceOf(account) 
    stats.accountBalanceOf = parseFloat(formatUnits( accountBalanceOf.toString()))    
    const policyNum = await fetcher.policyOf(account)
    stats.policyNum= parseFloat(formatUnits(policyNum.toString(),0))
    const policyCover = await fetcher.coverLimitOf(parseFloat(formatUnits(  policyNum.toString(),0)))
    stats.policyCoverLimit=formatUnits( policyCover)    
    const minAccntBal = await fetcher.minRequiredAccountBalance(activeCoverLimit) 
    stats.minRequiredAccountBalance=formatUnits(minAccntBal)
    const policyStatus =  await fetcher.policyStatus(policyNum) 
    stats.policyStatus =  policyStatus
    const rewardPointsOf = await fetcher.rewardPointsOf(account)
    console.log(policyStatus)
    stats.rewardPointsOf=formatUnits(  rewardPointsOf.toString())
    stats.wasReferredIn =  await fetcher.isReferralCodeUsed(account) // false
    console.log('yo dog: ', stats)
    setMetaData(stats)
    setLoading(false)

    } else {
      setFetchedData("Invalid address try: 0xfb5cAAe76af8D3CE730f3D62c6442744853d43Ef")
      setLoading(false)
    }
  }

  async function fetchScore() {
    console.log('reprocessing')
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
              type="submit">Get Policy Details
            </button>   
          </div> 
        </div>
      </form>
      <div>
        <h1> Policy Details #{metaData.policyNum}</h1>
        <p> Policy Balance Remaining: {"$"+parseFloat(metaData.accountBalanceOf).toFixed(2)}</p>
        <p> Cover Limit: {"$"+parseFloat(metaData.policyCoverLimit).toFixed(2)}</p>
        <p> Policy Active: {metaData.policyStatus}</p> {/* ftw why not displaying */}
        <p> Rewards Earned: {"$"+parseFloat(metaData.rewardPointsOf).toFixed(2)}</p>
        <p> Was referred: {metaData.wasReferredIn}</p> {/* ftw why not displaying */}
        
        <h1> Protocol Details</h1>
        <p> Available Cover Capacity: {"$"+parseFloat(metaData.availableCoverCapacity).toFixed(2)}</p>
        <p> Underwriting Pool Limit: {"$"+parseFloat(metaData.maxCover).toFixed(2)}</p>    
        <p> Total Active Cover Limit: {"$"+parseFloat(metaData.activeCoverLimit).toFixed(2)}</p>
        <p> Total Active Policies: {metaData.policyCount}</p>
        <p> Min Required Account Balance: {"$"+parseFloat(metaData.minRequiredAccountBalance).toFixed(2)}</p>

        <h3> Check out the <Link to="/page2">portfolio simulator</Link>!</h3>
        <h3> Find the daily rate <Link to="/"> for your portfolio</Link>!</h3>

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
    <SearchForm accountIn='0xfb5cAAe76af8D3CE730f3D62c6442744853d43Ef'/>
    {/* <UpdateScore /> */}
  </Layout>
)

export default IndexPage
