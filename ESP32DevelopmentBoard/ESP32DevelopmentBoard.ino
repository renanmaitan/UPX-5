// This example uses an ESP32 Development Board
// to connect to shiftr.io.
//
// You can check on your device after a successful
// connection here: https://www.shiftr.io/try.
//
// by Joël Gähwiler
// https://github.com/256dpi/arduino-mqtt

#include "WiFiEsp.h" //INCLUSÃO DA BIBLIOTECA
#include "SoftwareSerial.h"//INCLUSÃO DA BIBLIOTECA
#include <MQTT.h>
#include <ArduinoJson.h> // Inclua a biblioteca ArduinoJson

SoftwareSerial Serial1(6, 7); //PINOS QUE EMULAM A SERIAL, ONDE O PINO 6 É O RX E O PINO 7 É O TX

char ssid[] = "Antonioli"; //VARIÁVEL QUE ARMAZENA O NOME DA REDE SEM FIO
char pass[] = "996022174";//VARIÁVEL QUE ARMAZENA A SENHA DA REDE SEM FIO
char servidorMQTT[] = "ec2-3-145-170-167.us-east-2.compute.amazonaws.com"; //conexão MQTT
double tempo = 0.05; //tempo em minutos para dar publish

WiFiEspClient net;
MQTTClient client;

unsigned long lastMillis = 0;
void connect() {
  Serial.print("checking wifi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nconnecting...");
  while (!client.connect("arduino")) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nconnected!");

  client.subscribe("mqtt/request");
  // client.unsubscribe("/hello");
}

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);
  
  // Verifica se o tópico recebido é o "mqtt/request"
  if (topic == "mqtt/request") {
    // Faça o processamento necessário para a mensagem recebida
    // Exemplo: Verificar o conteúdo da mensagem e executar ações correspondentes
    
    // Exiba a mensagem no Serial do Arduino
    Serial.println("Received message from mqtt/request: " + payload);
  }
  // Note: Do not use the client in the callback to publish, subscribe or
  // unsubscribe as it may cause deadlocks when other things arrive while
  // sending and receiving acknowledgments. Instead, change a global variable,
  // or push to a queue and handle it in the loop after calling `client.loop()`.
}

void setup() {
  Serial.begin(9600);
  Serial1.begin(9600); //INICIALIZA A SERIAL PARA O ESP8266
  WiFi.init(&Serial1); //INICIALIZA A COMUNICAÇÃO SERIAL COM O ESP8266
  WiFi.config(IPAddress(192,168,1,110)); //COLOQUE UMA FAIXA DE IP DISPONÍVEL DO SEU ROTEADOR
  WiFi.begin(ssid, pass);
  pinMode(A2, INPUT);
  pinMode(A1, INPUT);
  client.begin(servidorMQTT, net);
  client.onMessage(messageReceived);

  connect();
}

void loop() {
  double umidadeLeitura = analogRead(A2);
  double tensao;
  tensao = umidadeLeitura*(5.0/1023.0);
  double umidade = 100-((tensao-0.99)/1.91*100); //calculo da umidade em porcentagem
  double luminosidade = analogRead(A1);
  luminosidade = (luminosidade/1023.0)*100; //calculo da luminosidade em porcentagem
  client.loop();
  delay(1000);  // <- fixes some issues with WiFi stability

  if (!client.connected()) {
    connect();
  }
  luminosidade++;

  if (millis() - lastMillis > 60000*tempo) { //delay para enviar dados
    lastMillis = millis();
    StaticJsonDocument<200> jsonDocument;
    jsonDocument["umidade"] = umidade;
    jsonDocument["luminosidade"] = luminosidade;

    // Conversão do objeto JSON para uma string
    String jsonString;
    serializeJson(jsonDocument, jsonString);

    // Publicação da mensagem JSON no tópico MQTT
    client.publish("mqtt/leituras", jsonString);
  }
}
