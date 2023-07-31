import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { Items } from '../../providers/items/items';
import { Networks, Keypair, Transaction } from 'stellar-base';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { AES, enc } from 'crypto-js';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { TranslateService } from '@ngx-translate/core';
import { blockchainNetType } from 'src/app/shared/config';
import { NFTServiceProvider } from 'src/app/providers/blockchain-service/nft-service';
import { SeedPhraseService, BlockchainType } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { Keypair as StellerKeyPair } from 'stellar-base';
import { NFTTransfer } from 'src/app/shared/nft';

interface Item {
   assetCode: string;
   quantity: number;
   type: string;
   sentDate: string;
   receiver: string;
   Identifier: string;
   validTill: string;
   Status: string;
}

interface NFT {
   nftname: string;
   type: string;
   timestamp: string;
   receiver: string;
   hash: string;
   status: string;
}

@Component({
   selector: 'page-item-sent',
   templateUrl: 'item-sent.html',
   styleUrls: ['./item-sent.scss'],
})
export class ItemSentPage {
   @ViewChildren('theLastItem', { read: ElementRef }) theLastItem: QueryList<ElementRef>;
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   searchTerm: any = '';
   items = [];
   Searcheditems: { date: string; uname: string; oname: string; qty: string; validity: string; time: number; status: string }[];
   user: any;
   loading;
   isLoadingPresent: boolean;
   Citems: any;
   mainAccount: any;
   cocSent = new Array();

   list: any = [];
   filteredList: any = [];
   defAccount: any;
   keypair: any;
   mnemonic: any;

   observer: any;
   currentPage: number = 1;
   nextPage: number = 0;

   statusText: any;

   constructor(
      public navCtrl: NavController,
      public apiService: ApiServiceProvider,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      public itemsProvider: Items,
      private storage: StorageServiceProvider,
      private properties: Properties,
      private logger: LoggerService,
      private dataService: DataServiceProvider,
      private translate: TranslateService,
      private nftService: NFTServiceProvider
   ) {}

   async ngOnInit() {
      this.statusText = await this.translate.get(['REQ_SENT', 'REQ_RCVD', 'REQ_ACCPTD', 'REQ_REJTD', 'SENT', 'RECEIVED']).toPromise();
   }

   ionViewDidEnter() {
      /* this.mainAccount = this.properties.defaultAccount;
      const item: Item = {
         assetCode: 'Mango',
         quantity: 10,
         Identifier: 'Test',
         receiver: 'John Doe',
         validTill: '7/29/2022, 12:36 PM',
         Status: 'Expired',
         sentDate: '4/27/2022 12:37:38 PM',
         type: 'item',
      };

      const nft: NFT = {
         nftname: 'NFT',
         type: 'nft',
         date: '4/27/2022 12:37:38 PM',
         receiver: '38445X3FKSJBS38445X3FKSJBS38445X3FKSJBS38445X3FKSJBS',
         hash: 'string',
         status: 'Sent',
      };
      this.list.push(item);
      this.list.push(nft);
      this.cocSent.push(item); */
      //this.getAllCoCs();

      this.theLastItem?.changes.subscribe(d => {
         if (d.last) this.observer.observe(d.last.nativeElement);
      });
      this.intersectionObserver();
      this.getSentNfts();
   }

   ionViewDidLeave() {
      this.currentPage = 1;
      this.nextPage = 0;
      this.list = [];
   }

