import { MenuItem } from 'primeng/api';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RendererComponent } from './components/render/render.component';
import { IComponent } from './classes/component.interface';
import { MapHelperService } from './services/map/map-helper.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  items: MenuItem[] = [
    {
      label: 'File',
      items: [{
        label: 'New',
        icon: 'pi pi-fw pi-plus',
        items: [
          { label: 'Project' },
          { label: 'Other' },
        ]
      },
      { label: 'Open' },
      { label: 'Quit' }
      ]
    },
    {
      label: 'Edit',
      icon: 'pi pi-fw pi-pencil',
      items: [
        { label: 'Delete', icon: 'pi pi-fw pi-trash' },
        { label: 'Refresh', icon: 'pi pi-fw pi-refresh' }
      ]
    },
    {
      label: 'View',
      icon: 'pi pi-fw pi-pencil',
      items: [
        { label: 'A', icon: 'pi pi-download', routerLink: ['/world'] },
        { label: 'B', icon: 'pi pi-download', routerLink: ['/another'] },
        {
          label: 'Debug', icon: 'pi pi-download', command: (event) => {
            this.toggle();
          }
        }
      ]
    }
  ];;

  @ViewChild(RendererComponent) renderer!: RendererComponent;

  title = 'webui';
  current!: RendererComponent;

  constructor(private mapHelperService: MapHelperService) {
    mapHelperService.getEmiter().subscribe((msg) => {
      this.current = msg.renderer;
      console.log(this.current);
    });
  }

  ngAfterViewInit(): void {
  }

  toggle() {
    if (this.current) this.current.toggleDebug()
  }

  onActivate(event: IComponent) {
  }

  onClickMe() {
    this.renderer.pinch();
  }

  onFreezeMe() {
    this.renderer.freeze();
  }

  onUnfreezeMe() {
    console.log(this.renderer);
  }
}
