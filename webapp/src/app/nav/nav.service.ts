import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'zone.js/dist/zone-error';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  constructor(private http: HttpClient) { }
  checkLogin(): Observable<object> {
    return this.http.get('/api/amiloggedin');
  }
  logout(): Observable<object> {
    return this.http.get('/logout');
  }
}
