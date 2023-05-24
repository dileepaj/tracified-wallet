import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectSearchable } from './select';
import { SelectSearchablePage } from './search-dropdown.component'; 

@NgModule({
    declarations: [
        SelectSearchable,
        SelectSearchablePage
    ],
    imports: [
        IonicPageModule.forChild(SelectSearchable),
        IonicPageModule.forChild(SelectSearchablePage)
    ],
    exports: [
        SelectSearchable,
        SelectSearchablePage
    ],
    entryComponents: [
        SelectSearchable,
        SelectSearchablePage
    ]
})
export class SelectSearchableModule { }
