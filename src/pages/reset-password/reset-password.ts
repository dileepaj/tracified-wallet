import { Component } from '@angular/core';
import { MenuController, NavController, NavParams, Toast, ToastController, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  private username;
  private code;
  private type;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  submitAttempt: boolean = false;
  resetPass: boolean = false;
  loading;
  private toastInstance: Toast;
  resetForm: FormGroup;
  verifyForm: FormGroup;
  forgotform: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public menuCtrl: MenuController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthServiceProvider,
    private connectivity: ConnectivityServiceProvider
  ) {
    console.log(navParams);
    this.username = this.navParams.get('username');
    this.code = this.navParams.get('code');
    this.type = this.navParams.get('type');

    this.verifyForm = new FormGroup({
      email: new FormControl(''),
    });
    this.resetForm = new FormGroup({
      code: new FormControl(''),
      password: new FormControl('', Validators.compose([Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$'), Validators.required])),
    });
    this.forgotform = new FormGroup({
      username: new FormControl({ value: this.username, disabled: true }),
      password: new FormControl('', Validators.compose([Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$'), Validators.required]))
    });
  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false);
  }

  ionViewDidLeave() {
    this.menuCtrl.enable(true);
  }

  resetPassword() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.submitAttempt = true;
      const authmodel = {
        userName: this.username,
        password: this.code,
        newPassword: this.forgotform.value.password
      };
      console.log(authmodel);
      this.authService.validateUser(authmodel).then((res) => {
        this.dissmissLoading();
        console.log(res);
        if (res.status === 200) {          
          this.presentToast('You have successfully changed your password. Please use the new password and log back again.');
          this.navCtrl.setRoot(LoginPage);
        } else {
          this.presentToast('Could not reset the password. Something went wrong.');
        }
      });
    } else {
      this.presentToast('There is no internet at the moment.');
    }
  }

  verifyEmail() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.authService.verifyEmail(this.verifyForm.value.email).then(res => {
        this.dissmissLoading();
        if (res.status === 200) {
          this.resetPass = true;
        } else {
          this.presentToast('Could not verify the email. Something went wrong.');
        }
      }).catch(err => {
        if (err.status === 401) {
          this.dissmissLoading();
          this.presentToast(err.error);
        } else {
          this.dissmissLoading();
          this.presentToast('Ops! Something went wrong.');
        }
      });
    } else {
      this.presentToast('There is no internet at the moment.');
    }
  }

  reset() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.submitAttempt = true;
      this.authService.resetPassword(this.verifyForm.value.email, this.resetForm.value.password, this.resetForm.value.code).then(res => {
        this.dissmissLoading();
        if (res.status === 200) {
          this.presentToast('You have successfully changed your password. Please use the new password and log back again.');
          this.navCtrl.setRoot(LoginPage);
        } else {
          this.presentToast('Could not reset the password. Something went wrong.');
        }
      }).catch(err => {
        if (err.status === 403) {
          this.dissmissLoading();
          this.presentToast(err.error);
        } else {
          this.dissmissLoading();
          this.presentToast('Ops! Something went wrong.');
        }
      });
    } else {
      this.presentToast('There is no internet at the moment.');
    }
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  presentToast(message) {
    if (this.toastInstance) {
      return;
    }
    this.toastInstance = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'middle'
    });
    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = null;
    });
    this.toastInstance.present();
  }

  presentLoading() {
    // this.translate.get(['pleasewait']).subscribe(text => {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Please Wait'
    });
    // });
    this.loading.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }
}
