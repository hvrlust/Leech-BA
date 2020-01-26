import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MgwQueueService {
  constructor(private http: HttpClient) { }
  addCustomer(params): Observable<object> {
    return this.http.post('/api/mgw/addcustomer', params);
  }
  saveCustomer(params): Observable<object> {
    return this.http.post('/api/mgw/savecustomer', params);
  }
  deleteCustomer(params): Observable<object> {
    return this.http.post('/api/mgw/deletecustomer', params);
  }
  demoteCustomer(params): Observable<object> {
    return this.http.post('/api/mgw/bottom', params);
  }
  getQueue(): Observable<object> {
    return this.http.get('/api/mgw/queue');
  }
}
