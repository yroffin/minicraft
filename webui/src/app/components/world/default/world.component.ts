import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IComponent, Msg } from 'src/app/classes/component.interface';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import { RendererComponent } from '../../render/render.component';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements AfterViewInit, IComponent {

  @ViewChild(RendererComponent) renderer!: RendererComponent;
  domainId!: string;

  constructor(private mapHelperService: MapHelperService, private actRoute: ActivatedRoute) {
    // get domainId from url
    this.domainId = this.actRoute.snapshot.params.domainId;
  }

  ngAfterViewInit() {
    let msg = new Msg();
    msg.renderer = this.renderer;
    this.mapHelperService.notify(msg);
  }

  getRenderer(): RendererComponent {
    return this.renderer;
  }
}
