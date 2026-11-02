import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { WorkspaceShell } from './app/features/workspace/workspace';

bootstrapApplication(WorkspaceShell, appConfig)
  .catch((err) => console.error(err));
