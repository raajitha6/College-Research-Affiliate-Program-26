import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import config from '../config';

const COLORS = ['#0b3c6d', '#f39c12'];

const Prediction = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [inputData, setInputData] = useState({
    distance: '',
    temperature: ''
  });

  // 1. Fetch model info
  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/v1/model-info`)
      .then(response => setModelInfo(response.data))
      .catch(error => console.error('Error fetching model info:', error));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setInputData({
      ...inputData,
      [e.target.name]: e.target.value
    });
  };

  // 2. Call prediction API
  const handlePredict = async () => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/v1/predict`, {
        distance: parseFloat(inputData.distance),
        temperature: parseFloat(inputData.temperature),
        time_features: [0, 0, 0]  // dummy (backend ignores it)
      });

      setPrediction(response.data);

    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  // Prepare chart data
  const chartData = prediction
    ? [
        { name: prediction.prediction, value: prediction.confidence },
        { name: 'Other', value: 1 - prediction.confidence }
      ]
    : [];

  return (
    <div className="prediction-page">
      <h1>Water Activity Prediction</h1>

      {/* Model Info */}
      <div className="model-info-card">
        <h2>Model Information</h2>
        {modelInfo && (
          <>
            <p>Model Type: {modelInfo.model_type}</p>
            <p>Accuracy: {(modelInfo.accuracy * 100).toFixed(2)}%</p>
            <p>Version: {modelInfo.version}</p>
          </>
        )}
      </div>

      {/* Input Form */}
      <div className="prediction-form">
        <h2>Enter Sensor Data</h2>

        <input
          type="number"
          name="distance"
          placeholder="Distance (cm)"
          value={inputData.distance}
          onChange={handleChange}
        />

        <input
          type="number"
          name="temperature"
          placeholder="Temperature (°C)"
          value={inputData.temperature}
          onChange={handleChange}
        />

        <button onClick={handlePredict}>
          Predict
        </button>
      </div>

      {/* Prediction Results */}
      <div className="prediction-results">
        <h2>Prediction Results</h2>

        {prediction && (
          <>
            <h3>Activity: {prediction.prediction}</h3>
            <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default Prediction;