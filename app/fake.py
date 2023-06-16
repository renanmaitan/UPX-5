import requests
import datetime
import random
import time

while True:
        umidade = random.randint(0,100)
        luminosidade = random.randint(0,100)
        current_datetime = datetime.datetime.now()
        datetime_str = current_datetime.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        arduino_Json = {
            "plantId" : 1,
            "humity": umidade,
            "luminosity": luminosidade,
            "time" : datetime_str,
            "lightOn": True,
            "pumpOn": False,
        }
        requests.post('https://localhost:7298/arduino',json=arduino_Json,verify=False)
        time.sleep(5)