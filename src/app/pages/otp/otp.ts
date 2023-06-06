import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
// import { MintNftPage } from '../../pages/mint-nft/mint-nft';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { GetKeysPage } from '../../pages/get-keys/get-keys';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from 'src/app/providers/connectivity-service/connectivity-service';

//seed-phrase service
import { SeedPhraseService, BlockchainType, SolKeys } from '../../providers/seedPhraseService/seedPhrase.service';
import { Wallet } from 'ethers';
import { Keypair as StellerKeyPair } from "stellar-base"
import { PublicKey, Keypair as SolKeypair, } from "@solana/web3.js";
@Component({
   selector: 'page-otp',
   templateUrl: 'otp.html',
   styleUrls: ['./otp.scss'],
})
export class OtpPage {
   svgResult: any;
   email = '';
   shopId = '';

   verifyForm = new FormGroup({
      OTP: new FormControl('', Validators.required),
      Email: new FormControl('', Validators.email),
   });

   constructor(
      public toastCtrl: ToastController,
      public router: Router,
      private service: ApiServiceProvider,
      private loadingCtrl: LoadingController,
      private route: ActivatedRoute,
      public connectivity: ConnectivityServiceProvider,
      private seedPhraseService : SeedPhraseService
   ) {
      const emailParam = this.route.snapshot.queryParamMap.get('email');
      const shopidParam = this.route.snapshot.queryParamMap.get('shopId');

      if (emailParam) {
         this.email = emailParam;
      }
      if (shopidParam) {
         this.shopId = shopidParam;
      }
      if (emailParam && shopidParam) {
         this.connectivity.putMenuHide(true);
      }
      
   }

   async checkOTP() {
      // const validMnemonic = "arm thank snow ski juice check few slogan brush smoke deal type";
      // const mnemonic = await this.seedPhraseService.generateMnemonic();
      // const words = mnemonic.split(' ')
      // console.log("words: ",words);
      // const account: StellerKeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, 0, validMnemonic) as StellerKeyPair;
      // console.log("stellar account: ",account.publicKey());
      
      // const account1: Wallet = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Ethereum, 0, validMnemonic) as Wallet;
      // console.log("ETH poly account : ",account1.address)

      // const account2: SolKeys = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Solana, 0, validMnemonic) as SolKeys;
      // console.log("Solana accounts : ",account2)
      
      let otp = this.verifyForm.get('OTP').value;
      let mail = this.verifyForm.get('Email').value;
      await this.showLoading();
      this.service
         .checkOTP(otp, mail)
         .then(async res => {
            if (res.body.Status == 200 && res.body.Response.Status == 'Valid') {
               await this.dimissLoading();
               this.presentToast('OTP verified.');
               const option: NavigationExtras = {
                  state: {
                     ShopId: res.body.Response.ShopID,
                     otp: otp,
                     email: mail,
                  },
               };
               this.router.navigate(['/otp-nft'], option);
            }
         })
         .catch(async error => {
            let err = error.error;
            console.log(err);

            await this.dimissLoading();
            this.presentToast(err.message);
         });
   }

   async presentToast(msg) {
      const toast = await this.toastCtrl.create({
         message: msg,
         duration: 2500,
         position: 'bottom',
      });
      await toast.present();
   }

   async showLoading() {
      const loading = await this.loadingCtrl.create({
         message: 'Verifying...',
      });
      await loading.present();
   }

   async dimissLoading() {
      await this.loadingCtrl?.dismiss();
   }
}
