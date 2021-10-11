import { AfterViewInit, Component, Input, ViewChild, ElementRef, ContentChild, OnDestroy } from '@angular/core';
import { AmmoJSPlugin, ArcRotateCamera, Axis, BoundingInfo, Color3, DynamicTexture, Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, OimoJSPlugin, PhysicsEngine, PhysicsImpostor, Scene, SceneLoader, Space, StandardMaterial, TransformNode, Vector3 } from 'babylonjs';
import * as OIMO from 'oimo'

import * as _ from 'lodash'
import { AbstractMesh } from 'babylonjs/Meshes/abstractMesh';

@Component
  ({
    selector: 'three-renderer',
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

  ngAfterViewInit() {
    // Load the 3D engine
    this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    this.scene.enablePhysics(new Vector3(0, -100, 0), new OimoJSPlugin(true, 0, OIMO));

    // Camera and light
    this.camera = new ArcRotateCamera("camera1", Math.PI / 3, Math.PI / 3, 200, Vector3.Zero(), this.scene);
    this.camera.attachControl(this.canvas, true);
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.5;

    // Fix ground
    const ground = MeshBuilder.CreateGround("ground1", { width: 600, height: 600, subdivisions: 1 }, this.scene);
    ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0 }, this.scene);
    ground.position.y = -1800;

    // Fix coordinate
    this.showWorldAxis(50);

    this.load().then((mesh) => {
      let direction = new Vector3(0, 1, 0);
      mesh.translate(direction, 50, Space.WORLD);
      this.mesh = mesh;
    });

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
  public pinch() {
    let direction = new Vector3(0, 1, 0.2);
    this.mesh.translate(direction, 50, Space.WORLD);
  }

  private getMinMax(mesh: AbstractMesh) {
    var info = mesh.getBoundingInfo();
    var min = info.minimum.multiply(mesh.scaling).add(mesh.position);
    var max = info.maximum.multiply(mesh.scaling).add(mesh.position);
    return { min: min, max: max };
  };

  private getBoundingInfo(meshes: AbstractMesh[]) {
    let mm = this.getMinMax(meshes[0]);
    let min = mm.min;
    let max = mm.max;
    _.each(meshes, (mesh) => {
      mm = this.getMinMax(mesh);
      min = Vector3.Minimize(min, mm.min);
      max = Vector3.Maximize(max, mm.max);
    });
    return new BoundingInfo(min, max);
  };

  load(): Promise<Mesh> {
    return new Promise<Mesh>((resolve) => {
      SceneLoader.ImportMesh("", "assets/models/Dude/", "Dude.babylon", this.scene, (meshes) => {
        const collider = MeshBuilder.CreateBox("box", {
          size: 69
        }, this.scene);
        let boundingBox = this.getBoundingInfo(meshes);
        let direction = boundingBox.boundingSphere.center.clone();
        direction.normalize();
        collider.translate(direction, boundingBox.boundingSphere.center.length(), Space.WORLD)

        this.camera.setTarget(collider.getBoundingInfo().boundingSphere.center);

        // add each mesh to collider
        _.each(meshes, (mesh) => {
          collider.addChild(mesh);
        })
        collider.physicsImpostor = new PhysicsImpostor(collider, PhysicsImpostor.BoxImpostor, { mass: 800 }, this.scene);
        collider.isVisible = false;
        resolve(collider);
      });
    });
  }

  showWorldAxis(size: number) {
    var makeTextPlane = (text: string, color: string, size: number) => {
      var dynamicTexture = new DynamicTexture("DynamicTexture", 50, this.scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
      var plane = Mesh.CreatePlane("TextPlane", size, this.scene, true);
      plane.material = new StandardMaterial("TextPlaneMaterial", this.scene);
      plane.material.backFaceCulling = false;
      return plane;
    };
    var axisX = Mesh.CreateLines("axisX", [
      Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
      new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
    ], this.scene);
    axisX.color = new Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = Mesh.CreateLines("axisY", [
      Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
      new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
    ], this.scene);
    axisY.color = new Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = Mesh.CreateLines("axisZ", [
      Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
      new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
    ], this.scene);
    axisZ.color = new Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
  };

  ngOnDestroy() { }
}