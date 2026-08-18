//Event
//class of event module. EventEmitter-on(emit even parameter,callback)-register event or event listner,emit()-triiger event/create event /fire event
const EventEmitter = require('events');

class MyEvent extends EventEmitter {}

const myEvent = new EventEmitter();

myEvent.once('greet', (name) => {
    console.log(`Hello, ${name}! Welcome to Node.js events and this is event emitter.`);//tempelate literals-`${var}`
});

myEvent.once('exit', (code) => {
    console.log(`Exiting process with code: ${code}`);
});

myEvent.emit('greet', 'Mukul');
myEvent.emit('greet', 'Mukul');
myEvent.emit('greet', 'Mukul');
myEvent.emit('greet', 'Mukul');
myEvent.emit('greet', 'Mukul');
myEvent.emit('exit', 404);
myEvent.emit('exit', 404);
myEvent.emit('exit', 404);
myEvent.emit('exit', 404);
myEvent.emit('exit', 404);
myEvent.emit('exit', 404);
myEvent.emit('exit', 404);
