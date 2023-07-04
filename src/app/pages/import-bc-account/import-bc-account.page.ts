import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
   selector: 'app-import-bc-account',
   templateUrl: './import-bc-account.page.html',
   styleUrls: ['./import-bc-account.page.scss'],
})
export class ImportBcAccountPage implements OnInit {
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

   spForm: any;
   pkForm: any;
   constructor(private router: Router) {
      this.spForm = new FormGroup({
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

      this.pkForm = new FormGroup({
         accname: new FormControl('', Validators.compose([Validators.required])),
         pk: new FormControl('', Validators.compose([Validators.required])),
      });
   }

   ngOnInit() {}

   public changeTab(tab: number) {
      this.tab = tab;
   }

   public goBack() {
      if (this.tab == 0) {
         this.router.navigate(['/otp-bc-account']);
      } else if (this.tab == 1) {
         this.tab = 0;
      } else if (this.tab == 2) {
         this.tab = 0;
      }
   }
}
