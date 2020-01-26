import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SplitsService {
  constructor(private http: HttpClient) { }
  getSplits(): Observable<object> {
    return this.http.get('/api/splits');
  }
}
