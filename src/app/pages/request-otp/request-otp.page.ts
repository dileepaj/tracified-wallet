import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AES, enc } from 'crypto-js';
import { ApiServiceProvider } from 'src/app/providers/api-service/api-service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { KEY } from 'src/app/shared/config';
import { TOAST_TIMER } from 'src/environments/environment';

@Component({
   selector: 'app-request-otp',
   templateUrl: './request-otp.page.html',
   styleUrls: ['./request-otp.page.scss'],
})
export class RequestOtpPage implements OnInit {
   form: FormGroup;
   #productID: any;

   email: string;
   bcAccount: any;
   bcPkStr: string;
   shopId: string;
   loading: any;

   constructor(
      private router: Router,
      private loadingCtrl: LoadingController,
      private storageService: StorageServiceProvider,
      private apiService: ApiServiceProvider,
      public alertCtrl: AlertController,
      public toastCtrl: ToastController
   ) {
      this.bcAccount = this.router.getCurrentNavigation().extras.state.bcAccount;
      this.shopId = this.router.getCurrentNavigation().extras.queryParams.shopId;

      this.bcPkStr = `${this.bcAccount.name} (${this.bcAccount.publicKey.substring(0, 4)}...${this.bcAccount.publicKey.substring(
         this.bcAccount.publicKey.length - 4,
         this.bcAccount.publicKey.length
      )})`;
   }

   ngOnInit() {
      /* this.storageService.getLocalProfile().then(res => {
         let email = this.email;
         email = AES.decrypt(res, KEY).toString(enc.Utf8);
         console.log('logged in user email : ', email);
      }); */

      this.storageService.profile.key(0).then(d => {
         this.email = d;
      });
   }

   public request() {
      this.storageService.getOTPTimeout().then(async end => {
         if (end) {
            let now = new Date();
            let distance = new Date(end).valueOf() - now.valueOf();
            if (distance < 0) {
               this.requestOtp();
            } else {
               const option: NavigationExtras = {
                  queryParams: {
                     shopId: this.shopId,
                     email: this.email,
                  },
               };
               this.router.navigate(['/otp-page'], option);
            }
         } else {
            this.requestOtp();
         }
      });
   }

   public requestOtp() {
      this.presentLoading();
      this.apiService
         .requestOTP(this.email, this.shopId)
         .then(async res => {
            await this.setTimeout();
            const option: NavigationExtras = {
               queryParams: {
                  shopId: this.shopId,
                  email: this.email,
               },
            };
            this.dissmissLoading();
            this.router.navigate(['/otp-page'], option);
         })
         .catch(async error => {
            console.log(error);
            this.dissmissLoading();
            if (error.error.message === 'OTP already validated' || error.error.message === 'OTP for this email already exists') {
               this.router.navigate(['/otp-page']);
            }
            this.presentToast(error.error.message);
         });
   }

   public async setTimeout() {
      //add time difference
      let newTime = new Date().getTime() + 1000 * 60 * 2;

      let newDate = new Date(newTime);

      await this.storageService.setOTPTimeout(newDate);
   }

   async showPublicKey() {
      if (this.bcAccount) {
         let alert = await this.alertCtrl.create({
            message: this.bcAccount.publicKey,
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

   async presentToast(msg) {
      const toast = await this.toastCtrl.create({
         message: msg,
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });
      await toast.present();
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });
      this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }
}
