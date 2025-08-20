<template>
    hello dzihar - status
    {{ DH.streaming }}



    <li class="ui-field-contain" id="dowhatdzihar">

        <fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
            <legend>Stream elements:</legend>

            <input type="checkbox" name="dodziharOri" id="dodziharOri" value="1">
            <label for="dodziharOri">orientation</label>

            <input type="checkbox" name="dodziharLoc" id="dodziharLoc" value="1">
            <label for="dodziharLoc">
                location
                ({{ DH.geoLoc.status }}) [{{ geoLocSE }}]

            </label>

            <input type="checkbox" name="dodziharMedStr" id="dodziharMedStr" value="1">
            <label for="dodziharMedStr">mediaStream</label>

        </fieldset>

        </li>



    <button @click="start()" v-if="!DH.streaming">Start</button>
    <button @click="stop()" v-else>Stop</button>

</template>


<script>
import { ref,computed, reactive } from 'vue';


export default{
    data(){
        let DH = reactive( siteByKey.c_dziHarvPage.o.DH );
        let geoLocSE = ref( siteByKey.c_dziHarvPage.o.DH.geoLoc.statusErr );
        

        return { DH, streamActive: false,
            geoLocSE
         };
    },
    methods:{
        start(){
            siteByKey.c_dziHarvPage.o.DH.start({
                'ori':  $('#dodziharOri').is(':checked') ? true : false,
                'loc': $('#dodziharLoc').is(':checked') ? true : false,
                'medStr': $('#dodziharMedStr').is(':checked') ? true : false
            });
            this.update();
        },
        stop(){
            siteByKey.c_dziHarvPage.o.DH.stop();
            this.update();
        },
        update(){
            this.DH = ref( siteByKey.c_dziHarvPage.o.DH );
            let doIt = this.DH.doIt;
            $('#dodziharOri').attr('checked', doIt.ori );
            $('#dodziharLoc').attr('checked', doIt.loc );
            $('#dodziharMedStr').attr('checked', doIt.medStr );
            console.log( 'doIt',doIt.loc);

        }
     
    },

}
</script>