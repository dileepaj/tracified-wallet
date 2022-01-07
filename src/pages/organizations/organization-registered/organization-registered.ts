import { Component } from '@angular/core';
import { IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController } from 'ionic-angular';
import { DataServiceProvider } from '../../../providers/data-service/data-service';
import { AddOrganizationTestimonialPage } from '../../add-organization-testimonial/add-organization-testimonial';
import { Properties } from '../../../shared/properties';
import { Logger } from 'ionic-logger-new';
import { Organization } from '../../../shared/models/organization';

@IonicPage()
@Component({
  selector: 'page-organization-registered',
  templateUrl: 'organization-registered.html',
})
export class OrganizationRegisteredPage {

  public approvedOrganziations: any;
  public loadingModal: any;
  public isLoading: boolean;
  public isRegistered: boolean;
  public isEmpty: boolean;

  constructor(
    private navCtrl: NavController,
    private dataService: DataServiceProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private logger: Logger,
    private properties: Properties
  ) { }

  ionViewWillEnter() {
    this.getRegisteredOrganizations();
  }

  getRegisteredOrganizations() {
    this.presentLoading()
    this.dataService.getApprovedOrganizations().then(res => {
      let dataRes = res.body ? res.body : [];
      let index = dataRes.findIndex((elem: any) => elem.Author == this.properties.defaultAccount.pk)

      if (index > -1) dataRes.splice(index, 1)
      this.approvedOrganziations = dataRes;

      (this.approvedOrganziations.length == 0) ? this.isEmpty = true : this.isEmpty = false
      
      this.checkIfRegistered(this.properties.defaultAccount.pk) 
      
      this.dissmissLoading();
    }).catch(err => {
      this.isEmpty = false;
      this.approvedOrganziations = [];
      this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      this.dissmissLoading();
      this.presentToast("Could not fetch Oganizations! Please contact your admin")
    })
  }

  checkIfRegistered(publicKey: string) {
    this.dataService.getOrganization(publicKey).then(res => {
      const data: Organization = res.body;
      console.log(data)
      this.isRegistered = data && data.Status == 'approved'
    }).catch((err) => {
      this.isRegistered = false
      console.log(err);
      this.logger.error("Failed check if account registered: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
    })
  }

  doRefresh = (refresher: any) => {
    this.getRegisteredOrganizations();
    refresher.complete();
 }

  addTestimonial(receiver: any) {
    this.navCtrl.push(AddOrganizationTestimonialPage, { receiver: receiver })
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