import { Camera } from 'three';
import { AbstractObject3D } from '../directives/abstract-object-3d.directive';

export abstract class AbstractCamera<T extends Camera> extends AbstractObject3D<T> {
    abstract updateAspectRatio(aspect: number): void;
}
