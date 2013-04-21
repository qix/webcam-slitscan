
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

  function start() {
    console.log("Start drawing!");
    width = video.videoWidth;
    height = video.videoHeight;

    _.each([snapshotCanvas, outputCanvas, drawCanvas], function(canvas) {
      canvas.width = width;
      canvas.height = height;
    });

    setupDrawCanvas($('#draw'));
    frameInterval = setInterval(frame, 30);
  }

  function stop() {
    clearInterval(frameInterval);
    frames = [];
  }

  function frame() {
    // Draw video frame
    snapshotContext.drawImage(video, 0, 0);
    frames.push(snapshotContext.getImageData(0, 0, width, height).data);

    if (frames.length < 255) {
      for (var k = 0; k < 5; k++) {
        frames.push(frames[frames.length-1]);
      }
    }

    while (frames.length > 256) {
      frames.shift();
    }

    if (frames.length < 256) return;

    // quickly iterate over all pixels
    var drawData = drawContext.getImageData(0, 0, width, height).data;
    var outputData = outputContext.getImageData(0, 0, width, height);

    for(var i = 0, n = drawData.length; i < n; i += 4) {
      var delay = drawData[i];
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

  function videoSetup() {

    var interval = setInterval(function() {
      if (video.videoWidth > 0) {
        clearInterval(interval);
        start();
      }
    }, 100);
  }

  function noStream() {
    console.log('Access to camera was denied!');
  }

  function stop() {
    if (videoStream)
    {
      if (videoStream.stop) videoStream.stop();
      else if (videoStream.msStop) videoStream.msStop();
      videoStream.onended = null;
      videoStream = null;
    }
    if (video)
    {
      video.onerror = null;
      video.pause();
      if (video.mozSrcObject)
        video.mozSrcObject = null;
      video.src = "";
    }
  }

  function gotStream(stream) {
    videoStream = stream;
    video.onerror = function ()
    {
      console.log('video.onerror');
      if (video) stop();
    };
    stream.onended = noStream;
    if (window.webkitURL) video.src = window.webkitURL.createObjectURL(stream);
    else if (video.mozSrcObject !== undefined)
    {//FF18a
      video.mozSrcObject = stream;
      video.play();
    }
    else if (navigator.mozGetUserMedia)
    {//FF16a, 17a
      video.src = stream;
      video.play();
    }
    else if (window.URL) video.src = window.URL.createObjectURL(stream);
    else video.src = stream;

    videoSetup();
  }

  // Set up the video recorder
  if ((typeof window === 'undefined') || (typeof navigator === 'undefined')) {
    console.log('This page needs a Web browser with the objects window.* and navigator.*!');
  }else if (!(video && outputCanvas)) {
    console.log('HTML context error!');
  }else{
    console.log('Get user media…');
    if (navigator.getUserMedia) navigator.getUserMedia({video:true}, gotStream, noStream);
    else if (navigator.oGetUserMedia) navigator.oGetUserMedia({video:true}, gotStream, noStream);
    else if (navigator.mozGetUserMedia) navigator.mozGetUserMedia({video:true}, gotStream, noStream);
    else if (navigator.webkitGetUserMedia) navigator.webkitGetUserMedia({video:true}, gotStream, noStream);
    else if (navigator.msGetUserMedia) navigator.msGetUserMedia({video:true, audio:false}, gotStream, noStream);
    else console.log('getUserMedia() not available from your Web browser!');
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

    var move = function(e) {
      var offset = $canvas.offset();
      x = e.clientX - offset.left;
      y = e.clientY - offset.top;
    };

    $canvas
      .mousedown(function(e) {
        if (interval) clearInterval(interval);
        move(e);
        interval = setInterval(function() {
          ctx.arc(x,y,size,0,2*Math.PI);
          ctx.fill();
        }, 300);
      })
      .mouseup(function() {
        if (interval) clearInterval(interval);
        interval = null;
      })
      .mouseenter(function() { hover = true; })
      .mouseleave(function() { hover = false; })
      .mousemove(function(e) {
        move(e);
      });
  };

  $('#stop').click(stop);
});

