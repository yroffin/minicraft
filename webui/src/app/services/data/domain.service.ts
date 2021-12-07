import { Injectable } from '@angular/core';
import { DataStreamService } from '../data-stream.service';
import * as _ from 'lodash';
import { MapDomain } from 'src/app/classes/model.class';

@Injectable({
  providedIn: 'root'
})
export class DomainService {

  constructor(private dataStreamService: DataStreamService) {
  }

  findAll(): Promise<Array<MapDomain>> {
    return new Promise<any>((resolve) => {
      this.dataStreamService.getToken().then(() => {
        this.dataStreamService.graphqlWithToken(
          `{
            domains {
              data {
                id
                attributes {
                  name
                }
              }
            }
          }
          `
        ).then((value) => {
          resolve(_.flatMap<any, MapDomain>((<any>value).data.components.data, (domain) => {
            return <MapDomain>{
              id: domain.id,
              name: domain.attributes.name
            };
          }));
        });
      });
    });
  }
}
