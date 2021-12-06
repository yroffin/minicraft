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
                  x
                  y
                  z
                  nodes {
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
          resolve(_.flatMap<any, MapComponent>((<any>value).data.components.data, (component) => {
            return <MapComponent>{
              id: component.id,
              name: component.attributes.name,
              size: component.attributes.size,
              weight: component.attributes.weight,
              type: this.decode(component.attributes.type),
              position: new Vector3(
                component.attributes.x,
                component.attributes.y,
                component.attributes.z),
            };
          }));
        });
      });
    });
  }
}
