
var video = -1;
function mediaGetVideo(){
    video = document.getElementById('vvideo');
}

var settingsMedSer = {};

async function captureMediaDevices(mediaConstraints = {
    video: {
      //facingMode: 'user', // selfy
      //facingMode: 'environment', // back
      //facingMode: settingsMedSer['facingMode'],
      frameRate: settingsMedSer['frameRate'],
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

async function recordStream( streaming=false, sendingIdvalue=-1, resForWsBase = {} ) {
  let stream = undefined;
  try{
    
    var setMed = {
      audio: false,
      video: false,
    };
    
    
    if( settingsMedSer['audio'] != 0 ){
      setMed['audio'] = {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: settingsMedSer['audio']
      };
    }
    
    if( settingsMedSer['facingMode'] == 'user' || settingsMedSer['facingMode'] == 'environment' ){
      setMed['video'] = {
        //facingMode: 'user', // selfy
        //facingMode: 'environment', // back
        frameRate: settingsMedSer['frameRate'],
        width: 1280,
        height: 720
      };
      
    }
    
    if( String( settingsMedSer['facingMode'] ).substring(0,4) == 'dID:' ){
      setMed['video'] = {'deviceId' : String( settingsMedSer['facingMode'] ).substring(4) };
      
    }else{
      setMed['video'] = {'facingMode' : settingsMedSer['facingMode']};
    }


    if( settingsMedSer['facingMode'] == 'screen' ){
      let screenStream = await captureScreen()


      let audioStream = -1;
      if( settingsMedSer['audio'] != 0 ){
        audioStream = await captureMediaDevices({
          audio: setMed['audio'],
          video: false
        });
        stream = new MediaStream([...screenStream.getTracks(), ...audioStream.getTracks()]);

      }else{
        stream = new MediaStream([...screenStream.getTracks()]);
        
      }
      
      
      
    }else{
      //stream = await captureMediaDevices( setMed );
      console.log('set media',setMed);
      stream = await navigator.mediaDevices.getUserMedia(setMed);
    }
    
    
    
    
    
    
    
  }catch(e){
    console.error('[e] can\'t get media device to capture ',e);
    return 10;
  }
  video.src = null;
  video.srcObject = stream;
  video.muted = true;
  
  let vidtra = video.srcObject.getVideoTracks();
  let tra = vidtra[0];

  let capa = tra.getCapabilities();
  console.log(' capabi ',capa);



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
              resForWsBase['chunk'] = reader.result.substring(37);
                sOutSend(JSON.stringify( resForWsBase ));
                
            };
        }

      //chunks.push(event.data)
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
  if( recorder != undefined )
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
      //chunks.push(event.data)
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

async function getCamerasIds(){

  let tr = [];
  //$('#medstrCamfacingMode').append('<option value="no3">no video3</option>');
  //$('#medstrCamfacingMode').append('<option value="screen" selected>Screeen</option>').selectmenu("refresh");
  $('#medstrCamfacingMode').append('<option value="user">cam - selfy</option>');
  $('#medstrCamfacingMode').append('<option value="environment">cam - front</option>');
  $('#medstrCamfacingMode').append('<option value="no">no video</option>').selectmenu("refresh");
  
  let camList = await navigator.mediaDevices.enumerateDevices().then((camList)=>{

    /*sOutSend(JSON.stringify({
      'topic':'dziHarv/mediaStream/Debug',
      //data:application/octet-str30eam;base64,Q8
      'sender':'debug',
      'toDeb': camList
    }));*/
    for( let i=0,ic=camList.length; i<ic; i++){
      let dev = camList[i];
      console.log('get cameras ids got ',dev);
      if( dev.kind == 'videoinput' ){
        $('#medstrCamfacingMode').append(`<option value="dID:${dev.deviceId}">${dev.label}</option>`);
        //tr.push( dev );
      }
    }
    
    
    
    
  });

}


class medStrHelper{
  constructor( streaming ){
    this.streaming = streaming;
    this.status = undefined;
    this.statusErr = '';
    this.sender = ''
    this.settings = {};
    this.chkStatus();
    this.res = {
        'topic':'dziHarv/mediaStream',
        'sender': this.sender,
        'chunk': '',
        'tUpdate':0
    }; 
  }

  chkStatus=()=>{

  }

  options= () =>{
    


    
    setTimeout(()=>{getCamerasIds();}, 500);
    
    return `
<div class="ui-field-contain">
    <label for="medstrCamfacingMode">Camera:</label>
    <select name="medstrCamfacingMode" id="medstrCamfacingMode">
        <!--<option value="user">Selfy</option>
        <option value="environment">Main / front</option>
        <option value="screen">Screeen</option>
        <option value="no">no video</option>-->
    </select>
</div>

<div class="ui-field-contain">
    <label for="medstrCamframeRate">Frame rate:</label>
    <input type="text" name="medstrCamframeRate" id="medstrCamframeRate" value="30">     
</div>

<div class="ui-field-contain">
    <label for="medstrCamaudio">Audio:</label>
    <select name="medstrCamaudio" id="medstrCamaudio">
        <option value="0">no audio</option>
        <option value="22050">22050</option>
        <option value="44100">44100</option>
    </select>   
</div>
    
    `;
  }

  start=( sender )=>{

    console.log('medStr ', this.settings );
    settingsMedSer = this.settings;

    this.sender = sender;
    this.res['sender'] = this.sender;
    let res = recordStream(
      this.streaming,
      sender, this.res
    );
    res.then((res)=>{
      if( res == 10 ){
        this.status = false;
        this.statusErr = 'no capturing device';
      }else{
        this.status = true;
        this.statusErr = 'recording';
      }
    });

  }

  stop=()=>{
    stopRecording();

  }

}

export { medStrHelper, mediaGetVideo,recordStream, recordScreenAndAudio,stopRecording }