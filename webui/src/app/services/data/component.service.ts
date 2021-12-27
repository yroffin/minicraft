import { Injectable } from '@angular/core';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';
import { Vector3 } from 'babylonjs';
import { DtoComponent, MapComponent, MapItemType } from 'src/app/classes/model.class';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  constructor(private dataStreamService: DataStreamService) {
  }

  public static decode(type: string): MapItemType {
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

  create(entity: DtoComponent): Promise<Array<MapComponent>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        let stringify = `{ domains: ${entity.domains}, name: "${entity.name}", type: ${entity.type}, size:${entity.size}, position: {x: ${entity.position.x}, y:${entity.position.y}, z: ${entity.position.z} }}`;
        this.dataStreamService.graphqlWithToken(
          `mutation {
            createComponent(data: ${stringify}) {
              data {
                id
              }
            }
          }
          `
        ).then((value) => {
          resolve(_.flatMap<any, MapComponent>((<any>value).data.createComponent.data, (component) => {
            return <MapComponent>{
              id: component.id
            };
          }));
        });
      });
    });
  }

  findAll(): Promise<Array<MapComponent>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{
            components {
              data {
                id
                attributes {
                  name
                  size
                  weight
                  type
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
                  nodes {
                    data {
                      attributes {
                        delta {
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
          }
          `
        ).then((value) => {
          resolve(_.flatMap<any, MapComponent>((<any>value).data.components.data, (component) => {
            return <MapComponent>{
              id: component.id,
              uid: `component-${component.id}`,
              name: component.attributes.name,
              width: component.attributes.width,
              height: component.attributes.height,
              weight: component.attributes.weight,
              type: ComponentService.decode(component.attributes.type),
              domains: component.attributes.domains.data,
              position: new Vector3(
                component.attributes.position.x,
                component.attributes.position.y,
                component.attributes.position.z),
            };
          }));
        });
      });
    });
  }
}
