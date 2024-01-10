import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Items } from '../../providers/items/items';
import { Networks, Keypair, Transaction } from 'stellar-base';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { Properties } from '../../shared/properties';
import { DataServiceProvider } from '../../providers/data-service/data-service';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { TranslateService } from '@ngx-translate/core';
import { blockchainNetType } from 'src/app/shared/config';
import { TOAST_TIMER } from 'src/environments/environment';
import { NFTServiceProvider } from 'src/app/providers/blockchain-service/nft-service';
import { SeedPhraseService, BlockchainType } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { NFTStatus, NFTTransfer } from 'src/app/shared/nft';
import { Keypair as StellerKeyPair } from 'stellar-base';

@Component({
   selector: 'page-item-received',
   templateUrl: 'item-received.html',
   styleUrls: ['./item-received.scss'],
})
export class ItemReceivedPage {
   @ViewChildren('theLastItem', { read: ElementRef }) theLastItem: QueryList<ElementRef>;
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   searchTerm: any = '';
   Searcheditems: {
      date: string;
      uname: string;
      oname: string;
      qty: string;
      validity: string;
      time: string;
      status: string;
   }[];
   timeBound: number;
   user: any;
   loading;
   isLoadingPresent: boolean;
   items = [];
   mainAccount: any;
   list: any = [];
   defAccount: any;
   keypair: any;
   mnemonic: any;

   observer: any;
   currentPage: number = 0;
   nextPage: number = 0;

   filteredList: any = [];

   cocReceived = new Array();

   statusText: any;
   statusNumber = NFTStatus;

   constructor(
      public navCtrl: NavController,
      public apiService: ApiServiceProvider,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      public toastCtrl: ToastController,
      public itemsProvider: Items,
      private properties: Properties,
      private dataService: DataServiceProvider,
      private logger: LoggerService,
      private blockchainService: BlockchainServiceProvider,
      private translate: TranslateService,
      private storage: StorageServiceProvider,
      private nftService: NFTServiceProvider
   ) {}

   async ngOnInit() {
      this.statusText = await this.translate.get(['REQ_SENT', 'REQ_RCVD', 'REQ_ACCPTD', 'REQ_REJTD', 'SENT', 'RECEIVED']).toPromise();
   }

   ionViewDidEnter() {
      this.mainAccount = this.properties.defaultAccount;
      //this.getAllCoCs();
      /* const item = {
         assetCode: 'Mango',
         quantity: 10,
         Identifier: 'Test',
         receiver: 'John Doe',
         validTill: '7/29/2022, 12:36 PM',
         Status: 'Expired',
         sentDate: '4/27/2022 12:37:38 PM',
         type: 'item',
      };

      const nft = {
         nftname: 'NFT',
         type: 'nft',
         date: '4/27/2022 12:37:38 PM',
         receiver: '38445X3FKSJBS38445X3FKSJBS38445X3FKSJBS38445X3FKSJBS',
         hash: 'string',
         status: 'Request Received',
      };
      this.list.push(item);
      this.list.push(nft); */
      this.resetAll();
      this.theLastItem?.changes.subscribe(d => {
         if (d.last) this.observer.observe(d.last.nativeElement);
      });
      this.intersectionObserver();
      this.getSentNfts();
   }

   ionViewDidLeave() {
      this.resetAll();
   }

   async handleRefresh(event) {
      /* this.mainAccount = this.properties.defaultAccount;
      this.getAllCoCs();
      await event.target.complete(); */
      this.resetAll();
      this.theLastItem?.changes.subscribe(d => {
         if (d.last) this.observer.observe(d.last.nativeElement);
      });
      this.intersectionObserver();
      this.getSentNfts();
   }

   getNetwork() {
      return blockchainNetType === 'live' ? Networks.PUBLIC : Networks.TESTNET;
   }

