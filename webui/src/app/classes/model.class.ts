import { Vector3 } from "babylonjs";

export enum MapItemType {
    cube,
    sphere,
    cylinder
}

export class MapAbstractNode {
    id!: string;
    name!: string;
    size!: number;
    weight!: number;
    type!: MapItemType;
    position!: Vector3;
}

export class MapComponent extends MapAbstractNode {
}

export class MapNode extends MapAbstractNode {
}

export class MapEdge {
    id!: string;
    name!: string;
    source!: string;
    target!: string;
}
