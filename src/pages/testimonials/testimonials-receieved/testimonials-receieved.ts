import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { Testimonial } from '../../../shared/models/testimonial';
import { BlockchainServiceProvider } from '../../../providers/blockchain-service/blockchain-service';
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
   public isEmpty: boolean;

   constructor(
      public translate: TranslateService,
      private dataService: DataServiceProvider,
      private blockchainService: BlockchainServiceProvider,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private toastCtrl: ToastController,
      private logger: Logger,
      private properties: Properties
   ) {
      this.mainAccount = this.properties.defaultAccount
   }

   ionViewDidLoad() {
      this.getRecievedTestimonials(this.properties.defaultAccount.pk)
   }

   getRecievedTestimonials(receiverKey: string) {
      this.presentLoading()
      this.dataService.getTestimonialsReceived(receiverKey).then(res => {
         this.testimonialsReceived = res.body ? res.body : [];
         
         (this.testimonialsReceived.length == 0) ? this.isEmpty = true : this.isEmpty = false 
      
         this.dissmissLoading();
      }).catch(err => {
         this.isEmpty = false;
         this.logger.error("Failed to load the account: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
         this.dissmissLoading();
         this.presentToast("Could not fetch Oganizations! Please contact your admin")
      })
   }

   /**
     * update organization registration whether accept/reject
     * @param organization 
     * @param status 
     */
   updateTestimonial = (testimonial: Testimonial, status: string) => {
      this.passwordPromptResponseWait().then((password) => {
         this.presentLoading();
         this.blockchainService.validateTransactionPassword(password, this.mainAccount.sk, this.mainAccount.pk).then((decryptedKey) => { // Passing Super Acc PK as only Super Acc is allowed to do transaction
            console.log(decryptedKey)
            if (status == 'accepted') {
               testimonial.AcceptXDR = this.blockchainService.signXdr(testimonial.AcceptXDR, decryptedKey);
               testimonial.Status = 'approved';
            } else if (status == 'rejected') {
               testimonial.RejectXDR = this.blockchainService.signXdr(testimonial.RejectXDR, decryptedKey);
               testimonial.Status = 'rejected';
            }
            this.dataService.updateTestimonial(testimonial).then((res) => {
               this.dissmissLoading();
               if (status == 'accept') {
                  this.translate.get(['SUCCESS', 'SUCCESS_ACCEPTED', 'UPDATED_RESULTS_TRANSFER']).subscribe(text => {
                     this.presentAlert(text['SUCCESS'], text['SUCCESS_ACCEPTED '] + testimonial.Testimonial.Title + ". " + text['UPDATED_RESULTS_TRANSFER']);
                  });
               } else if (status == 'reject') {
                  this.translate.get(['SUCCESS', 'SUCCESS_REJECTED']).subscribe(text => {
                     this.presentAlert(text['SUCCESS'], text['SUCCESS_REJECTED '] + testimonial.Testimonial.Title);
                  });
               }
            }).catch((err) => {
               testimonial.Status = 'pending';
               this.dissmissLoading();
               this.translate.get(['ERROR', 'COULD_NOT_PROCEED']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['COULD_NOT_PROCEED']);
               });
               this.logger.error("Failed to update the Testimonial: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
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
