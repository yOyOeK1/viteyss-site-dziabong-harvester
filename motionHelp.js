
class motionHelper{


    constructor( streaming ){
        this.streaming = streaming;
        this.status = undefined;
        this.statusErr = this.chk();
        this.sender = '';
        this.res = {
            'topic':'dziHarv/motion',
            'sender': this.sender,
            'acceleration':0.00, 'interval':0.00, 'rotationRate':0.00,
            'tUpdate':0
        };
        this.interval = undefined;


    }

    initIt = () =>{
        if( this.status ){
            window.ondevicemotion = this.onDevMot;
        }
    }
    stopIt = () =>{
        if( this.status ){
            window.ondevicemotion = undefined;            
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

    onDevMot = (e) =>{
        if( this.streaming ){
            this.res['acceleration'] = [ e.accelerationIncludingGravity.x,e.accelerationIncludingGravity.y,e.accelerationIncludingGravity.z];
            this.res['interval'] = e.interval;
            this.res['rotationRate'] = e.rotationRate;
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

export { motionHelper }