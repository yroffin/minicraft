import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RendererComponent } from './components/render/render.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(RendererComponent) renderer!: RendererComponent;

  title = 'webui';

  ngAfterViewInit(): void {
  }

  onClickMe() {
    this.renderer.pinch();
  }

  onFreezeMe() {
    this.renderer.freeze();
  }

  onUnfreezeMe() {
    this.renderer.unfreeze();
  }
}
