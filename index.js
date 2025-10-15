// index.js
const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
const mqtt = require('mqtt');

const port = new SerialPort({path: 'COM5', baudRate: 9600});
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');
const topic = "senai/iot/dh11";

client.on('connect', () => {
    console.log('Connected to MQTT broker');
});

parser.on('data', (line) => {
    try {
        const data = JSON.parse(line.trim());
        console.log('Received data from serial:', data);

        client.publish(topic, JSON.stringify(data));
        console.log('Published to MQTT topic:', topic, data);
    } catch (error) {
        console.error('Error parsing serial data:', error);
    }
});