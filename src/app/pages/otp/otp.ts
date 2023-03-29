import { Component } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';

@Component({
   selector: 'page-otp',
   templateUrl: 'otp.html',
   styleUrls: ['./otp.scss'],
})
export class OtpPage {
   otpForm: boolean = true;
   svgResult: any;
   email = '';
   customCounterFormatter(inputLength: number, maxLength: number) {
      return `${maxLength - inputLength} characters remaining`;
   }
   verifyForm = new FormGroup({
      OTP: new FormControl('CKHTMGA', Validators.required),
      Email: new FormControl('mithilapanagoda@gmail.com', Validators.required),
   });

   nftForm = new FormGroup({
      nftName: new FormControl('', Validators.required),
      recipName: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
      agreeTick: new FormControl('false', Validators.requiredTrue),
   });

   constructor(public toastCtrl: ToastController, public router: Router, private service: ApiServiceProvider, private loadingCtrl: LoadingController, private route: ActivatedRoute) {
      const emailParam = this.route.snapshot.queryParamMap.get('email');
      const shopidParam = this.route.snapshot.queryParamMap.get('shopId');

      if (emailParam) {
         this.email = emailParam;
      }
   }

   checkOTP() {
      let otp = this.verifyForm.get('OTP').value;
      let mail = this.verifyForm.get('Email').value;
      this.showLoading();
      this.service.checkOTP(otp, mail).then(res => {
         console.log(res);
         this.svgResult = res;
         if (res.body.Response) {
            this.otpForm = false;
            // this.router.navigate(['/mint-nft'], { queryParams: res });
            this.dimissLoading();
         } else {
            this.presentToast();
            this.dimissLoading();
         }
      });
   }

   sendDetails() {
      const option: NavigationExtras = {
         queryParams: {
            svg: this.svgResult,
            nftName: this.nftForm.get('nftName').value,
            recipName: this.nftForm.get('recipName').value,
            message: this.nftForm.get('message').value,
         },
      };
   }

   async presentToast() {
      const toast = await this.toastCtrl.create({
         message: 'The OTP has either expired or is invalid',
         duration: 2500,
         position: 'bottom',
      });
      await toast.present();
   }

   async showLoading() {
      const loading = await this.loadingCtrl.create({
         message: 'Verifying...',
      });
      loading.present();
   }

   async dimissLoading() {
      this.loadingCtrl.dismiss();
   }
}
