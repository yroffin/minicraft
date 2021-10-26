import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { mxGraphModel, MxData, parseDrawIO, isMxGraphModel } from "mxgraphdata";


@Injectable({
  providedIn: 'root'
})
export class LoadAssetService {

  constructor(private http: HttpClient) {
  }

  loadDrawIo(asset: string): Promise<mxGraphModel> {
    return new Promise<mxGraphModel>((resolve) => {
      this.http.get(asset, { responseType: 'text' }).subscribe(data => {
        parseDrawIO(data).then((mxfile) => {
          resolve(<mxGraphModel>(<any>mxfile).diagram.graphModel);
        });
      });
    });
  }
}
