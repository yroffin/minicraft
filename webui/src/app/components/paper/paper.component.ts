import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import * as paper from 'paper';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.css']
})
export class PaperComponent implements OnInit {

  @ViewChild('paperView') paperCanvas!: ElementRef;
  @Input() domainId = "";

  constructor(
    private cdr: ChangeDetectorRef,
    private mapHelperService: MapHelperService) { }

  x = 0;
  y = 0;
  z = 0;

  items: MenuItem[] = [
    {
      icon: 'pi pi-pencil',
      command: () => {
      }
    },
    {
      icon: 'pi pi-refresh',
      command: () => {
      }
    },
    {
      icon: 'pi pi-trash',
      command: () => {
      }
    }
  ];

  context: MenuItem[] = [
    {
      icon: 'pi pi-pencil',
      label: 'File',
      command: () => {
      }
    },
    {
      icon: 'pi pi-refresh',
      label: 'File',
      command: () => {
      }
    },
    {
      icon: 'pi pi-trash',
      label: 'File',
      command: () => {
      }
    }
  ];

  _elements: any[] = [];
  _width: number = 0;
  _height: number = 0;
  _zoom: number = 2;

  get elements() {
    return this._elements;
  }

  @Input() set elements(values: any[]) {
    this._elements = values;
  }

  get zoom() {
    return this._zoom;
  }

  @Input() set zoom(value: number) {
    this.project.view.matrix.scale(1 / this._zoom, 1 / -this._zoom);
    this.project.view.matrix.scale(value, -value);
    this._zoom = value;
  }

  get abs() {
    return this._width;
  }

  @Input() set abs(value: number) {
    this.project.view.matrix.translate(this._width - value, 0);
    this._width = value;
  }

  get ord() {
    return this._height;
  }

  @Input() set ord(value: number) {
    this.project.view.matrix.translate(0, this._height - value);
    this._height = value;
  }

  private scope!: paper.PaperScope;
  public project!: paper.Project;
  private layer!: paper.Layer;
  private droppable!: any;

  shiftIsDown = false;

  @Output() flag: EventEmitter<any> = new EventEmitter();
  @Output() ready: EventEmitter<any> = new EventEmitter();

  @Output() dragStart: EventEmitter<any> = new EventEmitter();
  @Output() dropTarget: EventEmitter<any> = new EventEmitter();
  @Output() dragEnd: EventEmitter<any> = new EventEmitter();
  @Output() dropCreate: EventEmitter<any> = new EventEmitter();

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftIsDown = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftIsDown = false;
    }
  }

  ngOnInit() {
    // For using paper libs
    this.scope = new paper.PaperScope();
  }

  ngAfterViewInit(): void {
    this.project = new paper.Project(this.paperCanvas.nativeElement);
    const height = this.paperCanvas.nativeElement.offsetHeight;
    const width = this.paperCanvas.nativeElement.offsetWidth;

    this.project.view.matrix = new paper.Matrix();
    this.layer = new paper.Layer({
    });

    // in order to avoid lyfecycle modification value
    setTimeout(() => {
      this.layer.activate();
      this._zoom = 2;
      this._height = height / 2;
      this._width = width / 2;
      this.project.view.matrix.translate(this._width, this._height);
      this.project.view.matrix.scale(this._zoom, this._zoom);
      this.drawGrid(width, height, 10, 1);
      this.ready.emit(this.project);
    }, 1);

    this.project.view.onMouseMove = (event: any) => {
      this.onMouseMove(event);
    };

    this.project.view.onMouseDrag = (event: any) => {
      this.onMouseDrag(event);
    };
  }

  _dragStart(target: any) {
    this.droppable = target;
    this.dragStart.emit({
      target
    });
  }

  _drop(event: any) {
    this.dropTarget.emit({
      event: event,
      target: this.droppable
    });
  }

  _dragEnd() {
    this.dragEnd.emit({
      target: this.droppable
    });
  }

  onCapture() {
    if (this.shiftIsDown === false) { return; }
  }

  private onMouseMove(event: any) {
    this.x = event.point.x;
    this.y = event.point.y;
    this.cdr.detectChanges();
    if (this.droppable) {
      this.dropCreate.emit({
        event: event,
        target: this.droppable
      });
      this.droppable = undefined;
    }
    return false;
  }

  private onMouseDrag(event: any) {
    this.x = event.point.x;
    this.y = event.point.y;
    this.cdr.detectChanges();
    return false;
  }

  private drawGrid(width: number, height: number, heavy: number, light: number) {
    const canvas = new paper.Path.Rectangle(
      new paper.Point(0, 0),
      new paper.Point(width, height)
    );

    const ordonnee = new paper.Path.Line({
      from: new paper.Point(0, -height),
      to: new paper.Point(0, height),
      strokeColor: 'blue',
      strokeWidth: 1
    });

    const abscisse = new paper.Path.Line({
      from: new paper.Point(-width, 0),
      to: new paper.Point(width, 0),
      strokeColor: 'red',
      strokeWidth: 1
    });

    for (let x = -width; x < width; x += light) {
      const line = new paper.Path.Line({
        from: new paper.Point(x, 0),
        to: new paper.Point(x, height),
        strokeColor: 'lightblue',
        strokeWidth: (x % heavy === 0) ? 0.2 : 0.1
      });
    }

    for (let y = -height; y < height; y += light) {
      const line = new paper.Path.Line({
        from: new paper.Point(0, y),
        to: new paper.Point(height, y),
        strokeColor: 'lightblue',
        strokeWidth: (y % heavy === 0) ? 0.2 : 0.1
      });
    }
  }

}
