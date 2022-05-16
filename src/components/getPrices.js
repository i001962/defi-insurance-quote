// https://api.covalenthq.com/v1/pricing/tickers/?quote-currency=USD&format=JSON&tickers=ETH,AAVE&key=ckey_800c35e3d0564345b0d37661f89

export async function GetPrice() {
    let priceArry;
        const response = await fetch(`https://api.covalenthq.com/v1/pricing/tickers/?quote-currency=USD&format=JSON&tickers=ETH&key=ckey_800c35e3d0564345b0d37661f89`)
          .then(res => res.json())
          .then((inhere) => {console.log(inhere);
            //let priceArry = []
            inhere.data.items.forEach((element, index) => {
              console.log(element.quote_rate)
              //priceArry.push(element.quote_rate)
              priceArry =element.quote_rate
            });
           console.log(priceArry)
            return priceArry
          }).catch(err => console.log(err))
    }

    export default GetPrice;      