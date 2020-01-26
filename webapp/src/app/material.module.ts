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
} from '@angular/material';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDividerModule} from '@angular/material/divider';

@NgModule({
  imports: [
    MatButtonModule,
    MatToolbarModule,
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
    MatDividerModule
  ],
  exports: [
    MatButtonModule,
    MatToolbarModule,
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
    MatDividerModule
  ]
})
export class MaterialModule {}
