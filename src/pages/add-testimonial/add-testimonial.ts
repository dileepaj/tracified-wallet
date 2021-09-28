import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Toast, AlertController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the AddTestimonialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-testimonial',
  templateUrl: 'add-testimonial.html',
})
export class AddTestimonialPage {
  form: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams, private translate: TranslateService,) {
    
    this.form = new FormGroup({
      orgName: new FormControl('Saraketha Organics'),
      title: new FormControl(''),
      description: new FormControl(''),
      orgPNo2: new FormControl(''),
    });
 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddTestimonialPage');
  }

}
