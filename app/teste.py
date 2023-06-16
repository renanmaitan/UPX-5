import requests

ligarLED = "http://192.168.170.220/F"
response = requests.get(ligarLED)
if response.status_code == 200:
    print("LED ligado!")
else:
    print("Erro ao ligar LED!", response.status_code)