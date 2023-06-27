import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
   selector: 'app-otp-bc-account',
   templateUrl: './otp-bc-account.page.html',
   styleUrls: ['./otp-bc-account.page.scss'],
})
export class OtpBcAccountPage implements OnInit {
   constructor(private router: Router) {}

   ngOnInit() {}

   onClickNext() {
      this.router.navigate(['request-otp']);
   }
}
