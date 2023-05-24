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
import { Organization, PGPInformation } from '../../shared/models/organization';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Logger } from 'ionic-logger-new';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import CryptoJS from 'crypto-js';

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
   public keyAccount: any;
   pgpPK: any;
   signature: any;
   hash: any;
   skp: any;
   DS: any;
   keysA: any;
   keysB: any;

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
      public translate: TranslateService,
      private service:ApiServiceProvider
   ) {
      this.orgKey = this.navParams.get('organizationKey');
      this.formRegister = new FormGroup({
         orgPublicKey: new FormControl(this.orgKey, Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgDescription: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         orgEmail: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64),Validators.pattern('^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)(\.[A-Za-z]{2,})$') ,Validators.required])),
         orgPrimaryMobile: new FormControl('', Validators.compose([Validators.minLength(10), Validators.maxLength(15), Validators.required])),
         orgSecondMobile: new FormControl('', Validators.compose([Validators.minLength(10), Validators.maxLength(15)])),
      });
   }

   ionViewDidLoad() {
      console.log("--------------------pppppppppppp--------",this.orgKey)
      console.log("--------------------kkkkkkkkkkkkkkkkkk--------")
      this.dataService.retrieveBlockchainAccounts().then((steAcc:any)=>{
         console.log("--------------------ssssssssss--------",steAcc.account.mainAccount.sk)
         this.skp=steAcc.account.mainAccount.sk
         //console.log("stellar account: ",steAcc)
      })
    }

   ionViewCanLeave() {
      return !this.isLoadingPresent;
    }

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
      if (this.formRegister.valid) { 
         console.log("-----------starting") //&& this.orgLogo && this.orgLogo !== ""
         this.passwordPrompt().then((password) => {
            this.presentLoading()
            console.log("account : ", this.skp, this.orgKey, password)
            console.log("Default accounts : ",this.properties.defaultAccount.sk,this.properties.defaultAccount.pk)
            this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk)
               .then((secKey) => {
                  this.defaultAccSK = secKey;
                  console.log("secret key: ",this.defaultAccSK)


                  this.blockchainService.preparesubAccount(this.defaultAccSK).then((subAccount: any) => {
                     console.log("subaccount out: ",subAccount)
                     const subAccountPair = this.blockchainService.getSubAccountPair(subAccount.publicKey, this.properties.defaultAccount);
                     console.log("-----------------towards xdr----------")
                     console.log("stellar key is: ",this.orgKey),
                     this.service.GetAccountDetailsforEndorsment(this.orgKey).then((res:any)=>{
                        console.log("stellar ac info recived : ",res.pgppublickkey,res.username)
                        this.keysA=res
                        this.dataService.retrievePGPAccounts().then((accres:any)=>{
                          console.log("pgp account: ",accres,accres.publicKeyArmored)
                          this.pgpPK=accres.publicKeyArmored
                          if (res.pgppublickkey == accres.publicKeyArmored){
                           console.log("pgp keys are the smae")
                           this.dataService.retrieveBlockchainAccounts().then((steAcc:any)=>{
                              console.log("stellar account: ",steAcc)
                              this.keysB=steAcc
                             // alert("Owners are the same : ")
                              console.log("tracified accounts: ",steAcc)
                             this.createDigitalSginature(accres.privateKeyArmored, this.formRegister.get("orgDescription").value, res.pgppksha256, steAcc.account.mainAccount.pk, steAcc.account.mainAccount.skp)
                           //st txn here causes undefined signature
                          
                           })
                          
                          }else{
                            alert("Owners are not the same")
                          }
                        })
                      })
                      //failed to prepare txn if stellar transaction here
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
                           this.accountService.buildRejectXDR(hashResponse, subAccount, this.defaultAccSK, tracSuperAcc),
                           this.blockchainService.SaveDigitalSignature(this.signature,this.formRegister.get("orgDescription").value,this.keysA.pgppksha256,this.keysB.account.mainAccount.pk,this.keysB.account.mainAccount.skp).then((hash:any)=>{
                              console.log("txn: ",hash.hash)
                              this.hash=hash.hash
                             })
                         // tracSuperAcc - Adding Tracified Super Acc as Signer
                        ]).then((xdrs: any) => {

               

                     

                           const pgpData : PGPInformation = {
                              PGPPublicKey: this.pgpPK,
                              StellarPublicKey: this.orgKey ,
                              DigitalSignature: this.DS,
                              SignatureHash:this.signature,
                              StellarTXNToSave: this.hash,
                              StellarTXNToVerify: '',

                           }
                           const organizationPayload: Organization = {
                              PGPData:pgpData,
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

                           console.log("payload: ",organizationPayload)
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

                        ////////////
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
                  this.forgetPasswordPopUp();
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

   forgetPasswordPopUp() {
      let alert = this.alertCtrl.create({
        title: "Incorrect Password!",
        subTitle: 'The password you entered is incorrect. Please try again or reset your password.',
        buttons: [
          {
            text: 'Forgot Password',
            handler: data => {
              this.privateKeyPopUp();
            }
          },
          {
            text: 'OK'
          }
        ]
      });
      alert.present();
    }
  
  
  
    privateKeyPopUp() {
      let alert = this.alertCtrl.create({
        title: "Forgot Password.",
        inputs: [
          {
            name: 'privateKey',
            placeholder: 'Private Key'
          }
        ],
        buttons: [
          {
            text: 'Submit',
            handler: data => {
              this.forgotTransactionPassword(data.privateKey);
            }
          }
        ]
      });
      alert.present();
    }
  
  
    forgotTransactionPassword(privateKey: string) {
      if (this.dataService.validateSecretKey(privateKey)) {
        this.newPasswordPopUp().then((password) => {
          let encKey = this.dataService.encryptKey(privateKey, password);
          if (encKey) {
            let update = {
              accName: this.properties.defaultAccount.accountName,
              sk: encKey
            }
            this.dataService.changeTransactionPasswordWithPrivateKey(update).then((res) => {
              if (res.status === 200) {
                this.translate.get(['SUCCESS_CHANGED_PASSWORD']).subscribe(text => {
                  this.presentToast(text['SUCCESS_CHANGED_PASSWORD']);
                });
              } else {
                this.translate.get(['COULD_NOT_RESET']).subscribe(text => {
                  this.presentToast(text['COULD_NOT_RESET']);
                });
              }
            }).catch((err) => {
              this.translate.get(['FAILED_UPDATE_NEW_PASSWORD']).subscribe(text => {
                this.presentToast(text['FAILED_UPDATE_NEW_PASSWORD']);
              });
              this.logger.error("[FORGOT]Password update failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
          } else {
            this.translate.get(['CANNOT_ENCRYPT_NEW_PASSWORD']).subscribe(text => {
              this.presentToast(text['CANNOT_ENCRYPT_NEW_PASSWORD']);
            });
          }
        }).catch((err) => {
          this.translate.get(['FAILED_UPDATE_NEW_PASSWORD']).subscribe(text => {
            this.presentToast(text['FAILED_UPDATE_NEW_PASSWORD']);
          });
          this.logger.error("[FORGOT]Popup error: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      } else {
        this.translate.get(['PRIVATE_KEY_INCORRECT']).subscribe(text => {
          this.presentToast(text['PRIVATE_KEY_INCORRECT']);
        });
      }
    }
  
    newPasswordPopUp(): Promise<any> {
  
      let resolveFunction: (newPassword: any) => void;
      let promise = new Promise<any>(resolve => {
        resolveFunction = resolve;
      });
  
      let passwordPopUp = this.alertCtrl.create({
        title: "Enter your new Transaction password",
        inputs: [
          {
            name: "password",
            placeholder: "New Transaction Password",
            type: 'password'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              resolveFunction(false);
            }
          },
          {
            text: 'OK',
            handler: data => {
              resolveFunction(data.password);
            }
          }
        ]
      });
  
      passwordPopUp.present();
  
      return promise;
    }

    createDigitalSginature(pgpprivate:any,cyphertext:any,hash:any,stellarpk,stellarsk) {
      const openpgp = require('openpgp');
      (async () => {
        const passphrase = `hackerseatthegalbanis`; // what the private key is encrypted with
    
        const { keys: [privateKey] } = await openpgp.key.readArmored(pgpprivate);
        console.log("before decrypted:",privateKey)
        await privateKey.decrypt(passphrase);
        console.log("after decrypted:",privateKey)
  
        const { data: cleartext } = await openpgp.sign({
            message: openpgp.cleartext.fromText(cyphertext), // CleartextMessage or Message object
            privateKeys: [privateKey]                             // for signing
        });
        this.DS=cleartext
        console.log("signed hash: ",this.DS); 
        this.signature= CryptoJS.SHA256(cleartext).toString(CryptoJS.enc.Hex);// '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'
       
    //when put stellar transaction here bad seq
    })
    ();
    }
  
}
// this.blockchainService.SaveDigitalSignature(this.signature,this.formRegister.get("orgDescription").value,this.keysA.pgppksha256,this.keysB.account.mainAccount.pk,this.keysB.account.mainAccount.skp).then((hash:any)=>{
//    console.log("txn: ",hash.hash)
//    this.hash=hash.hash
//   })