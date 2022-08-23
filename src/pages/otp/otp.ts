import { Component } from '@angular/core';
import { IonicPage,  NavController, NavParams } from 'ionic-angular';
import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { FormsModule } from '@angular/forms';

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
  otp:string="nn"
  email:string="keleighberenger@gmail.com"
 
  constructor(public navCtrl: NavController, public navParams: NavParams, private service: ApiServiceProvider) {
  }

  checkOTP(){
    if(this.otp!=null){
       this.service.ValidateUserOTP(this.otp,this.email).subscribe((res:any)=>{
          console.log("result is: ",res)
          if (res!=null){
            this.navCtrl.push(MintNftPage,{res:res});
          }else{
            alert("Invalid OTP Please try again")
          }
        
      })
     //this.navCtrl.push(MintNftPage,{res:this.otp});
     //this.navCtrl.push(MintNftPage);
    }
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OtpPage');
  }

}
