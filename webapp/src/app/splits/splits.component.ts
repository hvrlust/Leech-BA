import { Component } from '@angular/core';
import {SplitsService} from './splits.service';

@Component({
  selector: 'app-splits',
  templateUrl: './splits.component.html',
  styleUrls: ['./splits.component.css']
})
export class SplitsComponent {
  columnDefs = [
    {headerName: 'Mode', field: 'mode', width: 60 },
    {headerName: 'Round', field: 'round' },
    {headerName: 'Host', field: 'host', width: 60 },
    {headerName: 'Attack', field: 'att', width: 60},
    {headerName: 'Collector', field: 'col', width: 60 },
    {headerName: 'Defender', field: 'def', width: 60 },
    {headerName: 'Healer', field: 'heal', width: 60 },
  ];

  rowData = [];
  private gridApi;
  private gridColumnApi;
  gridOptions = {
    suppressMovableColumns: true,
    enableSorting: true,
    context: {
      componentParent: this
    }
  };
  constructor(private splitsService: SplitsService) { }
  getSplits(): void {
    const rowsToAdd = [];
    this.splitsService.getSplits().subscribe(res => {
      for (let i = 0; i < res['response'].length; i++) {
        const entry = res['response'][i];
        const data = {
          mode: entry['mode'],
          round: entry['round'],
          host: entry['host'] + 'k',
          att: entry['att'] + 'k',
          col: entry['col'] <= 0 ? '-' : entry['col'] + 'k',
          def: entry['def'] + 'k',
          heal: entry['heal'] + 'k',
        };
        rowsToAdd.push(data);
      }
      this.gridApi.updateRowData({add: rowsToAdd});
    }, error => {
      console.log(error);
    });
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
    this.getSplits();
  }

}
