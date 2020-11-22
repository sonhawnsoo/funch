#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>

ESP8266WiFiMulti WiFiMulti;

//변수선언, FSR:압력센서, LED
int FSR = 0;
int LED = 14;
int val = 0;

// WiFi 설정
#define WIFI_SSID "device lab conference"
#define WIFI_PASSWORD "devicelab"
// left 기준. right일때는 http://us-central1-touch-signage.cloudfunctions.net/widgets/funch/sy/right/
#define URL "http://us-central1-touch-signage.cloudfunctions.net/widgets/funch/sy/left/"

void setup() {
  Serial.begin(9600);
  pinMode(LED, OUTPUT);
  //초기화 시작
  Serial.println("Start init");

  // 와이파이 연결시도
  for (uint8_t t = 4; t > 0; t--) {
    Serial.printf("[SETUP] WAIT %d...\n", t);
    Serial.flush();
    digitalWrite(LED, HIGH);
    delay(50);
    digitalWrite(LED, LOW);
    delay(1000);
  }
  WiFiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);
  digitalWrite(LED, HIGH);
}

void loop() {
  // wait for WiFi connection
  Serial.println(analogRead(FSR));
  val = analogRead(FSR);

  if ((WiFiMulti.run() == WL_CONNECTED)) {
    HTTPClient http;
    Serial.print("[HTTP] begin...\n");

    //압력센서 강도가 100이상 일때 Left side api 콜
    if (val > 300) {
      String strong = String(val);
      String resUrl = String(URL + strong);

      http.begin(resUrl);
      Serial.print("[HTTP] GET...\n");
      // start connection and send HTTP header
      int httpCode = http.GET();

      // httpCode will be negative on error
      if (httpCode > 0) {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTP] GET... code: %d\n", httpCode);

        // file found at server
        if (httpCode == HTTP_CODE_OK) {
          String payload = http.getString();
          Serial.println(payload);

          //LED 깜박이기
          digitalWrite(LED, LOW);
          delay(100);
          digitalWrite(LED, HIGH);
        }
      } else {
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
      }
      http.end();
      delay(200);
    }
  }
}
