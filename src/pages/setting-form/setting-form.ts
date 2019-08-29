import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Properties } from '../../shared/properties';
import { Logger } from 'ionic-logger-new';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { SettingsPage } from '../../pages/settings/settings';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { LoginPage } from '../../pages/login/login';

@IonicPage()
@Component({
  selector: 'page-setting-form',
  templateUrl: 'setting-form.html',
})
export class SettingFormPage {

  private displayName: FormGroup;
  private accountPassword: FormGroup;
  private transactionPassword: FormGroup;
  private formType: string;
  private loading: any;
  passwordTypeO: string = 'password';
  passwordTypeN: string = 'password';
  passwordTypeC: string = 'password';
  passwordIconO: string = 'eye-off';
  passwordIconN: string = 'eye-off';
  passwordIconC: string = 'eye-off';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private mappingService: MappingServiceProvider,
    private properties: Properties,
    private logger: Logger,
    private alertCtrl: AlertController,
    private dataService: DataServiceProvider,
    private toastCtrl: ToastController,
    private connectivityService: ConnectivityServiceProvider,
    private loadingCtrl: LoadingController
  ) {
    this.formType = this.navParams.get("type");
    this.prepareForm();
  }

  prepareForm() {
    if (this.formType == "displayName") {
      this.displayName = this.formBuilder.group({
        fName: ['', Validators.required],
        lName: ['', Validators.required]
      });

      let fName = this.navParams.get('fName');
      let lName = this.navParams.get('lName');
      this.displayName.setValue({ fName: fName, lName: lName });
    } else if (this.formType == "accountPassword") {
      this.accountPassword = this.formBuilder.group({
        oPassword: ['', Validators.required],
        nPassword: ['', Validators.required],
        cPassword: ['', Validators.required]
      });
    } else if (this.formType == "transactionPassword") {
      this.transactionPassword = this.formBuilder.group({
        accName: [''],
        pubKey: [''],
        oPassword: ['', Validators.required],
        nPassword: ['', Validators.required],
        cPassword: ['', Validators.required]
      });

      this.transactionPassword.setValue({ accName: this.properties.defaultAccount.accountName, pubKey: this.properties.defaultAccount.pk, oPassword: '', nPassword: '', cPassword: '' });
    }
  }

  changeName() {
    if (this.connectivityService.onDevice) {
      this.presentLoading();
      let fName = this.displayName.get('fName').value;
      let lName = this.displayName.get('lName').value;

      let user = {
        firstName: fName,
        lastName: lName
      };

      this.dataService.changeUserDetails('profile', user).then((res) => {
        if (res.status === 200) {
          this.dissmissLoading();
          this.presentToast("Name successfully changed.");
          this.logger.info("Display name successfully changed.", this.properties.skipConsoleLogs, this.properties.writeToFile);
          this.navCtrl.setRoot(SettingsPage);
        } else {
          this.dissmissLoading();
          this.presentAlert("Error", "Failed to change the account name. Please try again later.");
          this.logger.error("Display name change failed: " + JSON.stringify(res), this.properties.skipConsoleLogs, this.properties.writeToFile);
        }
      }).catch((err) => {
        this.dissmissLoading();
        this.presentAlert("Error", "Cannot change the account name at the moment.");
        this.logger.error("Display name change failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else {
      this.presentAlert("Error", "There is no internet connection at the moment. Please check your device connectivity settings first.");
    }
  }

  changePassword() {
    if (this.connectivityService.onDevice) {
      this.alertWaitResponse("Warning", "Once you change the account password you will be automatically logged out from the application. Do you want to continue?").then(() => {
        this.presentLoading();
        let oPassword = this.accountPassword.get('oPassword').value;
        let cPassword = this.accountPassword.get('cPassword').value;
        let nPassword = this.accountPassword.get('nPassword').value;

        if (cPassword !== nPassword) {
          this.presentAlert("Error", "New password and confirm password do not match.");
          this.dissmissLoading();
          return;
        }

        let password = {
          oldPassword: oPassword,
          newPassword: nPassword
        };

        this.dataService.changeUserDetails('password', password).then((res) => {
          if (res.status === 200) {
            this.dissmissLoading();
            this.presentToast("Password successfully changed.");
            this.logger.info("Password successfully changed.", this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.dataService.clearLocalData();
            this.navCtrl.setRoot(LoginPage);
          } else {
            this.dissmissLoading();
            this.presentAlert("Error", "Failed to change the account password. Please try again later.");
            this.logger.error("Account password change failed: " + JSON.stringify(res), this.properties.skipConsoleLogs, this.properties.writeToFile);
          }
        }).catch((err) => {
          if (err.status == 403) {
            this.dissmissLoading();
            this.presentAlert("Error", err.error);
            this.logger.error("Account password change failed: " + err.error, this.properties.skipConsoleLogs, this.properties.writeToFile);
          } else {
            this.dissmissLoading();
            this.presentAlert("Error", "Cannot change the account password at the moment.");
            this.logger.error("Account password change failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          }
        });
      }).catch(() => { });
    } else {
      this.presentAlert("Error", "There is no internet connection at the moment. Please check your device connectivity settings first.");
    }
  }

  changeTransactionPassword() {
    if (this.connectivityService.onDevice) {
      this.alertWaitResponse("Warning", "Once you change the transaction password you will be automatically logged out from the application. Do you want to continue?").then(() => {
        this.presentLoading();
        let oPassword = this.transactionPassword.get('oPassword').value;
        let cPassword = this.transactionPassword.get('cPassword').value;
        let nPassword = this.transactionPassword.get('nPassword').value;

        if (cPassword !== nPassword) {
          this.presentAlert("Error", "New password and confirm password do not match.");
          this.dissmissLoading();
          return;
        }

        let transactionModel = {
          oldPassword: oPassword,
          newPassword: nPassword,
          publicKey: this.properties.defaultAccount.pk,
          encSecretKey: this.properties.defaultAccount.sk,
          accountName: this.properties.defaultAccount.accountName
        }

        this.dataService.changeTransactionAccPassword(transactionModel).then((res) => {
          if (res.status == 200) {
            this.dissmissLoading();
            this.presentAlert("Successful", "Transaction password successfully changed.");
            this.logger.info("Transaction password changed.", this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.dataService.clearLocalData();
            this.navCtrl.setRoot(LoginPage);
          } else {
            this.dissmissLoading();
            this.presentAlert("Error", "Cannot change the transaction password at the moment.");
            this.logger.info("Account password change failed.", this.properties.skipConsoleLogs, this.properties.writeToFile);
          }
        }).catch((err) => {
          if (err.status == 10) {
            this.dissmissLoading();
            this.presentAlert("Error", err.error);
            this.logger.error("Account password change failed: " + err.error, this.properties.skipConsoleLogs, this.properties.writeToFile);
          } else if (err.status == 11) {
            this.dissmissLoading();
            this.presentAlert("Error", err.error);
            this.logger.error("Account password change failed: " + err.error, this.properties.skipConsoleLogs, this.properties.writeToFile);
          } else {
            this.dissmissLoading();
            this.presentAlert("Error", "Cannot change the transaction password at the moment.");
            this.logger.error("Account password change failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          }
        });
      }).catch(() => { });
    } else {
      this.presentAlert("Error", "There is no internet connection at the moment. Please check your device connectivity settings first.");
    }
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

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Please Wait'
    });
    this.loading.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }

  alertWaitResponse(title, message): Promise<any> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              reject();
            }
          },
          {
            text: 'OK',
            handler: data => {
              resolve();
            }
          }
        ]
      });

      alert.present();
    });
  }

  hideShowPassword(option) {
    if (option == 1) {
      this.passwordTypeO = this.passwordTypeO === 'text' ? 'password' : 'text';
      this.passwordIconO = this.passwordIconO === 'eye-off' ? 'eye' : 'eye-off';
    } else if (option == 2) {
      this.passwordTypeN = this.passwordTypeN === 'text' ? 'password' : 'text';
      this.passwordIconN = this.passwordIconN === 'eye-off' ? 'eye' : 'eye-off';
    } else if (option == 3) {
      this.passwordTypeC = this.passwordTypeC === 'text' ? 'password' : 'text';
      this.passwordIconC = this.passwordIconC === 'eye-off' ? 'eye' : 'eye-off';
    }
  }

}
