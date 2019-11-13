import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Keypair, AccountResponse } from 'stellar-sdk';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { TransferPage } from '../../pages/transfer/transfer';
import { Logger } from 'ionic-logger-new';

@IonicPage()

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  selectedItem2: any;
  itemRequired: any;
  item: any;
  user: any;
  currentItems: any;
  loading;
  isLoadingPresent: boolean;
  selectedReceiver: any;
  COCForm: { selectedItem: string, identifier: string, qty: string, receiver: string, vaidity: string } = {
    selectedItem: '',
    identifier: '',
    qty: '',
    receiver: '',
    vaidity: ''
  };

  private idAvailable: boolean;
  private idEmpty: boolean;
  private itemSearching: boolean;

  private selectedItem;

  private secretKey;

  mainAccount: any;
  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private apiService: ApiServiceProvider,
    private connectivity: ConnectivityServiceProvider,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private itemsProvider: Items,
    private alertCtrl: AlertController,
    private storage: StorageServiceProvider,
    private properties: Properties,
    private blockchainService: BlockchainServiceProvider,
    private mappingService: MappingServiceProvider,
    private dataService: DataServiceProvider,
    private logger: Logger
  ) {
    this.mainAccount = this.properties.defaultAccount;
    this.item = navParams.get('item');
    this.currentItems = navParams.get('currentItems') || this.currentItems.defaultItem;
  }

  ionViewDidLoad() {
    this.COCForm.selectedItem = this.item.asset_code;
    this.selectedItem = this.item.asset_code;
  }

  transferAsset() {
    let status = this.checkIfFormEmpty();
    if (!status) {
      this.presentAlert("Error", "Make sure to fill out all the fields before submitting the form.");
      return;
    }

    if (Number(this.COCForm.qty) < 1) {
      this.presentAlert("Error", "Invalid asset quantity. Please try with a valid amount.");
      return;
    } else if (this.item.balance < this.COCForm.qty) {
      this.presentAlert("Error", "Not enough assests to transfer. Please try with a valid amount.");
      return;
    }

    if (this.itemSearching) {
      this.presentAlert("Error", "Identifier data is not available. Please try again after the blue notification bar dissappears from top.");
      return;
    } 
    // else if (!this.idAvailable) {
    //   this.presentAlert("Error", "Identifier provided does not belong to any item. Please enter a valid identifier.");
    //   return;
    // }

    this.passwordPrompt().then((password) => {
      this.presentLoading();
      this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk).then((decKey) => {
        this.secretKey = decKey;
        this.preparesubAccount(this.secretKey).then((subAcc: any) => {
          console.log("Returned Sub Account: ", subAcc);
          let subPair = this.blockchainService.getSubAccountPair(subAcc.publicKey, this.properties.defaultAccount);
          this.blockchainService.verifyCoC(this.secretKey, this.COCForm.identifier, this.COCForm.receiver, this.COCForm.selectedItem, this.COCForm.qty, this.COCForm.vaidity).then((transactionHash) => {
            this.blockchainService.getAssetIssuer(this.properties.defaultAccount.pk, this.COCForm.selectedItem).then((issuer) => {
              Promise.all([this.blockchainService.acceptTransactionXdr(this.COCForm.identifier, this.COCForm.receiver, this.COCForm.qty, this.COCForm.selectedItem, this.COCForm.vaidity, transactionHash, subAcc, issuer, this.secretKey),
              this.blockchainService.rejectTransactionXdr(this.COCForm.receiver, this.COCForm.vaidity, transactionHash, subAcc, this.secretKey)]).then((xdrs: any) => {
                console.log("Accept XDR sequence: ", xdrs[0].seqNum);
                console.log("Reject XDR sequence: ", xdrs[1].seqNum);
                const coc = {
                  "Sender": this.properties.defaultAccount.pk,
                  "Receiver": this.COCForm.receiver,
                  "SubAccount": subPair.publicKey(),
                  "SequenceNo": JSON.stringify(Number(xdrs[0].seqNum) + 2),
                  "AcceptXdr": xdrs[0].b64,
                  "RejectXdr": xdrs[1],
                  "Identifier": this.COCForm.identifier,
                  "Status": "pending"
                }
                this.dataService.sendCoC(coc).then((res) => {
                  this.dissmissLoading();
                  this.presentAlert("Success", "Assets successfully transferred. You can view the transaction status in Sent page.");
                  this.navCtrl.setRoot(TransferPage);
                  this.logger.info("Item transferred successfully: " + this.item.asset_code, this.properties.skipConsoleLogs, this.properties.writeToFile);
                }).catch((err) => {
                  this.dissmissLoading();
                  this.presentAlert("Error", "Failed to send the transaction. Please try again.");
                  this.logger.error("Sending CoC to gateway failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                });
              }).catch((err) => {
                this.dissmissLoading();
                this.presentAlert("Error", "Failed to build the transaction. Please try again.");
                this.logger.error("Accept and Reject xdr build failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
              });
            }).catch((err) => {
              this.dissmissLoading();
              this.presentAlert("Error", "Failed to verify the asset issuer. Please try again.");
              this.logger.error("Failed to get the asset issuer: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
          }).catch((err) => {
            this.dissmissLoading();
            this.presentAlert("Error", "Failed to verify transaction. Please try again.");
            this.logger.error("Verify CoC failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        }).catch((err) => {
          this.dissmissLoading();
          this.presentAlert("Error", "Failed to prepare the transaction. Please try again.");
          this.logger.error("Preparing sub account failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      }).catch((err) => {
        this.dissmissLoading();
        this.presentAlert("Error", "Invalid transaction password. Please try again.");
        this.logger.error("Password validation failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    });
  }

  passwordPrompt(): Promise<any> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Transaction Password',
        inputs: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Password...'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Submit',
            handler: data => {

              if (data.password) {
                resolve(data.password);
              } else {
                console.log("Empty Password");
              }

            }
          },
        ]
      });
      alert.present();
    });
  }

  checkIfFormEmpty(): boolean {
    if (this.COCForm.identifier != '' && this.COCForm.qty != '' && this.COCForm.receiver != '' && this.COCForm.selectedItem != '' && this.COCForm.vaidity != '') {
      return true;
    } else {
      return false;
    }
  }

  preparesubAccount(mainAccSk) {
    return new Promise((resolve, reject) => {
      let subPublicKeys = [];
      this.properties.defaultAccount.subAccounts.forEach((account) => {
        subPublicKeys.push(account.pk);
      });
      const subAccounts = {
        "User": this.properties.defaultAccount.accountName,
        "SubAccounts": subPublicKeys
      };
      this.dataService.subAccountsStatus(subAccounts).then((res) => {
        console.log("All Sub Accounts: ", res);
        let avaialbeAccounts = [];
        let matchingAccount;
        let statuses = res.body;
        if (statuses) {
          statuses.forEach((status) => {
            if (status.available) {
              avaialbeAccounts.push(status);
            } else if (status.receiver == this.COCForm.receiver) {
              matchingAccount = status;
            }
          });
          if (matchingAccount) {
            let subAcc = {
              publicKey: matchingAccount.subAccount,
              available: false,
              sequenceNo: matchingAccount.sequenceNo
            };
            resolve(subAcc);
          } else if (avaialbeAccounts.length > 0) {
            this.blockchainService.checkIfAccountInvalidated(avaialbeAccounts[0].subAccount).then((status) => {
              if (status) {
                let subAcc = {
                  publicKey: avaialbeAccounts[0].subAccount,
                  available: true,
                  sequenceNo: avaialbeAccounts[0].sequenceNo
                };
                resolve(subAcc);
              } else {
                let subPair = this.blockchainService.getSubAccountPair(avaialbeAccounts[0].subAccount, this.properties.defaultAccount);
                this.blockchainService.invalidateSubAccountKey(subPair, this.properties.defaultAccount).then(() => {
                  let subAcc = {
                    publicKey: avaialbeAccounts[0].subAccount,
                    available: true,
                    sequenceNo: avaialbeAccounts[0].sequenceNo
                  };
                  resolve(subAcc);
                }).catch((err) => {
                  reject(err);
                });
              }
            }).catch((err) => {
              reject(err);
            });
          } else {
            console.log("New Account");
            this.blockchainService.createSubAccount(this.properties.defaultAccount, mainAccSk).then((subKeyPair: Keypair) => {
              this.blockchainService.blockchainAccountInfo(subKeyPair.publicKey()).then((accountInfo: AccountResponse) => {
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
          console.log("New Account");
          this.blockchainService.createSubAccount(this.properties.defaultAccount, mainAccSk).then((subKeyPair: Keypair) => {
            this.blockchainService.blockchainAccountInfo(subKeyPair.publicKey()).then((accountInfo: AccountResponse) => {
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

  identifierLostFocus() {
    this.idAvailable = false;
    this.itemSearching = true;
    let encodedID = this.mappingService.toBase64Id(this.COCForm.identifier);
    this.dataService.getIdentifierStatus(encodedID).then((res) => {
      let idStatus = res.body[0];
      this.idAvailable = idStatus.status;
      this.itemSearching = false;
    }).catch((err) => {
      this.itemSearching = false;
      this.idAvailable = false;
      this.logger.error("Failed to get identifier status: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
    });
  }

  presentAlert(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'OK'
    });
    alert.present();
  }

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Please Wait'
    });

    this.loading.present();
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  presentToastAwait(title, message) {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              reject();
            }
          },
          {
            text: 'Continue',
            handler: data => {
              resolve();
            }
          }
        ]
      });

      alert.present();
    });

  }

  // createAddress() {
  //   return Keypair.random();
  // }

  // addSubAccount(subAcc) {
  //   return new Promise((resolve, reject) => {
  //     const account = {
  //       "account": {
  //         "subKey": subAcc.publicKey(),
  //         "pk": this.mainAccount.pk
  //       }
  //     };

  //     return this.dataService.addSubAccount(account).then((res) => {
  //       if (res.status === 200) {
  //         this.presentToast('Sub account successfully added.');
  //         this.mainAccount.subAccounts.push(subAcc.publicKey());
  //         resolve();
  //       } else if (res.status === 406) {
  //         this.presentAlert('Keys update failed', 'Main account not found or Sub account names or public key alredy exist');
  //         reject();
  //       } else {
  //         this.presentAlert('Authentication Failed', 'Could not authenticate the sub account.');
  //         reject();
  //       }
  //     }).catch((err) => {
  //       reject(err);
  //     });
  //   });
  // }

  // COCVerification(signerSK) {
  //   const form = this.COCForm;
  //   try {
  //     return new Promise((resolve, reject) => {
  //       var sourceKeypair = Keypair.fromSecret(signerSK);
  //       var server = new Server(stellarNet);
  //       server.loadAccount(sourceKeypair.publicKey()).then(function (account) {
  //         var transaction = new TransactionBuilder(account)
  //           .addOperation(Operation.manageData({ name: 'Transaction Type', value: '11', }))
  //           .addOperation(Operation.manageData({ name: 'Identifier', value: form.identifier, }))
  //           .addOperation(Operation.manageData({ name: 'Receiver', value: form.receiver, }))
  //           .addOperation(Operation.manageData({ name: 'Asset', value: form.selectedItem, }))
  //           .addOperation(Operation.manageData({ name: 'Amount', value: form.qty, }))
  //           .addOperation(Operation.manageData({ name: 'MaxBound', value: JSON.stringify(form.vaidity), }))
  //           .build();
  //         // sign the transaction
  //         transaction.sign(sourceKeypair);
  //         return server.submitTransaction(transaction);
  //       }).then(function (transactionResult) {
  //         resolve(transactionResult.hash);
  //       }).catch(function (err) {
  //         console.log(err);
  //         reject();
  //       });
  //     });
  //   }
  //   catch (err_1) {
  //     console.log("CoC Verification: ", err_1);
  //   }
  // }  

  // AcceptBuild(Identifier, proofHash, subAcc, subAccObj, signerSK) {

  //   return new Promise((resolve, reject) => {
  //     try {
  //       let XDR;
  //       let b64;
  //       let seqNum;
  //       const receiver = this.COCForm.receiver;
  //       const quantity = this.COCForm.qty;
  //       const item = this.COCForm.selectedItem;
  //       const time = new Date(this.COCForm.vaidity);
  //       const senderPublickKey = this.mainAccount.pk;

  //       var minTime = Math.round(new Date().getTime() / 1000.0);
  //       var maxTime = time.getTime() / 1000.0;
  //       var sourceKeypair = Keypair.fromSecret(signerSK);

  //       console.log(subAccObj);

  //       var asset = new Asset(item, 'GA34R3AQUTUGARS6AZCXKVW5GKUQQB3IFQVG4T47R6OOKN4T4O3KKHNP');
  //       var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

  //       server.loadAccount(subAcc).then(function (account) {
  //         var transaction = new TransactionBuilder(account, opts)
  //         transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
  //         transaction.addOperation(Operation.manageData({ name: 'Identifier', value: Identifier, }))
  //         transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }))
  //         transaction.addOperation(Operation.payment({
  //           destination: receiver,
  //           asset: asset,
  //           amount: quantity,
  //           source: senderPublickKey
  //         }))

  //         if (!subAccObj.available) {
  //           transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccObj.sequenceNo + 2) }))
  //         }

  //         const tx = transaction.build();
  //         tx.sign(sourceKeypair);
  //         XDR = tx.toEnvelope();
  //         seqNum = tx.sequence;
  //         b64 = XDR.toXDR('base64');
  //         const resolveObj = {
  //           seqNum: seqNum,
  //           b64: b64
  //         }
  //         resolve(resolveObj);

  //       }).catch(function (e) {
  //         console.log(e);
  //       });
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   })

  // }

  // RejectBuild(proofHash, subAcc, subAccObj, signerSK) {

  //   return new Promise((resolve, reject) => {
  //     try {
  //       let XDR;
  //       let b64;
  //       const receiver = this.COCForm.receiver;
  //       // const item = this.COCForm.selectedItem;
  //       const time = new Date(this.COCForm.vaidity);
  //       const senderPublickKey = this.mainAccount.pk;

  //       var minTime = Math.round(new Date().getTime() / 1000.0);
  //       var maxTime = time.getTime() / 1000.0;
  //       console.log(maxTime);
  //       var sourceKeypair = Keypair.fromSecret(signerSK);
  //       var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
  //       server.loadAccount(subAcc).then(function (account) {
  //         var transaction = new TransactionBuilder(account, opts).addOperation(Operation.manageData({
  //           name: 'Status', value: 'rejected', source: receiver
  //         })).addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }))

  //         if (!subAccObj.available) {
  //           transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccObj.sequenceNo + 2) }))
  //         }

  //         const tx = transaction.build();
  //         tx.sign(sourceKeypair);
  //         XDR = tx.toEnvelope();
  //         b64 = XDR.toXDR('base64');

  //         resolve(b64);
  //       }).catch(function (e) {
  //         // reject(e)
  //         console.log(e);
  //       });
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   });
  // }

  // subAccountValidator(receiver) {
  //   return new Promise((resolve, reject) => {
  //     return this.subAccountStatus().then((subAccounts: any) => {
  //       console.log("Sub Accounts: ", subAccounts);
  //       var availableArr = subAccounts.filter((al) => {
  //         return al.available == true
  //       });
  //       var matchingArr = subAccounts.filter((ml) => {
  //         return ml.available == false && ml.receiver == receiver
  //       });

  //       if (availableArr.length > 0) {
  //         console.log("SubAccount: ", availableArr[0].subAccount);
  //         let subPair = this.blockchainService.getSubAccountPair(availableArr[0].subAccount, this.mainAccount);
  //         return this.blockchainService.accountBalance(availableArr[0].subAccount).then((balance) => {
  //           if (subAccountBaseFee <= balance) {
  //             return this.blockchainService.checkIfAccountInvalidated(availableArr[0].subAccount).then((status) => {
  //               if (status) {
  //                 resolve(availableArr[0]);
  //               } else {
  //                 return this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
  //                   resolve(availableArr[0]);
  //                 }).catch((err) => {
  //                   console.log("Account Invalidation error: ", err);
  //                   this.dissmissLoading();
  //                   reject(err);
  //                 });
  //               }
  //             }).catch((err) => {
  //               console.log("Account Invalidation Check error: ", err);
  //               this.dissmissLoading();
  //               reject(err);
  //             });
  //           } else {
  //             return this.blockchainService.transferFunds(this.secretKey, availableArr[0].subAccount, "2").then(() => {
  //               return this.blockchainService.checkIfAccountInvalidated(availableArr[0].subAccount).then((status) => {
  //                 if (status) {
  //                   resolve(availableArr[0]);
  //                 } else {
  //                   return this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
  //                     resolve(availableArr[0]);
  //                   }).catch((err) => {
  //                     console.log("Account Invalidation error: ", err);
  //                     this.dissmissLoading();
  //                     reject(err);
  //                   });
  //                 }
  //               }).catch((err) => {
  //                 console.log("Account Invalidation Check error: ", err);
  //                 this.dissmissLoading();
  //                 reject(err);
  //               });
  //             }).catch((err) => {
  //               console.log("Not enough funds");
  //               this.dissmissLoading();
  //               reject(err);
  //             });
  //           }
  //         }).catch((err) => {
  //           // If the error is a 404 try payment method
  //           console.log("Account Fund Check error: ", err);
  //           if (err.status == 404) {
  //             this.blockchainService.transferFundsForNewAccounts(this.secretKey, availableArr[0].subAccount, "2").then(() => {
  //               return this.blockchainService.checkIfAccountInvalidated(availableArr[0].subAccount).then((status) => {
  //                 if (status) {
  //                   resolve(availableArr[0]);
  //                 } else {
  //                   return this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
  //                     resolve(availableArr[0]);
  //                   }).catch((err) => {
  //                     console.log("Account Invalidation error: ", err);
  //                     this.dissmissLoading();
  //                     reject();
  //                   });
  //                 }
  //               }).catch((err) => {
  //                 console.log("Account Invalidation Check error: ", err);
  //                 this.dissmissLoading();
  //                 reject();
  //               });
  //             }).catch((err) => {
  //               console.log("Fund transfer error: ", err);
  //               this.dissmissLoading();
  //               reject(err);
  //             });
  //           } else {
  //             console.log("Account balance error: ", err);
  //             this.dissmissLoading();
  //             reject(err);
  //           }

  //         });
  //       } else if (availableArr.length == 0 && matchingArr.length >= 1) {
  //         let subPair = this.blockchainService.getSubAccountPair(matchingArr[0].subAccount, this.mainAccount);
  //         this.blockchainService.accountBalance(matchingArr[0].subAccount).then((balance) => {
  //           if (subAccountBaseFee <= balance) {
  //             resolve(matchingArr[0]);
  //           } else {
  //             return this.blockchainService.transferFunds(this.secretKey, availableArr[0].subAccount, "2").then(() => {
  //               resolve(matchingArr[0]);
  //             }).catch((err) => {
  //               console.log("Not enough funds");
  //               this.dissmissLoading();
  //               reject(err);
  //             });
  //           }
  //         }).catch((err) => {
  //           console.log("Could not check the account balance: ", err);
  //           this.dissmissLoading();
  //           reject(err);
  //         });
  //         resolve(matchingArr[0]);
  //       } else {
  //         this.blockchainService.accountBalance(this.mainAccount.pk).then((balance) => {
  //           this.blockchainService.accountAssetsCount(this.mainAccount.pk).then((count: number) => {
  //             let baseFee = (count * 0.5) + 4;
  //             if (baseFee <= balance) {
  //               let subPair = this.createAddress();
  //               this.blockchainService.transferFundsForNewAccounts(this.secretKey, subPair.publicKey(), "2").then(() => {
  //                 this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
  //                   resolve(subPair.publicKey());
  //                 }).catch((err) => {
  //                   console.log("Invalidating account failed: ", err);
  //                   this.dissmissLoading();
  //                   reject(err);
  //                 });
  //               }).catch((err) => {
  //                 console.log("Account funding failed: ", err);
  //                 this.dissmissLoading();
  //                 reject(err);
  //               });
  //             } else {
  //               this.presentAlert("Error!", "Main account does not have enough funds to perform this transaction.");
  //               console.log("Not enough funds.");
  //               this.dissmissLoading();
  //               reject();
  //             }
  //           }).catch((err) => {
  //             console.log("Not enough funds.");
  //             this.dissmissLoading();
  //             reject();
  //           });
  //         }).catch((err) => {
  //           console.log("Not enough funds.");
  //           this.dissmissLoading();
  //           reject();
  //         });
  //       }
  //     }).catch(e => {
  //       console.log(e);
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //         this.presentToast('Ops! Something went wrong.');
  //       }
  //       reject();
  //     });
  //   });
  // }

  // doCOC(signerSK) {
  //   this.presentLoading();
  //   this.subAccountValidator(this.COCForm.receiver).then((res) => {
  //     console.log(res);
  //     this.COCVerification(signerSK).then((res1) => {
  //       //@ts-ignore
  //       Promise.all([this.AcceptBuild(this.COCForm.identifier, res1, res.subAccount, res, signerSK), this.RejectBuild(res1, res.subAccount, res, signerSK)]).then((res3) => {
  //         return res3;
  //       }).then((res4) => {
  //         this.addCOC(res, res4).then(() => {
  //           this.navCtrl.setRoot(TransferPage);
  //         }).catch((err) => {
  //           this.dissmissLoading();
  //           this.navCtrl.setRoot(TabsPage);
  //           console.log("Adding CoC failed: ", err);
  //         });
  //       }).catch((err) => {
  //         this.dissmissLoading();
  //         console.log("Error: Do CoC1: ", err);
  //       });
  //     }).catch((err) => {
  //       this.dissmissLoading();
  //       this.presentAlert("Error!", "Ops! Something went wrong!");
  //     });
  //   }).catch((err) => {
  //     this.dissmissLoading();
  //     this.presentAlert("Error!", "Ops! Something went wrong!");
  //   });
  // }

  // addCOC(res2, res4) {
  //   return new Promise((resolve, reject) => {
  //     const obj = {
  //       "Sender": this.mainAccount.pk,
  //       "Receiver": this.COCForm.receiver,
  //       //@ts-ignore
  //       "SubAccount": res2.subAccount,
  //       //@ts-ignore
  //       "SequenceNo": Number(res4[0].seqNum + 2),
  //       //@ts-ignore
  //       "AcceptXdr": res4[0].b64,
  //       "RejectXdr": res4[1],
  //       "Identifier": this.COCForm.identifier,
  //       "Status": "pending"
  //     }
  //     console.log(obj)
  //     this.itemsProvider.addCOC(obj).subscribe((resp) => {
  //       // this.navCtrl.push(MainPage);
  //       console.log(resp)
  //       // @ts-ignore
  //       if (resp.Message == "Success" && this.isLoadingPresent) {
  //         this.dissmissLoading();
  //         resolve();
  //         this.presentToast(this.item.asset_code + ' transfered succesfully.');
  //         //set local storage???
  //       } else {
  //         if (this.isLoadingPresent) {
  //           this.dissmissLoading();
  //           this.presentToast('Transaction failed. Please try again.');
  //         }
  //         reject();
  //       }
  //     }, (err) => {
  //       console.log(err);
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //         this.presentToast('Transaction failed. Please try again.');
  //       }
  //       reject();
  //     });
  //   });
  // }

  // subAccountStatus() {
  //   return new Promise((resolve, reject) => {

  //     let subPks = [];
  //     this.mainAccount.subAccounts.forEach((account) => {
  //       subPks.push(account.pk);
  //     });
  //     const subAccount = {
  //       "User": this.mainAccount.accountName,
  //       "SubAccounts": subPks
  //     };

  //     console.log("Sub Accounts: ", JSON.stringify(this.mainAccount.subAccounts));
  //     return this.apiService.subAccountStatus(subAccount).then((res) => {
  //       console.log(res);
  //       if (res.status === 200) {
  //         resolve(res.body);
  //       } else {
  //         this.dissmissLoading();
  //         this.presentAlert('Error', 'Something went wrong! Please try again.');
  //       }
  //     }).catch((error) => {
  //       this.dissmissLoading();
  //       this.presentAlert('Error', 'Something went wrong! Please try again.');
  //       console.log(error);
  //     });
  //   });
  // }
}
