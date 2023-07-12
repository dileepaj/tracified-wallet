import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@capacitor/clipboard';
import { LoadingController, ToastController } from '@ionic/angular';
import { Wallet } from 'ethers';
import { BlockchainType, SeedPhraseService, SolKeys } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { TOAST_TIMER } from 'src/environments/environment';
import { Keypair as StellerKeyPair } from 'stellar-base';
@Component({
   selector: 'app-bc-account-created',
   templateUrl: './bc-account-created.page.html',
   styleUrls: ['./bc-account-created.page.scss'],
})
export class BcAccountCreatedPage implements OnInit {
   stellarkeypair: StellerKeyPair;
   ethPolyKeyPair: Wallet;
   solana: SolKeys;
   data: any = [
      {
         title: 'Why do I need a Blockchain Account?',
         url: 'https://docs.tracified.com',
      },
      {
         title: 'Creating a Blockchain Account',
         url: 'https://docs.tracified.com',
      },
      {
         title: 'Importing a Blockchain Account',
         url: 'https://docs.tracified.com',
      },
   ];

   seedPhrase: Promise<unknown>;
   accounts: any[];
   toastInstance: any;
   loading: any;
   disableBtn: boolean = true;

   constructor(private forageService: StorageServiceProvider, private toastService: ToastController, private router: Router, private loadingCtrl: LoadingController) {}

   ngOnInit() {
      this.disableBtn = true;
      this.getBCAccounts();
   }

   public async writeToClipboard(text: string) {
      await Clipboard.write({
         string: text,
      });
   }

   public async getBCAccounts() {
      await this.presentLoading();
      if (this.seedPhrase !== null) {
         await this.forageService
            .getMnemonic()
            .then(mnemonic => {
               this.stellarkeypair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, 0, mnemonic) as StellerKeyPair;

               this.ethPolyKeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Ethereum, 0, mnemonic) as Wallet;

               this.solana = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Solana, 0, mnemonic) as SolKeys;

               //debug

               //end debug
            })
            .catch(async err => {
               this.toastInstance = await this.toastService.create({
                  message: 'Something went wrong please try again : ' + err,
                  duration: TOAST_TIMER.SHORT_TIMER,
                  position: 'bottom',
               });
               await this.toastInstance.present();
            });
      }
      this.accounts = [
         {
            blockchain: 'Ethereum',
            key: this.ethPolyKeyPair.address,
            icon: '../../../assets/icon/ethereum.svg',
         },
         {
            blockchain: 'Polygon',
            key: this.ethPolyKeyPair.address,
            icon: '../../../assets/icon/polygon.svg',
         },
         {
            blockchain: 'Stellar',
            key: this.stellarkeypair.publicKey(),
            icon: '../../../assets/icon/stellar-2.svg',
         },
         {
            blockchain: 'Solana',
            key: this.solana.publicKey.toString(),
            icon: '../../../assets/icon/solana.svg',
         },
      ];

      await this.dissmissLoading();
      this.disableBtn = false;
   }

   public continue() {
      this.router.navigate(['/tabs'], { state: { navigation: 'initial' } });
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });
      this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }
}
