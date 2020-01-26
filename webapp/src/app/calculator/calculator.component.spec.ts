import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CalculatorComponent} from './calculator.component';
import {MaterialModule} from '../material.module';
import {CommonModule} from '@angular/common';

describe('CalculatorComponent', () => {
  let component: CalculatorComponent;
  let fixture: ComponentFixture<CalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorComponent ],
      imports: [
        MaterialModule,
        CommonModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
