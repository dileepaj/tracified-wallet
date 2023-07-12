import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
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
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { TOAST_TIMER } from 'src/environments/environment';

@Component({
   selector: 'page-item-detail',
   templateUrl: 'item-detail.html',
   styleUrls: ['./item-detail.scss'],
})
export class ItemDetailPage implements OnInit {
   selectedItem2: any;
   itemRequired: any;
   item: any;
   user: any;
   currentItems: any;
   loading;
   isLoadingPresent: boolean;
   selectedReceiver: any = '';
   date = new Date();
   myDate: String = new Date(this.date.getTime() - this.date.getTimezoneOffset() * 60000).toISOString();
   COCForm: { selectedItem: string; identifier: string; qty: string; receiver: string; vaidity: String } = {
      selectedItem: '',
      identifier: '',
      qty: '',
      receiver: '',
      vaidity: this.myDate,
   };

   public bcAccounts: any;
   public idAvailable: boolean;
   public idEmpty: boolean;
   public itemSearching: boolean;
   public selectedItem;
   secretKey;
   mainAccount: any;
   tenentId: string;
   minDate;

   constructor(
      private router: Router,
      private toastCtrl: ToastController,
      private apiService: ApiServiceProvider,
      private connectivity: ConnectivityServiceProvider,
      private loadingCtrl: LoadingController,

      private itemsProvider: Items,
      private alertCtrl: AlertController,
      private storage: StorageServiceProvider,
      private properties: Properties,
      private blockchainService: BlockchainServiceProvider,
      private mappingService: MappingServiceProvider,
      private dataService: DataServiceProvider,
      private logger: LoggerService,
      private translate: TranslateService
   ) {
      this.mainAccount = this.properties.defaultAccount;
      this.item = this.router.getCurrentNavigation().extras.state.item;
      this.currentItems = this.router.getCurrentNavigation().extras.state.currentItems || this.currentItems.defaultItem;

      this.tenentId = this.properties.tenant;
      let today = new Date();
      this.minDate = formatDate(today, 'yyyy-MM-dd', 'en');
   }
   ngOnInit() {
      if (this.mainAccount) {
         this.getPublickeys();
      } else {
         this.presentToast('There is no Default account selected at the moment. Please select an account to proceed!');
         this.router.navigate(['/bc-account'], { replaceUrl: true });
      }
      this.COCForm.selectedItem = this.item.asset_code;
      this.selectedItem = this.item.asset_code;
   }

   async getPublickeys() {
      if (this.connectivity.onDevice) {
         await this.presentLoading();
         this.apiService
            .getPublicAccountsByTenant()
            .then(async res => {
               await this.dissmissLoading();
               if (res.status === 200) {
                  const data = res.body.accounts;
                  this.bcAccounts = data.filter(item => item.publicKey !== this.mainAccount.pk);
               } else if (res.status === 204) {
                  this.presentToast('There are no accounts available!.');
               }
            })
            .catch(async error => {
               await this.dissmissLoading();
            });
      } else {
         this.presentToast('There is no internet at the moment.');
      }
   }

   onSelectReceiver(event: any) {
      this.COCForm.receiver = event.value['publicKey'];
   }

   ionViewDidLoad() {}

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

