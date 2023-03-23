import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras } from '@angular/router';

@Component({
   selector: 'page-otp',
   templateUrl: 'otp.html',
   styleUrls: ['./otp.scss'],
})
export class OtpPage {
   otp: string = '';
   mail: any = 'mithilapanagoda@gmail.com';

   constructor(public navCtrl: NavController, public router: Router, private service: ApiServiceProvider) {}

   checkOTP() {
      this.router.navigate(['/mint-nft']);
      // if (this.otp != null) {
      //    this.service.checkOTP(this.otp, 'mithilapanagoda@gmail.com').then(res => {
      //       console.log('result is: ', res);
      //       if (res.statusText != 'OK') {
      //          const options: NavigationExtras = {
      //             state: {
      //                res: res,
      //             },
      //          };
      //          this.router.navigate(['/mint-nft'], options);
      //       } else {
      //          alert('The OTP has either expired or is invalid');
      //       }
      //    });
      // }
   }

   ionViewDidLoad() {
      console.log('ionViewDidLoad OtpPage');
   }
}
