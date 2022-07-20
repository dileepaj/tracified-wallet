import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, IonicPage, LoadingController, Nav, NavController, NavParams } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Properties } from '../../shared/properties';
import { Keypair } from 'stellar-sdk';
import { Logger } from 'ionic-logger-new';
import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { DomSanitizer } from '@angular/platform-browser';
import { Dialogs } from '@ionic-native/dialogs';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';

/**
 * @MintNftPage page.
 * This class  use to MINT NFT
 * 
 */
@IonicPage()
@Component({
  selector: 'page-mint-nft',
  templateUrl: 'mint-nft.html',
})
export class MintNftPage {
  public permission: boolean;
  form: any;
  keypair:any;
  transactionResult :boolean;
  public totalBatches = 10;
  private account;
  private privateKey: string;
  private keyDecrypted: boolean = false;
  public batchs: any[];
  private TDPtxnhash = ""
  private TDPID = ""
  private Identifier = ""
  private ProductName = ""
  private NFTBlockChain = "Stellar"
  private SVG=""
  nftName: string = "";
  Decryption:any;
  Issuer:any;
  dec:any;
  imageSrc:any;
  public noData: boolean;
  loading;
  Item: any;
  public limit = 10;
  public stagelist: any;
  isLoadingPresent: boolean;
  private accountFunds: string = 'Calculating...';
  public itemId: string | null;
  public dateSelected: string = null;
  public page: number;
  xdr: string;
  result:any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mappingService: MappingServiceProvider,
    private properties: Properties,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService,
    private apiService: ApiServiceProvider,
    private _sanitizer: DomSanitizer,
    private dialogs: Dialogs,
    private loadingCtrl: LoadingController,
    private logger: Logger,
    private storage:StorageServiceProvider,
  ) {
    this.result = this.navParams.get("res")
    console.log("data passed ",this.result)
    if (this.result){
      this.TDPID=this.result
      console.log("checking ---tdpid", this.TDPID)
    }
    this.account = this.properties.defaultAccount;
    this.blockchainService.accountBalance(this.account.pk).then((balance) => {
      this.accountFunds = balance.toString();
    }).catch((err) => {
      this.accountFunds = '0 ';
    });
  }

  @ViewChild(Nav) nav: Nav;
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateNftPage');
  }
  ionViewDidEnter() {
    this.account = this.properties.defaultAccount;
  }
  /**
   *
   * @param privateKey walllet app user privatekey
   * take private key by decrypting the walletuser's secret key using his password(take the permisstion for use their secretkey) 
   * @function mintNFT
   * First take NFT issueing new account publickey from gateway
   * After call the @changeTrustByDistributor and after call the @mintNFTStellar
   * In stellar NFT same is an asset for craete an asset minter need to 
   * create trust line with asset isser first after issuer need to trasfer the asset to distributor(minter) ,transfer part do in the gateway side
   */
  
  
  loadSVG(){
    console.log("hash: ",this.TDPID)
    this.apiService.getSVGByHash(this.TDPID).subscribe((res:any)=>{
      this.Decryption = res.Response.Base64ImageSVG
     this.dec = btoa(this.Decryption);
    var str2 = this.dec.toString(); 
    var str1 = new String( "data:image/svg+xml;base64,"); 
    var src = str1.concat(str2.toString());
    this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(src);
    console.log("this image: ",this.imageSrc)
    })

    this.dialogs.alert(this.imageSrc)
  .then(() => console.log('Dialog dismissed'))
  .catch(e => console.log('Error displaying dialog', e));
  }

  createNewAccount(){
     var keypair=this.blockchainService.createAddress()
    console.log("Public Key is", keypair.publicKey().toString())
    console.log("Secret Key is", keypair.secret().toString())
    console.log("Keypair is", keypair)
    this.storage.setBcAccounts("keleighb@tracified.com",keypair.secret().toString()).then(res=>{
      console.log("result ",res)
      alert("Successfully set!")
     
    })

  }
