import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { WorldComponent } from './components/world/default/world.component';
import { RendererComponent } from './components/render/render.component';

import { MenubarModule } from 'primeng/menubar';
import { AnotherComponent } from './components/world/another/another.component';
import { PaperComponent } from './components/paper/paper.component';

@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    RendererComponent,
    AnotherComponent,
    PaperComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MenubarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
