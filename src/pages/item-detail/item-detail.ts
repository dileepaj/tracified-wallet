import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Keypair } from 'stellar-sdk';
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
    this.passwordPrompt().then((password) => {
      this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk).then((decKey) => {
        this.secretKey = decKey;
        this.presentLoading();
        this.preparesubAccount(this.secretKey).then((subAcc: any) => {
          console.log("Sub Account: ", subAcc);
          let subPair = this.blockchainService.getSubAccountPair(subAcc.publicKey, this.properties.defaultAccount);
          this.blockchainService.verifyCoC(this.secretKey, this.COCForm.identifier, this.COCForm.receiver, this.COCForm.selectedItem, this.COCForm.qty, this.COCForm.vaidity).then((transactionHash) => {
            this.blockchainService.getAssetIssuer(this.properties.defaultAccount.pk, this.COCForm.selectedItem).then((issuer) => {
              Promise.all([this.blockchainService.acceptTransactionXdr(this.COCForm.identifier, this.COCForm.receiver, this.COCForm.qty, this.COCForm.selectedItem, this.COCForm.vaidity, transactionHash, subAcc, issuer, this.secretKey),
              this.blockchainService.rejectTransactionXdr(this.COCForm.receiver, this.COCForm.vaidity, transactionHash, subAcc, this.secretKey)]).then((xdrs: any) => {
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
              let subAcc = {
                publicKey: subKeyPair.publicKey(),
                available: false
              };
              resolve(subAcc);
            }).catch((err) => {
              reject(err);
            });
          }
        } else {
          console.log("New Account");
          this.blockchainService.createSubAccount(this.properties.defaultAccount, mainAccSk).then((subKeyPair: Keypair) => {
            let subAcc = {
              publicKey: subKeyPair.publicKey(),
              available: false
            };
            resolve(subAcc);
          }).catch((err) => {
            reject(err);
          });
        }
      }).catch((err) => {
        reject(err);
      });
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
  
}
