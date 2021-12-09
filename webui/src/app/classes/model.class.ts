import { Vector3 } from "babylonjs";

export enum MapItemType {
    cube,
    sphere,
    cylinder
}

export class MapAbstractNode {
    id!: string;
    uid!: string;
    name!: string;
    size!: number;
    weight!: number;
    type!: MapItemType;
    position!: Vector3;
}

export class MapComponent extends MapAbstractNode {
    domains!: string[]
}

export class MapNode extends MapAbstractNode {
    domains!: string[]
}

export class MapEdge {
    id!: string;
    name!: string;
    source!: string;
    target!: string;
}

export class MapDomain {
    id!: string;
    name!: string;
}
