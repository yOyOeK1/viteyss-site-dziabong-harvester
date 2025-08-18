
var video = -1;
function mediaGetVideo(){
    video = document.getElementById('vvideo');
}

async function captureMediaDevices(mediaConstraints = {
    video: {
      width: 1280,
      height: 720
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  }) {
  let stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  
  video.src = null
  video.srcObject = stream
  video.muted = true
  
  return stream
}

async function captureScreen(mediaConstraints = {
    video: {
      //cursor: 'always',
      resizeMode: 'crop-and-scale'
    }
  }) {
  const screenStream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
  
  return screenStream
}

let recorder = null

async function recordStream( streaming=false ) {
  let stream = await captureMediaDevices();
  video.src = null;
  video.srcObject = stream;
  video.muted = true;
  
  recorder = new MediaRecorder(stream);
  
  let chunks = [];

  recorder.ondataavailable = event => {
    if (event.data.size > 0) {
        if( streaming == true ){
            let blob = new Blob([event.data], 
              //{ type: 'video/webm'}
            );
            
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function(){
                sOutSend(JSON.stringify({
                    'topic':'dziHarv/mediaStream',
                    //data:application/octet-str30eam;base64,Q8
                    'chunk': reader.result.substring(37)
                }));
                
            };
        }

      chunks.push(event.data)
    }
  }
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: 'video/webm'
    })
    
    chunks = []
    const blobUrl = URL.createObjectURL(blob)
    
    video.srcObject = null
    video.src = blobUrl
    video.muted = false
   }
  
  recorder.start(200)
}

function stopRecording() {
 recorder.stream.getTracks().forEach(track => track.stop())
}

async function recordScreenAndAudio() {
  const screenStream = await captureScreen()
  const audioStream = await captureMediaDevices({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    },
    video: false
  })
  
  const stream = new MediaStream([...screenStream.getTracks(), ...audioStream.getTracks()])
  
  video.src = null
  video.srcObject = stream
  video.muted = true
  
  recorder = new MediaRecorder(stream)
  let chunks = []

  recorder.ondataavailable = event => {
    if (event.data.size > 0) {
      chunks.push(event.data)
    }
  }
  
  recorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: 'video/webm'
    })
    
    chunks = []
    const blobUrl = URL.createObjectURL(blob)

    video.srcObject = null
    video.src = blobUrl
    video.muted = false
   }
  
  recorder.start(200)
}


export { mediaGetVideo,recordStream, recordScreenAndAudio,stopRecording }