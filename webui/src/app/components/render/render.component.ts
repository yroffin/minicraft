import { AfterViewInit, Component, Input, ViewChild, ElementRef, ContentChild, OnDestroy } from '@angular/core';
import { AmmoJSPlugin, ArcRotateCamera, Axis, BoundingInfo, Color3, DynamicTexture, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, OimoJSPlugin, PhysicsEngine, PhysicsImpostor, Scene, SceneLoader, Space, StandardMaterial, TransformNode, Vector3 } from 'babylonjs';
import * as OIMO from 'oimo'

import * as _ from 'lodash'
import { AbstractMesh } from 'babylonjs/Meshes/abstractMesh';
import { MapHelperService } from 'src/app/services/map/map-helper.service';

@Component
  ({
    selector: 'app-world-renderer',
    templateUrl: './render.component.html',
    styleUrls: ['./render.component.css']
  })
export class RendererComponent implements AfterViewInit, OnDestroy {
  engine!: Engine;
  scene!: Scene;
  camera!: ArcRotateCamera;

  mesh!: Mesh;

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @Input() color: string | number = 0xffffff;
  @Input() alpha = 0;
  @Input() rotateSpeed = 1.0;
  @Input() zoomSpeed = 1.2;

  constructor(private mapHelperService: MapHelperService) {
  }

  ngAfterViewInit() {
    this.mapHelperService.loadEngineAndPhysics(this.canvas).then(() => {
      this.mapHelperService.loadCamerasAndLights(this.canvas);
      this.mapHelperService.loadWorld(this.canvas);
    });
  }

  // CreateScene function that creates and return the scene
  public pinch() {
    this.mapHelperService.load().then((mesh) => {
      let direction = new Vector3(0, 0, 1);
      mesh.translate(direction, 50, Space.WORLD);
      this.mesh = mesh;
    });
  }

  public freeze() {
    this.mapHelperService.freeze().then(() => {
    });
  }

  public unfreeze() {
    this.mapHelperService.unfreeze().then(() => {
    });
  }

  ngOnDestroy() { }
}