import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Properties } from '../../shared/properties';
import { Keypair } from 'stellar-sdk';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { DomSanitizer } from '@angular/platform-browser';
import CryptoJS from 'crypto-js';
import { PagesLoadSvgPage } from '../../pages/pages-load-svg/pages-load-svg';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { NavigationExtras, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debug } from 'console';

@Component({
   selector: 'page-mint-nft',
   templateUrl: 'mint-nft.html',
   styleUrls: ['./mint-nft.scss'],
})
export class MintNftPage {
   public permission: boolean;
   form: any;
   transactionResult: boolean;
   public totalBatches = 10;
   private account;
   private privateKey: string;
   private keyDecrypted: boolean = false;
   public batchs: any[];
   private TDPtxnhash = '';
   private TDPID = '';
   private Identifier = '';
   private ProductName = '';
   private NFTBlockChain = 'Stellar';
   // mail: any = 'mithilapanagoda@gmail.com';
   SVG = '';
   SVGID = '';
   nftName: string = '';
   message: string = '';
   recipientsName: string = '';
   Decryption: any;
   Issuer: any;
   dec: any;
   imageSrc: any;
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
   result: any;
   isTooltipOpen: boolean = false;
   txn: string;
   hash: string;
   keypair: Keypair;
   txn1: void;
   shopID = '';
   img;
   accountType;
   loadingState: boolean;
   email;
   otp: any;
   CustomMsg: any;
   @ViewChild('popover') popover;
   isOpen = false;

   constructor(
      private alertCtrl: AlertController,
      private mappingService: MappingServiceProvider,
      private properties: Properties,
      private blockchainService: BlockchainServiceProvider,
      private translate: TranslateService,
      private apiService: ApiServiceProvider,
      private _sanitizer: DomSanitizer,
      private loadingCtrl: LoadingController,
      private logger: LoggerService,
      private storage: StorageServiceProvider,
      private router: Router,
      private toastCtrl: ToastController,
      private navController: NavController
   ) {
      this.result = this.router.getCurrentNavigation().extras.queryParams.result;
      this.shopID = this.router.getCurrentNavigation().extras.queryParams.ShopId;
      this.nftName = this.router.getCurrentNavigation().extras.queryParams.NFTname;
      this.email = this.router.getCurrentNavigation().extras.queryParams.email;
      this.otp = this.router.getCurrentNavigation().extras.queryParams.otp;
      this.CustomMsg = this.router.getCurrentNavigation().extras.queryParams.CustomMsg;

      if (this.result) {
         this.SVG = this.result.svg;
         this.SVGID = this.result.svgid;
         this.presentLoading('Loading...');
         this.convertToBase64(this.result.svg);
      }
      // this.account = this.properties.defaultAccount;
      // this.blockchainService
      //    .accountBalance(this.account.pk)
      //    .then(balance => {
      //       this.accountFunds = balance.toString();
      //    })
      //    .catch(err => {
      //       this.accountFunds = '0 ';
      //    });
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

   convertToBase64(svg: any) {
      var encodedData = btoa(unescape(encodeURIComponent(svg)));
      console.log('converted base64: ', encodedData);
      this.hash = CryptoJS.SHA256(encodedData).toString(CryptoJS.enc.Hex);
      console.log('converted hash: ', this.hash);
      let str1 = new String('data:image/svg+xml;base64,');
      this.img = str1 + encodedData;
      this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(this.img);
      setTimeout(() => {
         this.dissmissLoading();
      }, 100);

      this.apiService.updatePutSVG(this.SVGID, this.hash).subscribe(
         (res: any) => {
            console.log('update svg API result : ', res);
         },
         error => {
            console.log(error);
         }
      );
   }

   loadSVG(hash: string) {
      console.log('hash: ', hash);
      this.apiService.getSVGByHash(hash).subscribe((res: any) => {
         console.log('get svg by hash response: ', res);
         this.Decryption = res.Response;
         // this.dec = btoa(this.Decryption);
         // console.log('dec content:', this.dec);
         // var str2 = this.dec.toString();
         // var str1 = new String('data:image/svg+xml;base64,');
         // let t = str1 + this.dec;
         // console.log(t);

         const svgString = this.Decryption.toString();
         console.log(svgString);

         const base64String = btoa(svgString);

         let imgElement = `data:image/svg+xml;base64,${base64String}`;
         this.imageSrc = imgElement;
         console.log(imgElement);
         // var src = str1.concat(str2.toString());
         // this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(src);
         // console.log('this image: ', this.imageSrc);
      });
   }

   createNFT() {
      this.presentLoading('Checking account...');
      console.log('--------------1----------------');
      this.storage.getBcAccounts(this.email).then((res1: any) => {
         console.log('retieved result ', res1);
         if (res1 != null) {
            this.keypair = Keypair.fromSecret(res1);
            console.log('Public Key is', this.keypair.publicKey().toString());
            console.log('Secret Key is', this.keypair.secret().toString());
            this.sponsorOldAcc();
         } else {
            this.presentToast("You don't have an account exisiting with your username. Proceeding to creating a new one!");
            this.createNewAccount();
         }
      }),
         error => {
            console.log('blockchain', error);
         };
   }

   createNewAccount(): void {
      this.loading.message = 'Creating a new account...';
      console.log('acc gen started');
      this.keypair = this.blockchainService.createAddress();
      console.log('Public Key is', this.keypair.publicKey().toString());
      console.log('Secret Key is', this.keypair.secret().toString());
      console.log('Keypair is', this.keypair);
      this.storage
         .setBcAccounts(this.email, this.keypair.secret().toString())
         .then(res => {
            console.log('result ', res);
            // this.presentToast('Successfully set!');
            this.sponsorNewAcc();
         })
         .catch(error => {
            if (this.loadingState) {
               this.dissmissLoading();
            }
         });
   }

   sponsorNewAcc() {
      this.loading.message = 'Sponsoring...';
      console.log('New Account');
      this.accountType = 'new';
      this.apiService
         .getNewIssuerPublicKey()
         .then(issuerPublcKey => {
            console.log('Issuer: ', issuerPublcKey);
            this.Issuer = issuerPublcKey.NFTIssuerPK;
            console.log('issuer json: ', this.Issuer);

            if (this.nftName != null) {
               console.log('Entering if condtion PK : ', this.keypair.publicKey().toString());
               console.log('Entering if condtion other data : ', this.nftName, this.Issuer);
               this.apiService.getAccountFunded(this.keypair.publicKey().toString(), this.nftName, this.Issuer).then(txn => {
                  console.log('The transaction for account funding', txn);
                  console.log('XDR from gateway : ', txn.XDR);
                  this.xdr = txn.XDR;

                  console.log('after ', this.xdr);
                  this.blockchainService.signandsubmitXdr(this.xdr, this.keypair.secret().toString()).then((res): any => {
                     console.log(res);
                     if (res.successful) {
                        this.transactionResult = true;
                        this.mintNFT();
                     }
                  });
               });
            }
         })
         .catch(error => {
            if (this.loadingState) {
               this.dissmissLoading();
            }
            this.logger.error('NFT reciveing issue in gateway side : ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.translate.get(['ERROR', 'TRANSFER_NFT']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['TRANSFER_NFT']);
            });
         });
   }

