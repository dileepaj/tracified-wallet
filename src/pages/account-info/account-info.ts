import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { Properties } from '../../shared/properties';

import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { TabsPage } from '../../pages/tabs/tabs';
import { Clipboard } from '@ionic-native/clipboard/index';
import { Logger } from 'ionic-logger-new';
import { TranslateService } from '@ngx-translate/core';

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
    private blockchainService: BlockchainServiceProvider,
    private clipboard: Clipboard,
    private alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private logger: Logger,
    private translate: TranslateService
  ) {
    this.account = this.navParams.get("account");
    this.navigation = this.navParams.get("navigation");
  }

  copyToClipboard(option) {
    if (option == 1) {
      this.clipboard.copy(this.account.publicKey).then(() => {
        this.translate.get(['PUBLIC_KEY_COPIED']).subscribe(text => {
          this.presentToast(text['PUBLIC_KEY_COPIED']);
        });
      }).catch((err) => {
        this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FALIED_TO_COPY_KEY']);
        });
        this.logger.error("Copying to clipboard failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else if(option == 2){
      this.clipboard.copy(this.account.privateKey).then(() => {
        this.translate.get(['PRIVATE_KEY_COPIED']).subscribe(text => {
          this.presentToast(text['PRIVATE_KEY_COPIED']);
        });
      }).catch((err) => {
        this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FALIED_TO_COPY_KEY']);
        });
        this.logger.error("Copying to clipboard failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    }

  }

  continue() {
    if (this.navigation === 'initial') {
      this.navCtrl.setRoot(TabsPage);
    } else {
      this.navCtrl.setRoot(BcAccountPage);
    }

  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: "bottom"
    });
    toast.present();
  }

  presentAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });

    alert.present();
  }


}
