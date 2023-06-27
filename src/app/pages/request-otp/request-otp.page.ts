import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';

@Component({
   selector: 'app-request-otp',
   templateUrl: './request-otp.page.html',
   styleUrls: ['./request-otp.page.scss'],
})
export class RequestOtpPage implements OnInit {
   form: FormGroup;

   constructor(private router: Router, private storageService: StorageServiceProvider) {
      this.form = new FormGroup({
         bcAccount: new FormControl('', Validators.required),
         email: new FormControl('', Validators.email),
      });
   }

   ngOnInit() {}

   public async request() {
      await this.storageService.getOTPTimeout().then(async end => {
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
      this.router.navigate(['/otp-page']);
   }

   public async setTimeout() {
      //add time difference
      let newTime = new Date().getTime() + 1000 * 60 * 2;

      let newDate = new Date(newTime);

      await this.storageService.setOTPTimeout(newDate);
   }
}
