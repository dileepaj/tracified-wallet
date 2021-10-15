import { Component, OnInit } from "@angular/core";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import {
    helpCoC,helpCreatBCHAcc,helpIntro,helpSignIn,helpUserDetails
} from "../../shared/documentation";


@Component({
    selector: "help",
    templateUrl: "help.html",
})
export class HelpPage {
    constructor(private iab: InAppBrowser) {
    }

    opendoc(){
        console.log("hello Nilan")
    }
    openHelp(i:Number) {
        switch (i) {
            case 1:
                this.iab.create(helpIntro, `_blank`);
                break;
            case 2:
                this.iab.create(helpSignIn, `_blank`);
                break;
            case 3:
                this.iab.create(helpCreatBCHAcc, `_blank`);
                break;
            case 4:
                this.iab.create(helpCoC, `_blank`);
                break;
            case 5:
                this.iab.create(helpUserDetails, `_blank`);
                break;
            default:
        }
       
    }
}
