import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from 'src/app/providers/connectivity-service/connectivity-service';
import { TOAST_TIMER } from 'src/environments/environment';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';

@Component({
   selector: 'page-otp',
   templateUrl: 'otp.html',
   styleUrls: ['./otp.scss'],
})
export class OtpPage {
   svgResult: any;
   email = '';
   shopId = '';
   otpEndTime: Date;
   timer: any;
   timeoutText: string = '';
   resendEnabled: boolean = false;
   bcAccount: any;

   verifyForm = new FormGroup({
      OTP: new FormControl('', Validators.required),
   });

   constructor(
      public toastCtrl: ToastController,
      public router: Router,
      private service: ApiServiceProvider,
      private loadingCtrl: LoadingController,
      public connectivity: ConnectivityServiceProvider,
      private storageService: StorageServiceProvider
   ) {
      this.email = this.router.getCurrentNavigation().extras.queryParams.email;
      this.shopId = this.router.getCurrentNavigation().extras.queryParams.shopId;
      this.bcAccount = this.router.getCurrentNavigation().extras.state.bcAccount;

      //this.storageService.clearOTPTimeout();

      this.storageService.getOTPTimeout().then(end => {
         this.otpEndTime = new Date(end);
         this.showRemaining();
         this.timer = setInterval(() => {
            this.showRemaining();
         }, 1000);
      });
   }

   async checkOTP() {
      let otp = this.verifyForm.get('OTP').value;
      await this.showLoading('Verifying...');
      this.service
         .checkOTP(otp, this.email)
         .then(async res => {
            if (res.body.Status == 200 && res.body.Response.Status == 'Valid') {
               await this.dimissLoading();
               this.presentToast('OTP verified.');
               await this.storageService.clearOTPTimeout();
               const option: NavigationExtras = {
                  state: {
                     ShopId: res.body.Response.ShopID,
                     otp: otp,
                     email: this.email,
                     bcAccount: this.bcAccount,
                  },
               };
               this.router.navigate(['/otp-nft'], option);
            }
         })
         .catch(async error => {
            let err = error.error;

            await this.dimissLoading();

            if (err.message === 'NFT already minted') {
               this.presentToast(err.message);
               this.router.navigate(['/get-nft'], { replaceUrl: true });
            } else if (err.message === 'OTP already validated' || err.message === 'OTP for this email already exists') {
               const option: NavigationExtras = {
                  state: {
                     ShopId: this.shopId,
                     otp: otp,
                     email: this.email,
                     bcAccount: this.bcAccount,
                  },
               };
               this.router.navigate(['/otp-nft'], option);
            }
         });
   }

   async resendOtp() {
      if (this.resendEnabled) {
         this.showLoading('Please Wait');
         let payload = {
            email: this.email,
            productID: this.shopId,
         };
         this.service
            .reSendOtp(payload)
            .then(async (res: any) => {
               this.resendEnabled = false;
               await this.setTimeout();
               this.timer = setInterval(() => {
                  this.showRemaining();
               }, 1000);
               this.dimissLoading();
            })
            .catch(async error => {
               this.dimissLoading();
               this.presentToast('An error occurred please try again');
            });
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

   public async setTimeout() {
      //add time difference
      let newTime = new Date().getTime() + 1000 * 60 * 2;

      let newDate = new Date(newTime);

      this.otpEndTime = newDate;

      await this.storageService.setOTPTimeout(newDate);
   }

   async showLoading(msg: string) {
      const loading = await this.loadingCtrl.create({
         message: msg,
      });
      await loading.present();
   }

   async dimissLoading() {
      await this.loadingCtrl?.dismiss();
   }

   public showRemaining() {
      let now = new Date();
      let distance = this.otpEndTime.valueOf() - now.valueOf();
      if (distance < 0) {
         clearInterval(this.timer);
         this.resendEnabled = true;
         this.timeoutText = '';

         return;
      }
      var seconds = Math.floor(distance / 1000);

      this.timeoutText = seconds + 's';
   }
}
