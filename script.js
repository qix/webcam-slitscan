/***
 * Setup a webcam and fetch data from it
 **/
var webcam = (function() {
  var video, snapshot, context, stream;

  this.init = function(onComplete) {
    snapshot = document.getElementById('snapshot');
    video = document.getElementById('video');
    context = snapshot.getContext('2d');

    var getUserMedia = 
      navigator.getUserMedia || 
      navigator.webkitGetUserMedia || 
      navigator.mozGetUserMedia || 
      navigator.msGetUserMedia;

    var URL = (window.URL || window.webkitURL);

    getUserMedia.call(navigator, {video:true}, function (stream) {
      video.src = URL.createObjectURL(stream);


      var interval = setInterval(function() {
        if (video.videoWidth > 0) {
          clearInterval(interval);

          onComplete(video.videoWidth, video.videoHeight);
        }
      }, 100);

    }, function() {
      alert('Failed to setup camera.');
    });

  };

  this.fetch = function() {
    context.drawImage(video, 0, 0);

    return context.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
  };

  return this;
}).call({});

$(function() {

  var drawCanvas = document.getElementById('draw'),
      video = document.getElementById('video'),
      outputCanvas = document.getElementById('output'),
      snapshotCanvas = document.getElementById('snapshot'),
      videoStream = null;

  var width = drawCanvas.width,
      height = drawCanvas.height;

  var drawContext = drawCanvas.getContext("2d"),
      outputContext = outputCanvas.getContext("2d"),
      snapshotContext = snapshotCanvas.getContext("2d");

  var frames = [];

  var frameInterval,
      frameNumber = 0;

  webcam.init(function(videoWidth, videoHeight) {
    width = videoWidth;
    height = videoHeight;

    _.each([snapshotCanvas, outputCanvas, drawCanvas], function(canvas) {
      canvas.width = width;
      canvas.height = height;
    });

    setupDrawCanvas($('#draw'));
    frameInterval = setInterval(frame, 30);
  });

  function frame() {
    var data = webcam.fetch();
    var count = $('#frames').val();

    frames.push(data);
    while (frames.length > count) {
      frames.shift();
    }

    // quickly iterate over all pixels
    var drawData = drawContext.getImageData(0, 0, width, height).data;
    var outputData = outputContext.getImageData(0, 0, width, height);

    var dataLength = drawData.length;
    var lineLength = dataLength / height;

    var delay, outputPos, inputPos;

    var drawScale = (frames.length-1) / 255.0;

    for (var linePosition = 0; linePosition < dataLength; linePosition += lineLength) {
      for(var i = 0; i < lineLength; i += 4) {

        outputPos = linePosition+lineLength-i-4;
        inputPos  = linePosition+i;
        delay = parseInt(drawData[outputPos] * drawScale, 10);

        outputData.data[outputPos]   = frames[delay][inputPos];
        outputData.data[outputPos+1] = frames[delay][inputPos+1];
        outputData.data[outputPos+2] = frames[delay][inputPos+2];
        outputData.data[outputPos+3] = 255;
      }
    }

    outputContext.putImageData(outputData, 0, 0);

    frameNumber += 1;

    $('#status').text(
        "Frame: "+frameNumber+"\n"+
        "Frames loaded: "+frames.length+"\n"
      );
  }

  // Set up all the drawer
  function setupDrawCanvas($canvas) {
    $('#defaults').change();
  }

  (function() {
    var ctx = drawContext;

    var addDefault = function(caption, cb) {
      $('#defaults').append(
        $('<option>').prop('value', caption)
                    .text(caption)
                    .data('callback', cb)
      );
    };

    $('#defaults').change(function() {
      $(this).find('option:selected').data('callback')();
    });

    var background = function(color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    };

    var linearGradient = function(x,y,x2,y2, start, stop) {
      var gradient = ctx.createLinearGradient(x,y,x2,y2);
      gradient.addColorStop(0, start);
      gradient.addColorStop(1, stop);
      background(gradient);
    };

    var radialGradient = function(x,y,r,x2,y2,r2, start, stop) {
      var gradient = ctx.createRadialGradient(x,y,r,x2,y2,r2);
      gradient.addColorStop(0, start);
      gradient.addColorStop(1, stop);
      background(gradient);
    };

    var gradientWaves = function(x, y, x2, y2, stops) {
      var gradient = ctx.createLinearGradient(x, y, x2, y2);
      for (var k = 0; k <= stops; k++) {
        gradient.addColorStop(k / stops, k%2 == 0 ? '#fff' : '#000');
        console.log(k);
      }
      background(gradient);
    };

    addDefault('blank', function() {
      background('#fff');
    });

    addDefault('top-bottom', function() {
      linearGradient(0, 0, 0, height, '#fff', '#000');
    });

    addDefault('bottom-top', function() {
      linearGradient(0, 0, 0, height, '#000', '#fff');
    });

    addDefault('diagonal', function() {
      linearGradient(0, 0, width, height, '#fff', '#000');
    });

    addDefault('tunnel', function() {
      linearGradient(0, 0, width, height, '#fff', '#000');
      radialGradient(0, 0, 0, width, height, Math.max(width,height)/2, '#fff', '#000');
    });

    addDefault('radial-in', function() {
      background('#fff');
      radialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width,height), '#000', '#fff');
    });

    addDefault('radial-out', function() {
      radialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width,height), '#fff', '#000');
    });

    addDefault('horizontal-waves', function() {
      gradientWaves(0, 0, width, 0, 5);
    });

    addDefault('vertical-waves', function() {
      gradientWaves(0, 0, 0, height, 5);
    });

    addDefault('diagonal-waves', function() {
      gradientWaves(0, 0, width, height, 5);
    });
  })();
});

