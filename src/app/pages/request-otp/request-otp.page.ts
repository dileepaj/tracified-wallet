import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
   #productID:any;
   constructor(private router: Router, private storageService: StorageServiceProvider,private apiService : ApiServiceProvider) {
      this.form = new FormGroup({
         bcAccount: new FormControl('', Validators.required),
         email: new FormControl('', Validators.email),
      });
   }

   ngOnInit() {
      this.storageService.getLocalProfile().then(res=>{
         let email = this.form.get("email").value;
         email = AES.decrypt(res, KEY).toString(enc.Utf8);
         console.log("logged in user email : ",email)
      })
   }

   public async request() {
      let email = this.form.get("email").value
      await this.storageService.getOTPTimeout().then(async end => {
         console.log("end : ",end)
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
}
