import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { DataServiceProvider } from '../../../providers/data-service/data-service';
import { AddOrganizationTestimonialPage } from '../../add-organization-testimonial/add-organization-testimonial';
import { Properties } from '../../../shared/properties';
import { Logger } from 'ionic-logger-new';

@IonicPage()
@Component({
  selector: 'page-organization-registered',
  templateUrl: 'organization-registered.html',
})
export class OrganizationRegisteredPage {

  public approvedOrganziations: any;
  public loadingModal: any;
  public isLoading: boolean;

  constructor(
    private navCtrl: NavController,
    private dataService: DataServiceProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private logger: Logger,
    private properties: Properties
  ) { }

  ionViewDidLoad() {
    this.getRegisteredOrganizations()
  }

  getRegisteredOrganizations() {
    this.presentLoading()
    this.dataService.getApprovedOrganizations().then(res => {
      this.approvedOrganziations = res.body;
      this.dissmissLoading();
    }).catch(err => {
      this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      this.dissmissLoading();
      this.presentToast("Could not fetch Oganizations! Please contact your admin")
    })
  }

  addTestimonial(receiverPK: string) {
    this.navCtrl.push(AddOrganizationTestimonialPage, { receiver: receiverPK })
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
