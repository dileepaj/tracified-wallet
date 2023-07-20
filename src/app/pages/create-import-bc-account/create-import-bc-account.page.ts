import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { Properties } from 'src/app/shared/properties';
import { TOAST_TIMER } from 'src/environments/environment';

@Component({
   selector: 'app-create-import-bc-account',
   templateUrl: './create-import-bc-account.page.html',
   styleUrls: ['./create-import-bc-account.page.scss'],
})
export class CreateImportBcAccountPage implements OnInit {
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

   tab: number = 0;
   prevTab: number = 0;
   wordMap: any = {};

   seedPhrase: string[] = [];

   shuffledSeedPhrase: string[] = [];

   selectedSeedPhrase: string[] = [];

   form: FormGroup;
   createAccForm: FormGroup;

   passwordType: string = 'password';
   confPasswordType: string = 'password';
   passwordIcon: string = 'eye-off';
   confPasswordIcon: string = 'eye-off';
   toastInstance: any;
   constructor(
      private seedPhraseService: SeedPhraseService,
      private toastService: ToastController,
      private localForageService: StorageServiceProvider,
      private router: Router,
      private properties: Properties,
      private activeRoute: ActivatedRoute
   ) {
      this.form = new FormGroup({
         seedPhrase1: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase2: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase3: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase4: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase5: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase6: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase7: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase8: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase9: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase10: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase11: new FormControl('', Validators.compose([Validators.required])),
         seedPhrase12: new FormControl('', Validators.compose([Validators.required])),
      });
      this.createAccForm = new FormGroup({
         accname: new FormControl('', Validators.compose([Validators.required])),
         password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
         confpassword: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
      });
   }

   ngOnInit() {
      let sub = this.activeRoute.queryParams.subscribe(params => {
         let oldId = params['navigation'];

         if (oldId === 'initial') {
            this.tab = 0;
         }
      });
   }
   public async changeTab(tab: number) {
      if (tab == 1) {
         let mnemonic = await this.seedPhraseService.generateMnemonic();
         const words = mnemonic.split(' ');
         this.createMap(words);
         this.selectedSeedPhrase = [];
      }
      if (tab == 2) {
         this.shuffleArray();
      }
      if (tab == 4) {
         if (this.tab != 3) {
            let rst = this.validateSeedPhrase();
            if (!rst) {
               this.toastInstance = await this.toastService.create({
                  message: 'Invalid seed phrase selection please try again',
                  duration: TOAST_TIMER.SHORT_TIMER,
                  position: 'bottom',
               });
               await this.toastInstance.present();
               return;
            }
         }
      }

      this.prevTab = this.tab;
      this.tab = tab;
   }

   public goBack() {
      this.selectedSeedPhrase = [];
      if (this.tab == 0) {
         this.router.navigate(['/login']);
      } else if (this.tab == 1) {
         this.tab = 0;
      } else if (this.tab == 2) {
         this.tab = 1;
      } else if (this.tab == 3) {
         this.tab = 0;
      } else if (this.tab == 4) {
         this.tab = this.prevTab;
      }
   }

   public selectWord(word: string) {
      if (this.selectedSeedPhrase.includes(word) && this.selectedSeedPhrase.indexOf(word) == this.selectedSeedPhrase.length - 1) {
         this.selectedSeedPhrase.pop();
      } else if (!this.selectedSeedPhrase.includes(word)) {
         this.selectedSeedPhrase.push(word);
      }
   }

   public shuffleArray() {
      let arr = [];
      this.seedPhrase.map(s => {
         arr.push(s);
      });
      for (let i = arr.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         const temp = arr[i];
         arr[i] = arr[j];
         arr[j] = temp;
      }
      this.shuffledSeedPhrase = arr;
   }

