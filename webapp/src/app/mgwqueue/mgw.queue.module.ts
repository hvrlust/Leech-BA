import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import {MgwActionComponent, MgwQueueComponent, MgwServiceComponent} from './mgw.queue.component';
import {AgGridModule} from 'ag-grid-angular';
import {
  MatNativeDateModule,
} from '@angular/material';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule, } from '@angular/material/datepicker';
import { MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MgwQueueAddComponent} from './mgw.queue-add.component';
import {MaterialModule} from '../material.module';
import {MgwQueueEditComponent} from './mgw.queue-edit.component';
import {MgwConfirmationComponent} from './mgw.confirmation.component';
import {MgwDemoteConfirmComponent} from './mgw.demote.confirm.component';


@NgModule({
  declarations: [
    MgwQueueComponent,
    MgwQueueAddComponent,
    MgwQueueEditComponent,
    MgwActionComponent,
    MgwServiceComponent,
    MgwConfirmationComponent,
    MgwDemoteConfirmComponent
  ],
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MaterialModule,
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    AgGridModule.withComponents([MgwActionComponent, MgwServiceComponent, MgwConfirmationComponent,MgwDemoteConfirmComponent])
  ],
  exports: [
    MgwQueueComponent,
    MgwQueueAddComponent,
    MgwQueueEditComponent,
    MgwActionComponent,
    MgwServiceComponent,
    MgwConfirmationComponent,
    MgwDemoteConfirmComponent
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [MgwQueueAddComponent, MgwQueueEditComponent]
})
export class MgwQueueModule { }
