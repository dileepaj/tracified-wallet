import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { restrictedCharacters } from 'src/app/shared/validation';
import { TOAST_TIMER } from 'src/environments/environment';

@Component({
   selector: 'app-otp-ntf',
   templateUrl: './otp-ntf.component.html',
   styleUrls: ['./otp-ntf.component.scss'],
})
export class OtpNtfComponent {
   result;
   email;
   otp;
   shopId;
   bcAccount: any;

   customCounterFormatter(inputLength: number, maxLength: number) {
      return `${maxLength - inputLength} characters remaining`;
   }
   constructor(public toastCtrl: ToastController, public router: Router, private service: ApiServiceProvider, private loadingCtrl: LoadingController, private route: ActivatedRoute) {
      this.shopId = this.router.getCurrentNavigation().extras.state.ShopId;
      this.email = this.router.getCurrentNavigation().extras.state.email;
      this.otp = this.router.getCurrentNavigation().extras.state.otp;
      this.bcAccount = this.router.getCurrentNavigation().extras.state.bcAccount;
   }

   nftForm = new FormGroup({
      nftName: new FormControl('', [Validators.required, restrictedCharacters]),
      recipName: new FormControl('', Validators.required),
      message: new FormControl('', Validators.required),
      agreeTick: new FormControl('false', Validators.requiredTrue),
   });

   sendDetails() {
      const option: NavigationExtras = {
         state: {
            email: this.email,
            ShopId: this.shopId,
            ReciverName: this.nftForm.get('recipName').value,
            CustomMsg: this.nftForm.get('message').value,
            NFTname: this.nftForm.get('nftName').value,

            otp: this.otp,
            bcAccount: this.bcAccount,
         },
         replaceUrl: true,
      };
      this.router.navigate(['/mint-nft'], option);
   }

   onKeyPress(event: KeyboardEvent) {
      const pattern = /^[a-zA-Z0-9]*$/;
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
         event.preventDefault();
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
}
