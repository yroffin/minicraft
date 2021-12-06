import { Injectable } from '@angular/core';
import { Vector3 } from 'babylonjs';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';
import { MapItemType, MapNode } from 'src/app/classes/model.class';
import { componentFactoryName } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor(private dataStreamService: DataStreamService) {
  }

  private decode(type: string): MapItemType {
    switch (type) {
      case "cube":
        return MapItemType.cube;
      case "sphere":
        return MapItemType.sphere;
      case "cylinder":
        return MapItemType.cylinder;
      default:
        return MapItemType.cube;
    }
  }

  findAll(): Promise<Array<MapNode>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{
            nodes {
              data {
                id
                attributes {
                  name
                  type
                  x
                  y
                  z
                  size
                  weight
                  component {
                    data {
                      attributes {
                        x
                        y
                        z
                      }
                    }
                  }
                }
              }
            }
          }
          `
        ).then((value) => {
          resolve(_.flatMap<any, MapNode>((<any>value).data.nodes.data, (node) => {
            console.log(node)
            return <MapNode>{
              id: node.id,
              name: node.attributes.name,
              type: this.decode(node.attributes.type),
              position: new Vector3(
                node.attributes.x + node.attributes.component.data.attributes.x,
                node.attributes.y + node.attributes.component.data.attributes.y,
                node.attributes.z + node.attributes.component.data.attributes.z),
              size: node.attributes.size,
              weight: node.attributes.weight
            };
          }));
        });
      });
    });
  }
}
