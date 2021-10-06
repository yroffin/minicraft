import { Directive, AfterViewInit, Input, forwardRef } from '@angular/core';
import { MeshStandardMaterial, Color, Side, FrontSide } from 'three';
import { AbstractMaterial } from '../classes/abstract-material';

@Directive
  ({
    selector: 'three-standard-material',
    // https://angular.io/guide/dependency-injection-navtree#find-a-parent-by-its-class-interface
    providers: [{ provide: AbstractMaterial, useExisting: forwardRef(() => MeshStandardMaterialDirective) }]
  })
export class MeshStandardMaterialDirective extends AbstractMaterial<MeshStandardMaterial> implements AfterViewInit {
  @Input() color: Color = new Color(0x000000);
  @Input() side: Side = FrontSide;
  @Input() transparent = false;
  ngAfterViewInit() {
    this.object = new MeshStandardMaterial
      ({
        color: this.color,
        side: this.side,
        transparent: this.transparent,
      });
  }
}