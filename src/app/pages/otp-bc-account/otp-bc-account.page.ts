import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { ApiServiceProvider } from 'src/app/providers/api-service/api-service';
import { AuthServiceProvider } from 'src/app/providers/auth-service/auth-service';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { TOAST_TIMER } from 'src/environments/environment';
import { Keypair as StellerKeyPair } from 'stellar-base';
@Component({
   selector: 'app-otp-bc-account',
   templateUrl: './otp-bc-account.page.html',
   styleUrls: ['./otp-bc-account.page.scss'],
})
export class OtpBcAccountPage implements OnInit {
   mnemonic;
   stellarkeyPair: StellerKeyPair;

   bcAccList: any[] = [];

   selectedBcAcc: any;

   toastInstance: any;

   loading: any;
   shopId: any;
   defAccount: any;
   email: any;

   constructor(
      private router: Router,
      private storageService: StorageServiceProvider,
      private seedPhraseSrevice: SeedPhraseService,
      public alertCtrl: AlertController,
      private toastService: ToastController,
      private loadingCtrl: LoadingController,
      private route: ActivatedRoute,
      private authService: AuthServiceProvider,
      private apiService: ApiServiceProvider,
      public toastCtrl: ToastController,
      private navCtrl: NavController
   ) {
      this.shopId = this.route.snapshot.queryParamMap.get('shopId');
      let gemName = this.route.snapshot.queryParamMap.get('gemName');

      let appLinkShopID = this.router.getCurrentNavigation().extras.queryParams?.AppshopId;
      let appGemName = this.router.getCurrentNavigation().extras.queryParams?.AppgemName;

      if (this.shopId && gemName) {
         this.authService.authorizeLocalProfile().then(auth => {
            if (!auth) {
               this.authService.setAppLinkParam(this.shopId, gemName);
               this.router.navigate(['/login'], { replaceUrl: true });
            } else {
               this.storageService.getMnemonic().then(data => {
                  if (data == null) {
                     this.router.navigate(['/create-import-bc-account'], { state: { navigation: 'initial' } });
                  } else {
                     this.authService.setAppLinkParam(null, null);
                  }
               });
            }
         });
      } else if (appLinkShopID && appGemName) {
         this.authService.authorizeLocalProfile().then(auth => {
            if (!auth) {
               this.authService.setAppLinkParam(appLinkShopID, appGemName);
               this.router.navigate(['/login'], { replaceUrl: true });
            } else {
               this.storageService.getMnemonic().then(data => {
                  if (data == null) {
                     this.router.navigate(['/create-import-bc-account'], { state: { navigation: 'initial' } });
                  } else {
                     this.authService.setAppLinkParam(null, null);
                     this.shopId = appLinkShopID;
                  }
               });
            }
         });
      } else {
         this.router.navigate(['tabs'], { replaceUrl: true });
      }
   }

   async ngOnInit() {
      // this.presentLoading();
      this.storageService.profile.key(0).then(d => {
         this.email = d;
      });
      this.mnemonic = await this.storageService.getMnemonic();
      await this.getDefault();
      if (!this.defAccount) {
         this.defAccount = 0;
      }
      let rst = await this.storageService.getAllMnemonicProfiles();
      for (const account of rst) {
         this.stellarkeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, account.value, this.mnemonic) as StellerKeyPair;

         const bcAccount = {
            index: account.value,
            name: account.key,
            publicKey: this.stellarkeyPair.publicKey(),
         };
         this.bcAccList.push(bcAccount);

         if (account.value == this.defAccount) {
            this.selectedBcAcc = bcAccount;
         }
      }
      // this.dissmissLoading();
   }

   /**
    * get default bc account index
    */
   public async getDefault() {
      await this.storageService
         .getDefaultAccount()
         .then(acc => {
            this.defAccount = acc;
         })
         .catch(() => {
            this.defAccount = false;
         });
   }

   async onClickNext() {
      if (this.selectedBcAcc) {
         this.presentLoading();
         const option: NavigationExtras = {
            state: {
               bcAccount: this.selectedBcAcc,
            },
            queryParams: {
               shopId: this.shopId,
            },
         };
         this.apiService
            .checkOTPStatus(this.email, this.shopId)
            .then(async res => {
               this.dissmissLoading();
               console.log('success', res);
               if (res.status == 204) {
                  this.router.navigate(['request-otp'], option);
               } else if (res.status == 200) {
                  //console.log(res.body.Response.Message);
                  //this.router.navigate(['request-otp'], option);
                  this.presentToast(res.body.Response.Message);
                  if (res.body.Response.IsOTPValidated) {
                     const option2: NavigationExtras = {
                        state: {
                           ShopId: this.shopId,
                           otp: '',
                           email: this.email,
                           bcAccount: this.selectedBcAcc,
                        },
                     };
                     this.router.navigate(['/otp-nft'], option2);
                  } else {
                     const option3: NavigationExtras = {
                        queryParams: {
                           shopId: this.shopId,
                           email: this.email,
                        },
                        state: {
                           bcAccount: this.selectedBcAcc,
                        },
                     };
                     this.router.navigate(['/otp-page'], option3);
                  }
               }
            })
            .catch(error => {
               this.dissmissLoading();

               this.presentToast(error.error.message);
               this.navCtrl.navigateRoot('/get-nft');
            });
      } else {
         const toastInstance = await this.toastService.create({
            message: 'Please select a blockchain account!',
            duration: TOAST_TIMER.SHORT_TIMER,
            position: 'bottom',
         });
         await toastInstance.present();
      }
   }

   public selectBcAccount(e) {
      this.selectedBcAcc = e.detail.value;
   }

   async showPublicKey() {
      if (this.selectedBcAcc) {
         let alert = await this.alertCtrl.create({
            message: this.selectedBcAcc.publicKey,
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
   }

   public import() {
      this.router.navigate(['/import-bc-account']);
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });
      this.loading.present();
   }

   async presentToast(msg) {
      const toast = await this.toastCtrl.create({
         message: msg,
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });
      await toast.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }
}
