import { Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { LoadingController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { Testimonial } from 'shared/models/testimonial';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Organization } from '../../shared/models/organization';

@Component({
   selector: 'view-organization',
   templateUrl: 'view-organization.html'
})
export class ViewOrganizationComponent {

   public organization: Organization;
   public loadingModal: any;
   public isLoading: boolean;
   public isEmpty: boolean;

   public testimonialsReceived: Testimonial[];

   constructor(
      public navParams: NavParams,
      private loadingCtrl: LoadingController,
      private viewCtrl: ViewController,
      private toastCtrl: ToastController,
      private dataService: DataServiceProvider,
      private callNumber: CallNumber,
   ) {
      this.organization = this.navParams.get("organization");
   }

   ionViewDidLoad() {
      this.fetchTestimonials();
   }

   fetchTestimonials() {
      this.presentLoading()
      this.dataService.getTestimonialsReceived(this.organization.Author).then(res => {
         this.testimonialsReceived = res.body ? res.body : [];
         this.testimonialsReceived = this.testimonialsReceived.filter((elem: Testimonial) => elem.Status == "approved")
         this.testimonialsReceived.reverse();

         (this.testimonialsReceived.length == 0) ? this.isEmpty = true : this.isEmpty = false

         this.dissmissLoading();
      }).catch(err => {
         this.isEmpty = false;
         this.dissmissLoading();
         this.presentToast("Could not fetch Oganizations! Please contact your admin")
      })
   }

   callPhoneOrMobile(contactNumber: string) {
      if (contactNumber && contactNumber !== "") {
         this.callNumber.callNumber(contactNumber, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
      }
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

   disMissView() {
      this.viewCtrl.dismiss();
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
