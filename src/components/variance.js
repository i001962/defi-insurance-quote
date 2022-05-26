// const arr = [4, 6, 7, 8, 9, 10, 10];
// console.log(Variance(arr))
// 4.204081632653061

export function Variance(arr) {
    if(!arr.length){
        return 0;
    };
    const sum = arr.reduce((acc, val) => acc + val);
    const { length: num } = arr;
    const median = sum / num;
    let variance = 0;
    arr.forEach(num => {
        variance += ((num - median) * (num - median));
    });
    variance /= num;
    return variance;
}
export default Variance
