import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Keypair } from 'stellar-sdk';
import { Properties } from '../../shared/properties';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { TranslateService } from '@ngx-translate/core';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
@IonicPage()
@Component({
  selector: 'page-account-details',
  templateUrl: 'account-details.html',
})
export class AccountDetailsPage {

  private account;
  private privateKey: string;
  private keyDecrypted: boolean = false;
  private notDefaultAccount: boolean = true;
  private accountFunds: string = 'Calculating...';



  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mappingService: MappingServiceProvider,
    private properties: Properties,
    private dataService: DataServiceProvider,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService,
    private apiService:ApiServiceProvider
  ) {
    this.account = this.navParams.get("account");
    this.defaultAccountCheck();
    this.blockchainService.accountBalance(this.account.pk).then((balance) => {
      this.accountFunds = balance.toString();
    }).catch((err) => {
      this.accountFunds = '0 ';
    });
  }
  ngOnInit() { 
    this.decryptSecretKey();
  }
  decryptSecretKey() {
    this.transactionPasswordPopUp().then((password) => {
      this.mappingService.decryptSecret(this.account.sk, password).then((secretKey) => {
        let pair = Keypair.fromSecret(secretKey.toString());
        if (pair.publicKey() === this.account.pk) {
          this.keyDecrypted = true;
          this.privateKey = secretKey.toString();
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

  encryptSecretKey() {
    this.keyDecrypted = false;
    this.privateKey = "";
  }

  ionViewDidLeave() {
    this.keyDecrypted = false;
    this.privateKey = "";
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

  defaultAccountCheck() {
    if (this.account.pk != this.properties.defaultAccount.pk) {
      this.notDefaultAccount = true;
    } else {
      this.notDefaultAccount = false;
    }
  }

  makeDefaultAccount() {
    let alert = this.alertCtrl.create({
      title: 'Default Account',
      message: 'Are you sure you want to make this account the default account?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: data => { }
        },
        {
          text: 'Yes',
          handler: data => {
            this.properties.defaultAccount = this.account;
            this.dataService.setDefaultAccount(this.account);
            this.defaultAccountCheck();
          }
        }
      ]
    });

    alert.present();
  }

  maketrustLine(){
    let TDPtxnhash="2874f8d0fcfb35c0d4133edd7e1c0c3be4aaed4dfd0ec531b1d4ec7a6cfea5c9"
    let TDPID="61e11d4257577da95de92786"
    let Identifier="832903168"
    let ProductName="carrot"
    let NFTBlockChain="Stellar"
    let assetCode="NFTt15"
    let distributorPK=this.properties.defaultAccount.pk
    if(!!this.privateKey){
      console.log(`callinyMINT------------------`)
      this.blockchainService.changeTrustByUs(assetCode,"GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3",this.privateKey).then((transactionResult:any)=>{
        console.log(`result`, transactionResult)
        if(transactionResult.successful){
        this.apiService.MinNFTStellar(transactionResult.successful,distributorPK,assetCode,TDPtxnhash,TDPID,NFTBlockChain,transactionResult.created_at,Identifier,ProductName).then(nft=>{
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
    this.navCtrl.setRoot(BcAccountPage);
  }

}
