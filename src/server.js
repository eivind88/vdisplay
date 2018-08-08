var express = require('express')
var app = express();
var https = require('https')
var fs = require('fs')

app.use(function (req, res, next) { // first must be Your middleware
  if(req.path == '/webvr-polyfill.js') {
    return res.sendFile(__dirname + '/webvr-polyfill.js');
  }
  else if(req.path == '/webvr-polyfill.js.map') {
    return res.sendFile(__dirname + '/webvr-polyfill.js.map');
  }
  else if(req.path == '/adapter.js') {
    return res.sendFile(__dirname + '/adapter.js');
  }
  else if(req.path == '/adapter.js.map') {
    return res.sendFile(__dirname + '/adapter.js.map');
  }
  else if(req.path == '/peerjs.js') {
    return res.sendFile(__dirname + '/peerjs.js');
  }
  else if(req.path == '/peerjs.js.map') {
    return res.sendFile(__dirname + '/peerjs.js.map');
  }
  else if(req.path == '/rootCA.pem') {
    return res.sendFile(__dirname + '/rootCA.pem');
  }
  else if(req.path == '/server.crt') {
    return res.sendFile(__dirname + '/server.crt');
  }
  else if(req.path == '/server.key') {
    return res.sendFile(__dirname + '/server.key');
  }
  next();
});

app.get('/', function (req, res) {
  var hostname = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
 //console.log(req.headers.host);
  var response = `
    <!doctype html>
    <html lang=en>
      <head>
        <meta charset=utf-8>
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Phone</title>
        <style>
          body {
            width: 100%;
            height: 100%;
            background-color: #000;
            color: #fff;
            margin: 0px;
            padding: 0;
            overflow: hidden;
          }
          /* fix canvas */
          canvas {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          video {
            display: none;
          }
          /* Position the button on the bottom of the page. */
          #ui {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            font-family: 'Karla', sans-serif;
            z-index: 1;
          }
          a#magic-window {
            display: block;
            color: white;
            margin-top: 1em;
          }
          </style>
        <script src="webvr-polyfill.js"></script>
        <script src="adapter.js"></script>
        <script src="peerjs.js"></script>
        <script src="//povdocs.github.io/webvr-starter-kit/build/vr.js"></script>
        <!--<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/94/three.js"></script>-->
        <script type="text/javascript">
          var peer = new Peer('phone', {secure: true, host: '${hostname}', port: 7563, path: '/api'});
          peer.on('open', function () {
            //document.getElementById("msg").innerHTML = 'id: ' + peer.id;
          });
          peer.on('call', function(call) {
            // Answer the call, providing no mediaStream
            call.answer(null);
            call.on('stream', function(remoteStream) {
              // Show stream in VR landscape

              //VR.floor(); // Make a floor

              // Build VR video from remote video stream
              var remoteVideo = VR.video([
                  null
              ])
                  .moveTo(0, 1.5, 1.75)
                  .setScale(5)
                  //.rotateY(Math.PI / 6);
              remoteVideo.element.srcObject = remoteStream;
              remoteVideo.element.autoplay = true;
              remoteVideo.element.muted = true;
              remoteVideo.element.playsInline = true;
              console.log(remoteVideo);
              remoteVideo.play();

              remoteVideo.on('error', function (evt) {
                  console.log('video error', evt);
              });

              // Resize canvas and child elements on orientation change
              window.onresize = function(event) {
                var canvas = document.getElementsByTagName("canvas")[0];

                // Lookup the size the browser is displaying the canvas.
                var displayWidth  = canvas.clientWidth;
                var displayHeight = canvas.clientHeight;

                // Check if the canvas is not the same size.
                if (canvas.width  != displayWidth ||
                    canvas.height != displayHeight) {

                  // Make the canvas the same size
                  canvas.width  = displayWidth;
                  canvas.height = displayHeight;
                }

                // Reset viewer rotation back to video
                VR.zeroSensor()

                // Scroll to top to not display elements...
                document.body.scrollTop = 0; // For Safari
                document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
              }

              /*
              VR.on('shake', function () {
                console.log('lol');
              });

              var box = VR.box().moveX(-2);
              var sphere = VR.sphere().moveX(2);
              VR.on('lookat', function (target) {
                  if (target === box.object) {
                      // 1/4 of 1000 milliseconds = 250 milliseconds
                      VR.vibrate(250);
                  } else if (target === sphere.object) {
                      VR.vibrate([100, 30, 100, 30, 100, 200, 200, 30, 200, 30, 200, 200, 100, 30, 100, 30, 100]);
                  }
              });
              */

             // Check out more options at https://github.com/povdocs/webvr-starter-kit
            });
          });
          // Get rear video stream from facing camera
          var constraints = {
            audio: false,
            video: {
              mandatory: {
                minFrameRate: 1,
                maxFrameRate: 24,
                maxWidth: 667,
                maxHeight: 375
              },
              facingMode: { mandatory: "environment" }
            }
          }
          navigator.getUserMedia(constraints, function(localStream) {
            // Build VR video from local video stream
            var localVideo = VR.video([
                null
            ])
                .moveTo(0, 0.5, 3)
                .setScale(0.75)
                .rotateX(Math.PI / -3);
            localVideo.element.srcObject = localStream;
            localVideo.element.autoplay = true;
            localVideo.element.muted = true;
            localVideo.element.playsInline = true;
            console.log(localVideo);
            localVideo.play();

            localVideo.on('error', function (evt) {
                console.log('video error', evt);
            });

          }, function(err) {
            console.log('Failed to get local stream' ,err);
          });
        </script>
      </head>
      <body>
      </body>
    </html>
  `;
  res.send(response)
});

var certOptions = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.crt'),
  requestCert: false,
  rejectUnauthorized: false
}
//var server = app.listen(7564);
var server = https.createServer(certOptions, app).listen(7564);
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