      this.passwordPrompt().then(async password => {
         await this.presentLoading();
         this.blockchainService
            .validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk)
            .then(decKey => {
               this.secretKey = decKey;
               this.preparesubAccount(this.secretKey)
                  .then((subAcc: any) => {
                     let subPair = this.blockchainService.getSubAccountPair(subAcc.publicKey, this.properties.defaultAccount);
                     this.blockchainService
                        .verifyCoC(this.secretKey, this.COCForm.identifier, this.COCForm.receiver, this.COCForm.selectedItem, this.COCForm.qty, this.COCForm.vaidity)
                        .then(transactionHash => {
                           this.blockchainService
                              .getAssetIssuer(this.properties.defaultAccount.pk, this.COCForm.selectedItem)
                              .then(issuer => {
                                 Promise.all([
                                    this.blockchainService.acceptTransactionXdr(
                                       this.COCForm.identifier,
                                       this.COCForm.receiver,
                                       this.COCForm.qty,
                                       this.COCForm.selectedItem,
                                       this.COCForm.vaidity,
                                       transactionHash,
                                       subAcc,
                                       issuer,
                                       this.secretKey
                                    ),
                                    this.blockchainService.rejectTransactionXdr(this.COCForm.receiver, this.COCForm.vaidity, transactionHash, subAcc, this.secretKey),
                                 ])
                                    .then((xdrs: any) => {
                                       const coc = {
                                          Sender: this.properties.defaultAccount.pk,
                                          Receiver: this.COCForm.receiver,
                                          SubAccount: subPair.publicKey(),
                                          SequenceNo: JSON.stringify(Number(xdrs[0].seqNum) + 2),
                                          AcceptXdr: xdrs[0].b64,
                                          RejectXdr: xdrs[1],
                                          Identifier: this.COCForm.identifier,
                                          Status: 'pending',
                                          TenantID: this.tenentId,
                                       };
                                       this.dataService
                                          .sendCoC(coc)
                                          .then(async res => {
                                             await this.dissmissLoading();
                                             this.translate.get(['SUCCESS', 'ASSET_TRANSFER_SUCCESS']).subscribe(text => {
                                                this.presentAlert(text['ERROR'], text['ASSET_TRANSFER_SUCCESS']);
                                             });
                                             this.router.navigate(['/transfer'], { replaceUrl: true });
                                             this.logger.info('Item transferred successfully: ' + this.item.asset_code, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                          })
                                          .catch(async err => {
                                             await this.dissmissLoading();
                                             this.translate.get(['ERROR', 'FAILED_TO_SEND_TRANSACTION']).subscribe(text => {
                                                this.presentAlert(text['ERROR'], text['FAILED_TO_SEND_TRANSACTION']);
                                             });
                                             this.logger.error('Sending CoC to gateway failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                          });
                                    })
                                    .catch(async err => {
                                       await this.dissmissLoading();
                                       this.translate.get(['ERROR', 'FAILED_TO_BUILD_TRANSACTION']).subscribe(text => {
                                          this.presentAlert(text['ERROR'], text['FAILED_TO_BUILD_TRANSACTION']);
                                       });
                                       this.logger.error('Accept and Reject xdr build failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                    });
                              })
                              .catch(async err => {
                                 await this.dissmissLoading();
                                 this.translate.get(['ERROR', 'FAILED_TO_VERIFY_ASSET']).subscribe(text => {
                                    this.presentAlert(text['ERROR'], text['FAILED_TO_VERIFY_ASSET']);
                                 });
                                 this.logger.error('Failed to get the asset issuer: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                              });
                        })
                        .catch(async err => {
                           await this.dissmissLoading();
                           this.translate.get(['ERROR', 'FAILED_TO_VERIFY_TRANSC']).subscribe(text => {
                              this.presentAlert(text['ERROR'], text['FAILED_TO_VERIFY_TRANSC']);
                           });
                           this.logger.error('Verify CoC failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                        });
                  })
                  .catch(async err => {
                     await this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_PREPARE_TRANSACTION']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['FAILED_TO_PREPARE_TRANSACTION']);
                     });
                     this.logger.error('Preparing sub account failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                  });
            })
            .catch(async err => {
               await this.dissmissLoading();
               this.translate.get(['ERROR', 'INVALID_TRANSACTION_PASSWORD']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['INVALID_TRANSACTION_PASSWORD']);
               });
               this.logger.error('Password validation failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
      });
   }

   passwordPrompt(): Promise<any> {
      return new Promise(async (resolve, reject) => {
         let alert = await this.alertCtrl.create({
            header: 'Transaction Password',
            inputs: [
               {
                  name: 'password',
                  type: 'password',
                  placeholder: 'Password...',
               },
            ],
            buttons: [
               {
                  text: 'Cancel',
                  role: 'cancel',
               },
               {
                  text: 'Submit',
                  handler: data => {
                     if (data.password) {
                        resolve(data.password);
                     } else {
                     }
                  },
               },
            ],
         });
         await alert.present();
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
         this.properties.defaultAccount.subAccounts.forEach(account => {
            subPublicKeys.push(account.pk);
         });
         const subAccounts = {
            User: this.properties.defaultAccount.accountName,
            SubAccounts: subPublicKeys,
         };
         this.dataService
            .subAccountsStatus(subAccounts)
            .then(res => {
               let avaialbeAccounts = [];
               let matchingAccount;
               let statuses = res.body;
               if (statuses) {
                  statuses.forEach(status => {
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
                        sequenceNo: matchingAccount.sequenceNo,
                     };
                     resolve(subAcc);
                  } else if (avaialbeAccounts.length > 0) {
                     this.blockchainService
                        .checkIfAccountInvalidated(avaialbeAccounts[0].subAccount)
                        .then(status => {
                           if (status) {
                              let subAcc = {
                                 publicKey: avaialbeAccounts[0].subAccount,
                                 available: true,
                                 sequenceNo: avaialbeAccounts[0].sequenceNo,
                              };
                              resolve(subAcc);
                           } else {
                              let subPair = this.blockchainService.getSubAccountPair(avaialbeAccounts[0].subAccount, this.properties.defaultAccount);
                              this.blockchainService
                                 .invalidateSubAccountKey(subPair, this.properties.defaultAccount)
                                 .then(() => {
                                    let subAcc = {
                                       publicKey: avaialbeAccounts[0].subAccount,
                                       available: true,
                                       sequenceNo: avaialbeAccounts[0].sequenceNo,
                                    };
                                    resolve(subAcc);
                                 })
                                 .catch(err => {
                                    reject(err);
                                 });
                           }
                        })
                        .catch(err => {
                           reject(err);
                        });
                  } else {
                     this.blockchainService
                        .createSubAccount(this.properties.defaultAccount, mainAccSk)
                        .then((subKeyPair: Keypair) => {
                           this.blockchainService
                              .blockchainAccountInfo(subKeyPair.publicKey())
                              .then((accountInfo: any) => {
                                 let subAcc = {
                                    publicKey: subKeyPair.publicKey(),
                                    available: false,
                                    sequenceNo: accountInfo.sequence,
                                 };
                                 resolve(subAcc);
                              })
                              .catch(err => {
                                 reject(err);
                              });
                        })
                        .catch(err => {
                           reject(err);
                        });
                  }
               } else {
                  this.blockchainService
                     .createSubAccount(this.properties.defaultAccount, mainAccSk)
                     .then((subKeyPair: Keypair) => {
                        this.blockchainService
                           .blockchainAccountInfo(subKeyPair.publicKey())
                           .then((accountInfo: any) => {
                              let subAcc = {
                                 publicKey: subKeyPair.publicKey(),
                                 available: false,
                                 sequenceNo: accountInfo.sequence,
                              };
                              resolve(subAcc);
                           })
                           .catch(err => {
                              reject(err);
                           });
                     })
                     .catch(err => {
                        reject(err);
                     });
               }
            })
            .catch(err => {
               reject(err);
            });
      });
   }

   identifierLostFocus() {
      this.idAvailable = false;
      this.itemSearching = true;
      let encodedID = this.mappingService.toBase64Id(this.COCForm.identifier);
      this.dataService
         .getIdentifierStatus(encodedID)
         .then(res => {
            let idStatus = res.body[0];
            this.idAvailable = idStatus.status;
            this.itemSearching = false;
         })
         .catch(err => {
            this.itemSearching = false;
            this.idAvailable = false;
            this.logger.error('Failed to get identifier status: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
   }

   publickeyPrint(key) {
      let first = key.slice(0, 10);
      let end = key.slice(-10);
      let Pkey = first + '..............' + end;
      return Pkey;
   }

   async presentAlert(title, message) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => {},
            },
         ],
      });
      await alert.present();
   }

   async presentLoading() {
      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         message: 'Please Wait',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      this.isLoadingPresent = false;
      await this.loading.dismiss();
   }

   async presentToast(message) {
      let toast = await this.toastCtrl.create({
         message: message,
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });
      await toast.present();
   }
}
