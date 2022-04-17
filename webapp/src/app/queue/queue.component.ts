import {Component} from '@angular/core';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faPlus, faSyncAlt, faTrashAlt, faUserCog} from '@fortawesome/free-solid-svg-icons';
import {QueueAddComponent} from './queue-add.component';
import {QueueService} from './queue.service';
import {ICellRendererAngularComp} from 'ag-grid-angular/src/interfaces';
import {mapValues} from 'lodash';
import {QueueEditComponent} from './queue-edit.component';
import {ConfirmationComponent} from './confirmation.component';
import { CookieService } from 'ngx-cookie-service';
import {MatDialog} from '@angular/material/dialog';

library.add(faPlus, faTrashAlt, faSyncAlt, faUserCog);

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
  providers: [ CookieService ]
})
export class QueueComponent {
  lastRefresh = 'Loading';
  lastRefreshBy = {};
  objectKeys = Object.keys;
  selectedIcons = [];
  private gridApi;
  private gridColumnApi;
  selected = {};
  leechFilter = {};
  gridOptions = {
    suppressMovableColumns: true,
    suppressFieldDotNotation: true,
    enableSorting: true,
    context: {
      componentParent: this
    }
  };
  columnDefs = [
    {headerName: '#', field: 'number', width: 46, cellClass: ['cell-wrap-text', 'cell-padding'] },
    {headerName: 'Date', field: 'date', width: 46, cellClass: ['cell-wrap-text', 'cell-padding'], comparator: this.dateComparator },
    {headerName: 'Rsn', field: 'rsn', width: 94, autoHeight: true, cellClass: ['cell-wrap-text', 'break-word', 'cell-padding']},
    {headerName: 'Services required', field: 'need', autoHeight: true, cellRendererFramework: ServiceComponent,
      cellClass: ['cell-wrap-text', 'cell-padding']},
    {headerName: 'BA', field: 'ba', width: 44, cellClass: ['cell-wrap-text', 'cell-padding']},
    {headerName: 'Notes', field: 'notes', width: 140, autoHeight: true, cellClass: ['cell-wrap-text', 'break-word', 'cell-padding']},
    {headerName: 'Discord', field: 'discord', width: 80, cellClass: ['cell-wrap-text', 'cell-padding']},
    {headerName: 'Action', field: 'action', width: 86, cellRendererFramework: ActionComponent,
      editable: false,
      cellClass: ['no-border', 'cell-action']},
    {headerName: 'filter', field: 'filter', hide: true},
  ];
  displayIcons = {
    att: true,
    def: true,
    col: true,
    heal: true,
    agility: true,
    mining: true,
    fm: true
  };
  rowData = [];
  dataList = {};
  queueUpdater;
  constructor(public dialog: MatDialog, private queueService: QueueService, private cookieService: CookieService) {
    if (cookieService.check('selectedIcons')) {
      this.displayIcons = JSON.parse(cookieService.get('selectedIcons'));
    }
    this.updateIconSelected();
  }
  updateIconSelected() {
    this.selectedIcons = [];
    for (let i = 0; i < Object.keys(this.displayIcons).length; i++) {
      const key = Object.keys(this.displayIcons)[i];
      if (this.displayIcons[key]) {
        this.selectedIcons.push(key);
      }
    }
  }
  iconSelectChange() {
    for (let i = 0; i < Object.keys(this.displayIcons).length; i++) {
      const key = Object.keys(this.displayIcons)[i];
      if (this.selectedIcons.includes(key)) {
        this.displayIcons[key] = true;
      } else {
        this.displayIcons[key] = false;
      }
    }
    this.cookieService.set('selectedIcons', JSON.stringify(this.displayIcons), 365);
    this.refreshQueue();
  }

