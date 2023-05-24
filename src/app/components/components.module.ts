import { NgModule } from '@angular/core';
import { AccordianListComponent } from './accordian-list/accordian-list.component';
import { IonicModule } from 'ionic-angular';
import { SelectSearchableModule } from './search-dropdown/select-module';
import { OrganizationComponent } from './organization/organization.component';
import { TestimonialComponent } from './testimonial/testimonial.component';
import { ViewOrganizationComponent } from './view-organization/view-organization.component';
import { ViewTestimonialComponent } from './view-testimonial/view-testimonial.component';
import { DataServiceProvider } from '../providers/data-service/data-service';
@NgModule({
    declarations: [
        AccordianListComponent,
        OrganizationComponent,
        TestimonialComponent,
        ViewOrganizationComponent,
        ViewTestimonialComponent
    ],
    imports: [IonicModule, SelectSearchableModule],
    exports: [
        AccordianListComponent,
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