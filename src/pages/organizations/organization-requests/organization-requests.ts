import { Component } from '@angular/core';
import { ActionSheetController, IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { DataServiceProvider } from '../../../providers/data-service/data-service';
import { tracSuperAcc } from '../../../shared/config';
import { Properties } from '../../../shared/properties';


@IonicPage()
@Component({
  selector: 'page-organization-requests',
  templateUrl: 'organization-requests.html',
})
export class OrganizationRequestsPage {

  public mainBCAccount: any;
  public superAcc: string;
  public isOperationsAllowed: boolean;
  
  public pendingApprovals: any;
  public loadingModal: any;
  public isLoading: boolean;

  constructor(
    private dataService: DataServiceProvider,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private logger: Logger,
    private properties: Properties
  ) {
    this.mainBCAccount = this.properties.defaultAccount;
    this.superAcc = tracSuperAcc;

    // Currently only tracified has the organization accept priviledges we have one super wallet account
    (this.mainBCAccount.pk !== this.superAcc) ? this.isOperationsAllowed = false : this.isOperationsAllowed = true;
    // TODO: We should revamp this once we go live for community based organzation approvals
  }

  ionViewDidLoad() {
    if (this.isOperationsAllowed) {
      this.getPendingOrganizations()
    }
  }

  getPendingOrganizations() {
    this.presentLoading()
    this.dataService.getApprovedOrganizations().then(res => {
      const data = res.body
      this.pendingApprovals = data.filter((elem: any) => elem.Status == "Pending");
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
