# Catalogo TIC · Competencia 28 · Educacion Primaria

Proyecto web estatico para gestionar actividades TIC organizadas por grados de primaria (1.° a 6.°), orientadas al desarrollo de la Competencia 28 del Curriculo Nacional del Peru.

---

## Estructura del proyecto

```
catalogo-tic/
│
├── index.html                        ← Pagina principal (abrir en el navegador)
│
└── assets/
    ├── css/
    │   └── style.css                 ← Todos los estilos visuales
    │
    ├── js/
    │   ├── data.js                   ← Actividades precargadas + clave de almacenamiento
    │   └── app.js                    ← Logica: filtros, CRUD, render, modal
    │
    └── images/
        ├── logo.png                  ← Logo de tu institucion educativa
        │
        └── actividades/             ← Imagenes de cada software/plataforma
            ├── paint.png
            ├── canva.png
            ├── google-docs.png
            ├── google-slides.png
            ├── google-forms.png
            ├── google-sites.png
            ├── google-classroom.png
            ├── google-safesearch.png
            ├── youtube-kids.png
            ├── book-creator.png
            ├── capcut.png
            ├── padlet.png
            └── teclado.png
```

---

## Como agregar imagenes de software

1. Descarga una captura de pantalla o el logo del programa/plataforma.
2. Guardala en `assets/images/actividades/` con un nombre claro y sin espacios.  
   Ejemplo: `canva.png`, `scratch.png`, `google-meet.png`
3. Al crear o editar una actividad en la web, escribe exactamente ese nombre en el campo **"Imagen del software"**.
4. La imagen aparecera como banner en la tarjeta automaticamente.

Si no se encuentra la imagen, la tarjeta muestra un icono de pantalla con el nombre del software.

---

## Como agregar el logo de la escuela

Reemplaza el archivo `assets/images/logo.png` con el logo de tu institucion.  
El nombre debe ser exactamente `logo.png`.

---

## Como usar el catalogo

| Accion                  | Donde hacerlo                                      |
|-------------------------|----------------------------------------------------|
| Filtrar por grado       | Barra de navegacion superior (pegajosa al scroll)  |
| Filtrar por ciclo       | Selector "Ciclo" en la barra de controles         |
| Filtrar por area        | Selector "Area curricular" (se llena automatico)   |
| Buscar por palabra clave| Campo de busqueda                                  |
| Agregar actividad       | Boton "Nueva actividad"                            |
| Editar actividad        | Boton "Editar" en la tarjeta                       |
| Eliminar actividad      | Boton "Eliminar" en la tarjeta (pide confirmacion) |

Las actividades se guardan automaticamente en el navegador (localStorage). No se pierden al recargar la pagina.

---

## Como editar actividades directamente en el codigo

Abre `assets/js/data.js` y modifica el arreglo `ACTIVIDADES_DEFAULT`.

Cada actividad tiene esta estructura:

```javascript
{
  id: 101,                     // Numero unico (no repetir)
  titulo: "Nombre visible",
  grado: "1",                  // "1" a "6"
  area: "Comunicacion",
  desc: "Descripcion breve de la actividad...",
  tic: "Nombre del software",
  imagen: "nombre-archivo.png", // En assets/images/actividades/
  capacidad: "Capacidad de la Competencia 28 que desarrolla",
  ciclo: "III",                // "III" | "IV" | "V" — III: 1° y 2°; IV: 3° y 4°; V: 5° y 6°
  evidencia: "Producto esperado al finalizar la actividad"
}
```

**Importante:** Si el usuario ya tiene actividades guardadas en su navegador, los cambios en `data.js` solo se veran si limpia el localStorage del navegador o usa otro navegador. Para forzar la recarga de los datos por defecto, cambia el valor de `STORAGE_KEY` en `data.js` (por ejemplo: `"catalogo_tic_comp28_v3"`).

---

## Como publicar en GitHub Pages

1. Sube toda la carpeta `catalogo-tic/` a tu repositorio de GitHub.
2. Ve a **Settings > Pages** en tu repositorio.
3. En **Source** selecciona la rama `main` y la carpeta raiz `/`.
4. GitHub generara una URL publica del tipo `https://tu-usuario.github.io/catalogo-tic/`.

---

## Mejoras futuras recomendadas

- Agregar un campo de "duracion de la sesion" (45 min, 90 min, etc.)
- Agregar campo de "materiales adicionales" (proyector, tablet, etc.)
- Exportar el catalogo completo a PDF con la funcion de impresion del navegador
- Agregar modo de vista "lista" ademas del modo tarjeta
- Agregar un campo de "competencias transversales" relacionadas

---

*Curriculo Nacional del Peru · Competencia 28 · Educacion Primaria*
