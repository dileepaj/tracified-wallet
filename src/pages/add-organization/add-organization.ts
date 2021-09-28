import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Toast, AlertController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the AddOrganizationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-organization',
  templateUrl: 'add-organization.html',
})
export class AddOrganizationPage {
  form: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams,  private translate: TranslateService,) {

    this.form = new FormGroup({
      orgName: new FormControl('Org006'),
      orgImage: new FormControl(''),
      orgEmail: new FormControl(''),
      orgPNo: new FormControl(''),
      orgPNo2: new FormControl(''),
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddOrganizationPage');
  }

}
