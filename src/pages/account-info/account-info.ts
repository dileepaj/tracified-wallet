import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Properties } from '../../shared/properties';

import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { TabsPage } from '../../pages/tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-account-info',
  templateUrl: 'account-info.html',
})
export class AccountInfoPage {

  private account;
  private navigation;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public properties: Properties,
    private blockchainService: BlockchainServiceProvider
  ) {
    this.account = this.navParams.get("account");
    this.navigation = this.navParams.get("navigation");
  }

  copyToClipboard(option) {

  }

  continue() {
    if (this.navigation === 'initial') {
      this.navCtrl.push(TabsPage);
    } else {
      this.navCtrl.push(BcAccountPage);
    }

  }


}
