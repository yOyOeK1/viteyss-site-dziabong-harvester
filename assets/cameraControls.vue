<style>
.vuecamcon{

    

}

</style>
<template>
    <button @click="refreshSettings()">refresh</button>
    {{ resultMsg }}
    <div v-for="(item, index) in listKeys" class="vuecamcon">
        <table style="width:100%">

            <tr v-if=" list[item].step ">
                <td class="cRangeName" style="width:50%">
                    {{ item }}:
                </td>
                <td class="cRange">

                    <input @change="changeOfByKey(item)" type="range" 
                    :id="'camCon'+item"
                    style="max-width:100%"
                    :min="list[item].min" 
                    :max="list[item].max" 
                    value="" 
                    :step="list[item].step ? list[item].step : 0.01"
                    >
                </td>
            </tr>

            <tr v-if=" Array.isArray( list[item] ) && list[item].length > 1 ">
                <td class="cRangeName" style="width:50%">
                    {{ item }}:
                </td>
                <td class="cRange">
                    <li class="ui-field-contain" id="dowhatdzihar">

                        <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
                            
                            <input type="button" v-for="(aitem, aindex) in list[item]"
                                @click="changeOfByKey(item, aitem)"
                                :value="aitem">

                        
                        </fieldset>
                    </li>
                    
                </td>
            </tr>

        </table>
    </div> 
    
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

        haveList( listOf ){
            console.log( 'listOf ',listOf);
            this.list = listOf;
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

                this.haveList( capa );

                /*sOutSend(JSON.stringify( {
                    'topic': 'debug/capibi',
                    'debug': 'capabi',
                    'payload': JSON.stringify(capa)
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
                this.haveList( JSON.parse('{"aspectRatio":{"max":4000,"min":0.00033422459893048126},"colorTemperature":{"max":7000,"min":2850,"step":50},"deviceId":"6338cb7d209d7738914254e4a743e0148f57471ac9e3bfeebe6a9155d34c9210","exposureCompensation":{"max":2,"min":-2,"step":0.5},"exposureMode":["continuous","manual"],"exposureTime":{"max":10000,"min":0,"step":0},"facingMode":["environment"],"focusDistance":{"max":5,"min":0.07000000029802322,"step":0.009999999776482582},"focusMode":["manual","single-shot","continuous"],"frameRate":{"max":30,"min":0},"groupId":"fdeb1564495f6eec3d28b5d27a0213236d7c034a366641e86e1696f9fcd6c26b","height":{"max":2992,"min":1},"iso":{"max":3200,"min":50,"step":1},"resizeMode":["none","crop-and-scale"],"torch":true,"whiteBalanceMode":["continuous","manual"],"width":{"max":4000,"min":1},"zoom":{"max":6,"min":1,"step":0.1}}') );
            }
        }

    }


}


</script>