   async getAllCoCs() {
      await this.presentLoading();
      this.cocReceived = [];
      this.dataService
         .getAllReceivedCoCs(this.mainAccount.pk)
         .then(res => {
            let cocs = res.body;
            if (cocs.length > 0) {
               let senderPks = new Array();
               for (let i = 0; i < cocs.length; i++) {
                  senderPks.push(cocs[i].Sender);
               }
               const param = {
                  account: {
                     accounts: senderPks,
                  },
               };

               this.dataService
                  .getAccountNamesOfKeys(param)
                  .then(res => {
                     let accountNames = res.body.pk;
                     cocs.forEach(coc => {
                        const transaction = new Transaction(coc.AcceptXdr, this.getNetwork());
                        let minTimeNumber = Number(transaction.timeBounds.minTime) * 1000;
                        let maxTimeNumber = Number(transaction.timeBounds.maxTime) * 1000;
                        let minTime = new Date(minTimeNumber);
                        let maxTime = new Date(maxTimeNumber);

                        let assetName;
                        let amount;
                        let sender;

                        transaction.operations.forEach(operation => {
                           if (operation.type == 'payment') {
                              assetName = operation.asset.code;
                              amount = operation.amount;
                              sender = operation.source;
                           }
                        });

                        let cocObj = {
                           cocOriginal: {
                              AcceptTxn: coc.AcceptTxn,
                              AcceptXdr: coc.AcceptXdr,
                              RejectTxn: coc.RejectTxn,
                              RejectXdr: coc.RejectXdr,
                              Receiver: coc.Receiver,
                              Sender: coc.Sender,
                              SequenceNo: coc.SequenceNo,
                              SubAccount: coc.SubAccount,
                              TxnHash: coc.TxnHash,
                              Status: coc.Status,
                              Identifier: coc.Identifier,
                           },
                           sender: sender,
                           assetCode: assetName,
                           quantity: amount,
                           validTill: maxTime.toLocaleString(),
                           sentDate: minTime.toLocaleString(),
                           sentOriginal: minTime,
                        };

                        cocObj.sender = accountNames.find(o => cocObj.sender == o.pk).accountName;
                        this.cocReceived.push(cocObj);
                     });
                     this.cocReceived.sort((a, b) => (a.sentOriginal < b.sentOriginal ? 1 : -1));
                     this.dissmissLoading();
                  })
                  .catch(async err => {
                     await this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_FETCH_ACCOUNT']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_ACCOUNT'], true);
                     });
                     this.logger.error('Could not get the account names: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                  });
            } else {
               this.dissmissLoading();
            }
         })
         .catch(async err => {
            await this.dissmissLoading();
            if (err.status != 400) {
               this.translate.get(['ERROR', 'FAILED_TO_FETCH_RECEIVED']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_RECEIVED'], true);
               });
            }
            this.logger.error('Could not load CoCs: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
   }

   updateCoC(coc, status) {
      let count = this.pendingCoCCount(coc.sentOriginal, this.cocReceived);

      if (count > 0) {
         this.translate.get(['ERROR', 'ACC_REJECT_PENDING_COC']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['ACC_REJECT_PENDING_COC'], true);
         });
         return;
      }
      this.passwordPromptResponseWait()
         .then(async password => {
            await this.presentLoading();
            this.blockchainService
               .validateTransactionPassword(password, this.mainAccount.sk, this.mainAccount.pk)
               .then(decKey => {
                  if (status == 'accept') {
                     coc.cocOriginal.AcceptXdr = this.blockchainService.signXdr(coc.cocOriginal.AcceptXdr, decKey);
                     coc.cocOriginal.Status = 'accepted';
                  } else if (status == 'reject') {
                     coc.cocOriginal.RejectXdr = this.blockchainService.signXdr(coc.cocOriginal.RejectXdr, decKey);
                     coc.cocOriginal.Status = 'rejected';
                  }
                  this.dataService
                     .updateCoC(coc.cocOriginal)
                     .then(async res => {
                        await this.dissmissLoading();
                        if (status == 'accept') {
                           this.translate.get(['SUCCESS', 'SUCCESS_ACCEPTED', 'UPDATED_RESULTS_TRANSFER']).subscribe(text => {
                              this.presentAlert(text['SUCCESS'], text['UPDATED_RESULTS_TRANSFER'], true);
                           });
                        } else if (status == 'reject') {
                           this.translate.get(['SUCCESS', 'SUCCESS_REJECTED', 'ASSET_NOT_CHANGE']).subscribe(text => {
                              this.presentAlert(text['SUCCESS'], text['ASSET_NOT_CHANGE'], true);
                           });
                        }
                     })
                     .catch(async err => {
                        await this.dissmissLoading();
                        coc.cocOriginal.Status = 'pending';
                        this.translate.get(['ERROR', 'COULD_NOT_PROCEED']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['COULD_NOT_PROCEED'], true);
                        });
                        this.logger.error('Failed to update the CoC: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                     });
               })
               .catch(async err => {
                  await this.dissmissLoading();
                  this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['INVALID_PASSWORD'], true);
                  });
                  this.logger.error('Validating password failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
               });
         })
         .catch(err => {
            this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['INVALID_PASSWORD'], true);
            });
            this.logger.error('Invalid password: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
   }

   passwordPromptResponseWait() {
      return new Promise(async (resolve, reject) => {
         let passwordPrompt = await this.alertCtrl.create({
            header: 'Transaction Password',
            inputs: [
               {
                  name: 'password',
                  placeholder: 'Password...',
                  type: 'password',
               },
            ],
            buttons: [
               {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: data => {
                     reject();
                  },
               },
               {
                  text: 'Submit',
                  handler: data => {
                     if (data.password != '') {
                        resolve(data.password);
                     }
                  },
               },
            ],
         });
         await passwordPrompt.present();
      });
   }

   pendingCoCCount(date: Date, array: any) {
      let count = 0;
      for (var i = 0; i < array.length; i++) {
         if (array[i].sentOriginal.getTime() < date.getTime() && array[i].cocOriginal.Status == 'pending') {
            count++;
         }
      }
      return count;
   }

   doRefresh(refresher) {
      this.getAllCoCs();
      refresher.complete();
   }

   async presentLoading() {
      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         message: 'Please Wait',
      });

      await this.loading.present();
   }

   async dissmissLoading() {
      this.isLoadingPresent = false;
      await this.loading.dismiss();
   }

   async presentToast(message) {
      let toast = await this.toastCtrl.create({
         message: message,
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });
      await toast.present();
   }

   async presentAlert(title, message, hideCancel: boolean, okFn?) {
      let buttons = [];

      if (!hideCancel) {
         buttons.push({
            text: 'CANCEL',
            role: 'cancel',
            handler: () => {},
         });
      }

      buttons.push({
         text: 'OK',
         role: 'confirm',
         handler: okFn,
      });
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons,
      });

      alert.present();
   }

   async showPublicKey(key: string) {
      let alert = await this.alertCtrl.create({
         message: key,
         buttons: [
            {
               text: 'Ok',
               role: 'confirm',
               handler: () => {},
            },
         ],
      });
      await alert.present();
   }

   intersectionObserver() {
      const option = {
         root: null,
         rootMargin: '0px',
         threshold: 1,
      };

      this.observer = new IntersectionObserver(entries => {
         if (entries[0].isIntersecting) {
            if (this.nextPage != 0 && this.searchTerm === '') {
               this.currentPage = this.nextPage;

               this.getSentNfts();
            }

            //this.getAllNFTs(filter);
         }
      }, option);
   }

   /**
    * Fetch sent nfts
    */
   private async getSentNfts() {
      await this.presentLoading();
      /*  if (this.currentPage == 0) {
         this.list = [];
      } */

      await this.getKeyPair();
      this.nftService.getPendingNFTRequestByReceiver('stellar', this.keypair.publicKey().toString(), this.currentPage, 5).subscribe({
         next: (res: any) => {
            if (res.Response.walletcontent) {
               res.Response.walletcontent.map((data: NFTTransfer) => {
                  this.list.push({
                     ...data,
                     type: 'nft',
                     timestamp: new Date(data.timestamp).toLocaleString(),
                  });
               });
            } else {
               this.list = [];
            }

            this.filteredList = this.list;
            this.nextPage = res.Response.PaginationInfo.nextpage;
            this.dissmissLoading();
         },
         error: () => {
            this.dissmissLoading();
            this.resetAll();
         },
      });
   }

   /**
    * get key pair using default account
    */
   async getKeyPair() {
      await this.storage
         .getMnemonic()
         .then(async data => {
            this.mnemonic = data;
            await this.getDefault();

            if (!this.defAccount) {
               this.defAccount = 0;
            }
            this.keypair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, this.defAccount, this.mnemonic) as StellerKeyPair;
         })
         .catch(error => {
            // this.presentToast("You don't have an account.");
         });
   }

   /**
    * get default bc account index
    */
   public async getDefault() {
      await this.storage
         .getDefaultAccount()
         .then(acc => {
            this.defAccount = acc;
         })
         .catch(() => {
            this.defAccount = false;
         });
   }

   /**
    * Returns nft status according to the number given
    * @param status nft state
    * @returns
    */
   public getNftStatusText(status: number): string {
      switch (status) {
         case NFTStatus.TrustLineToBeCreated:
            return this.statusText['REQ_RCVD'];

         case NFTStatus.TrustLineCreated:
            return this.statusText['REQ_ACCPTD'];

         case NFTStatus.RequestForTrustLineRejected:
            return this.statusText['REQ_REJTD'];

         case NFTStatus.nftTransferAccepted:
            return this.statusText['RECEIVED'];

         default:
            return status.toString();
      }
   }

   public setFilteredItems(event: any) {
      let name = event.detail.value;

      if (name === '') {
         this.filteredList = this.list;
      } else {
         this.filteredList = this.list.filter(item => {
            return item.nftname.toLowerCase().includes(name.toLowerCase());
         });
      }
   }

   /**
    * Confirmation before accepting a request
    * @param issuerPk issuer public key
    */
   public async acceptRequestConfirmation(issuerPk: string) {
      const text = await this.translate.get(['TRANSFER_REQ_ACCEPT', 'TRANSFER_REQ_ACCEPT_DESC']).toPromise();
      await this.presentAlert(text['TRANSFER_REQ_ACCEPT'], text['TRANSFER_REQ_ACCEPT_DESC'], false, () => {
         this.acceptRequest(issuerPk);
      });
   }

   /**
    * Accept request
    * @param issuerPk issuer public key
    */
   public async acceptRequest(nft: any) {
      await this.presentLoading();
      this.nftService
         .checkAccountStatusAndBalance(this.keypair.publicKey().toString())
         .then(() => {
            this.nftService
               .createTrustLineForNFTTransfer(nft.issuerpublickey, this.defAccount, nft.currentowner, nft.nftname)
               .then(() => {
                  this.nftService.UpdateNFTState(nft.Id, nft.issuerpublickey, NFTStatus.TrustLineCreated).subscribe({
                     next: async () => {
                        this.dissmissLoading();
                        const text = await this.translate.get(['TRANSFER_REQ_ACCEPT', 'TRANSFER_REQ_ACCEPT_SUCCESS']).toPromise();
                        await this.presentAlert(text['TRANSFER_REQ_ACCEPT'], text['TRANSFER_REQ_ACCEPT_SUCCESS'], true, () => {
                           this.currentPage = 1;
                           this.nextPage = 0;
                           this.list = [];
                           this.getSentNfts();
                        });
                     },
                     error: async () => {
                        this.dissmissLoading();
                        const text = await this.translate.get(['ERROR', 'TRANSFER_REQ_ACCEPT_ERROR']).toPromise();
                        await this.presentAlert(text['ERROR'], text['TRANSFER_REQ_ACCEPT_ERROR'], true);
                     },
                  });
               })
               .catch(async err => {
                  this.dissmissLoading();
                  const text = await this.translate.get(['ERROR', 'TRANSFER_REQ_ACCEPT_ERROR']).toPromise();
                  await this.presentAlert(text['ERROR'], text['TRANSFER_REQ_ACCEPT_ERROR'], true);
               });
         })
         .catch(async err => {
            this.dissmissLoading();
            const text = await this.translate.get(['ERROR', 'TRANSFER_REQ_ACCEPT_ERROR']).toPromise();
            await this.presentAlert(text['ERROR'], err, true);
         });
   }

   /**
    * confirmation before rejecting a request
    * @param issuerPk issuer public key
    */
   public async rejectRequestConfirmation(id: string, issuerPk: string) {
      const text = await this.translate.get(['TRANSFER_REQ_REJECT', 'TRANSFER_REQ_REJECT_DESC']).toPromise();
      await this.presentAlert(text['TRANSFER_REQ_REJECT'], text['TRANSFER_REQ_REJECT_DESC'], false, () => {
         this.rejectRequest(id, issuerPk);
      });
   }

   /**
    * Reject request
    * @param issuerPk issuer public key
    */
   public async rejectRequest(id: string, issuerPk: string) {
      await this.presentLoading();
      this.nftService.UpdateNFTState(id, issuerPk, NFTStatus.RequestForTrustLineRejected).subscribe({
         next: async () => {
            this.dissmissLoading();
            const text = await this.translate.get(['TRANSFER_REQ_REJECT', 'TRANSFER_REQ_REJECT_SUCCESS']).toPromise();
            await this.presentAlert(text['TRANSFER_REQ_REJECT'], text['TRANSFER_REQ_REJECT_SUCCESS'], true, () => {
               this.currentPage = 1;
               this.nextPage = 0;
               this.list = [];
               this.getSentNfts();
            });
         },
         error: async () => {
            this.dissmissLoading();
            const text = await this.translate.get(['ERROR', 'TRANSFER_REQ_REJECT_ERROR']).toPromise();
            await this.presentAlert(text['ERROR'], text['TRANSFER_REQ_REJECT_ERROR'], true);
         },
      });
   }

   private resetAll() {
      this.currentPage = 0;
      this.nextPage = 0;
      this.list = [];
   }
}
