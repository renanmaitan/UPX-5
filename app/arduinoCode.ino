#include "WiFiEsp.h" //INCLUSÃO DA BIBLIOTECA
#include "SoftwareSerial.h"//INCLUSÃO DA BIBLIOTECA

SoftwareSerial Serial1(A4, A5); //PINOS QUE EMULAM A SERIAL, ONDE O PINO 6 É O RX E O PINO 7 É O TX

char ssid[] = "Galaxy S21 5G305a"; //VARIÁVEL QUE ARMAZENA O NOME DA REDE SEM FIO
char pass[] = "uncy8528";//VARIÁVEL QUE ARMAZENA A SENHA DA REDE SEM FIO

int status = WL_IDLE_STATUS; //STATUS TEMPORÁRIO ATRIBUÍDO QUANDO O WIFI É INICIALIZADO E PERMANECE ATIVO
//ATÉ QUE O NÚMERO DE TENTATIVAS EXPIRE (RESULTANDO EM WL_NO_SHIELD) OU QUE UMA CONEXÃO SEJA ESTABELECIDA
//(RESULTANDO EM WL_CONNECTED)
//2.48 0.97 
WiFiEspServer server(80); //CONEXÃO REALIZADA NA PORTA 80

RingBuffer buf(8); //BUFFER PARA AUMENTAR A VELOCIDADE E REDUZIR A ALOCAÇÃO DE MEMÓRIA

int statusLed = LOW; //VARIÁVEL QUE ARMAZENA O ESTADO ATUAL DO LED (LIGADO / DESLIGADO)

void setup(){
  pinMode(4, OUTPUT); //LED 
  pinMode(A1, INPUT);//UMIDADE
  pinMode(A0, INPUT); //LUMINOSIDADE
  pinMode(2, OUTPUT); //BOMBA
  digitalWrite(4, LOW);
  Serial.begin(9600); //INICIALIZA A SERIAL
  Serial1.begin(9600); //INICIALIZA A SERIAL PARA O ESP8266
  WiFi.init(&Serial1); //INICIALIZA A COMUNICAÇÃO SERIAL COM O ESP8266
  WiFi.config(IPAddress(192,168,170,220)); //COLOQUE UMA FAIXA DE IP DISPONÍVEL DO SEU ROTEADOR

  //INÍCIO - VERIFICA SE O ESP8266 ESTÁ CONECTADO AO ARDUINO, CONECTA A REDE SEM FIO E INICIA O WEBSERVER
  if(WiFi.status() == WL_NO_SHIELD){
    while (true);
  }
  while(status != WL_CONNECTED){
    status = WiFi.begin(ssid, pass);
  }
  server.begin();
  //FIM - VERIFICA SE O ESP8266 ESTÁ CONECTADO AO ARDUINO, CONECTA A REDE SEM FIO E INICIA O WEBSERVER
}

bool resp = false;
void loop(){
  //2.63 0.96
  WiFiEspClient client = server.available(); //ATENDE AS SOLICITAÇÕES DO CLIENTE
  double umidadeLeitura = analogRead(A1);
  double tensao;
  tensao = umidadeLeitura*(5.0/1023.0);
  // Serial.println(tensao);
  double umidade = 100-((tensao-0.96)/1.67*100); //calculo da umidade em porcentagem
  double luminosidade = analogRead(A0);
  luminosidade = (luminosidade/1023.0)*100; //calculo da luminosidade em porcentagem
  if (client) { //SE CLIENTE TENTAR SE CONECTAR, FAZ
    buf.init(); //INICIALIZA O BUFFER
    while (client.connected()){ //ENQUANTO O CLIENTE ESTIVER CONECTADO, FAZ
      if(client.available()){ //SE EXISTIR REQUISIÇÃO DO CLIENTE, FAZ
        char c = client.read(); //LÊ A REQUISIÇÃO DO CLIENTE
        buf.push(c); //BUFFER ARMAZENA A REQUISIÇÃO
        //IDENTIFICA O FIM DA REQUISIÇÃO HTTP E ENVIA UMA RESPOSTA
        if(buf.endsWith("\r\n\r\n")) {
          if (resp){
            handleRequest(client, umidade, luminosidade);
            resp = false;
            break;
          }
          sendHttpResponse(client);
          break;
        }
        if (buf.endsWith("GET /S")) {
          resp = true;
        }
        else if(buf.endsWith("GET /N")){ //SE O PARÂMETRO DA REQUISIÇÃO VINDO POR GET FOR IGUAL A "H", FAZ 
            digitalWrite(4, HIGH); //ACENDE O LED
            statusLed = 1; //VARIÁVEL RECEBE VALOR 1(SIGNIFICA QUE O LED ESTÁ ACESO)
        }
        else if (buf.endsWith("GET /F")) { //SE O PARÂMETRO DA REQUISIÇÃO VINDO POR GET FOR IGUAL A "L", FAZ
                digitalWrite(4, LOW); //APAGA O LED
                statusLed = 0; //VARIÁVEL RECEBE VALOR 0(SIGNIFICA QUE O LED ESTÁ APAGADO)
          }
        else if (buf.endsWith("GET /L")){
            digitalWrite(2, HIGH);
        }
        else if (buf.endsWith("GET /D")){
            digitalWrite(2, LOW);
        }
      }
    }
    client.stop(); //FINALIZA A REQUISIÇÃO HTTP E DESCONECTA O CLIENTE
  }
}
void handleRequest(WiFiEspClient client, double umidade, double luminosidade) {
  char stringUmidade[10];
  char stringLuminosidade[10];
  dtostrf(umidade, 4, 2, stringUmidade);
  dtostrf(luminosidade, 4, 2, stringLuminosidade);
  
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/plain");
  client.println("Connection: close");
  client.println();
  client.print(stringUmidade);
  client.print(",");
  client.println(stringLuminosidade);
}

//MÉTODO DE RESPOSTA A REQUISIÇÃO HTTP DO CLIENTE
void sendHttpResponse(WiFiEspClient client){
  client.println("HTTP/1.1 200 OK"); //ESCREVE PARA O CLIENTE A VERSÃO DO HTTP
}