// const x = [-5, 12, -7, 0, 10]
// const y = [50, 2, 120, 87, 14]  
// console.log(SUMPRODUCT((x, y) => x > 0, x, y))
// 164 

export const Sumproduct= (callback, ar1, ar2) => {
        if(ar1.length !== ar2.length)
          throw new RangeError()
      
        let sum = 0
            
        for(let i=0; i<ar1.length; i++){
          if(callback(ar1[i], ar2[i]))
            sum += ar1[i] * ar2[i]
        }
      
        return sum
      }
      
export default Sumproduct

