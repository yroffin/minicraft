import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { RendererComponent } from '../render/render.component';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.css']
})
export class WorldComponent implements AfterViewInit {

  @ViewChild(RendererComponent) renderer!: RendererComponent;

  constructor(private readonly zone: NgZone) { }

  ngAfterViewInit() {
    // might make a performance difference
    this.zone.runOutsideAngular(_ => {
      const animate = () => {
        requestAnimationFrame(animate);
      };
      animate();
    })
  }

}
