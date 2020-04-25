import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RankListService {
  constructor(private http: HttpClient) { }
  getRanks(): Observable<object> {
    return this.http.get('/api/ranks');
  }
}
