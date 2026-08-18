console.log('--- Program Start ---');

setTimeout(() => {
    console.log('1. setTimeout executed (Timer Phase)');
}, 0);

setImmediate(() => {
    console.log('2. setImmediate executed (Check Phase)');
});

process.nextTick(() => {
    console.log('3. process.nextTick executed (Microtask Queue)');
});

Promise.resolve().then(() => {
    console.log('4. Promise.resolve executed (Microtask Queue)');
});

console.log('--- Program End ---');