// Browser MQTT client over WebSocket to HiveMQ public broker
const MQTT_WS = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC = 'senai/iot/dh11';

let client;
let chart;
const labels = [];
const dataTemp = [];
const dataUmid = [];
+
function initChart() {
  const canvas = document.getElementById('grafico');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Temperatura (°C)', data: dataTemp, borderColor: '#e74c3c', fill: false },
        { label: 'Umidade (%)', data: dataUmid, borderColor: '#3498db', fill: false }
      ]
    },
    options: { animation: false, responsive: true }
  });
}

function connectMqtt() {
  client = mqtt.connect(MQTT_WS);

  client.on('connect', () => {
    console.log('Conectado ao broker MQTT (WS)');
    client.subscribe(TOPIC, (err) => { if (err) console.error('Subscribe error:', err); });
  });

  client.on('error', (err) => console.error('MQTT error:', err));

  client.on('message', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      const time = new Date().toLocaleTimeString();

      labels.push(time);
      dataTemp.push(data.temperatura);
      dataUmid.push(data.umidade);

      if (labels.length > 20) { labels.shift(); dataTemp.shift(); dataUmid.shift(); }
      if (chart) chart.update();
      if (typeof window.updateSensorData === 'function') window.updateSensorData(parseFloat(data.temperatura), parseFloat(data.umidade));
    } catch (e) {
      console.error('Invalid MQTT message payload:', message.toString());
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  chart = initChart();
  connectMqtt();
});
