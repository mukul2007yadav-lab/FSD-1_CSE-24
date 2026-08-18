const EventEmitter = require('events');

class DOMNode {
    constructor(name) {
        this.name = name;
        this.eventEmitter = new EventEmitter();
    }

    addEventListener(event, callback) {
        this.eventEmitter.on(event, callback);
    }

    removeEventListener(event, callback) {
        this.eventEmitter.off(event, callback);
    }

    dispatchEvent(event) {
        console.log(`Dispatching '${event.type}' event to <${this.name}>`);
        this.eventEmitter.emit(event.type, event);
    }
}

class CustomEvent {
    constructor(type, detail) {
        this.type = type;
        this.detail = detail;
        this.timeStamp = Date.now();
    }
}

const div = new DOMNode('div');

div.addEventListener('click', (e) => {
    console.log(`Click event handled! Coordinates: (${e.detail.x}, ${e.detail.y})`);
});

div.addEventListener('mouseover', (e) => {
    console.log(`Mouseover event handled! Hovered from target: ${e.detail.from}`);
});

const clickEvent = new CustomEvent('click', { x: 50, y: 100 });
div.dispatchEvent(clickEvent);

const hoverEvent = new CustomEvent('mouseover', { from: 'sidebar' });
div.dispatchEvent(hoverEvent);