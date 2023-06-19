import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, Title } from 'chart.js';
import { CategoryScale } from 'chart.js';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

ChartJS.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

const getPlantDataFromArduino = async (id) => {
  if (!id) {
    return;
  }
  const data = await fetch(`https://localhost:7298/arduinodata/plant/${id}`);
  const plantData = await data.json();
  return plantData;
};

export default function Dash({ id }) {
  const [plantData, setPlantData] = useState();
  const [chartData, setChartData] = useState();

  useEffect(() => {
    getPlantDataFromArduino(id).then((data) => {
      setPlantData(data);
    });
  }, [id]);

  useEffect(() => {
    if (plantData) {
      const labels = plantData.map((data) =>
        new Date(data.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      const humidity = plantData.map((data) => data.humity);
      const luminosity = plantData.map((data) => data.luminosity);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Humidity',
            data: humidity,
            fill: false,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(0, 139, 139, 1)',
            pointBorderColor: 'rgb(0, 139, 139, 0)',
            pointBackgroundColor: 'rgb(0, 139, 139, 0)',
            pointHoverBackgroundColor: 'rgb(0, 139, 139, 0)',
            pointHoverBorderColor: 'rgb(0, 139, 139, 0)',
          },
          {
            label: 'Luminosity',
            data: luminosity,
            fill: false,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(184, 134, 11, 1)',
            pointBorderColor: 'rgb(184, 134, 11, 0)',
            pointBackgroundColor: 'rgb(184, 134, 11, 0)',
            pointHoverBackgroundColor: 'rgb(184, 134, 11, 0)',
            pointHoverBorderColor: 'rgb(184, 134, 11, 0)',
          }
        ],
      });
    }

    const interval = setInterval(() => {
      getPlantDataFromArduino(id).then((data) => {
        setPlantData(data);
      });
    }, 5000);

    return () => clearInterval(interval);

  }, [plantData]);

  return (
    <div className={inter.className}>
      {chartData && id &&
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                display: true,
                labels: {
                  font: {
                    size: 14,
                  },
                },
              },
              title: {
                display: true,
                text: `Plant ${id} data`,
                font: {
                  size: 16,
                },
              },
              subtitle: {
                display: true,
                text: 'Subtitle',
                font: {
                  size: 14,
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Time',
                  font: {
                    size: 18,
                  },
                },
              
              },
              y: {
                title: {
                  display: true,
                  text: 'Value',
                  font: {
                    size: 18,
                  },
                },
              },
            },
          }}
        />
      }
    </div>
  );
}
