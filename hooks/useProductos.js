import React, {useEffect, useState, useContext} from 'react';
import {FirebaseContext} from '../firebase/index';

const useProductos = orden => {
    const [productos, guardarProductos] = useState([]);

    const {firebase} = useContext(FirebaseContext);

    useEffect(() => {
        const obtenerProductos = () => {
        firebase.db.collection('productos').orderBy(orden, 'desc').onSnapshot(manejarSnapshot);
        }
        obtenerProductos();
    }, []);

    function manejarSnapshot(snapshot) {
        const productos = snapshot.docs.map(doc => {
        return {
            id: doc.id,
            ...doc.data()
        }
        });

        guardarProductos(productos);
        //console.log(productos);
    }

    return {
        productos
    }
}

export default useProductos;