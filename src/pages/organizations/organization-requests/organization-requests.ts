import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { AccountServiceProvider } from '../../../providers/account-service/account-service';
import { BlockchainServiceProvider } from '../../../providers/blockchain-service/blockchain-service';
import { Organization } from '../../../shared/models/organization';
import { DataServiceProvider } from '../../../providers/data-service/data-service';
import { tracSuperAcc } from '../../../shared/config';
import { Properties } from '../../../shared/properties';
import { NavController } from 'ionic-angular';

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
   public isEmpty: boolean;
   

   constructor(
      private dataService: DataServiceProvider,
      private loadingCtrl: LoadingController,
      private toastCtrl: ToastController,
      private logger: Logger,
      private alertCtrl: AlertController,
      private blockchainService: BlockchainServiceProvider,
      private properties: Properties,
      public translate: TranslateService,
      public navCtrl: NavController
   ) {
      this.mainBCAccount = this.properties.defaultAccount;
      this.superAcc = tracSuperAcc;

      // Currently only tracified has the organization accept priviledges we have one super wallet account
      (this.mainBCAccount.pk !== this.superAcc) ? this.isOperationsAllowed = false : this.isOperationsAllowed = true;
      // TODO: We should revamp this once we go live for community based organzation approvals
   }

   ionViewDidLoad() {
      this.getPendingOrganizations()
   }

   getPendingOrganizations() {
      if (this.isOperationsAllowed) {
         this.presentLoading()
         this.dataService.getOrganizationsRequests().then(res => {
            const data = res.body ? res.body : []
            this.pendingApprovals = data.reverse();
            (this.pendingApprovals.length == 0) ? this.isEmpty = true : this.isEmpty = false 
            this.dissmissLoading();
         }).catch(err => {
            this.isEmpty = false;
            this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            this.dissmissLoading();
            this.presentToast("Could not fetch Oganizations! Please contact your admin")
         })
      }
   }

   /**
    * update organization registration whether accept/reject
    * @param organization 
    * @param status 
    */
   updateRegisterRequest = (organization: Organization, status: string) => {
      this.passwordPromptResponseWait().then((password) => {
         this.presentLoading();
         this.blockchainService.validateTransactionPassword(password, this.mainBCAccount.sk, tracSuperAcc).then((decryptedKey) => { // Passing Super Acc PK as only Super Acc is allowed to do transaction
            console.log(decryptedKey)
            if (status == 'accepted') {
               organization.AcceptXDR = this.blockchainService.signXdr(organization.AcceptXDR, decryptedKey);
               organization.Status = 'approved';
            } else if (status == 'rejected') {
               organization.RejectXDR = this.blockchainService.signXdr(organization.RejectXDR, decryptedKey);
               organization.Status = 'rejected';
            }
            this.dataService.updateOrganization(organization).then((res) => {
               this.dissmissLoading();
               if (status == 'accepted') {
                  this.translate.get(['SUCCESS', 'SUCCESS_ACCEPTED', 'UPDATED_RESULTS_ORGANIZATION']).subscribe(text => {
                     this.presentAlert(text['SUCCESS'], text['SUCCESS_ACCEPTED'] + " " + organization.Name + ". " + text['UPDATED_RESULTS_ORGANIZATION']);
                  });
                  this.navCtrl.setRoot(this.navCtrl.getActive().component);
               } else if (status == 'rejected') {
                  this.translate.get(['SUCCESS', 'SUCCESS_REJECTED']).subscribe(text => {
                     this.presentAlert(text['SUCCESS'], text['SUCCESS_REJECTED'] + " " + organization.Name + ". ");
                  });
               }
            }).catch((err) => {
               console.log(err.error.error_code)
               organization.Status = 'pending';
               this.dissmissLoading();
               if (err.error.error_code == "tx_bad_seq"){
                  this.translate.get(['ERROR', 'BC_BAD_SEQ', 'BC_COULD_NOT_PROCEED']).subscribe(text => {
                    this.presentAlert(text['ERROR'], text['BC_BAD_SEQ'] + text['BC_COULD_NOT_PROCEED'] + "Please contact admin");
                  });
                }else if (err.error.error_code == "tx_too_late"){
                  this.translate.get(['ERROR', 'BC_TOO_LATE', 'BC_COULD_NOT_PROCEED']).subscribe(text => {
                    this.presentAlert(text['ERROR'], text['BC_TOO_LATE'] + text['BC_COULD_NOT_PROCEED']);
                  });
                }else{
                  this.translate.get(['ERROR','COULD_NOT_PROCEED']).subscribe(text => {
                    this.presentAlert(text['ERROR'], text['COULD_NOT_PROCEED']);
                  });
                }
               this.logger.error("Failed to update the Organization Request: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
         }).catch((err) => {
            this.dissmissLoading();
            this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['INVALID_PASSWORD']);
            });
            this.logger.error("Validating password failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         });
      }).catch((err) => {
         this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INVALID_PASSWORD']);
         });
         this.logger.error("Invalid password: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
   }

   passwordPromptResponseWait() {
      return new Promise((resolve, reject) => {
         let passwordPrompt = this.alertCtrl.create({
            title: 'Transaction Password',
            inputs: [
               {
                  name: "password",
                  placeholder: "Password...",
                  type: "password"
               }
            ],
            buttons: [
               {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: (data: any) => {
                     reject();
                  }
               },
               {
                  text: "Submit",
                  handler: (data: any) => {
                     if (data.password != "") {
                        resolve(data.password);
                     }
                  }
               }
            ]
         });
         passwordPrompt.present();
      });
   }

   doRefresh = (refresher: any) => {
      this.getPendingOrganizations();
      refresher.complete();
   }

   presentAlert(title: string, message: string) {
      let alert = this.alertCtrl.create();
      alert.setTitle(title);
      alert.setMessage(message);
      alert.addButton({
         text: 'OK'
      });
      alert.present();
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
