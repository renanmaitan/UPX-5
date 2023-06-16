import React, { useEffect, useState } from "react";
import styles from "./Forms.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Forms() {
  const showToastMessage = () => {
    toast.success("Planta cadastrada com sucesso!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const [plantData, setPlantData] = useState({
    name: "",
    soil: "",
    light: "1",
    hoursOfExposure: "",
    isUsingLight: false,
    imagePlant: null,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const base64String = await convertToBase64(plantData.imagePlant);

      const requestData = {
        name: plantData.name,
        humidity: plantData.soil,
        luminosity: plantData.light,
        hours: plantData.hoursOfExposure,
        isUsed: false,
        imageBase64: base64String,
      };

      const response = await fetch("https://localhost:7298/plant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        console.log("Success:", requestData);
        showToastMessage();
      } else {
        throw new Error("Error: Failed to register plant.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao cadastrar planta!");
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };

      reader.onerror = () => {
        reject(new Error("Failed to convert image to base64."));
      };

      reader.readAsDataURL(file);
    });
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
            <label htmlFor="hoursOfExposure">
              Horas de exposição à luz solar
            </label>
            <input
              type="number"
              id="hoursOfExposure"
              value={plantData.hoursOfExposure}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="imagePlant">Imagem da planta</label>
            <input
              type="file"
              id="imagePlant"
              onChange={(event) =>
                setPlantData((prevState) => ({
                  ...prevState,
                  imagePlant: event.target.files[0],
                }))
              }
            />
          </div>

          {/* enviar */}
          <div className={styles.formGroup}>
            <button type="submit">Enviar</button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
