import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainServiceProvider } from 'src/app/providers/blockchain-service/blockchain-service';
import { DataServiceProvider } from 'src/app/providers/data-service/data-service';
import { MappingServiceProvider } from 'src/app/providers/mapping-service/mapping-service';
import { Properties } from 'src/app/shared/properties';
import { Keypair } from 'stellar-sdk';

@Component({
   selector: 'app-account-details',
   templateUrl: './account-details.page.html',
   styleUrls: ['./account-details.page.scss'],
})
export class AccountDetailsPage implements OnInit {
   public account;
   public privateKey: string;
   public keyDecrypted: boolean = false;
   public notDefaultAccount: boolean = true;
   public accountFunds: string = 'Calculating...';

   constructor(
      private alertCtrl: AlertController,
      private mappingService: MappingServiceProvider,
      private properties: Properties,
      private dataService: DataServiceProvider,
      private translate: TranslateService,
      private blockchainService: BlockchainServiceProvider,
      private router: Router
   ) {
      this.initAccount();
   }

   ngOnInit() {}

   async initAccount() {
      this.account = this.router.getCurrentNavigation()?.extras.state?.account;
      this.defaultAccountCheck();
      try {
         const balance = await this.blockchainService.accountBalance(this.account.pk);
         this.accountFunds = balance.toString();
      } catch (err) {
         this.accountFunds = '0';
      }
   }

   async decryptSecretKey() {
      const password = await this.transactionPasswordPopUp();
      try {
         const secretKey = await this.mappingService.decryptSecret(this.account.sk, password);
         const pair = Keypair.fromSecret(secretKey.toString());
         if (pair.publicKey() === this.account.pk) {
            this.keyDecrypted = true;
            this.privateKey = secretKey.toString();
         } else {
            const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
         }
      } catch (err) {
         const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
         this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
      }
   }

   encryptSecretKey() {
      this.keyDecrypted = false;
      this.privateKey = '';
   }

   ionViewDidLeave() {
      this.keyDecrypted = false;
      this.privateKey = '';
   }

   async transactionPasswordPopUp(): Promise<string> {
      let resolveFunction: (password: string) => void;

      let promise = new Promise<string>(resolve => {
         resolveFunction = resolve;
      });

      let popup = await this.alertCtrl.create({
         header: 'Transaction Password',
         inputs: [
            {
               name: 'password',
               placeholder: 'Password',
               type: 'password',
            },
         ],
         buttons: [
            {
               text: 'Cancel',
               role: 'cancel',
               handler: data => {
                  // Cancel action
               },
            },
            {
               text: 'OK',
               handler: data => {
                  if (data.password) {
                     resolveFunction(data.password);
                  }
               },
            },
         ],
      });
      popup.present();
      return promise;
   }

   defaultAccountCheck() {
      if (this.account.pk != this.properties.defaultAccount.pk) {
         this.notDefaultAccount = true;
      } else {
         this.notDefaultAccount = false;
      }
   }

   async makeDefaultAccount() {
      let alert = await this.alertCtrl.create({
         header: 'Default Account',
         message: 'Are you sure you want to make this account the default account?',
         buttons: [
            {
               text: 'No',
               role: 'cancel',
               handler: data => {},
            },
            {
               text: 'Yes',
               handler: data => {
                  this.properties.defaultAccount = this.account;
                  this.dataService.setDefaultAccount(this.account);
                  this.defaultAccountCheck();
               },
            },
         ],
      });

      alert.present();
   }

   async presentAlert(title: string, message: string) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => {},
            },
         ],
      });

      alert.present();
   }

   backButton() {
      this.router.navigateByUrl('/bc-account', { replaceUrl: true });
   }
}
