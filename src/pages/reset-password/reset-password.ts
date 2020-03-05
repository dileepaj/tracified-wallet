import { Component } from '@angular/core';
import { MenuController, NavController, NavParams, Toast, ToastController, LoadingController,  AlertController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { LoginPage } from '../login/login';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  private username;
  private code;
  private type;
  passwordTypeN: string = 'password';
  passwordTypeC: string = 'password';
  passwordIconO: string = 'eye-off';
  passwordIconN: string = 'eye-off';
  passwordIconC: string = 'eye-off';
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
    private connectivity: ConnectivityServiceProvider,
    private alertCtrl: AlertController,
    private translate: TranslateService
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
      nPassword: new FormControl('', Validators.compose([Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$'), Validators.required])),
      cPassword: new FormControl('', Validators.compose([Validators.pattern('^(?=.{8,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$'), Validators.required])),
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
          this.translate.get(['SUCCESS_CHANGED_PASSWORD']).subscribe(text => {
            this.presentToast(text['SUCCESS_CHANGED_PASSWORD']);
          });
          this.navCtrl.setRoot(LoginPage);
        } else {
          this.translate.get(['COULD_NOT_RESET']).subscribe(text => {
            this.presentToast(text['COULD_NOT_RESET']);
          });
        }
      });
    } else {
      this.translate.get(['NO_INTERNET_MOMENT']).subscribe(text => {
        this.presentToast(text['NO_INTERNET_MOMENT']);
      });
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
          this.translate.get(['COULD_NOT_VERIFY']).subscribe(text => {
            this.presentToast(text['COULD_NOT_VERIFY']);
          });
        }
      }).catch(err => {
        if (err.status === 401) {
          this.dissmissLoading();
          this.presentToast(err.error);
        } else {
          this.dissmissLoading();
          this.translate.get(['OPS_SOMETHING_WENT_WRONG']).subscribe(text => {
            this.presentToast(text['OPS_SOMETHING_WENT_WRONG']);
          });
        }
      });
    } else {
      this.translate.get(['NO_INTERNET_MOMENT']).subscribe(text => {
        this.presentToast(text['NO_INTERNET_MOMENT']);
      });
    }
  }

  reset() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.submitAttempt = true;
      let cPassword = this.resetForm.get('cPassword').value;
      let nPassword = this.resetForm.get('nPassword').value;

      if (cPassword !== nPassword) {
        this.translate.get(['ERROR', 'PASSWORDS_DONOT_MATCH']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['PASSWORDS_DONOT_MATCH']);
        });
        this.dissmissLoading();
        return;
      }

      this.authService.resetPassword(this.verifyForm.value.email, this.resetForm.value.nPassword , this.resetForm.value.code).then(res => {
        this.dissmissLoading();
        if (res.status === 200) {
          this.translate.get(['SUCCESS_CHANGED_PASSWORD']).subscribe(text => {
            this.presentToast(text['SUCCESS_CHANGED_PASSWORD']);
          });
          this.navCtrl.setRoot(LoginPage);
        } else {
          this.translate.get(['COULD_NOT_RESET']).subscribe(text => {
            this.presentToast(text['COULD_NOT_RESET']);
          });
        }
      }).catch(err => {
        if (err.status === 403) {
          this.dissmissLoading();
          this.presentToast(err.error);
        } else {
          this.dissmissLoading();
          this.translate.get(['OPS_SOMETHING_WENT_WRONG']).subscribe(text => {
            this.presentToast(text['OPS_SOMETHING_WENT_WRONG']);
          });
        }
      });
    } else {
      this.translate.get(['NO_INTERNET_MOMENT']).subscribe(text => {
        this.presentToast(text['NO_INTERNET_MOMENT']);
      });
    }
  }

  hideShowPassword(option) {
    if (option == 1) {
      this.passwordTypeN = this.passwordTypeN === 'text' ? 'password' : 'text';
      this.passwordIconN = this.passwordIconN === 'eye-off' ? 'eye' : 'eye-off';
    } else if (option == 2) {
      this.passwordTypeC = this.passwordTypeC === 'text' ? 'password' : 'text';
      this.passwordIconC = this.passwordIconC === 'eye-off' ? 'eye' : 'eye-off';
    }
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

  presentAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });

    alert.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }
}
