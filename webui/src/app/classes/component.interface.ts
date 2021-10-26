import { RendererComponent } from "../components/render/render.component";

export interface IComponent {
    getRenderer(): RendererComponent;
}

export class Msg {
    renderer!: RendererComponent;
}
