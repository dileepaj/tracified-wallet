import { ChangeDetectorRef, Injectable, ApplicationRef } from '@angular/core';
import { Events, Platform, Toast, ToastController } from 'ionic-angular';
import { Network } from '@ionic-native/network';

@Injectable()
export class ConnectivityServiceProvider {
  public onDevice: boolean;
  private toastInstance: Toast;
  constructor(
    private platform: Platform,
    private network: Network,
    private toastCtrl: ToastController,
    private events: Events,
    // private ref: ChangeDetectorRef
    private ref: ApplicationRef
  ) {
    this.platform.ready().then(() => {
      this.onDevice = this.platform.is('android');
      this.onDevice = this.platform.is('ios');
      if (this.isOffline() === true)
        this.onDevice = false;
      else if (this.isOnline() === true)
        this.onDevice = true;
    });

    this.network.onDisconnect().subscribe(() => {
      // @ts-ignore
      this.ref.detectChanges();
      this.onDevice = false;
      this.events.publish('network', false);
      this.presentToast('Your Device is Offline, You will not be able to access certain functionalities');
    });
    this.network.onConnect().subscribe(() => {
      // @ts-ignore
      this.ref.detectChanges();
      this.onDevice = true;
      this.events.publish('network', true);
    });
  }

  isOnline(): boolean {
    if (this.onDevice && this.network.type) {
      return this.network.type !== 'none';
    } else {
      return navigator.onLine;
    }
  }

  isOffline(): boolean {
    if (this.onDevice && this.network.type) {
      return this.network.type === 'none';
    } else {
      return !navigator.onLine;
    }
  }

  presentToast(message) {
    if (this.toastInstance) {
      return;
    }
    this.toastInstance = this.toastCtrl.create({
      message: message,
      duration: 3500,
      position: 'bottom'
    });
    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = null;
    });
    this.toastInstance.present();
  }

}
