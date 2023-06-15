import { Component, OnInit } from '@angular/core';

@Component({
   selector: 'app-import-bc-pk',
   templateUrl: './import-bc-pk.page.html',
   styleUrls: ['./import-bc-pk.page.scss'],
})
export class ImportBcPkPage implements OnInit {
   form: any;
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
