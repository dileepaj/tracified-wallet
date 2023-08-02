import { Injectable } from '@angular/core';
import { BlockchainType, SeedPhraseService } from '../seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from '../storage-service/storage-service';
import { Asset, Memo, Networks, Operation, Server, TimeoutInfinite, TransactionBuilder, Keypair } from 'stellar-sdk';
import { blockchainNet, blockchainNetType } from 'src/app/shared/config';
import { ENV } from 'src/environments/environment';
import { Keypair as StellarKeyPair } from 'stellar-base';
import { NFT, NFTState, NFTStatus, NFTTransfer } from 'src/app/shared/nft';
import { Observable, observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { resolve } from 'dns';
import { rejects } from 'assert';

@Injectable({
   providedIn: 'root',
})
export class NFTServiceProvider {
   private readonly baseURLNFTBackend = ENV.NFT_BACKEND;
   private readonly nftStateURL = this.baseURLNFTBackend + '/walletnft/state';
   private readonly nftTxnState = this.baseURLNFTBackend + '/walletnft/txns';
   private readonly NFTGetURLBase = this.baseURLNFTBackend + '/walletnft';
   stellarKey: StellarKeyPair;
   constructor(private storageService: StorageServiceProvider, private http: HttpClient) {}

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
   public async createTrustLineForNFTTransfer(issuerPublicKey: string, receiverKeyIndex: number, senderPublicKey, assetCode: string): Promise<any> {
      const mnemonic = await this.storageService.getMnemonic();
      this.stellarKey = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, receiverKeyIndex, mnemonic) as StellarKeyPair;
      const assetToTransfer = new Asset(assetCode, issuerPublicKey);
      let server = new Server(blockchainNet);
      return new Promise((resolve, reject) => {
         server
            .loadAccount(this.stellarKey.publicKey())
            .then(async account => {
               var transaction = new TransactionBuilder(account, { fee: ENV.STELLAR_BASE_FEE, networkPassphrase: this.getNetwork() })
                  .addOperation(
                     Operation.changeTrust({
                        asset: assetToTransfer,
                        limit: '1',
                        source: this.stellarKey.publicKey().toString(),
                     })
                  )
                  .addMemo(Memo.text('NFT Ready to be received'))
                  .setTimeout(TimeoutInfinite)
                  .build();
               console.log(this.stellarKey);
               const pair = Keypair.fromSecret(this.stellarKey.secret().toString());
               console.log('sk', pair.secret());
               transaction.sign(pair);
               //console.log('xdr', transaction.toXDR());

               server
                  .submitTransaction(transaction)
                  .then(() => {
                     resolve(true);
                  })
                  .catch(error => {
                     console.log(error);
                     reject(false);
                  });
            })
            .catch(() => {
               reject(false);
            });
      });
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
      const mnemonic = await this.storageService.getMnemonic();
      this.stellarKey = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, senderAccountIndex, mnemonic) as StellarKeyPair;
      const asset = new Asset(assetCode, issuerPublicKey);
      let server = new Server(blockchainNet);
      return new Promise((resolve, reject) => {
         server
            .loadAccount(this.stellarKey.publicKey())
            .then(async account => {
               var transaction = new TransactionBuilder(account, { fee: ENV.STELLAR_BASE_FEE, networkPassphrase: this.getNetwork() })
                  .addOperation(
                     Operation.payment({
                        destination: receiverPublicKey,
                        asset: asset,
                        amount: '1',
                        source: this.stellarKey.publicKey(),
                     })
                  )
                  .addMemo(Memo.text('NFT Transferred'))
                  .setTimeout(TimeoutInfinite)
                  .build();
               console.log(this.stellarKey);
               const pair = Keypair.fromSecret(this.stellarKey.secret().toString());
               console.log('sk', pair.secret());
               transaction.sign(pair);
               server
                  .submitTransaction(transaction)
                  .then(() => {
                     resolve(true);
                  })
                  .catch(error => {
                     console.log(error);
                     reject(false);
                  });
            })
            .catch(async error => {
               console.log(`Something went wrong : ${error}`);
               reject(false);
            });
      });
   }
   /**
    * Saves the NFT state to the server.
    * @param nft The NFT object to be saved.
    * @returns An Observable that resolves with the server response.
    */
   public SaveNFTState(nft: NFTTransfer): Observable<any> {
      return this.http.post(this.nftStateURL, nft);
   }

   /**
    * Saves the NFT transaction state to the server.
    *
    * @param nft The NFT object to be saved.
    * @returns An Observable that resolves with the server response.
    */
   public SaveNFTTXNState(nft: NFT): Observable<any> {
      return this.http.post(this.nftTxnState, nft);
   }

   /**
    * Updates the NFT state with the given issuer public key and NFT status.
    * @param issuerPublicKey The issuer's public key.
    * @param nftStatus The new status of the NFT.
    * @returns An Observable that resolves with the server response.
    */
   public UpdateNFTState(issuerPublicKey: string, nftStatus: NFTStatus): Observable<any> {
      let nftState = new NFTState(issuerPublicKey, nftStatus);
      return this.http.put(this.nftStateURL, nftState);
   }

   /**
    * Retrieves NFTs based on the specified state and filters.
    * @param blockchain The blockchain to query.
    * @param state The NFT status to filter by.
    * @param ownerPublicKey The owner's public key to filter by.
    * @param requestedPage The requested page number.
    * @param pageSize The number of items per page.
    * @returns An Observable that resolves with the server response containing the filtered NFTs.
    */
   public getNFTbyState(blockchain: String, state: NFTStatus, ownerPublicKey: String, requestedPage: number, pageSize: number) {
      const url = `${this.NFTGetURLBase}?blockchain=${blockchain}&nftstatus=${state}&currentowner=${ownerPublicKey}&pagesize=${pageSize}&requestedPage=${requestedPage}`;
      return this.http.get(url);
   }

   /**
    * Retrieves NFTs based on the specified filters.
    * @param blockchain The blockchain to query.
    * @param state The NFT status to filter by.
    * @param ownerPublicKey The owner's public key to filter by.
    * @param requestedPage The requested page number.
    * @param pageSize The number of items per page.
    * @returns An Observable that resolves with the server response containing the filtered NFTs.
    */
   public getNFTByPublicKey(blockchain: String, ownerPublicKey: String, requestedPage: number, pageSize: number) {
      const url = `${this.NFTGetURLBase}?blockchain=${blockchain}&currentowner=${ownerPublicKey}&pagesize=${pageSize}&requestedPage=${requestedPage}`;
      return this.http.get(url);
   }

   /**
    * Retrieves pending NFT requests filtered by the specified user public key.
    * @param blockchain The blockchain to query.
    * @param state The NFT status to filter by.
    * @param ownerPublicKey The owner's public key to filter by.
    * @param requestedPage The requested page number.
    * @param pageSize The number of items per page.
    * @returns An Observable that resolves with the server response containing the filtered NFT requests.
    */
   public getPendingNFTRequestFilterByUser(blockchain: String, state: NFTStatus, ownerPublicKey: String, requestedPage: number, pageSize: number) {
      const url = `${this.NFTGetURLBase}/requested?blockchain=${blockchain}&nftstatus=${state}&currentowner=${ownerPublicKey}&pagesize=${pageSize}&requestedPage=${requestedPage}`;
      return this.http.get(url);
   }

   /**
    * Retrieves pending NFT requests filtered by the specified user public key.
    * @param blockchain The blockchain to query.
    * @param nftrequested The user's public key to filter by.
    * @param requestedPage The requested page number.
    * @param pageSize The number of items per page.
    * @returns An Observable that resolves with the server response containing the filtered NFT requests.
    */
   public getPendingNFTRequestByReceiver(blockchain: String, nftrequested: String, requestedPage: number, pageSize: number) {
      const url = `${this.NFTGetURLBase}/requested?blockchain=${blockchain}&nftrequested=${nftrequested}&pagesize=${pageSize}&requestedPage=${requestedPage}`;
      return this.http.get(url);
   }

   /**
    * Retrieves NFT transaction state based on the specified issuer public key.
    *
    * @param issuerPublicKey The issuer's public key to filter by.
    * @returns An Observable that resolves with the server response containing the NFT transaction state.
    */
   public getNFTTXNStatebyIssuerPublicKey(issuerPublicKey: String): Observable<any> {
      const url = `nftstate/txns/${issuerPublicKey}`;
      return this.http.get(url);
   }

   /**
    * Deletes NFT and transfers NFT request based on the specified issuer public key.
    *
    * @param issuerPublicKey The issuer's public key to filter by.
    * @returns An Observable that resolves with the server response.
    */
   public DeleteNFTTransferNFTRequestbyIssuerPublicKey(issuerPublicKey: String): Observable<any> {
      const url = `${this.nftStateURL}/${issuerPublicKey}`;
      return this.http.delete(url, { body: { issuerpublickey: issuerPublicKey } });
   }
}
