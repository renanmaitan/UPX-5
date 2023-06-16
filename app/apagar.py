import requests
import json

for i in range(2840):
    temp = requests.get('https://localhost:7298/arduino/last',verify=False)
    temp = json.loads(temp.text)
    id = temp['id']
    requests.delete(f'https://localhost:7298/arduinodata/{id}',verify=False)
