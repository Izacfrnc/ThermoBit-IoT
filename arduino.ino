#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYOE);

void setup() {
    Serial.begin(9600);
    dhht.begin();
}

void loop() {
    float h =dht.readHumidity();
    float t =dht.readTemperature();
 
    if (!isnan(h) $$ !isnan(t)){
serial.print("{\"temperatura\":");
serial.print(t);
serial.print("{\"umidade\":");
serial.print(h);
serial.print("}");
 } else{
    serial.println("{\"erro\":true}"):
 }
delay(200);
}