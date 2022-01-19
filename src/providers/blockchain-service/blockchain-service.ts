import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network, Operation, Keypair, TransactionBuilder, Server, Account, Asset, AccountResponse, Transaction } from 'stellar-sdk';

import { Properties } from '../../shared/properties';
import { blockchainNet } from '../../shared/config';
import { blockchainNetType } from '../../shared/config';
import { Logger } from 'ionic-logger-new';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';

@Injectable()
export class BlockchainServiceProvider {

  constructor(
    public http: HttpClient,
    private logger: Logger,
    private properties: Properties,
    private mappingService: MappingServiceProvider,
    private apiService: ApiServiceProvider,
    private storageService: StorageServiceProvider
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
      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);
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
        this.logger.info("Invalidation successful: " + JSON.stringify(transactionResult), this.properties.skipConsoleLogs, this.properties.writeToFile);
        resolve(transactionResult);
      }).catch((err) => {
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

      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);

      return server.loadAccount(sendingAccPk).then((account) => {
        var transaction = new TransactionBuilder(account)
          .addOperation(Operation.createAccount({ destination: receivingAccPk, startingBalance: amount.toString() }))
          .build();
        transaction.sign(sendingAccPair);

        return server.submitTransaction(transaction).then((status) => {
          this.logger.info("Funds transferred successfully for the new account: " + amount + " coins. " + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve(status);
        }).catch((err) => {
          this.logger.error("Fund transfer transaction submission failed: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(err);
        });
      }).catch((e) => {
        this.logger.error("Failed to transfer funds for the new account: " + JSON.stringify(e), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(e);
      });
    });
  }

  transferFunds(sendingAccSk, receivingAccPk, amount) {
    return new Promise((resolve, reject) => {
      var sendingAccPair = Keypair.fromSecret(sendingAccSk);
      var sendingAccPk = sendingAccPair.publicKey();

      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);

      return server.loadAccount(sendingAccPk).then((account) => {
        var transaction = new TransactionBuilder(account)
          .addOperation(Operation.payment({ destination: receivingAccPk, asset: Asset.native(), amount: amount.toString() }))
          .build();
        transaction.sign(sendingAccPair);

        return server.submitTransaction(transaction).then((status) => {
          this.logger.info("Successfully transferred funds: " + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve(status);
        }).catch((err) => {
          this.logger.error("Transfer fund transaction submission failed: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(err);
        });
      }).catch((e) => {
        this.logger.error("Failed to transfer funds for the account: " + JSON.stringify(e), this.properties.skipConsoleLogs, this.properties.writeToFile);
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
        this.logger.error("Failed to check the account balance: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
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
        this.logger.error("Failed to get accounts asset count: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  accountBalanceBoth(publicKey) {
    return new Promise((resolve, reject) => {
      let assetCount = 0;
      let nativeBalance = "0";
      this.blockchainAccountInfo(publicKey).then((account: AccountResponse) => {
        let balances = account.balances;
        for (let i = 0; i < balances.length; i++) {
          if (balances[i].asset_type == "native") {
            nativeBalance = balances[i].balance;
          } else if (balances[i].asset_type == "credit_alphanum12") {
            assetCount++;
          }
        }
        resolve({ balance: nativeBalance, assetCount: assetCount });
      }).catch((err) => {
        this.logger.error("Failed to get accounts asset count: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  blockchainAccountInfo(publicKey) {
    return new Promise((resolve, reject) => {
      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);
      server.loadAccount(publicKey).then((account) => {
        resolve(account);
      }).catch((err) => {
        this.logger.error("Failed to get account info: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  checkIfAccountInvalidated(publicKey): Promise<any> {
    return new Promise((resolve, reject) => {
      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);
      server.loadAccount(publicKey).then((account) => {
        let signers = account.signers;
        if (signers.length == 2) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch((e) => {
        this.logger.error("Failed to check account invalidation status: " + JSON.stringify(e), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(false);
      });
    });
  }

  validateTransactionPassword(password: any, encSecret: any, pubKey: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mappingService.decryptSecret(encSecret, password).then((decKey: string) => {
        let keyPair = Keypair.fromSecret(decKey);
        if (keyPair.publicKey() == pubKey) {
          resolve(decKey);
        } else {
          this.logger.error("Invalid transaction password. Keys dont match", this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject();
        }
      }).catch(() => {
        this.logger.error("Invalid transaction password", this.properties.skipConsoleLogs, this.properties.writeToFile);
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
            this.logger.error("Failed to change the transaction password: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
            reject(err)
          });
        }).catch(() => {
          this.logger.error("Failed to encrypt new password", this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject({ status: 11, error: 'Cannot use this password. Please pick a different password.' });
        });
      }).catch(() => {
        this.logger.error("Old transaction password is incorrect.", this.properties.skipConsoleLogs, this.properties.writeToFile);
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
        this.logger.error("Error getting account info: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject(err);
      });
    });
  }

  mainAccountSuffucientFunds(balance, assetCount): any {
    let baseFee = (assetCount * 0.5) + 4 + 3 + 2;
    if (baseFee < (balance - 0.5)) {
      return true;
    } else {
      return false;
    }
  }

  createAddress() {
    return Keypair.random();
  }

  createSubAccount(mainAccount, mainSk) {
    return new Promise((resolve, reject) => {
      this.getAccountBalanceAssets(mainAccount).then((accountInfo: any) => {
        if (accountInfo.balance > 0) {
          let fundStatus = this.mainAccountSuffucientFunds(accountInfo.balance, accountInfo.assets);
          if (fundStatus) {
            let keyPair = this.createAddress();
            const account = {
              "account": {
                "subAccount": {
                  "pk": keyPair.publicKey(),
                  "sk": keyPair.secret(),
                  "skp": keyPair.secret(),
                  "skInvalidated": false
                },
                "pk": this.properties.defaultAccount.pk
              }
            }
            this.apiService.addTransactionSubAccount(account).then((res) => {
              if (res.status == 200) {
                this.properties.defaultAccount.subAccounts.push({ "pk": keyPair.publicKey(), "sk": keyPair.secret(), "skp": keyPair.secret(), "skInvalidated": false });
                this.storageService.setDefaultAccount(this.properties.defaultAccount);
                this.transferFundsForNewAccounts(mainSk, keyPair.publicKey(), 10).then(() => {
                  this.invalidateSubAccountKey(keyPair, mainAccount).then(() => {
                    this.logger.info("Successfully invalidated the account", this.properties.skipConsoleLogs, this.properties.writeToFile);
                    resolve(keyPair);
                  }).catch((err) => {
                    this.logger.error("Failed to invalidate the account: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
                    reject();
                  });
                }).catch((err) => {
                  this.logger.error("Failed to transfer funds for the sub account to complete Transaction: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject();
                });
              } else {
                this.logger.error("Failed to transfer funds for the new account: " + JSON.stringify(res), this.properties.skipConsoleLogs, this.properties.writeToFile);
                reject();
              }
            }).catch((err) => {
              this.logger.error("Failed to add the sub account: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
              reject();
            });
          } else {
            this.logger.error("Main account does not have sufficient funds.", this.properties.skipConsoleLogs, this.properties.writeToFile);
            reject();
          }
        } else {
          this.logger.error("Main account balance is 0 lumens", this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject();
        }
      }).catch((err) => {
        this.logger.error("Failed to get the account balance: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject();
      });
    });
  }

  verifyCoC(secretKey, identifier, receiverPk, item, qty, validityPeriod) {
    return new Promise((resolve, reject) => {
      let sourceKeypair = Keypair.fromSecret(secretKey);
      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);
      server.loadAccount(sourceKeypair.publicKey()).then((account) => {
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
        this.logger.info("Verified CoC successfully", this.properties.skipConsoleLogs, this.properties.writeToFile);
        resolve(transactionResult.hash);
      }).catch((err) => {
        this.logger.error("Failed to verify CoC: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject();
      });
    });
  }

  acceptTransactionXdr(identifier, receiver, qty, item, validity, proofHash, subAccount, issuer, signerSK) {
    return new Promise((resolve, reject) => {
      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);

      if (subAccount.sequenceNo == "") {
        console.log("No Sequence found.");
        server.loadAccount(subAccount.publicKey).then((account) => {
          let txn = this.acceptTxnBuilder(account, validity, signerSK, item, issuer, identifier, proofHash, receiver, qty, subAccount);
          resolve(txn);
        }).catch((err) => {
          this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(err);
        });
      } else {
        let account = new Account(subAccount.publicKey, subAccount.sequenceNo);
        let txn = this.acceptTxnBuilder(account, validity, signerSK, item, issuer, identifier, proofHash, receiver, qty, subAccount);
        resolve(txn);
      }
    });
  }

  acceptTxnBuilder(account, validity, signerSK, item, issuer, identifier, proofHash, receiver, qty, subAccount) {

    let XDR;
    let b64;
    let seqNum;

    const senderPublickKey = this.properties.defaultAccount.pk;

    var minTime = Math.round(new Date().getTime() / 1000.0);

    var maxTime = new Date(validity).getTime() / 1000.0;
    var sourceKeypair = Keypair.fromSecret(signerSK);

    var asset = new Asset(item, issuer);
    var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

    var transaction = new TransactionBuilder(account, opts);
    transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', source: sourceKeypair.publicKey() }));
    transaction.addOperation(Operation.manageData({ name: 'Identifier', value: identifier, source: sourceKeypair.publicKey() }));
    transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }));
    transaction.addOperation(Operation.payment({
      destination: receiver,
      asset: asset,
      amount: qty,
      source: senderPublickKey
    }));

    // if (!subAccount.available) {
    //   console.log("Bumping Sequence in Accept: ", subAccount.sequenceNo);
    //   transaction.addOperation(Operation.bumpSequence({ bumpTo: subAccount.sequenceNo, source: subAccount.publicKey }));
    // }

    const tx = transaction.build();
    tx.sign(sourceKeypair);
    XDR = tx.toEnvelope();
    seqNum = tx.sequence;
    b64 = XDR.toXDR('base64');
    const resolveObj = {
      seqNum: seqNum,
      b64: b64
    }

    return resolveObj;
  }

  rejectTransactionXdr(receiver, validity, proofHash, subAccount, signerSK) {

    return new Promise((resolve, reject) => {

      if (blockchainNetType === 'live') {
        Network.usePublicNetwork();
      } else {
        Network.useTestNetwork();
      }
      let server = new Server(blockchainNet);

      if (subAccount.sequenceNo == "") {
        console.log("No Sequence found.");
        server.loadAccount(subAccount.publicKey).then((account) => {
          let txn = this.rejectTxnBuilder(account, validity, signerSK, proofHash, receiver, subAccount);
          resolve(txn);
        }).catch((err) => {
          this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(err);
        });
      } else {
        let account = new Account(subAccount.publicKey, subAccount.sequenceNo);
        let txn = this.rejectTxnBuilder(account, validity, signerSK, proofHash, receiver, subAccount);
        resolve(txn);
      }
    });
  }

  rejectTxnBuilder(account, validity, signerSK, proofHash, receiver, subAccount) {

    let XDR;
    let b64;

    var minTime = Math.round(new Date().getTime() / 1000.0);
    var maxTime = new Date(validity).getTime() / 1000.0;
    var sourceKeypair = Keypair.fromSecret(signerSK);
    var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

    var transaction = new TransactionBuilder(account, opts).addOperation(Operation.manageData({
      name: 'Status', value: 'rejected', source: receiver
    })).addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }))

    // if (!subAccount.available) {
    //   console.log("Bumping Sequence in Reject");
    //   transaction.addOperation(Operation.bumpSequence({ bumpTo: subAccount.sequenceNo, source: subAccount.publicKey }))
    // }

    const tx = transaction.build();
    tx.sign(sourceKeypair);
    XDR = tx.toEnvelope();
    b64 = XDR.toXDR('base64');

    return b64;
  }

  signXdr(xdr: any, decKey: string) {
    console.log("XDR: ", xdr);
    let keyPair = Keypair.fromSecret(decKey);
    if (blockchainNetType === 'live') {
      Network.usePublicNetwork();
    } else {
      Network.useTestNetwork();
    }
    const transaction = new Transaction(xdr);
    transaction.sign(keyPair);
    let signedTrans = transaction.toEnvelope().toXDR().toString("base64");

    return signedTrans;
  }

  getAssetIssuer(accountPubKey, asset_code): Promise<any> {
    return new Promise((resolve, reject) => {
      this.blockchainAccountInfo(accountPubKey).then((account: AccountResponse) => {
        let balances: any = account.balances;
        if (balances.length > 0) {
          for (let i = 0; i < balances.length; i++) {
            if (balances[i].asset_type == "credit_alphanum12" && balances[i].asset_code == asset_code) {
              resolve(balances[i].asset_issuer);
            } else if (balances[i].asset_type == "credit_alphanum4" && balances[i].asset_code == asset_code) {
              resolve(balances[i].asset_issuer);
            }
          }
          reject();
        } else {
          reject();
        }
      }).catch((err) => {
        this.logger.error("Failed to get asset issuer: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject();
      });
    });
  }

  checkAccountValidity(publicKey): Promise<any> {
    return new Promise((resolve, reject) => {
      this.blockchainAccountInfo(publicKey).then((res) => {
        resolve(true);
      }).catch((err) => {
        if (err.response.status == 404 && err.response.title == "Resource Missing") {
          this.logger.error("Invalid Public Key: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve(false);
        } else {
          this.logger.error("Failed to check account validity: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject(err);
        }
      });
    });
  }

  subAccountsStatus(subAccounts: any) {
    return this.apiService.getSubAccountStatus(subAccounts);
  }

  preparesubAccount(mainAccSk: string, receiverPk?: string, operationType?: string) {
    return new Promise((resolve, reject) => {
      let subPublicKeys = [];
      this.properties.defaultAccount.subAccounts.forEach((account: any) => {
        subPublicKeys.push(account.pk);
      });
      const subAccounts = {
        "User": this.properties.defaultAccount.accountName,
        "SubAccounts": subPublicKeys
      };
      this.subAccountsStatus(subAccounts).then((res) => {
        let avaialbeAccounts = [];
        let matchingAccount: any;
        let statuses = res.body;
        if (statuses) {
          statuses.forEach((status: any) => {
            if (status.available) {
              avaialbeAccounts.push(status);
            } else if (status.receiver == receiverPk) {
              matchingAccount = status;
            }
          });
          if (matchingAccount) {
            reject("pendingTransacExist"); // if source account is in use by same receiver raise error
          } else if (avaialbeAccounts.length > 0) {
            this.checkIfAccountInvalidated(avaialbeAccounts[0].subAccount).then((status) => {
              if (status) {
                if(avaialbeAccounts[0].expiration){
                  this.blockchainAccountInfo(avaialbeAccounts[0].subAccount).then((accountInfo: AccountResponse) => {
                    let subAcc = {
                      publicKey: avaialbeAccounts[0].subAccount,
                      available: true,
                      sequenceNo: accountInfo.sequence
                    };
                    this.logger.info("Found Invalidated Sub Account: " + this.properties.skipConsoleLogs, this.properties.writeToFile);
                    resolve(subAcc);
                  }).catch((err) => {
                    reject(err);
                  });
                }else{
                  let subAcc = {
                    publicKey: avaialbeAccounts[0].subAccount,
                    available: true,
                    sequenceNo: avaialbeAccounts[0].sequenceNo
                  };
                  this.logger.info("Found Invalidated Sub Account: " + this.properties.skipConsoleLogs, this.properties.writeToFile);
                  resolve(subAcc);
                }
              } else {
                this.logger.info("Invalidate Sub Account: " + this.properties.skipConsoleLogs, this.properties.writeToFile);
                let subPair = this.getSubAccountPair(avaialbeAccounts[0].subAccount, this.properties.defaultAccount);
                this.invalidateSubAccountKey(subPair, this.properties.defaultAccount).then(() => {
                  let subAcc = {
                    publicKey: avaialbeAccounts[0].subAccount,
                    available: true,
                    sequenceNo: avaialbeAccounts[0].sequenceNo
                  };
                  resolve(subAcc);
                }).catch((err) => {
                  this.logger.info("Sub Account Invalidation failed!: " + this.properties.skipConsoleLogs, this.properties.writeToFile);
                  reject(err);
                });
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            this.logger.info("Creating New Sub Account: " + this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.createSubAccount(this.properties.defaultAccount, mainAccSk).then((subKeyPair: Keypair) => {
              this.blockchainAccountInfo(subKeyPair.publicKey()).then((accountInfo: AccountResponse) => {
                let subAcc = {
                  publicKey: subKeyPair.publicKey(),
                  available: false,
                  sequenceNo: accountInfo.sequence
                };
                resolve(subAcc);
              }).catch((err) => {
                reject(err);
              });
            }).catch((err) => {
              reject(err);
            });
          }
        } else {
          this.logger.info("Creating New Sub Account: " + this.properties.skipConsoleLogs, this.properties.writeToFile);
          this.createSubAccount(this.properties.defaultAccount, mainAccSk).then((subKeyPair: Keypair) => {
            this.blockchainAccountInfo(subKeyPair.publicKey()).then((accountInfo: AccountResponse) => {
              let subAcc = {
                publicKey: subKeyPair.publicKey(),
                available: false,
                sequenceNo: accountInfo.sequence
              };
              resolve(subAcc);
            }).catch((err) => {
              reject(err);
            });
          }).catch((err) => {
            reject(err);
          });
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }
}


