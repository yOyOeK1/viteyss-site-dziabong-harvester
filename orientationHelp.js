
class orientationHelper{


    constructor( streaming ){
        this.streaming = streaming;
        this.status = undefined;
        this.statusErr = this.chk();
        this.sender = '';
        this.res = {
            'topic':'dziHarv/orientation',
            'sender': this.sender,
            'a':0.00, 'b':0.00, 'g':0.00,
            'tUpdate':0
        };
        this.interval = undefined;


    }

    initIt = () =>{
        if( this.status ){
            window.ondeviceorientationabsolute = this.onDevOri;
        }
    }
    stopIt = () =>{
        if( this.status ){
            window.ondeviceorientationabsolute = undefined;
        }
    }


    chk=()=>{
        if (window.DeviceMotionEvent !== undefined) {
            this.status = true;
            return 'ok';
        }else{
            this.status = false;
            return 'no motion event';
        }
    }

    onDevOri = (e) =>{
        if( this.streaming ){
            this.res['a'] = e.alpha;
            this.res['b'] = e.beta;
            this.res['g'] = e.gamma;
            this.res['tUpdate'] = Date.now();
            sOutSend(JSON.stringify( this.res ));
        }
    }

    start=( sender )=>{
        this.sender = sender;
        this.res['sender'] = this.sender;
        this.initIt();        
    }

    stop=()=>{
        this.stopIt();
    }


   

}

export { orientationHelper }