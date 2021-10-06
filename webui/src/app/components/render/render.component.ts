import { AfterViewInit, Component, Input, ViewChild, ElementRef, ContentChild, OnDestroy } from '@angular/core';
import { AbstractCamera } from 'src/app/classes/abstract-camera';
import { SceneDirective } from 'src/app/directives/scene.directive';
import { BoxGeometry, Color, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// We'll get to these in a second

@Component
  ({
    selector: 'three-renderer',
    templateUrl: './render.component.html',
    styleUrls: ['./render.component.css']
  })
export class RendererComponent implements AfterViewInit, OnDestroy {
  renderer!: any;
  orbitControls!: any;

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @ContentChild(SceneDirective) scene!: SceneDirective
  @ContentChild(AbstractCamera) camera!: AbstractCamera<any>;

  @Input() color: string | number | Color = 0xffffff;
  @Input() alpha = 0;
  @Input() rotateSpeed = 1.0;
  @Input() zoomSpeed = 1.2;

  ngAfterViewInit() {
    // Fix renderer
    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor(this.color, this.alpha);
    this.renderer.autoClear = true;
    // Set orbit control
    this.orbitControls = new OrbitControls(this.camera.object, this.canvas);
    this.orbitControls.rotateSpeed = this.rotateSpeed;
    this.orbitControls.zoomSpeed = this.zoomSpeed;
  }
  render() {
    this.renderer.render(this.scene.object, this.camera.object);
  }
  ngOnDestroy() { this.orbitControls.dispose(); }
}