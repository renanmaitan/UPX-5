import requests
import datetime
import random
import time
i = 0
umidade = 0
luminosidade = 0
while True:
        if i == 0:
            umidade = random.randint(70,100)
            luminosidade = random.randint(10,40)
        i+=1
        if i == 5:
            i=0
        umidade += random.randint(-1,1)
        luminosidade += random.randint(-1,1)
        current_datetime = datetime.datetime.now()
        datetime_str = current_datetime.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        arduino_Json = {
            "plantId" : 5,
            "humity": umidade,
            "luminosity": luminosidade,
            "time" : datetime_str,
            "lightOn": True,
            "pumpOn": False,
        }
        requests.post('https://localhost:7298/arduino',json=arduino_Json,verify=False)
        time.sleep(5)