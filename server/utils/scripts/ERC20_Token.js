web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/xxxx"));
let WALLETBASE = "xxx";      
let contractAddr = "xxx";    
let gasPrice = web3.utils.toHex(41 * 10^9); //41gwei

let abi = JSON.parse(fs.readFileSync("./file.abi").toString("utf8"));
let contractInstance = new web3.eth.Contract(abi, contractAddr);
function setAllocation(_nonce, _to, _amount){
console.log('prepare for new transaction: %s %s', _to, _amount);
var transfer_amount = _amount + '000000000000000000';
let data = web3.utils.sha3("transfer(address,uint256)").substr(0,10)    
            + "000000000000000000000000"                                
            + _to.substr(2,40)                                          
            + "00000000000000000000000000000000"                        
            + toHex32(transfer_amount);                                         
var noncehex = "0x" + _nonce.toString(16);
// console.log('data: ' + data);

web3.eth.estimateGas({
    "from" : WALLETBASE,
    "nonce": noncehex,
    "to"   : contractAddr,
    "data" : data
}).then((value) => {
    console.log("gas limit: " + value);
    var signedTx = {
        "from"      : WALLETBASE,       
        "nonce"     : noncehex, 
        "gasPrice"  : gasPrice,         
        "gasLimit"  : value,
        "to"        : contractAddr,     
        "value"     : "0x00",
        "data"      : data,
        "chainId"   : 1
    }

    var privateKey = new Buffer.from("xxxx", 'hex');
    var tx = new Tx(signedTx);
    tx.sign(privateKey);
    var serializedTx = tx.serialize();

    try{
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'),
            function(err, hash) {
            if (!err) {
                console.log("-------------------");
                console.log("to: " + _to);
                console.log("TxHash: " + hash);
            } else {
                console.log("=====error occur=====");
                console.log(err);
            }
        });
    }catch(err){
        console.log('ERROR: ' + err);
    }
});
}