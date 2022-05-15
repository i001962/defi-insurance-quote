import React, { useEffect, useState } from "react";
import Layout from "../components/layout"
import Seo from "../components/seo"
import { xSolaceBalance, SolaceBalance, Policyholder } from "@solace-fi/sdk-nightly"
import solaceGif from '../images/party.gif'
import Spreadsheet from "react-spreadsheet";
import { Link } from "gatsby"

async function getVotePower() {  
  let response = await fetch('https://stats.solace.fi/votePower', {
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
      method: 'GET',
  });
  // you can check for response.ok here, and literally just throw an error if you want
  return await response.json();
}
const SearchForm = ({accountIn}) => {
  const [account, setAccounts] = useState(accountIn)
  const [fetchedData, setFetchedData] = useState('')
  const [fetchedData2, setFetchedData2] = useState('')
  const [fetchedData3, setFetchedData3] = useState('')

  const [isLoading, setLoading] = useState(false)
  async function fetchData() {
    console.log(account)
    setLoading(true)
    // Trying to keep this free from needing wallet access
    // TODO STILL- proper account validation, Can we use web3.utils.isAddress(account) without logging in?   
    if (account.length === 42 && account.substring(0,2) === '0x') {
      const XSolaceBalance = new xSolaceBalance(account)
      const solaceBalance = new SolaceBalance("0x499dd900f800fd0a2ed300006000a57f00fa009b")

      //
      let myobj2 = await solaceBalance.getSolaceBalanceOf(1) 
      //let votePower2 = JSON.parse(myobj2);
      console.log('getSolaceBalanceOf', myobj2)
      
      let votePower3 = await XSolaceBalance.getXSolaceBalanceSum() 
      console.log('getXSolaceBalanceSum',votePower3)
      
      let myobj = await XSolaceBalance.getAllXSolaceBalances() 
      let votePower = JSON.parse(myobj);
      console.log('getAllXSolaceBalances',myobj)

      let xsolvote1 = await XSolaceBalance.getXSolaceBalanceOf(1)
      let holder1 = JSON.parse(xsolvote1);
      console.log('getXSolaceBalanceOf',xsolvote1)

      if (votePower) {
        let votes = 0;
        let notfound = 'no voting power found'
        let totalVotes = 0;
        setFetchedData(votePower3.toLocaleString())
        setFetchedData2(totalVotes.toLocaleString())
        setFetchedData3(((Number(votes)/Number(totalVotes))*100).toFixed(2)+'%')
        setLoading(false)
        if (votes == 0) {
          setFetchedData(notfound)
          setLoading(false)
        }
      } 
       else {
        setFetchedData("no voting power found")
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
      <h2>Solace Governance</h2>
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
              type="submit">Calculate Voting Power
            </button>   
          </div> 
        </div>
      </form>
      <div>
        <h2> Account's votes: {fetchedData}</h2>
        <h2> Possible votes: {fetchedData2}</h2>
        <h2> Voting power: {fetchedData3}</h2>

        <h3> Purchase policy on Poloygon using FRAX</h3>
        <a href="https://solace.fi/cover?rc=0xe5457353ef86968741f7f85b5dffb2f27389395990a3609adb0f77b9fc2273e636a9660ea535698f207e1413f267ce8b74bc8bf6ffae66a38804443d04fd26ca1b">
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
    <Seo title="Solace DAO Voting Power" />
    <SearchForm accountIn='0xA400f843f0E577716493a3B0b8bC654C6EE8a8A3'/>
    {/* <UpdateScore /> */}
  </Layout>
)

export default IndexPage
