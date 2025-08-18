
import { mediaGetVideo,recordStream, recordScreenAndAudio,stopRecording } from "./mediaStreamHelp";



class c_dziHarvPage{

  constructor(){

    this.iconSize = 50;
    this.streaming = false;

  }
  
  get getName(){
    return `Dzi harvester`;
    
  }
  
  
  
  get getDefaultBackgroundColor(){
    return "#ffffff";
    
  }
  
  stopStream=()=>{
    this.streaming = false;
    this.media_stopRecording()
  }


  geoLocationQuery=()=>{
    if (!navigator.geolocation) {
      $('#dziharLocStatus').html("Geolocation is not supported by your browser");
    
    } else {
      $('#dziharLocStatus').html("Locating…");
      navigator.geolocation.getCurrentPosition(
        siteByKey.c_dziHarvPage.o.geoLocSuccess, 
        siteByKey.c_dziHarvPage.o.geoLocError,
        {
          maximumAge: 0,
          timeout: 5000,
          enableHighAccuracy: true
        });
    
    }

  }

  geoLocSuccess = ( position )=>{
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    $('#locLat').html( latitude );
    $('#locLon').html( longitude );
    $('#locAccuracy').html( Math.round(position.coords.accuracy)+" met." );

    if(window['wsbroadcast'] ){
      sOutSend(JSON.stringify({
        'topic':'dziHarv/geolocation',
        'lat': latitude,
        'lon': longitude,
        'accu': position.coords.accuracy,
        'positionObj': position.coords
      }));

      if( siteByKey.c_dziHarvPage.o.streaming == true )
        this.geoLocationQuery();
    }

  } 
  
  geoLocError = () => {
    $('#dziharLocStatus').html("Unable to retrive location");
  }

  mkForm1=()=>{
    //document.addEventListener('DOMContentLoaded', function(){
      //var socket = io.connect('http://<<IP>>');
      console.log('streaming - adding event listiner');
      var streaming = siteByKey.c_dziHarvPage.o.streaming;
      var status = document.getElementById('status');
      var sendingId = document.getElementById('sending-id');      
      var form = document.getElementById('enter');
      
      var startStreaming = function (e) {
        e.preventDefault();

        $('#dziharOriStatus').html('no orientation sensor');
        
        //debugger;
        siteByKey.c_dziHarvPage.o.streaming = true;
        siteByKey.c_dziHarvPage.o.geoLocationQuery();
        siteByKey.c_dziHarvPage.o.media_recordStream();
        //form.style.display='none';
        //status.className='csspinner line back-and-forth no-overlay';
        //status.style.display='block';
        document.activeElement.blur();
        window['wsbroadcast'] = $('#wsbroadcast').is(':checked') ? true : false;
    
        return false;
      };
      form.addEventListener("submit",startStreaming);



      if (window.DeviceMotionEvent !== undefined) {
        console.log('streaming - some  devices');


        window.ondevicemotion = function(e) {
          if (!siteByKey.c_dziHarvPage.o.streaming){
            //console.log('streaming - no motion');  
            return false;
          } 
          
          console.log('streaming - motion');
          ///*socket.emit('motion',
          if(window['wsbroadcast'] ){
            sOutSend(JSON.stringify({
              'topic':'dziHarv/motion',
              'sender':sendingId.value,
              'acceleration':e.accelerationIncludingGravity,
              'interval':e.interval,
              'rotationRate':e.rotationRate
            }));
          } 

        };
        window.ondeviceorientation = function(e) {
          if (!siteByKey.c_dziHarvPage.o.streaming) {
            //console.log('streaming - no orientation');
            return false;
          }
          $('#dziharOriStatus').html('orientation sensor - ok');
          
          console.log('streaming - orientation');
          ///*socket.emit('orientation', {
          if( window['wsbroadcast'] ){
            sOutSend(JSON.stringify({
              'topic':'dziHarv/orientation',
              'sender':sendingId.value,
              'alpha': e.alpha,
              'beta': e.beta,
              'gamma': e.gamma
            }));

          }

          $('#oriX').html( Math.round( e.alpha ) );
          $('#oriY').html( Math.round( e.beta ) );
          $('#oriZ').html( Math.round( e.gamma ) );
          
          let ico = parseInt( siteByKey.c_dziHarvPage.o.iconSize*0.5 );
          let to = `${ico}px ${ico}px`;
          aajs.animate('#oriCompass',{rotate:Math.round( e.alpha ),'transform-origin':to});
          aajs.animate('#oriHeel',{rotate:Math.round( e.gamma ),'transform-origin':to});
          aajs.animate('#oriPitch',{rotate:Math.round( e.beta ),'transform-origin':to});


        };
      } else {
        console.log('streaming - no devices');
        status.style.display = 'block';
        status.innerHTML = 'Unfortunately, this device does not have the right sensors.';
      }
    //});
  }


