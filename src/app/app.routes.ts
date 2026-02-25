import { Routes } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { ViewerComponent } from './viewer/viewer.component';
import { SearchComponent } from './search/search.component';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'viewer', component: ViewerComponent },
  { path: 'search', component: SearchComponent }
];
