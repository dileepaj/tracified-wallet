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

   verifyForm = new FormGroup({
      OTP: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.email),
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
      await this.showLoading();
      this.service
         .checkOTP(otp, this.email)
         .then(async res => {
            if (res.body.Status == 200 && res.body.Response.Status == 'Valid') {
               await this.dimissLoading();
               this.presentToast('OTP verified.');
               const option: NavigationExtras = {
                  state: {
                     ShopId: res.body.Response.ShopID,
                     otp: otp,
                     email: this.email,
                  },
               };
               this.router.navigate(['/otp-nft'], option);
            }
         })
         .catch(async error => {
            let err = error.error;
            console.log(err);

            await this.dimissLoading();
            this.presentToast(err.message);
         });
   }

   resendOtp() {
      if (this.resendEnabled) {
         let payload = {
            email: this.email,
            productID: this.shopId,
         };
         this.service
            .reSendOtp(payload)
            .then((res: any) => {
               this.resendEnabled = false;
               this.setTimeout();
               this.timer = setInterval(() => {
                  this.showRemaining();
               }, 1000);
               console.log(res);
            })
            .catch(error => {
               console.log(error);
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

      await this.storageService.setOTPTimeout(newDate);
   }

   async showLoading() {
      const loading = await this.loadingCtrl.create({
         message: 'Verifying...',
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
         console.log('EXPIRED!');
         this.resendEnabled = true;
         this.timeoutText = '';

         return;
      }
      var seconds = Math.floor(distance / 1000);

      this.timeoutText = seconds + 's';
   }
}
