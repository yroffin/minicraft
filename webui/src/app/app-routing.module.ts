import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnotherComponent } from './components/world/another/another.component';
import { WorldComponent } from './components/world/default/world.component';

const routes: Routes = [
  {
    path: '',
    component: WorldComponent
  },
  {
    path: 'craft/3d/domains/:domainId',
    component: WorldComponent
  },
  {
    path: 'craft/2d/domains/:domainId',
    component: AnotherComponent
  },
  {
    path: 'another',
    component: AnotherComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
