import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Properties } from '../../shared/properties';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { AccountServiceProvider } from '../../providers/account-service/account-service';
import { tracSuperAcc } from '../../shared/config';
import { Organization } from '../../shared/models/organization';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Logger } from 'ionic-logger-new';
import { BcAccountPage } from '../../pages/bc-account/bc-account';

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
      private dataService: DataServiceProvider,
      private accountService: AccountServiceProvider,
      private actionSheetCtrl: ActionSheetController,
      private properties: Properties,
      private camera: Camera,
      private logger: Logger,
      private file: File,
      public translate: TranslateService
   ) {
      this.orgKey = this.navParams.get('organizationKey');
      this.formRegister = new FormGroup({
         orgPublicKey: new FormControl(this.orgKey, Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgDescription: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgEmail: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgPrimaryMobile: new FormControl('', Validators.compose([Validators.minLength(10), Validators.maxLength(64), Validators.required])),
         orgSecondMobile: new FormControl('', Validators.compose([Validators.minLength(10), Validators.maxLength(64)])),
      });
   }

   ionViewDidLoad() { }

   uploadImage() {
      this.translate
         .get(["imageSourceHeader", "camera", "album", "cancel"])
         .subscribe((text) => {
            let actionSheet = this.actionSheetCtrl.create({
               title: text["ITEM_CREATE_CHOOSE_IMAGE"],
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
               })
               .catch((e) => console.log("err", e));
         },
         (err) => {
            console.log("Error", err);
         }
      );
   }

   /**
    * Send request Register blockchain
    * account to register
    */
   registerOrganization() {
      if (this.formRegister.valid && this.orgLogo && this.orgLogo !== "") {
         this.passwordPrompt().then((password) => {
            this.presentLoading()
            this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk)
               .then((secKey) => {
                  this.defaultAccSK = secKey;

                  this.blockchainService.preparesubAccount(this.defaultAccSK).then((subAccount: any) => {
                     const subAccountPair = this.blockchainService.getSubAccountPair(subAccount.publicKey, this.properties.defaultAccount);
                     const xdrPayload = {
                        Name: this.formRegister.get("orgName").value,
                        Description: this.formRegister.get("orgDescription").value,
                        Email: this.formRegister.get("orgEmail").value,
                        Phone: this.formRegister.get("orgPrimaryMobile").value,
                        PhoneSecondary: this.formRegister.get("orgSecondMobile").value,
                     }
                     this.accountService.buildProofHash(xdrPayload, this.defaultAccSK, tracSuperAcc).then((proofHash: any) => {
                        let hashResponse = proofHash;
                        Promise.all([
                           this.accountService.buildAcceptXDR(xdrPayload, hashResponse, subAccount, this.defaultAccSK, tracSuperAcc), // tracSuperAcc - Adding Tracified Super Acc as Signer
                           this.accountService.buildRejectXDR(hashResponse, subAccount, this.defaultAccSK, tracSuperAcc), // tracSuperAcc - Adding Tracified Super Acc as Signer
                        ]).then((xdrs: any) => {
                           const organizationPayload: Organization = {
                              Name: this.formRegister.get("orgName").value,
                              Description: this.formRegister.get("orgDescription").value,
                              Logo: this.orgLogo,
                              Email: this.formRegister.get("orgEmail").value,
                              Phone: this.formRegister.get("orgPrimaryMobile").value,
                              PhoneSecondary: this.formRegister.get("orgSecondMobile").value,
                              AcceptTxn: "",
                              AcceptXDR: xdrs[0].b64,
                              RejectTxn: "",
                              RejectXDR: xdrs[1].b64,
                              TxnHash: "",
                              Author: this.properties.defaultAccount.pk,
                              SubAccount: subAccountPair.publicKey(),
                              SequenceNo: "",
                              Status: "pending",
                              ApprovedBy: tracSuperAcc, //Currently the receiver will Tracified
                              ApprovedOn: "",
                           }
                           this.dataService.registerOrganization(organizationPayload).then((res) => {
                              this.dissmissLoading();
                              this.translate.get(['SUCCESS', 'REGISTRATION_REQUEST_SUCCESS']).subscribe(text => {
                                 this.presentAlert(text['SUCCESS'], text['REGISTRATION_REQUEST_SUCCESS']);
                              });
                              this.logger.info("Organization registered successfully!: ", this.properties.skipConsoleLogs, this.properties.writeToFile);
                              this.navCtrl.setRoot(BcAccountPage);
                           }).catch((registerError: any) => {
                              this.dissmissLoading();
                              this.translate.get(['ERROR', 'REGISTRATION_REQUEST_FAILED']).subscribe(text => {
                                 this.presentAlert(text['ERROR'], text['REGISTRATION_REQUEST_FAILED']);
                              });
                              this.logger.error("Organization registeration failed: " + JSON.stringify(registerError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                           })
                        }).catch((buildError: any) => {
                           this.dissmissLoading();
                           this.translate.get(['ERROR', 'FAILED_TO_BUILD_TRANSACTION']).subscribe(text => {
                              this.presentAlert(text['ERROR'], text['FAILED_TO_BUILD_TRANSACTION']);
                           });
                           this.logger.error("XDR builders failed: " + JSON.stringify(buildError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                        })
                     }).catch((proofError: any) => {
                        this.dissmissLoading();
                        this.translate.get(['ERROR', 'FAILED_TO_VERIFY_TRANSC']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['FAILED_TO_VERIFY_TRANSC']);
                        });
                        this.logger.error("Verify Registration failed: " + JSON.stringify(proofError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                     })
                  }).catch((subAccError: any) => {
                     this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_PREPARE_TRANSACTION', 'PENDING_TRANSACTION_ERROR']).subscribe(text => {
                        if (subAccError == "pendingTransacExist") {
                           this.presentAlert(text['ERROR'], text['PENDING_TRANSACTION_ERROR']);
                        } else {
                           this.presentAlert(text['ERROR'], text['FAILED_TO_PREPARE_TRANSACTION']);
                        }
                     });
                     this.logger.error("Preparing sub account failed: " + JSON.stringify(subAccError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  })
               }).catch((passwordError: any) => {
                  this.dissmissLoading();
                  this.translate.get(['ERROR', 'INVALID_TRANSACTION_PASSWORD']).subscribe(text => {
                    this.presentAlert(text['ERROR'], text['INVALID_TRANSACTION_PASSWORD']);
                  });
                  this.logger.error("Password validation failed: " + JSON.stringify(passwordError), this.properties.skipConsoleLogs, this.properties.writeToFile);
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
