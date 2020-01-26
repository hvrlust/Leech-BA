import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CalculatorUtils, Customer, ROLE, SKILL} from './calculator.utils';
import {RequestPoints} from './calculator.component';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  private customer: Customer;
  private invoice: string[] = [];

  constructor(private http: HttpClient) { }
  getLevels(): void {
    this.http.get('/api/getlevels').subscribe(res => {
      console.log(res);
    });
  }
  setCustomer(customer: Customer): void {
    this.customer = {ironman: 'no'};
    if (customer.ironman !== undefined) {
      this.customer['ironman'] = customer.ironman;
    }
    if (customer.ba !== undefined) {
      this.customer['ba'] = customer.ba;
    }
    if (customer.rsn !== undefined) {
      this.customer['rsn'] = customer.rsn;
    }
    if (customer.enhancer !== undefined) {
      this.customer['enhancer'] = customer.enhancer;
    }
  }
  calculate(): number {
    // TODO do normal mode first -> kings -> bxp/points
    return 0;
  }
  calculatePoints(request: RequestPoints, enhancer: number): number {
    const roles: {} = this.parseRequest(request);
    console.log(roles);
    console.log(roles[ROLE.col]);
    // C A D H
    let excess;
    let cost = 0;

    // Calculate collect
    const [costCol, amountCol, enhancerChargesCol] =
      this.calculatePointsGivenRole(ROLE.col, roles[ROLE.col], enhancer);
    excess = amountCol - roles[ROLE.col];
    cost += costCol;

    // Calculate att - check leftover col first
    roles[ROLE.att] -= excess;
    const [costAtt, amountAtt, enhancerChargesAtt] = this.calculatePointsGivenRole(ROLE.att,
      roles[ROLE.att], enhancerChargesCol);
    excess = amountAtt - roles[ROLE.att];
    cost += costAtt;

    roles[ROLE.def] -= excess;
    const [costDef, amountDef, enhancerChargesDef] = this.calculatePointsGivenRole(ROLE.def,
      roles[ROLE.def], enhancerChargesAtt);
    excess = amountDef - roles[ROLE.def];
    cost += costDef;

    roles[ROLE.heal] -= excess;
    const [costHeal, amountHeal, enhancerChargesHeal] = this.calculatePointsGivenRole(ROLE.heal,
      roles[ROLE.heal], enhancerChargesDef);
    excess = amountHeal - roles[ROLE.heal];
    cost += costHeal;
    console.log('excess: ' + excess);
    console.log('enhancers left: ' + enhancerChargesHeal);
    return cost;
  }

  // Returns [cost, actualAmount, remainingEnhancers]
  calculatePointsGivenRole(role: ROLE, needAmount: number, enhancer: number):
    [number, number, number] {
    if (needAmount <= 0) {
      return [0, 0, enhancer];
    }
    if (this.customer.ba === '0' || this.customer.ba === 'idk') {
      this.customer.ba = '1';
      const newNeedAmount = needAmount - CalculatorUtils.POINTS_NM[role];
      const [cost, actualAmount, enhancerRemaining] =
        this.calculatePointsGivenRole(role, newNeedAmount, enhancer);
      return [cost + CalculatorUtils.PRICE_QUEEN,
        actualAmount + CalculatorUtils.POINTS_NM[role], enhancerRemaining];
    }
    if (this.customer.ba === '1' || this.isIronman()) {
      this.customer.ba = '2';
      if (this.isIronman()) {
        // consume enhancer
      }
      const gain = CalculatorUtils.POINTS_HM[role] + Math.min(enhancer, 9) / 9 * CalculatorUtils.POINTS_HM[role];
      const newNeedAmount = needAmount - gain;
      const [cost, actualAmount, enhancerRemaining] =
        this.calculatePointsGivenRole(role, newNeedAmount,
        enhancer - Math.min(enhancer, 9));
      return [cost + CalculatorUtils.PRICE_FULL_HM_UNLOCK,
        actualAmount + gain,
        enhancerRemaining - Math.min(enhancerRemaining, 9)];
    }
    if (this.customer.ba === '2' || this.customer.ba === '3') {
      const gain = CalculatorUtils.POINTS_PHM[role] + Math.min(enhancer, 4) / 4 * CalculatorUtils.POINTS_PHM[role];
      const newNeedAmount = needAmount - gain;
      const [cost, actualAmount, enhancerRemaining] =
        this.calculatePointsGivenRole(role, newNeedAmount, enhancer - Math.min(enhancer, 4));
      return [cost + CalculatorUtils.PRICE_PARTHM_POINTS,
        actualAmount + gain,
        enhancerRemaining - Math.min(enhancerRemaining, 4)];
    }
    return [0, 0, enhancer];
  }
  calculateBxp(level: number, needAmount, skill: SKILL): number {
    let nm = 0; // 1-10 nm
    let hm = 0; // hard mode multiplier only (for 1 wave)

    switch (skill) {
      case SKILL.agility:
        nm = CalculatorUtils.NMA;
        hm = CalculatorUtils.HMA[level];
        break;
      case SKILL.firemaking:
        nm = CalculatorUtils.NMF;
        hm = CalculatorUtils.HMF[level];
        break;
      case SKILL.mining:
        nm = CalculatorUtils.NMM;
        hm = 117.237 * level + 97.273;
        break;
    }

    const PHM = CalculatorUtils.MULTIPLIER * hm * 27.5; // 6-9
    const FHM = CalculatorUtils.MULTIPLIER * hm * 38; // 1-9
    nm = CalculatorUtils.MULTIPLIER * nm;

    if (needAmount <= 0) {
      return 0;
    }

    if (this.customer.ba === '0' || this.customer.ba === 'idk') {
      this.customer.ba = '1';
      const newNeedAmount = needAmount - (nm * level / 99);
      this.invoice.push('NM');
      return CalculatorUtils.PRICE_QUEEN + this.calculateBxp(level, newNeedAmount, skill);
    }

    if (this.customer.ba === '1') {
      this.customer.ba = '2';
      const newNeedAmount = needAmount - FHM;
      this.invoice.push('1-9 HM');
      return CalculatorUtils.PRICE_FULL_HM_UNLOCK + this.calculateBxp(level, newNeedAmount, skill);
    }

    if (this.customer.ba === '2' || this.customer.ba === '3') {
      const rounds: number = this.calculateBxpRounds(level, needAmount, PHM);
      this.invoice.push('6-9 HM');
      return CalculatorUtils.PRICE_PARTHM * rounds;
    }

    return 0;
  }
  isIronman(): boolean {
    return this.customer.ironman === 'yes';
  }
  parseRequest(request: RequestPoints): object {
    console.log(request);
    const att = CalculatorUtils.LEVEL_POINTS[Number(request.need.attack.level)] +
      Number(request.need.attack.amount) -
      CalculatorUtils.LEVEL_POINTS[Number(request.current.attack.level)] -
      Number(request.current.attack.amount);
    const def = CalculatorUtils.LEVEL_POINTS[Number(request.need.defender.level)] +
      Number(request.need.defender.amount) -
      CalculatorUtils.LEVEL_POINTS[Number(request.current.defender.level)] -
      Number(request.current.defender.amount);
    const heal = CalculatorUtils.LEVEL_POINTS[Number(request.need.healer.level)] +
      Number(request.need.healer.amount) -
      CalculatorUtils.LEVEL_POINTS[Number(request.current.healer.level)] -
      Number(request.current.healer.amount);
    const col = CalculatorUtils.LEVEL_POINTS[Number(request.need.collector.level)] +
      Number(request.need.collector.amount) -
      CalculatorUtils.LEVEL_POINTS[Number(request.current.collector.level)] -
      Number(request.current.collector.amount);
    return {
      [ROLE.att]: att,
      [ROLE.col]: col,
      [ROLE.def]: def,
      [ROLE.heal]: heal
    };
  }
  // For calculating number of 6-9 rounds
  calculateBxpRounds(level, needAmount, roundBxp): number {
    if (needAmount === 0) {
      return 0;
    }
    if (needAmount - roundBxp <= 0) {
      return 1;
    }
    return 1 + this.calculateBxpRounds(level, needAmount - roundBxp , roundBxp);
  }
}
