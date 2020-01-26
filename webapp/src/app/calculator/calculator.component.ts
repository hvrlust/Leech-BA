import {Component, OnInit} from '@angular/core';
import {CalculatorService} from './calculator.service';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faMinusCircle, faPlusCircle, faTimes} from '@fortawesome/free-solid-svg-icons';
import {CalculatorUtils, Customer} from './calculator.utils';

library.add(faTimes, faPlusCircle, faMinusCircle);

export interface RequestBxp {
  skill: string;
  level: string;
  amount: string;
}

export interface RequestPoints {
  current: {
    attack?: {
      level?: string;
      amount?: string;
    },
    collector?: {
      level?: string;
      amount?: string;
    },
    defender?: {
      level?: string;
      amount?: string;
    },
    healer?: {
      level?: string;
      amount?: string;
    }
  };
  need: {
    attack?: {
      level?: string;
      amount?: string;
    },
    collector?: {
      level?: string;
      amount?: string;
    },
    defender?: {
      level?: string;
      amount?: string;
    },
    healer?: {
      level?: string;
      amount?: string;
    }
  };
}
export interface Request {
  bxp?: RequestBxp[];
  points?: RequestPoints;
  king?: number;
  queen?: number;
}

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {
  services = [];
  levels: string[];
  filteredLevels: string[];
  roles: string[] = ['attack', 'collector', 'defender', 'healer'];
  optionsSelected = false;
  cost: string;
  request: Request = {points: {need: {}, current: {}}};
  requestBxp: RequestBxp = {skill: 'agility', level: '', amount: ''};
  customerInfo: Customer = {ironman: 'no'};
  constructor(private calculatorService: CalculatorService) {
    this.levels = Array(100).fill(1).map((x, i) => i.toString());
    this.levels = this.levels.reverse();
    this.levels.pop();
    this.filteredLevels = this.levels;
  }
  add(services: string[]): void {
    if (this.services.indexOf('info')) {
      this.services.push('info');
    }
    services.forEach(service => {
      if (!this.services.includes(service)) {
        if (service === 'points') {
          this.request.points.current.attack = {level: '1', amount: '0'};
          this.request.points.current.healer = {level: '1', amount: '0'};
          this.request.points.current.defender = {level: '1', amount: '0'};
          this.request.points.current.collector = {level: '1', amount: '0'};
          this.request.points.need.attack = {};
          this.request.points.need.healer = {};
          this.request.points.need.defender = {};
          this.request.points.need.collector = {};
        } else if (service === 'king') {
          this.request.king = 1;
        } else if (service === 'queen') {
          this.request.queen = 1;
        }
        this.services.push(service); // don't add if it already exists
      }
    });
  }
  cancel(service: string): void {
    const index = this.services.indexOf(service);
    this.services = (index > -1) ? [
      ...this.services.slice(0, index),
      ...this.services.slice(index + 1)
    ] : this.services;
    // TODO delete requests
    if (service === 'king') {
      this.request.king = undefined;
    }
    if (service === 'queen') {
      this.request.queen = undefined;
    }
    if (this.services.length === 1) {
      this.services = [];
    }
  }
  test(): void {
    // console.log(this.calculatorService.calculatePointsGivenRole(ROLE.col, 100, 0, false, 10));
    console.log(this.calculatorService.calculatePoints(
      this.request.points,
      0,
    ));
  }
  ngOnInit() {
  }
  onCalculateClick(): void {
    let cost = 0;
    this.calculatorService.setCustomer(this.customerInfo);
    // Calculate NM
    // Calculate Kingxx
    if (this.services.includes('king')) {
      // TODO be clever and deduct points if necessary
    }
    // Calculate insignia
    // Calculate bxp
    if (this.services.includes('bxp')) {
      cost += this.calculateBXP();
    }
    // Calculate points
    if (this.services.includes('points')) {
      cost += this.calculatorService.calculatePoints(this.request.points, 0);
    }
    this.cost = this.prettifyNumber(cost);
  }
  onClearClick(): void {
    this.services = [];
  }
  calculateBXP(): number {
    const level = this.stringToNumber(this.requestBxp.level);
    const amount = this.stringToNumber(this.requestBxp.amount);
    const skill = CalculatorUtils.skillStringToEnum(this.requestBxp.skill);
    return this.calculatorService.calculateBxp(level, amount, skill);
  }
  changeKing(increment: number): void {
    this.request.king += increment;
    this.request.king = Math.max(0, this.request.king);
  }
  changeQueen(increment: number): void {
    this.request.queen += increment;
    this.request.queen = Math.max(0, this.request.queen);
  }
  formatNumber(target): void {
    const value = this.stringToNumber(target.value);
    target.value = value > 0 ?  value.toLocaleString('en-GB') : '';
  }
  prettifyNumber(number): string {
    const value = number === undefined ? 0 : number;
    return value > 0 ?  value.toLocaleString('en-GB') : '0';
  }
  stringToNumber(num: string): number {
    return Number(num.replace(/\D/g, ''));
  }
  filterLevels(value: string): void {
    this.filteredLevels = this.levels.filter(level => level.toString().indexOf(value) === 0);
  }
  titleCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
