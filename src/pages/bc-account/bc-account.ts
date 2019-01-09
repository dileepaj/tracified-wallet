import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ViewController, ModalController } from 'ionic-angular';
import { AddAccountPage } from '../add-account/add-account';
 
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
                  {"AccountName":"Acc 1",
                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q"]
                  },
                  {"AccountName":"Registrar",
                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",                                            "GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                                  "SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT"
                                 ]
                  },
                  {"AccountName":"Field Officer",
                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "subAccounts":[ ]
                  },
                  {"AccountName":"Acc 1",
                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q"]
                  },
                  {"AccountName":"Registrar",
                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "subAccounts":["GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",                                            "GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                                  "SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT"
                                 ]
                  },
                  {"AccountName":"Field Officer",
                   "pk":"GABVKLID4CFOSRWBCIMNEGMLZUO4YWLUY2KVQXVMIQUTIXRFHXYXHZ2Q",
                   "sk":"SCH72XX5KLTPF4EGAUPADFBWR6HEIOLFWFIUC66TVK2WMBL6MXRAU5CT",
                   "subAccounts":[ ]
                  }
                ]
  
}
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BcAccountPage');
  }

  goToAddAccount(){
    this.navCtrl.push(AddAccountPage);

  }

}


