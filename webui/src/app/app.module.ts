import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'

import { WorldComponent } from './components/world/default/world.component';
import { RendererComponent } from './components/render/render.component';

import { MenubarModule } from 'primeng/menubar';
import { KnobModule } from 'primeng/knob';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { SplitterModule } from 'primeng/splitter';
import { InputTextModule } from 'primeng/inputtext';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DragDropModule } from 'primeng/dragdrop';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';

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
    FormsModule,
    MenubarModule,
    KnobModule,
    SliderModule,
    SpeedDialModule,
    SplitterModule,
    InputTextModule,
    ContextMenuModule,
    DragDropModule,
    TagModule,
    ChipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
