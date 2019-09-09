import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network, Operation, Keypair, TransactionBuilder, Server, Account, Asset, AccountResponse } from 'stellar-sdk';

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
            ed25519PublicKey: mainAccount.pk,
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

  getSubAccountPair(subAccountPk, account) {
    for (let i = 0; i < account.subAccounts.length; i++) {
      if (subAccountPk == account.subAccounts[i].pk) {
        return Keypair.fromSecret(account.subAccounts[i].skp);
      }
    }
  }

  accountBalance(publicKey) {
    return new Promise((resolve, reject) => {
      this.blockchainAccountInfo(publicKey).then((account: AccountResponse) => {
        let balances = account.balances;
        for (let i = 0; i < balances.length; i++) {
          if (balances[i].asset_type == "native") {
            resolve(balances[i].balance);
          }
        }
        resolve(0);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  accountAssetsCount(publicKey) {
    return new Promise((resolve, reject) => {
      let assetCount = 0;
      this.blockchainAccountInfo(publicKey).then((account: AccountResponse) => {
        let balances = account.balances;
        for (let i = 0; i < balances.length; i++) {
          if (balances[i].asset_type == "credit_alphanum12") {
            assetCount++;
          }
        }
        resolve(assetCount);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  blockchainAccountInfo(publicKey) {
    return new Promise((resolve, reject) => {
      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(publicKey).then((account) => {
        resolve(account);
      }).catch((err) => {
        reject(err);
      });
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
          reject({ status: 11, error: 'Cannot use this password. Please pick a different password.' });
        });
      }).catch(() => {
        reject({ status: 10, error: 'Invalid Password' });
      });
    });
  }

  getAccountBalanceAssets(mainAccount) {
    return new Promise((resolve, reject) => {
      this.blockchainAccountInfo(mainAccount.pk).then((accountInfo: AccountResponse) => {
        let balances = accountInfo.balances;
        let balance = "0";
        let assetCount = 0;
        for (let i = 0; i < balances.length; i++) {
          if (balances[i].asset_type == "native") {
            balance = balances[i].balance;
          } else if (balances[i].asset_type == "credit_alphanum12") {
            assetCount++;
          }
        }
        resolve({ balance: balance, assets: assetCount });
      }).catch((err) => {
        this.logger.error("Error getting account info: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  mainAccountSuffucientFunds(balance, assetCount): any {
    let baseFee = (assetCount * 0.5) + 4;
    if (baseFee < (balance - 0.5)) {
      return { status: true, amount: baseFee };
    } else {
      return { status: false, amount: baseFee };
    }
  }

  createAddress() {
    return Keypair.random();
  }

  createSubAccount(mainAccount, mainSk) {
    return new Promise((resolve, reject) => {
      this.getAccountBalanceAssets(mainAccount).then((accountInfo: any) => {
        if (accountInfo.balance != 0) {
          let fundStatus = this.mainAccountSuffucientFunds(accountInfo.balance, accountInfo.assets);
          if (fundStatus.status) {
            let keyPair = this.createAddress();
            const account = {
              "account": {
                "subKey": keyPair.publicKey(),
                "pk": this.properties.defaultAccount.pk,
                "sk": keyPair.secret(),
                "skp": keyPair.secret(),
                "skInvalidated": false
              }
            };
            this.apiService.addSubAccount(account).then((res) => {
              if (res.status == 200) {
                this.properties.defaultAccount.subAccounts.push({ "pk": keyPair.publicKey(), "sk": keyPair.secret(), "skp": keyPair.secret(), "skInvalidated": false });
                this.transferFundsForNewAccounts(mainSk, keyPair.publicKey(), fundStatus.amount).then(() => {
                  this.invalidateSubAccountKey(keyPair, mainAccount).then(() => {
                    resolve(keyPair);
                  }).catch((err) => {
                    console.log("Invalidate sub account: ", err);
                    reject();
                  });
                }).catch((err) => {
                  console.log("Transfer funds for new account: ", err);
                  reject();
                });
              } else {
                console.log("Error add sub account: ", res.status);
                reject();
              }
            }).catch((err) => {
              console.log("Add sub account: ", err);
              reject();
            });
          } else {
            console.log("Fund status: 0");
            reject();
          }
        } else {
          console.log("Main account balance: Insufficient");
          reject();
        }
      }).catch((err) => {
        console.log("Account balance and assets: ", err);
        reject();
      });
    });
  }

  verifyCoC(secretKey, identifier, receiverPk, item, qty, validityPeriod) {
    return new Promise((resolve, reject) => {
      var sourceKeypair = Keypair.fromSecret(secretKey);
      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(sourceKeypair.publicKey()).then(function (account) {
        var transaction = new TransactionBuilder(account)
          .addOperation(Operation.manageData({ name: 'Transaction Type', value: '11', }))
          .addOperation(Operation.manageData({ name: 'Identifier', value: identifier }))
          .addOperation(Operation.manageData({ name: 'Receiver', value: receiverPk }))
          .addOperation(Operation.manageData({ name: 'Asset', value: item }))
          .addOperation(Operation.manageData({ name: 'Amount', value: qty }))
          .addOperation(Operation.manageData({ name: 'MaxBound', value: JSON.stringify(validityPeriod), }))
          .build();
        transaction.sign(sourceKeypair);
        return server.submitTransaction(transaction);
      }).then((transactionResult) => {
        resolve(transactionResult.hash);
      }).catch((err) => {
        console.log(err);
        reject();
      });
    });
  }

  acceptTransactionXdr(identifier, receiver, qty, item, validity, proofHash, subAccount, signerSK) {
    return new Promise((resolve, reject) => {
      let XDR;
      let b64;
      let seqNum;

      const senderPublickKey = this.properties.defaultAccount.pk;

      var minTime = Math.round(new Date().getTime() / 1000.0);
      
      var maxTime = new Date(validity).getTime() / 1000.0;
      var sourceKeypair = Keypair.fromSecret(signerSK);

      var asset = new Asset(item, 'GA34R3AQUTUGARS6AZCXKVW5GKUQQB3IFQVG4T47R6OOKN4T4O3KKHNP');
      var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(subAccount.publicKey).then(function (account) {
        var transaction = new TransactionBuilder(account, opts)
        transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
        transaction.addOperation(Operation.manageData({ name: 'Identifier', value: identifier, }))
        transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }))
        transaction.addOperation(Operation.payment({
          destination: receiver,
          asset: asset,
          amount: qty,
          source: senderPublickKey
        }))

        if (!subAccount.available) {
          transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccount.sequenceNo + 2) }))
        }

        const tx = transaction.build();
        tx.sign(sourceKeypair);
        XDR = tx.toEnvelope();
        seqNum = tx.sequence;
        b64 = XDR.toXDR('base64');
        const resolveObj = {
          seqNum: seqNum,
          b64: b64
        }
        resolve(resolveObj);

      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    })

  }

  rejectTransactionXdr(receiver, validity, proofHash, subAccount, signerSK) {

    return new Promise((resolve, reject) => {
      let XDR;
      let b64;
      const senderPublickKey = this.properties.defaultAccount.pk;

      var minTime = Math.round(new Date().getTime() / 1000.0);
      var maxTime = new Date(validity).getTime() / 1000.0;
      var sourceKeypair = Keypair.fromSecret(signerSK);
      var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

      Network.usePublicNetwork();
      var server = new Server(stellarNet);
      server.loadAccount(subAccount.publicKey).then(function (account) {
        var transaction = new TransactionBuilder(account, opts).addOperation(Operation.manageData({
          name: 'Status', value: 'rejected', source: receiver
        })).addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }))

        if (!subAccount.available) {
          transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccount.sequenceNo + 2) }))
        }

        const tx = transaction.build();
        tx.sign(sourceKeypair);
        XDR = tx.toEnvelope();
        b64 = XDR.toXDR('base64');

        resolve(b64);
      }).catch((err) => {        
        console.log(err);
        reject();
      });
    });
  }
}
