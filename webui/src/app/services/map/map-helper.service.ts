import { Injectable } from '@angular/core';
import { AbstractMesh, ArcRotateCamera, BoundingInfo, Color3, DynamicTexture, Engine, HemisphericLight, Mesh, MeshBuilder, OimoJSPlugin, PhysicsImpostor, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from 'babylonjs';
import * as OIMO from 'oimo'
import * as CANNON from 'cannon'
import * as _ from 'lodash'
import { BrowserService } from '../browser.service';

@Injectable({
  providedIn: 'root'
})
export class MapHelperService {
  engine!: Engine;
  scene!: Scene;
  camera!: ArcRotateCamera;
  mesh!: AbstractMesh;

  wireframe: boolean = false;
  type: number = 2;

  constructor(private readonly browserService: BrowserService) {
    browserService.nativeWindow.CANNON = CANNON;
  }

  getEngine(): Engine {
    return this.engine;
  }

  loadEngineAndPhysics(canvas: HTMLCanvasElement): Promise<void> {
    return new Promise<void>((resolve) => {
      // Load the 3D engine
      this.engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false }, false);
      this.scene = new Scene(this.engine);
      this.scene.debugLayer.show();

      (async () => {
        switch (this.type) {
          case 1:
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), new OimoJSPlugin(true, 0, OIMO));
            resolve();
            break;
          case 2:
            console.log(CANNON)
            this.scene.enablePhysics(new Vector3(0, -981, 0));
            this.scene.collisionsEnabled = true;
            resolve();
            break;
        }
      })();
    });
  }

  loadCamerasAndLights(canvas: HTMLCanvasElement) {
    // Camera and light
    this.camera = new ArcRotateCamera("camera1", Math.PI / 3, Math.PI / 3, 200, new Vector3(-500, -500, 0), this.scene);
    this.camera.attachControl(canvas, true);
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.5;

    // Fix coordinate
    this.showWorldAxis(50);
  }

  loadWorld(canvas: HTMLCanvasElement) {
    const height = MeshBuilder.CreateGroundFromHeightMap("gdhm", "assets/textures/heightMap.png", {
      width: 2500,
      height: 2500,
      subdivisions: 200,
      maxHeight: 1000,
      updatable: false,
      onReady: (mesh) => {
        mesh.position.y = -1500;
        mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, this.scene);
        if (this.wireframe) {
          var materialforbox = new StandardMaterial("texture1", this.scene);
          mesh.material = materialforbox;
          materialforbox.wireframe = true;
        }
      }
    }, this.scene);

    // run the render loop
    this.engine.runRenderLoop(() => {
      this.scene.render(true, false);
    });

    // the canvas/window resize event handler
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private showWorldAxis(size: number) {
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
    ], this.scene, true);
    axisX.color = new Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = Mesh.CreateLines("axisY", [
      Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
      new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
    ], this.scene, true);
    axisY.color = new Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = Mesh.CreateLines("axisZ", [
      Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
      new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
    ], this.scene, true);
    axisZ.color = new Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
  };

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
      SceneLoader.ImportMesh("", "assets/models/Dude/", "Dude.babylon", this.scene, (meshes, particleSystems, skeletons) => {
        this.scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

        const collider = MeshBuilder.CreateSphere("box", {
          diameter: 69
        }, this.scene);
        let boundingBox = this.getBoundingInfo(meshes);
        let direction = boundingBox.boundingSphere.center.clone();
        direction.normalize();
        collider.translate(direction, boundingBox.boundingSphere.center.length(), Space.LOCAL);

        this.camera.setTarget(collider.getBoundingInfo().boundingSphere.center);

        collider.physicsImpostor = new PhysicsImpostor(collider, PhysicsImpostor.SphereImpostor, { mass: 5, friction: 0.5, restitution: 0.7 }, this.scene);
        collider.isVisible = false;

        // add each mesh to collider
        _.each(meshes, (mesh) => {
          collider.addChild(mesh);
        })

        this.mesh = meshes[0];
        resolve(collider);
      });
    });
  }

  freeze(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.camera.setTarget(this.mesh.getBoundingInfo().boundingSphere.center);
      resolve();
    });
  }

  unfreeze(): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}
