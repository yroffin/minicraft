import { AfterViewInit, Component, Input, ViewChild, ElementRef, ContentChild, OnDestroy } from '@angular/core';
import { Engine, FreeCamera, HemisphericLight, Mesh, Scene, SceneLoader, Vector3 } from 'babylonjs';

@Component
  ({
    selector: 'three-renderer',
    templateUrl: './render.component.html',
    styleUrls: ['./render.component.css']
  })
export class RendererComponent implements AfterViewInit, OnDestroy {
  engine!: Engine;
  scene!: Scene;

  @ViewChild('canvas') canvasReference!: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  @Input() color: string | number = 0xffffff;
  @Input() alpha = 0;
  @Input() rotateSpeed = 1.0;
  @Input() zoomSpeed = 1.2;

  ngAfterViewInit() {
    // Load the 3D engine
    this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = this.createScene();

    // run the render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  // CreateScene function that creates and return the scene
  createScene() {
    // Create a basic BJS Scene object
    let scene = new Scene(this.engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    let camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
    // Target the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(this.canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    let light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    let sphere = Mesh.CreateSphere('sphere1', 16, 2, scene, false, Mesh.FRONTSIDE);
    // Move the sphere upward 1/2 of its height
    sphere.position.y = 1;
    // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
    let ground = Mesh.CreateGround('ground1', 6, 6, 2, scene, false);

    this.addItem();

    // Return the created scene
    return scene;
  }

  addItem() {
    SceneLoader.ImportMesh("", "assets/models/Dude/", "Dude.babylon", this.scene, (meshes) => {
      this.scene.createDefaultCameraOrLight(true, true, true);
      this.scene.createDefaultEnvironment();
    });
  }

  ngOnDestroy() { }
}