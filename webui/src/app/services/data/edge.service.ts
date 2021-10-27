import { Injectable } from '@angular/core';
import { Vector3 } from 'babylonjs';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';

export class MapHelperEdge {
  id!: string;
  name!: string;
  source!: string;
  target!: string;
}

@Injectable({
  providedIn: 'root'
})
export class EdgeService {

  constructor(private dataStreamService: DataStreamService) {
  }

  findAll(): Promise<Array<MapHelperEdge>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{edges {id name source {id} target {id}}}`
        ).then((value) => {
          resolve(_.flatMap<any, MapHelperEdge>((<any>value).data.edges, (edge) => {
            return <MapHelperEdge>{
              id: edge.id,
              name: edge.name,
              source: edge.source,
              target: edge.target
            };
          }));
        });
      });
    });
  }
}
