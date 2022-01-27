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
  nftPrice:number;
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
    }).catch(error => {
      this.logger.error("Couldn't retrive NFT from databse" + JSON.stringify(error))
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
  })
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
    }).catch(error => {
      this.logger.error("Couldn't retrive NFT from databse" + JSON.stringify(error))
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
    })
  }
  /**
   * @function clickSellNFT First take user password for sign the trasaction after call the sellNFT function and after finishing it update the NFT selling status in marketplace collection
   * @param item its should be a NFT object
   */
  clickSellNFT(item: any) {
    if(this.nftPrice>0){
      this.transactionPasswordPopUp(this.mainAccount.accountName,this.accountFunds,`<p>Cost from your wallet</p><ul><li>Manage Sell Offer : 0.00001</li></ul><p>Total Cost : 0.00001</p><p>Note : Collateral fees are not spendable</p>`).then((password) => {
        this.mappingService.decryptSecret(this.mainAccount.sk, password).then((secretKey) => {
          let pair = Keypair.fromSecret(secretKey.toString());
          if (pair.publicKey() === this.mainAccount.pk) {
            this.presentLoading("Please wait");
            this.keyDecrypted = true;
            this.privateKey = secretKey.toString();
            this.bc.sellNft(item.NftAssetName, item.InitialIssuerPK, this.privateKey,"1",this.nftPrice.toString())
            .then((transaction) => {
              if (this.isLoadingPresent) {
                this.dissmissLoading();
              }
              this.presentAlert('Congratulation', `NFT ${item.NftAssetName} ONSALE`);
               this.apiService.UpdateSellingStatusNFT(item.NFTTXNhash,"FORSALE","1",this.nftPrice.toString())
                .then(DBupdatestatus => {
                  if (this.isLoadingPresent) {
                    this.dissmissLoading();
                  }
                })
                .catch(error =>{
                  if (this.isLoadingPresent) {
                    this.dissmissLoading();
                  }
                  this.logger.error("Database UpdateSellingStatusNFT function does not work" + JSON.stringify(error))})
            }).catch(error =>{
              if (this.isLoadingPresent) {
                this.dissmissLoading();
              }
              this.logger.error("Issue in sellNFT function" + JSON.stringify(error))
              this.presentAlert('ERROR', `Can not sell NFT ${item.NftAssetName}`);
            })
          }else{
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
            this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
              this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
            });
          }
        }).catch((err) => {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
          }
          this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
          });
        });
      });
    }else{
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
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
    this.transactionPasswordPopUp(this.mainAccount.accountName,this.accountFunds,`<p>Cost from your wallet</p><ul><li>Change Trust creation : 0.00001</li><li>Collateral Fee : 0.5</li><li>Manage Buy Offer : 0.00001</li><li>Manage Data x 3 : 0.00001x3</li></ul><p>Total Cost : 0.00005</p><p>Note:Collateral fees are not spendable</p>`)
    .then((password) => {
      this.mappingService.decryptSecret(this.mainAccount.sk, password).then((secretKey) => {
        this.presentLoading("Please wait");
        let pair = Keypair.fromSecret(secretKey.toString());
        if (pair.publicKey() === this.mainAccount.pk) {
          this.keyDecrypted = true;
          this.privateKey = secretKey.toString();
          this.bc.trustlineByBuyer(item.NftAssetName, item.InitialIssuerPK, this.privateKey, this.mainAccount.pk)
          .then((trustlineCreated) =>{
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            } 
            this.bc.buyNft(item.NftAssetName,this.mainAccount.skp,item.InitialIssuerPK,item.PreviousOwnerNFTPK, "GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3","1",item.Price)
            .then(a => {
              if (this.isLoadingPresent) {
                this.dissmissLoading();
              } 
              this.presentAlert(item.NftAssetName, `Congratulation, NFT ${item.NftAssetName} BOUGHT`);
              this.apiService.UpdateBuyingStatusNFT(item.NFTTXNhash,"NOTFORSALE",this.mainAccount.pk, item.CurrentOwnerNFTPK)
              .then(DBupdated=>{
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                }
              })
              .catch(error =>{
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                } 
                this.logger.error("Database UpdateBuyingStatusNFT function does not work" + JSON.stringify(error))})
            })
            .catch(error => {
              if (this.isLoadingPresent) {
                this.dissmissLoading();
              }
              if (this.isLoadingPresent) {
                this.dissmissLoading();
              } 
              this.presentAlert(item.NftAssetName, `Congratulation, NFT ${item.NftAssetName} BOUGHT`);
              this.apiService.UpdateBuyingStatusNFT(item.NFTTXNhash,"NOTFORSALE",this.mainAccount.pk, item.CurrentOwnerNFTPK)
              .then(DBupdated=>{
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                }
              })
              .catch(error =>{
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                } 
                this.logger.error("Database UpdateBuyingStatusNFT function does not work" + JSON.stringify(error))})
              //this.presentAlert('ERROR', `Can not buy NFT1 ${item.NftAssetName}`);
            })
          })
          .catch(error => {
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
            //this.presentAlert('ERROR', `Can not buy NFT ${item.NftAssetName}`);
          })
        } else {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
          }
          this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
          });
        }
      }).catch((err) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
        this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
        });
      });
    })
  }

  transactionPasswordPopUp(accountName,curretBalance,message): Promise<string> {
    let resolveFunction: (password: string) => void;
    let promise = new Promise<string>(resolve => {
      resolveFunction = resolve;
    });
    let popup = this.alertCtrl.create({
      title: "Sign Trasaction",
      subTitle:`<p>Account ${accountName}</p> <p>Balance ${curretBalance}</p>`,
      message:message,
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
