import { NgModule } from '@angular/core';
import { AccordionListComponent } from './accordion-list/accordion-list';
import { IonicModule } from 'ionic-angular';
import { SelectSearchableModule } from './search-dropdown/select-module';
@NgModule({
	declarations: [AccordionListComponent],
	imports: [IonicModule, SelectSearchableModule],
	exports: [AccordionListComponent]
})
export class ComponentsModule {}
