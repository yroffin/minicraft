import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private mapHelperService: MapHelperService, private actRoute: ActivatedRoute) { }

  ngAfterViewInit() {
    let domain = this.actRoute.snapshot.params.domain;
    console.log(domain);
    let msg = new Msg();
    msg.renderer = this.renderer;
    this.mapHelperService.notify(msg);
  }

  getRenderer(): RendererComponent {
    return this.renderer;
  }
}
