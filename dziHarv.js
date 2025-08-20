import { geoLocationHelper } from "./geoLocationHelp";
import { localtimeHelper } from "./localtimeHelp";
import { medStrHelper, mediaGetVideo } from "./mediaStreamHelp";
import { motionHelper } from "./motionHelp";
import { orientationHelper } from "./orientationHelp";
import { screenRecorderHelper, srmediaGetVideo } from "./screenRecorderHelp";

class dziHarv{


    constructor(){

        this.streaming = false;
        this.sender = 'not set';

        this.SS = {
            'geoLoc': {
                'o': new geoLocationHelper( this.streaming ),
                'doIt': false,
                'desc': 'location',
            },
            'scrRec': {
                'o': new screenRecorderHelper( this.streaming ),
                'doIt': false,
                'desc': 'screen',
            },
            'medStr': {
                'o': new medStrHelper( this.streaming ),
                'doIt': false,
                'desc': 'mediaStream',
            },
            'locTim': {
                'o': new localtimeHelper( this.streaming ),
                'doIt': false,
                'desc': 'local time',
            },
            'mot':{
                'o': new motionHelper( this.streaming ),
                'doIt': false,
                'desc': 'motion'
            },
            'ori': {
                'o': new orientationHelper( this.streaming ),
                'doIt': false,
                'desc': 'orientation',
            }
        };
        

    }

    getKeysWithDesc(){
        let tr = {};
        for( let k of Object.keys(this.SS) ){
            let s = this.SS[k];
            tr[ k ] = {
                'desc': s.desc,
                'o':s.o
            };

        }
        return tr;
    }


    getStatus=()=>{
        let tr = { 'streaming': this.streaming };

        for( let k of Object.keys( this.SS ) ){
            let h = this.SS[k];
            tr[ k ] = {
                'doIt': h.doIt,
                'status': h.o.status,
                'statusErr': h.o.statusErr,
                'streaming': h.o.streaming
            };
        }
        //console.log(JSON.stringify(tr,null,3));
        return tr;
    }


    start=( doIt=undefined )=>{

        if( doIt != undefined ){
            this.doIt = doIt;
            for( let k of Object.keys( doIt ) ){
                if( k == 'sender' ){
                    this.sender = doIt[k];
                }else if( k == 'medStrSet') {
                    this.SS['medStr'].o.settings = doIt[ k ];
                 }else if( k == 'scrRecSet') {
                    this.SS['scrRec'].o.settings = doIt[ k ];

                }else {
                    this.SS[ k ].doIt = doIt[k];
                }
            }
        } 
        this.streaming = true;
        mediaGetVideo();
        srmediaGetVideo();

        for( let k of Object.keys( this.SS ) ){
            if( this.SS[ k ].doIt ){
                console.log( 'start', k, this.SS[ k ].doIt );
                this.SS[ k ].o.streaming = this.streaming;
                //this.SS[ k ].o.doItParent = this.doIt;
                this.SS[ k ].o.start( this.sender );  
            }
        }



    }

    stop=()=>{
        this.streaming = false;
        for( let k of Object.keys( this.SS ) ){
            if( this.SS[ k ].doIt ){
                console.log( 'stop', k, this.SS[ k ].doIt );
                this.SS[ k ].o.streaming = this.streaming;
                this.SS[ k ].o.stop();  
            }
        }

    }



}

export { dziHarv }