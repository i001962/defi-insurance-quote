import React, { useState } from "react";
import { Fetcher, solaceUtils, Policyholder } from "@solace-fi/sdk"
import Autocomplete from "../components/autocomplete";
import Layout from "../components/layout"
import Seo from "../components/seo"

const fetcher = new Fetcher(1)
var result;

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
  
  // getSeries().then(function(series){
  //   result = series.data.protocolMap.map(a => a.appId);
  //   console.log(result);
  // })

  // var result =  getSeries();
  // console.log('suggest these ', result ) // uugh need fulfilled array not promise
  const [rows, setRows] = useState([{}]);
  const [fetchedData, setFetchedData] = useState('')
  const [fetchedRate, setFetchedRate] = useState('') 
  const columnsArray = ["appId", "balanceUSD"]; // pass columns here dynamically

  const handleAddRow = () => {
    const item = {};
    setRows([...rows, item]);
    setFetchedData("...recalc!")
    setFetchedRate("")

  };

  const postResults = async () => {
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

  return (
      <Layout>
    <Seo title="DeFi Insurance Quote" />
    <div>
      <div className="container">
        <div className="row clearfix">
          <div className="col-md-12 column">
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
            <button
              onClick={postResults}
              className="btn btn-success float-right"
            >
              Calculate Rate
            </button>
            {/* <Autocomplete suggestions={result} /> */}
          </div>
          <h2> Estimated daily cost: {fetchedData}</h2>
          <h2> Estimated annual rate: {fetchedRate}</h2>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default App;