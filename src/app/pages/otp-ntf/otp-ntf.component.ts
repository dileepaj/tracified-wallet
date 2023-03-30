import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { restrictedCharacters } from 'src/app/shared/validation';

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

   customCounterFormatter(inputLength: number, maxLength: number) {
      return `${maxLength - inputLength} characters remaining`;
   }
   constructor(public toastCtrl: ToastController, public router: Router, private service: ApiServiceProvider, private loadingCtrl: LoadingController, private route: ActivatedRoute) {
      this.shopId = this.router.getCurrentNavigation().extras.queryParams.ShopId;
      this.email = this.router.getCurrentNavigation().extras.queryParams.ShopId;
      this.otp = this.router.getCurrentNavigation().extras.queryParams.ShopId;
   }

   nftForm = new FormGroup({
      nftName: new FormControl('Mithila', [Validators.required, restrictedCharacters]),
      recipName: new FormControl('anne', Validators.required),
      message: new FormControl('test', Validators.required),
      agreeTick: new FormControl('false', Validators.requiredTrue),
   });

   sendDetails() {
      this.showLoading();
      const option: NavigationExtras = {
         queryParams: {
            email: this.email,
            ShopId: this.shopId,
            ReciverName: this.nftForm.get('recipName').value,
            CustomMsg: this.nftForm.get('message').value,
            NFTname: this.nftForm.get('nftName').value,
         },
      };
      console.log(option.queryParams);
      this.service.updateSVG(option.queryParams).then(
         res => {
            console.log(res.body.Response);
            const option: NavigationExtras = {
               queryParams: {
                  ShopId: this.shopId,
                  result: res.body.Response,
                  NFTname: this.nftForm.get('nftName').value,
               },
            };
            this.dimissLoading();
            this.router.navigate(['/mint-nft'], option);
         },
         error => {
            this.presentToast('Something wrong.');
            this.dimissLoading();
            console.log(error);
         }
      );
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
