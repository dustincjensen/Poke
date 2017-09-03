import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';
import { AppComponent } from './app.component';
import { WaitingComponent } from './waiting/waiting.component';
import { ConversationComponent } from './conversation/conversation.component';

const appRoutes = RouterModule.forRoot(
    [
        { path: 'waiting', component: WaitingComponent },
        { path: 'conversation', component: ConversationComponent },
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
        ConversationComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }