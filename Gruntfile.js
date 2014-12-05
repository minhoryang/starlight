'use strict';
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// TODO(minhoryang@gmail.com): Enable Tests.
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };
    var LIVERELOAD_PORT = 35729;

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            options: {
                nospawn: true
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
                ]
            },
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            require('connect-livereload')({port: LIVERELOAD_PORT}),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
// TODO(minhoryang@gmail.com): Enable Tests.
//            test: {
//                options: {
//                    middleware: function (connect) {
//                        return [
//                            mountFolder(connect, '.tmp'),
//                            mountFolder(connect, 'test'),
//                            mountFolder(connect, yeomanConfig.app)
//                        ];
//                    }
//                }
//            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
// TODO(minhoryang@gmail.com): Enable Tests.
//                'test/spec/{,*/}*.js'
            ]
        },
// TODO(minhoryang@gmail.com): to use bootstrap smartly, use bootstrap-sass.
//        compass: {
//            options: {
//                sassDir: '<%= yeoman.app %>/styles',
//                cssDir: '.tmp/styles',
//                imagesDir: '<%= yeoman.app %>/images',
//                javascriptsDir: '<%= yeoman.app %>/scripts',
//                fontsDir: '<%= yeoman.app %>/styles/fonts',
//                importPath: '<%= yeoman.app %>/bower_components',
//                relativeAssets: true
//            },
//            dist: {},
//            server: {
//                options: {
//                    debugInfo: true
//                }
//            }
//        },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/styles/main.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= yeoman.app %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',  // TODO(minhoryang@gmail.com): what tha..
                        'images/{,*/}*.{webp,gif}'
                    ]
                }]
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        }
    });

    // New task for flask server
    grunt.registerTask('flask', 'Run flask server.', function() {
       var spawn = require('child_process').spawn;
       grunt.log.writeln('Starting Flask development server.');
       // stdio: 'inherit' let us see flask output in grunt
       process.env.FLASK_YEOMAN_DEBUG = 1;
       process.env.LIVERELOAD_PORT = LIVERELOAD_PORT;
       var PIPE = {stdio: 'inherit'};
       spawn('python', ['server.py'], PIPE);
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
// TODO(minhoryang@gmail.com): Enable Tests.
//        } else if (target === 'test') {
//            return grunt.task.run([
//                'clean:server',
//                'connect:test:keepalive'
//            ]);
        }

        grunt.task.run([
            'clean:server',
            'flask',
            'open',
            'watch'
        ]);
    });

// TODO(minhoryang@gmail.com): Enable Tests.
//    grunt.registerTask('test', [
//        'clean:server',
//        'connect:test',
//    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'imagemin',
        'htmlmin',
        'concat',
        'cssmin',
        'copy',
        'rev',
        'usemin'
    ]);

    grunt.registerTask('default', [
        'jshint',
// TODO(minhoryang@gmail.com): Enable Tests.
//        'test',
        'build'
    ]);
};
