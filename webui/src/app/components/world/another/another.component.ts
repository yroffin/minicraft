import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IComponent, Msg } from 'src/app/classes/component.interface';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import { RendererComponent } from '../../render/render.component';

@Component({
  selector: 'app-another',
  templateUrl: './another.component.html',
  styleUrls: ['./another.component.css']
})
export class AnotherComponent implements AfterViewInit, IComponent {

  @ViewChild(RendererComponent) renderer!: RendererComponent;

  constructor(private mapHelperService: MapHelperService) { }

  ngAfterViewInit() {
    let msg = new Msg();
    msg.renderer = this.renderer;
    this.mapHelperService.notify(msg);
  }

  getRenderer(): RendererComponent {
    return this.renderer;
  }
}
