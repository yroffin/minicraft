import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LoaderService, MapHelperGraph } from '../data/loader.service';
import * as paper from 'paper';

export class MapPaperContext {

  constructor() {
  }

  project!: paper.Project
  layer!: paper.Layer
}

@Injectable({
  providedIn: 'root'
})
export class MapPaperService {

  constructor(
    private readonly loaderService: LoaderService
  ) { }

  initialize(domainId: string, project: paper.Project, old?: MapPaperContext): Promise<MapPaperContext> {
    return new Promise<MapPaperContext>(async (resolve) => {
      let context = new MapPaperContext();
      context.project = project;
      context.layer = new paper.Layer({
      });
      context.layer.activate();
      const world: MapHelperGraph = await this.loaderService.loadWorld(domainId);
      this.draw(context, world)
      if (old) {
        old.layer.remove();
      }
      resolve(context);
    })
  }

  private draw(context: MapPaperContext, world: MapHelperGraph) {
    (async () => {
      let project = context.project;

      _.each(world.components, (component) => {
        let rect = new paper.Path.Rectangle(
          new paper.Point(0, 0),
          new paper.Size(component.width, component.width));
        rect.strokeColor = new paper.Color('black');
        rect.position.x = component.position.x;
        rect.position.y = -component.position.z;
        rect.fullySelected = false;
        rect.strokeWidth = 1;

        let legend = new paper.PointText(new paper.Point(rect.position.x, rect.position.y - 30));
        legend.applyMatrix = true;
        legend.content = component.name;
        legend.selected = true;
        legend.fontSize = 6;
      });

      _.each(world.nodes, (node) => {
        let rect = new paper.Path.Circle(
          new paper.Point(0, 0),
          node.width / 2);
        rect.strokeColor = new paper.Color('blue');
        rect.position.x = node.position.x;
        rect.position.y = -node.position.z;
        rect.fullySelected = false;
        rect.strokeWidth = 1;

        let legend = new paper.PointText(new paper.Point(rect.position.x, rect.position.y + 30));
        legend.content = node.name;
        legend.selected = true;
        legend.fontSize = 6;
      });

      // Build edge
      _.each(world.edges, (edge) => {
        let source = _.filter(world.nodes, (node) => {
          return node.uid === edge.source;
        });
        let target = _.filter(world.nodes, (node) => {
          return node.uid === edge.target;
        });
        if (source.length == 1 && target.length == 1) {
          let rect = new paper.Path.Line(
            new paper.Point(source[0].position.x, -source[0].position.z),
            new paper.Point(target[0].position.x, -target[0].position.z));
          rect.strokeColor = new paper.Color('red');
          rect.fullySelected = false;
          rect.strokeWidth = 1;
        } else {
          console.log(source);
          console.log(target);
        }
      });
    })();
  }
}
