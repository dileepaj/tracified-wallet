import { Component, ElementRef, ViewChild } from '@angular/core';
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
   @ViewChild('myImage', { static: false }) myImage: ElementRef;
   reciverName: any;

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
      this.shopID = this.router.getCurrentNavigation().extras.state.ShopId;
      this.nftName = this.router.getCurrentNavigation().extras.state.NFTname;
      this.email = this.router.getCurrentNavigation().extras.state.email;
      this.otp = this.router.getCurrentNavigation().extras.state.otp;
      this.CustomMsg = this.router.getCurrentNavigation().extras.state.CustomMsg;
      this.reciverName = this.router.getCurrentNavigation().extras.state.ReciverName;

      this.getSVG();

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

   async getSVG() {
      await this.presentLoading('Generating SVG...');
      await this.updateSVG();
   }

   async updateSVG() {
      let data = {
         email: this.email,
         ShopId: this.shopID,
         ReciverName: this.reciverName,
         CustomMsg: this.CustomMsg,
         NFTname: this.nftName,
      };
      this.apiService
         .updateSVG(data)
         .then(res => {
            this.loading.message = 'Displaying SVG...';
            this.result = res.body.Response;
            this.SVG = this.result.svg;
            this.SVGID = this.result.svgid;
            this.convertToBase64(this.result.svg);
         })
         .catch(async error => {
            console.log(error);
            await this.dissmissLoading();
         });
   }

   async convertToBase64(svg: any) {
      var encodedData = btoa(unescape(encodeURIComponent(svg)));
      this.hash = CryptoJS.SHA256(encodedData).toString(CryptoJS.enc.Hex);

      let svgData = unescape(encodeURIComponent(svg));
      this.myImage.nativeElement.srcdoc = svgData;

      this.apiService.updatePutSVG(this.SVGID, this.hash).subscribe(
         async (res: any) => {
            await this.dissmissLoading();
            console.log('update svg API result : ', res);
         },
         async error => {
            await this.dissmissLoading();
            console.log(error);
         }
      );
   }

   async createNFT() {
      await this.presentLoading('Checking account...');
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
         .catch(async error => {
            if (this.loadingState) {
               await this.dissmissLoading();
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
         .catch(async error => {
            if (this.loadingState) {
               await this.dissmissLoading();
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
         .catch(async error => {
            if (this.loadingState) {
               await this.dissmissLoading();
            }

            this.logger.error('NFT reciveing issue in gateway side : ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.translate.get(['ERROR', 'TRANSFER_NFT']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['TRANSFER_NFT']);
            });
         });
   }

   async mintNFT() {
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
                  .then(async res => {
                     if (this.loadingState) {
                        await this.dissmissLoading();
                     }
                     // this.navController.navigateRoot('/mint-nft');
                     // window.history.replaceState(null, null, window.location.href);
                     this.successful();

                     // this.router.navigate(['/mint-nft'], { replaceUrl: true });
                  })
                  .catch(async error => {
                     console.log(error);
                     if (this.loadingState) {
                        await this.dissmissLoading();
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
            .catch(async error => {
               if (this.loadingState) {
                  await this.dissmissLoading();
               }
               console.log('somthing wrong 1', error);
               this.translate.get(['ERROR', 'INCORRECT_TRANSACTION']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['INCORRECT_TRANSACTION']);
               });
            });
      } else {
         if (this.loadingState) {
            await this.dissmissLoading();
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
      this.loading = await this.loadingCtrl.create({
         message: msg,
         backdropDismiss: false,
      });

      await this.loading.present();
      this.loadingState = true;
   }

   async dissmissLoading() {
      this.loadingState = false;
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
