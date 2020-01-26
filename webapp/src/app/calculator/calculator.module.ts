import {NgModule} from '@angular/core';
import {CalculatorComponent} from './calculator.component';
import {MaterialModule} from '../material.module';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    CalculatorComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule
  ],
  exports: [
    CalculatorComponent
  ],
  providers: [],
  bootstrap: []
})
export class CalculatorModule { }
