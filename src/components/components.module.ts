import { NgModule } from '@angular/core';
import { AccordionListComponent } from './accordion-list/accordion-list';
import { IonicModule } from 'ionic-angular';
import { SelectSearchableModule } from './search-dropdown/select-module';
import { OrganizationComponent } from './organization/organization';
import { TestimonialComponent } from './testimonial/testimonial';
import { ViewOrganizationComponent } from './view-organization/view-organization';
import { ViewTestimonialComponent } from './view-testimonial/view-testimonial';
import { DataServiceProvider } from '../providers/data-service/data-service';
@NgModule({
    declarations: [
        AccordionListComponent,
        OrganizationComponent,
        TestimonialComponent,
        ViewOrganizationComponent,
        ViewTestimonialComponent
    ],
    imports: [IonicModule, SelectSearchableModule],
    exports: [
        AccordionListComponent,
        OrganizationComponent,
        TestimonialComponent,
        ViewOrganizationComponent,
        ViewTestimonialComponent
    ],
    providers: [
        DataServiceProvider
    ]
})
export class ComponentsModule { }
