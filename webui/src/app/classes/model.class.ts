import { Vector3 } from "babylonjs";

export enum MapItemType {
    cube = "cube",
    sphere = "sphere",
    cylinder = "cylinder"
}

export class DtoAbstractVector {
    x!: number;
    y!: number;
    z!: number;
}

export class DtoAbstractNode {
    id?: string;
    uid?: string;
    name!: string;
    size!: number;
    weight?: number;
    type!: MapItemType;
    position!: DtoAbstractVector;
}

export class DtoComponent extends DtoAbstractNode {
    domains!: string[]
}

export class MapAbstractNode {
    id!: string;
    uid!: string;
    name!: string;
    parent!: string;
    width!: number;
    height!: number;
    weight!: number;
    type!: MapItemType;
    position!: Vector3;
}

export class MapDomainSelector {
    id?: string;
}

export class MapComponent extends MapAbstractNode {
    domains!: MapDomainSelector[]
    nodes!: MapNode[]
    holder!: MapNode
}

export class MapNode extends MapAbstractNode {
    domains!: MapDomainSelector[]
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

export enum MapGraphType {
    mxgraph = "mxgraph"
}

export class MapMxGraph {
    id!: string;
    name!: string;
    position!: Vector3;
    type!: MapGraphType;
    data!: string;
}
