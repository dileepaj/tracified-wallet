import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Items } from '../../providers/items/items';
import { Networks, Keypair, Transaction } from 'stellar-base';
import { AES, enc } from 'crypto-js';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { DataServiceProvider } from '../../providers/data-service/data-service';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { TranslateService } from '@ngx-translate/core';
import { blockchainNetType } from 'src/app/shared/config';

@Component({
   selector: 'page-item-received',
   templateUrl: 'item-received.html',
   styleUrls: ['./item-received.scss'],
})
export class ItemReceivedPage {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   searchTerm: any = '';
   Searcheditems: {
      date: string;
      uname: string;
      oname: string;
      qty: string;
      validity: string;
      time: string;
      status: string;
   }[];
   timeBound: number;
   user: any;
   loading;
   isLoadingPresent: boolean;
   items = [];
   mainAccount: any;

   cocReceived = new Array();

   constructor(
      public navCtrl: NavController,
      public apiService: ApiServiceProvider,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      public toastCtrl: ToastController,
      public itemsProvider: Items,
      private properties: Properties,
      private dataService: DataServiceProvider,
      private logger: LoggerService,
      private blockchainService: BlockchainServiceProvider,
      private translate: TranslateService
   ) {}

   ionViewDidEnter() {
      this.mainAccount = this.properties.defaultAccount;
      this.getAllCoCs();
      console.log('receive');
   }

   async handleRefresh(event) {
      this.mainAccount = this.properties.defaultAccount;
      this.getAllCoCs();
      await event.target.complete();
   }

   getNetwork() {
      return blockchainNetType === 'live' ? Networks.PUBLIC : Networks.TESTNET;
   }

