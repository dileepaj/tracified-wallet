import { Injectable } from "@angular/core";
import { BlockchainType, SeedPhraseService } from "../seedPhraseService/seedPhrase.service";
import { StorageServiceProvider } from "../storage-service/storage-service";
import { Asset, Memo, Networks, Operation, Server, TimeoutInfinite, TransactionBuilder } from "stellar-sdk";
import { blockchainNet, blockchainNetType } from "src/app/shared/config";
import { ENV } from "src/environments/environment";
import { Keypair as StellarKeyPair } from 'stellar-base';
import { NFT, NFTState, NFTStatus } from "src/app/shared/nft";
import { Observable, observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class NFTServiceProvider {
    stellarKey: StellarKeyPair;
    constructor(
        private storageService: StorageServiceProvider,
        private http: HttpClient
    ) { }

    /**
     * Gets the Stellar network passphrase based on the current blockchainNetType.
     *
     * @returns {string} The Stellar network passphrase ('public' for live network, 'testnet' for test network).
     * @author Mithila Panagoda
     */
    getNetwork() {
        return blockchainNetType === 'live' ? Networks.PUBLIC : Networks.TESTNET;
    }
    /**
     * Creates a trust line for NFT transfer on the Stellar blockchain.
     * @param {string} issuerPublicKey - The public key of the NFT issuer.
     * @param {number} receiverKeyIndex - The key index of the receiver for generating the Stellar key pair.
     * @param {string} senderPublicKey - The public key of the sender.
     * @param {string} assetCode - The code of the asset to be transferred.
     * @author mithilapanagoda
     */
    public async createTrustLineForNFTTransfer(issuerPublicKey: string, receiverKeyIndex: number, senderPublicKey, assetCode: string) {
        const mnemonic = await this.storageService.getMnemonic()
        this.stellarKey = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, receiverKeyIndex, mnemonic) as StellarKeyPair;
        const assetToTransfer = new Asset(assetCode, issuerPublicKey);
        let server = new Server(blockchainNet);
        server
            .loadAccount(this.stellarKey.publicKey())
            .then(async (account) => {
                var transaction = new TransactionBuilder(account, { fee: ENV.STELLAR_BASE_FEE, networkPassphrase: this.getNetwork() })
                    .addOperation(
                        Operation.changeTrust({
                            asset: assetToTransfer,
                            limit: '1',
                            source: senderPublicKey
                        })
                    )
                    .addMemo(Memo.text("NFT Ready to be received"))
                    .setTimeout(TimeoutInfinite)
                    .build();
                transaction.sign(this.stellarKey);
                return server.submitTransaction(transaction);
            })
    }

    /**
    * Creates a payment operation for NFT transfer on the Stellar blockchain.
    * @param {string} issuerPublicKey - The public key of the NFT issuer.
    * @param {number} senderAccountIndex - The account index of the sender for generating the Stellar key pair.
    * @param {string} receiverPublicKey - The public key of the receiver.
    * @param {string} assetCode - The code of the asset to be transferred.
    * @author mithilapanagoda
    */
    public async createPaymentOperationForNFTTransfer(issuerPublicKey: string, senderAccountIndex: number, receiverPublicKey: string, assetCode: string) {
        const mnemonic = await this.storageService.getMnemonic()
        this.stellarKey = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, senderAccountIndex, mnemonic) as StellarKeyPair;
        const asset = new Asset(assetCode, issuerPublicKey);
        let server = new Server(blockchainNet);
        server
            .loadAccount(this.stellarKey.publicKey())
            .then(async (account) => {
                var transaction = new TransactionBuilder(account, { fee: ENV.STELLAR_BASE_FEE, networkPassphrase: this.getNetwork() })
                    .addOperation(
                        Operation.payment({
                            destination: receiverPublicKey,
                            asset: asset,
                            amount: '1',
                            source: this.stellarKey.publicKey()
                        })
                    )
                    .addMemo(Memo.text("NFT Transferred"))
                    .setTimeout(TimeoutInfinite)
                    .build();
                transaction.sign(this.stellarKey);
                return server.submitTransaction(transaction);
            })
            .catch(async error => {
                console.log(`Something went wrong : ${error}`)
            })
    }

    public SaveNFTState(nft:NFT):Observable<any>{
        //TODO:add URL and error handling
        const url =``
        return new Observable((observable)=>{
            this.http.post(url,nft)
        });
    }
    public SaveNFTTXNState(nft:NFT):Observable<any>{
        //TODO:add URL and error handling
        const url =``
        return new Observable((observable)=>{
            this.http.post(url,nft);
        });
    }
    public UpdateNFTState(issuerPublicKey:string,nftStatus:NFTStatus){
        //TODO:add URL and error handling
        const url =``
        let nftState = new NFTState(issuerPublicKey,nftStatus);
        return new Observable((observable)=>{
            this.http.post(url,nftState);
        });
    }
    //TODO:implement the GET API Calls
}