import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorldComponent } from './components/world/world.component';
import { SceneDirective } from './directives/scene.directive';
import { SphereBufferGeometryDirective } from './directives/sphere-buffer-geometry.directive';
import { MeshStandardMaterialDirective } from './directives/standard-material.directive';
import { MeshDirective } from './directives/mesh.directive';
import { RendererComponent } from './components/render/render.component';
import { PerspectiveCameraDirective } from './directives/perspective-camera.directive';

@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    SceneDirective,
    SphereBufferGeometryDirective,
    MeshStandardMaterialDirective,
    MeshDirective,
    RendererComponent,
    PerspectiveCameraDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
