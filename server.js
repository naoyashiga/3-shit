var budo = require('budo')
var babelify = require('babelify')

var workingDir = "./demo/particles";

budo(workingDir + '/index.js', {
  serve : "bundle.js",
  live: true,
  port: 8000,
  open: true,
  dir:[workingDir],
  css: 'style.css',
  browserify: {
        transform: [
            babelify.configure({presets: ["es2015"]})
        ]
    }
}).on('connect', function (ev) {
}).on('update', function (buffer) {
})
