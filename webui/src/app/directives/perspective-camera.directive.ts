import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import { PerspectiveCamera } from 'three';
import { AbstractCamera } from '../classes/abstract-camera';

@Directive
  ({
    selector: 'three-perspective-camera',
    providers: [{ provide: AbstractCamera, useExisting: forwardRef(() => PerspectiveCameraDirective) }]
  })
export class PerspectiveCameraDirective extends AbstractCamera<PerspectiveCamera> implements AfterViewInit {
  // basic inputs to initialize the camera with
  @Input() fov!: number;
  @Input() near!: number;
  @Input() far!: number;

  @Input() positionX!: number;
  @Input() positionY!: number;
  @Input() positionZ!: number;

  ngAfterViewInit() {
    this.object = new PerspectiveCamera(this.fov, 800 / 600, this.near, this.far);
    this.object.position.x = this.positionX;
    this.object.position.y = this.positionY;
    this.object.position.z = this.positionZ;
    this.object.updateProjectionMatrix();
  }
  updateAspectRatio(aspect: number) {
    this.object.aspect = aspect;
    this.object.updateProjectionMatrix();
  }
}