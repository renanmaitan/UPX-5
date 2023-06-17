import React, { useEffect, useState } from "react";
import styles from "./plantPage.module.css";
import { Line } from "react-chartjs-2";
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title } from 'chart.js';
import { CategoryScale } from 'chart.js';

const PlantPage = () => {

  ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale)

  const [plantData, setPlantData] = useState([]);
  const [plantContent, setPlantContent] = useState([]);
  const [names, setNames] = useState([]);
  const [plantaClicada, setPlantaClicada] = useState();
  const [actualPlant, setActualPlant] = useState();
  const [arduinoPlant, setArduinoPlant] = useState();

  const addData = (label, humidityData, luminosityData) => {
    setPlantContent((prevContent) => [
      ...prevContent,
      { label, humidityData, luminosityData },
    ]);
  };

  useEffect(() => {
    fetchPlantData();
    fetchActualPlantData();
    const interval = setInterval(() => {
      fetchPlantData();
      fetchActualPlantData();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const fetchPlantData = async () => {
    try {
      const response = await fetch("https://localhost:7298/plant", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Success:", data);
      setPlantData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchArduinoPlantData = async (data) => {
    try {
      const responseContent = await fetch(
        `https://localhost:7298/arduinodata/plant/${data.id}/last`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const dataContent = await responseContent.json();
      console.log("Success planta:", dataContent);
      setArduinoPlant(dataContent);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchActualPlantData = async () => {
    try {
      const responseContent = await fetch(
        "https://localhost:7298/plant/actual",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const dataContent = await responseContent.json();
      console.log("Arduino planta:", dataContent);
      setActualPlant(dataContent);
      fetchArduinoPlantData(dataContent);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPlantContent = async (plantId) => {
    try {
      const responseContent = await fetch(
        `https://localhost:7298/arduinodata/plant/${plantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const dataContent = await responseContent.json();
      console.log("Success planta:", dataContent);
      setPlantContent(dataContent);
      setNames((currentNames) => [
        ...currentNames,
        ...dataContent.map((plant) => plant.id),
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const choosePlant = async () => {
    try {
      await fetch(`https://localhost:7298/plant/${plantaClicada}/actual`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePlantSelect = (e) => {
    const selectedPlantId = e.target.value;
    fetchPlantContent(selectedPlantId);
    setPlantContent([]);
    setPlantaClicada(selectedPlantId);
  };

  const decodePhoto = (imageBase64) => {
    return `data:image/png;base64,${imageBase64}`;
  };

  const chartData = {
    labels: plantContent.map((plant) => {
      const date = new Date(plant.time);
      return `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
    }),
    datasets: [
      {
        label: "Umidade",
        data: plantContent.map((plant) => plant.humidity),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: "Luminosidade",
        data: plantContent.map((plant) => plant.luminosity),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Escolha uma planta e deixe o sistema cuidar da planta por você</h1>
        <div className={styles.plantHeaderContainer}>
          <div className={styles.plantInfo}>
            <h3>Informações da planta</h3>
            <div>
              <div className={styles.plantInfoItem}>
                {actualPlant?.imageBase64 && (
                  <img
                    src={decodePhoto(actualPlant?.imageBase64)}
                    alt="Imagem da planta"
                    style={{ width: "200px", height: "200px" }}
                  />
                )}
              </div>
              <div className={styles.plantInfoItem}>
                <h4>{actualPlant?.name}</h4>
                <p>
                  Umidade: <strong>{arduinoPlant?.humity}</strong>
                </p>
                <p>
                  Luminosidade: <strong>{arduinoPlant?.luminosity}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className={styles.plantSelection}>
            <h3>Selecione uma planta</h3>
            <select onChange={handlePlantSelect}>
              <option value="">Selecione uma planta</option>
              {plantData.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
            <button disabled={!plantaClicada} onClick={choosePlant}>
              Selecionar
            </button>
          </div>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <Line
          data={chartData}
          options={{
            responsive: true,
          }}
          updateMode="active"
        />

      </div>
    </div>
  );
};

export default PlantPage;
