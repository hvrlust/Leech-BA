import {inject, TestBed} from '@angular/core/testing';

import {CalculatorService} from './calculator.service';
import {CalculatorModule} from './calculator.module';
import {MaterialModule} from '../material.module';
import {CommonModule} from '@angular/common';

describe('CalculatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalculatorService],
      imports: [
        MaterialModule,
        CommonModule,
        CalculatorModule,
      ]
    });
  });

  it('should return cost of queen', inject([CalculatorService], (service: CalculatorService) => {
    // const amount: [number, number] = service.calculatePointsGivenRole(ROLE.col, 100, 0, false);
    // expect(amount).toEqual([CalculatorService.PRICE_QUEEN, CalculatorService.POINTS_NM[ROLE.col]]);
  }));
});
