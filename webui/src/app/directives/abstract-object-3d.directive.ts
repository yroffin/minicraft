import { Directive, ContentChildren, AfterViewInit, QueryList } from '@angular/core';
import { Object3D } from 'three';
import { AbstractCamera } from '../classes/abstract-camera';

@Directive()
export abstract class AbstractObject3D<T extends Object3D> implements AfterViewInit {
  public object!: T;

  @ContentChildren(AbstractCamera, { descendants: true })
  cameras!: QueryList<AbstractCamera<any>>;

  @ContentChildren(AbstractObject3D, { descendants: true })
  object3d!: QueryList<AbstractObject3D<any>>;

  ngAfterViewInit() {
    if (this.object3d !== undefined && this.object3d.length > 0) {
      this.object.add(...this.object3d
        // filter out self and unset objects
        .filter(node => node !== this && node.object !== undefined)
        .map(({ object }) => {
          return object;
        }));
    }
    if (this.cameras !== undefined && this.cameras.length > 0) {
      this.object.add(...this.cameras
        // filter out self and unset objects
        .filter(node => node.object !== undefined)
        .map(({ object }) => {
          return object;
        }));
    }
  }
}