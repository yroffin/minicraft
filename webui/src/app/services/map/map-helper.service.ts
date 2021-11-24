import { EventEmitter, Injectable } from '@angular/core';
import { AbstractMesh, ActionManager, ArcRotateCamera, BoundingInfo, Color3, DynamicTexture, Engine, ExecuteCodeAction, HemisphericLight, Mesh, MeshBuilder, OimoJSPlugin, PhysicsImpostor, Scene, SceneLoader, Space, StandardMaterial, Vector3 } from 'babylonjs';
import { AdvancedDynamicTexture, Ellipse, Line, Rectangle, TextBlock } from 'babylonjs-gui';
import { OBJFileLoader, STLFileLoader, GLTFFileLoader } from 'babylonjs-loaders';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import * as OIMO from 'oimo';
import { Subject } from 'rxjs';
import { Msg } from 'src/app/classes/component.interface';
import { BrowserService } from '../browser.service';
import { EdgeService, MapHelperEdge } from '../data/edge.service';
import { MapHelperNode, MapHelperNodeType, NodeService } from '../data/node.service';
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
    SceneLoader.RegisterPlugin(new STLFileLoader());
    SceneLoader.RegisterPlugin(new OBJFileLoader());
    SceneLoader.RegisterPlugin(new GLTFFileLoader());
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
        nodes: _.sortBy(await this.nodeService.findAll(), (node) => {
          return node.position.z
        }),
        edges: await this.edgeService.findAll(),
      }

      console.log(world);

      // Draw this graph
      this.draw(context, world);

      resolve(context);
    });
  }

  private draw(context: MapHelperContext, world: MapHelperGraph) {
    (async () => {
      // Transform all node in mesh
      let meshes = _.flatMap(world.nodes, async (node) => {
        let mesh = await this.load(context, node);
        return mesh;
      });
      let result = await Promise.all(meshes);

      // Transform all edge to edge mesh
      _.each(world.edges, (edge) => {
        console.log(edge);
        let source = context.scene.getMeshByID(edge.source);
        let target = context.scene.getMeshByID(edge.target);
        if (source && target) {
          console.log(source);
          console.log(target);
          let line = MeshBuilder.CreateLines("name", {
            points: [
              source.getBoundingInfo().boundingBox.centerWorld,
              target.getBoundingInfo().boundingBox.centerWorld
            ]
          });
          line.color = new Color3(1, 0, 0);
        } else {
          console.log(`Source: ${edge.source} Target: ${edge.target}`);
        }
      });
    })();
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

  private ext(str: string) {
    var base = new String(str).substring(str.lastIndexOf('.'));
    return base;
  }

  load(context: MapHelperContext, node: MapHelperNode): Promise<Mesh> {
    return new Promise<Mesh>((resolve) => {

      // Create main mesh
      let meshes: Mesh[] = [];
      switch (node.type) {
        case MapHelperNodeType.cube:
          meshes = [MeshBuilder.CreateBox(node.name, {
            size: node.size
          }, context.scene)];
          break;
        case MapHelperNodeType.sphere:
          meshes = [MeshBuilder.CreateSphere(node.name, {
            diameter: node.size
          }, context.scene)];
          break;
        case MapHelperNodeType.cylinder:
          meshes = [MeshBuilder.CreateCylinder(node.name, {
            diameter: node.size,
            height: node.size
          }, context.scene)];
          break;
      }

      // GUI
      var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
      advancedTexture.idealWidth = 600;

      var rect1 = new Rectangle();
      rect1.width = 0.1;
      rect1.height = "10px";
      rect1.cornerRadius = 10;
      rect1.color = "Orange";
      rect1.thickness = 1;
      rect1.background = "green";
      rect1.alpha = 0.6;
      advancedTexture.addControl(rect1);
      rect1.linkWithMesh(meshes[0]);
      rect1.linkOffsetY = -50;

      var label = new TextBlock();
      label.text = node.name;
      label.fontSize = 5;
      rect1.addControl(label);

      var target = new Ellipse();
      target.width = "5px";
      target.height = "5px";
      target.color = "Orange";
      target.thickness = 1;
      target.background = "green";
      advancedTexture.addControl(target);
      target.linkWithMesh(meshes[0]);

      var line = new Line();
      line.lineWidth = 2;
      line.color = "Orange";
      line.y2 = 5;
      line.linkOffsetY = -2;
      advancedTexture.addControl(line);
      line.linkWithMesh(meshes[0]);
      line.connectedControl = rect1;

      // Create collider
      const collider = MeshBuilder.CreateSphere(`${node.name} collider`, {
        diameter: node.size
      }, context.scene);
      console.log(node);
      collider.id = node.id;

      // Add each mesh to collider
      _.each(meshes, (mesh) => {
        mesh.showBoundingBox = false;
        collider.addChild(mesh);
      })

      // Fix position
      collider.translate(node.position, 1, Space.WORLD);
      collider.setPivotPoint(collider.getBoundingInfo().boundingBox.center);

      collider.physicsImpostor = new PhysicsImpostor(collider, PhysicsImpostor.SphereImpostor, { mass: node.weight, friction: 0.5, restitution: 0.7 }, context.scene);
      collider.isVisible = false;

      meshes[0].actionManager = new ActionManager(context.scene);
      meshes[0].actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickUpTrigger, (event) => {
          if (event.additionalData) {
            let mesh = <AbstractMesh>event.additionalData.pickedMesh;
            console.log(event)
            context.camera.setTarget(mesh.getAbsolutePosition());
          }
        })
      );

      // Fix camera
      context.camera.setTarget(meshes[0].getBoundingInfo().boundingBox.center);
      resolve(collider);
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
