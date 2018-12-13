import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, MenuController } from 'ionic-angular';

import { User } from '../../providers';
import { MainPage } from '../';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type

  // Our translated text strings
  private loginErrorString: string;
  form: any;

  constructor(public navCtrl: NavController,
    public menuCtrl: MenuController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService) {
      this.form = new FormGroup({
        username: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
        password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
        // password: new FormControl('', Validators.compose([Validators.maxLength(30), Validators.minLength(8), Validators.pattern('[a-zA-Z ]*'), Validators.required]))
      });

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  ionViewDidLoad() {
    this.menuCtrl.enable(false);
  }
  ionViewWillLeave() {
    this.menuCtrl.enable(true);
  }

  // Attempt to login in through our User service
  doLogin() {
    console.log(this.form.value);
    this.user.login(this.form.value).subscribe((resp) => {
      this.navCtrl.push(MainPage);
    }, (err) => {
      // this.navCtrl.push(MainPage);
      // Unable to log in
      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    });
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  gotoForgotPasswordPage(){
    
  }
}
