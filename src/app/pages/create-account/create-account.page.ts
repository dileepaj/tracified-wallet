import { Component, OnInit } from '@angular/core';

@Component({
   selector: 'app-create-account',
   templateUrl: './create-account.page.html',
   styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   passwordType: string = 'password';
   confPasswordType: string = 'password';
   passwordIcon: string = 'eye-off';
   confPasswordIcon: string = 'eye-off';
   private toastInstance;
   loading;

   private loginErrorString: string;
   form: any;

   constructor() {}
   ngOnInit(): void {
      throw new Error('Method not implemented.');
   }

   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   hideShowConfPassword() {
      this.confPasswordType = this.confPasswordType === 'text' ? 'password' : 'text';
      this.confPasswordIcon = this.confPasswordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }
}
