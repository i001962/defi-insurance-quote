import React, { useState } from "react";
import { Fetcher, solaceUtils, BigNumber, utils } from "@solace-fi/sdk"
import Autocomplete from "../components/autocomplete";
import Layout from "../components/layout"
import Seo from "../components/seo"
import solaceGif from '../images/party.gif'
import { Link } from "gatsby"

const fetcher = new Fetcher(1)
const {formatUnits} = utils

const result = [
  "aave-amm",
  "aave-safety-module",
  "aave-v1",
  "aave-v2",
  "aavegotchi",
  "abracadabra",
  "adamant",
  "alchemix",
  "alkemi",
  "alpha-tokenomics",
  "alpha-v1",
  "alpha-v2",
  "apeswap",
  "apy",
  "arcx",
  "armor",
  "augur",
  "autofarm",
  "b-protocol",
  "badger",
  "balancer-v1",
  "balancer-v2",
  "bancor",
  "bao",
  "barnbridge",
  "barnbridge-smart-yield",
  "beefy",
  "beethoven-x",
  "belt",
  "benqi",
  "blizz",
  "compound",
  "convex",
  "cream",
  "cryptex",
  "curve",
  "defi-kingdoms",
  "defi-swap",
  "defisaver",
  "derivadex",
  "deversifi",
  "dforce",
  "dfyn",
  "dhedge",
  "dinoswap",
  "dodo",
  "dopex",
  "dydx",
  "88mph",
  "88mph-v3",
  "element",
  "eleven-finance",
  "ellipsis",
  "fei",
  "float-capital",
  "float-protocol",
  "frax",
  "gamma-strategies",
  "geist",
  "gmx",
  "governor-dao",
  "grim",
  "gro",
  "harvest",
  "hector-dao",
  "hegic",
  "hop",
  "hundred-finance",
  "idle",
  "illuvium",
  "index-coop",
  "indexed",
  "inverse",
  "iron",
  "iron-bank",
  "jones-dao",
  "keep-network",
  "keeper-dao",
  "klima",
  "klondike",
  "kogefarm",
  "kyber-dmm",
  "liquity",
  "looks-rare",
  "loopring",
  "lydia",
  "lyra",
  "maker",
  "maple",
  "mirror",
  "mooniswap",
  "morpheus-swap",
  "mstable",
  "nexus-mutual",
  "nft20",
  "nftx",
  "notional-finance",
  "nsure-network",
  "olympus",
  "ondo",
  "1inch",
  "onx",
  "opium-network",
  "opyn",
  "origin",
  "orion-protocol",
  "otterclam",
  "pancakeswap",
  "pangolin",
  "penguin",
  "perpetual-protocol",
  "pickle",
  "pie-dao",
  "platypus-finance",
  "polywhale",
  "pool-together",
  "pooltogether-v4",
  "popsicle",
  "powerpool",
  "qi-dao",
  "quickswap",
  "r-u-generous",
  "railgun",
  "rari-fuse",
  "realt",
  "reaper",
  "redacted-cartel",
  "reflexer",
  "ribbon",
  "ribbon-v2",
  "sablier",
  "saddle",
  "scarecrow",
  "scream",
  "shapeshift",
  "shell",
  "smoothy",
  "snowball",
  "snowbank",
  "snowdog",
  "snowswap",
  "solarbeam",
  "solidly",
  "spartacus",
  "spiritswap",
  "spookyswap",
  "squid",
  "stake-dao",
  "stormswap",
  "superfluid",
  "sushiswap",
  "sushiswap-kashi",
  "swapr",
  "swerve",
  "synlev",
  "synthetix",
  "tarot",
  "teddy-cash",
  "the-graph",
  "tokemak",
  "tokenlon",
  "tomb",
  "tornado-cash",
  "trader-joe",
  "truefi",
  "ubeswap",
  "unagii",
  "uniswap-v1",
  "uniswap-v2",
  "uniswap-v3",
  "unit",
  "universe",
  "venus",
  "vesper",
  "vesta-finance",
  "waultswap",
  "wepiggy",
  "wonderland",
  "xsigma",
  "yam",
  "yaxis",
  "yearn",
  "zlot"
]

const Loader = () => (
  <div className="loader">
     <h1> Loading....</h1>
     <img src={solaceGif} alt="Solace ring cube" />
     <p>If this doesn't work <a href="https://discord.solace.fi">blame Olaf!</a></p>
  </div>
)

