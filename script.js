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
      videoStream = null,
      width = null, height = null;

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

  // Set up all the drawer
  function setupDrawCanvas($canvas) {
    var ctx = $canvas[0].getContext("2d");
    var size = 30;
    var x, y;
    var interval = null;
    var hover = true;

    addDefault('blank', function() {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
    });

    var linearGradient = function(x,y,x2,y2, start, stop) {
      var gradient = ctx.createLinearGradient(x,y,x2,y2);
      gradient.addColorStop(0, start);
      gradient.addColorStop(1, stop);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    addDefault('top-bottom', function() {
      linearGradient(0, 0, 0, height, '#000', '#fff');
    });

    addDefault('bottom-top', function() {
      linearGradient(0, 0, 0, height, '#fff', '#000');
    });

    addDefault('diagonal', function() {
      linearGradient(0, 0, width, height, '#fff', '#000');
    });
  };
});

