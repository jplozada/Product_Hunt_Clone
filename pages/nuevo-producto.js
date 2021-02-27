import React, {useState, useContext} from 'react';
import {css} from '@emotion/react';
import Router, {useRouter} from 'next/router';
import Layout from "../components/layout/Layout";
import {Formulario, Campo, InputSubmit, Error} from '../components/ui/Formulario';
import { v4 as uuidv4 } from 'uuid';

import {FirebaseContext} from '../firebase/index';

import Error404 from '../components/layout/404';

// Validaciones
import useValidation from '../hooks/useValidacion';
import validarCrearProducto from '../validacion/validarCrearProducto';

const STATE_INICIAL = {
  nombre: '',
  empresa: '',
  //imagen: '',
  url: '',
  descripcion: ''
}

export default function NuevoProducto() {

  const [error, guardarError] = useState(false);

  const {valores, errores, handleSubmit, handleChange, handleBlur} = useValidation(STATE_INICIAL, validarCrearProducto, crearProducto);
  const {nombre, empresa, imagen, url, descripcion} = valores;

  // Hook de routing para redireccionar
  const router = useRouter();

  // Context con las operaciones crud de firebase
  const {usuario, firebase} = useContext(FirebaseContext);

  // Subir imagen a Firebase Storage
  const [urlimagen, guardarUrlImagen] = useState('');

  const handleFile = async (e) => {
    const id = uuidv4();
    const file = e.target.files[0];
    const images = firebase.storage.ref('productos').child(id);
    await images.put(file);
    images.getDownloadURL().then(url => {
      console.log(url); 
      guardarUrlImagen(url)
    });
  }

  async function crearProducto() {
    
    // Si el usuario no esta autenticado redireccionar al login
    if(!usuario) {
      return router.push('/login');
    }

    // Crear el objeto de nuevo producto
    const producto = {
      nombre,
      empresa,
      url,
      urlimagen,
      descripcion,
      votos: 0  ,
      comentarios: [],
      creado: Date.now(),
      creador: {
        id: usuario.uid,
        nombre: usuario.displayName
      },
      haVotado: []
    }
  
    // Insertarlo en la base de datos
    await firebase.db.collection('productos').add(producto);

    return router.push('/');
  }

  return (
    <div>
      <Layout>
        { !usuario ? <Error404/> : (
          <>
          <h1
          css={css`
            text-align: center;
            margin-top: 5rem;
          `}
        >Nuevo Producto</h1>
        <Formulario
          onSubmit={handleSubmit}
          noValidate
        >
          <fieldset>
            <legend>Información General</legend>
          <Campo>
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              placeholder="Nombre del Producto"
              name="nombre"
              value={nombre}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.nombre && <Error>{errores.nombre}</Error>}

          <Campo>
            <label htmlFor="empresa">Empresa</label>
            <input
              type="text"
              id="empresa"
              placeholder="Nombre empresa o Compañia"
              name="empresa"
              value={empresa}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.empresa && <Error>{errores.empresa}</Error>}

          <Campo>
            <label htmlFor="imagen">Imagen</label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              accept="image/*"
              value={imagen}
              onInput={handleFile}
              onBlur={handleBlur}
            />
          </Campo>

          <Campo>
            <label htmlFor="url">URL</label>
            <input
              type="url"
              id="url"
              name="url"
              placeholder="URL de tu producto"
              value={url}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.url && <Error>{errores.url}</Error>}
          </fieldset>
          <fieldset>
            <legend>Sobre tu producto</legend>
            <Campo>
            <label htmlFor="descripcion">Descripcion</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Campo>
          {errores.descripcion && <Error>{errores.descripcion}</Error>}
          </fieldset>
          {error && <Error>{error}</Error>}
          <InputSubmit type="submit" value="Crear Producto"/>
        </Formulario>
          </>
        )}
      </Layout>
    </div>
  );
}