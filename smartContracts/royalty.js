const Stellar = require('stellar-sdk')
//const [ pairA, pairB ] = require('../pairs.json')
const buyer_pk = "GBHV5AUKFJQXOZTLUO2NTDLRVLSDYDNQE5DLXFHJ4TI63GBLAEVLMERO"
const buyer_sk = "SBLCWEBFG7ROBE62LDFOK4JBZB3B4IOEQWNTFCG7JMFLL5F7SMENBRAF"
const mainAccount_pk = "GDVLU2LOWAJ2CHPEAYG5CF6IHMS25553WNMZABU3RJQ67N53I2FLVZOO"
//const mainAccount_sk ="SCSFJC64LW6RIQDECC5MZZVOGZ7HXZIR6ZF3QXR6YAV52CZU6WBGIRDP"
const server = new Stellar.Server('https://horizon-testnet.stellar.org')
const fee = "100"
const networkPassphrase= Stellar.Networks.TESTNET
const transaction = async () => {
    try {
        const paymentToB = {
            destination: mainAccount_pk,
            asset: Stellar.Asset.native(),
            amount: '2000',
        }
        // const txOptions = {
        //     fees: B_FEE,
        //     networkPassphrase: Stellar.Networks.TESTNET
        // }
        const accountA = await server.loadAccount(buyer_pk)
        const transaction = new Stellar.TransactionBuilder(accountA, {fee, networkPassphrase})
            .addOperation(Stellar.Operation.payment(paymentToB))
            .addMemo(Stellar.Memo.text('Royalty Payment Transaction'))
            .setTimeout(60000)
            .build()
        const StellarPairA = Stellar.Keypair.fromSecret(buyer_sk)
        transaction.sign(StellarPairA)
        return await server.submitTransaction(transaction)
    } catch (error) {
        return error;
    }

}
// transaction()
// .then((a) => console.log(a))
// .catch((e) => { console.error(e)})
(async function () {
    let txn = await transaction();
    console.log(txn);
})();