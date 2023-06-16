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
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);

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
    if (plantContent && chart && !chart.data.labels.length) {
      chart.data.labels = plantContent.map((plant) => {
        const date = new Date(plant.time);
        return `${date.getHours()}:${date.getMinutes()}`;
      });
      chart.data.datasets[0].data = plantContent.map((plant) => plant.humity);
      chart.data.datasets[1].data = plantContent.map((plant) => plant.luminosity);
      chart.update();
    }
  }, [plantContent, chart]);


  const createChart = (chartRef, data) => {
    const ctx = chartRef.current.getContext("2d");

    if (chart) {
      chart.destroy();
    }

    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Umidade",
            data: data.humity,
            backgroundColor: ["rgba(255, 99, 132, 0.2)"],
            borderColor: ["rgba(255, 99, 132, 1)"],
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: "Luminosidade",
            data: data.luminosity,
            backgroundColor: ["rgba(54, 162, 235, 0.2)"],
            borderColor: ["rgba(54, 162, 235, 1)"],
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        animations: {
          x: {
            type: "number",
            easing: "linear",
            duration: 100,
            from: NaN,
            delay(ctx) {
              if (ctx.type !== "data" || ctx.xStarted) {
                return 0;
              }
              ctx.xStarted = true;
              return ctx.index * 100;
            },
          },
          y: {
            type: "number",
            easing: "linear",
            duration: 100,
            from: NaN,
            delay(ctx) {
              if (ctx.type !== "data" || ctx.yStarted) {
                return 0;
              }
              ctx.yStarted = true;
              return ctx.index * 100;
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

    setChart(newChart);
  };

  useEffect(() => {
    if (plantContent && chart && plantContent.length > 0) {
      const chartData = {
        labels: plantContent.map((plant) => {
          const date = new Date(plant.time);
          return `${date.getHours()}:${date.getMinutes()}`;
        }),
        humity: plantContent.map((plant) => plant.humity),
        luminosity: plantContent.map((plant) => plant.luminosity),
      };

      createChart(chartRef, chartData);
    }
  }, [plantContent, chart]);

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
                    src={`data:image/png;base64,${actualPlant?.imageBase64}`}
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
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default PlantPage;
