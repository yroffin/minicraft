import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MapHelperService } from 'src/app/services/map/map-helper.service';
import * as paper from 'paper';

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

  oldZoom = 1;
  zoom = 1;

  private scope!: paper.PaperScope;
  private project!: paper.Project;

  shiftIsDown = false;

  @Output() flag: EventEmitter<any> = new EventEmitter();
  @Output() ready: EventEmitter<any> = new EventEmitter();

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
    const height = this.paperCanvas.nativeElement.offsetHeight;
    const width = this.paperCanvas.nativeElement.offsetWidth;

    this.project = new paper.Project(this.paperCanvas.nativeElement);
    this.project.view.center = new paper.Point(width / 8, height / 8);
    //this.project.view.scale(this.zoom, this.zoom);
    this.project.view.matrix = new paper.Matrix().translate(width / 2, height / 2).scale(2, 2)

    this.project.view.onMouseMove = (event: any) => {
      this.onMouseMove(event);
    };

    this.project.activate();
    this.drawGrid(width, height, 10, 1);
    this.ready.emit(this.project);
    // Finalize view init in async
    setTimeout(
      () => {
        //this.setZoom(3);
      }, 100);
  }

  onZoomChange(event: any) {
    this.setZoom(this.zoom);
  }

  onCapture() {
    if (this.shiftIsDown === false) { return; }
  }

  private setZoom(zoom: number) {
    this.project.view.scale(1 / this.oldZoom, 1 / -this.oldZoom);
    this.project.view.scale(zoom, -zoom);
    this.oldZoom = zoom;
    this.zoom = zoom;
    const height = this.paperCanvas.nativeElement.offsetHeight;
    const width = this.paperCanvas.nativeElement.offsetWidth;
    this.project.view.center = new paper.Point(width / (this.zoom * 2.5), height / (this.zoom * 2));
  }

  private onMouseMove(event: any) {
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
