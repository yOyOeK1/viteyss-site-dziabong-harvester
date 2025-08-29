<style>
.vuecamcon{

}

.camContRad span{
    display: block;
}
.camContRad input{
    display: inline;
}

.ui-mobile label.cRangeLlabel{
    display: inline;
}

</style>
<template>
    <button @click="refreshSettings()">refresh</button>
    {{ resultMsg }}
    <li v-for="(item, index) in listKeys"
        class="ui-field-contain" >

    

        <label v-if=" list[item].step != undefined"
                :for="'camCon'+item">{{ item }}:</label>
        <input v-if=" list[item].step != undefined"
            @change="changeOfByKey(item)" type="range" 
            :id="'camCon'+item"
            :min="list[item].min" 
            :max="list[item].max" 
            :value="settings[ item ]" 
            :step="list[item].step ? list[item].step : 0.01"
            >

        
        <li v-if=" Array.isArray( list[item] ) && list[item].length > 1 "
            class="ui-field-contain camContRad">

            
            
            <fieldset 
                :id="item+'g'"
                data-role="controlgroup" data-type="horizontal" data-mini="true">
                
                <label :for="item+'g'">{{ item }}:</label>
                
                <span v-for="(aitem, aindex) in list[item]" style="display:block;">
                    <input @click="changeOfByKey(item, aitem)"
                    type="radio" 
                    :name="item"
                    :id="item+'_'+aitem"
                    :value="aitem"
                    :checked=" settings[ item ] == aitem ? true : false "                       
                    >
                    <label :for="item+'_'+aitem" 
                        class="cRangeLlabel">{{ aitem }}</label>


                </span>

        
            </fieldset>

        </li>
                
        

    </li>

    
</template>

<script>
import { ref } from 'vue';

async function myapplyConstraints( tra, v ){
    await tra.applyConstraints( v );
    return 1;
}


export default{

    data(){
        let video = ref(-1);
        let list = {};
        let listKeys = [];
        let settings = [];
        let resultMsg = ref('vue - camera controls');

        return {
            video, list, listKeys, resultMsg
        };
    },
    methods:{
        changeOf( whatIs ){
            console.log(' capabi changeOf ',whatIs);
        },
        changeOfByKey( listKey, vIn = undefined ){
            let v = ( vIn != undefined ) ? vIn: $('#camCon'+listKey).val();
            
            console.log(' capabi changeOfByKey ', listKey,v);
            let vidtra = this.video.srcObject.getVideoTracks();
            let tra = vidtra[0];
            let ts = {};
            ts[ listKey ] = parseFloat(v);
            myapplyConstraints(tra, ts);

        },

        haveList( listOf, settings ){
            console.log( 'listOf ',listOf, '\n\nsettings\n\n',settings);
            this.list = listOf;
            this.settings = settings;
            this.listKeys = Object.keys( listOf );
        },

        refreshSettings(){
            console.log('click');
            this.video = document.getElementById('vvideo');
            if( this.video.srcObject ){

                let vidtra = this.video.srcObject.getVideoTracks();
                let tra = vidtra[0];
                
                let capa = tra.getCapabilities();
                console.log(' capabi ',capa);
                let sett = tra.getSettings();
                console.log(' capabi settings ',sett);

                this.haveList( capa, sett );
                
                /*
                sOutSend(JSON.stringify( {
                    'topic': 'debug/capibi',
                    'debug': 'capabi',
                    'payload': JSON.stringify(sett)
                } ));

                sOutSend(JSON.stringify( {
                    'topic': 'debug/capibi',
                    'debug': 'capabi',
                    'payload': JSON.stringify( this.video.srcObject.getAudioTracks() ),
                    'payload2': JSON.stringify( this.video.srcObject.getAudioTracks()[0].getCapabilities() )
                } ));
                */
                this.resultMsg = '';
            }else{
                console.log(' capabi ','no');
                /*sOutSend(JSON.stringify( {
                    'topic': 'debug/capibi',
                    'debug': 'capabi',
                    'payload': 'no'
                } ));*/
                this.resultMsg = 'No setting in this stream';
                //this.haveList( 
                //    JSON.parse('{"aspectRatio":{"max":4000,"min":0.00033422459893048126},"colorTemperature":{"max":7000,"min":2850,"step":50},"deviceId":"6338cb7d209d7738914254e4a743e0148f57471ac9e3bfeebe6a9155d34c9210","exposureCompensation":{"max":2,"min":-2,"step":0.5},"exposureMode":["continuous","manual"],"exposureTime":{"max":10000,"min":0,"step":0},"facingMode":["environment"],"focusDistance":{"max":5,"min":0.07000000029802322,"step":0.009999999776482582},"focusMode":["manual","single-shot","continuous"],"frameRate":{"max":30,"min":0},"groupId":"fdeb1564495f6eec3d28b5d27a0213236d7c034a366641e86e1696f9fcd6c26b","height":{"max":2992,"min":1},"iso":{"max":3200,"min":50,"step":1},"resizeMode":["none","crop-and-scale"],"torch":true,"whiteBalanceMode":["continuous","manual"],"width":{"max":4000,"min":1},"zoom":{"max":6,"min":1,"step":0.1}}'), 
                //    JSON.parse('{"aspectRatio":0.75,"colorTemperature":0,"deviceId":"e3de1e332f47e89501a26a4ffd530e1de07f07be957771dcac7666972d318fc2","exposureCompensation":0,"exposureMode":"continuous","exposureTime":0,"facingMode":"environment","focusDistance":0,"focusMode":"continuous","frameRate":30,"groupId":"2ed2a7fc6b94043ae9b010036fd6127947a054079a6efb8e10f587ce282c7f66","height":640,"iso":0,"resizeMode":"none","whiteBalanceMode":"continuous","width":480,"zoom":1}')
                //);
            }
        }

    }


}


</script>