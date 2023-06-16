import { Component, OnInit } from '@angular/core';

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
   constructor() {}

   ngOnInit() {}
}
