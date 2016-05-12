module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - <%= pkg.description %> - Version: <%= pkg.version %> */\n'
            },
            build: {
                src: '<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>_v<%= pkg.version %>.min.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};