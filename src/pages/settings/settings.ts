import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { SettingFormPage } from '../../pages/setting-form/setting-form';
import { Properties } from '../../shared/properties';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private properties: Properties,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {
  }

  changeDisplayImage() {
    this.presentAlert("Profile Photo", "Changing profile photo is currently unavailable. Please try again later.");
  }

  changeDisplayName() {
    this.navCtrl.push(SettingFormPage, { type: 'displayName', fName: this.properties.firstName, lName: this.properties.lastName });
  }

  changePassword() {
    this.navCtrl.push(SettingFormPage, { type: 'accountPassword' });
  }

  changeTransactionPasswords() {
    this.navCtrl.push(SettingFormPage, { type: 'transactionPassword' });
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



}
