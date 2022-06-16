import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, IonicPage, LoadingController, Nav, NavController, NavParams } from 'ionic-angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Properties } from '../../shared/properties';
import { Keypair } from 'stellar-sdk';
import { Logger } from 'ionic-logger-new';
import { BcAccountPage } from 'pages/bc-account/bc-account';

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
  form: any;
  private account;
  private privateKey: string;
  private keyDecrypted: boolean = false;
  private TDPtxnhash = "2874f8d0fcfb35c0d4133edd7e1c0c3be4aaed4dfd0ec531b1d4ec7a6cfea5c9"
  private TDPID = "61e11d4257577da95de92786"
  private Identifier = "832903168"
  private ProductName = "carrot"
  private NFTBlockChain = "Stellar"
  nftName: string = "";
  loading;
  Item: any;
  isLoadingPresent: boolean;
  private accountFunds: string = 'Calculating...';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mappingService: MappingServiceProvider,
    private properties: Properties,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService,
    private apiService: ApiServiceProvider,
    private loadingCtrl: LoadingController,
    private logger: Logger) {
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
  mintNFT(privateKey) {
    this.presentLoading();
    this.apiService.getNewIssuerPublicKey().then(issuerPublcKey => {
      let distributorPK = this.properties.defaultAccount.pk
      if (!!privateKey && !!this.nftName) {
        this.blockchainService.changeTrustByDistributor(this.nftName, issuerPublcKey.NFTIssuerPK, this.privateKey).then((transactionResult: any) => {
          if (transactionResult.successful) {
            this.apiService.minNFTStellar(
              transactionResult.successful,
              issuerPublcKey.NFTIssuerPK,
              distributorPK,
              this.nftName,
              this.TDPtxnhash,
              this.TDPID,
              this.NFTBlockChain,
              transactionResult.created_at,
              this.Identifier,
              this.ProductName)
              .then(nft => {
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                }
                this.logger.info("NFT created", this.properties.skipConsoleLogs, this.properties.writeToFile);
                this.translate.get(['MINTED', `NFT ${this.nftName} WAS MINTED`]).subscribe(text => {
                this.presentAlert(text['MINTED'], text[`NFT ${this.nftName} WAS MINTED`]);
                });
                this.nftName="";
              }).catch(error => {
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
        }).catch(error => {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
          }
          this.logger.error("Failed to create trust line: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
          this.translate.get(['ERROR', 'CREATE_NFT']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['CREATE_NFT']);
          });
        })
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

  decryptSecretKey() {
    this.transactionPasswordPopUp(this.account.accountName,this.accountFunds,"0.00001","0.5","0.00001").then((password) => {
      this.mappingService.decryptSecret(this.account.sk, password).then((secretKey) => {
        let pair = Keypair.fromSecret(secretKey.toString());
        if (pair.publicKey() === this.account.pk) {
          this.keyDecrypted = true;
          this.privateKey = secretKey.toString();
          this.mintNFT(this.privateKey)
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
  
  createNFT() {
    this.decryptSecretKey()
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

  openPage(page: string) {
    switch (page) {
      case "accounts":
        this.nav.setRoot(BcAccountPage);
        break;
    }
  }
}
