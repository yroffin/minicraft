import { Material } from 'three';

export abstract class AbstractMaterial<T extends Material>
{
    public object!: T;
}