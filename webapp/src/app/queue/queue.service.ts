import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  constructor(private http: HttpClient) { }
  addCustomer(params): Observable<object> {
    return this.http.post('/api/addcustomer', params);
  }
  saveCustomer(params): Observable<object> {
    return this.http.post('/api/savecustomer', params);
  }
  deleteCustomer(params): Observable<object> {
    return this.http.post('/api/deletecustomer', params);
  }
  getQueue(): Observable<object> {
    return this.http.get('/api/queue');
  }
}
