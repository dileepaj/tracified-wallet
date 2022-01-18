import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Properties } from '../../shared/properties';
import { Keypair } from 'stellar-sdk';
import { FormGroup, FormControl, Validators } from '@angular/forms';
/**
 * Generated class for the CreateNftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-nft',
  templateUrl: 'create-nft.html',
})
export class CreateNftPage {
  form: any;
  private account;
  private privateKey: string;
  private keyDecrypted: boolean = false;
  private TDPtxnhash="2874f8d0fcfb35c0d4133edd7e1c0c3be4aaed4dfd0ec531b1d4ec7a6cfea5c9"
  private TDPID="61e11d4257577da95de92786"
  private Identifier="832903168"
  private ProductName="carrot"
  private NFTBlockChain="Stellar"
  nftName: string = "";
  private notDefaultAccount: boolean = true;
  constructor(
    public navCtrl: NavController,   
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mappingService: MappingServiceProvider,
    private properties: Properties,
    private dataService: DataServiceProvider,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService,
    private apiService:ApiServiceProvider) {
      this.account =this.properties.defaultAccount;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateNftPage');
  }
  ionViewDidEnter() {
    this.account = this.properties.defaultAccount;
  }
  maketrustLine(privateKey){
    //let privateKey="SBX7R5IQV4SXQ7CFV7OEEQ6NHU3SBEXCODW4476FQJC7RUFARK2JSSNY"
    // let TDPtxnhash="2874f8d0fcfb35c0d4133edd7e1c0c3be4aaed4dfd0ec531b1d4ec7a6cfea5c9"
    // let TDPID="61e11d4257577da95de92786"
    // let Identifier="832903168"
    // let ProductName="carrot"
    // let NFTBlockChain="Stellar"
    // let assetCode="NFTt15"

    console.log(`testPrivateKey=====--------------`, privateKey)
    let distributorPK=this.properties.defaultAccount.pk
    if(!!privateKey&&!!this.nftName){
      console.log(`callinyMINT------------------`)
      this.blockchainService.changeTrustByUs(this.nftName,"GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3",this.privateKey).then((transactionResult:any)=>{
        console.log(`result`, transactionResult)
        if(transactionResult.successful){
        this.apiService.sendTrustLineXDR(transactionResult.successful,distributorPK,this.nftName,this.TDPtxnhash,this.TDPID,this.NFTBlockChain,transactionResult.created_at,this.Identifier,this.ProductName).then(nft=>{
        console.log(`NFT created`,nft)
        }).catch(err=>console.log(`err`, err))
        }
      }).catch(err=>{
        console.log("can not create trustline (NFT)")
        console.log(`err`, err)})  
    }else{
      console.log(`nokye---------------s`)
    }
  }

  decryptSecretKey() {
    console.log(`account`, this.account)
    this.transactionPasswordPopUp().then((password) => {
      this.mappingService.decryptSecret(this.account.sk, password).then((secretKey) => {
        let pair = Keypair.fromSecret(secretKey.toString());
        if (pair.publicKey() === this.account.pk) {
          this.keyDecrypted = true;
          this.privateKey = secretKey.toString();
          this.maketrustLine(this.privateKey)
        } else {
          console.log("Password incorrect.");
          this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
          });
        }
      }).catch((err) => {
        console.log("Error: ", err);
        this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
        });
      });
    });
  }

  presentAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {

          }
        }
      ]
    });

    alert.present();
  }

  backButton() {
    this.navCtrl.setRoot(CreateNftPage);
  }

  transactionPasswordPopUp(): Promise<string> {
    let resolveFunction: (password: string) => void;

    let promise = new Promise<string>(resolve => {
      resolveFunction = resolve;
    });

    let popup = this.alertCtrl.create({
      title: "Transaction Password",
      inputs: [
        {
          name: "password",
          placeholder: "Password",
          type: "password"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // Cancel action
          }
        },
        {
          text: 'OK',
          handler: data => {
            if (data.password) {
              resolveFunction(data.password);
            }
          }
        }
      ]
    });

    popup.present();

    return promise;
  }

  encryptSecretKey() {
    this.keyDecrypted = false;
    this.privateKey = "";
  }

  ionViewDidLeave() {
    this.keyDecrypted = false;
    this.privateKey = "";
  }

 createNFT(){
  this.decryptSecretKey()    
  }
}
