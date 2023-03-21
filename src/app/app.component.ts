import { Component } from '@angular/core';

@Component({
   selector: 'app-root',
   templateUrl: 'app.component.html',
   styleUrls: ['app.component.scss'],
})
export class AppComponent {
   constructor() {}

   openPage(page: string) {
      switch (page) {
         case 'items':
            // this.nav.setRoot(TabsPage);
            break;
         case 'nft':
            // this.nav.setRoot(OtpPage);
            break;
         case 'market':
            // this.nav.setRoot(GetNftPage);
            break;
         case 'accounts':
            // this.nav.setRoot(BcAccountPage);
            break;
         case 'fundTransfer':
            // this.nav.setRoot(FundTransferPage);
            break;
         case 'settings':
            // this.nav.setRoot(SettingsPage);
            break;
         case 'about':
            // this.nav.setRoot(ContentPage);
            break;
         case 'logout':
            // this.logOut();
            break;
         case 'help':
            // this.nav.setRoot(HelpPage);
            break;
      }
   }
}
