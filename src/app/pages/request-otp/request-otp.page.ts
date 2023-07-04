import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AES, enc } from 'crypto-js';
import { ApiServiceProvider } from 'src/app/providers/api-service/api-service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { KEY } from 'src/app/shared/config';

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

   constructor(private router: Router, private storageService: StorageServiceProvider, private apiService: ApiServiceProvider, public alertCtrl: AlertController) {
      this.bcAccount = this.router.getCurrentNavigation().extras.state.bcAccount;

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

   public async request() {
      let email = this.email;
      await this.storageService.getOTPTimeout().then(async end => {
         console.log('end : ', end);
         if (end) {
            let now = new Date();
            let distance = new Date(end).valueOf() - now.valueOf();
            if (distance < 0) {
               await this.setTimeout();
            }
         } else {
            await this.setTimeout();
         }
      });
      // this.apiService.requestOTP(email,this.#productID).then(res=>{
      //    console.log("result: ",res);
      // })
      this.router.navigate(['/otp-page']);
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
}
