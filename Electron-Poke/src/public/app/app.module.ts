import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';
import { AppComponent } from './app.component';
import { WaitingComponent } from './waiting/waiting.component';
import { ConversationListComponent } from './conversation/conversation-list.component';
import { ConversationComponent } from './conversation/conversation.component';
import { ContactSelectorComponent } from './conversation/contact-selector.component';

const appRoutes = RouterModule.forRoot(
    [
        { path: 'waiting', component: WaitingComponent },
        {
            path: 'conversations',
            component: ConversationListComponent,
            children: [
                { path: 'conversation/:id', component: ConversationComponent, outlet: 'conversationListOutlet' },
                { path: 'contacts', component: ContactSelectorComponent, outlet: 'conversationListOutlet' }
            ]
        },
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
        ConversationListComponent,
        ConversationComponent,
        ContactSelectorComponent
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule { }