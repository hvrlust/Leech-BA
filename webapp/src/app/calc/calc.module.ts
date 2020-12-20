import { PanelComponent } from './panel/panel.component';
import { CenteredSnackbarComponent } from './centered-snack-bar/centered-snack-bar.component';
import { TimePipe } from './time.pipe';

import { NgModule } from '@angular/core';
import { CalcComponent } from './calc.component';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BaIcon } from './ba-icon/ba-icon';
import { RequestSubmittedDialog } from './request-submitted-dialog.component';

@NgModule({
    entryComponents: [CenteredSnackbarComponent, RequestSubmittedDialog],
    declarations: [
        PanelComponent,
        CenteredSnackbarComponent,
        RequestSubmittedDialog,
        TimePipe,
        CalcComponent,
        BaIcon,
    ],
    imports: [
        MaterialModule,
        CommonModule,
        ReactiveFormsModule,
    ],
})
export class CalcModule { }
