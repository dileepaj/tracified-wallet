import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Properties } from 'src/app/shared/properties';
import { AuthServiceProvider } from '../auth-service/auth-service';
import { DataServiceProvider } from '../data-service/data-service';
import { LoggerService } from '../logger-service/logger.service';

@Injectable({
   providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
   //v6 implement functional guard
   constructor(
      public authService: AuthServiceProvider,
      public router: Router,
      private dataService: DataServiceProvider,
      private properties: Properties,
      private logger: LoggerService,
      private alertCtrl: AlertController
   ) {}

   async canActivate(): Promise<boolean> {
      try {
         const res = await this.authService.authorizeLocalProfile();
         if (res) {
            // const account = await this.dataService.retrieveDefaultAccount();
            // this.properties.defaultAccount = account;
            return true;
         } else {
            this.dataService.clearLocalData();
            this.router.navigate(['login'], { replaceUrl: true });
            return false;
         }
      } catch (err) {
         this.logger.error('Authorize local profile failed: ');
         this.presentAlert('Error', 'Failed to authorize the user. Please login again.');
         this.router.navigate(['login'], { replaceUrl: true });
      }
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

      alert.present();
   }
}
