import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AES } from 'crypto-js';
import { IonicSelectableComponent } from 'ionic-selectable';
import { PhoneNumberService } from 'src/app/providers/phone-number-service/phone-number.service';
import { UserSignUp } from 'src/app/providers/user/userSignup';
import { KEY } from 'src/app/shared/config';
import { USER_SETTING } from 'src/environments/environment';
import { COUNTRIES } from 'src/assets/countries-json';
const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
   country: any;
   countries: any;
   countryCode: string;

   constructor(
      private loadingCtrl: LoadingController,
      private userSignupService: UserSignUp,
      private phoneNumberService: PhoneNumberService,
      private toastService: ToastController,
      private router: Router
   ) {
      this.form = new FormGroup({
         username: new FormControl('', Validators.compose([Validators.required, Validators.email, Validators.pattern(emailRegex)])),
         firstname: new FormControl('', Validators.compose([Validators.required])),
         lastname: new FormControl('', Validators.compose([Validators.required])),
         country: new FormControl('', Validators.compose([Validators.required])),
         phoneno: new FormControl(
            '',
            Validators.compose([Validators.required, Validators.pattern('(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})')])
         ),
      });

      this.countries = [];
      Object.keys(COUNTRIES).map(k => {
         this.countries.push({ name: k, code: COUNTRIES[k] });
      });
   }
   ngOnInit(): void {
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

      this.userSignupService.registerUser(this.newUser).subscribe({
         next: () => {
            this.dimissLoading();
            this.showToast('Successful');
            this.router.navigate(['login'], { state: { navigation: 'initial' } });
         },
         error: (err: any) => {
            this.dimissLoading();
            if ((err.error = 'User already exist')) {
               this.showToast('An user account already exists for this email');
            } else {
               this.showToast(err.error);
            }
         },
      });
   }

   public async checkMobile() {
      this.showLoading();
      let mobile = this.form.get('phoneno').value;

      if (this.form.controls['phoneno'].valid) {
         this.phoneNumberService.validatePhoneNumber(mobile).subscribe({
            next: () => {
               this.dimissLoading();
               this.showToast('Phone number already exists');
            },
            error: (err: any) => {
               if (err.status == 403) {
                  this.userSignUp();
               } else {
                  this.dimissLoading();
                  this.showToast('An error occurred please try again');
               }
            },
         });
      } else {
         this.dimissLoading();
         this.showToast('Invalid phone number please try again');
      }
   }

   public async showToast(message: string) {
      this.toastInstance = await this.toastService.create({
         message,
         duration: 2000,
         position: 'bottom',
      });
      await this.toastInstance.present();
   }

   countryChange(event: { component: IonicSelectableComponent; value: any }) {
      this.countryCode = event.value.code;

      this.form.controls['phoneno'].setValue(this.countryCode);
   }

   async showLoading() {
      const loading = await this.loadingCtrl.create({
         message: 'Please Wait',
      });
      await loading.present();
   }

   async dimissLoading() {
      await this.loadingCtrl?.dismiss();
   }
}
