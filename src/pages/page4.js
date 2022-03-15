import React, { useEffect, useState } from "react";
import Layout from "../components/layout"
import Seo from "../components/seo"
import { Fetcher, solaceUtils, Policyholder, BigNumber,utils } from "@solace-fi/sdk"
import solaceGif from '../images/party.gif'
import Select from 'react-select'
import { Link } from "gatsby"
const { getSigner } = solaceUtils

const options = [
  { value: 4, label: 'rinkeby' }
]

const ChainSelector = () => (
  <Select options={options} />
)

let fetcher = new Fetcher(4)
const {formatUnits} = utils

const ChainForm = () => {
  const [selectedOption, setSelectedOption] = useState({value: 4, label: 'rinkeby'});
  console.log(selectedOption.value)
  fetcher = new Fetcher(selectedOption.value)

  return (
    <div className="App">
      <Select 
        defaultValue={selectedOption}
        onChange={setSelectedOption}
        options={options}
      />
    </div>
  );
}
const SearchForm = ({accountIn}) => {
  const [account, setAccounts] = useState(accountIn)
  const [fetchedData, setFetchedData] = useState('')
  const [isLoading, setLoading] = useState(false)
  async function fetchData() {
    console.log(account)
    setLoading(true)
    // TODO STILL- proper account validation, Can we use web3.utils.isAddress(account) without logging in?   
    if (account.length === 42 && account.substring(0,2) === '0x') {
      if (1 > 0) {
        // If no parameters are provided, getSigner() will default to connecting to a selected Metamask account
        // Read section on Helper Methods on how to customise RPC endpoint and other network settings
        const signer = await getSigner()
        // Create new Policyholder instance that is connected to Rinkeby testnet and Metamask
        const policyholder = new Policyholder(fetcher.chainID, signer)
        //const POLICYHOLDER_ADDRESS = "0xfb5cAAe76af8D3CE730f3D62c6442744853d43Ef"
        const COVER_LIMIT = BigNumber.from("0100000000000000000000") // 1000 USD
        const DEPOSIT_AMOUNT = BigNumber.from("002000000000000000000") // 1 USD
        const REFERRAL_CODE = [] // Empty referral code argument

      // Makes call to activatePolicy() function on SolaceCoverProduct.sol with provided parameters
      // Read documentation on how to customize gas settings for the transaction
     /*  let tx = await policyholder.activatePolicy(
        account,
        COVER_LIMIT,
        DEPOSIT_AMOUNT,
        REFERRAL_CODE
      ).then(tx => { 
        console.log(tx)
      })
      console.log(tx) */
       /* let tx = await policyholder.updateCoverLimit(
        COVER_LIMIT,
        REFERRAL_CODE
    )
    console.log(tx)  */

    let tx = await policyholder.deposit(
        account,
        DEPOSIT_AMOUNT
    )
    console.log(tx) 

      //setFetchedData(dailyPremium)
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
      <h2>Enter ethereum account you want to buy cover for</h2>
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
              type="submit">Deposit Prepaid Premium
            </button>   
          </div> 
        </div>
      </form>
      <div>
        {/* <h2> Estimated daily rate: {fetchedData}</h2> */}
        <h3> Purchase policy at</h3>
        <a href="https://solace.fi/cover?rc=0x65e3bde23bd82c8fad7877eda7b8fe03617c2016a99beab59e12b70a40563f4a166f94c20965ead1c3148dbb0cb49204ca27e26bc83a754ec573344c219e23911c">
          <img src="https://www.solace.fi/images/sharing.png" alt="Solace" width="200" height="100" />
        </a>
      </div>
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
    <Seo title="DeFi Insurance Quote" />
    <ChainForm/>
    <SearchForm accountIn='0x1fc6e73075C584dBDDa0e53449E2C944986b9A72'/>
  </Layout>
)

export default IndexPage
