const nodePi = require('../../raspberryPi/nodepi-frog');
const {execSync} = require('child_process');

console.log = function(str){};

let sleeptime = 0.00002;
/**
 * create a adc object with the wished gpio pins
 * @param {number} CS
 * @param {number} CLK
 * @param {number} DIO
 * @return {object}
 */
let setup = function (CS = 17, CLK = 18, DIO = 27) {
    let adc = {};
    adc.CS = nodePi.setup(CS);
    adc.CLK = nodePi.setup(CLK);

    nodePi.direction(adc.CS, 'out');
    nodePi.direction(adc.CLK, 'out');

    adc.DIO = nodePi.setup(DIO);
    return adc;
};


let getRes = function(adc, channel = 0){

    let dat1 = 0;
    let dat2 = 0;

    nodePi.direction(adc.DIO, 'out');
    nodePi.write(adc.CS, nodePi.LOW);

    nodePi.write(adc.CLK, nodePi.LOW);
    nodePi.write(adc.DIO, nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.write(adc.CLK, nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.write(adc.CLK, nodePi.LOW);
    nodePi.write(adc.DIO, nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.write(adc.CLK, nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.write(adc.CLK, nodePi.LOW);
    nodePi.write(adc.DIO, channel === 0 ? nodePi.LOW : nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.write(adc.CLK, nodePi.HIGH);
    nodePi.write(adc.DIO, nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.write(adc.CLK, nodePi.LOW);
    nodePi.write(adc.DIO, nodePi.HIGH);
    execSync(`sleep ${sleeptime}`);

    nodePi.direction(adc.DIO, 'in');
    for(let i = 0; i < 8; i++){
        nodePi.write(adc.CLK, nodePi.HIGH);
        execSync(`sleep ${sleeptime}`);
        nodePi.write(adc.CLK, nodePi.LOW);
        execSync(`sleep ${sleeptime}`);

        console.log(JSON.stringify(adc.DIO));
        console.log((nodePi.read(adc.DIO)));
        dat1 = (dat1 << 1) | (nodePi.read(adc.DIO));
        console.log(dat1);
    }

    for(let j = 0; j < 8; j++){
        console.log(dat2);
        console.log(Number(nodePi.read(adc.DIO)));
        dat2 = dat2 | (nodePi.read(adc.DIO) << j);
        nodePi.write(adc.CLK, nodePi.HIGH);
        execSync(`sleep ${sleeptime}`);
        nodePi.write(adc.CLK, nodePi.LOW);
        execSync(`sleep ${sleeptime}`);
    }

    nodePi.write(adc.CS, nodePi.HIGH);
    nodePi.direction(adc.DIO, 'out');

    if(dat1 === dat2){
        return dat1;
    }
    else{
        return 0;
    }
};

module.exports.setup = setup;
module.exports.getResult = getRes;