import { Injectable } from '@angular/core';
import { BlockchainType, SeedPhraseService } from '../seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from '../storage-service/storage-service';
import { Asset, Memo, Networks, Operation, Server, TimeoutInfinite, TransactionBuilder, Keypair } from 'stellar-sdk';
import { blockchainNet, blockchainNetType } from 'src/app/shared/config';
import { ENV } from 'src/environments/environment';
import { Keypair as StellarKeyPair } from 'stellar-base';
import { NFT, NFTState, NFTStatus, NFTTransfer } from 'src/app/shared/nft';
import { Observable, observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BlockchainServiceProvider } from './blockchain-service';
import { Properties } from 'src/app/shared/properties';

@Injectable({
   providedIn: 'root',
})
export class NFTServiceProvider {
   private readonly baseURLNFTBackend = ENV.NFT_BACKEND;
   private readonly nftStateURL = this.baseURLNFTBackend + '/walletnft/state';
   private readonly nftTxnState = this.baseURLNFTBackend + '/walletnft/txns';
   private readonly NFTGetURLBase = this.baseURLNFTBackend + '/walletnft';
   stellarKey: StellarKeyPair;
   constructor(private storageService: StorageServiceProvider, private http: HttpClient, private blockchainServiceProvider: BlockchainServiceProvider, private properties: Properties) {}

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
    * Checks the account status and balance for a given publicKey.
    * @param publicKey The public key of the account to check.
    * @returns A Promise that resolves to the account balance or rejects with an error message.
    */
   public checkAccountStatusAndBalance(publicKey: string): Promise<any> {
      return new Promise((resolve, reject) => {
         // Call the blockchainServiceProvider to check the account status.
         this.blockchainServiceProvider
            .checkBCAccountStatus(publicKey)
            .then((res: any) => {
               // Extract the account balance from the response.
               let accountBalance = res.balances[res.balances.length - 1].balance;

               // Get the minimum balance required for the account based on subentry count.
               let minimumBalance = this.blockchainServiceProvider.getMinimumBalanceForAccount(res.subentry_count);

               // Compare the account balance with the minimum required balance.
               if (parseFloat(accountBalance) <= minimumBalance) {
                  // If the balance is too low, reject the Promise with an error message.
                  reject(`Low Balance: Account should have at least ${minimumBalance} XLM`);
               }

               // If the balance is sufficient, resolve the Promise with the account balance.
               resolve(parseFloat(accountBalance));
            })
            .catch(err => {
               // If there's an error (account not funded), reject the Promise with an appropriate error message.
               reject('Account is not funded');
            });
      });
   }

   /**
    * Saves the NFT state to the server.
    * @param nft The NFT object to be saved.
    * @returns An Observable that resolves with the server response.
    */
   public SaveNFTState(nft: NFTTransfer): Observable<any> {
      let opts = {
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: `Bearer ${this.properties.token}`,
         }),
      };
      return this.http.post(this.nftStateURL, nft, opts);
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
   public UpdateNFTState(id: string, issuerPublicKey: string, nftStatus: NFTStatus): Observable<any> {
      let opts = {
         headers: new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'Application/json',
            Authorization: `Bearer ${this.properties.token}`,
         }),
      };
      let nftState = new NFTState(id, issuerPublicKey, nftStatus);
      return this.http.put(this.nftStateURL, nftState, opts);
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

   /**
    * Change the NFT's owner property to the new owner's address after a successful transfer.
    * @param id Object id fetched from db
    * @param ownerPublicKey New owner's public key
    * @returns An Observable that resolves with the server response.
    */
   public updateNFTOwner(id: string, ownerPublicKey: string): Observable<any> {
      const url = `${this.baseURLNFTBackend}/walletnfts/owner`;
      return this.http.put(url, { Id: id, nftowner: ownerPublicKey });
   }

   public getNFTStateByNFTId(nftid: string): Promise<any> {
      return new Promise((resolve, reject) => {
         const url = `${this.baseURLNFTBackend}/nftstate/info/${nftid}`;
         this.http.get(url).subscribe({
            next: res => {
               resolve(res);
            },
            error: error => {
               if (error.status == 400) {
                  resolve(false);
               } else {
                  reject(error);
               }
            },
         });
      });
   }
}
