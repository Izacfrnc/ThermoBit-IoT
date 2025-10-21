const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const mqtt = require('mqtt');

// Configure these to match your environment
const SERIAL_PORT = process.env.SERIAL_PORT || 'COM5';
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600', 10);
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'senai/iot/dh11';

const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE, autoOpen: false });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('Connected to MQTT broker:', MQTT_BROKER);
});

client.on('error', (err) => {
    console.error('MQTT error:', err.message);
});

port.open((err) => {
    if (err) return console.error('Failed to open serial port:', err.message);
    console.log('Serial port opened:', SERIAL_PORT, '@', BAUD_RATE);
});

port.on('error', (err) => {
    console.error('Serial port error:', err.message);
});

parser.on('data', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
        const data = JSON.parse(trimmed);
        console.log('Received data from serial:', data);

        if (client.connected) {
            client.publish(MQTT_TOPIC, JSON.stringify(data), { qos: 0 }, (err) => {
                if (err) console.error('Publish error:', err.message);
                else console.log('Published to MQTT topic:', MQTT_TOPIC);
            });
        } else {
            console.warn('MQTT client not connected, skipping publish');
        }
    } catch (error) {
        console.error('Error parsing serial data (not JSON?):', trimmed);
    }
});