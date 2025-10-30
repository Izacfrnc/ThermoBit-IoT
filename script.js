const MQTT_WS = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC = 'senai/iot/dh11';
const CONTROL_TOPIC = 'senai/iot/dh11/control';

let client;
let chart;
const labels = [];
const dataTemp = [];
const dataUmid = [];
console.log('script.js loaded');
function initChart() {
  const canvas = document.getElementById('grafico');
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Temperatura (°C)', data: dataTemp, borderColor: '#cf3221ff', fill: false },
        { label: 'Umidade (%)', data: dataUmid, borderColor: '#1c81c4ff', fill: false }
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
    client.subscribe(CONTROL_TOPIC, (err) => { if (err) console.error('Subscribe control error:', err); else console.log('Subscribed to control topic'); });
  });

  client.on('error', (err) => console.error('MQTT error:', err));

  client.on('message', (topic, message) => {
    try {
      const payload = message.toString();
      if (topic === CONTROL_TOPIC) {
        // Espera mensagens como: {"fan":"ON"} ou {"fan":"OFF"}
        try {
          const s = JSON.parse(payload);
          if (s.fan) {
            updateFanUI(s.fan === 'ON');
          }
        } catch (e) {
          console.log('Control payload:', payload);
        }
        return;
      }

      const data = JSON.parse(payload);
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
  // Inicializa botão de controle
  const btn = document.getElementById('fan-toggle-btn');
  if (btn) btn.textContent = 'LIGAR VENTILADOR';
  // Initialize theme toggle (dark mode)
  const themeToggle = document.getElementById('theme-toggle');
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      if (themeToggle) themeToggle.checked = true;
      console.log('Theme initialized: dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
      if (themeToggle) themeToggle.checked = false;
      console.log('Theme initialized: light');
    }
  } catch (e) { console.warn('Could not access localStorage for theme'); }

  if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
        console.log('Theme changed to dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
        console.log('Theme changed to light');
      }
    });
  } else {
    // If toggle input isn't found (e.g. header hidden or modified), log for debugging
    console.warn('Theme toggle input (#theme-toggle) not found in DOM.');
  }
});

function updateFanUI(isOn) {
  const fanStatus = document.getElementById('fan-status');
  const fanStatusText = document.getElementById('fan-status-text');
  const fanReason = document.getElementById('fan-reason');
  const btn = document.getElementById('fan-toggle-btn');
  if (isOn) {
    fanStatus.className = 'fan-status fan-on';
    fanStatus.textContent = '● ON';
    fanStatusText.textContent = 'LIGADO';
    fanReason.textContent = 'Ventilador ligado manualmente';
    if (btn) btn.textContent = 'DESLIGAR VENTILADOR';
  } else {
    fanStatus.className = 'fan-status fan-off';
    fanStatus.textContent = '● OFF';
    fanStatusText.textContent = 'DESLIGADO';
    fanReason.textContent = 'Ventilador desligado';
    if (btn) btn.textContent = 'LIGAR VENTILADOR';
  }
}

function publishFanControl(cmd) {
  if (!client || !client.connected) return console.warn('MQTT client not connected');
  // Envia JSON: {"cmd":"FAN","value":"ON"}
  const payload = JSON.stringify({ cmd: 'FAN', value: cmd === 'FAN:ON' ? 'ON' : 'OFF' });
  client.publish(CONTROL_TOPIC, payload);
}

function toggleFanManual() {
  const btn = document.getElementById('fan-toggle-btn');
  const currentlyOn = btn && btn.textContent && btn.textContent.includes('DESLIGAR');
  if (currentlyOn) {
    publishFanControl('FAN:OFF');
  } else {
    publishFanControl('FAN:ON');
  }
}
