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
import { TranslateService } from '@ngx-translate/core';
import { BcAccountPage } from '../../pages/bc-account/bc-account';

@IonicPage()

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {

  selectedItem2: any;
  itemRequired: any;
  item: any;
  user: any;
  currentItems: any;
  loading;
  isLoadingPresent: boolean;
  selectedReceiver: any = "";
  COCForm: { selectedItem: string, identifier: string, qty: string, receiver: string, vaidity: string } = {
    selectedItem: '',
    identifier: '',
    qty: '',
    receiver: '',
    vaidity: ''
  };

  public currentTime = new Date().toISOString();

  public bcAccounts: any;
  public idAvailable: boolean;
  public idEmpty: boolean;
  public itemSearching: boolean;
  public selectedItem;
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
    private logger: Logger,
    private translate: TranslateService
  ) {
    this.mainAccount = this.properties.defaultAccount;
    this.item = navParams.get('item');
    this.currentItems = navParams.get('currentItems') || this.currentItems.defaultItem;
  }

  getPublickeys() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.apiService.getPublicAccountsByTenant().then((res) => {
        this.dissmissLoading();
        if (res.status === 200) {
          const data = res.body.accounts;
          this.bcAccounts = data.filter(item => item.publicKey !== this.mainAccount.pk)
        } else if (res.status === 204) {
          this.presentToast('There are no accounts available!.');
        }
      }).catch((error) => {
        this.dissmissLoading();
      });
    } else {
      this.presentToast('There is no internet at the moment.');
    }
  }

  onSelectReceiver(event: any) {
    this.COCForm.receiver = event.value['publicKey']
  }

  ionViewDidLoad() {
    if (this.mainAccount) {
      this.getPublickeys();
    } else {
      this.presentToast('There is no Default account selected at the moment. Please select an account to proceed!');
      this.navCtrl.setRoot(BcAccountPage)
    }
    this.COCForm.selectedItem = this.item.asset_code;
    this.selectedItem = this.item.asset_code;
  }

  transferAsset() {
    let status = this.checkIfFormEmpty();
    if (!status) {
      this.translate.get(['ERROR', 'FILL_ALL_FIELDS']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['FILL_ALL_FIELDS']);
      });
      return;
    }

    if (Number(this.COCForm.qty) < 1) {
      this.translate.get(['ERROR', 'INVALID_ASSET']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['INVALID_ASSET']);
      });
      return;
    } else if (Number(this.item.balance) < Number(this.COCForm.qty)) {
      this.translate.get(['ERROR', 'NOT_ENOUGH_ASSETS']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['NOT_ENOUGH_ASSETS']);
      });
      return;
    }

    if (this.itemSearching) {
      this.translate.get(['ERROR', 'IDENTIFIER_DATA_NOT_AVAILABLE']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['IDENTIFIER_DATA_NOT_AVAILABLE']);
      });
      return;
    } else if (!this.idAvailable) {
      this.translate.get(['ERROR', 'IDENTIFIER_DATA_NOT_AVAILABLE']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['IDENTIFIER_DATA_NOT_AVAILABLE']);
      });
      return;
    }

    this.passwordPrompt().then((password) => {
      this.presentLoading();
      this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk).then((decKey) => {
        this.secretKey = decKey;
        this.blockchainService.preparesubAccount(this.secretKey, this.COCForm.receiver).then((subAcc: any) => {
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
                  this.translate.get(['SUCCESS', 'ASSET_TRANSFER_SUCCESS']).subscribe(text => {
                    this.presentAlert(text['SUCCESS'], text['ASSET_TRANSFER_SUCCESS']);
                  });
                  this.navCtrl.setRoot(TransferPage);
                  this.logger.info("Item transferred successfully: " + this.item.asset_code, this.properties.skipConsoleLogs, this.properties.writeToFile);
                }).catch((err) => {
                  this.dissmissLoading();
                  this.translate.get(['ERROR', 'FAILED_TO_SEND_TRANSACTION']).subscribe(text => {
                    this.presentAlert(text['ERROR'], text['FAILED_TO_SEND_TRANSACTION']);
                  });
                  this.logger.error("Sending CoC to gateway failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                });
              }).catch((err) => {
                this.dissmissLoading();
                this.translate.get(['ERROR', 'FAILED_TO_BUILD_TRANSACTION']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_TO_BUILD_TRANSACTION']);
                });
                this.logger.error("Accept and Reject xdr build failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
              });
            }).catch((err) => {
              this.dissmissLoading();
              this.translate.get(['ERROR', 'FAILED_TO_VERIFY_ASSET']).subscribe(text => {
                this.presentAlert(text['ERROR'], text['FAILED_TO_VERIFY_ASSET']);
              });
              this.logger.error("Failed to get the asset issuer: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
          }).catch((err) => {
            this.dissmissLoading();
            this.translate.get(['ERROR', 'FAILED_TO_VERIFY_TRANSC']).subscribe(text => {
              this.presentAlert(text['ERROR'], text['FAILED_TO_VERIFY_TRANSC']);
            });
            this.logger.error("Verify CoC failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        }).catch((err) => {
          this.dissmissLoading();
          this.translate.get(['ERROR', 'FAILED_TO_PREPARE_TRANSACTION', 'PENDING_TRANSACTION_ERROR']).subscribe(text => {
             if (err == "pendingTransacExist") {
                this.presentAlert(text['ERROR'], text['PENDING_TRANSACTION_ERROR']);
             } else {
                this.presentAlert(text['ERROR'], text['FAILED_TO_PREPARE_TRANSACTION']);
             }
          });
          this.logger.error("Preparing sub account failed: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      }).catch((err) => {
       this.dissmissLoading();
       this.forgetPasswordPopUp();
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


  forgetPasswordPopUp() {
    let alert = this.alertCtrl.create({
      title: "Incorrect Password!",
      subTitle: 'The password you entered is incorrect. Please try again or reset your password.',
      buttons: [
        {
          text: 'Forgot Password',
          handler: data => {
            this.privateKeyPopUp();
          }
        },
        {
          text: 'OK'
        }
      ]
    });
    alert.present();
  }



  privateKeyPopUp() {
    let alert = this.alertCtrl.create({
      title: "Forgot Password.",
      inputs: [
        {
          name: 'privateKey',
          placeholder: 'Private Key'
        }
      ],
      buttons: [
        {
          text: 'Submit',
          handler: data => {
            this.forgotTransactionPassword(data.privateKey);
          }
        }
      ]
    });
    alert.present();
  }


  forgotTransactionPassword(privateKey: string) {
    if (this.dataService.validateSecretKey(privateKey)) {
      this.newPasswordPopUp().then((password) => {
        let encKey = this.dataService.encryptKey(privateKey, password);
        if (encKey) {
          let update = {
            accName: this.properties.defaultAccount.accountName,
            sk: encKey
          }
          this.dataService.changeTransactionPasswordWithPrivateKey(update).then((res) => {
            if (res.status === 200) {
              this.translate.get(['SUCCESS_CHANGED_PASSWORD']).subscribe(text => {
                this.presentToast(text['SUCCESS_CHANGED_PASSWORD']);
              });
            } else {
              this.translate.get(['COULD_NOT_RESET']).subscribe(text => {
                this.presentToast(text['COULD_NOT_RESET']);
              });
            }
          }).catch((err) => {
            this.translate.get(['FAILED_UPDATE_NEW_PASSWORD']).subscribe(text => {
              this.presentToast(text['FAILED_UPDATE_NEW_PASSWORD']);
            });
            this.logger.error("[FORGOT]Password update failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        } else {
          this.translate.get(['CANNOT_ENCRYPT_NEW_PASSWORD']).subscribe(text => {
            this.presentToast(text['CANNOT_ENCRYPT_NEW_PASSWORD']);
          });
        }
      }).catch((err) => {
        this.translate.get(['FAILED_UPDATE_NEW_PASSWORD']).subscribe(text => {
          this.presentToast(text['FAILED_UPDATE_NEW_PASSWORD']);
        });
        this.logger.error("[FORGOT]Popup error: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else {
      this.translate.get(['PRIVATE_KEY_INCORRECT']).subscribe(text => {
        this.presentToast(text['PRIVATE_KEY_INCORRECT']);
      });
    }
  }

  newPasswordPopUp(): Promise<any> {

    let resolveFunction: (newPassword: any) => void;
    let promise = new Promise<any>(resolve => {
      resolveFunction = resolve;
    });

    let passwordPopUp = this.alertCtrl.create({
      title: "Enter your new Transaction password",
      inputs: [
        {
          name: "password",
          placeholder: "New Transaction Password",
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            resolveFunction(false);
          }
        },
        {
          text: 'OK',
          handler: data => {
            resolveFunction(data.password);
          }
        }
      ]
    });

    passwordPopUp.present();

    return promise;
  }

}
