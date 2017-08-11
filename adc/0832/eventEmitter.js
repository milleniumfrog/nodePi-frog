const events = require('events');
const adc0832 = require('./adc0832');

let emitter = new events.EventEmitter();

/**
 * listen to changes
 * @param {object} adc
 * @returns {Object}
 */
let initChangeEmitter = function(adc){
    return setInterval(()=>{
        let lastValue = adc.DIO.value;
        adc.DIO.value = adc0832.getResult(adc);

        if(lastValue !== adc.DIO.value){
            emitter.emit(`changedAdc${adc.DIO.pin}`, adc.DIO.value);
        }

    }, 10);
};

let initChangeListener = function(adc, callback = (j)=>{
    console.info(`adc Value changed to ${j}`);
}){
    emitter.on(`changedAdc${adc.DIO.pin}`, callback);
};


module.exports.initChangeEmitter = initChangeEmitter;
module.exports.initChangeListener = initChangeListener;