import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Product, ProductPayload } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl + '/admin/products';

  list(apiKey: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl, { headers: this.headers(apiKey) });
  }

  create(apiKey: string, product: ProductPayload): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product, { headers: this.headers(apiKey) });
  }

  update(apiKey: string, id: number, product: ProductPayload): Observable<Product> {
    return this.http.put<Product>(this.baseUrl + '/' + id, product, { headers: this.headers(apiKey) });
  }

  delete(apiKey: string, id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + '/' + id, { headers: this.headers(apiKey) });
  }

  private headers(apiKey: string): HttpHeaders {
    return new HttpHeaders({ 'X-Admin-Api-Key': apiKey });
  }
}
