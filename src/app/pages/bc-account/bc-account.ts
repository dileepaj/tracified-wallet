import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, ToastController, LoadingController, IonModal } from '@ionic/angular';
// import { AddAccountPage } from '../add-account/add-account';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
// import { AccountDetailsPage } from '../../pages/account-details/account-details';
// import { FundTransferPage } from '../../pages/fund-transfer/fund-transfer';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Router } from '@angular/router';
import { TOAST_TIMER } from 'src/environments/environment';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { Keypair as StellerKeyPair } from 'stellar-base';
import { Properties } from 'src/app/shared/properties';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Keypair } from 'stellar-sdk';
import { MappingServiceProvider } from 'src/app/providers/mapping-service/mapping-service';
import { TranslateService } from '@ngx-translate/core';
@Component({
   selector: 'page-bc-account',
   templateUrl: 'bc-account.html',
   styleUrls: ['./bc-account.scss'],
})
export class BcAccountPage implements OnInit {
   @ViewChild(IonModal) modal: IonModal;
   loading;
   userAcc = [];
   isLoadingPresent: boolean;
   passwordType: string = 'password';
   passwordIcon: string = 'eye-off';
   form: FormGroup;
   public account;
   public privateKey: string;
   public keyDecrypted: boolean = false;
   selectedAcc: any;
   modal2Open: boolean = false;

   constructor(
      public router: Router,
      public modalCtrl: ModalController,
      private apiService: ApiServiceProvider,
      private connectivity: ConnectivityServiceProvider,
      public toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      public alertCtrl: AlertController,
      public dataService: DataServiceProvider,
      private storageService: StorageServiceProvider,
      private properties: Properties,
      private translate: TranslateService,
      private mappingService: MappingServiceProvider
   ) {
      this.form = new FormGroup({
         password: new FormControl('', Validators.compose([Validators.required])),
      });
   }
   async ngOnInit() {
      let mnemonic = await this.storageService.getMnemonic();
      let rst = await this.storageService.getAllMnemonicProfiles();
      for (const account of rst) {
         let stellarkeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, account.value, mnemonic) as StellerKeyPair;
         let index = {
            FO: false,
            accountName: account.key,
            pk: stellarkeyPair.publicKey().toString(),
            sk: stellarkeyPair.secret().toString(),
         };
         this.userAcc.push(index);
      }
      console.log('userAcc', this.userAcc);
   }

   ionViewDidEnter() {
      //v6 load rename to enter as load is not getting called : check

      this.getMainAccounts();
   }

   goToAddAccount() {
      this.router.navigate(['add-account/']);
   }

   doRefresh(refresher) {
      this.getMainAccounts();
      refresher.complete();
   }

   getMainAccounts() {
      return new Promise(async (resolve, reject) => {
         await this.presentLoading();
         this.dataService
            .getBlockchainAccounts()
            .then(accounts => {
               this.dissmissLoading();
               this.userAcc.concat(accounts);
               resolve(this.userAcc);
            })
            .catch(error => {
               if (this.isLoadingPresent) {
                  this.dissmissLoading();
               }
               this.userError('Authentication Failed', 'Retrieving blockchain accounts failed.');

               reject();
            });
      });
   }

   async userError(title, message) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'Ok',
               role: 'confirm',
               handler: () => {},
            },
         ],
      });
      await alert.present();
   }

   async presentLoading() {
      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         message: 'Pleaes Wait',
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
         duration: TOAST_TIMER.LONG_TIMER,
         position: 'middle',
      });
      await toast.present();
   }

   viewAccount(account) {
      this.router.navigate(['/account-details'], { state: { account: account } });
   }

   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   async decryptSecretKey(account: any) {
      const password = this.form.get('password').value;
      try {
         const secretKey = await this.mappingService.decryptSecret(account.sk, password);
         const pair = Keypair.fromSecret(secretKey.toString());
         if (pair.publicKey() === account.pk) {
            this.keyDecrypted = true;
            this.privateKey = secretKey.toString();
            await this.modal.dismiss();
            this.modal2Open = true;
         } else {
            const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
         }
      } catch (err) {
         const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
         this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
      }
      this.form.get('password').setValue('');
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

   public onWillDismiss(event: any) {
      console.log('called');
      this.modal2Open = false;
   }
}
