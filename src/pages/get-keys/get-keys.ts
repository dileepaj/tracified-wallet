import { Component , ViewChild} from '@angular/core';
import { IonicPage, Nav, NavController, NavParams } from 'ionic-angular';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Clipboard } from '@ionic-native/clipboard';
/**
 * Generated class for the GetKeysPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-get-keys',
  templateUrl: 'get-keys.html',
})
export class GetKeysPage {
  PK:any;
  SK:any;
  result:any;
  @ViewChild(Nav) nav: Nav;
  constructor(public navCtrl: NavController, public navParams: NavParams, private clipboard:Clipboard) {
    this.result = this.navParams.get("res")
    console.log("data passed ",this.result)
    if (this.result){
      this.SK=this.result.publicKey().toString()
      this.PK=this.result.secret().toString()
      // this.PrivateKey=this.result.secret()
      // this.PublicKey=this.result.publicKey()
      console.log("private key: ",this.SK)
      console.log("public key: ",this.PK)
    }
  }

  copyData(key){
    this.clipboard.copy(key);
  }

  market(){
    this.nav.push(GetNftPage,{res:this.PK});
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad GetKeysPage');
  }

}
