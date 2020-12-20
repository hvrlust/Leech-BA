import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

export interface DialogData {
  ok: boolean;
  hasPts: boolean;
  hasDisc: boolean;
  needsTutorial: boolean;
}


@Component({
  selector: 'request-submitted-dialog',
  styles: [`
    button {
      background-color: #ed6c63;
      color: white !important;
    },
  `],
  template: `
    <!-- ERROR -->
    <h1 mat-dialog-title *ngIf="!data.ok">
      Something went wrong :(
    </h1>
    <div mat-dialog-content *ngIf="!data.ok">
      <p>Please try to submit your request again.</p>
    </div>

    <!-- OK -->
    <h1 mat-dialog-title *ngIf="data.ok">
      Request submitted!
    </h1>
    <div mat-dialog-content *ngIf="data.ok">
      <p>Thank you for your interest in leeching barbarian assault with Leech BA.</p>
      <p>If you can, start guesting in the CC (Leech BA).</p>
      <p *ngIf="data.hasDisc">Join our <a href="https://discord.gg/j4DgZBj" target="_blank">Discord</a> and set your nickname on the server to match your rsn, and make sure your Discord status isn't set to offline.</p>
      <p>&nbsp;</p>
      <p>A rank will get in touch with you on our CC or <a href="https://discord.gg/j4DgZBj" target="_blank">Discord</a> to confirm your request</p>
      <p *ngIf="data.hasPts && data.hasDisc">In the meantime you can go ahead and post your blackboard screenshot in #customer-chat</p>
      <p *ngIf="data.needsTutorial">Please ensure you've done the tutorial and can go down the ladder at BA before you're called onto a team in order to save time.</p>
      <p>&nbsp;</p>
      <p>After your request is confirmed and you're added to the queue:</p>
      <ul>
        <li>You will not be removed from the queue unless you are done or have not been seen for over 2 weeks.</li>
        <li>We will call you via the CC or discord (if provided) when it is your turn (CC has priority over discord).</li>
        <li>You must respond when called regardless of availability to leech.</li>
        <li>You are expected to pay for the round and before the round when it is your turn. You may wish to pay up to 1 hour in advance.</li>
        <li>Information on how to leech can be found <a href="/howtoleech">here</a>.</li>
      </ul>
    </div>
    <div mat-dialog-actions>
      <button color="primary" mat-button mat-dialog-close cdkFocusInitial>ok</button>
    </div>
  `,
})
export class RequestSubmittedDialog {
  constructor(
    public dialogRef: MatDialogRef<RequestSubmittedDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }
}