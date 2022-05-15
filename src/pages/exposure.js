import React, { useEffect, useState } from "react";
import Layout from "../components/layout"
import Seo from "../components/seo"
import { Fetcher, solaceUtils, BigNumber, utils } from "@solace-fi/sdk-nightly"
import solaceGif from '../images/party.gif'
import { Link } from "gatsby"
import Select from 'react-select'
import { add } from "lodash";

const options = [
  { value: 137, label: 'polygon' }
    // ,{ value: 137, label: 'polygon' }
]

const ChainSelector = () => (
  <Select options={options} />
)
let allAccounts = []
var allPolicies = []

let fetcher = new Fetcher(137)
const {formatUnits} = utils

const ChainForm = () => {
  const [selectedOption, setSelectedOption] = useState({value: 137, label: 'polygon'});
  console.log(selectedOption.value)
  fetcher = new Fetcher(selectedOption.value)
  console.log( fetcher.policyCount()) // BigNumber { _hex: '0x04', _isBigNumber: true }

  var itsActive;
  async function fetchPolicies() {
    const getIt =  fetch (`https://risk-data.solace.fi/billings/all?chain_id=`+selectedOption.value)
    .then(response => response.json())
    .then(data => {
      data.billings.map(billing => {
        if (!allAccounts.includes(billing.address)) {
          allAccounts.push(billing.address)
      }})
    })
    .then(data1 => {
      allAccounts.forEach(async(account) => {
        const policyNumber = await fetcher.policyOf(account)
        const coverLimit = await fetcher.coverLimitOf(parseFloat(formatUnits(policyNumber.toString(),0)))
        const activeStatus = await fetcher.policyStatus(policyNumber) // true
        if(activeStatus)  {
          itsActive = true } else { itsActive = false }
        const positions = await fetch('https://risk-data.solace.fi/balances', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"account": account,"chains": [selectedOption.value]})
        });
        const allPositions = await positions.json()
        console.log(allPositions);
        const largestPosition = Math.max(...allPositions.map(o => o.balanceUSD), 0);
        console.log(itsActive);
        allPolicies.push({'account':account, 'policyNumber':formatUnits(policyNumber.toString(),0),'coverLimit':formatUnits( coverLimit),'activeStatus':itsActive,'largestPosition':largestPosition  })
      });
      console.log(allAccounts)

    })
  }
  fetchPolicies()
  

  return (
    <><div className="App">
      <Select
        defaultValue={selectedOption}
        onChange={setSelectedOption}
        options={options} />
    </div><div>
        <h1>All Accounts *hacky watch for loading in console</h1>
        <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Active</th>
                <th>Cover Limit</th>
                <th>Largest Position</th>
                <th>Headroom</th>
              </tr>
            </thead>
          
          {allPolicies.map(account => (  <tbody key={account.account}>
            <tr>
            <th><a href={`https://etherscan.io/address/${account.account}`}>{account.policyNumber}</a></th> 
            <th>{account.activeStatus = true ? "yes" : "no" }</th> 
            <th>{'$'+parseFloat(account.coverLimit).toFixed(2)}</th> 
            <th>{'$'+parseFloat(account.largestPosition).toFixed(2)}</th>
            <th>{'$'+parseFloat(account.coverLimit-account.largestPosition).toFixed(2)}</th>

            </tr> 
          </tbody>
        ))}
        </table> 
     </div></>
  );
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
    </Layout>
)

export default IndexPage
