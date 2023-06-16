import json
import requests
import time
import urllib3
import datetime

padrao = "http://192.168.170.220"

ligarLED = padrao + "/N"
desligarLED = padrao + "/F"
ligarBomba = padrao + "/L"
desligarBomba = padrao + "/D"
coletarDados = padrao + "/S"



class App():
    def __init__(self):
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
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    def publishApi(self):
        current_datetime = datetime.datetime.now()
        datetime_str = current_datetime.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        arduino_Json = {
            "plantId" : self.planta['id'],
            "humity": self.umidadeAtual,
            "luminosity": self.luminosidadeAtual,
            "time" : datetime_str,
            "lightOn": self.isLedOn,
            "pumpOn": self.isBombaOn,
        }
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

        # self.arduino = requests.get(f'https://localhost:7298/arduino/last',verify=False)
        # if self.arduino is not None:
        #     arduino_text = self.arduino.text
        #     self.arduino = json.loads(self.arduino.text)
        #     self.isLedOn = self.arduino['lightOn']
        #     self.isBombaOn = self.arduino['pumpOn']
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

    def decisaoLed(self):
        if self.tempoDeExecucao >= 86400:
            self.start = time.time()
            self.tempoDeLuzOnPorDia = 0
        if self.luminosidadeAtual >= self.luminosidadeIdeal:

            self.tempoDeLuzOnPorDia = time.time() - self.start - self.tempoOffLuz
            if self.isLedOn:
                response = requests.get(desligarLED)
                if response.status_code == 200:
                    print("LED desligado!")
                    self.isLedOn = False
                else:
                    print("Erro ao desligar LED!", response.status_code)
        else:
            self.tempoOffLuz = time.time() - self.start - self.tempoDeLuzOnPorDia
            if self.tempoDeLuzOnPorDia < (self.horasDeLuz)*3600:
                if not self.isLedOn:
                    response = requests.get(ligarLED)
                    if response.status_code == 200:
                        print("LED ligado!")
                        self.isLedOn = True
                    else:   
                        print("Erro ao ligar LED!", response.status_code)
            else:
                if self.isLedOn:
                    response = requests.get(desligarLED)
                    if response.status_code == 200:
                        print("LED desligado!")
                        self.isLedOn = False
                    else:
                        print("Erro ao desligar LED!", response.status_code)
    
    def decisaoBomba(self):
        if self.umidadeAtual < self.umidadeIdeal:
            if not self.isBombaOn:
                response = requests.get(ligarBomba)
                if response.status_code == 200:
                    print("Bomba ligada!")
                    self.isBombaOn = True
                    time.sleep(1.75)
                    reponse2 = requests.get(desligarBomba)
                    if reponse2.status_code == 200:
                        print("Bomba desligada!")
                        self.isBombaOn = False
                    else:
                        print("Erro ao desligar bomba!", reponse2.status_code)
                else:   
                    print("Erro ao ligar bomba!", response.status_code)
        else:
            if self.isBombaOn:
                response = requests.get(desligarBomba)
                if response.status_code == 200:
                    print("Bomba desligada!")
                    self.isBombaOn = False
                else:   
                    print("Erro ao desligar bomba!", response.status_code)

app = App()

while True:
    app.getPlanta()
    app.getDataAPI()
    # print(app.umidadeIdeal)
    # print(app.isBombaOn)
    response = requests.get(coletarDados)
    if response.status_code == 200:
        umidade, luminosidade = response.text.strip().split(",")
        #converte valor para inteiro
        app.umidadeAtual = float(umidade)
        app.luminosidadeAtual = float(luminosidade)
        app.publishApi()
        print("Umidade: ", app.umidadeAtual)
        print("Luminosidade: ", app.luminosidadeAtual)
        app.decisaoLed()
        app.decisaoBomba()
    else:   
        print("Erro ao enviar requisição!", response.status_code)

    time.sleep(3)