   async getAllCoCs() {
      this.presentLoading();
      this.cocReceived = [];
      this.dataService
         .getAllReceivedCoCs(this.mainAccount.pk)
         .then(res => {
            let cocs = res.body;
            if (cocs.length > 0) {
               let senderPks = new Array();
               for (let i = 0; i < cocs.length; i++) {
                  senderPks.push(cocs[i].Sender);
               }
               const param = {
                  account: {
                     accounts: senderPks,
                  },
               };

               this.dataService
                  .getAccountNamesOfKeys(param)
                  .then(res => {
                     let accountNames = res.body.pk;
                     cocs.forEach(coc => {
                        const transaction = new Transaction(coc.AcceptXdr, this.getNetwork());
                        let minTimeNumber = Number(transaction.timeBounds.minTime) * 1000;
                        let maxTimeNumber = Number(transaction.timeBounds.maxTime) * 1000;
                        let minTime = new Date(minTimeNumber);
                        let maxTime = new Date(maxTimeNumber);

                        let assetName;
                        let amount;
                        let sender;

                        transaction.operations.forEach(operation => {
                           if (operation.type == 'payment') {
                              assetName = operation.asset.code;
                              amount = operation.amount;
                              sender = operation.source;
                           }
                        });

                        let cocObj = {
                           cocOriginal: {
                              AcceptTxn: coc.AcceptTxn,
                              AcceptXdr: coc.AcceptXdr,
                              RejectTxn: coc.RejectTxn,
                              RejectXdr: coc.RejectXdr,
                              Receiver: coc.Receiver,
                              Sender: coc.Sender,
                              SequenceNo: coc.SequenceNo,
                              SubAccount: coc.SubAccount,
                              TxnHash: coc.TxnHash,
                              Status: coc.Status,
                              Identifier: coc.Identifier,
                           },
                           sender: sender,
                           assetCode: assetName,
                           quantity: amount,
                           validTill: maxTime.toLocaleString(),
                           sentDate: minTime.toLocaleString(),
                           sentOriginal: minTime,
                        };

                        cocObj.sender = accountNames.find(o => cocObj.sender == o.pk).accountName;
                        this.cocReceived.push(cocObj);
                     });
                     this.cocReceived.sort((a, b) => (a.sentOriginal < b.sentOriginal ? 1 : -1));
                     this.dissmissLoading();
                  })
                  .catch(async err => {
                     await this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_FETCH_ACCOUNT']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_ACCOUNT']);
                     });
                     this.logger.error('Could not get the account names: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                  });
            } else {
               this.dissmissLoading();
            }
         })
         .catch(async err => {
            await this.dissmissLoading();
            if (err.status != 400) {
               this.translate.get(['ERROR', 'FAILED_TO_FETCH_RECEIVED']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_RECEIVED']);
               });
            }
            this.logger.error('Could not load CoCs: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
   }

   updateCoC(coc, status) {
      let count = this.pendingCoCCount(coc.sentOriginal, this.cocReceived);
      console.log(count);
      if (count > 0) {
         this.translate.get(['ERROR', 'ACC_REJECT_PENDING_COC', 'PENDING_COC']).subscribe(text => {
            this.presentAlert('Error', text['ACC_REJECT_PENDING_COC '] + count + text[' PENDING_COC']);
         });
         return;
      }
      this.passwordPromptResponseWait()
         .then(password => {
            this.presentLoading();
            this.blockchainService
               .validateTransactionPassword(password, this.mainAccount.sk, this.mainAccount.pk)
               .then(decKey => {
                  if (status == 'accept') {
                     coc.cocOriginal.AcceptXdr = this.blockchainService.signXdr(coc.cocOriginal.AcceptXdr, decKey);
                     coc.cocOriginal.Status = 'accepted';
                  } else if (status == 'reject') {
                     coc.cocOriginal.RejectXdr = this.blockchainService.signXdr(coc.cocOriginal.RejectXdr, decKey);
                     coc.cocOriginal.Status = 'rejected';
                  }
                  this.dataService
                     .updateCoC(coc.cocOriginal)
                     .then(async res => {
                        await this.dissmissLoading();
                        if (status == 'accept') {
                           this.translate.get(['SUCCESS', 'SUCCESS_ACCEPTED', 'UPDATED_RESULTS_TRANSFER']).subscribe(text => {
                              this.presentAlert(text['SUCCESS'], text['SUCCESS_ACCEPTED '] + coc.assetCode + '. ' + text['UPDATED_RESULTS_TRANSFER']);
                           });
                        } else if (status == 'reject') {
                           this.translate.get(['SUCCESS', 'SUCCESS_REJECTED', 'ASSET_NOT_CHANGE']).subscribe(text => {
                              this.presentAlert(text['SUCCESS'], text['SUCCESS_REJECTED '] + coc.assetCode + '. ' + text['ASSET_NOT_CHANGE']);
                           });
                        }
                     })
                     .catch(async err => {
                        await this.dissmissLoading();
                        coc.cocOriginal.Status = 'pending';
                        this.translate.get(['ERROR', 'COULD_NOT_PROCEED']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['COULD_NOT_PROCEED']);
                        });
                        this.logger.error('Failed to update the CoC: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                     });
               })
               .catch(async err => {
                  await this.dissmissLoading();
                  this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['INVALID_PASSWORD']);
                  });
                  this.logger.error('Validating password failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               });
         })
         .catch(err => {
            this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['INVALID_PASSWORD']);
            });
            this.logger.error('Invalid password: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
   }

   passwordPromptResponseWait() {
      return new Promise(async (resolve, reject) => {
         let passwordPrompt = await this.alertCtrl.create({
            header: 'Transaction Password',
            inputs: [
               {
                  name: 'password',
                  placeholder: 'Password...',
                  type: 'password',
               },
            ],
            buttons: [
               {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: data => {
                     reject();
                  },
               },
               {
                  text: 'Submit',
                  handler: data => {
                     if (data.password != '') {
                        resolve(data.password);
                     }
                  },
               },
            ],
         });
         await passwordPrompt.present();
      });
   }

   pendingCoCCount(date: Date, array: any) {
      let count = 0;
      for (var i = 0; i < array.length; i++) {
         if (array[i].sentOriginal.getTime() < date.getTime() && array[i].cocOriginal.Status == 'pending') {
            count++;
         }
      }
      return count;
   }

   doRefresh(refresher) {
      this.getAllCoCs();
      refresher.complete();
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
         duration: 2500,
         position: 'bottom',
      });
      await toast.present();
   }

   async presentAlert(title, message) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: ['OK'],
      });
      alert.present();
   }
}
