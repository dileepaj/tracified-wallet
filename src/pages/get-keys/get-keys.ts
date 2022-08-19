import { Component , ViewChild} from '@angular/core';
import { IonicPage, Nav, NavController, NavParams, Platform } from 'ionic-angular';
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
 public PK:string;
public SK:string;
  result:any;
  @ViewChild(Nav) nav: Nav;
  constructor(public navCtrl: NavController, public navParams: NavParams, private clipboard:Clipboard,private platform: Platform) {
    this.result = this.navParams.get("res")
    console.log("data passed ",this.result)
   // if (this.result){
      this.SK=this.result.secret().toString()//this.result.publicKey().toString()
      this.PK=this.result.publicKey().toString()//this.result.secret().toString()
      // this.PrivateKey=this.result.secret()
      // this.PublicKey=this.result.publicKey()
      console.log("private key: ",this.SK)
      console.log("public key: ",this.PK)
   // }
  }

  copyData(key){
    console.log("key:",key)
    //this.clipboard.copy(key);
    let aux = document.createElement("input");
    aux.setAttribute("value",document.getElementById(key).innerHTML);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    console.log("text copied!")
  }

  market(){
    this.navCtrl.push(GetNftPage,{res:this.PK});
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad GetKeysPage');
  }

}
