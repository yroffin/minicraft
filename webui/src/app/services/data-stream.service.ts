import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataStreamService {

  private token!: string;
  private issued!: Date;

  constructor(private http: HttpClient) {
  }

  graphql(query: string): Promise<object> {
    let asset = '/api/graphql';
    let body = {
      "query": query
    };
    return new Promise<object>((resolve) => {
      this.http.post(asset, body, {
        headers: {
          "Content-Type": "application/json"
        },
        responseType: 'json'
      }).subscribe(data => {
        resolve(data);
      });
    });
  }

  graphqlWithToken(query: string): Promise<object> {
    let asset = '/api/graphql';
    let body = {
      "query": query
    };
    return new Promise<object>((resolve) => {
      this.http.post(asset, body, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        responseType: 'json'
      }).subscribe(data => {
        resolve(data);
      });
    });
  }

  getToken(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.graphql(`mutation {login(input: { identifier: \"yroffin@gmail.com\", password: \"Strapi2021\" }) {jwt}}`)
        .then((data) => {
          this.token = (<any>data).data.login.jwt;
          this.issued = new Date();
          resolve();
        });
    });
  }
}
