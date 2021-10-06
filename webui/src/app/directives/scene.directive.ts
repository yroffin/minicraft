import { Directive, AfterViewInit, forwardRef } from '@angular/core';
import { Scene } from 'three';
import { AbstractObject3D } from './abstract-object-3d.directive';

@Directive
  ({
    selector: 'three-scene',
    // https://angular.io/guide/dependency-injection-navtree#find-a-parent-by-its-class-interface
    providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => SceneDirective) }]
  })
export class SceneDirective extends AbstractObject3D<Scene> implements AfterViewInit {
  ngAfterViewInit() {
    this.object = new Scene();
    super.ngAfterViewInit();
  }
}