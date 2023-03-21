import { Component } from '@angular/core';
import { IonicPage,  NavController, NavParams } from 'ionic-angular';
import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';

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
  mail: any="mithilapanagoda@gmail.com";
 
  constructor(public navCtrl: NavController, public navParams: NavParams, private service: ApiServiceProvider) {
  }

  checkOTP(){
    if(this.otp!=null){
      this.service.checkOTP(this.otp,"mithilapanagoda@gmail.com").then(res=>{
        console.log("result is: ",res)
        if(res.statusText=="OK"){
          this.navCtrl.push(MintNftPage,{res:res});
        }else{
          alert("The OTP has either expired or is invalid")
        }
      })
    }
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OtpPage');
  }

}