   doRefresh(refresher) {
      this.getAllCoCs();
      refresher.complete();
   }
   async handleRefresh(event) {
      /* await this.getAllCoCs();
      await event.target.complete(); */
      this.currentPage = 1;
      this.nextPage = 0;
      this.list = [];
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
      this.cocSent = [];
      this.dataService
         .getAllSentCoCs(this.mainAccount.pk)
         .then(res => {
            let cocs = res.body;
            if (cocs.length > 0) {
               let senderPks = new Array();
               for (let i = 0; i < cocs.length; i++) {
                  senderPks.push(cocs[i].Receiver);
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
                        let receiver;

                        transaction.operations.forEach(operation => {
                           if (operation.type == 'payment') {
                              assetName = operation.asset.code;
                              amount = operation.amount;
                              receiver = operation.destination;
                           }
                        });

                        let cocObj = {
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

                           receiver: receiver,
                           assetCode: assetName,
                           quantity: amount,
                           validTill: maxTime.toLocaleString(),
                           sentDate: minTime.toLocaleString(),
                           sentOriginal: minTime,
                        };
                        cocObj.receiver = accountNames.find(o => cocObj.receiver == o.pk).accountName;
                        this.cocSent.push(cocObj);
                     });
                     this.cocSent.sort((a, b) => (a.sentOriginal < b.sentOriginal ? 1 : -1));
                     this.dissmissLoading();
                  })
                  .catch(async err => {
                     await this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_FETCH_ACCOUNT_SENT']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_ACCOUNT_SENT']);
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
               this.translate.get(['ERROR', 'FAILED_TO_FETCH_SENT']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_SENT']);
               });
            }
            this.logger.error('Could not load CoCs: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
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

   async presentAlert(title, message, okFn?: any) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               role: 'confirm',
               handler: okFn,
            },
         ],
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
               this.currentPage++;
               console.log('page', this.currentPage);
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
      this.nftService.getNFTByPublicKey('stellar', this.keypair.publicKey().toString(), this.currentPage, 5).subscribe({
         next: (res: any) => {
            console.log(res.Response.walletnft);
            res.Response.walletcontent.map((data: NFTTransfer) => {
               this.list.push({
                  ...data,
                  type: 'nft',
                  timestamp: new Date(data.timestamp).toLocaleString(),
               });
            });
            this.filteredList = this.list;
            this.nextPage = res.Response.PaginationInfo.nextpage;
            this.dissmissLoading();
         },
         error: () => {
            this.dissmissLoading();
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
            console.log(this.defAccount);
            if (!this.defAccount) {
               this.defAccount = 0;
            }
            this.keypair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, this.defAccount, this.mnemonic) as StellerKeyPair;
            console.log(this.keypair);
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
         case 1:
            return this.statusText['REQ_SENT'];

         case 2:
            return this.statusText['REQ_ACCPTD'];

         case 3:
            return this.statusText['REQ_REJTD'];

         case 4:
            return this.statusText['SENT'];

         default:
            return status.toString();
      }
   }

   /**
    * Search items
    * @param event search term change event
    */
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

   public async cancelRequestConfirmation(issuerPk: string) {
      const text = await this.translate.get(['TRANSFER_REQ_CANCEL', 'TRANSFER_REQ_CANCEL_DESC']).toPromise();
      await this.presentAlert(text['TRANSFER_REQ_CANCEL'], text['TRANSFER_REQ_CANCEL_DESC'], () => {
         this.cancelRequest(issuerPk);
      });
   }

   /**
    * Cancel nft transfer request
    * @param issuerPk issuer public key
    */
   public async cancelRequest(issuerPk: string) {
      await this.presentLoading();
      this.nftService.DeleteNFTTransferNFTRequestbyIssuerPublicKey(issuerPk).subscribe({
         next: async () => {
            this.dissmissLoading();
            const text = await this.translate.get(['TRANSFER_REQ_CANCEL', 'TRANSFER_REQ_CANCEL_SUCCESS']).toPromise();
            await this.presentAlert(text['TRANSFER_REQ_CANCEL'], text['TRANSFER_REQ_CANCEL_SUCCESS'], () => {
               this.currentPage = 1;
               this.nextPage = 0;
               this.list = [];
               this.getSentNfts();
            });
         },
         error: async () => {
            this.dissmissLoading();
            const text = await this.translate.get(['ERROR', 'TRANSFER_REQ_CANCEL_ERROR']).toPromise();
            await this.presentAlert(text['ERROR'], text['TRANSFER_REQ_CANCEL_ERROR']);
         },
      });
   }

   public async sentNftConfirmation(issuerPk: string) {
      const text = await this.translate.get(['SEND_NFT_TITLE', 'SEND_NFT_DESC']).toPromise();
      await this.presentAlert(text['SEND_NFT_TITLE'], text['SEND_NFT_DESC'], () => {
         this.sentNftRequest(issuerPk);
      });
   }

   /**
    * Send nft
    * @param issuerPk issuer public key
    */
   public async sentNftRequest(issuerPk: string) {
      await this.presentLoading();
      this.nftService.UpdateNFTState(issuerPk, 4).subscribe({
         next: async () => {
            this.dissmissLoading();
            const text = await this.translate.get(['SEND_NFT_TITLE', 'SEND_NFT_SUCCESS']).toPromise();
            await this.presentAlert(text['SEND_NFT_TITLE'], text['SEND_NFT_SUCCESS'], () => {
               this.currentPage = 1;
               this.nextPage = 0;
               this.list = [];
               this.getSentNfts();
            });
         },
         error: async () => {
            this.dissmissLoading();
            const text = await this.translate.get(['ERROR', 'SEND_NFT_ERROR']).toPromise();
            await this.presentAlert(text['ERROR'], text['SEND_NFT_ERROR']);
         },
      });
   }
}
