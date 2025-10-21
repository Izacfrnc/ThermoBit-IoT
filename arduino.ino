delay(200);
#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
    Serial.begin(9600);
    dht.begin();
}

void loop() {
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

    delay(2000); // 2 seconds between readings
}