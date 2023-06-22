import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AES } from 'crypto-js';
import { UserSignUp } from 'src/app/providers/user/userSignup';
import { KEY } from 'src/app/shared/config';
import { USER_SETTING } from 'src/app/shared/userSignUpSetting';

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
   newUser:any;
   user: any;

   constructor(
      private userSignupService:UserSignUp
   ) {
      this.form = new FormGroup({
         username: new FormControl('', Validators.compose([Validators.required])),
         yourname: new FormControl('', Validators.compose([Validators.required])),
         password: new FormControl('', Validators.compose([Validators.required])),
         confpassword: new FormControl('', Validators.compose([Validators.required])),
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

   public userSignUp(){
      let username = this.form.get("username").value;
      let name = this.form.get("yourname").value;
      let confirmPwd = this.form.get("confpassword").value
      this.user={
         firstName:name,
         lastName:"test",
         email:AES.encrypt(username,KEY).toString(),
         tenantId:USER_SETTING.TENANT_ID,
         mobileNo:"+940718855421",
         permissions:USER_SETTING.PERMISSION,
         stages:USER_SETTING.STAGES,
         username:AES.encrypt(username,KEY).toString(),
         type:USER_SETTING.TYPE,
         stagePermission:USER_SETTING.STAGE_PERMISSION
      }

      this.newUser={
         user:this.user
      }
      console.log(this.newUser)
      this.userSignupService.registerUser(this.newUser).subscribe((res)=>{
         console.log("Result : ",res)
      })
   }
}