   public validateSeedPhrase(): Boolean {
      let generatedSeed = this.getWordArray(this.seedPhrase).join(',');
      let selectedSeed = this.getWordArray(this.selectedSeedPhrase).join(',');
      //check if both arrays are equal
      if (generatedSeed == selectedSeed) {
         //check if provided mnemonic is a valid one
         let rst = SeedPhraseService.validateMnemonic(selectedSeed.replace(/,/g, ' '));
         return rst;
      } else {
         return false;
      }
   }

   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   hideShowConfPassword() {
      this.confPasswordType = this.confPasswordType === 'text' ? 'password' : 'text';
      this.confPasswordIcon = this.confPasswordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   createMap(arr: string[]) {
      for (let i = 0; i < arr.length; i++) {
         this.wordMap[`${arr[i]}-${i}`] = arr[i];
         this.seedPhrase[i] = `${arr[i]}-${i}`;
      }
   }

   getWord(key: string): string {
      return this.wordMap[key];
   }

   getWordArray(arr: string[]): string[] {
      let wordArr = [];

      for (let i = 0; i < arr.length; i++) {
         wordArr[i] = this.getWord(arr[i]);
      }

      return wordArr;
   }

   public async saveSeedPhraseProfile() {
      let accName = this.createAccForm.get('accname').value;
      let pwd = this.createAccForm.get('password').value;
      let confirmPwd = this.createAccForm.get('confpassword').value;
      let selectedSeed = this.getWordArray(this.seedPhrase).join(',');

      if (pwd.toString() == confirmPwd.toString()) {
         await this.localForageService.setMnemonic(selectedSeed.replace(/,/g, ' '), this.properties.userName);
         await this.localForageService.setMnemonicPassword(pwd.toString());
         await this.localForageService.addSeedPhraseAccount('0', accName.toString(),pwd.toString());
         this.router.navigate(['bc-account-created']);
      } else {
         this.toastInstance = await this.toastService.create({
            message: 'Passwords do not match please try again!',
            duration: TOAST_TIMER.SHORT_TIMER,
            position: 'bottom',
         });
         await this.toastInstance.present();
      }
      const profiles = this.localForageService.getAllMnemonicProfiles();
   }

   public async getMnemonicfromInput() {
      let seedPhrase1 = this.form.get('seedPhrase1').value.trim();
      let seedPhrase2 = this.form.get('seedPhrase2').value.trim();
      let seedPhrase3 = this.form.get('seedPhrase3').value.trim();
      let seedPhrase4 = this.form.get('seedPhrase4').value.trim();
      let seedPhrase5 = this.form.get('seedPhrase5').value.trim();
      let seedPhrase6 = this.form.get('seedPhrase6').value.trim();
      let seedPhrase7 = this.form.get('seedPhrase7').value.trim();
      let seedPhrase8 = this.form.get('seedPhrase8').value.trim();
      let seedPhrase9 = this.form.get('seedPhrase9').value.trim();
      let seedPhrase10 = this.form.get('seedPhrase10').value.trim();
      let seedPhrase11 = this.form.get('seedPhrase11').value.trim();
      let seedPhrase12 = this.form.get('seedPhrase12').value.trim();

      let userInputMnemonic = `${seedPhrase1} ${seedPhrase2} ${seedPhrase3} ${seedPhrase4} ${seedPhrase5} ${seedPhrase6} ${seedPhrase7} ${seedPhrase8} ${seedPhrase9} ${seedPhrase10} ${seedPhrase11} ${seedPhrase12}`;
      let userInputMnemonicV2 = [seedPhrase1, seedPhrase2, seedPhrase3, seedPhrase4, seedPhrase5, seedPhrase6, seedPhrase7, seedPhrase8, seedPhrase9, seedPhrase10, seedPhrase11, seedPhrase12];
      let result: boolean = SeedPhraseService.validateMnemonic(userInputMnemonic);

      if (result) {
         this.createMap(userInputMnemonicV2);
         this.changeTab(4);
      } else {
         this.toastInstance = await this.toastService.create({
            message: 'Entered 12 word seed phrase is invalid please try again',
            duration: TOAST_TIMER.SHORT_TIMER,
            position: 'bottom',
         });
         await this.toastInstance.present();
      }
   }
}
