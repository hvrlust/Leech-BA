import {Component} from '@angular/core';
import { version } from '../../version.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'LeechBA';
  version = version;
}
