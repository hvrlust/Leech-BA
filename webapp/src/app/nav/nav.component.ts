import {Component} from '@angular/core';
import {NavService} from './nav.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {
  user = false;
  username: string = null;
  constructor(private navService: NavService) {
    this.navService.checkLogin().subscribe(res => {
      this.user = res['response'];
      this.username = res['user'];
    }, error => {
      console.log(error);
    });
  }
  logout(): void {
    this.navService.logout().subscribe(res => {
      this.user = !res['response'];
      this.username = null;
    });
  }
}