  /// --------- media stream

  media_recordStream(){
    recordStream( siteByKey.c_dziHarvPage.o.streaming );

  }
  media_recordScreenAndAudio=()=>{
    recordScreenAndAudio();

  }
  media_stopRecording(){
    stopRecording()
  }


  /// ------- media stream end 





  getHtml = () => {


    return `
    <style>
.dziharOri div{
  display:inline;
}

.dziharOri #dziharOriStatus{
  font-size:small;
}

.dziharOri img{
  width:${this.iconSize}px; 
  heigh:${this.iconSize}px;
}
        

#vvideo {
  flex: 100%;
  max-width: 128px;
  min-height: 72px;
  height: auto;
  display: block;
  background-color: black;  
  margin-bottom: 10px;
}


    </style>
    <b>${this.getName}</b><br>
    This is a npm package<br>
    viteyss-site-dziabong-harvester<br>
    <pre>
    In Menu: ${this.getName}
    Home url: ${this.homeUrl}
    Ver: ${this.instanceOf.ver}
    Dir: ??

    More ditails in \`./site.json\`
    </pre>


    <b>form1 - Phone Motion Streamer</b>
    <form id="enter">

      <label>
        <input type="checkbox" name="wsbroadcast" id="wsbroadcast" value="1">stream to webSocket
      </label>

      <input type="text" id="sending-id" placeholder="Enter an ID for this measurement" autocorrect="off" autocapitalize="off">
      <input type="submit" value="Start Streaming">
    </form>
    <input type="button" value="stop streaming" onclick="siteByKey.c_dziHarvPage.o.stopStream();">
    <div id="status"></div>
    
    <div class="dziharOri">
      orientation:
      <div id="dziharOriStatus">status</div><br>

      <div id="oriX">1</div>
      <div id="oriY">2</div>
      <div id="oriZ">3</div><br>
      
      <img src="${this.homeUrl}/assets/compass.jpeg"
      id="oriCompass"
      >
      
      <img src="${this.homeUrl}/assets/boat_front.jpeg"
      id="oriHeel"
      >
      
      <img src="${this.homeUrl}/assets/boat_site.jpeg"
      id="oriPitch"
      >
      
    </div>


    <div class="dziharLocation">
      location:
      <div id="dziharLocStatus">status</div><br>

      lat: <div id="locLat">1</div>
      lon: <div id="locLon">2</div>
      accuracy: <div id="locAccuracy">3</div>
    </div>


    <div class="dziharMedia">
      <video id="vvideo" autoplay muted></video>
      <input type="button" onclick="siteByKey.c_dziHarvPage.o.media_recordStream();" value="Record camera">
      <input type="button" onclick="siteByKey.c_dziHarvPage.o.media_recordScreenAndAudio();" value="Record Screen and audio">
      <input type="button" onclick="siteByKey.c_dziHarvPage.o.media_stopRecording();" value="Stop!">

    </div>
    <br><br><br><br>
    `;

  }

  getHtmlAfterLoad = () =>{
    cl(`${this.getName} - getHtmlAfterLoad()`);

    console.log('streaming - init ');
    this.mkForm1();
    console.log('streaming - DONE');

    mediaGetVideo();

  }

  get svgDyno(){
    return '';

  }

  svgDynoAfterLoad(){

  }

  onMessageCallBack = ( r ) => {
    cl( `[cb] ${this.getName} - got msg `);

  }

}

export { c_dziHarvPage };
