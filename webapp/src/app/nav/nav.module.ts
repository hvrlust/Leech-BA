import {NgModule} from '@angular/core';
import {MaterialModule} from '../material.module';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import {NavComponent} from './nav.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    NavComponent
  ],
  providers: [],
  bootstrap: []
})
export class NavModule { }
