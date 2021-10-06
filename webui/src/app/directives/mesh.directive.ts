import { Directive, AfterViewInit, forwardRef, ContentChild, Input } from '@angular/core';
import { Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from 'three';
import { AbstractGeometry } from '../classes/abstract-geometry';
import { AbstractMaterial } from '../classes/abstract-material';
import { AbstractObject3D } from './abstract-object-3d.directive';

@Directive
  ({
    selector: 'three-mesh',
    providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => MeshDirective) }]
  })
export class MeshDirective extends AbstractObject3D<Mesh> implements AfterViewInit {
  @ContentChild(AbstractGeometry) geometry!: AbstractGeometry<any>;
  @ContentChild(AbstractMaterial) material!: AbstractMaterial<any>;
  ngAfterViewInit() {
    this.object = new Mesh
      (
        this.geometry.object,
        this.material && this.material.object || new MeshStandardMaterial({ color: 0x000000 })
      );
    super.ngAfterViewInit();
  }
}