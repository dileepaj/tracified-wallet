import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Properties } from '../../shared/properties';
import { ApiServiceProvider } from '../../providers';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Logger } from 'ionic-logger-new';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Keypair } from 'stellar-sdk';
import { TranslateService } from '@ngx-translate/core';
/**
 * NFT market place fuction implent in here 
 * BUy NFT and Sell NFT ,show NFT in marketplace 
 *
 */

@IonicPage()
@Component({
  selector: 'page-market-place-nft',
  templateUrl: 'market-place-nft.html',
})
export class MarketPlaceNftPage {
  currentSellingNFTs = [];
  ownNFTs = [];
  loading;
  Item: any;
  isLoadingPresent: boolean;
  mainAccount: any;
  nftAmmount:number=0;
  nftPrice:number=0;
  private keyDecrypted: boolean = false;
  private privateKey: string;
  private accountFunds: string = 'Calculating...';
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public apiService: ApiServiceProvider,
    private loadingCtrl: LoadingController,
    private properties: Properties,
    private alertCtrl: AlertController,
    private logger: Logger,
    private bc: BlockchainServiceProvider,
    private mappingService: MappingServiceProvider,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService,) {
      this.mainAccount = this.properties.defaultAccount;
      this.blockchainService.accountBalance(this.mainAccount.pk).then((balance) => {
        this.accountFunds = balance.toString();
      }).catch((err) => {
        this.accountFunds = '0 ';
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MarketPlaceNftPage');
  }

  ionViewDidEnter() {
    this.presentLoading("Please wait");
    this.mainAccount = this.properties.defaultAccount;
    this.getSellingNFT();
    this.getOwnNFT();
  }

  doRefresh(refresher) {
    this.presentLoading("Please wait");
    this.getSellingNFT();
    this.getOwnNFT();
    refresher.complete();
  }
  /**
   * 
   * @assetsMarketPlace  @type array store the retrieve selling NFT from gateway DB
   * @function getSellingNFT get selling NFT fillter by "withoutKey" to show market place
   * "withoutKey" parameter means it does not fillte bu publick key
   * @
   */
  getSellingNFT() {
    let assetsMarketPlace = [];
    this.apiService.retriveNFT("FORSALE&NOTFORSELL", "withoutKey").then(a => {
      a.body.forEach(element => {
        assetsMarketPlace.push(element);
      });
      this.currentSellingNFTs = assetsMarketPlace;
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
    }).catch(error => this.logger.error("Couldn't retrive NFT from databse" + JSON.stringify(error)))
  }
  /**
   * @function getOwnNFT retrive the current wallet app user NFT fillter by NFTFORE
   * @param assetOwn @type array store the wallet user own NFT(assest) from gateway DB
   * 
   */
  getOwnNFT() {
    let assetOwn = [];
    this.apiService.retriveNFT("NOTFORSALE", this.mainAccount.pk).then(a => {
      a.body.forEach(element => {
        assetOwn.push(element);
      });
      this.ownNFTs = assetOwn;
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
    }).catch(error => this.logger.error("Couldn't retrive NFT from databse" + JSON.stringify(error)))
  }
  /**
   * @function clickSellNFT First take user password for sign the trasaction after call the sellNFT function and after finishing it update the NFT selling status in marketplace collection
   * @param item its should be a NFT object
   */
  clickSellNFT(item: any) {
    this.presentLoading("Please wait");
    if(this.nftAmmount>0&&this.nftPrice>0){
      this.transactionPasswordPopUp(this.mainAccount.accountName,this.accountFunds,"0.5002","0.5","0.0002").then((password) => {
        this.mappingService.decryptSecret(this.mainAccount.sk, password).then((secretKey) => {
          let pair = Keypair.fromSecret(secretKey.toString());
          if (pair.publicKey() === this.mainAccount.pk) {
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
            this.keyDecrypted = true;
            this.privateKey = secretKey.toString();
            this.bc.sellNft(item.NftAssetName, item.InitialIssuerPK, this.privateKey,this.nftAmmount.toString(),this.nftPrice.toString())
            .then((transaction) => {
              this.presentAlert('Congratulation', `NFT ${item.NftAssetName} ONSALE`);
              this.apiService.UpdateSellingStatusNFT(item.CurrentOwnerNFTPK, item.PreviousOwnerNFTPK, item.NFTTXNhash, "FORSALE")
                .then(DBupdatestatus => {})
                .catch(error =>this.logger.error("Database UpdateSellingStatusNFT function does not work" + JSON.stringify(error)))
            }).catch(error =>{
              this.logger.error("Issue in sellNFT function" + JSON.stringify(error))
              this.presentAlert('ERROR', `Can not sell NFT ${item.NftAssetName}`);
            })
          } else {
            this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
              this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
            });
          }
        }).catch((err) => {
          this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
          });
        });
      });
    }else{
      this.translate.get(['ERROR', 'Copies and Price fileds error, Please check the Copies and Price fild correctly']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['Copies and Price fileds error, Please check the Copies and Price fild correctly']);
      }); 
    }
  }
  /**
   * @function clickBuyNFT First take user password for sign the trasaction (when user click buy button this function will call)
   * This function call 3 function one after another @trustlineByBuyer @buyNft and finally update the NFT selling status in marketplace collection
   * @param item its should be a NFT object
   */
   clickBuyNFT(item: any) {
    this.presentLoading("Please wait");
    if(this.nftAmmount>0&&this.nftPrice>0){
    this.transactionPasswordPopUp(this.mainAccount.accountName,this.accountFunds,"0.5002","0.5","0.0002").then((password) => {
      this.mappingService.decryptSecret(this.mainAccount.sk, password).then((secretKey) => {
        let pair = Keypair.fromSecret(secretKey.toString());
        if (pair.publicKey() === this.mainAccount.pk) {
          this.keyDecrypted = true;
          this.privateKey = secretKey.toString();
          this.bc.trustlineByBuyer(item.NftAssetName, item.InitialIssuerPK, this.privateKey, this.mainAccount.pk)
          .then((trustlineCreated) =>{
            this.bc.buyNft(item.NftAssetName, this.mainAccount.skp, item.InitialIssuerPK, "GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3", "50")
            .then(a => {
              this.presentAlert(item.NftAssetName, `NFT ${item.NftAssetName} BOUGHT`);
              this.apiService.UpdateSellingStatusNFT(this.mainAccount.pk, item.CurrentOwnerNFTPK, item.NFTTXNhash, "NOTFORSALE")
              .then(DBupdated=>{})
              .catch(error =>this.logger.error("Database UpdateSellingStatusNFT function does not work" + JSON.stringify(error)))
            })
            .catch(error => { 
              this.presentAlert('ERROR', `Can not sell NFT ${item.NftAssetName}`);
            })
          })
          .catch(error => { 
            this.presentAlert('ERROR', `Can not sell NFT ${item.NftAssetName}`);
          })
        } else {
          this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
          });
        }
      }).catch((err) => {
        this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
        });
      });
    });
  }else{
    this.translate.get(['ERROR', 'Copies and Price fileds error, Please check the Copies and Price fild correctly']).subscribe(text => {
      this.presentAlert(text['ERROR'], text['Copies and Price fileds error, Please check the Copies and Price fild correctly']);
    }); 
  }
  }

  transactionPasswordPopUp(accountName,curretBalance,mintingCost,changeTrustCost,managedataCost): Promise<string> {
    let resolveFunction: (password: string) => void;
    let promise = new Promise<string>(resolve => {
      resolveFunction = resolve;
    });
    let popup = this.alertCtrl.create({
      title: "Sign Trasaction",
      subTitle:`<p>Account ${accountName}</p> <p>Balance ${curretBalance}</p>`,
      message:`<p>Operations</p><ul><li>Change Trust:${changeTrustCost}</li><li> Manage offer:${managedataCost}</li></ul><p>Total Cost:${mintingCost}</p>`,
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
      cssClass:'popup-alert'
    });
    popup.present();
    return promise;
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

  presentLoading(string:string) {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: string
    });
    this.loading.present();
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

  dataError(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'close'
    });
    alert.present();
  }
}