  refreshQueue(force?: boolean, next?: Function) {
    this.queueService.getQueue().subscribe(res => {
      const rowsToAdd = [];
      const rowsToDelete = [];
      for (let i = 0; i < res['response'].length; i++) {
        const entry = res['response'][i];

        const parsedDate = new Date(entry['date']);
        const number = i + 1;
        const d = (parsedDate.getUTCDate() < 10 ? '0' + parsedDate.getUTCDate() : parsedDate.getUTCDate()) + '/' +
          ((parsedDate.getUTCMonth() + 1) < 10 ? '0' + (parsedDate.getUTCMonth() + 1) : (parsedDate.getUTCMonth() + 1));
        const rsn = entry['rsn'];
        const ba = entry['ba'];
        const notes = entry['notes'];
        const discord = entry['discord'];
        const action = {rsn: entry['rsn']};
        const need = this.parseServices(entry['services']);
        const services = entry['services'];
        const id = entry['id'];
        const filterCell = this.filterCell(need, entry['ba'], (discord === null || discord === '') ? '' : 'discord');
        const data = {
          number: number,
          date: d,
          rsn: rsn,
          need: need,
          ba: ba,
          notes: notes,
          action: action,
          services: services,
          id: id,
          discord: discord,
          originalDate: parsedDate,
          filter: filterCell
        };
        rowsToAdd.push(data);
        this.dataList[rsn] = data;
      }

      this.gridApi.forEachNode(function (node) {
        rowsToDelete.push(node.data);
      });

      if (this.isRowDataDifferent(rowsToAdd, rowsToDelete) || force) {
        this.rowData = rowsToAdd;
        this.gridApi.updateRowData({add: rowsToAdd, remove: rowsToDelete});
      }
      const date = new Date();
      this.lastRefresh = date.toLocaleString();
      if (res['update'] !== undefined) {
        this.lastRefreshBy = res['update'];
        this.lastRefreshBy['modifiedDate'] = this.timeDifference(new Date(this.lastRefreshBy['date'] + 'Z'));
      }
      if (next) {
        next();
      }
    }, err => {
      console.log(err);
      clearInterval(this.queueUpdater);
    });
  }
  isRowDataDifferent(rowData, comparedRowData): boolean {
    if (rowData.length !== comparedRowData.length) {
      return true;
    }
    for (let i = 0; i < rowData.length; i++) {
      if (JSON.stringify(rowData[i]) !== JSON.stringify(comparedRowData[i])) {
        return true;
      }
    }
    return false;
  }
  filterCell(services, ba, other): string {
    if (ba === 'HM10' || ba === 'HM9') {
      ba = 'HM1 HM9';
    }
    return services.join(' ') + ' ' + ba + ' ' + other;
  }
  isFilterOn(): boolean {
    // checks the keys to see if there is a filter active
    for (let i = 0; i < Object.keys(this.leechFilter).length; i++) {
      if (Object.keys(this.leechFilter)[i]) {
        return true;
      }
    }
    return false;
  }
  dateComparator(date1, date2) {
    const datea = date1.split('/');
    const dateb = date2.split('/');
    const d1 = (new Date()).setMonth(datea[1], datea[0]);
    const d2 = (new Date()).setMonth(dateb[1], dateb[0]);
    return d1 - d2;
  }
  parseServices(services): Array<string> {
    services = JSON.parse(services);
    const services_parsed: Array<string> = [];
    if (services.queen) {
      services_parsed.push((services.queen > 1 ? services.queen : '') + ' queen' + (services.queen > 1 ? 's' : ''));
    }
    if (services.bxp) {
      if (services.bxp.agility) {
        services_parsed.push(this.nFormatter(services.bxp.agility) + ' agility bxp');
      }
      if (services.bxp.mining) {
        services_parsed.push(this.nFormatter(services.bxp.mining) + ' mining bxp');
      }
      if (services.bxp.firemaking) {
        services_parsed.push(this.nFormatter(services.bxp.firemaking) + ' fm bxp');
      }
    }
    if (services.points) {
      if (services.points.attack) {
        services_parsed.push(services.points.attack + ' att points');
      }
      if (services.points.collector) {
        services_parsed.push(services.points.collector + ' col points');
      }
      if (services.points.defender) {
        services_parsed.push(services.points.defender + ' def points');
      }
      if (services.points.healer) {
        services_parsed.push(services.points.healer + ' heal points');
      }
    }
    if (services.king) {
      services_parsed.push((services.king > 1 ? services.king : '') + ' king' + (services.king > 1 ? 's' : ''));
    }
    return services_parsed;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    params.api.sizeColumnsToFit();
    window.addEventListener('resize', function() {
      setTimeout(function() {
        params.api.sizeColumnsToFit();
      });
    });
    setTimeout(function() {
      params.api.resetRowHeights();
    }, 500);

    const that = this;
    this.refreshQueue(true, () => {
      that.queueUpdater = setInterval(() => { that.refreshQueue(false); }, 5 * 1000);
    });
  }
  onSearchChange($event): void {
    this.gridApi.setQuickFilter($event.target.value);
  }
  openDelete(id, rsn): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.componentInstance.rsn = rsn;
    dialogRef.componentInstance.id = id;
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.refreshQueue(true);
      }
    });
  }
  openAdd(): void {
    const dialogRef = this.dialog.open(QueueAddComponent, {
      width: '550px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.refreshQueue(true);
      }
    });
  }
  openEdit(data): void {
    const dialogRef = this.dialog.open(QueueEditComponent, {
      width: '550px',
      disableClose: true,
      data: data,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.refreshQueue(true);
      }
    });
  }
  nFormatter(num) {
    const si = [
      { value: 1, symbol: '' },
      { value: 1E3, symbol: 'k' },
      { value: 1E6, symbol: 'm' }, // should be M - shadowmemes
      { value: 1E9, symbol: 'G' },
      { value: 1E12, symbol: 'T' },
      { value: 1E15, symbol: 'P' },
      { value: 1E18, symbol: 'E' }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(1).replace(rx, '$1') + si[i].symbol;
  }
  applyFilter(): void {
    this.gridApi.setFilterModel(this.leechFilter);
    this.gridApi.onFilterChanged();
  }
  filter(rsn) {
    if (!this.selected[rsn]) {
      this.leechFilter = {};
      this.applyFilter();
      return;
    }
    Object.keys(this.selected).forEach(key => {
      if (rsn !== key) {
        this.selected[key] = false;
      }
    });
    const row = this.findRow(rsn);
    const content = row['filter'].toString();
    if (row['ba'] === 'NM1' || content.includes('queen')) {
      this.leechFilter = {
        filter: {
          condition1 : {
            type: 'contains',
            filter: 'queen',
          },
          operator: 'OR',
          condition2 : {
            type: 'contains',
            filter: 'NM1',
          },
        },
      };
    } else if (content.includes('bxp')) {
      this.leechFilter = {
        filter: {
          condition1 : {
            type: 'contains',
            filter: 'bxp',
          },
          operator: 'AND',
          condition2 : {
            type: 'contains',
            filter: 'HM1',
          },
        }
      };
    } else if (content.includes('points')) {
      this.leechFilter = {
        filter: {
          condition1 : {
            condition1 : {
              type: 'contains',
              filter: 'bxp',
            },
            operator: 'AND',
            condition2 : {
              type: 'contains',
              filter: 'HM1',
            },
          },
          operator: 'OR',
          condition2: {
            type: 'contains',
            filter: 'bxp',
          }
        }
      };
    } else {
      this.leechFilter = {};
    }
    this.applyFilter();
  }
  findRow(rsn): [object] {
    for (let i = 0; i < this.rowData.length; i++) {
      const row = this.rowData[i];
      if (row.rsn === rsn) {
        return row;
      }
    }
    return null;
  }
  timeDifference(date1: Date): string {
    let difference = '';
    const date = new Date();
    const now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    // get total seconds between the times
    let delta = Math.abs(now_utc.valueOf() - date1.valueOf()) / 1000;

    // calculate (and subtract) whole days
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    difference = days > 0 ? days + ' day' + (days > 1 ? 's ' : ' ') : '';
    // calculate (and subtract) whole hours
    const hours = (Math.floor(delta / 3600) % 24);
    delta -= hours * 3600;

    if (hours > 0) {
      difference += hours + ' hour' + (hours > 1 ? 's ' : ' ');
    }
    // calculate (and subtract) whole minutes
    const minutes = Math.floor(delta / 60) % 60;
    if (hours < 1 && minutes < 1) {
      return 'just now';
    }
    difference +=  minutes + ' minute' + (minutes > 1 ? 's ' : ' ');

    return difference + 'ago';
  }
}

