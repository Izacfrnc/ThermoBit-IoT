#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT11
#define FAN_PIN 3 // pino do ventilador

DHT dht(DHTPIN, DHTTYPE);

void setup() {
    Serial.begin(9600);
    dht.begin();
    pinMode(FAN_PIN, OUTPUT);
    digitalWrite(FAN_PIN, LOW); // ventilador desligado por padrão
}

void loop() {
    // Lê e envia sensor
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (!isnan(h) && !isnan(t)) {
        // Print one JSON object per line so the host can parse easily
        Serial.print("{\"temperatura\":");
        Serial.print(t, 1);
        Serial.print(",\"umidade\":");
        Serial.print(h, 1);
        Serial.println("}");
    } else {
        Serial.println("{\"erro\":true}");
    }

    // Verifica se há comando vindo pela serial (do bridge)
    if (Serial.available() > 0) {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();
        // Agora aceitamos comandos JSON simples, por exemplo:
        // {"cmd":"FAN","value":"ON"}
        // ou {"cmd":"FAN","value":"OFF"}
        if (cmd.indexOf("\"value\":\"ON\"") >= 0) {
            digitalWrite(FAN_PIN, HIGH);
            Serial.println("{\"fan\":\"ON\"}");
        } else if (cmd.indexOf("\"value\":\"OFF\"") >= 0) {
            digitalWrite(FAN_PIN, LOW);
            Serial.println("{\"fan\":\"OFF\"}");
        }
    }

    delay(2000); // 2 seconds between readings
}