import { forEach } from "lodash"

const assets = ['ETH', 'FRAX', 'SOLACE', 'DAI']
let n_assets = 4
const simulatedPortfolios = 100

let mean_variance_pairs = []
let weights_list=[]
let tickers_list=[]

//daily_returns = historicalPriceMovements
//-- Get annualised mean returns
const average = (array) => array.reduce((a, b) => a + b) / array.length;
const mus = (1+average(daily_returns))**365.25 - 1

for (let i = 0; i <simulatedPortfolios; i++) {
    let next_i = False
        let weights = []
        let tickers = []
        for (let j = 0; j < 4; j++) {
          let weight = Math.random()
          weights.push(weight)
        }
        
        let total_weight = weights.reduce((a, b) => a + b, 0)
        console.log(total_weight)
        weights.forEach((weight, index) => {
          weights[index] = weight / total_weight
        })
        console.log(weights)  
        let tie_out = weights.reduce((a, b) => a + b, 0)
        console.log(tie_out)
        
         //-- Loop over asset pairs and compute portfolio return and variance
        portfolio_E_Variance = 0
        portfolio_E_Return = 0
        for (let j = 0; j < n_assets; j++) {
             portfolio_E_Return += weights[i] * mus[j][i]
             for (j in range(len(assets))) {
                 portfolio_E_Variance += weights[i] * weights[j] * cov.loc[assets[i], assets[j]]
 

    }
}

for i in tqdm(range(10000)):
    next_i = False
    while True:
        assets = np.random.choice(list(daily_returns.columns), n_assets, replace=False)
        //- Choose weights randomly ensuring they sum to one
        weights = np.random.rand(n_assets)
        weights = weights/sum(weights)

        //-- Loop over asset pairs and compute portfolio return and variance
        portfolio_E_Variance = 0
        portfolio_E_Return = 0
        for i in range(len(assets)):
            portfolio_E_Return += weights[i] * mus.loc[assets[i]]
            for j in range(len(assets)):
                portfolio_E_Variance += weights[i] * weights[j] * cov.loc[assets[i], assets[j]]

        //-- Skip over dominated portfolios
        for R,V in mean_variance_pairs:
            if (R > portfolio_E_Return) & (V < portfolio_E_Variance):
                next_i = True
                break
        if next_i:
            break

        //-- Add the mean/variance pairs to a list for plotting
        mean_variance_pairs.append([portfolio_E_Return, portfolio_E_Variance])
        weights_list.append(weights)
        tickers_list.append(assets)
        break