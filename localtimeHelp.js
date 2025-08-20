
class localtimeHelper{


    constructor( streaming ){
        this.streaming = streaming;
        this.status = undefined;
        this.statusErr = '';
        this.sender = '';
        this.res = {
            'topic':'dziHarv/localtime',
            'sender': this.sender,
            'time':0,
            'tUpdate':0
        };
        this.interval = undefined;
    }

    start=( sender )=>{
        this.sender = sender;
        this.res['sender'] = sender;
        this.status = true;
        this.interval = setInterval(()=>{ 
            this.updateIt() 
        },1000);
        
    }

    stop=()=>{
        clearInterval( this.interval );
        this.status = false;
    }


    updateIt = ()=>{
        if( this.streaming ){
            let tn = Date.now();
            this.res['time'] = tn;
            this.res['tUpdate'] = tn;
            sOutSend(JSON.stringify( this.res ));
            
        }

    } 
  

}

export { localtimeHelper }