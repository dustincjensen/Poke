import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes, RouteReuseStrategy } from '@angular/router';
import { NgxElectronModule } from 'ngx-electron';
import { CustomReuseStrategy } from './router/customReuseStrategy';
import { AppComponent } from './app.component';
import { CodeInputComponent } from './waiting/code-input.component';
import { WaitingComponent } from './waiting/waiting.component';
import { VerificationComponent } from './waiting/verification.component';
import { ConversationListComponent } from './conversation/conversation-list.component';
import { ConversationComponent } from './conversation/conversation.component';
import { ContactSelectorComponent } from './conversation/contact-selector.component';
import { ConversationService } from './conversation/conversation.service';

const appRoutes = RouterModule.forRoot(
    [
        { path: 'waiting', component: WaitingComponent },
        { path: 'verification', component: VerificationComponent },
        {
            path: 'conversations',
            component: ConversationListComponent,
            children: [
                { path: 'conversation/:id', component: ConversationComponent, outlet: 'conversationListOutlet' },
                { path: 'contacts', component: ContactSelectorComponent, outlet: 'conversationListOutlet' }
            ]
        },
        // TODO change back to waiting.
        { path: '', redirectTo: 'verification', pathMatch: 'full' }
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
        CodeInputComponent,
        WaitingComponent,
        VerificationComponent,
        ConversationListComponent,
        ConversationComponent,
        ContactSelectorComponent
    ],
    providers: [
        // This uses the custom route strategy and makes it so the
        // components do not get destroyed on route navigation.
        // This means we won't run into errors like multiple listeners
        // or UI issues where variables are not set.
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        ConversationService
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }