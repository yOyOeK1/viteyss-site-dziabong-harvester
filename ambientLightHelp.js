
class ambientLightHelper{


    constructor( streaming ){
        this.streaming = streaming;
        this.status = undefined;
        this.statusErr = '';
        this.sender = '';

        this.sensor = undefined;
        if ("AmbientLightSensor" in window) {
            this.sensor =new AmbientLightSensor();
            this.sensor.addEventListener("reading",(e)=>{
                this.res['ill'] = e.illuminance;
                this.res['tUpdate'] = Date.now();
                sOutSend(JSON.stringify( this.res ));
            });
            this.sensor.addEventListener("error", (event) => {
                console.log(event.error.name, event.error.message);
            });
        }

        this.res = {
            'topic':'dziHarv/ambientlight',
            'sender': this.sender,
            'ill':0,
            'tUpdate':0
        };
        this.interval = undefined;
    }



    start=( sender )=>{
        if( this.sensor == undefined ) return 1;
        this.sender = sender;
        this.res['sender'] = sender;
        this.status = true;
        this.sensor.start();
        //this.interval = setInterval(()=>{ 
        //    this.updateIt() 
        //},1000);
        
    }

    stop=()=>{
        if( this.sensor == undefined ) return 1;
        this.sensor.stop();
        this.status = false;
    }


    updateIt = ()=>{
        
    } 
  

}

export { ambientLightHelper }