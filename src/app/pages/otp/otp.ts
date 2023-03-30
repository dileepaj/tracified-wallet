import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from 'src/app/providers/connectivity-service/connectivity-service';

@Component({
   selector: 'page-otp',
   templateUrl: 'otp.html',
   styleUrls: ['./otp.scss'],
})
export class OtpPage {
   svgResult: any;
   email = '';
   shopId = '';

   verifyForm = new FormGroup({
      OTP: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.email),
   });

   constructor(
      public toastCtrl: ToastController,
      public router: Router,
      private service: ApiServiceProvider,
      private loadingCtrl: LoadingController,
      private route: ActivatedRoute,
      public connectivity: ConnectivityServiceProvider
   ) {
      const emailParam = this.route.snapshot.queryParamMap.get('email');
      const shopidParam = this.route.snapshot.queryParamMap.get('shopId');

      if (emailParam) {
         this.email = emailParam;
         console.log('params email', this.email);
      }
      if (shopidParam) {
         this.shopId = shopidParam;
         console.log('params shopId', this.shopId);
      }
      if (emailParam && shopidParam) {
         this.connectivity.putMenuHide(true);
      }
   }

   checkOTP() {
      let otp = this.verifyForm.get('OTP').value;
      let mail = this.verifyForm.get('Email').value;
      this.showLoading();
      this.service
         .checkOTP(otp, mail)
         .then(res => {
            console.log(res);
            if (res.body.Status == 200 && res.body.Response.Status == 'Valid') {
               this.dimissLoading();
               this.presentToast('OTP verified.');
               const option: NavigationExtras = {
                  queryParams: {
                     ShopId: this.shopId,
                     otp: otp,
                     mail: mail,
                  },
               };
               this.router.navigate(['/otp-nft'], option);
            }
         })
         .catch(error => {
            let err = error.error;
            console.log(err);

            this.dimissLoading();

            if (err.status && err.message == 'Invalid OTP') {
               this.presentToast('Invalid OTP or Email.');
            } else if (err.status && err.message == 'NFT already Minted') {
               this.presentToast('NFT already Minted.');
            } else {
               this.dimissLoading();
               this.presentToast('Something wrong.');
            }
         });
   }

   async presentToast(msg) {
      const toast = await this.toastCtrl.create({
         message: msg,
         duration: 2500,
         position: 'bottom',
      });
      await toast.present();
   }

   async showLoading() {
      const loading = await this.loadingCtrl.create({
         message: 'Verifying...',
      });
      await loading.present();
   }

   async dimissLoading() {
      await this.loadingCtrl.dismiss();
   }
}
