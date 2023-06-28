import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { Keypair as StellerKeyPair } from "stellar-base"
@Component({
   selector: 'app-otp-bc-account',
   templateUrl: './otp-bc-account.page.html',
   styleUrls: ['./otp-bc-account.page.scss'],
})
export class OtpBcAccountPage implements OnInit {
   mnemonic;
   stellarkeyPair:StellerKeyPair
   constructor(
      private router: Router,
      private storageService:StorageServiceProvider,
      private seedPhraseSrevice:SeedPhraseService
   ) { }

   async ngOnInit() { 
      await this.generateTempAccounts()
      this.mnemonic =await this.storageService.getMnemonic();
      let rst = await this.storageService.getAllMnemonicProfiles();
      for(const account of rst){
         this.stellarkeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar,account.value,this.mnemonic) as StellerKeyPair
         console.log("vals: ",this.stellarkeyPair.publicKey())
      }
   }

   onClickNext() {
      this.router.navigate(['request-otp']);
   }
   //!remove later
   public async generateTempAccounts(){
      for(let i=1;i<=10;i++){
         await this.storageService.addSeedPhraseAccount(i.toString(),("acc"+i))
      }
   }
}
