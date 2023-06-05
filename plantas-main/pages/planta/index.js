import React, { useEffect, useState } from "react";
import styles from "./plantPage.module.css";
import luzIcon from "../../public/assets/icon1.svg"
import umidadeIcon from '../../public/assets/icon2.svg'
import abacaxi from '../../public/assets/cabaxi.png'
import Image from 'next/image'
export default function PlantPage() {

  const [plantData, setPlantData] = useState()

  useEffect(() => {
    fetch('https://localhost:7298/plant', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        setPlantData(data)
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [])

  return (
    <div>
      <div className={styles.hero}>
        <h1>Escolha uma planta e deixe o sistema cuidar da planta por você</h1>
        <div className={styles.selectGroup}>
          <label htmlFor="name">Nome da planta</label>
          <select>
            {
              plantData?.map((plant) => {
                return (
                  <option value={plant.name}>{plant.name}</option>
                )
              }
              )
            }
          </select>
        </div>
      </div>

      <div className={styles.plantContent}>
        <div className={styles.plantStats}>
          <div className={styles.plantStatsItem}>
            <Image
              src={umidadeIcon}
              width={250}
              height={250}
              alt="Luz"
            />
            <h2>Umidade</h2>
            <p>50%</p>
          </div>
          <div className={styles.plantStatsItem}>
            <Image
              src={luzIcon}
              width={250}
              height={250}
              alt="Umidade"
            />

            <h2>Temperatura</h2>
            <p>25ºC</p>
          </div>
          <div className={styles.plantStatsItem}>
            <Image
              src={abacaxi}
              width={250}
              height={250}
              alt="Abacaxi"
              style={{ borderRadius: '50%' }}
            />
          </div>
        </div>
        <div className={styles.plantInfo}>
          <div className={styles.plantInfoItem}>
            <div className={styles.plantInfoImage}>
              <Image
                src={abacaxi}
                width={100}
                height={100}
                alt="Abacaxi"
                style={{ borderRadius: '50%' }}
              />
            </div>
            <div className={styles.plantInfoItemTitle}>
              <h2>Abacaxi</h2>
              <h3>Nome cientifico</h3>
            </div>
          </div>
          <div className={styles.plantInfoContent}>
            <p>
              Luz: As bromélias ananas precisam de luz brilhante, mas evite a exposição direta ao sol intenso. Coloque a planta próxima a uma janela ensolarada ou em um local com iluminação indireta.
              Temperatura: Essas plantas preferem temperaturas entre 20°C e 30°C. Evite expô-las a correntes de ar frio ou ambientes muito frios.
              Água: Mantenha o solo levemente úmido, mas não encharcado. Regue a planta quando a camada superficial do solo estiver seca ao toque. No entanto, evite encher a parte central da planta (roseta) com água, pois isso pode levar ao apodrecimento.
              Umidade: As bromélias ananas apreciam um ambiente um pouco úmido. Pulverize as folhas regularmente com água limpa para aumentar a umidade ao redor da planta.
              Fertilização: Fertilize a planta a cada dois meses durante a primavera e o verão, usando um fertilizante balanceado solúvel em água. Siga as instruções do fabricante para a dosagem correta.
              Transplante: Essas bromélias geralmente não precisam de transplante com frequência. No entanto, se a planta ficar muito grande para o vaso atual, você pode transplantá-la para um recipiente ligeiramente maior, usando uma mistura de solo bem drenado.
              Pragas e doenças: As bromélias ananas são geralmente resistentes a pragas e doenças. No entanto, esteja atento a sinais de infestação por ácaros, cochonilhas ou pulgões. Se necessário, trate a planta com um inseticida adequado.

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
