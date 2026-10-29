// Multer: guarda la imagen del producto en backend/uploads/.
// Si la imagen no es válida NO corta la petición: deja el motivo en req.errorImagen
// y el middleware de validación (el que sigue) lo informa junto con los demás errores.
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const CARPETA = path.join(__dirname, '..', '..', 'uploads');
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const EXTENSIONES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

fs.mkdirSync(CARPETA, { recursive: true });

const storage = multer.diskStorage({
  destination: CARPETA,
  filename: (req, file, cb) => {
    // La extensión sale del tipo de archivo, no del nombre que manda el usuario.
    const azar = Math.floor(Math.random() * 1000000);
    cb(null, `${Date.now()}-${azar}${EXTENSIONES[file.mimetype]}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (EXTENSIONES[file.mimetype]) return cb(null, true);
  req.errorImagen = 'La imagen debe ser JPG, PNG o WEBP';
  cb(null, false); // ignora el archivo pero sigue leyendo el resto del formulario
};

const subida = multer({ storage, fileFilter, limits: { fileSize: MAX_BYTES } }).single('imagen');

function subirImagen(req, res, next) {
  subida(req, res, (error) => {
    if (error) {
      req.errorImagen =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen no puede superar los 2 MB'
          : 'No se pudo procesar la imagen';
    }
    next();
  });
}

// Borra del disco una imagen guardada (recibe la ruta pública, ej: /uploads/123-456.jpg).
// path.basename evita salirse de la carpeta aunque la ruta venga rara.
function borrarArchivo(rutaPublica) {
  if (!rutaPublica) return;
  fs.unlink(path.join(CARPETA, path.basename(rutaPublica)), () => {});
}

module.exports = { subirImagen, borrarArchivo, CARPETA };
