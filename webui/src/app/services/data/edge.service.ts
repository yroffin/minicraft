import { Injectable } from '@angular/core';
import { Vector3 } from 'babylonjs';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';
import { MapEdge } from 'src/app/classes/model.class';

@Injectable({
  providedIn: 'root'
})
export class EdgeService {

  constructor(private dataStreamService: DataStreamService) {
  }

  findAll(): Promise<Array<MapEdge>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{
            edges {
              data {
                id
                attributes {
                  name
                  source {
                    data {
                      id
                    }
                  }
                  target {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
          `
        ).then((value) => {
          resolve(_.flatMap<any, MapEdge>((<any>value).data.edges.data, (edge) => {
            return <MapEdge>{
              id: edge.id,
              name: edge.attributes.name,
              source: 'node-' + edge.attributes.source.data.id,
              target: 'node-' + edge.attributes.target.data.id
            };
          }));
        });
      });
    });
  }
}
