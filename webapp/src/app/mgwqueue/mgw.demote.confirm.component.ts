import {Component} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {MgwQueueService} from './mgw.queue.service';

@Component({
  selector: 'mgw-app-confirm',
  templateUrl: './mgw.demote.confirm.component.html',
})
export class MgwDemoteConfirmComponent {
  public rsn: string;
  public id: string;
  public params: any;
  constructor(
    public dialogRef: MatDialogRef<MgwDemoteConfirmComponent>, private queueService: MgwQueueService, public notificationBar: MatSnackBar)  {
  }
  public demoteCustomer(id, rsn) {
    this.queueService.demoteCustomer({id: id, rsn: rsn}).subscribe( res => {
      this.dialogRef.close('refresh');
      this.newNotification('Moved ' + rsn + ' to bottom of the queue');
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
