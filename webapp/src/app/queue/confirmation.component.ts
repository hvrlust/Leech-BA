import {Component} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {QueueService} from './queue.service';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent {
  public rsn: string;
  public id: string;
  public params: any;
  constructor(
    public dialogRef: MatDialogRef<ConfirmationComponent>, private queueService: QueueService, public notificationBar: MatSnackBar)  {
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
