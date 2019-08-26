import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { CodePushServiceProvider } from '../../providers/code-push-service/code-push-service';
import { SplashScreen } from '@ionic-native/splash-screen';

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
    private splashScreen: SplashScreen
  ) { }

  ionViewDidEnter() {
    if (this.connectivityService.onDevice) {
      this.presentLoading("Checking for updates...");
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
        this.presentAlert("Updated Successfully", "Application updated successfully. Please restart the application to apply the changes.")
      }).catch((err) => {
        this.dismissLoading();
        if (err.error == "UPDATE_ERROR") {
          this.presentAlert("Error", "Could not update the application due to an error. Please try again later.");
        } else if (err.error == "PACKAGE_ERROR") {
          this.presentAlert("Error", "There is something wrong with the new update. Please try again later.");
        }
      });
    } else {
      this.presentAlert("Error", "There is no internet connection at the moment. Please check your connectivity settings in the device.");
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
