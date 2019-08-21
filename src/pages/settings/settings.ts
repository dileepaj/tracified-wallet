import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingFormPage } from '../../pages/setting-form/setting-form';
import { Properties } from '../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private properties: Properties
  ) {
  }

  changeDisplayImage() {

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

}
