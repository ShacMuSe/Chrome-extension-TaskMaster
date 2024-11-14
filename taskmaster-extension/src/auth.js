import axios from 'axios';

const API_URL = 'http://localhost:8000/api/token/';

// Fonction pour obtenir le token JWT
export const getToken = async (username, password) => {
  try {
    const response = await axios.post(API_URL, {
      username,
      password
    });
    return response.data; // Retourne l'objet contenant le token
  } catch (error) {
    console.error("Erreur lors de l'authentification", error);
    throw error;
  }
};

// Fonction pour stocker le token dans localStorage
export const saveToken = (token) => {
  localStorage.setItem('jwt_token', token);
};

// Fonction pour récupérer le token depuis localStorage
export const loadToken = () => {
  return localStorage.getItem('jwt_token');
};

// Fonction pour supprimer le token
export const removeToken = () => {
  localStorage.removeItem('jwt_token');
};
