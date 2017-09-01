import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';
import { AppComponent } from './app.component';
import { WaitingComponent } from './waiting/waiting.component';
import { ExampleComponent } from './example/example.component';

const appRoutes = RouterModule.forRoot(
    [
        { path: 'waiting', component: WaitingComponent },
        { path: 'example', component: ExampleComponent },
        { path: '', redirectTo: 'waiting', pathMatch: 'full' }
    ],
    {
        useHash: true,
        //enableTracing: true, // for debugging only
    }
);

@NgModule({
    imports: [
        appRoutes,
        BrowserModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        NgxElectronModule
    ],
    declarations: [
        AppComponent,
        WaitingComponent,
        ExampleComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }