import {Component} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {MgwQueueService} from './mgw.queue.service';

@Component({
  selector: 'mgw-app-confirm',
  templateUrl: './mgw.confirmation.component.html',
})
export class MgwConfirmationComponent {
  public rsn: string;
  public id: string;
  public params: any;
  constructor(
    public dialogRef: MatDialogRef<MgwConfirmationComponent>, private queueService: MgwQueueService, public notificationBar: MatSnackBar)  {
  }
  public deleteCustomer(id, rsn) {
    this.queueService.deleteCustomer({id: id, rsn: rsn}).subscribe( res => {
      this.dialogRef.close('refresh');
      this.newNotification('Removed ' + rsn + ' from queue');
    }, error => {
      console.error(error);
    });
  }
  private newNotification(message: string) {
    this.notificationBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }
}
