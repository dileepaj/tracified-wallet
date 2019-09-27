import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Operation, Server, TransactionBuilder, Asset, Keypair } from 'stellar-sdk';
import { AES, enc } from "crypto-js";
import { get } from 'request';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
var StellarSdk = require('stellar-sdk')
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { stellarNet } from '../../shared/config';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { subAccountBaseFee } from '../../shared/config';
import { rejects } from 'assert';
import { TabsPage } from '../../pages/tabs/tabs';
import { TransferPage } from '../../pages/transfer/transfer';
import { ScannerViewPage } from "../scanner-view/scanner-view";

var server = new Server(stellarNet);
StellarSdk.Network.usePublicNetwork();

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
  // itemList: any = [];
  item: any;
  user: any;
  currentItems: any;
  // receivers = [];
  loading;
  isLoadingPresent: boolean;
  // selectedItem: string;
  selectedReceiver: any;
  COCForm: { selectedItem: string, identifier: string, qty: string, receiver: string, vaidity: Date } = {
    selectedItem: '',
    identifier: '',
    qty: '',
    receiver: '',
    vaidity: new Date()
  };

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
    private dataService: DataServiceProvider
  ) {
    this.COCForm.identifier = this.navParams.get('text');
    this.mainAccount = this.properties.defaultAccount;
    this.item = navParams.get('item');
    this.currentItems = navParams.get('currentItems');
  }

  ionViewDidLoad() {
    this.COCForm.selectedItem = this.item.asset_code;
  }

  viewScannerPage(){
    this.navCtrl.setRoot(ScannerViewPage);
  }

  passwordPrompt() {
    let alert = this.alertCtrl.create({
      cssClass: 'submitPassword',
      title: 'Enter Password : ',
      inputs: [
        {
          name: 'password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Submit',
          handler: data => {
            if (data.password != "") {
              console.log(data);
              this.mappingService.decryptSecret(this.mainAccount.sk, data.password).then((decKey) => {
                this.secretKey = decKey;
                this.doCOC(decKey);
              }).catch((err) => {
                console.log("Invalid Password");
              });
            } else {
              console.log("Empty Password");
            }
          }
        }
      ]
    });
    alert.present();
  }

  subAccountValidator(receiver) {
    return new Promise((resolve, reject) => {
      return this.subAccountStatus().then((subAccounts: any) => {
        console.log("Sub Accounts: ", subAccounts);
        var availableArr = subAccounts.filter((al) => {
          return al.available == true
        });
        var matchingArr = subAccounts.filter((ml) => {
          return ml.available == false && ml.receiver == receiver
        });

        if (availableArr.length > 0) {
          console.log("SubAccount: ", availableArr[0].subAccount);
          let subPair = this.blockchainService.getSubAccountPair(availableArr[0].subAccount, this.mainAccount);
          return this.blockchainService.accountBalance(availableArr[0].subAccount).then((balance) => {
            if (subAccountBaseFee <= balance) {
              return this.blockchainService.checkIfAccountInvalidated(availableArr[0].subAccount).then((status) => {
                if (status) {
                  resolve(availableArr[0]);
                } else {
                  return this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
                    resolve(availableArr[0]);
                  }).catch((err) => {
                    console.log("Account Invalidation error: ", err);
                    this.dissmissLoading();
                    reject(err);
                  });
                }
              }).catch((err) => {
                console.log("Account Invalidation Check error: ", err);
                this.dissmissLoading();
                reject(err);
              });
            } else {
              return this.blockchainService.transferFunds(this.secretKey, availableArr[0].subAccount, "2").then(() => {
                return this.blockchainService.checkIfAccountInvalidated(availableArr[0].subAccount).then((status) => {
                  if (status) {
                    resolve(availableArr[0]);
                  } else {
                    return this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
                      resolve(availableArr[0]);
                    }).catch((err) => {
                      console.log("Account Invalidation error: ", err);
                      this.dissmissLoading();
                      reject(err);
                    });
                  }
                }).catch((err) => {
                  console.log("Account Invalidation Check error: ", err);
                  this.dissmissLoading();
                  reject(err);
                });
              }).catch((err) => {
                console.log("Not enough funds");
                this.dissmissLoading();
                reject(err);
              });
            }
          }).catch((err) => {
            // If the error is a 404 try payment method
            console.log("Account Fund Check error: ", err);
            if (err.status == 404) {
              this.blockchainService.transferFundsForNewAccounts(this.secretKey, availableArr[0].subAccount, "2").then(() => {
                return this.blockchainService.checkIfAccountInvalidated(availableArr[0].subAccount).then((status) => {
                  if (status) {
                    resolve(availableArr[0]);
                  } else {
                    return this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
                      resolve(availableArr[0]);
                    }).catch((err) => {
                      console.log("Account Invalidation error: ", err);
                      this.dissmissLoading();
                      reject();
                    });
                  }
                }).catch((err) => {
                  console.log("Account Invalidation Check error: ", err);
                  this.dissmissLoading();
                  reject();
                });
              }).catch((err) => {
                console.log("Fund transfer error: ", err);
                this.dissmissLoading();
                reject(err);
              });
            } else {
              console.log("Account balance error: ", err);
              this.dissmissLoading();
              reject(err);
            }

          });
        } else if (availableArr.length == 0 && matchingArr.length >= 1) {
          let subPair = this.blockchainService.getSubAccountPair(matchingArr[0].subAccount, this.mainAccount);
          this.blockchainService.accountBalance(matchingArr[0].subAccount).then((balance) => {
            if (subAccountBaseFee <= balance) {
              resolve(matchingArr[0]);
            } else {
              return this.blockchainService.transferFunds(this.secretKey, availableArr[0].subAccount, "2").then(() => {
                resolve(matchingArr[0]);
              }).catch((err) => {
                console.log("Not enough funds");
                this.dissmissLoading();
                reject(err);
              });
            }
          }).catch((err) => {
            console.log("Could not check the account balance: ", err);
            this.dissmissLoading();
            reject(err);
          });
          resolve(matchingArr[0]);
        } else {
          this.blockchainService.accountBalance(this.mainAccount.pk).then((balance) => {
            this.blockchainService.accountAssetsCount(this.mainAccount.pk).then((count: number) => {
              let baseFee = (count * 0.5) + 4;
              if (baseFee <= balance) {
                this.createAddress().then((subPair) => {
                  this.blockchainService.transferFundsForNewAccounts(this.secretKey, subPair.publicKey(), "2").then(() => {
                    this.blockchainService.invalidateSubAccountKey(subPair, this.mainAccount).then(() => {
                      resolve(subPair.publicKey());
                    }).catch((err) => {
                      console.log("Invalidating account failed: ", err);
                      this.dissmissLoading();
                      reject(err);
                    });
                  }).catch((err) => {
                    console.log("Account funding failed: ", err);
                    this.dissmissLoading();
                    reject(err);
                  });
                });
              } else {
                this.userError("Error!", "Main account does not have enough funds to perform this transaction.");
                console.log("Not enough funds.");
                this.dissmissLoading();
                reject();
              }
            }).catch((err) => {
              console.log("Not enough funds.");
              this.dissmissLoading();
              reject();
            });
          }).catch((err) => {
            console.log("Not enough funds.");
            this.dissmissLoading();
            reject();
          });
        }
      }).catch(e => {
        console.log(e);
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast('Ops! Something went wrong.');
        }
        reject();
      });
    });
  }

  doCOC(signerSK) {
    this.presentLoading();
    this.subAccountValidator(this.COCForm.receiver).then((res) => {
      console.log(res);
      this.COCVerification(signerSK).then((res1) => {
        //@ts-ignore
        Promise.all([this.AcceptBuild(this.COCForm.identifier, res1, res.subAccount, res, signerSK), this.RejectBuild(res1, res.subAccount, res, signerSK)]).then((res3) => {
          return res3;
        }).then((res4) => {
          this.addCOC(res, res4).then(() => {
            this.navCtrl.setRoot(TransferPage);
          }).catch((err) => {
            this.dissmissLoading();
            this.navCtrl.setRoot(TabsPage);
            console.log("Adding CoC failed: ", err);
          });
        }).catch((err) => {
          this.dissmissLoading();
          console.log("Error: Do CoC1: ", err);
        });
      }).catch((err) => {
        this.dissmissLoading();
        this.userError("Error!", "Ops! Something went wrong!");
      });
    }).catch((err) => {
      this.dissmissLoading();
      this.userError("Error!", "Ops! Something went wrong!");
    });
  }

  addCOC(res2, res4) {
    return new Promise((resolve, reject) => {
      const obj = {
        "Sender": this.mainAccount.pk,
        "Receiver": this.COCForm.receiver,
        //@ts-ignore
        "SubAccount": res2.subAccount,
        //@ts-ignore
        "SequenceNo": Number(res4[0].seqNum + 2),
        // (subAcc) ? : ;
        //@ts-ignore
        "AcceptXdr": res4[0].b64,
        "RejectXdr": res4[1],
        "Identifier": this.COCForm.identifier,
        "Status": "pending"
      }
      console.log(obj)
      this.itemsProvider.addCOC(obj).subscribe((resp) => {
        // this.navCtrl.push(MainPage);
        console.log(resp)
        // @ts-ignore
        if (resp.Message == "Success" && this.isLoadingPresent) {
          this.dissmissLoading();
          resolve();
          this.presentToast(this.item.asset_code + ' transfered succesfully.');
          //set local storage???
        } else {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Transaction failed. Please try again.');
          }
          reject();
        }
      }, (err) => {
        console.log(err);
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast('Transaction failed. Please try again.');
        }
        reject();
      });
    });
  }

  subAccountStatus() {
    return new Promise((resolve, reject) => {

      let subPks = [];
      this.mainAccount.subAccounts.forEach((account) => {
        subPks.push(account.pk);
      });
      const subAccount = {
        "User": this.mainAccount.accountName,
        "SubAccounts": subPks
      };

      console.log("Sub Accounts: ", JSON.stringify(this.mainAccount.subAccounts));
      return this.apiService.subAccountStatus(subAccount).then((res) => {
        console.log(res);
        if (res.status === 200) {
          resolve(res.body);
        } else {
          this.dissmissLoading();
          this.userError('Error', 'Something went wrong! Please try again.');
        }
      }).catch((error) => {
        this.dissmissLoading();
        this.userError('Error', 'Something went wrong! Please try again.');
        console.log(error);
      });
    });
  }

  AcceptBuild(Identifier, proofHash, subAcc, subAccObj, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        let seqNum;
        const receiver = this.COCForm.receiver;
        const quantity = this.COCForm.qty;
        const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.mainAccount.pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        console.log(subAccObj);

        var asset = new Asset(item, 'GA34R3AQUTUGARS6AZCXKVW5GKUQQB3IFQVG4T47R6OOKN4T4O3KKHNP');
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

        // Network.useTestNetwork();
        // var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(subAcc)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
            transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
            transaction.addOperation(Operation.manageData({ name: 'Identifier', value: Identifier, }))
            transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }))
            transaction.addOperation(Operation.payment({
              destination: receiver,
              asset: asset,
              amount: quantity,
              source: senderPublickKey
            }))

            if (!subAccObj.available) {
              transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccObj.sequenceNo + 2) }))
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

          })
          .catch(function (e) {
            console.log(e);
          });
      } catch (error) {
        console.log(error)
      }
    })

  }

  RejectBuild(proofHash, subAcc, subAccObj, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = this.COCForm.receiver;
        // const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.mainAccount.pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        var maxTime = time.getTime() / 1000.0;
        console.log(maxTime);
        var sourceKeypair = Keypair.fromSecret(signerSK);
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
        server.loadAccount(subAcc).then(function (account) {
          var transaction = new TransactionBuilder(account, opts).addOperation(Operation.manageData({
            name: 'Status', value: 'rejected', source: receiver
          })).addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }))

          if (!subAccObj.available) {
            transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccObj.sequenceNo + 2) }))
          }

          const tx = transaction.build();
          tx.sign(sourceKeypair);
          XDR = tx.toEnvelope();
          b64 = XDR.toXDR('base64');

          resolve(b64);
        }).catch(function (e) {
          // reject(e)
          console.log(e);
        });
      } catch (error) {
        console.log(error)
      }
    });
  }

  COCVerification(signerSK) {
    const form = this.COCForm;
    try {
      return new Promise((resolve, reject) => {

        var sourceKeypair = Keypair.fromSecret(signerSK);
        var server = new Server(stellarNet);
        server.loadAccount(sourceKeypair.publicKey()).then(function (account) {
          var transaction = new TransactionBuilder(account)
            .addOperation(Operation.manageData({ name: 'Transaction Type', value: '11', }))
            .addOperation(Operation.manageData({ name: 'Identifier', value: form.identifier, }))
            .addOperation(Operation.manageData({ name: 'Receiver', value: form.receiver, }))
            .addOperation(Operation.manageData({ name: 'Asset', value: form.selectedItem, }))
            .addOperation(Operation.manageData({ name: 'Amount', value: form.qty, }))
            .addOperation(Operation.manageData({ name: 'MaxBound', value: JSON.stringify(form.vaidity), }))
            .build();
          // sign the transaction
          transaction.sign(sourceKeypair);
          return server.submitTransaction(transaction);
        }).then(function (transactionResult) {
          resolve(transactionResult.hash);
        }).catch(function (err) {
          console.log(err);
          reject();
        });
      });
    }
    catch (err_1) {
      console.log("CoC Verification: ", err_1);
    }
  }

  createAddress(): Promise<any> {
    return new Promise((resolve) => {
      var pair = Keypair.random();
      resolve(pair);
    });
  }

  addSubAccount(subAcc) {
    return new Promise((resolve, reject) => {
      const account = {
        "account": {
          "subKey": subAcc.publicKey(),
          "pk": this.mainAccount.pk
        }
      };

      return this.dataService.addSubAccount(account).then((res) => {
        if (res.status === 200) {
          this.presentToast('Sub account successfully added.');
          this.mainAccount.subAccounts.push(subAcc.publicKey());
          resolve();
        } else if (res.status === 406) {
          this.userError('Keys update failed', 'Main account not found or Sub account names or public key alredy exist');
          reject();
        } else {
          this.userError('Authentication Failed', 'Could not authenticate the sub account.');
          reject();
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  userError(title, message) {
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

}
