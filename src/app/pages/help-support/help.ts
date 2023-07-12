import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { helpCoC, helpCreatBCHAcc, helpIntro, helpSignIn, helpUserDetails } from '../../shared/documentation';

@Component({
   selector: 'help',
   templateUrl: 'help.html',
   styleUrls: ['./help.scss'],
})
export class HelpPage {
   constructor(private platform: Platform) {
      if (this.platform.is('capacitor')) {
      }
      const platforms = this.platform.platforms();
   }

   openHelp(i: Number) {
      switch (i) {
         case 1:
            if (this.platform.is('capacitor')) {
               window.open(helpIntro, '_system', 'location=yes');
            } else window.open(helpIntro, '_blank');
            break;
         case 2:
            if (this.platform.is('capacitor')) {
               window.open(helpSignIn, '_system', 'location=yes');
            } else window.open(helpSignIn, '_blank');
            break;
         case 3:
            if (this.platform.is('capacitor')) {
               window.open(helpCreatBCHAcc, '_system', 'location=yes');
            } else window.open(helpCreatBCHAcc, '_blank');
            break;
         case 4:
            if (this.platform.is('capacitor')) {
               window.open(helpCoC, '_system', 'location=yes');
            } else window.open(helpCoC, '_blank');
            break;
         case 5:
            if (this.platform.is('capacitor')) {
               window.open(helpUserDetails, '_system', 'location=yes');
            } else window.open(helpUserDetails, '_blank');
            break;
         default:
      }
   }
}
