import { Component } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';

// import { Tab1Root, Tab2Root, Tab3Root } from '../';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  // tab1Root: any = Tab1Root;
  // tab2Root: any = Tab2Root;
  // tab3Root: any = Tab3Root;

  tab1Title = ' ';
  tab2Title = ' ';
  tab3Title = ' ';

  constructor(
    public navCtrl: NavController
  ) // public translateService: TranslateService
  {
    this.tab1Title = 'Items';
    this.tab2Title = 'Sent';
    this.tab3Title = 'Received';
  }
}