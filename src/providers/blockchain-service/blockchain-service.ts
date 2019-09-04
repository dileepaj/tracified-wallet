import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network, Operation, Keypair, TransactionBuilder, Server, Account, Asset } from 'stellar-sdk';

import { Properties } from '../../shared/properties';
import { stellarNet } from '../../shared/config';
import { Logger } from 'ionic-logger-new';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { ApiServiceProvider } from '../../providers/api-service/api-service';

@Injectable()
export class BlockchainServiceProvider {

  constructor(
    public http: HttpClient,
    private logger: Logger,
    private properties: Properties,
    private mappingService: MappingServiceProvider,
    private apiService: ApiServiceProvider
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


  invalidateSubAccountKey(subAccount, mainAccount) {
    return new Promise((resolve, reject) => {
      var server = new Server(stellarNet);
      server.loadAccount(subAccount.publicKey()).then((account) => {
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
        resolve();
      }).catch((err) => {
        console.log(err);
        this.logger.error("Invalidating sub account failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject();
      });
    });
  }

  validateFundTransfer(sendingAcc, amount) {

  }

  transferFundsForNewAccounts(sendingAccSk, receivingAccPk, amount): Promise<any> {
    return new Promise((resolve, reject) => {
      var sendingAccPair = Keypair.fromSecret(sendingAccSk);
      var sendingAccPk = sendingAccPair.publicKey();

      Network.usePublicNetwork();
      var server = new Server(stellarNet);

      return server.loadAccount(sendingAccPk).then((account) => {
        var transaction = new TransactionBuilder(account)
          .addOperation(Operation.createAccount({ destination: receivingAccPk, startingBalance: amount.toString() }))
          .build();
        transaction.sign(sendingAccPair);

        return server.submitTransaction(transaction).then((status) => {
          console.log(status);
          resolve(status);
        }).catch((err) => {
          console.log(err);
          reject(err);
        });
      }).catch((e) => {
        console.error(e);
        reject(e);
      });
    });
  }

  transferFunds(sendingAccSk, receivingAccPk, amount) {
    return new Promise((resolve, reject) => {
      var sendingAccPair = Keypair.fromSecret(sendingAccSk);
      var sendingAccPk = sendingAccPair.publicKey();

      Network.usePublicNetwork();
      var server = new Server(stellarNet);

      return server.loadAccount(sendingAccPk).then((account) => {
        var transaction = new TransactionBuilder(account)
          .addOperation(Operation.payment({ destination: receivingAccPk, asset: Asset.native(), amount: amount.toString() }))
          .build();
        transaction.sign(sendingAccPair);

        return server.submitTransaction(transaction).then((status) => {
          console.log(status);
          resolve(status);
        }).catch((err) => {
          console.log(err);
          reject(err);
        });
      }).catch((e) => {
        console.error(e);
        reject(e);
      });
    });
  }

  validateFundsForSubAccount(mainAccPk): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  checkInvalidation(subAccountPk, account): boolean {

    for (let i = 0; i < account.subAccounts.length; i++) {
      if (subAccountPk == account.subAccounts[i].pk) {
        return account.subAccounts[i].skInvalidated;
      }
    }
  }

  getSubAccountPair(subAccountPk, account) {
    let pair;
    for (let i = 0; i < account.subAccounts.length; i++) {
      if (subAccountPk == account.subAccounts[i].pk) {
        return Keypair.fromSecret(account.subAccounts[i].skp);
      }
    }
  }

  accountBalance(publicKey) {
    return new Promise((resolve, reject) => {
      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(publicKey).then((account) => {
        let balances = account.balances;
        for (let i = 0; i < balances.length; i++) {
          if (balances[i].asset_type == "native") {
            resolve(balances[i].balance);
          }
        }
        resolve(0);
      }).catch((err) => {
        console.error(err);
        reject(err);
      });
    });
  }

  accountAssetsCount(publicKey) {
    return new Promise((resolve, reject) => {
      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(publicKey).then((account) => {
        console.log(account);
      }).catch((err) => {
        console.error(err);
        reject(err);
      });
    });
  }

  subAccountInvalidation(): Promise<any> {
    return new Promise((resolve, reject) => {

    });
  }

  checkIfAccountInvalidated(publicKey): Promise<any> {
    return new Promise((resolve, reject) => {
      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(publicKey).then((account) => {
        let signers = account.signers;
        if (signers.length == 2) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch((e) => {
        console.error(e);
        reject(false);
      });
    });
  }

  validateTransactionPassword(password, encSecret, pubKey): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mappingService.decryptSecret(encSecret, password).then((decKey: string) => {
        let keyPair = Keypair.fromSecret(decKey);
        if (keyPair.publicKey() == pubKey) {
          resolve(decKey);
        } else {
          // Log invalid password
          reject();
        }
      }).catch(() => {
        // Log invalid password
        reject();
      });
    });

  }

  changeTransactionPassword(transactionModel): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.validateTransactionPassword(transactionModel.oldPassword, transactionModel.encSecretKey, transactionModel.publicKey).then((decKey) => {
        this.mappingService.encyrptSecret(decKey, transactionModel.newPassword).then((newSk) => {
          let params = {
            accName: transactionModel.accountName,
            sk: newSk
          }
          return this.apiService.changeTranasctionPassword(params).then((res) => {
            resolve(res);
          }).catch((err) => {
            reject(err)
          });
        }).catch(() => {
          reject({status: 11, error: 'Cannot use this password. Please pick a different password.'});
        });
      }).catch(() => {
        reject({status: 10, error: 'Invalid Password'});
      });
    });
  }
}
