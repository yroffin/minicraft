import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IComponent, Msg } from 'src/app/classes/component.interface';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import { MapPaperService } from 'src/app/services/map/map-paper.service';
import { PaperComponent } from '../../paper/paper.component';
import { RendererComponent } from '../../render/render.component';

@Component({
  selector: 'app-another',
  templateUrl: './another.component.html',
  styleUrls: ['./another.component.css']
})
export class AnotherComponent implements AfterViewInit {

  @ViewChild(PaperComponent) renderer!: PaperComponent;
  domainId!: string;

  constructor(private mapPaperService: MapPaperService, private actRoute: ActivatedRoute) {
    // get domainId from url
    this.domainId = this.actRoute.snapshot.params.domainId;
  }

  ngAfterViewInit() {
  }

  draw(project: paper.Project) {
    (async () => {
      await this.mapPaperService.initialize(this.domainId, project);
    })();
  }

  select(event: any) {
    console.log(`X${event.x} Y${event.y}`);
  }
}
