import { Component, OnInit } from '@angular/core';

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

   form: any;
   constructor() {}

   ngOnInit() {}

   public changeTab(tab: number) {
      this.tab = tab;
   }

   public goBack() {
      if (this.tab != 0) {
         this.tab--;
      }
   }
}
