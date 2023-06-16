import React, { useEffect, useState, useRef } from "react";
import styles from "./plantPage.module.css";
import luzIcon from "../../public/assets/icon1.svg";
import umidadeIcon from "../../public/assets/icon2.svg";
import abacaxi from "../../public/assets/cabaxi.png";
import Image from "next/image";
import { Chart } from "chart.js/auto";

const PlantPage = () => {
  const [plantData, setPlantData] = useState([]);
  const [plantContent, setPlantContent] = useState([]);
  const [names, setNames] = useState([]);
  const [plantaClicada, setPlantaClicada] = useState();
  const [actualPlant, setActualPlant] = useState();
  const [arduinoPlant, setArduinoPlant] = useState();
  const chartRef = useRef(null);
  const chartInitialized = useRef(false);

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

  useEffect(() => {
    if (plantContent && chartRef.current && !chartInitialized.current) {
      const ctx = chartRef.current.getContext("2d");

      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: plantContent.map((plant) => {
            const date = new Date(plant.time);
            return `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
          }),
          datasets: [
            {
              label: "Umidade",
              data: plantContent.map((plant) => plant.humity),
              backgroundColor: ["rgba(255, 99, 132, 0.2)"],
              borderColor: ["rgba(255, 99, 132, 1)"],
              borderWidth: 2,
            },
            {
              label: "Luminosidade",
              data: plantContent.map((plant) => plant.luminosity),
              backgroundColor: ["rgba(54, 162, 235, 0.2)"],
              borderColor: ["rgba(54, 162, 235, 1)"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          animations: {
            x: {
              type: "number",
              easing: "linear",
              duration: 500,
              from: NaN, // the point is initially skipped
              delay(ctx) {
                if (ctx.type !== "data" || ctx.xStarted) {
                  return 0;
                }
                ctx.xStarted = true;
                return ctx.index * 500;
              },
            },
            y: {
              type: "number",
              easing: "linear",
              duration: 500,
              from: NaN, // the point is initially skipped
              delay(ctx) {
                if (ctx.type !== "data" || ctx.yStarted) {
                  return 0;
                }
                ctx.yStarted = true;
                return ctx.index * 500;
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      chartInitialized.current = true;
    }

    return () => {
      if (chartRef.current && chartInitialized.current) {
        const ctx = chartRef.current.getContext("2d");
        Chart.getChart(ctx)?.destroy();
        chartInitialized.current = false;
      }
    };
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

  // decode a base64 to image
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
                {/* use the decoding funciton */}
                {actualPlant?.imageBase64 && (
                  <img
                    src={`data:image/png;base64,${actualPlant?.imageBase64}`}
                    alt="Base64 Image"
                    style={{ width: "200px", height: "200px" }}
                  />
                )}
                <p>{actualPlant?.name}</p>
              </div>

              <div className={styles.plantInfoItem}>
                <Image src={luzIcon} alt="Luz" />
                <p>Luminosidade ideal: {actualPlant?.luminosity}</p>
                <p>Luminosidade atual: {arduinoPlant?.luminosity}</p>
              </div>
              <div className={styles.plantInfoItem}>
                <Image src={umidadeIcon} alt="Umidade" />
                <p>Umidade ideal: {actualPlant?.humity}</p>
                <p>Umidade atual: {arduinoPlant?.humity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.selectGroup}>
        <select name="plant" id="plant" onChange={handlePlantSelect}>
          <option value="0">Selecione uma planta</option>
          {plantData.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>
        <button onClick={choosePlant}>Monitorar planta</button>
      </div>
      <div className={styles.chartContainer}>
        <canvas id="chart" ref={chartRef}></canvas>
      </div>
      {/* Restante do código... */}
    </div>
  );
};

export default PlantPage;
