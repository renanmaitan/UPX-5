import React, { useEffect, useState } from "react";
import styles from "./plantPage.module.css";

import Link from "next/link";
import Dash from "../../components/Chart";
import Image from "next/image";
import { Colors } from "chart.js";

const getPlantsFromForms = async () => {
  const data = await fetch("https://localhost:7298/plant");
  const plantData = await data.json();

  return plantData;
};

export default function PlantPage() {
  const [plantSelected, setPlantSelected] = useState();
  const [selectedPlantData, setSelectedPlantData] = useState();
  const [formsData, setFormsData] = useState();

  useEffect(() => {
    getPlantsFromForms().then((data) => {
      setFormsData(data);
    });
  }, []);

  const handlePlantSelect = (e) => {
    if (e.target.value === "") {
      setPlantSelected(null);
      return;
    }
    setPlantSelected(e.target.value);
  };

  useEffect(() => {
    if (plantSelected) {
      const selectedPlant = formsData.find(
        (plant) => plant.id === Number(plantSelected)
      );
      setSelectedPlantData(selectedPlant);
    }
  }, [plantSelected, formsData]);

  const decodePhoto = (imageBase64) => {
    return `data:image/png;base64,${imageBase64}`;
  };

  return (
    <>
      <header>
        <div className={styles.headerContainer}>
          <div className={styles.logoContainer}>
            <Link href="/">
              <h1>BotanicCare</h1>
            </Link>
          </div>
          <nav>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/planta">Plantas</Link>
              </li>
              <li>
                <Link href="/forms">Cadastrar</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.hero}>
            <h1>
              Escolha uma planta e deixe o sistema cuidar da planta por você
            </h1>
            <div className={styles.plantHeaderContainer}>
              <div className={styles.plantSelection}>
                <h3>Selecione uma planta</h3>
                <select
                  onChange={handlePlantSelect}
                  className={styles.select}
                >
                  <option
                    value=""
                    onClick={() => {
                      setSelectedPlantData();
                    }}
                  >
                    Selecione uma planta
                  </option>
                  {formsData?.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {selectedPlantData ? (
            <div className={styles.chartContainer}>
              <div className={styles.plantInfo}>
                <div className={styles.plantInfoContent}>
                  <div className={styles.plantInfoItem}>
                    {/* Humidity and luminosity data */}
                    {selectedPlantData?.humity !== "" && plantSelected ? (
                      <p>Humidade ideal: <strong className={styles.humity}>{selectedPlantData?.humity}</strong></p>
                    ) : null}
                    {selectedPlantData?.luminosity !== "" && plantSelected ? (
                      <p>Luminosidade ideal: <strong className={styles.luminosity}>{selectedPlantData?.luminosity}</strong></p>
                    ) : null}
                  </div>
                  <div className={styles.plantInfoItem}>
                    {/* Load the base64 image */}
                    {selectedPlantData?.imageBase64 !== "" && plantSelected ? (
                      <img
                        src={decodePhoto(selectedPlantData?.imageBase64)}
                        alt="Base64 Image"
                        style={{ width: "200px", height: "200px" }}
                      />
                    ) : null}
                    {selectedPlantData?.imageBase64 === "" && plantSelected ? (
                      <p>Imagem não disponível</p>
                    ) : null}
                  </div>
                </div>
              </div>
              <Dash
                id={plantSelected}
                data={selectedPlantData?.chartData} // Pass the chart data as a prop
                className={styles.chart}
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
