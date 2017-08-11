const nodePi = require('./modules/nodepi-frog');

// before using a GPIO pin you have to setup it
let gpio20 = nodePi.setup(20);


// set direction to 'out' or 'in'
nodePi.direction(gpio20, 'out');


let value = true;

setInterval(() => {
    nodePi.write(gpio20, value);
    value = !value;
},1000);