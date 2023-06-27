import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
   selector: 'app-request-otp',
   templateUrl: './request-otp.page.html',
   styleUrls: ['./request-otp.page.scss'],
})
export class RequestOtpPage implements OnInit {
   form: FormGroup;

   constructor() {}

   ngOnInit() {}
}
