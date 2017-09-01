import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ExampleComponent } from './example/example.component';

const appRoutes = RouterModule.forRoot(
    [
        { path: 'example', component: ExampleComponent },
        { path: '', redirectTo: 'example', pathMatch: 'full' }
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
        ReactiveFormsModule
    ],
    declarations: [
        AppComponent,
        ExampleComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }