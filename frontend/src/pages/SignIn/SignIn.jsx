import React, { useState } from 'react';
import axios from 'axios';
import * as PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { API_ROUTES, APP_ROUTES } from '../../utils/constants';
import { useUser } from '../../lib/customHooks';
import { storeInLocalStorage } from '../../lib/common';
import { ReactComponent as Logo } from '../../images/Logo.svg';
import styles from './SignIn.module.css';

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const { user, authenticated } = useUser();
  if (user || authenticated) {
    navigate(APP_ROUTES.DASHBOARD);
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ error: false, message: '' });
  const signIn = async () => {
    try {
      setIsLoading(true);
      const response = await axios({
        method: 'post',
        url: API_ROUTES.SIGN_IN,
        data: {
          email,
          password,
        },
      });
      if (!response?.data?.token) {
        setNotification({ error: true, message: 'Une erreur est survenue' });
        console.log('Something went wrong during signing in: ', response);
      } else {
        storeInLocalStorage(response.data.token, response.data.userId);
        setUser(response.data);
        navigate('/');
      }
    } catch (err) {
      console.log(err);
      // Check if there is a response from the API and an 'error' field
      if (err.response && err.response.data && err.response.data.error) {
        setNotification({ error: true, message: err.response.data.error });
      } else {
        // Otherwise, the default error message is used.
        setNotification({ error: true, message: err.message });
      }
      console.log('Some error occured during signing in: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    // Password length check
    if (password.length < 4) {
      setNotification({ error: true, message: 'Le mot de passe doit faire au moins 4 caractères.' });
      return; // On arrête la fonction pour ne pas lancer la requête
    }

    // Checking the validity of the email
    // At a minimum, check for the presence of the '@'
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setNotification({ error: true, message: 'Veuillez entrer une adresse email valide.' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios({
        method: 'POST',
        url: API_ROUTES.SIGN_UP,
        data: {
          email,
          password,
        },
      });
      console.log(response);
      if (!response?.data) {
        console.log('Something went wrong during signing up: ', response);
        return;
      }
      setNotification({ error: false, message: 'Votre compte a bien été créé, vous pouvez vous connecter' });
    } catch (err) {
      console.log('Erreur capturée lors de la création du compte:', err);

      // Retrieve the message returned by the backend
      if (err.response && err.response.data && err.response.data.error) {
        console.log('Message d\'erreur reçu du serveur:', err.response.data.error);
        setNotification({ error: true, message: err.response.data.error });
      } else {
        // Otherwise, default error message
        setNotification({ error: true, message: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const errorClass = notification.error ? styles.Error : null;
  return (
    <div className={`${styles.SignIn} container`}>
      <Logo />
      <div className={`${styles.Notification} ${errorClass}`}>
        {notification.message.length > 0 && <p>{notification.message}</p>}
      </div>
      <div className={styles.Form}>
        <label htmlFor={email}>
          <p>Adresse email</p>
          <input
            className=""
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); }}
          />
        </label>
        <label htmlFor="password">
          <p>Mot de passe</p>
          <input
            className="border-2 outline-none p-2 rounded-md"
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
          />
        </label>
        <div className={styles.Submit}>
          <button
            type="submit"
            className="
            flex justify-center
            p-2 rounded-md w-1/2 self-center
            bg-gray-800  text-white hover:bg-gray-800"
            onClick={signIn}
          >
            {isLoading ? <div className="" /> : null}
            <span>
              Se connecter
            </span>
          </button>
          <span>OU</span>
          <button
            type="submit"
            className="
            flex justify-center
            p-2 rounded-md w-1/2 self-center
            bg-gray-800  text-white hover:bg-gray-800"
            onClick={signUp}
          >
            {
                isLoading
                  ? <div className="mr-2 w-5 h-5 border-l-2 rounded-full animate-spin" /> : null
              }
            <span>
              {'S\'inscrire'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}

SignIn.propTypes = {
  setUser: PropTypes.func.isRequired,
};
export default SignIn;