createNFTWithNewAcc(){
  this.createNewAccount()
  this.createNFT()

}

  createNFT() {
     this.presentLoading();
    this.storage.getBcAccounts("keleighb@tracified.com").then((res1:any)=>{
      console.log("retieved result ",res1)
      if(res1!=null){
        let keypair = Keypair.fromSecret(res1);
        console.log("Public Key is", keypair.publicKey().toString())
        console.log("Secret Key is", keypair.secret().toString())
      }
      else{
        alert("You don't have an account exisiting with your username. Proceeding to creating a new one!")
        this.createNewAccount();
      }
     

     
     
    })
    this.apiService.getNewIssuerPublicKey().then(issuerPublcKey => {
      console.log("Issuer: ",issuerPublcKey)
      this.Issuer=issuerPublcKey.NFTIssuerPK
      console.log("issuer json: ",this.Issuer)
      
      let distributorPK = this.keypair.publicKey().toString()
  
      if (!!this.nftName) {
        this.apiService.getAccountFunded(this.keypair.publicKey().toString(),this.nftName,issuerPublcKey.NFTBlockChain).then(txn=>{
          console.log("The transaction for account funding",txn)
          console.log("XDR from gateway : ",txn.XDR)
         this.xdr = txn.XDR
         })
       var txn = this.blockchainService.signXdr(this.xdr,this.keypair.secret().toString())
      console.log("Account sponsored: ",txn)
      if (txn!=null){
        this.transactionResult ==true
      }
         if (this.transactionResult==true) {
            this.apiService.minNFTStellar(
             this.transactionResult,
              this.Issuer,
            this.keypair.publicKey().toString(),
              this.nftName,
              'RURI',
              'Gems',
              this.NFTBlockChain,
              'Time',//this.transactionResult.created_at
              'Gems',
              '7696cc36d38bf0d1190f65bfa49060f93955a5831d734cd9977a093dc3308932')
              .then(nft => {
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                }
                this.logger.info("NFT created", this.properties.skipConsoleLogs, this.properties.writeToFile);
                this.translate.get(['MINTED', `NFT ${this.nftName} WAS MINTED`]).subscribe(text => {
                this.presentAlert(text['MINTED'], text[`NFT ${this.nftName} WAS MINTED`]);
                });
                this.nftName="";
                //this.navCtrl.push(GetKeysPage,{res:keypair});
              })
              .catch(error => {
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                }
                this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
                });
              })
          }
          else {
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
            this.translate.get(['ERROR', 'INCORRECT_TRANSACTION']).subscribe(text => {
              this.presentAlert(text['ERROR'], text['INCORRECT_TRANSACTION']);
            });
          }
        
      }
    }).catch(error => {
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
      this.logger.error("NFT reciveing issue in gateway side : " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
      this.translate.get(['ERROR', 'TRANSFER_NFT']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['TRANSFER_NFT']);
      });
    })
   
  }

  
  presentAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {}
        }
      ]
    });
    alert.present();
  }

  backButton() {
    this.navCtrl.setRoot(MintNftPage);
  }

  transactionPasswordPopUp(accountName,curretBalance,mintingCost,changeTrustCreationCost,CollateralFee): Promise<string> {
    let resolveFunction: (password: string) => void;
    let promise = new Promise<string>(resolve => {
      resolveFunction = resolve;
    });
    let popup = this.alertCtrl.create({
      cssClass: 'custom-alert',
      title: "Sign Trasaction",
      subTitle:`<p>Account ${accountName}</p> <p>Balance ${curretBalance}</p>`,
      message:`  <p>Operation cost from tracified<p><ul><li>Payment Operation : 0.00001<li><li>Manage Data Operation : 0.00001</li><li>Set Option : 0.00001</li></ul><p>Total Cost : 0.00003</p><br>
      <p>Operations cost from your wallet</p><ul><li>Change Trust creation:${changeTrustCreationCost}</li><li>Collateral Fee:${CollateralFee}</li></ul><p>Total Minting Cost:${mintingCost}</p>`,
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
          handler: data => {}
        },
        {
          text: 'OK',
          handler: data => {
            if (data.password) {
              resolveFunction(data.password);
            }
          }
        }
      ],
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
  
  

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'NFT Minting...'
    });
    this.loading.present();
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

 

  onFileChange(event){

  }
}
