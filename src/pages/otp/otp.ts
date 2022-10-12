import { Component } from '@angular/core';
import { IonicPage,  NavController, NavParams } from 'ionic-angular';
import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import CryptoJS from 'crypto-js';
import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import {createMessage,readKey,encrypt,readMessage} from 'openpgp';
import * as openpgp from 'openpgp';
import { retry } from 'rxjs/operator/retry';
/**
 * Generated class for the OtpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-otp',
  templateUrl: 'otp.html',
})
export class OtpPage {
  otp:string=""
  hash: string;
  //const openpgp = require('openpgp');
  constructor(public navCtrl: NavController, public navParams: NavParams, private service: ApiServiceProvider) {
  }

  checkOTP(){
    if(this.otp!=null){
      // this.service.checkOTP(this.otp).subscribe(res=>{
      //   console.log("result is: ",res)
      //   this.navCtrl.push(MintNftPage,res);
      // })
     // this.navCtrl.push(MintNftPage,{res:this.otp});
     this.navCtrl.push(MintNftPage);
    }
    
  }

   async ionViewDidLoad() {
    const openpgp = require('openpgp');
    console.log('ionViewDidLoad OtpPage');
   // this.generatekeypari()
  }

  

  
}
