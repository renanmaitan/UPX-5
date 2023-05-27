import random
from paho.mqtt import client as mqtt_client
import json
import time
import http.client
import requests


#request = requests.get('https://localhost:7298/')

broker = 'ec2-18-191-140-46.us-east-2.compute.amazonaws.com'
port = 1883
topic = "mqtt/request"
topic_leituras = "mqtt/leituras"
# generate client ID with pub prefix randomly
client_id = f'python-mqtt-{random.randint(0, 1000)}'
username = 'emqx'
password = 'public'
device_id = 'device_1'
ledOn = False;
bombaOn = False;

def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)
    
    client = mqtt_client.Client(client_id)
    # client.username_pw_set(username, password)
    client.on_connect = on_connect
    client.connect(broker, port)
    return client

def subscribe(client: mqtt_client):
    id = 1
    planta = None
    while id <= 250:
         request = requests.get(f'https://localhost:7298/plant/{id}',verify=False)
         status = request.status_code
         if status is 200:
             planta = request.content
             break
         id += 1
         
    if planta is not None:
        planta = json.loads(planta)
        umidadeIdeal = planta['humity']
        luminosidadeIdeal = planta['luminosity']

    planta_Json = {
        "humity": 0,
        "luminosity": 0,
        "name": "Plantinhaa",
        "hours": 0
    }
    requests.post('https://localhost:7298/plant',json=planta_Json,verify=False)
    requests.delete(f'https://localhost:7298/plant/{id}',verify=False)

    
    def on_message(client, userdata, msg):
        
        y = json.loads(msg.payload.decode())
        umidade = float((y['umidade']))
        luminosidade = float((y['luminosidade']))

        #REQUISITA DA API:
        # tipoPlanta #talvez nao precise
        # luminosidadeIdeal
        # umidadeIdeal
        # isLedOn
        # isBombaOn
        
        # if luminosidade < luminosidadeIdeal:
            # if not isLedOn:
            #   client.publish(topic, 0)
            #   ledOn = True
        
        # if umidade < umidadeIdeal:
            # if not isBombaOn:
            #   client.publish(topic, 1)
            #   bombaOn = True
        
        
        #ENVIA PARA API:
        #umidade
        #luminosidade
        #ledOn
        #bombaOn
        #time.time
        
        print("Umidade: ",umidade)
        print("Luminosidade: ",luminosidade)
        #print(f"Received `{msg.payload.decode()}` from `{msg.topic}` topic")
    
    client.subscribe(topic_leituras)
    client.on_message = on_message
    
    
    
def publish(client, id):
    if id == 0:
        result = client.publish(topic,"Ligar Bomba")
    else:
        result = client.publish(topic,"Ligar Led")
    
def main():
    client = connect_mqtt()
    subscribe(client)
    client.loop_forever()
    
if __name__ == '__main__':
    main()
    