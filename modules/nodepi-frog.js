const fs = require('fs');
const {execSync} = require('child_process');
const events = require('events');
let emitter = new events.EventEmitter();


const HIGH = true;
const LOW = false;


module.exports.HIGH = true;
module.exports.LOW = false;

module.exports.OUT = 'out';
module.exports.IN = 'in';

/**
 * init the pin before using it
 * @param {number} pinNumber
 */
let setup = function(pinNumber){


    if(fs.existsSync(`/sys/class/gpio/gpio${pinNumber}`)){
        console.log(`unexport the pin ${pinNumber}`);
        let unexportGPIO = `echo "${pinNumber}" > /sys/class/gpio/unexport`;
        execSync(unexportGPIO);
    }


    console.log(`export the pin ${pinNumber}`);
    let exportGPIO = `echo "${pinNumber}" > /sys/class/gpio/export`;
    execSync(exportGPIO);

    console.log(`exported the pin ${pinNumber}`);
    return {
        pin: pinNumber,
        direction: undefined,
        value: undefined,
        event: undefined
    };
};

/**
 * set the direction for the gpio pin
 * @param {object} gpio
 * @param {string} direction
 */
let direction = function(gpio, direction = 'out'){

    if(gpio === null || gpio.pin === undefined){
        throw new Error('gpio pin is not initialized');
    }

    if(gpio.direction === undefined){
        console.log(`set the direction for the pin ${gpio.pin} first time`);
        let firstDirection = `echo "${direction}" > /sys/class/gpio/gpio${gpio.pin}/direction`;
        execSync(firstDirection);

        gpio.direction = direction;

    }
    else{
        console.log(`the pin ${gpio.pin} had the direction ${gpio.direction}`);
        console.log(`set the direction for the pin ${gpio.pin}`);
        let direct = `echo "${direction}" > /sys/class/gpio/gpio${gpio.pin}/direction`;
        execSync(direct);

        gpio.direction = direction;

    }
};

/**
 * write the value to a pin
 * @param {object} gpio
 * @param {boolean} value
 */
let write = function(gpio, value = true){

    if(!fs.existsSync(`/sys/class/gpio/gpio${gpio.pin}/direction`)){
        throw new Error('you cannot write to a pin that has not the direction "out"');
    }

    if(gpio.direction !== 'out'){
        throw new Error('you cannot write to a pin that has not the direction "out"');
    }

    if(typeof(value) === "boolean"){

        if(value){
            console.log(`set the pin ${gpio.pin} value to 1`);
            let setValue = `echo "1" > /sys/class/gpio/gpio${gpio.pin}/value`;
            execSync(setValue);

            gpio.value = value;

        }
        else{
            console.log(`set the pin ${gpio.pin} value to 0`);
            let setValue = `echo "0" > /sys/class/gpio/gpio${gpio.pin}/value`;
            execSync(setValue);

            gpio.value = value;

        }

    }
    else{
        throw Error(`the parameter value should be from the type boolean but got ${typeof(value)}`)
    }

};

/**
 * read the Input of a gpio pin
 * @param {object} gpio
 * @param {boolean} invert
 */
let read = function(gpio, invert = false){

    if(!fs.existsSync(`/sys/class/gpio/gpio${gpio.pin}/direction`)){
        throw new Error('you cannot read a pin that has not the direction "in"');
    }

    if(gpio.direction !== 'in'){
        throw new Error('you cannot read a pin that has not the direction "in"');
    }

    if(invert){
        gpio.value = Number(fs.readFileSync(`/sys/class/gpio/gpio${gpio.pin}/value`)) === 1 ? LOW : HIGH;
    }
    else {
        gpio.value = Number(fs.readFileSync(`/sys/class/gpio/gpio${gpio.pin}/value`)) === 1 ? HIGH : LOW;
    }
};

/**
 * init the Eventlistener
 * @param {object} gpio
 * @param {boolean} invert
 * @returns {Object}
 */
let initChangeEmitter = function(gpio, invert = false){
  return setInterval(function(){
      let lastValue = Number(gpio.value);
      read(gpio, invert);

      if(lastValue !== Number(gpio.value)){
           emitter.emit(`changedGPIO${gpio.pin}`, gpio.value);
      }

  }, 10);
};

/**
 * listen to changes
 * @param {object} gpio
 * @param {function} callback
 */
let initChangeListener = function(gpio, callback = (j)=>{
    console.log(`on pin ${gpio.pin} it has the value ${j}`);
}){
    emitter.on(`changedGPIO${gpio.pin}`, callback);
};

/**
 * destroy the interval of initChangeEmitter
 * @param interval
 */
let destroyChangeEmitter = function(interval){
    clearInterval(interval);
};




module.exports.setup = setup;
module.exports.direction = direction;
module.exports.write = write;
module.exports.read = read;
module.exports.initChangeEmitter = initChangeEmitter;
module.exports.initChangeListener = initChangeListener;
module.exports.destroyChangeEmitter = destroyChangeEmitter;