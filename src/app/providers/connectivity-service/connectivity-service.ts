import { ChangeDetectorRef, Injectable, ApplicationRef } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { Network } from '@capacitor/network';
// import { Logger } from 'ionic-logger-new';
import { Properties } from '../../shared/properties';
import { LoggerService } from '../logger-service/logger.service';
import { EventsService } from '../event-service/events.service';

@Injectable({
   providedIn: 'root',
})
export class ConnectivityServiceProvider {
   public onDevice: boolean;
   toastInstance: any;
   menuHide: boolean = true;

   constructor(
      private platform: Platform,
      //   private network: Network,
      private toastCtrl: ToastController,
      private events: EventsService,
      private ref: ApplicationRef,
      private logger: LoggerService,
      private properties: Properties
   ) {
      this.platform.ready().then(async () => {
         this.onDevice = this.platform.is('android');
         this.onDevice = this.platform.is('ios');
         if ((await this.isOnline()) === true) {
            this.onDevice = true;
         } else {
            this.onDevice = false;
         }
      });

      Network.addListener('networkStatusChange', status => {
         if (status.connected === false) {
            // @ts-ignore
            this.ref.detectChanges();
            this.onDevice = false;
            this.events.publish('network', false);
            this.presentToast('Your Device is Offline, You will not be able to access certain functionalities');
            this.logger.error('[INTERNET] Connection interrupted.', this.properties.skipConsoleLogs, this.properties.writeToFile);
         } else if (status.connected === true) {
            // @ts-ignore
            this.ref.detectChanges();
            this.onDevice = true;
            this.events.publish('network', true);
            this.logger.info('[INTERNET] Connection back online.', this.properties.skipConsoleLogs, this.properties.writeToFile);
         }
      });
   }

   async isOnline(): Promise<boolean> {
      const status = await Network.getStatus();
      return status.connected;
   }

   async isOffline(): Promise<boolean> {
      return !this.isOnline();
   }

   async presentToast(message) {
      if (this.toastInstance) {
         return;
      }
      this.toastInstance = await this.toastCtrl.create({
         message: message,
         duration: 3500,
         position: 'bottom',
      });
      const { role } = await this.toastInstance.onDidDismiss();
      await this.toastInstance.present();
   }

   putMenuHide(status: boolean) {
      // this.menuHide = status;
   }

   checkMenuHide() {
      return this.menuHide;
   }
}
