import { Injectable } from '@angular/core';
import { Vector3 } from 'babylonjs';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';

export enum MapHelperNodeType {
  cube,
  sphere,
  cylinder
}

export class MapHelperNode {
  id!: string;
  name!: string;
  size!: number;
  type!: MapHelperNodeType;
  position!: Vector3;
  weight!: number;
}

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor(private dataStreamService: DataStreamService) {
  }

  private decode(type: string): MapHelperNodeType {
    switch (type) {
      case "cube":
        return MapHelperNodeType.cube;
      case "sphere":
        return MapHelperNodeType.sphere;
      case "cylinder":
        return MapHelperNodeType.cylinder;
      default:
        return MapHelperNodeType.cube;
    }
  }

  findAll(): Promise<Array<MapHelperNode>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{nodes {id name type position size height}}`
        ).then((value) => {
          resolve(_.flatMap<any, MapHelperNode>((<any>value).data.nodes, (node) => {
            return <MapHelperNode>{
              id: node.id,
              name: node.name,
              type: this.decode(node.type),
              position: node.position ? new Vector3(node.position.x, node.position.y, node.position.z) : undefined,
              size: node.size,
              weight: node.weight
            };
          }));
        });
      });
    });
  }
}
