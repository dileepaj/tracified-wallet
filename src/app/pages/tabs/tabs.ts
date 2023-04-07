import { Component } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';

@Component({
   selector: 'page-tabs',
   templateUrl: 'tabs.html',
   styleUrls: ['./tabs.scss'],
})
export class TabsPage {
   tab1Title = ' ';
   tab2Title = ' ';
   tab3Title = ' ';

   constructor(
      public navCtrl: NavController // public translateService: TranslateService
   ) {
      this.tab1Title = 'Items';
      this.tab2Title = 'Sent';
      this.tab3Title = 'Received';
   }
}
