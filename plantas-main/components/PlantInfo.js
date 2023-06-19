import React, { useEffect, useState } from "react";
import styles from "./plantPage.module.css";

import Link from "next/link";
import Dash from "../../components/Chart";


const getPlantsFromForms = async () => {
    const data = await fetch('https://localhost:7298/plant');
    const plantData = await data.json();

    return plantData;
};

const getPlantDataFromArduino = async (id) => {

    if (!id) {
      return;
    }
    const data = await fetch(`https://localhost:7298/arduinodata/plant/${id}`);
    const plantData = await data.json();
  
    return plantData;
  };



export default function PlantPage(id) {

    const [plantSelected, setPlantSelected] = useState();
    const [formsData, setFormsData] = useState();

    useEffect(() => {
        getPlantsFromForms().then((data) => {
            setFormsData(data);
        });
    }, []);

    const handlePlantSelect = (e) => {
        setPlantSelected(e.target.value);
    };


    return (
        <>

            <div className={styles.plantInfo}>
                <h3>Informações da planta</h3>
                <div className={styles.plantInfoContent}>
                    <div className={styles.plantInfoItem}>
                        {/* {actualPlant?.imageBase64 && (
                    <img
                      src={decodePhoto(actualPlant.imageBase64)}
                      alt="Imagem da planta"
                    />
                  )} */}
                    </div>
                    <div className={styles.plantInfoItem}>
                        {/* <h4>Nome:</h4>
                  <p>{actualPlant?.name}</p>
                  <h4>Umidade:</h4>
                  <p>{arduinoPlant?.humidity}%</p>
                  <h4>Luminosidade:</h4>
                  <p>{arduinoPlant?.luminosity}%</p> */}
                    </div>
                </div>
            </div>


        </>
    );
};

