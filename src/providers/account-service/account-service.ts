import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network, Operation, Keypair, TransactionBuilder, Server, Account, Asset, AccountResponse, Transaction } from 'stellar-sdk';

import { Properties } from '../../shared/properties';
import { blockchainNet } from '../../shared/config';
import { blockchainNetType } from '../../shared/config';
import { Logger } from 'ionic-logger-new';
import { Organization } from '../../shared/models/organization';

@Injectable()
export class AccountServiceProvider {

   constructor(
      public http: HttpClient,
      private logger: Logger,
      private properties: Properties,
   ) { }


   buildProofHash(payload: any, secretKey: string, receiver: string) {
      return new Promise((resolve, reject) => {
         let sourceKeypair = Keypair.fromSecret(secretKey);
         if (blockchainNetType === 'live') {
            Network.usePublicNetwork();
         } else {
            Network.useTestNetwork();
         }
         let server = new Server(blockchainNet);
         server.loadAccount(sourceKeypair.publicKey()).then((account) => {
            var transaction = new TransactionBuilder(account);
            // transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '11', }))
            if (receiver !== "") {
               transaction.addOperation(Operation.manageData({ name: 'Receiver', value: receiver }));
            }
            
            Object.keys(payload).forEach((key: any) => {
               try {
                  if (payload[key]) transaction.addOperation(Operation.manageData({ name: key, value: payload[key] }))
               } catch (error) {
                  this.logger.error("Failed to add Operation - buildProofHash(): " + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
               }
            })

            const txn = transaction.build();
            txn.sign(sourceKeypair);

            return server.submitTransaction(txn);

         }).then((transactionResult) => {
            this.logger.info("Proof built successfully buildProofHash()", this.properties.skipConsoleLogs, this.properties.writeToFile);
            resolve(transactionResult.hash);
         }).catch((err) => {
            this.logger.error("Failed to Build Proof buildProofHash(): " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
            reject(err);
         });
      });
   }

   buildAcceptXDR(organization: any, proofHash: any, subAccount: any, signerSK: string, receiver?: any) {
      return new Promise((resolve, reject) => {
         if (blockchainNetType === 'live') {
            Network.usePublicNetwork();
         } else {
            Network.useTestNetwork();
         }
         let server = new Server(blockchainNet);

         if (subAccount.sequenceNo == "") {
            server.loadAccount(subAccount.publicKey).then((account) => {
               this.logger.info("Successfully loaded the account - buildAcceptXDR()", this.properties.skipConsoleLogs, this.properties.writeToFile);
               let txn = this.acceptTxnBuilder(organization, account, signerSK, proofHash, receiver);
               resolve(txn);
            }).catch((err) => {
               this.logger.error("Failed to load the account - buildAcceptXDR(): " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               reject(err);
            });
         } else {
            let account = new Account(subAccount.publicKey, subAccount.sequenceNo);
            let txn = this.acceptTxnBuilder(organization, account, signerSK, proofHash, receiver);
            resolve(txn);
         }
      });
   }

   buildRejectXDR(proofHash: any, subAccount: any, signerSK: string, receiver?: any) {
      return new Promise((resolve, reject) => {

         if (blockchainNetType === 'live') {
            Network.usePublicNetwork();
         } else {
            Network.useTestNetwork();
         }
         let server = new Server(blockchainNet);

         if (subAccount.sequenceNo == "") {
            server.loadAccount(subAccount.publicKey).then((account) => {
               this.logger.info("Successfully loaded the account - buildRejectXDR()", this.properties.skipConsoleLogs, this.properties.writeToFile);
               let txn = this.rejectTxnBuilder(account, signerSK, proofHash, receiver);
               resolve(txn);
            }).catch((err) => {
               this.logger.error("Failed to load the account - buildRejectXDR(): " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               reject(err);
            });
         } else {
            let account = new Account(subAccount.publicKey, subAccount.sequenceNo);
            let txn = this.rejectTxnBuilder(account, signerSK, proofHash, receiver);
            resolve(txn);
         }
      });
   }

   acceptTxnBuilder(payload: any, transactionAccount: Account, signerSK: string, proofHash: any, receiver?: string) {
      const sourceKeypair = Keypair.fromSecret(signerSK);

      let minTime = Math.round(new Date().getTime() / 1000.0);
      let maxTime = Math.round(new Date(+new Date + 12096e5).getTime() / 1000.0);
      let opts = { 
         timebounds: { 
            minTime: minTime, 
            maxTime: maxTime 
         } 
      };

      let transaction = new TransactionBuilder(transactionAccount, opts);
      // transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', source: sourceKeypair.publicKey() }));
      if (receiver && receiver !== "") {
         transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }));
      } else {
         transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }));
      }
      
      Object.keys(payload).forEach((key: any) => {
         try {
            transaction.addOperation(Operation.manageData({ name: key, value: payload[key], source: sourceKeypair.publicKey() }))
         } catch (error) {
            this.logger.error("Failed to Add Operation - acceptTxnBuilder(): " + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
         }
      })

      const txn = transaction.build();
      txn.sign(sourceKeypair);

      let XDR = txn.toEnvelope();
      let seqNum = txn.sequence;
      let b64 = XDR.toXDR('base64');
      
      return {
         seqNum: seqNum,
         b64: b64
      };
   }

   rejectTxnBuilder(account: any, signerSK: string, proofHash: string, receiver?: string) {
      const sourceKeypair = Keypair.fromSecret(signerSK);

      let minTime = Math.round(new Date().getTime() / 1000.0);
      let maxTime = Math.round(new Date(+new Date + 12096e5).getTime() / 1000.0); // Adding two weeks as expiration
      let opts = { 
         timebounds: { 
            minTime: minTime, 
            maxTime: maxTime 
         } 
      };

      let transaction = new TransactionBuilder(account, opts);
      try {
         transaction.addOperation(Operation.manageData({ name: 'Status', value: 'rejected' }))
         if (receiver !== "") {
            transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }));
         } else {
            transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }));
         }
      } catch (error) {
         this.logger.error("Failed to Add Operation - rejectTxnBuilder(): " + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
      }

      const txn = transaction.build();
      txn.sign(sourceKeypair);

      const XDR = txn.toEnvelope();
      const seqNum = txn.sequence;
      const b64 = XDR.toXDR('base64');

      return {
         seqNum: seqNum,
         b64: b64
      };
   }

}
