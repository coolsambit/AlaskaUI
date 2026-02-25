import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; // Import RouterModule
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    // Remove AppComponent from here
  ],
  imports: [
    BrowserModule,
    AppComponent // <--- Add it here
    // ...
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
