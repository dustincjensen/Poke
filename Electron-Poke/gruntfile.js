const electronPackager = require('electron-packager');
const electronWindowsInstaller = require('electron-winstaller');
const path = require('path');
const fs = require('fs');
const process = require('process');
const { execSync } = require('child_process');

module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        // The copy task moves files from one place to another.
        // We have 2 copy tasks.
        // - build 
        // - lib
        //
        // Build is run on grunt watches and just a regular grunt.
        // Build will move any file that is not .ts or .scss to the
        // dist/public folder. This is important for our html and .js
        // files that don't need to be compiled.
        // 
        // Lib is selectively run because it copies node_module files
        // into a dist/public/lib. This is to support Angular2 on the client.
        // if it needs to be done, the command npm run grunt copy:lib 
        // should be run.
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: "./src/public",
                        src: [
                            "**/*",
                            "!**/*.ts",
                            "!**/*.scss"
                        ],
                        dest: "./dist/public"
                    },
                    {
                        expand: true,
                        cwd: "./src/background",
                        src: [
                            "**/*",
                            "!**/*.ts",
                            "!**/*.scss"
                        ],
                        dest: "./dist/background"
                    },
                    {
                        expand: true,
                        cwd: "./src/assets",
                        src: [
                            "**/*",
                            "!**/*.ts",
                            "!**/*.scss"
                        ],
                        dest: "./dist/assets"
                    }
                ]
            },
            lib: {
                files: [
                    {
                        expand: true,
                        cwd: "./node_modules/",
                        src: [
                            "core-js/client/shim.min.js*",
                            "zone.js/dist/zone.js",
                            "rxjs/bundles/Rx.min.js",
                            "rxjs/Observable.js*",
                            "rxjs/observable/merge.js*",
                            "rxjs/operator/share.js*",
                            "rxjs/operators/share.js*",
                            "rxjs/Subject.js*",
                            "rxjs/util/root.js*",
                            "rxjs/util/toSubscriber.js*",
                            "rxjs/symbol/observable.js*",
                            "rxjs/operator/merge.js*",
                            "rxjs/operator/multicast.js*",
                            "rxjs/Subscriber.js*",
                            "rxjs/Subscription.js*",
                            "rxjs/util/ObjectUnsubscribedError.js*",
                            "rxjs/SubjectSubscription.js*",
                            "rxjs/symbol/rxSubscriber.js*",
                            "rxjs/Observer.js*",
                            "rxjs/observable/ArrayObservable.js*",
                            "rxjs/operator/mergeAll.js*",
                            "rxjs/operators/mergeAll.js*",
                            "rxjs/util/isScheduler.js*",
                            "rxjs/observable/ConnectableObservable.js*",
                            "rxjs/util/isFunction.js*",
                            "rxjs/util/isArray.js*",
                            "rxjs/util/isObject.js*",
                            "rxjs/util/tryCatch.js*",
                            "rxjs/util/errorObject.js*",
                            "rxjs/util/UnsubscriptionError.js*",
                            "rxjs/observable/ScalarObservable.js*",
                            "rxjs/observable/EmptyObservable.js*",
                            "rxjs/observable/fromPromise.js*",
                            "rxjs/observable/forkJoin.js*",
                            "rxjs/observable/ForkJoinObservable.js*",
                            "rxjs/observable/PromiseObservable.js*",
                            "rxjs/OuterSubscriber.js*",
                            "rxjs/util/subscribeToResult.js*",
                            "rxjs/util/isArrayLike.js*",
                            "rxjs/util/isPromise.js*",
                            "rxjs/symbol/iterator.js*",
                            "rxjs/InnerSubscriber.js*",
                            "rxjs/add/operator/toPromise.js*",
                            "rxjs/operator/toPromise.js*",
                            "rxjs/operator/map.js*",
                            "rxjs/operators/map.js*",
                            "rxjs/observable/from.js*",
                            "rxjs/observable/of.js",
                            "rxjs/operator/concatMap.js*",
                            "rxjs/operators/concatMap.js*",
                            "rxjs/operator/every.js*",
                            "rxjs/operators/every.js*",
                            "rxjs/operator/first.js*",
                            "rxjs/operators/first.js*",
                            "rxjs/operator/last.js*",
                            "rxjs/operators/last.js*",
                            "rxjs/operator/mergeMap.js*",
                            "rxjs/operators/mergeMap.js*",
                            "rxjs/operator/reduce.js*",
                            "rxjs/operators/reduce.js*",
                            "rxjs/operator/catch.js*",
                            "rxjs/operators/catchError.js*",
                            "rxjs/operator/concatAll.js*",
                            "rxjs/operators/concatAll.js*",
                            "rxjs/operator/filter.js*",
                            "rxjs/operators/filter.js*",
                            "rxjs/operator/observeOn.js*",
                            "rxjs/operators/observeOn.js*",
                            "rxjs/operator/switchMap*",
                            "rxjs/operators/switchMap*",
                            "rxjs/add/operator/switchMap*",
                            "rxjs/util/EmptyError.js*",
                            "rxjs/observable/FromObservable.js*",
                            "rxjs/observable/IteratorObservable.js*",
                            "rxjs/observable/ArrayLikeObservable.js*",
                            "rxjs/BehaviorSubject.js*",
                            "rxjs/Notification.js*",
                            "rxjs/util/pipe.js*",
                            "rxjs/util/noop.js*",
                            "rxjs/util/identity.js*",
                            "rxjs/util/ArgumentOutOfRangeError.js*",
                            "rxjs/operators/multicast.js*",
                            "rxjs/operators/refCount.js*",
                            "rxjs/operators/scan.js*",
                            "rxjs/operators/takeLast.js*",
                            "rxjs/operators/defaultIfEmpty.js*",
                            "@angular/core/bundles/core.umd.js*",
                            "@angular/common/bundles/common.umd.js*",
                            "@angular/compiler/bundles/compiler.umd.js*",
                            "@angular/platform-browser/bundles/platform-browser.umd.js*",
                            "@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js*",
                            "@angular/http/bundles/http.umd.js*",
                            "@angular/forms/bundles/forms.umd.js*",
                            "@angular/router/bundles/router.umd.js*",
                            "ngx-electron/bundles/core.umd.js",
                            "systemjs/dist/system.src.js*",
                        ],
                        dest: "./dist/public/lib"
                    }
                ]
            }
        },
        // This supports typescript compilation.
        // We used to specify the options and files here, but since VsCode
        // will not shut up about experimentalDecorators unless you specify
        // it in the tsconfig file, I opted to move the rest of the typescript
        // definitions there.
        ts: {
            app: {
                tsconfig: true
            }
        },
        // This support scss compilation.
        // This looks in the /src/public folder for the app.scss file.
        // Important to note that ONLY app.scss is looked for. This means
        // it should import the rest of the .scss files (or some chain of them).
        // TODO minify the app.css that is produced from this.
        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "./src/public",
                    src: ["**/styles.scss"],
                    dest: "./dist/public",
                    ext: ".css"
                }]
            }
        },
        // This will clean out the dist folder.
        // This removes the folder and all of its contents. Essentially
        // cleans our output because it has files that shouldn't exist
        // any more.
        clean: {
            random: ['tscommand-*.tmp.txt', '.tscache'],
            release: ['dist']
        },
        // This supports running tasks whenever one of the events occurs.
        // ts -- should occur whenever a change is detected in a .ts file in the src folder.
        // sass -- should occur whenever a change is detected in a .scss file in the src folder.
        // public -- should occur whenever a change is detected in .html or .js files in the src folder.
        watch: {
            ts: {
                files: ["src/\*\*/\*.ts"],
                tasks: ["ts"]
            },
            sass: {
                files: ["src/\*\*/\*.scss"],
                tasks: ["sass"]
            },
            public: {
                files: ["src/\*\*/\*.html", "src/\*\*/\*.js"],
                tasks: ["copy:build"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-sass");

    // Register "grunt"
    // This is the default items that will be run when you run the command npm run grunt.
    grunt.registerTask("default", [
        "copy:build",
        "ts",
        "sass"
    ]);

    // Register "full"
    // This task will clean, deploy lib, move files, compile ts and compile the scss.
    grunt.registerTask("full", [
        "clean",
        "copy",
        "ts",
        "sass"
    ]);

    // Starts the browser sync modules and watches for changes to files.
    grunt.registerTask("watch-task", [
        "watch"
    ]);

    grunt.registerTask("create-build-for-windows", "Create build for windows.", function () {
        grunt.log.writeln("Starting build for windows...");
        grunt.task.run([
            "full",
            "copy-package-json",
            "npm-install-into-dist",
            "windows-install"
        ]);
    });

    grunt.registerTask("copy-package-json", "Copy package.json into dist", function () {
        fs.copyFileSync("package.json", "./dist/package.json");
        grunt.log.writeln("Copied package.json to ./dist...");
    });

    grunt.registerTask("npm-install-into-dist", "npm install the production files into dist", function () {
        execSync("npm install --production", { cwd: "./dist" });
        grunt.log.writeln("npm install of production files into ./dist has completed...");
    });

    // Before running this...
    // npm run grunt full (this creates the project in the dist folder)
    // copy package.json into dist
    // run npm install --production in dist
    // Now run this...
    // npm run grunt windows-install
    // Double click Setup.exe when it is done!
    // The previous steps are now reflected above in the tasks, "create-build-for-windows",
    // "copy-package-json", "npm-install-into-dist".
    grunt.registerTask("windows-install", "Create installation for windows.", function () {
        let done = this.async();

        electronPackager({
            dir: './dist',
            name: 'Poke',
            platform: 'win32',
            arch: 'x64',
            out: './build',
            icon: path.join(__dirname, 'src/assets/Stick.ico')
        })
            .then(appPaths => {
                grunt.log.writeln('Built Packages:', appPaths);
                return electronWindowsInstaller.createWindowsInstaller({
                    appDirectory: appPaths[0],
                    outputDirectory: './build/installer',
                    authors: 'Dustin Jensen',
                    exe: 'Poke.exe',
                    iconUrl: path.join(__dirname, 'src/assets/Stick.ico')
                });
            })
            .then(() => {
                grunt.log.writeln('Completed creating Windows installer');
                done(true);
            })
            .catch(ex => {
                grunt.log.writeln('Failed creating Windows installer');
                grunt.log.writeln(ex);
                done(false);
            });
    });
};