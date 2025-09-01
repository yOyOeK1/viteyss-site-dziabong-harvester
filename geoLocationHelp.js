
class geoLocationHelper{


    constructor( streaming ){
        this.streaming = streaming;
        this.status = undefined;
        this.statusErr = '';
        this.sender = '';
        this.chkStatus();
        this.res = {
            'topic':'dziHarv/geolocation',
            'sender': this.sender,
            'lat':0.00,
            'lon':0.00,
            'accuracy': 0.00,
            'tUpdate':0
        };
    }

    chkStatus=()=>{
        if (!navigator.geolocation) {
            this.status = true;
        } else {
            this.status = false;
            this.statusErr = 'geoLocationHelper [E] no navigator.getlocation';
        }

    }

    start=( sender )=>{
        this.sender = sender;
        this.res['sender'] = this.sender;
        this.geoLocationQuery( );
    }

    stop=()=>{

    }

    geoLocSuccess = ( position )=>{
        if( this.streaming ){

            this.res['lat'] = position.coords.latitude;
            this.res['lon'] = position.coords.longitude;
            this.res['accuracy'] = position.coords.accuracy;
            this.res['tUpdate'] = Date.now();
            sOutSend(JSON.stringify( this.res ));
                
            this.geoLocationQuery();
        
        }

    } 
    
    geoLocError = () => {
        this.status = false;
        this.statusErr = 'Can\'t get location';

    }


    geoLocationQuery=()=>{
        navigator.geolocation.getCurrentPosition(
            this.geoLocSuccess, 
            this.geoLocError,
            {
                maximumAge: 0,
                timeout: 5000,
                enableHighAccuracy: true
        });

        
  }


}

export { geoLocationHelper }