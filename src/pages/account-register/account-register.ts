import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Properties } from '../../shared/properties';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';


@IonicPage()
@Component({
   selector: 'page-account-register',
   templateUrl: 'account-register.html',
})
export class AccountRegisterPage {
   public formRegister: FormGroup;
   public isLoadingPresent: boolean;
   public loading: any;

   public orgKey: string;
   public orgLogo: string;

   private defaultAccSK: string;

   constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      private toastCtrl: ToastController,
      private blockchainService: BlockchainServiceProvider,
      private actionSheetCtrl: ActionSheetController,
      private properties: Properties,
      private camera: Camera,
      private file: File,
      public translate: TranslateService
   ) {
      this.orgKey = this.navParams.get('organizationKey');
      this.formRegister = new FormGroup({
         orgPublicKey: new FormControl(this.orgKey, Validators.compose([Validators.minLength(4), Validators.required])),
         orgName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
         orgDescription: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
         orgEmail: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
         orgPrimaryMobile: new FormControl('', Validators.compose([Validators.minLength(10), Validators.required])),
         orgSecondMobile: new FormControl('', Validators.compose([Validators.minLength(10)])),
      });
   }

   ionViewDidLoad() { }

   uploadImage() {
      this.translate
         .get(["imageSourceHeader", "camera", "album", "cancel"])
         .subscribe((text) => {
            let actionSheet = this.actionSheetCtrl.create({
               title: text["imageSourceHeader"],
               buttons: [
                  {
                     text: text["camera"],
                     role: "destructive",
                     icon: "camera",
                     handler: () => {
                        this.takePicture("camera");
                     },
                  },
                  {
                     text: text["album"],
                     role: "destructive",
                     icon: "photos",
                     handler: () => {
                        this.takePicture("album");
                     },
                  },
                  {
                     text: text["cancel"],
                     role: "cancel",
                     icon: "close",
                     handler: () => {
                        console.log("Cancel clicked");
                     },
                  },
               ],
            });
            actionSheet.present();
         });
   }

   takePicture(sourceType: string) {
      let options: any;
      const optionsForAlbum: CameraOptions = {
         quality: 60,
         targetHeight: 800,
         targetWidth: 800,
         destinationType: this.camera.DestinationType.FILE_URI,
         encodingType: this.camera.EncodingType.JPEG,
         mediaType: this.camera.MediaType.PICTURE,
         saveToPhotoAlbum: false,
         correctOrientation: true,
         sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      };

      const optionsForCamera: CameraOptions = {
         quality: 60,
         targetHeight: 800,
         targetWidth: 800,
         destinationType: this.camera.DestinationType.FILE_URI,
         encodingType: this.camera.EncodingType.JPEG,
         mediaType: this.camera.MediaType.PICTURE,
         saveToPhotoAlbum: false,
         correctOrientation: true,
         sourceType: this.camera.PictureSourceType.CAMERA,
      };

      if (sourceType === "camera") {
         options = optionsForCamera;
      } else if (sourceType === "album") {
         options = optionsForAlbum;
      }

      this.camera.getPicture(options).then(
         (imageData) => {

            var tempPhoto: any;
            let pfileName: any;
            let fileName: any;
            let filePath: any;

            if (sourceType === "camera") {
               fileName = imageData.substring(imageData.lastIndexOf("/") + 1);
               filePath = imageData.substring(
                  0,
                  imageData.lastIndexOf("/") + 1
               );

            } else if (sourceType === "album") {
               pfileName = imageData.substring(imageData.lastIndexOf("/") + 1);
               filePath = imageData.substring(
                  0,
                  imageData.lastIndexOf("/") + 1
               );
               fileName = pfileName.split('?').shift();

            }

            this.file
               .readAsDataURL(filePath, fileName)
               .then((base64) => {
                  tempPhoto = base64;
                  this.orgLogo = tempPhoto;
                  console.log(base64)
               })
               .catch((e) => console.log("err", e));
         },
         (err) => {
            console.log("Error", err);
         }
      );
   }

   registerOrganization() {
      if (this.formRegister.valid) {
         this.presentLoading()
         this.passwordPrompt().then((password) => {

            this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk)
               .then((secKey) => {
                  this.defaultAccSK = secKey;

                  this.blockchainService.preparesubAccount(this.defaultAccSK).then((res) => {

                  })

               })
         })
      }
   }

   passwordPrompt(): Promise<any> {
      return new Promise((resolve, reject) => {
         let alert = this.alertCtrl.create({
            title: 'Transaction Password',
            inputs: [
               {
                  name: 'password',
                  type: 'password',
                  placeholder: 'Password...'
               }
            ],
            buttons: [
               {
                  text: 'Cancel',
                  role: 'cancel'
               },
               {
                  text: 'Submit',
                  handler: data => {

                     if (data.password) {
                        resolve(data.password);
                     } else {
                        console.log("Empty Password");
                     }

                  }
               },
            ]
         });
         alert.present();
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
      this.isLoadingPresent = true;
      this.loading = this.loadingCtrl.create({
         dismissOnPageChange: false,
         content: 'Please Wait'
      });

      this.loading.present();
   }

   dissmissLoading() {
      this.isLoadingPresent = false;
      this.loading.dismiss();
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