// Used only to get array of protocols. TODO fix autosuggest.
async function getSeries() {
  
    let response = await fetch('https://risk-data.solace.fi/series', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'GET',
    });
    // you can check for response.ok here, and literally just throw an error if you want
    return await response.json();
  }


const App = () => {
/*   
 getSeries().then(function(series){
     const result1 = series.data.protocolMap.map(a => a.appId);
     //console.log(result1);
    return result1
   })

  var resulty = getSeries();  */
  // console.log('suggest these ', result ) // uugh need fulfilled array not promise
  const [rows, setRows] = useState([{}]);
  const [fetchedData, setFetchedData] = useState('')
  const [fetchedRate, setFetchedRate] = useState('') 
  const [isLoading, setLoading] = useState(false)

  const columnsArray = ["appId", "balanceUSD"]; // pass columns here dynamically

  const handleAddRow = () => {
    const item = {};
    setRows([...rows, item]);
    setFetchedData("...recalc!")
    setFetchedRate("")

  };

  const postResults = async () => {
    setLoading(true)
    console.log(rows); // there you go, do as you please
    var scoresBody = [];
    rows.forEach(fillBody)
    function fillBody(item, index, arr){
        if (item.balanceUSD == 0){
            return } 
        else{
        scoresBody.push({appId: item.appId, network: "ethereum", balanceUSD: parseFloat(item.balanceUSD)});
        console.log(item.appId, item.balanceUSD)
        }
    }
    if (scoresBody[0].balanceUSD ){
        let scores = await fetcher.getSolaceRiskScores("", scoresBody);  
        console.log(scores)  
        let dailyPremium = "$"+parseFloat(scores.address_rp / 365.25).toFixed(2);
        setFetchedData(dailyPremium)
        let annualRate = parseFloat(scores.current_rate * 100).toFixed(2)+"%";
        setFetchedRate(annualRate)
        setLoading(false)

    }
  };

  const handleRemoveSpecificRow = (idx) => {
    const tempRows = [...rows]; // to avoid  direct state mutation
    tempRows.splice(idx, 1);
    setRows(tempRows);
    setFetchedData("...recalc!")

  };

  const updateState = (e) => {
    let prope = e.target.attributes.column.value; // the custom column attribute
    let index = e.target.attributes.index.value; // index of state array -rows
    let fieldValue = e.target.value; // value

    const tempRows = [...rows]; // avoid direct state mutation
    const tempObj = rows[index]; // copy state object at index to a temporary object
    tempObj[prope] = fieldValue; // modify temporary object
    tempRows[index] = tempObj; // return object to rows` clone
    setRows(tempRows); // update state
  };

  return isLoading ? (   //Checkif if is loading
  <Layout>
  <Seo title="DeFi Insurance Quote" />
    <Loader/>
    </Layout>
    ) : (
      <Layout>
    <Seo title="DeFi Insurance Quote" />
    <div>
      <div className="container">
        <div className="row clearfix">
        <div className="float-right">
            <h3>1. Find appId by Protocol name</h3>
            <Autocomplete suggestions={result}  />
        </div> 
        <div className="col-md-12 column">
            <h3>2. Build Portfolio</h3>
            <table className="table table-bordered table-hover" id="tab_logic">
              <thead>
                <tr>
                  <th className="text-center"> # </th>
                  {columnsArray.map((column, index) => (
                    <th className="text-center" key={index}>
                      {column}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    {columnsArray.map((column, index) => (
                      <td key={index}>
                        <input
                          type="text"
                          column={column}
                          value={rows[idx][column]}
                          index={idx}
                          className="form-control"
                          onChange={(e) => updateState(e)}                             
                        />
                      </td>
                    ))}
                    <td>
                        <button onClick={handleAddRow} className="btn btn-primary">+</button>
                   
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemoveSpecificRow(idx)}
                      >
                        -
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>3. Simulate Insurance Cost</h3>
            <button
              onClick={postResults}
              className="btn btn-success float-right"
            >
              Calculate
            </button>
          </div>
          <h3> Estimated daily cost: {fetchedData}</h3>
          <h3> Estimated annual rate: {fetchedRate}</h3>
          <h1> Purchase policy at</h1>
        <a href="https://solace.fi/cover?rc=0x65e3bde23bd82c8fad7877eda7b8fe03617c2016a99beab59e12b70a40563f4a166f94c20965ead1c3148dbb0cb49204ca27e26bc83a754ec573344c219e23911c">
          <img src="https://www.solace.fi/images/sharing.png" alt="Solace" width="200" height="100" />
        </a>
       </div>
      </div>
    </div>
    </Layout>
  );
};

export default App;