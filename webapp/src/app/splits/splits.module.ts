import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AgGridModule} from 'ag-grid-angular';
import {SplitsComponent} from './splits.component';


@NgModule({
  declarations: [
    SplitsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    AgGridModule.withComponents([])
  ],
  exports: [
    SplitsComponent
  ],
  providers: [],
  bootstrap: [],
  entryComponents: []
})
export class SplitsModule { }
