import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { HomePage } from "./home/home.page";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  constructor() { }
}
