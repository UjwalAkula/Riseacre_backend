const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const gmapKey = process.env.gmaps_api_key;

const gmapsApi = async (req, res) => {
  const inputfromsearch = req.params.input;

  if (!inputfromsearch) {
    return res.status(400).json({ responsefromserver: 'Input parameter is missing' });
  }

  try {
    const url = `https://maps.gomaps.pro/maps/api/place/queryautocomplete/json?input=${encodeURIComponent(inputfromsearch)}&key=${gmapKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(400).json({ 
        responsefromserver: 'Something went wrong with Google Autocomplete.',
        error: errorData.error_message || 'Unknown error'
      });
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({
        responsefromserver: 'Google Maps API did not return successful data.',
        error: data.error_message || 'Unknown API error'
      });
    }

    res.status(200).json({ possiblePredictions: data.predictions || [] });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      responsefromserver: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = { gmapsApi };
