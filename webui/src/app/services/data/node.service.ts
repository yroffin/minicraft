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
                  delta {
                    x
                    y
                    z
                  }
                  size
                  weight
                  component {
                    data {
                      attributes {
                        position {
                          x
                          y
                          z
                        }
                        domains {
                          data {
                            id
                          }
                        }
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
            return <MapNode>{
              id: node.id,
              name: node.attributes.name,
              type: this.decode(node.attributes.type),
              position: new Vector3(
                node.attributes.delta.x + node.attributes.component.data.attributes.position.x,
                node.attributes.delta.y + node.attributes.component.data.attributes.position.y,
                node.attributes.delta.z + node.attributes.component.data.attributes.position.z),
              domains: node.attributes.component.data.attributes.domains.data,
              size: node.attributes.size,
              weight: node.attributes.weight
            };
          }));
        });
      });
    });
  }
}
