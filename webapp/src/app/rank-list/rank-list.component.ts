import {Component} from '@angular/core';
import {RankListService} from "./rank-list.service";

@Component({
  selector: 'app-leeching-guide',
  templateUrl: './rank-list.component.html',
  styleUrls: ['./rank-list.component.css']
})
export class RankListComponent {
  columnDefs = [
    {headerName: 'Discord Display Name', field: 'discord'},
    {headerName: 'RSN', field: 'rsn'}
  ];

  rowData = [];
  private gridApi;
  private gridColumnApi;
  gridOptions = {
    suppressMovableColumns: true,
    enableSorting: false,
    context: {
      componentParent: this
    }
  };

  constructor(private rankListService: RankListService) {
  }

  getRanks(): void {
    const rowsToAdd = [];
    this.rankListService.getRanks().subscribe(res => {
      console.log(res);
      for (let i = 0; i < res['response'].length; i++) {
        const entry = res['response'][i];
        const data = {
          discord: entry['display_name'],
          rsn: entry['rsn']
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
    this.getRanks();
  }
}
