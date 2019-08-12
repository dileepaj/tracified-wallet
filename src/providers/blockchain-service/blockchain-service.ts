import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network, Operation, Keypair, TransactionBuilder, Server, Account } from 'stellar-sdk';

import { Properties } from '../../shared/properties';
import { stellarNet } from '../../shared/config';
import { Logger } from 'ionic-logger-new';

@Injectable()
export class BlockchainServiceProvider {

  constructor(
    public http: HttpClient,
    private logger: Logger,
    private properties: Properties
  ) { }

  removeFoAccount(accounts) {
    let otherAccounts = [];
    accounts.forEach(account => {
      if (!account.FO) {
        otherAccounts.push(account);
      }
    });

    if (otherAccounts.length > 0) {
      return otherAccounts;
    } else {
      return false;
    }
  }

  checkAccountsForFunds(accounts): Promise<any> {
    return new Promise((resolve, reject) => {
      let status = false;
      accounts.forEach((account) => {
        this.checkAccountFunds(account.publicKey).then(() => {
          status = true;
        });
      });
      resolve(status);
    });
  }

  checkAccountFunds(publicKey): Promise<any> {
    return new Promise((resolve, reject) => {
      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(publicKey).then((account) => {
        resolve(true);
      }).catch((err) => {
        this.logger.error("Could not load the stellar account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  checkInvalidation(accounts) {
    let status = false;
    accounts.forEach((mainAccount) => {
      mainAccount.subAccounts.forEach((subAccount) => {
        if (!subAccount.keyInvalidated) {
          let sub = {
            publicKey: subAccount.pk,
            privateKey: subAccount.sk
          };
          let main = {
            publicKey: mainAccount.pk,
            privateKey: mainAccount.sk
          };
          this.invalidateSubAccountKey(sub, main).then(() => {
            subAccount.keyInvalidated = true;
            status = true;
          });
        }
      });
    });
    // Check if this gets returned after processing all the accounts.
    return status;
  }

  invalidateSubAccountKey(subAccount, mainAccount) {
    return new Promise((resolve, reject) => {
      var server = new Server(stellarNet);
      server.loadAccount(subAccount.publicKey).then((account) => {
        var transaction = new TransactionBuilder(account).addOperation(Operation.setOptions({
          signer: {
            ed25519PublicKey: mainAccount,
            weight: 2
          }
        })).addOperation(Operation.setOptions({
          masterWeight: 0,
          lowThreshold: 2,
          medThreshold: 2,
          highThreshold: 2
        })).build();

        transaction.sign(subAccount);

        return server.submitTransaction(transaction);
      }).then((transactionResult) => {
        resolve()
      }).catch((err) => {
        this.logger.error("Invalidating sub account failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject()
      });
    });
  }
}
