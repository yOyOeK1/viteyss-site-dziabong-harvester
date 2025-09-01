
class weakLockHelper{


    constructor( streaming, dziHarvO ){
        this.streaming = streaming;
        this.dziHarvO = dziHarvO;
        this.status = true;
        this.statusErr = '';
        this.sender = '';
        this.res = {
            'topic':'dziHarv/weakLock',
            'sender': this.sender,
            'weakLockRelease':true,
            'tUpdate':0
        };
        this.interval = undefined;
        this.weakLock = -1;
        this.weakLockRelease = true;
    }

    start=( sender )=>{
        this.sender = sender;
        this.res['sender'] = sender;
        this.status = true;

        const requestWakeLock = async () => {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => {
                    console.log('Screen Wake Lock released:', this.wakeLock.released);
                    this.weakLockRelease = this.wakeLock.released;
                    this.res['tUpdate'] = Date.now();
                    this.res['weakLockRelease'] = this.wakeLock.released;
                    sOutSend(JSON.stringify( this.res ));
                });
                console.log('Screen Wake Lock acquired:', this.wakeLock.released);
                this.weakLockRelease = this.wakeLock.released;
                this.res['tUpdate'] = Date.now();
                this.res['weakLockRelease'] = this.wakeLock.released;
                sOutSend(JSON.stringify( this.res ));
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
                this.weakLockRelease = true;
                this.res['tUpdate'] = Date.now();
                this.res['weakLockRelease'] = this.wakeLock.released;
                sOutSend(JSON.stringify( this.res ));
            }
        };
        requestWakeLock();        
        
    }

    stop=()=>{
        this.status = false;
        try{
            this.wakeLock.release();
            this.weakLock = -1;
        }catch(e){
            this.status = 'erorr';
        }
    }


    updateIt = ()=>{
        if( this.streaming ){
            let tn = Date.now();
            this.res['time'] = tn;
            this.res['tUpdate'] = tn;
            //sOutSend(JSON.stringify( this.res ));
            this.dziHarvO.sendDataToWs( this.res );
            
        }

    } 
  

}

export { weakLockHelper }