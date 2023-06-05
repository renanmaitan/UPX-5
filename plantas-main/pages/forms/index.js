'use client'
import React, { useEffect, useState } from "react";
import styles from "./Forms.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function Forms() {
  const showToastMessage = () => {
    toast.success({
      position: toast.POSITION.TOP_RIGHT
    });
  };


  const [plantData, setPlantData] = useState({
    name: "",
    soil: "",
    light: "1",
    horasDeExposicao: "",
    isUsingLight: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { id, value } = event.target;

    setPlantData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!plantData.name.trim()) {
      newErrors.name = "O nome da planta é obrigatório.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log(plantData);

    fetch('https://localhost:7298/plant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: plantData.name,
        humidity: plantData.soil,
        luminosity: plantData.light,
        hours: plantData.horasDeExposicao,
        isUsed: false
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        toast.success('Planta cadastrada com sucesso!')
      }
      )
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Erro ao cadastrar planta!')
      }
      );




  };

  return (
    <div>
      <div className={styles.hero}>
        <h1>Cadastro de plantas</h1>
        <p>
          Adicione informações para que o sistema funcione de forma específica
          para a sua planta
        </p>
      </div>

      <div className={styles.form}>
        <form onSubmit={handleSubmit}>
          <h2>Dados da planta</h2>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome da planta</label>
            <input
              type="text"
              id="name"
              value={plantData.name}
              onChange={handleInputChange}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="soil">Porcentagem da umidade do solo</label>
            <input
              type="number"
              id="soil"
              value={plantData.soil}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="light">Luz</label>
            <select
              id="light"
              value={plantData.light}
              onChange={handleInputChange}
            >
              <option value="1500">Luz direta</option>
              <option value="1000">Luz indireta</option>
              <option value="0">Não usar luz</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="horasDeExposicao">
              Horas de exposição à luz solar
            </label>
            <input
              type="number"
              id="horasDeExposicao"
              value={plantData.horasDeExposicao}
              onChange={handleInputChange}
            />
          </div>

          {/* enviar */}
          <div className={styles.formGroup}>
            <button type="submit"
              onClick={showToastMessage}
            >Enviar</button>
          </div>
        </form>
      </div>
      <ToastContainer />

    </div>
  );
}



