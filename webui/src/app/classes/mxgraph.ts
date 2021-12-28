
export class MxGeometry {
    x!: number
    y!: number
    height!: number
    width!: number
}

export class MxCell {
    id!: string
    value!: string
    edge!: string
    parent!: string
    source!: string
    target!: string
    style!: string[]
    mxGeometry?: MxGeometry
}

export class MxObject {
    id!: string
    label?: string
    component?: string
    mxCell!: MxCell
}

export class MxGraphRoot {
    mxObject!: MxObject[]
}

export class MxGraphModel {
    root!: MxGraphRoot
}
