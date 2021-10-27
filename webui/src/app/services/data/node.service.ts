import { Injectable } from '@angular/core';
import { Vector3 } from 'babylonjs';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';

export class MapHelperNode {
  id!: string;
  name!: string;
  size!: number;
  position!: Vector3;
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor(private dataStreamService: DataStreamService) {
  }

  findAll(): Promise<Array<MapHelperNode>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{nodes {id name position size}}`
        ).then((value) => {
          resolve(_.flatMap<any, MapHelperNode>((<any>value).data.nodes, (node) => {
            return <MapHelperNode>{
              id: node.id,
              name: node.name,
              position: node.position ? new Vector3(node.position.x, node.position.y, node.position.z) : undefined,
              size: node.size
            };
          }));
        });
      });
    });
  }
}
