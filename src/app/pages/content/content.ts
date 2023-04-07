import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
// import { CodePushServiceProvider } from '../../providers/code-push-service/code-push-service';
// import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

@Component({
   selector: 'page-content',
   templateUrl: 'content.html',
   styleUrls: ['./content.scss'],
})
export class ContentPage {
   updateAvailable: boolean = false;
   remotePackage;
   loading;

   constructor(
      public navCtrl: NavController,
      private connectivityService: ConnectivityServiceProvider,
      // private codepushService: CodePushServiceProvider,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      // private splashScreen: SplashScreen,
      private translate: TranslateService
   ) {}

   ionViewDidEnter() {
      //v6 comented
      // if (this.connectivityService.onDevice) {
      //    this.translate.get(['CHECK_UPDATES']).subscribe(text => {
      //       this.presentLoading(text['CHECK_UPDATES']);
      //    });
      //    this.codepushService
      //       .checkForUpdate()
      //       .then(remotePackage => {
      //          this.dismissLoading();
      //          this.updateAvailable = true;
      //          this.remotePackage = remotePackage;
      //       })
      //       .catch(() => {
      //          this.dismissLoading();
      //       });
      // }
   }

   updateVersion() {
      //v6 comented
      // if (this.connectivityService.onDevice) {
      //    this.presentUpdating();
      //    this.codepushService
      //       .doUpdate(this.remotePackage)
      //       .then(() => {
      //          this.splashScreen.show();
      //          this.updateAvailable = false;
      //          this.dismissLoading();
      //          this.translate.get(['UPDATED_SUCCESS', 'APP_UPDATED_RESTART']).subscribe(text => {
      //             this.presentAlert(text['UPDATED_SUCCESS'], text['APP_UPDATED_RESTART']);
      //          });
      //       })
      //       .catch(err => {
      //          this.dismissLoading();
      //          if (err.error == 'UPDATE_ERROR') {
      //             this.translate.get(['ERROR', 'APP_UPDATED_RESTART']).subscribe(text => {
      //                this.presentAlert(text['ERROR'], text['APP_UPDATED_RESTART']);
      //             });
      //          } else if (err.error == 'PACKAGE_ERROR') {
      //             this.translate.get(['ERROR', 'WRONG_UPDATE']).subscribe(text => {
      //                this.presentAlert(text['ERROR'], text['WRONG_UPDATE']);
      //             });
      //          }
      //       });
      // } else {
      //    this.translate.get(['ERROR', 'NO_INTERNET']).subscribe(text => {
      //       this.presentAlert(text['ERROR'], text['NO_INTERNET']);
      //    });
      // }
   }

   async presentAlert(title: string, message: string) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => {},
            },
         ],
      });

      await alert.present();
   }

   async presentUpdating() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         showBackdrop: true,
         message: 'Please wait, downloading required updates..',
      });
      await this.loading.present();
   }

   async dismissLoading() {
      await this.loading.dismiss();
   }

   async presentLoading(message) {
      this.loading = await this.loadingCtrl.create({
         message: message,
      });
      await this.loading.present();
   }
}