@Component({
  selector: 'app-service-element',
  template: `<span *ngFor="let item of params.value; let i = index;">
    <span [innerHTML]="parseService(item)" class="icon-height"></span><span *ngIf="i != params.value.length-1">, </span>
  </span>`
})
export class ServiceComponent implements ICellRendererAngularComp {
  public params: any;
  refresh(params: any): boolean {
    return false;
  }

  parseService(service: string): string {
    let parsedService = service;
    if (this.params.context.componentParent.displayIcons.att) {
      parsedService = parsedService
        .replace('att points', '<div class="icon-attack icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('att points', 'att');
    }
    if (this.params.context.componentParent.displayIcons.col) {
      parsedService = parsedService
        .replace('col points', '<div class="icon-collect icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('col points', 'col');
    }
    if (this.params.context.componentParent.displayIcons.heal) {
      parsedService = parsedService
        .replace('heal points', '<div class="icon-heal icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('heal points', 'heal');
    }
    if (this.params.context.componentParent.displayIcons.def) {
      parsedService = parsedService
        .replace('def points', '<div class="icon-defend icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('def points', 'def');
    }
    if (this.params.context.componentParent.displayIcons.fm) {
      parsedService = parsedService
        .replace('fm bxp', '<div class="icon-firemaking icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('fm bxp', 'fm');
    }
    if (this.params.context.componentParent.displayIcons.mining) {
      parsedService = parsedService
        .replace('mining bxp', '<div class="icon-mining icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('mining bxp', 'mining');
    }
    if (this.params.context.componentParent.displayIcons.agility) {
      parsedService = parsedService
        .replace('agility bxp', '<div class="icon-agility icon-common cell-inline"></div>');
    } else {
      parsedService = parsedService
        .replace('agility bxp', 'agility');
    }
    return parsedService;
  }
  agInit(params: any): void {
    this.params = params;
  }
}

@Component({
  selector: 'app-action-element',
  template: `<i class="fas fa-trash-alt btn padding-right v-center" (click)="remove(params.data.id, params.value.rsn)"></i>
  <i class="far fa-edit btn padding-right v-center" (click)="edit(params.value.rsn)"></i>
  <mat-checkbox [(ngModel)]="params.context.componentParent.selected[params.value.rsn]"
                (change)="filterCustomers(params.value.rsn)" color="primary"></mat-checkbox>`
})
export class ActionComponent implements ICellRendererAngularComp {
  public params: any;
  refresh(params: any): boolean {
    return false;
  }

  agInit(params: any): void {
    this.params = params;
  }

  public filterCustomers(rsn) {
    this.params.context.componentParent.filter(rsn);
  }
  public remove(id, rsn) {
    this.params.context.componentParent.openDelete(id, rsn);
  }
  public edit(rsn) {
    this.params.context.componentParent.openEdit(this.params.context.componentParent.dataList[rsn]);
  }
}
