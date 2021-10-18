import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import { RendererComponent } from '../render/render.component';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements AfterViewInit {

  @ViewChild(RendererComponent) renderer!: RendererComponent;

  constructor(private mapHelperService: MapHelperService) {
  }

  ngAfterViewInit() {
  }

}
