import React from 'react';
import {css} from '@emotion/react';
import Layout from "../components/layout/Layout";
import {Formulario, Campo, InputSubmit, Error} from '../components/ui/Formulario';

import firebase from '../firebase';

// Validaciones
import useValidation from '../hooks/useValidacion';
import validarCrearCuenta from '../validacion/validarCrearCuenta';

const STATE_INICIAL = {
  nombre: '',
  email: '',
  password: ''
}

export default function CrearCuenta() {

  const {valores, errores, handleSubmit, handleChange, handleBlur} = useValidation(STATE_INICIAL, validarCrearCuenta, crearCuenta);
  const {nombre, email, password} = valores;

  async function crearCuenta() {
    try {
      await firebase.registrar(nombre, email, password);
    } catch (error) {
      console.error('Hubo un error al crear el usuario ', error.message);
    }
  }

  return (
    <div>
      <Layout>
        <h1
          css={css`
            text-align: center;
            margin-top: 5rem;
          `}
        >Crear Cuenta</h1>
        <Formulario
          onSubmit={handleSubmit}
          noValidate
        >
          <Campo>
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              placeholder="Tu nombre"
              name="nombre"
              value={nombre}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.nombre && <Error>{errores.nombre}</Error>}
          <Campo>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Tu Email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.email && <Error>{errores.email}</Error>}
          <Campo>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Tu Password"
              name="password"
              value={password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.password && <Error>{errores.password}</Error>}
          <InputSubmit type="submit" value="Crear Cuenta"/>
        </Formulario>
      </Layout>
    </div>
  );
}
