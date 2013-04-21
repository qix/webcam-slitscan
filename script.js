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

  function stop() {
    clearInterval(frameInterval);
    frames = [];
  }

  function frame() {
    var data = webcam.fetch();

    frames.push(data);
    if (frames.length > 256) frames.shift();

    // quickly iterate over all pixels
    var drawData = drawContext.getImageData(0, 0, width, height).data;
    var outputData = outputContext.getImageData(0, 0, width, height);

    for(var i = 0, n = drawData.length; i < n; i += 4) {
      var delay = Math.min(drawData[i], frames.length-1);
      outputData.data[i] = frames[delay][i+0];
      outputData.data[i+1] = frames[delay][i+1];
      outputData.data[i+2] = frames[delay][i+2];
      outputData.data[i+3] = 255;
    }

    outputContext.putImageData(outputData, 0, 0);

    frameNumber += 1;

    $('#log').text(
        "Frame: "+frameNumber+"\n"+
        "Frames loaded: "+frames.length+"\n"
      );
  }

  // Set up all the drawer
  function setupDrawCanvas($canvas) {
    var ctx = $canvas[0].getContext("2d");
    var size = 30;
    var x, y;
    var interval = null;
    var hover = true;

    // Create Linear Gradients
    var lingrad = ctx.createLinearGradient(0,0,0,480);
    lingrad.addColorStop(0, '#000');
    lingrad.addColorStop(1, '#fff');

    ctx.fillStyle = lingrad;
    ctx.fillRect(0, 0, 640, 480);

    ctx.globalAlpha = 0.3;
  };
});