   sponsorOldAcc() {
      this.loading.message = 'Sponsoring...';
      this.accountType = 'old';
      this.apiService
         .getNewIssuerPublicKey()
         .then(issuerPublcKey => {
            console.log('Issuer: ', issuerPublcKey);
            this.Issuer = issuerPublcKey.NFTIssuerPK;
            console.log('issuer json: ', this.Issuer);

            if (this.nftName != null) {
               console.log('Entering if condtion PK : ', this.keypair.publicKey().toString());
               console.log('Entering if condtion other data : ', this.nftName, this.Issuer);
               this.apiService.getTrustFunded(this.keypair.publicKey().toString(), this.nftName, this.Issuer).then(txn => {
                  console.log('The transaction for account funding', txn);
                  console.log('XDR from gateway : ', txn.XDR);
                  this.xdr = txn.XDR;

                  console.log('after ', this.xdr);
                  this.blockchainService.signandsubmitXdr(this.xdr, this.keypair.secret().toString()).then((res): any => {
                     console.log(res);
                     if (res.successful) {
                        this.transactionResult = true;
                        this.mintNFT();
                     }
                  });
               });
            }
         })
         .catch(error => {
            if (this.loadingState) {
               this.dissmissLoading();
            }

            this.logger.error('NFT reciveing issue in gateway side : ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.translate.get(['ERROR', 'TRANSFER_NFT']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['TRANSFER_NFT']);
            });
         });
   }

   mintNFT() {
      this.loading.message = 'NFT Minting...';
      if (this.transactionResult == true) {
         this.apiService
            .minNFTStellar(
               this.transactionResult,
               this.Issuer,
               this.keypair.publicKey().toString(),
               this.nftName,
               'RURI',
               'Gems',
               this.NFTBlockChain,
               'Time', //this.transactionResult.created_at
               'Gems',
               this.hash
            )
            .then(nft => {
               let NFT = {
                  IssuerPublicKey: this.Issuer,
                  NFTCreator: this.keypair.publicKey().toString(),
                  NFTName: this.nftName,
                  NFTContent: this.hash,
                  Description: this.CustomMsg,
                  Collection: 'Ruri',
                  BlockChain: 'stellar',
                  NFTStatus: 'Minted',
                  OTP: this.otp,
                  Email: this.email,
                  Timestamp: new Date().toISOString(),
                  TXNHash: nft.body.NFTTxnHash,
                  ShopId: this.shopID,
               };
               this.apiService
                  .walletNftSave(NFT)
                  .then(res => {
                     if (this.loadingState) {
                        this.dissmissLoading();
                     }
                     // this.navController.navigateRoot('/mint-nft');
                     // window.history.replaceState(null, null, window.location.href);
                     this.successful();

                     // this.router.navigate(['/mint-nft'], { replaceUrl: true });
                  })
                  .catch(error => {
                     console.log(error);
                     if (this.loadingState) {
                        this.dissmissLoading();
                     }
                     this.translate.get(['ERROR', 'INCORRECT_TRANSACTION']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['INCORRECT_TRANSACTION']);
                     });
                  });

               this.logger.info('NFT created', this.properties.skipConsoleLogs, this.properties.writeToFile);
               // this.translate.get(['MINTED', `NFT ${this.nftName} WAS MINTED`]).subscribe(text => {
               //    this.presentToast(text[`NFT ${this.nftName} WAS MINTED`]);
               // });
            })
            .catch(error => {
               if (this.loadingState) {
                  this.dissmissLoading();
               }
               console.log('somthing wrong 1', error);
               this.translate.get(['ERROR', 'INCORRECT_TRANSACTION']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['INCORRECT_TRANSACTION']);
               });
            });
      } else {
         if (this.loadingState) {
            this.dissmissLoading();
         }
         console.log('somthing wrong 2');
         this.translate.get(['ERROR', 'INCORRECT_TRANSACTION']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_TRANSACTION']);
         });
      }
   }

   async presentAlert(title: string, message: string) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => {
                  this.router.navigate(['/otp-page'], { replaceUrl: true, state: { otpForm: true } });
               },
            },
         ],
      });
      await alert.present();
   }

   async successful() {
      const alert = await this.alertCtrl.create({
         header: 'Your NFT has been claimed and minted successfully.',
         backdropDismiss: false,
         buttons: [
            {
               text: 'OK',
               role: 'confirm',
               handler: () => {
                  if (this.accountType == 'new') {
                     const option: NavigationExtras = {
                        state: { keys: this.keypair },
                     };
                     this.router.navigate(['/get-key'], option);
                  } else {
                     this.router.navigate(['/get-nft'], { replaceUrl: true });
                  }
               },
            },
         ],
      });
      await alert.present();
   }

   async transactionPasswordPopUp(accountName, curretBalance, mintingCost, changeTrustCreationCost, CollateralFee): Promise<string> {
      let resolveFunction: (password: string) => void;
      let promise = new Promise<string>(resolve => {
         resolveFunction = resolve;
      });
      const popup = await this.alertCtrl.create({
         cssClass: 'custom-alert',
         header: 'Sign Trasaction',
         subHeader: `<p>Account ${accountName}</p> <p>Balance ${curretBalance}</p>`,
         message: `  <p>Operation cost from tracified<p><ul><li>Payment Operation : 0.00001<li><li>Manage Data Operation : 0.00001</li><li>Set Option : 0.00001</li></ul><p>Total Cost : 0.00003</p><br>
      <p>Operations cost from your wallet</p><ul><li>Change Trust creation:${changeTrustCreationCost}</li><li>Collateral Fee:${CollateralFee}</li></ul><p>Total Minting Cost:${mintingCost}</p>`,
         inputs: [
            {
               name: 'password',
               placeholder: 'Password',
               type: 'password',
            },
         ],
         buttons: [
            {
               text: 'Cancel',
               role: 'cancel',
               handler: data => {},
            },
            {
               text: 'OK',
               handler: data => {
                  if (data.password) {
                     resolveFunction(data.password);
                  }
               },
            },
         ],
         backdropDismiss: false,
      });
      await popup.present();
      return promise;
   }

   encryptSecretKey() {
      this.keyDecrypted = false;
      this.privateKey = '';
   }

   ionViewDidLeave() {
      this.keyDecrypted = false;
      this.privateKey = '';
   }

   async presentLoading(msg) {
      console.log('loading');
      this.loading = await this.loadingCtrl.create({
         message: msg,
         backdropDismiss: false,
      });

      await this.loading.present();
      this.loadingState = true;
   }

   async dissmissLoading() {
      this.loadingState = false;
      console.log('dismiss');

      await this.loading.dismiss();
   }

   getRemainingCharacters(fieldName: string): number {
      if (fieldName === 'nftName') {
         return 12 - this.nftName.length;
      } else if (fieldName === 'recipientsName') {
         return 15 - this.recipientsName.length;
      } else if (fieldName === 'message') {
         return 50 - this.message.length;
      } else {
         return 0;
      }
   }

   async presentToast(msg) {
      const toast = await this.toastCtrl.create({
         message: msg,
         duration: 3000,
         position: 'bottom',
      });
      await toast.present();
   }
}
