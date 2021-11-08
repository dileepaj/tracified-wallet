import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { DataServiceProvider } from '../../../providers/data-service/data-service';
import { Properties } from '../../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-testimonials-receieved',
  templateUrl: 'testimonials-receieved.html',
})
export class TestimonialsReceievedPage {

  public mainAccount: any;

  public testimonialsReceived: any;
  public loadingModal: any;
  public isLoading: boolean;

  constructor(
    private navCtrl: NavController,
    private dataService: DataServiceProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private logger: Logger,
    private properties: Properties
  ) {
    this.mainAccount = this.properties.defaultAccount
  }

  ionViewDidLoad() {
    this.getRecievedTestimonials(this.mainAccount.pk)
  }

  getRecievedTestimonials(receiverKey: string) {
    this.presentLoading()
    this.dataService.getTestimonialsReceived(receiverKey).then(res => {
      this.testimonialsReceived = res.body;
      this.dissmissLoading();
    }).catch(err => {
      this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      this.dissmissLoading();
      this.presentToast("Could not fetch Oganizations! Please contact your admin")
    })
  }

  presentLoading() {
    this.isLoading = true;
    this.loadingModal = this.loadingCtrl.create({
      dismissOnPageChange: false
    });

    this.loadingModal.present();
  }

  dissmissLoading() {
    this.isLoading = false;
    this.loadingModal.dismiss();
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
