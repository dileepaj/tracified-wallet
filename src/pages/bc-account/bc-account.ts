import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the BcAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bc-account',
  templateUrl: 'bc-account.html',
})
export class BcAccountPage {
userAcc = {
  "name":"jack",
  "email":"jack@gmail.com",
  "password":"jack123",
  "MainAccounts":[
                  {"pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "flag":"true",
                   "subAccounts":[
                                  {
                                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                                   "flag":"true"
                                  }
                                 ]
                  },
                  {"pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "flag":"true",
                   "subAccounts":[
                                  {
                                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                                   "flag":"true"
                                  },
                                  {
                                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                                   "flag":"true"
                                  }
                                 ]
                  },
                  {"pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "flag":"true",
                   "subAccounts":[  ]
                  }
                ]
  
}
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BcAccountPage');
  }

}


