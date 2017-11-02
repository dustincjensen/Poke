import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class SettingsComponent extends ElectronComponent implements OnInit {

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
    }

    public closeSettings() {
        this._router.navigateByUrl('/conversations');
    }
}