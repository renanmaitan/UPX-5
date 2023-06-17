import React, { useEffect, useState } from "react";
import styles from "./plantPage.module.css";
import luzIcon from "../../public/assets/icon1.svg";
import umidadeIcon from "../../public/assets/icon2.svg";
import abacaxi from "../../public/assets/cabaxi.png";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

const PlantPage = () => {
  const [plantData, setPlantData] = useState([]);
  const [plantContent, setPlantContent] = useState([]);
  const [names, setNames] = useState([]);
  const [plantaClicada, setPlantaClicada] = useState();
  const [actualPlant, setActualPlant] = useState();
  const [arduinoPlant, setArduinoPlant] = useState();

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

      setPlantData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchArduinoPlantData = async (plantId) => {
    try {
      const responseContent = await fetch(
        `https://localhost:7298/arduinodata/plant/${plantId}/last`,
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
      fetchArduinoPlantData(dataContent.id);
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
      setNames(dataContent.map((plant) => plant.id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (plantContent.length > 0) {
      const chartData = {
        labels: plantContent.map((plant) => {
          const date = new Date(plant.time);
          return `${date.getHours()}:${date.getMinutes()}`;
        }),
        humity: plantContent.map((plant) => plant.humity),
        luminosity: plantContent.map((plant) => plant.luminosity),
      };
      console.log("chartData:", chartData);
    }
  }, [plantContent]);

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
                    alt="Base64 Image"
                    style={{ width: "200px", height: "200px" }}
                  />
                )}
                <p>{actualPlant?.name}</p>
              </div>

              <div className={styles.plantInfoItem}>
                <img src={umidadeIcon} alt="Umidade Icon" />
                <p>Umidade: {arduinoPlant?.humity}%</p>
              </div>

              <div className={styles.plantInfoItem}>
                <img src={luzIcon} alt="Luz Icon" />
                <p>Luminosidade: {arduinoPlant?.luminosity}</p>
              </div>
            </div>
          </div>

          <div className={styles.plantSelect}>
            <h3>Selecione uma planta</h3>
            <select onChange={handlePlantSelect}>
              <option value="">-- Selecione --</option>
              {plantData.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name}
                </option>
              ))}
            </select>
            <button
              onClick={choosePlant}
              disabled={!plantaClicada || plantaClicada === actualPlant?.id}
            >
              Escolher planta
            </button>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {plantContent.length > 0 && (
          <LineChart width={600} height={400} data={plantContent}>
            <XAxis dataKey="time" tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getHours()}:${date.getMinutes()}`;
            }}/>
            <YAxis />
            
            
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="humity"
              name="Umidade"
              stroke="#FF6384"
              activeDot={{ r: 0 }}
            />
            <Line
              type="monotone"
              dataKey="luminosity"
              name="Luminosidade"
              stroke="#36A2EB"
              activeDot={{ r: 0 }}
            />
          </LineChart>
        )}
      </div>
    </div>
  );
};

export default PlantPage;
