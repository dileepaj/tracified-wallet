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
   otp: string = 'CKHTMGAs';
   mail: any = 'mithilapanagoda@gmail.com';

   verifyForm = new FormGroup({
      OTP: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.required),
   });

   constructor(public toastCtrl: ToastController, public router: Router, private service: ApiServiceProvider, private loadingCtrl: LoadingController,private route: ActivatedRoute) {
      this.mail = this.route.snapshot.paramMap.get('email');
   }

   checkOTP() {
      this.showLoading();
      this.service.checkOTP(this.otp, this.mail).then(res => {
         if (res.body.Response == 'Valid OTP') {
            this.router.navigate(['/mint-nft'], { queryParams: res });
            this.dimissLoading();
         } else {
            this.presentToast();
            this.dimissLoading();
         }
      });
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
         message: 'Loading...',
      });

      loading.present();
   }

   async dimissLoading() {
      this.loadingCtrl.dismiss();
   }
}
