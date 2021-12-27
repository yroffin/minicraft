import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IComponent, Msg } from 'src/app/classes/component.interface';
import { MapItemType } from 'src/app/classes/model.class';
import { ComponentService } from 'src/app/services/data/component.service';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import { MapPaperService } from 'src/app/services/map/map-paper.service';
import { PaperComponent } from '../../paper/paper.component';
import { RendererComponent } from '../../render/render.component';
import * as _ from 'lodash'
import * as paper from 'paper';

@Component({
  selector: 'app-another',
  templateUrl: './another.component.html',
  styleUrls: ['./another.component.css']
})
export class AnotherComponent implements AfterViewInit {

  @ViewChild(PaperComponent) renderer!: PaperComponent;
  domainId!: string;

  elements: any[] = [
    { id: "component", label: "Component", icon: "pi pi-facebook" },
    { id: "port", label: "Port", icon: "pi pi-facebook" }
  ]

  constructor(private componentService: ComponentService, private mapPaperService: MapPaperService, private actRoute: ActivatedRoute) {
    // get domainId from url
    this.domainId = this.actRoute.snapshot.params.domainId;
  }

  ngAfterViewInit() {
  }

  private context: any;

  draw(project: paper.Project) {
    (async () => {
      this.context = await this.mapPaperService.initialize(this.domainId, project);
    })();
  }

  dragStart(event: any) {
    console.log(event);
  }

  drop(event: any) {
    console.log(event);
  }

  dragEnd(event: any) {
    console.log(event);
  }

  dropCreate(event: any) {
    console.log(event);
    (async () => {
      let _component = await this.componentService.create({
        name: "test",
        domains: [this.domainId],
        size: 5,
        type: MapItemType.cylinder,
        position: {
          x: event.event.point.x,
          y: 0,
          z: -event.event.point.y
        },
        weight: 0
      });
      this.context = await this.mapPaperService.initialize(this.domainId, this.context.project, this.context);
    })();
  }

  select(event: any) {
    console.log(`X${event.x} Y${event.y}`);
  }
}
