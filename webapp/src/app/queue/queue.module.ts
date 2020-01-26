import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import {ActionComponent, QueueComponent, ServiceComponent} from './queue.component';
import {AgGridModule} from 'ag-grid-angular';
import {
  MatNativeDateModule,
} from '@angular/material';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule, } from '@angular/material/datepicker';
import { MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {QueueAddComponent} from './queue-add.component';
import {MaterialModule} from '../material.module';
import {QueueEditComponent} from './queue-edit.component';
import {ConfirmationComponent} from './confirmation.component';


@NgModule({
  declarations: [
    QueueComponent,
    QueueAddComponent,
    QueueEditComponent,
    ActionComponent,
    ServiceComponent,
    ConfirmationComponent
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
    AgGridModule.withComponents([ActionComponent, ServiceComponent, ConfirmationComponent])
  ],
  exports: [
    QueueComponent,
    QueueAddComponent,
    QueueEditComponent,
    ActionComponent,
    ServiceComponent,
    ConfirmationComponent
  ],
  providers: [],
  bootstrap: [],
  entryComponents: [QueueAddComponent, QueueEditComponent]
})
export class QueueModule { }
