import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PagesLoadSvgPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pages-load-svg',
  templateUrl: 'pages-load-svg.html',
})
export class PagesLoadSvgPage {
  result: any;
  imageSrc: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.result = this.navParams.get("res")
      console.log("data passed ",this.result)
      this.imageSrc = this.result;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PagesLoadSvgPage');
  }

}
