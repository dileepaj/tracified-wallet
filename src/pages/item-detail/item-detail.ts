import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Operation, Server, TransactionBuilder, Asset, Keypair } from 'stellar-sdk';


@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  user: any;
  currentItems: any;
  receivers = [];
  loading;
  isLoadingPresent: boolean;
  // selectedItem: string;
  selectedReceiver: any;
  COCForm: { selectedItem: string, qty: string, receiver: string, vaidity: Date, } = {
    selectedItem: '',
    qty: '',
    receiver: '',
    vaidity: new Date()
  };
  constructor(public navCtrl: NavController, private toastCtrl: ToastController,
    private loadingCtrl: LoadingController, navParams: NavParams, public itemsProvider: Items, private alertCtrl: AlertController) {

    this.user = JSON.parse(localStorage.getItem('_user'))

    this.item = navParams.get('item');
    this.currentItems = navParams.get('currentItems') || this.currentItems.defaultItem;
    this.receivers = navParams.get('receivers');

    console.log(this.COCForm.selectedItem)
    console.log(this.item)
    console.log(this.currentItems)
    console.log(this.receivers)
  }

  ionViewDidLoad() {
    this.COCForm.selectedItem = this.item.asset_code;
    if (this.receivers[0]) {
      this.selectedReceiver = this.receivers[0].Receivers;
    }
    // this.selectedItem = this.currentItems.findIndex(x => x.asset_code === this.item.asset_code)

  }

  passwordPrompt() {
    let alert = this.alertCtrl.create({
      cssClass: 'submitPassword',
      title: 'Enter Password : ',
      inputs: [
        {
          name: 'password',
          placeholder: '***********',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Submit',
          handler: data => {
            if (data) {
              console.log(data);
              this.doCOC(data.password);
            } else {
              // console.log(data);
              return data;
            }
          }
        }
      ]
    });
    alert.present();
  }

  doCOC(signerSK) {
    this.presentLoading();
    console.log(this.COCForm);
    try {
      this.AcceptBuild('PreviousTXNID', 'Identifier', signerSK).then((AcceptXdr) => {
        this.RejectBuild(signerSK).then((RejectXdr) => {
          const obj = {
            "Sender": this.user.PublicKey,
            "Receiver": this.COCForm.receiver,
            // "TxnHash":"GD4PIV4DVVKMJRJLERGTTNTKNG6Z67V7JFHYCJNWXMPR2DSQ5FDI2QCT",
            "AcceptXdr": AcceptXdr,
            "RejectXdr": RejectXdr,
            "Identifier": "Identifier1002030",
            "Status": "pending"
          }
          console.log(obj)
          this.itemsProvider.addCOC(obj).subscribe((resp) => {
            // this.navCtrl.push(MainPage);
            console.log(resp)
            // @ts-ignore
            if (resp.Message == "Success" && this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast(this.item.asset_code + ' transfered succesfully.');
            } else {
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Error! transaction unsuccesfull.');
              }
            }
          }, (err) => {
            console.log(err);
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! transaction unsuccesfull.');
            }
          });
        })
          .catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! transaction unsuccesfull.');
            }
          })
      });
    } catch (error) {
      console.log(error);
      if (this.isLoadingPresent) {
        this.dissmissLoading();
        this.presentToast('Error! transaction unsuccesfull.');
      }
    }

  }

  AcceptBuild(PreviousTXNID, Identifier, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = this.COCForm.receiver;
        const quantity = this.COCForm.qty;
        const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.user.PublicKey;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        var asset = new Asset(item, 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
        Network.useTestNetwork();
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(receiver)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
              .addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
              .addOperation(Operation.manageData({ name: 'PreviousTXNID', value: PreviousTXNID, }))
              .addOperation(Operation.manageData({ name: 'Identifier', value: Identifier, }))
              .addOperation(Operation.payment({
                destination: receiver,
                asset: asset,
                amount: quantity,
                source: senderPublickKey
              }))
              .build();
            transaction.sign(sourceKeypair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            // console.log("envelope =>  "+transaction.toEnvelope());
            XDR = transaction.toEnvelope();
            b64 = XDR.toXDR('base64');
            console.log('XDR in base64 =>  ' + JSON.stringify(b64));

            resolve(b64);

          })
          .catch(function (e) {
            console.log(e);
            // reject(e)

          });

      } catch (error) {
        console.log(error)
      }
    })

  }

  RejectBuild(signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = this.COCForm.receiver;
        const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.user.PublicKey;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        console.log(maxTime)

        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        // var asset = new Asset(item, 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime }, bumpSequence: { bumpTo: '2284484514807850' } };
        Network.useTestNetwork();
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(receiver)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
              .addOperation(Operation.manageData({
                name: 'acceptance', value: 'rejected', source: senderPublickKey
              }))
              .build();
            transaction.sign(sourceKeypair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            // console.log("envelope =>  "+transaction.toEnvelope());
            XDR = transaction.toEnvelope();
            b64 = XDR.toXDR('base64');
            console.log('XDR in base64 =>  ' + JSON.stringify(b64));

            resolve(b64);
          })
          .catch(function (e) {
            // reject(e)
            console.log(e);
          });
      } catch (error) {
        console.log(error)
      }
      // return b64;
    })

  }

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'pleasewait'
    });

    this.loading.present();
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: 'middle'
    });
    toast.present();
  }

}
