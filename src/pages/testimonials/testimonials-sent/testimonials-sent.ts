import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { DataServiceProvider } from '../../../providers/data-service/data-service';
import { Properties } from '../../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-testimonials-sent',
  templateUrl: 'testimonials-sent.html',
})
export class TestimonialsSentPage {

  public mainAccount: any;

  public testimonialsSent: any;
  public loadingModal: any;
  public isLoading: boolean;
  public isEmpty: boolean;

  constructor(
    private navCtrl: NavController,
    private dataService: DataServiceProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private logger: Logger,
    private properties: Properties
  ) {
    this.mainAccount = this.properties.defaultAccount
    this.getSentTestimonials(this.properties.defaultAccount.pk)
  }

  ionViewDidLoad() {
  }

  getSentTestimonials(senderKey: string) {
    this.presentLoading()
    this.dataService.getTestimonialsSent(senderKey).then(res => {
      this.testimonialsSent = res.body ? res.body : [];
      this.dissmissLoading();

      (this.testimonialsSent.length == 0) ? this.isEmpty = true : this.isEmpty = false

    }).catch(err => {
      this.isEmpty = false;
      this.logger.error("Failed to fetch Testimonials: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      this.dissmissLoading();
      this.presentToast("Could not fetch Testimonials! Please contact your admin")
    })
  }

  doRefresh = (refresher: any) => {
    this.getSentTestimonials(this.properties.defaultAccount.pk);
    refresher.complete();
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
