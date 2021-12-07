import { Injectable } from '@angular/core';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';
import { Vector3 } from 'babylonjs';
import { MapComponent, MapItemType } from 'src/app/classes/model.class';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

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
              name: component.attributes.name,
              size: component.attributes.size,
              weight: component.attributes.weight,
              type: this.decode(component.attributes.type),
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
