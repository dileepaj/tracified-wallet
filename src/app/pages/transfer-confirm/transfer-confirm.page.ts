import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainServiceProvider } from 'src/app/providers/blockchain-service/blockchain-service';
import { DataServiceProvider } from 'src/app/providers/data-service/data-service';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { Properties } from 'src/app/shared/properties';

@Component({
   selector: 'app-transfer-confirm',
   templateUrl: './transfer-confirm.page.html',
   styleUrls: ['./transfer-confirm.page.scss'],
})
export class TransferConfirmPage implements OnInit {
   public transferAmount;
   public senderPK;
   public receiverPK;
   private senderName;
   private receiverName;
   loading;
   isLoadingPresent: boolean;

   constructor(
      public dataService: DataServiceProvider,
      private translate: TranslateService,
      private logger: LoggerService,
      private blockchainService: BlockchainServiceProvider,
      private properties: Properties,
      public loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private router: Router,
      private route: ActivatedRoute
   ) {
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
         this.transferAmount = navigation.extras.state.transferAmount;
         this.senderPK = navigation.extras.state.senderPK;
         this.receiverPK = navigation.extras.state.receiverPK;
         this.senderName = navigation.extras.state.senderName;
         this.receiverName = navigation.extras.state.receiverName;
      }
   }

   ngOnInit(): void {}

   ionViewDidLoad() {
      console.log('ionViewDidLoad TransferConfirmPage');
   }

   confirm() {
      //v6 plz refactor
      // this.presentLoading();
      console.log('hit 1');

      // SECURITY: Anyone can change the HTML and pass an outside public key as the receiver. Can transfer money out of the tenant.
      this.passwordPrompt()
         .then(password => {
            console.log('hit 2');

            this.blockchainService
               .validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk)
               .then(decKey => {
                  console.log('hit 3');

                  this.blockchainService
                     .checkAccountValidity(this.receiverPK)
                     .then(status => {
                        console.log('hit 4');

                        if (status) {
                           console.log('hit 5');

                           this.blockchainService
                              .transferFunds(decKey, this.receiverPK, this.transferAmount)
                              .then(status => {
                                 console.log('hit 6 miss');

                                 this.dissmissLoading();
                                 this.logger.info('Successfully transferred funds: ' + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.logger.info('[FUND_TRANSFER][RECEIVER] ' + this.receiverPK, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.logger.info('[FUND_TRANSFER][AMOUNT] ' + this.transferAmount, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.presentAlert('Success', 'Successfully transferred ' + this.transferAmount + ' lumens. View account information to see the updated amount.');
                                 this.router.navigate(['/fund-transfer'], { replaceUrl: true });

                                 this.transferAmount = '';
                                 this.receiverPK = '';
                              })
                              .catch(err => {
                                 console.log('hit 7 miss');

                                 this.dissmissLoading();
                                 this.logger.error('Transfer fund transaction submission failed: ' + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.translate.get(['ERROR', 'FAILED_TO_TRANSFER']).subscribe(text => {
                                    this.presentAlert(text['ERROR'], text['FAILED_TO_TRANSFER']);
                                 });
                              });
                        } else {
                           this.blockchainService
                              .transferFundsForNewAccounts(decKey, this.receiverPK, this.transferAmount)
                              .then(() => {
                                 console.log('hit 7 miss');

                                 this.transferAmount = '';
                                 this.receiverPK = '';
                                 this.dissmissLoading();
                                 this.logger.info('Successfully transferred funds: ' + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.logger.info('[FUND_TRANSFER][RECEIVER] ' + this.receiverPK, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.logger.info('[FUND_TRANSFER][AMOUNT] ' + this.transferAmount, this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.translate.get(['SUCCESS', 'SUCCESSFULLY_TRANSFERED', 'VIEW_ACC_INFO']).subscribe(text => {
                                    this.presentAlert(text['SUCCESS'], text['SUCCESSFULLY_TRANSFERED '] + this.transferAmount + text[' VIEW_ACC_INFO']);
                                 });
                                 this.router.navigate(['/fund-transfer'], { replaceUrl: true });
                              })
                              .catch(err => {
                                 console.log('hit 8 miss',err);

                                 this.dissmissLoading();
                                 this.logger.error('Transfer fund transaction submission failed: ' + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
                                 this.translate.get(['ERROR', 'FAILED_TO_TRANSFER']).subscribe(text => {
                                    this.presentAlert(text['ERROR'], text['FAILED_TO_TRANSFER']);
                                 });
                              });
                        }
                     })
                     .catch(err => {
                        console.log('hit 9 miss');

                        this.dissmissLoading();
                        this.translate.get(['ERROR', 'FAILED_TO_IDENTIFY_RECEIVER']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['FAILED_TO_IDENTIFY_RECEIVER']);
                        });
                        this.logger.error('Failed to validate account ID: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                     });
               })
               .catch(err => {
                  console.log('hit 10 miss');
                  this.dissmissLoading();
                  this.translate.get(['ERROR', 'INVALID_TRANSACTION_PASS']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['INVALID_TRANSACTION_PASS']);
                  });
                  this.logger.error('Password validation failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               });
         })
         .catch(err => {
          console.log('hit 11 miss');
            this.dissmissLoading();
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

   cancel() {
      this.router.navigate(['/fund-transfer'], { replaceUrl: true });
   }

   async presentLoading() {
      console.log('present loading');

      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });

      await this.loading.present();
   }

   dissmissLoading() {
      console.log('dismiss loading');
      this.isLoadingPresent = false;
      this.loading?.dismiss();
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