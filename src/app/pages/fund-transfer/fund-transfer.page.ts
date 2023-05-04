import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainServiceProvider } from 'src/app/providers/blockchain-service/blockchain-service';
import { DataServiceProvider } from 'src/app/providers/data-service/data-service';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { Properties } from 'src/app/shared/properties';

@Component({
   selector: 'app-fund-transfer',
   templateUrl: './fund-transfer.page.html',
   styleUrls: ['./fund-transfer.page.scss'],
})
export class FundTransferPage implements OnInit {
   loading;
   isLoadingPresent: boolean;
   mainAccount: any;
   userAcc;
   transferAmount;
   receiverPK;
   showaccount: Array<any> = [];

   constructor(
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      private blockchainService: BlockchainServiceProvider,
      private properties: Properties,
      public dataService: DataServiceProvider,
      private logger: LoggerService,
      public menuCtrl: MenuController,
      private translate: TranslateService,
      private router: Router
   ) {
      this.mainAccount = this.properties.defaultAccount;
      this.getMainAccounts();
   }
   ngOnInit(): void {}

   ionViewDidLoad() {
      this.logger.info('Fund Transfer Page Load', this.properties.skipConsoleLogs, this.properties.writeToFile);
   }

   async transferFunds() {
      if (this.transferAmount && this.receiverPK) {
         await this.presentLoading();
         this.blockchainService
            .accountBalanceBoth(this.mainAccount.pk)
            .then(async (balances: any) => {
               let minBalance = 1.5 + Number(balances.assetCount) * 0.5;
               let effectiveBalance = Number(balances.balance) - minBalance;
               await this.dissmissLoading();
               if (effectiveBalance < 0) {
                  effectiveBalance = 0;
               }

               if (effectiveBalance < this.transferAmount) {
                  this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['BALANCE_IS '] + effectiveBalance + text[' TRY_AGAIN_VALID_AMOUNT']);
                  });
               } else if (this.transferAmount < 2) {
                  this.translate.get(['ERROR', 'MINIMUM_TRANSFER_AMOUNT']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['MINIMUM_TRANSFER_AMOUNT']);
                  });
               } else {
                  console.log('passing data ', this.transferAmount, this.mainAccount.accountName, this.mainAccount.pk, this.receiverPK, this.receiverPK);
                  this.router.navigate(['/transfer-confirm'], {
                     state: {
                        transferAmount: this.transferAmount,
                        senderName: this.mainAccount.accountName,
                        senderPK: this.mainAccount.pk,
                        receiverPK: this.receiverPK,
                        receiverName: this.receiverPK,
                     },
                  });
               }
            })
            .catch(async err => {
               await this.dissmissLoading();
               this.translate.get(['ERROR', 'FAIL_ACC_BAL']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAIL_ACC_BAL']);
               });
               this.logger.error('Failure in retrieving account balance: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
      } else {
         await this.dissmissLoading();
         this.translate.get(['ERROR', 'FILL_REQUIRED']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['FILL_REQUIRED']);
         });
      }
   }

   getMainAccounts() {
      return new Promise<void>(async (resolve, reject) => {
         await this.presentLoading();
         this.dataService
            .getBlockchainAccounts()
            .then(async accounts => {
               await this.dissmissLoading();

               if (accounts.length < 2) {
                  this.translate.get(['WARNING', 'CANNOT_FIND_ACC']).subscribe(text => {
                     this.goBackAlert(text['WARNING'], text['CANNOT_FIND_ACC']);
                  });
                  return;
               }

               this.userAcc = accounts;
               for (var i = 0; i < Object.keys(this.userAcc).length; i++) {
                  if (this.properties.defaultAccount.accountName != this.userAcc[i].accountName) {
                     this.showaccount.push(this.userAcc[i]);
                     console.log('account type ', typeof this.userAcc[i]);
                  }
               }

               console.log('accounts ', this.showaccount);

               resolve();
            })
            .catch(async error => {
               await this.dissmissLoading();
               this.translate.get(['AUTHENTICATION_FAILED', 'RETRIEVE_ACC_FAILED']).subscribe(text => {
                  this.presentAlert(text['AUTHENTICATION_FAILED'], text['RETRIEVE_ACC_FAILED']);
               });
               this.logger.error('Failure to retrieve blockchain accounts' + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
               reject();
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
                  handler: data => {
                     reject();
                  },
               },
               {
                  text: 'Submit',
                  handler: data => {
                     if (data.password) {
                        resolve(data.password);
                     } else {
                        console.log('Empty Password');
                     }
                  },
               },
            ],
            backdropDismiss: false,
         });
         alert.present();
      });
   }

   getType(val) {
      return typeof val;
   }

   async goBackAlert(title, message) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'Go Back',
               handler: data => {
                  this.router.navigate(['bc-account']);
               },
            },
         ],
         backdropDismiss: false,
      });

      alert.present();
   }

   async presentAlert(title, message) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: ['OK'],
      });
      alert.present();
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }
}
