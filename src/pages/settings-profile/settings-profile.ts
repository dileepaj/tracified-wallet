import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Properties } from '../../shared/properties';
import { FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';


/**
 * Generated class for the SettingsProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings-profile',
  templateUrl: 'settings-profile.html',
})
export class SettingsProfilePage {

  fullName:any= {};
  passwordForm: FormGroup;
  public usermodel = {
    username: this.properties.userName,
    displayName: this.properties.displayName,
    displayImage: 'none'
  };

  public passwordModel = {
    username: this.properties.userName,
    oldPassword: '',
    newPassword: '',
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private properties: Properties) {
    this.fullName.content= properties.displayName;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsProfilePage');
  }

  changePassword(){
    this.passwordModel.oldPassword = this.passwordForm.value.currentPassword;
    this.passwordModel.newPassword = this.passwordForm.value.newPassword;
  }

}
