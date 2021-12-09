import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MapComponent, MapNode, MapEdge } from 'src/app/classes/model.class';
import { ComponentService } from './component.service';
import { EdgeService } from './edge.service';
import { NodeService } from './node.service';

export class MapHelperGraph {
  components: Array<MapComponent> = [];
  nodes: Array<MapNode> = [];
  edges: Array<MapEdge> = [];
}

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(
    private readonly componentService: ComponentService,
    private readonly nodeService: NodeService,
    private readonly edgeService: EdgeService
  ) { }

  loadWorld(domainId: string) {
    return new Promise<MapHelperGraph>(async (resolve) => {

      const world: MapHelperGraph = {
        components: _.sortBy(_.filter(await this.componentService.findAll(), (component) => {
          return _.find(component.domains, { id: domainId }) !== undefined
        }), (component) => {
          return component.position.z
        }),
        nodes: _.sortBy(_.filter(await this.nodeService.findAll(), node => {
          return _.find(node.domains, { id: domainId }) !== undefined
        }), (node) => {
          return node.position.z
        }),
        edges: await this.edgeService.findAll()
      }

      console.log(world.components)
      console.log(world.nodes)

      resolve(world);
    });
  }
}
