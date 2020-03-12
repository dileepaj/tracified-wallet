import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { CodePushServiceProvider } from '../../providers/code-push-service/code-push-service';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage {

  private updateAvailable: boolean = false;
  private remotePackage;
  private loading;

  constructor(
    public navCtrl: NavController,
    private connectivityService: ConnectivityServiceProvider,
    private codepushService: CodePushServiceProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private splashScreen: SplashScreen,
    private translate: TranslateService
  ) { }

  ionViewDidEnter() {
    if (this.connectivityService.onDevice) {
      this.translate.get(['CHECK_UPDATES']).subscribe(text => {
        this.presentLoading(text['CHECK_UPDATES']);
      });
      this.codepushService.checkForUpdate().then((remotePackage) => {
        this.dismissLoading();
        this.updateAvailable = true;
        this.remotePackage = remotePackage;
      }).catch(() => {
        this.dismissLoading();
      });
    }
  }

  updateVersion() {
    if (this.connectivityService.onDevice) {
      this.presentUpdating();
      this.codepushService.doUpdate(this.remotePackage).then(() => {
        this.splashScreen.show();
        this.updateAvailable = false;
        this.dismissLoading();
        this.translate.get(['UPDATED_SUCCESS', 'APP_UPDATED_RESTART']).subscribe(text => {
          this.presentAlert(text['UPDATED_SUCCESS'], text['APP_UPDATED_RESTART']);
        });
        }).catch((err) => {
        this.dismissLoading();
        if (err.error == "UPDATE_ERROR") {
          this.translate.get(['ERROR', 'APP_UPDATED_RESTART']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['APP_UPDATED_RESTART']);
          });
        } else if (err.error == "PACKAGE_ERROR") {
          this.translate.get(['ERROR', 'WRONG_UPDATE']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['WRONG_UPDATE']);
          });
        }
      });
    } else {
      this.translate.get(['ERROR', 'NO_INTERNET']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['NO_INTERNET']);
      });
    }
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

  presentUpdating() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      enableBackdropDismiss: false,
      showBackdrop: true,
      content: 'Please wait, downloading required updates..'
    });
    this.loading.present();
  }

  dismissLoading() {
    this.loading.dismiss();
  }

  presentLoading(message) {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: message
    });
    this.loading.present();
  }


}
