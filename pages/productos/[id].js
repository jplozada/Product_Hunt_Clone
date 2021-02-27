import React, {useEffect, useContext, useState} from 'react';
import {useRouter} from 'next/router';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import {es} from 'date-fns/locale';

import Layout from '../../components/layout/Layout';
import {FirebaseContext} from '../../firebase/index';
import Error404 from '../../components/layout/404';
import {css} from '@emotion/react';
import styled from '@emotion/styled';
import {Campo, InputSubmit} from '../../components/ui/Formulario';
import Boton from '../../components/ui/Boton';

const ContenedorProducto = styled.div`
    @media(min-width:768px){
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: 2rem;
    }
`;

const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #DA552F;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;
`;

const Producto = () => {

    // State del componente
    const [producto, guardarProducto] = useState({});
    const [error, guardarError] = useState(false);
    const [comentario, guardarComentario] = useState({});
    const [consultarDB, guardarConsultarDB] = useState(true);

    // Routing para oibtener el id actual
    const router = useRouter();
    const {query: {id}} = router;
    //console.log(id);

    // Context de firebase
    const {firebase, usuario} = useContext(FirebaseContext);

    useEffect(() => {
        if(id && consultarDB){
            const obtenerProducto = async () => {
                const productoQuery = await firebase.db.collection('productos').doc(id);
                const producto = await productoQuery.get();
                if(producto.exists){
                    guardarProducto(producto.data());
                    guardarConsultarDB(false);
                } else {
                    guardarError(true);
                    guardarConsultarDB(false);
                }
            }   
            obtenerProducto();
        }
    }, [id]);

    if(Object.keys(producto).length === 0 && !error) return 'Cargando...';

    const {comentarios, creado, descripcion, empresa, nombre, url, urlimagen, votos, creador, haVotado} = producto;

    // Administrar y validar los votos
    const votarProducto = () => {
        if(!usuario){
            return router.push('/login');
        }

        // Obtener y sumar un nuevo voto
        const nuevoTotal = votos + 1;
        
        // Verificar si el usuario actrual ha votado
        if(haVotado.includes(usuario.uid)) return;

        // Guardar el ID del usuario que ha votado
        const nuevoHanVotado = [...haVotado, usuario.uid];

        // Actualizar en la BD
        firebase.db.collection('productos').doc(id).update({ votos: nuevoTotal, haVotado: nuevoHanVotado });

        // Actualizar el state
        guardarProducto({
            ...producto,
            votos: nuevoTotal
        })
        

        // Consultar DB luego de votar un producto
        guardarConsultarDB(true);
    }

    // Funciones para crear comentarios
    const comentarioChange = e => {
        guardarComentario({
            ...comentario,
            [e.target.name] : e.target.value
        })
    }

    // Identifica si el comentario es el creador del producto
    const esCreador = id => {
        if(creador.id == id) {
             return true;
        }
    }

    const agregarComentario = e => {
        e.preventDefault();

        if(!usuario){
            return router.push('/login');
        }

        // Informacion extra al comentario
        comentario.usuarioId = usuario.uid;
        comentario.usuarioNombre = usuario.displayName;

        // Tomar copia de comentarios y agregarlos al arreglo
        const nuevosComentarios = [...comentarios, comentario];

        // Actualizar la BD
        firebase.db.collection('productos').doc(id).update({comentarios: nuevosComentarios});

        // Actualizar el state
        guardarProducto({
            ...producto,
            comentarios: nuevosComentarios
        });

        // Consultar DB luego comentar sobre un producto
        guardarConsultarDB(true);
    }

    // Funcion que revisa el creador del producto sea el mismo del que esta autenticado
    const puedeBorrar = () => {
        if(!usuario) return false;

        if(creador.id == usuario.uid) {
            return true
        }
        
    }

    // Elimina un producto de la bd
    const eliminarProducto = async () => {
        if(!usuario){
            return router.push('/login');
        }
        if(creador.id !== usuario.uid) {
            return router.push('/');
        }
        try {
            await firebase.db.collection('productos').doc(id).delete();
            router.push('/');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Layout>
            {error ? <Error404 /> : (
                <div className="contenedor">
                    <h1 css={css`
                        text-align: center;
                        margin-top: 5rem;
                    `}>{nombre}</h1>
                    <ContenedorProducto>
                        <div>
                            <p>Publicado hace: {formatDistanceToNow(new Date(creado), {locale: es})}</p>
                            <p>Por: {creador.nombre} de {empresa}</p>
                            <img src={urlimagen} />
                            <p>{descripcion}</p>

                            {usuario && (
                                <>
                                <h2>Agrega tu comentario</h2>
                                <form
                                    onSubmit={agregarComentario}
                                >
                                    <Campo>
                                        <input
                                            type="text"
                                            name="mensaje"
                                            onChange={comentarioChange}
                                        />
                                    </Campo>
                                    <InputSubmit
                                        type="submit"
                                        value="Agregar Comentario"
                                    />
                                </form>
                                </>
                            )}

                            <h2 css={css`
                                margin: 2rem 0;
                            `}>Comentarios</h2>
                            {comentarios.length === 0 ? "Aún no hay comentarios" : (
                                <ul>
                                    {comentarios.map((comentario, i) => (
                                        <li
                                            key={`${comentario.usuarioId}-${i}`}
                                            css={css`
                                                border: 1px solid #e1e1e1;
                                                padding: 2rem;
                                            `}
                                        >
                                            <p>{comentario.mensaje}</p>
                                            <p>Escrito por: 
                                            <span
                                                css={css`
                                                    font-weight: bold;
                                                `}
                                            > {comentario.usuarioNombre}</span></p>
                                            {esCreador(comentario.usuarioId) && <CreadorProducto>Es Creador</CreadorProducto>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <aside>
                            <Boton
                                target="_blank"
                                bgColor="true"
                                href={url}
                            >Visitar URL</Boton>

                            <div css={css`
                                margin-top: 5rem;
                            `}>
                                <p css={css`
                                    text-align: center;
                                `}>{votos} votos</p>
                                {usuario && (
                                    <Boton
                                        onClick={votarProducto}
                                    >
                                        Votar
                                    </Boton>
                                )}
                            </div>
                        </aside>
                    </ContenedorProducto>

                    {puedeBorrar() && 
                    <Boton
                        onClick={eliminarProducto}
                    >Eliminar producto</Boton>
                    }
                </div>
            )}
        </Layout>
    );
}
 
export default Producto;