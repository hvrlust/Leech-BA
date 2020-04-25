import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AgGridModule} from 'ag-grid-angular';
import {RankListComponent} from "./rank-list.component";


@NgModule({
  declarations: [
    RankListComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    AgGridModule.withComponents([])
  ],
  exports: [
    RankListComponent
  ],
  providers: [],
  bootstrap: [],
  entryComponents: []
})
export class RankListModule { }
