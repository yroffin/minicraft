import { Injectable } from '@angular/core';
import { Vector3 } from 'babylonjs';
import { MapGraphType, MapMxGraph } from 'src/app/classes/model.class';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor(private dataStreamService: DataStreamService) {
  }

  private decode(type: string): MapGraphType {
    switch (type) {
      case "mxgraph":
        return MapGraphType.mxgraph;
      default:
        return MapGraphType.mxgraph;
    }
  }

  findAll(): Promise<Array<MapMxGraph>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{
            graphs {
              data {
                id
                attributes {
                  name
                  type
                  position {
                    x y z
                  }
                  data
                }
              }
            }
          }
          `
        ).then((value) => {
          resolve(_.flatMap<any, MapMxGraph>((<any>value).data.graphs.data, (mxgraph) => {
            return <MapMxGraph>{
              id: mxgraph.id,
              name: mxgraph.attributes.name,
              type: this.decode(mxgraph.attributes.type),
              data: mxgraph.attributes.data,
              position: new Vector3(
                mxgraph.attributes.position.x,
                mxgraph.attributes.position.y,
                mxgraph.attributes.position.z),
            };
          }));
        });
      });
    });
  }
}
