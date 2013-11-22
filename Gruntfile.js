module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: [ 'app/client/*.js' ]
        },

        concat: {
            options: { separator: ';' },
            dist: {
                src:  [ 'app/client/*.js' ],
                dest: 'app/client/_srcs.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src:  'app/client/_srcs.js',
                dest: 'app/public/<%= pkg.name %>.js'
            }
        },

        clean: [ 'app/client/_srcs.js' ]

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('lint', [ 'jshint' ]);
    grunt.registerTask('default', [ 'concat', 'uglify', 'clean' ]);
};