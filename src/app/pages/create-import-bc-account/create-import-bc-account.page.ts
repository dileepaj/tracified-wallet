import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

   seedPhrase: string[] = ['ankle', 'measure', 'slender', 'equip', 'stable', 'equal', 'record', 'recall', 'arrest', 'fury', 'skirt', 'fast'];

   shuffledSeedPhrase: string[] = [];

   selectedSeedPhrase: string[] = [];

   form: any;
   createAccForm: any;

   passwordType: string = 'password';
   confPasswordType: string = 'password';
   passwordIcon: string = 'eye-off';
   confPasswordIcon: string = 'eye-off';

   constructor() {
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
         accname: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
         password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
         confpassword: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
      });
   }

   ngOnInit() {}

   public changeTab(tab: number) {
      if (tab == 2) {
         this.shuffleArray();
      }
      this.prevTab = this.tab;
      this.tab = tab;
   }

   public goBack() {
      if (this.tab == 0) {
         this.tab = 0;
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

   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   hideShowConfPassword() {
      this.confPasswordType = this.confPasswordType === 'text' ? 'password' : 'text';
      this.confPasswordIcon = this.confPasswordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }
}
