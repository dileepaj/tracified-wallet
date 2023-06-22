import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AES } from 'crypto-js';
import { PhoneNumberService } from 'src/app/providers/phone-number-service/phone-number.service';
import { UserSignUp } from 'src/app/providers/user/userSignup';
import { KEY } from 'src/app/shared/config';
import { USER_SETTING } from 'src/app/shared/userSignUpSetting';
import { COUNTRIES } from 'src/assets/countries-json';

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
   form: FormGroup;
   newUser: any;
   user: any;
   countries: any;
   countryCode: string;

   constructor(private userSignupService: UserSignUp, private phoneNumberService: PhoneNumberService, private toastService: ToastController) {
      this.form = new FormGroup({
         username: new FormControl('', Validators.compose([Validators.required])),
         firstname: new FormControl('', Validators.compose([Validators.required])),
         lastname: new FormControl('', Validators.compose([Validators.required])),
         country: new FormControl('', Validators.compose([Validators.required])),
         phoneno: new FormControl('', Validators.compose([Validators.required])),
      });
   }
   ngOnInit(): void {
      this.countries = COUNTRIES;
      // throw new Error('Method not implemented.');
   }

   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   hideShowConfPassword() {
      this.confPasswordType = this.confPasswordType === 'text' ? 'password' : 'text';
      this.confPasswordIcon = this.confPasswordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   public userSignUp() {
      let username = this.form.get('username').value;
      let firstName = this.form.get('firstname').value;
      let lastName = this.form.get('lastname').value;
      let mobile = this.form.get('phoneno').value;
      this.user = {
         firstName,
         lastName,
         email: AES.encrypt(username, KEY).toString(),
         tenantId: USER_SETTING.TENANT_ID,
         mobileNo: mobile,
         permissions: USER_SETTING.PERMISSION,
         stages: USER_SETTING.STAGES,
         username: AES.encrypt(username, KEY).toString(),
         type: USER_SETTING.TYPE,
         stagePermission: USER_SETTING.STAGE_PERMISSION,
      };

      this.newUser = {
         user: this.user,
      };
      console.log(this.newUser);
      this.userSignupService.registerUser(this.newUser).subscribe(res => {
         console.log('Result : ', res);
      });
   }

   public async checkMobile() {
      let mobile = this.form.get('phoneno').value;
      console.log(mobile);
      this.phoneNumberService.validatePhoneNumber(mobile).subscribe({
         next: () => {
            this.showToast('Phone number already exists');
         },
         error: (err: any) => {
            if (err.status == 403) {
               this.userSignUp();
            } else {
               this.showToast('An error occurred please try again');
            }
         },
      });
   }

   public selectCountry(event: any) {
      console.log(event.detail.value);
      this.countryCode = event.detail.value;

      this.form.controls['phoneno'].setValue(this.countryCode);
   }

   public async showToast(message: string) {
      this.toastInstance = await this.toastService.create({
         message,
         duration: 2000,
         position: 'bottom',
      });
      await this.toastInstance.present();
   }
}
