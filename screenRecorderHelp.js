
var video = -1;
function srmediaGetVideo(){
    video = document.getElementById('srvvideo');
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

async function srrecordStream( streaming=false, sendingIdvalue=-1, resBase = {} ) {
  let stream = undefined;
  var setMed = { audio: false, video: false, };
  if( settingsMedSer['audio'] != 0 ){
    setMed['audio'] = {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: settingsMedSer['audio']
    };
  }
  

  try{
    let screenStream = await captureScreen({
      frameRate: settingsMedSer['frameRate']
    });

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
                resBase['chunk'] = reader.result.substring(37);
                sOutSend(JSON.stringify( resBase ));
                
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

function srstopRecording() {
  if( recorder != undefined )
    recorder.stream.getTracks().forEach(track => track.stop())
}




class screenRecorderHelper{
  constructor( streaming ){
    this.streaming = streaming;
    this.status = undefined;
    this.statusErr = '';
    this.sender = ''
    this.settings = {};
    this.chkStatus();
    this.res = {
        'topic':'dziHarv/screen',
        'sender': this.sender,
        'chunk': '',
        'tUpdate':0
    }; 
  }

  chkStatus=()=>{

  }

  options= () =>{
    
    
    
    return `

<div class="ui-field-contain">
    <label for="scrRecframeRate">Frame rate:</label>
    <input type="text" name="scrRecframeRate" id="scrRecframeRate" value="12">     
</div>

<div class="ui-field-contain">
    <label for="scrRecaudio">Audio:</label>
    <select name="scrRecaudio" id="scrRecaudio">
        <option value="0">no audio</option>
        <option value="22050">22050</option>
        <option value="44100">44100</option>
    </select>   
</div>
    
    `;
  }

  start=( sender )=>{

    console.log('scrRec ', this.settings );
    settingsMedSer = this.settings;

    this.sender = sender;
    this.res['sender'] = this.sender;
    let res = srrecordStream(
      this.streaming,
      sender,
      this.res
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
    srstopRecording();

  }

}

export { screenRecorderHelper, srmediaGetVideo, srrecordStream, srstopRecording }