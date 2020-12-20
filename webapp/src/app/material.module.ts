import {NgModule} from '@angular/core';

import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatChipsModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatCheckboxModule,
  MatSnackBarModule,
  MatDialogModule,
} from '@angular/material';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDividerModule} from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  exports: [
    MatButtonModule,
    MatToolbarModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ]
})
export class MaterialModule {}
