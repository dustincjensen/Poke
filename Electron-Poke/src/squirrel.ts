import * as path from 'path';
import * as childProcess from 'child_process';

/**
 * This class was created to isolate the installer code for squirrel.
 */
export class Squirrel {

    // TODO investigate this further
    public static HandleSquirrelEvent(application: any): boolean {
        if (process.argv.length === 1) {
            return false;
        }

        let appFolder = path.resolve(process.execPath, '..');
        let rootAtomFolder = path.resolve(appFolder, '..');
        let updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
        let exeName = path.basename(process.execPath);

        let squirrelEvent = process.argv[1];
        switch (squirrelEvent) {
            case '--squirrel-install':
            case '--squirrel-updated':
                // Optionally do things such as:
                // - Add your .exe to the PATH
                // - Write to the registry for things like file associations and
                //   explorer context menus

                // Install desktop and start menu shortcuts
                Squirrel._spawnUpdate(updateDotExe, ['--createShortcut', exeName]);

                setTimeout(application.quit, 1000);
                return true;

            case '--squirrel-uninstall':
                // Undo anything you did in the --squirrel-install and
                // --squirrel-updated handlers

                // Remove desktop and start menu shortcuts
                Squirrel._spawnUpdate(updateDotExe, ['--removeShortcut', exeName]);

                setTimeout(application.quit, 1000);
                return true;

            case '--squirrel-obsolete':
                // This is called on the outgoing version of your app before
                // we update to the new version - it's the opposite of
                // --squirrel-updated

                application.quit();
                return true;
        }
    }

    private static _spawn(command: any, args: any) {
        let spawnedProcess, error;

        try {
            spawnedProcess = childProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) { }

        return spawnedProcess;
    };

    private static _spawnUpdate(updateDotExe, args) {
        return Squirrel._spawn(updateDotExe, args);
    };
}