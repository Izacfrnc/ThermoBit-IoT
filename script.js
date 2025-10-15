const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");
const labels = [];
const dataTemp = [];
const dataUmid = [];

const ctx = document.getElementById("grafico").getContext("2d");
const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "Temperatura (°C)",
                data: dataTemp,
                borderColor: "#a74d4dff",
                fill: false
            },
            {
                label: "Umidade (%)",
                data: dataUmid,
                borderColor: "#213e9af5",
                fill: false
            }
        ]
    }
});

client.on("connect", () => {
    console.log("Conectado ao broker MQTT");
    client.subscribe("senai/iot/dh11");
});

client.on("message", (topic, message) => {
    const data = JSON.parse(message.toString());
    const time = new Date().toLocaleTimeString();

    labels.push(time);
    tempData.push(data.temperatura);
    umidData.push(data.umidade);

    if (labels.length > 20) {
        labels.shift();
        tempData.shift();
        umidData.shift();
    }

    chart.update();
});