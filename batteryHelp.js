
class batteryHelper{


    constructor( streaming, dziHarvO ){
        this.streaming = streaming;
        this.dziHarvO = dziHarvO;
        this.status = undefined;
        this.statusErr = '';
        this.sender = '';
        this.battery = -1;
        this.res = {
            'topic':'dziHarv/battery',
            'sender': this.sender,
            'ev':'',
            'charging':false,
            'chargingIn':0,
            'dischargeIn':0,
            'level':0,
            'tUpdate':0
        };
        this.chkStatus();
        
    }

    chkStatus=()=>{

        if ('getBattery' in navigator) {
           this.statusErr = 'ok API';
           this.status = true;
           
        } else {
            this.statusErr = 'The Battery Status API is not supported on ' +
                'this platform.';
            this.status = false;
            //console.error(this.statusErr);
        }


    }

    start=( sender )=>{
        this.sender = sender;
        this.res['sender'] = sender;
        this.status = true;
        
        if ('getBattery' in navigator) {
            navigator.getBattery().then( this.onBattery );
        }
        
    }

    stop=()=>{
        
        this.battery.removeEventListener('levelchange',
            this.updateIt.bind(null, this.battery, 'level'));
        this.battery.removeEventListener('chargingchange',
            this.updateIt.bind(null, this.battery, 'plug'));
        this.battery.removeEventListener('dischargingtimechange',
            this.updateIt.bind(null, this.battery, 'disTime'));
        this.battery.removeEventListener('chargingtimechange',
            this.updateIt.bind(null, this.battery, 'charTime'));
        this.status = false;
    }

    updateIt = ( battery, ev )=>{
        if( this.streaming ){
            let tn = Date.now();
            this.res['ev'] = ev;
            this.res['charging'] = battery.charging ? true : false;
            this.res['chargingIn'] = battery.chargingTime;
            this.res['dischargeIn'] = battery.dischargingTime;
            this.res['level'] = battery.level*100;
            this.res['tUpdate'] = tn;
            //sOutSend(JSON.stringify( this.res ));
            this.dziHarvO.sendDataToWs( this.res );
            
        }

    } 
    onBattery = ( battery ) =>{
        this.battery = battery;
        battery.addEventListener('levelchange',
            this.updateIt.bind(null, this.battery, 'level'));
        battery.addEventListener('chargingchange',
            this.updateIt.bind(null, this.battery,  'plug'));
        battery.addEventListener('dischargingtimechange',
            this.updateIt.bind(null, this.battery,  'disTime'));
        battery.addEventListener('chargingtimechange',
            this.updateIt.bind(null, this.battery,  'charTime'));

    } 

  

}

export { batteryHelper }