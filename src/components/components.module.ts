import { NgModule } from '@angular/core';
import { AccordionListComponent } from './accordion-list/accordion-list';
import { IonicModule } from 'ionic-angular';
import { SelectSearchableModule } from './search-dropdown/select-module';
import { OrganizationComponent } from './organization/organization';
import { TestimonialComponent } from './testimonial/testimonial';
@NgModule({
	declarations: [AccordionListComponent,
    OrganizationComponent,
    TestimonialComponent],
	imports: [IonicModule, SelectSearchableModule],
	exports: [AccordionListComponent,
    OrganizationComponent,
    TestimonialComponent]
})
export class ComponentsModule {}
