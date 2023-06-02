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
        self.broker = 'ec2-18-191-215-255.us-east-2.compute.amazonaws.com'
        self.port = 1883
        self.topic = "mqtt/request"
        self.topic_leituras = "mqtt/leituras"
        # generate client ID with pub prefix randomly
        self.client_id = f'python-mqtt-{random.randint(0, 1000)}'
        self.device_id = 'device_1'
        self.isLedOn = False;
        self.isBombaOn = False;
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
        self.publishApi()
        self.getDataAPI()
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
            "humity": 0,
            "luminosity": 0,
            "time": datetime_str,
            "lightOn": False,
            "pumpOn": False,
        }
        requests.post('https://localhost:7298/arduino',json=arduino_Json,verify=False)
        temp = requests.get('https://localhost:7298/arduino/last',verify=False)
        temp = json.loads(temp.text)
        self.idArduino = temp['id']

    def updateArduino(self):
        arduino_Json = {
            "humity": self.umidadeAtual,
            "luminosity": self.luminosidadeAtual,
            "lightOn": self.isLedOn,
            "pumpOn": self.isBombaOn,
        }
        requests.put(f'https://localhost:7298/arduinodata/{self.idArduino}',json=arduino_Json,verify=False)

    def getDataAPI(self):
        self.planta = requests.get(f'https://localhost:7298/plant/{self.id}',verify=False)
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

    def subscribe(self,client: mqtt_client):
        def on_message(client, userdata, msg):

            y = json.loads(msg.payload.decode())
            self.umidadeAtual = float((y['umidade']))
            self.luminosidadeAtual = float((y['luminosidade']))

            self.tempoDeExecucao = time.time() - self.start
            if self.tempoDeExecucao >= 86400:
                self.start = time.time()
                self.tempoDeLuzOnPorDia = 0
            if self.luminosidadeAtual >= self.luminosidadeIdeal:

                self.tempoDeLuzOnPorDia = time.time() - self.start - self.tempoOffLuz
                if self.isLedOn:
                    client.publish(self.topic, 0.1)
                    self.isLedOn = False
            else:
                self.tempoOffLuz = time.time() - self.start - self.tempoDeLuzOnPorDia
                if self.tempoDeLuzOnPorDia < self.horasDeLuz:
                    if not self.isLedOn:
                        client.publish(self.topic, 1.1)
                        self.isLedOn = True
                else:
                    if self.isLedOn:
                        client.publish(self.topic, 0.1)
                        self.isLedOn = False
            if self.umidadeAtual < self.umidadeIdeal:
                if not self.isBombaOn:
                    client.publish(self.topic, 1.2)
                    self.isBombaOn = True
            else:
                if self.isBombaOn:
                    client.publish(self.topic, 0.2)
                    self.isBombaOn = False

            self.updateArduino()

            print("Umidade: ",self.umidadeAtual)
            print("Luminosidade: ",self.luminosidadeAtual)
            print("Luminosidade Ideal: ",self.luminosidadeIdeal)
            #print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")
        
        client.subscribe(self.topic_leituras)
        client.on_message = on_message
        
        
        
    def publish(self, client, id):
        if id == 0.1:
            result = client.publish(self.topic,"Desligar Led")
        elif id == 1.1:
            result = client.publish(self.topic,"Ligar Led")
        elif id == 0.2:
            result = client.publish(self.topic,"Desligar Bomba")
        elif id == 1.2:
            result = client.publish(self.topic,"Ligar Bomba")
        
    def main(self):
        client = self.connect_mqtt()
        self.subscribe(client)
        client.loop_forever()
        
if __name__ == '__main__':
    app = App()
    app.main()        