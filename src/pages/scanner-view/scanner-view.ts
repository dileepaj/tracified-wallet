import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Toast, ToastController } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { ItemDetailPage } from '../item-detail/item-detail';
import { ItemReceivedPage } from '../item-received/item-received';

@IonicPage()
@Component({
  selector: 'page-scanner-view',
  templateUrl: 'scanner-view.html',
})
export class ScannerViewPage {

  scanSubscription;
  data: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private qrScanner: QRScanner,
    public events: Events,
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ScannerViewPage');
  }

  ionViewWillEnter() {
    this.scan();
  }

  ionViewWillLeave() {
    this.stopScanning();
  }

  scan() {
    (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');

    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.qrScanner.show();
          this.scanSubscription = this.qrScanner.scan().subscribe((text:string) => {
            console.log("Data Showing ", text);
            this.navCtrl.push(ItemDetailPage, {text});
          });
        } else {
          console.error('Permission Denied', status);
        }
      })
      .catch((e: any) => {
        console.error('Error', e);
      });
  }

  stopScanning() {
    (this.scanSubscription) ? this.scanSubscription.unsubscribe() : null;
    this.scanSubscription=null;
    (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
    this.qrScanner.hide();
    this.qrScanner.destroy();
  }
}
