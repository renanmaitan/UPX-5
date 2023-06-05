import random
from paho.mqtt import client as mqtt_client
import json
import requests
import time
import urllib3
import datetime

#request = requests.get('https://localhost:7298/')

class App():
    def __init__(self):
        self.broker = 'ec2-18-117-12-176.us-east-2.compute.amazonaws.com'
        self.port = 1883
        self.topic = "mqtt/request"
        self.topic_leituras = "mqtt/leituras"
        # generate client ID with pub prefix randomly
        self.client_id = f'python-mqtt-{random.randint(0, 1000)}'
        self.device_id = 'device_1'
        self.isLedOn = False
        self.isBombaOn = False
        self.id = 2
        self.planta = None
        self.arduino = None
        self.umidadeIdeal = 0
        self.luminosidadeIdeal = 0
        self.umidadeAtual = 0
        self.luminosidadeAtual = 0
        self.horasDeLuz = 0
        self.tempoDeLuzOnPorDia = 0
        self.start = time.time()
        self.tempoDeExecucao = 0
        self.tempoOffLuz = 0
        self.idArduino = 0
        self.comando = [0, 0]
        self.publishApi()
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    def connect_mqtt(self):
        def on_connect(client, userdata, flags, rc):
            if rc == 0:
                print("Connected to MQTT Broker!")
            else:
                print("Failed to connect, return code %d\n", rc)
        
        client = mqtt_client.Client(self.client_id)
        # client.username_pw_set(username, password)
        client.on_connect = on_connect
        client.connect(self.broker, self.port)
        return client

    def publishApi(self):
        current_datetime = datetime.datetime.now()
        datetime_str = current_datetime.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        arduino_Json = {
            "humity": self.umidadeAtual,
            "luminosity": self.luminosidadeAtual,
            "time" : datetime_str,
            "lightOn": self.isLedOn,
            "pumpOn": self.isBombaOn,
        }
        requests.post(f'https://localhost:7298/arduino',json=arduino_Json,verify=False)
        requests.post('https://localhost:7298/arduino',json=arduino_Json,verify=False)
        temp = requests.get('https://localhost:7298/arduino/last',verify=False)
        temp = json.loads(temp.text)
        self.idArduino = temp['id']

    def getDataAPI(self):
        if self.planta is not None:
            if self.planta.status_code != 404:
                planta_text = self.planta.text
                self.planta = json.loads(self.planta.text)
                self.umidadeIdeal = self.planta['humity']
                self.luminosidadeIdeal = self.planta['luminosity']
                self.horasDeLuz = self.planta['hours']

        self.arduino = requests.get(f'https://localhost:7298/arduino/last',verify=False)
        if self.arduino is not None:
            arduino_text = self.arduino.text
            self.arduino = json.loads(self.arduino.text)
            self.isLedOn = self.arduino['lightOn']
            self.isBombaOn = self.arduino['pumpOn']
            # planta_Json = {
            #     "humity": 0,
            #     "luminosity": 0,
            #     "name": "Plantinhaa",
            #     "hours": 0
            # }
            # requests.post('https://localhost:7298/plant',json=planta_Json,verify=False)
            # requests.delete(f'https://localhost:7298/plant/{id}',verify=False)

    def getPlanta(self):
        self.planta = requests.get('https://localhost:7298/plant/actual',verify=False)
        temp = json.loads(self.planta.text)
        self.idArduino = temp['id']

    def decisaoLed(self, client, msg):
        if self.tempoDeExecucao >= 86400:
            self.start = time.time()
            self.tempoDeLuzOnPorDia = 0
        if self.luminosidadeAtual >= self.luminosidadeIdeal:

            self.tempoDeLuzOnPorDia = time.time() - self.start - self.tempoOffLuz
            if self.isLedOn:
                msg[0] = 0
                self.isLedOn = False
        else:
            self.tempoOffLuz = time.time() - self.start - self.tempoDeLuzOnPorDia
            if self.tempoDeLuzOnPorDia < (self.horasDeLuz)*3600:
                if not self.isLedOn:
                    msg[0] = 1
                    self.isLedOn = True
            else:
                if self.isLedOn:
                    msg[0] = 0
                    self.isLedOn = False
        return msg

    def decisaoBomba(self, client, msg):
        print(self.umidadeIdeal)
        print(self.isBombaOn)
        if self.umidadeAtual < self.umidadeIdeal:
            if not self.isBombaOn:
                msg[1] = 1
                self.isBombaOn = True
        else:
            if self.isBombaOn:
                msg[1] = 0
                self.isBombaOn = False
        return msg

    def subscribe(self,client: mqtt_client):
        def on_message(client, userdata, msg):
            self.getPlanta()
            self.getDataAPI()
            y = json.loads(msg.payload.decode())
            self.umidadeAtual = float((y['umidade']))
            self.luminosidadeAtual = float((y['luminosidade']))

            self.tempoDeExecucao = time.time() - self.start
            self.comando = self.decisaoLed(client, self.comando)
            self.comando = self.decisaoBomba(client, self.comando)
            print("self.comando: ",self.comando)
            print("Umidade ideal",self.umidadeIdeal)
            self.comando_str = ', '.join(str(x) for x in self.comando)
            client.publish(self.topic, self.comando_str)
            print()
            self.publishApi()

            print("Umidade: ",self.umidadeAtual)
            print("Luminosidade: ",self.luminosidadeAtual)
            print("Luminosidade Ideal: ",self.luminosidadeIdeal)
            #print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")
        
        client.subscribe(self.topic_leituras)
        client.on_message = on_message
        
    def main(self):
        client = self.connect_mqtt()
        self.subscribe(client)
        client.loop_forever()
        
if __name__ == '__main__':
    app = App()
    app.main()        