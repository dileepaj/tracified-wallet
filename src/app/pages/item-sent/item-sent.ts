import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { Items } from '../../providers/items/items';
import { Networks, Keypair, Transaction } from 'stellar-base';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { AES, enc } from 'crypto-js';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { TranslateService } from '@ngx-translate/core';
import { blockchainNetType } from 'src/app/shared/config';

@Component({
   selector: 'page-item-sent',
   templateUrl: 'item-sent.html',
   styleUrls: ['./item-sent.scss'],
})
export class ItemSentPage {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   searchTerm: any = '';
   items = [];
   Searcheditems: { date: string; uname: string; oname: string; qty: string; validity: string; time: number; status: string }[];
   user: any;
   loading;
   isLoadingPresent: boolean;
   Citems: any;
   mainAccount: any;
   cocSent = new Array();

   constructor(
      public navCtrl: NavController,
      public apiService: ApiServiceProvider,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      public itemsProvider: Items,
      private storage: StorageServiceProvider,
      private properties: Properties,
      private logger: LoggerService,
      private dataService: DataServiceProvider,
      private translate: TranslateService
   ) {}

   ngOnInit() {}

   ionViewDidLoad() {}

   ionViewDidEnter() {
      this.mainAccount = this.properties.defaultAccount;
      this.getAllCoCs();
   }

   doRefresh(refresher) {
      this.getAllCoCs();
      refresher.complete();
   }
   getNetwork() {
      return blockchainNetType === 'live' ? Networks.PUBLIC : Networks.TESTNET;
   }

   getAllCoCs() {
      this.presentLoading();
      this.cocSent = [];
      this.dataService
         .getAllSentCoCs(this.mainAccount.pk)
         .then(res => {
            let cocs = res.body;
            if (cocs.length > 0) {
               let senderPks = new Array();
               for (let i = 0; i < cocs.length; i++) {
                  senderPks.push(cocs[i].Receiver);
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
                        let receiver;

                        transaction.operations.forEach(operation => {
                           if (operation.type == 'payment') {
                              assetName = operation.asset.code;
                              amount = operation.amount;
                              receiver = operation.destination;
                           }
                        });

                        let cocObj = {
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

                           receiver: receiver,
                           assetCode: assetName,
                           quantity: amount,
                           validTill: maxTime.toLocaleString(),
                           sentDate: minTime.toLocaleString(),
                           sentOriginal: minTime,
                        };
                        cocObj.receiver = accountNames.find(o => cocObj.receiver == o.pk).accountName;
                        this.cocSent.push(cocObj);
                     });
                     this.cocSent.sort((a, b) => (a.sentOriginal < b.sentOriginal ? 1 : -1));
                     this.dissmissLoading();
                  })
                  .catch(err => {
                     this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_FETCH_ACCOUNT_SENT']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_ACCOUNT_SENT']);
                     });
                     this.logger.error('Could not get the account names: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                  });
            } else {
               this.dissmissLoading();
            }
         })
         .catch(err => {
            this.dissmissLoading();
            if (err.status != 400) {
               this.translate.get(['ERROR', 'FAILED_TO_FETCH_SENT']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_SENT']);
               });
            }
            this.logger.error('Could not load CoCs: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
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

   async presentAlert(title, message) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: ['OK'],
      });
      alert.present();
   }
}
