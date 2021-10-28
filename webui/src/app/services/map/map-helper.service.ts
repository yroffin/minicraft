import { EventEmitter, Injectable } from '@angular/core';
import { MaxLengthValidator } from '@angular/forms';
import { AbstractMesh, ActionManager, ArcRotateCamera, BoundingInfo, Color3, DynamicTexture, Engine, ExecuteCodeAction, HemisphericLight, Mesh, MeshBuilder, OimoJSPlugin, PhysicsImpostor, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from 'babylonjs';
import { ModelShape } from 'babylonjs/Particles/solidParticle';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import { isNumber } from 'lodash';
import { mxCell } from 'mxgraphdata';
import * as OIMO from 'oimo';
import { Msg } from 'src/app/classes/component.interface';
import { BrowserService } from '../browser.service';
import { EdgeService, MapHelperEdge } from '../data/edge.service';
import { MapHelperNode, NodeService } from '../data/node.service';
import { LoadAssetService } from '../load-asset.service';

export class MapHelperContext {

  constructor() {
  }

  engine!: Engine;
  scene!: Scene;
  camera!: ArcRotateCamera;
  mesh!: AbstractMesh;

  wireframe: boolean = false;
  type: number = 2;
}

export class MapHelperGraph {
  nodes: Array<MapHelperNode> = [];
  edges: Array<MapHelperEdge> = [];
}

@Injectable({
  providedIn: 'root'
})
export class MapHelperService {

  emitter: EventEmitter<Msg> = new EventEmitter();

  constructor(
    private readonly browserService: BrowserService,
    private readonly loadAssetService: LoadAssetService,
    private readonly nodeService: NodeService,
    private readonly edgeService: EdgeService
  ) {
    browserService.nativeWindow.CANNON = CANNON;
  }

  notify(msg: Msg): void {
    this.emitter.emit(msg);
  }

  getEmiter(): EventEmitter<Msg> {
    return this.emitter;
  }

  initialize(canvas: HTMLCanvasElement): Promise<MapHelperContext> {
    return new Promise<MapHelperContext>((resolve) => {
      this.loadEngineAndPhysics(canvas).then((context) => {
        this.loadCamerasAndLights(canvas, context);
        this.loadWorld(context).then((context) => {
          // run the render loop
          context.engine.runRenderLoop(() => {
            context.scene.render(true, false);
          });

          // the canvas/window resize event handler
          window.addEventListener('resize', () => {
            context.engine.resize();
          });

          resolve(context);
        });
      });
    });
  }

  loadEngineAndPhysics(canvas: HTMLCanvasElement): Promise<MapHelperContext> {
    return new Promise<MapHelperContext>((resolve) => {
      let context: MapHelperContext = new MapHelperContext();

      // Load the 3D engine
      context.engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: false }, false);
      context.scene = new Scene(context.engine);

      (async () => {
        switch (context.type) {
          case 1:
            context.scene.enablePhysics(new Vector3(0, -9.81, 0), new OimoJSPlugin(true, 0, OIMO));
            resolve(context);
            break;
          case 2:
            context.scene.enablePhysics(new Vector3(0, -981, 0));
            context.scene.collisionsEnabled = true;
            resolve(context);
            break;
        }
      })();
    });
  }

  loadCamerasAndLights(canvas: HTMLCanvasElement, context: MapHelperContext) {
    // Camera and light
    context.camera = new ArcRotateCamera("camera1", Math.PI / 3, Math.PI / 3, 200, new Vector3(-500, -500, 0), context.scene);
    context.camera.attachControl(canvas, true);
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), context.scene);
    light.intensity = 0.5;

    // Fix coordinate
    this.showWorldAxis(50, context);
  }

  loadWorld(context: MapHelperContext) {
    return new Promise<MapHelperContext>(async (resolve) => {
      const height = MeshBuilder.CreateGroundFromHeightMap("gdhm", "assets/textures/heightMap.png", {
        width: 2500,
        height: 2500,
        subdivisions: 200,
        maxHeight: 1000,
        updatable: false,
        onReady: (mesh) => {
          mesh.position.y = -1500;
          mesh.physicsImpostor = new PhysicsImpostor(mesh, PhysicsImpostor.HeightmapImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, context.scene);
          if (context.wireframe) {
            var materialforbox = new StandardMaterial("texture1", context.scene);
            mesh.material = materialforbox;
            materialforbox.wireframe = true;
          }
        }
      }, context.scene);

      let nodes = await this.nodeService.findAll();
      let edges = await this.edgeService.findAll();

      const world: MapHelperGraph = {
        nodes: _.flatMap<any, MapHelperNode>(await this.nodeService.findAll(), (node) => {
          return {
            id: node.id,
            name: node.name,
            size: node.size,
            position: node.position,
            resource: node.resource,
            weight: node.weight
          }
        }),
        edges: _.flatMap<any, MapHelperEdge>(await this.edgeService.findAll(), (edge) => {
          return {
            id: edge.id,
            name: edge.name,
            source: edge.source.id,
            target: edge.target.id
          }
        }),
      }

      // Draw this graph
      this.draw(context, world);

      resolve(context);
    });
  }

  private draw(context: MapHelperContext, world: MapHelperGraph) {
    let index = {};

    // Build index
    _.each(world.nodes, (node) => {
      eval(`index['${node.name}'] = node`);
    });

    // Put node in place
    _.each(world.nodes, (node) => {
      this.load(context, node).then((mesh) => {
        mesh.actionManager = new ActionManager(context.scene);
        mesh.actionManager.registerAction(
          new ExecuteCodeAction(ActionManager.OnPickUpTrigger, (event) => {
            if (event.additionalData) {
              let mesh = <AbstractMesh>event.additionalData.pickedMesh;
              console.log(event)
              context.camera.setTarget(mesh.getAbsolutePosition());
            }
          })
        );

        context.camera.setTarget(mesh.getBoundingInfo().boundingBox.center);
      });
    });

    // Put edge in place
    _.each(world.edges, (edge) => {
      let from = context.scene.getMeshById(edge.source);
      let to = context.scene.getMeshById(edge.target);
      if (from && to) {
        let line = MeshBuilder.CreateLines("name", {
          points: [
            from.getBoundingInfo().boundingBox.centerWorld,
            to.getBoundingInfo().boundingBox.centerWorld
          ]
        });
        line.color = new Color3(1, 0, 0);
      } else {
        console.log(`from/to is null`);
      }
    });
  }

  private showWorldAxis(size: number, context: MapHelperContext) {
    var makeTextPlane = (text: string, color: string, size: number) => {
      var dynamicTexture = new DynamicTexture("DynamicTexture", 50, context.scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
      var plane = Mesh.CreatePlane("TextPlane", size, context.scene, true);
      plane.material = new StandardMaterial("TextPlaneMaterial", context.scene);
      plane.material.backFaceCulling = false;
      return plane;
    };
    var axisX = Mesh.CreateLines("axisX", [
      Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
      new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
    ], context.scene, true);
    axisX.color = new Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = Mesh.CreateLines("axisY", [
      Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
      new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
    ], context.scene, true);
    axisY.color = new Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = Mesh.CreateLines("axisZ", [
      Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
      new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
    ], context.scene, true);
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

  private baseName(str: string) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1);
    if (base.lastIndexOf(".") != -1)
      base = base.substring(0, base.lastIndexOf("."));
    return base;
  }

  private dirName(str: string) {
    var base = new String(str).substring(0, str.lastIndexOf('/'));
    return base;
  }

  load(context: MapHelperContext, node: MapHelperNode): Promise<Mesh> {
    return new Promise<Mesh>((resolve) => {
      let url = `/api${node.resource}`;
      SceneLoader.ImportMesh("", `${this.dirName(url)}/`, `${this.baseName(url)}.babylon`, context.scene, (meshes, particleSystems, skeletons) => {
        context.scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);

        // create collider
        const collider = MeshBuilder.CreateSphere("box", {
          diameter: node.size
        }, context.scene);
        collider.id = node.id;

        // add each mesh to collider
        _.each(meshes, (mesh) => {
          collider.addChild(mesh);
        })

        // Fix position
        collider.translate(node.position, 1, Space.WORLD);
        collider.setPivotPoint(collider.getBoundingInfo().boundingBox.center);

        collider.physicsImpostor = new PhysicsImpostor(collider, PhysicsImpostor.SphereImpostor, { mass: node.weight, friction: 0.5, restitution: 0.7 }, context.scene);
        collider.isVisible = true;

        resolve(collider);
      });
    });
  }

  freeze(context: MapHelperContext): Promise<void> {
    return new Promise<void>((resolve) => {
      context.camera.setTarget(context.mesh.getBoundingInfo().boundingSphere.center);
      resolve();
    });
  }

  unfreeze(context: MapHelperContext): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}
