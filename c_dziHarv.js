
import { mediaGetVideo, recordStream, recordScreenAndAudio, stopRecording } from "./mediaStreamHelp";
import { dziHarv } from "./dziHarv";
//import dziharStatus from './assets/dziharStatus.vue';
import cameraControls from "./assets/cameraControls.vue";
import { createApp } from 'vue';

async function setFocusCam( tra, v ){
    await tra.applyConstraints( v );
    return 1;
}


class c_dziHarvPage{

  constructor(){

    this.iconSize = 80;
    this.streaming = false;
    this.doIt = {};
    this.DH = new dziHarv();
    this.dziIterIntervalLooper = undefined;
    this.app = -1;

  }
  
  get getName(){
    return `Dzi harvester`;
    
  }
  
  
  
  get getDefaultBackgroundColor(){
    return "#ffffff";
    
  }
  
  



  mkColectStatus = () =>{
    let ks = this.DH.getKeysWithDesc();
    let tr = {};
    for( let k of Object.keys(ks) ){
      tr[ k ] = $(`#dodzihar${k}`).is(':checked') ? true : false;
    }

    if( $('#sending-id').val() != '' ){
      document.cookie = 'dziharsender='+$('#sending-id').val();
    }
    if( $('#sendingTo').val() != '' ){
      document.cookie = 'dziharsendingTo='+$('#sendingTo').val();
    }
    tr['sender'] = $('#sending-id').val()==''? Date.now() : $('#sending-id').val();
    tr['sendingTo'] = $('#sendingTo').val() == '' ? '' : $('#sendingTo').val();


    return tr;
  }

  mkToogleButtons = () =>{
    let ks = this.DH.getKeysWithDesc();
    let tr = `
    <li class="ui-field-contain" id="dowhatdzihar">

        <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
          <h3>Select streams:</h3>
          
          `;
    for( let k of Object.keys(ks) ){
      let s = ks[k];
      let extra = '';
      if( s.o.options ) extra = '</fieldset></li>'+s.o.options()+'<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">';
      
      tr+= `
        <input type="checkbox" name="dodzihar${k}" id="dodzihar${k}" value="1">
        <label for="dodzihar${k}">${s.desc}</label>
        ${extra}
      `;
      
    }      
    
    tr+=`</fieldset></li>`;
    
    return tr;

  }


  getHtml = () => {
    let sendingId = getCookie('dziharsender');
    let sendingTo = getCookie('dziharsendingTo');

    return `
    <link rel="stylesheet" href="${this.homeUrl}dziHarv.css">
    <!--
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
-->
${this.mkToogleButtons()}

<video id="srvvideo" autoplay muted ></video>
<video id="vvideo" autoplay muted ></video>

<div id="dziharCamControl">dziharCamControl</div>


<input type="text" id="sending-id" placeholder="Enter an ID for this measurement" autocorrect="off" autocapitalize="off"
        value="${sendingId}">
<input type="text" id="sendingTo" placeholder="wsCID recever" autocorrect="off" autocapitalize="off"
        value="${sendingTo}">
<input type="button" id="btdziharDHStart" value="DH Start Streaming">
<input type="button" id="btdziharDHStop" value="DH Stop Streaming"><br>
<input type="button" id="btwanSetPOI" value="setPOI">


<div id="dziharDeb"></div>
    <br>
    <hr>
    <br>

    <div id="status"></div>
    
    <div class="dziharOri">
      <b>Orientation:</b> <span id="dziharOriStatus">status</span><br>

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
      <b>Location:</b> <span id="dziharLocStatus">status</span><br>

      <table style="min-width:100%">
        <tr>
          <th>lat</th><th>lon</th>
        </tr>
        <tr>
          <td id="locLat">. . .</td>
          <td id="locLon">. . .</td>
        </tr>
      </table>
      
      <b>accuracy: </b><span id="locAccuracy">3</span>
    </div>


    <div class="dziharMedia">
      <b>mediaStream:</b>
      
     
    </div>
    <br><br><br><br>
    `;

  }


  dziharIter = () =>{
    let dziO = $('#dziharDeb');
    let tr = '';

    if( this.dziIter == undefined ) this.dziIter = 0;


    if( this.DH.streaming ){
      $('#btdziharDHStart').parent().hide();
      $('#btdziharDHStop').parent().show();
      tr = `<pre>${JSON.stringify(this.DH.getStatus(),null,2)}</pre>`;

    }else{
      $('#btdziharDHStart').parent().show();
      $('#btdziharDHStop').parent().hide();


    }


    dziO.html(`<pre>iter: ${this.dziIter++}</pre>`+tr);
    
  }


  mainStart = ( doItExt = undefined )=>{
    let doIt = undefined;
    if( doItExt != undefined ){
      doIt = doItExt;
      for( let k of Object.keys( doIt ) ){
        console.log('set'+k+" to "+doIt[k]);
        $(`#dodzihar${k}`).attr('checked', doIt[k] ).checkboxradio('refresh');;
      }
    } else
      doIt = this.mkColectStatus();


    let srSet = {
      'frameRate': parseInt( $('#scrRecframeRate').val() ),
      'audio': parseInt( $('#scrRecaudio').val() )
    };
    doIt['scrRecSet'] = srSet;

    let mrSet = {
      'facingMode': $('#medstrCamfacingMode').val(),
      'frameRate': parseInt( $('#medstrCamframeRate').val() ),
      'audio': parseInt( $('#medstrCamaudio').val() )
    };
    doIt['medStrSet'] = mrSet;

    console.log('colect status ', doIt);
    this.DH.start( doIt );

    sOutSend(`wsClientIdent:`+this.DH.sender );


    setTimeout(()=>{
      this.app.refreshSettings()
    },100);


  }
  mainStop = ()=>{
    this.DH.stop();

  }

  getHtmlAfterLoad = () =>{
    cl(`${this.getName} - getHtmlAfterLoad()`);

    console.log('streaming - init ');
    //this.mkForm1();
    console.log('streaming - DONE');

    //mediaGetVideo();
    $('#btdziharStoStr').parent().hide();

    $('.dziharOri').hide();
    $('.dziharLocation').hide();
    $('.dziharMedia').hide();

    this.dziIterIntervalLooper = setInterval(()=>{this.dziharIter();},1000);

    $('#btdziharDHStart').on('click',(e)=>{ this.mainStart(); });
    $('#btdziharDHStop').on('click',(e)=>{ this.mainStop(); });


    //this.app = createApp( dziharStatus ).mount('#dziharStatus');
    this.app = createApp( cameraControls ).mount('#dziharCamControl');

    sOutSend(`wsClientIdent:`+$('#sending-id').val());


    $('#btwanSetPOI').click((e)=>{
      console.log('click');
      sOutSend(`wsSendToWSID:ocvCam:{"topic":"bt/SetPOI","sender":"noOne", "payload":"click"}`);
      sOutSend(`wsSendToWSID:b3d:{"topic":"bt/SetPOI","sender":"noOne", "payload":"click"}`);
    });


  }

  

  onPageLeft = () =>{
    //this.app.unmount();
   
    
  }

  get svgDyno(){
    return '';

  }

  svgDynoAfterLoad(){

  }

  onMessageCallBack = ( r ) => {
    cl( `[cb] ${this.getName} - got msg \n\n`+JSON.stringify(r,null,4));


    if( r.topic == 'dzihar/streamSwith' ){
      if( r.payload == 'on' ){
        this.mainStart( r.doIt );
        //this.app.update();

      } else {
        this.mainStop();
       // this.app.update();
      }

    }


  }

}

export { c_dziHarvPage };
