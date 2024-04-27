const express = require("express");
const cors = require('cors'); 
const { agregarUsuarios, autenticarUsuario, verificarYdecodificar } = require("./consultas.cjs");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Middleware para habilitar CORS
app.use(cors({
  origin: 'http://localhost:5173',
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

// Middleware para verificar credenciales
const verificarCredenciales = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo electrónico y contraseña son obligatorios' });
  }
  next();
};

// Servidor encendido
app.listen(port, () => {
  console.log("¡Servidor encendido! en puerto: " + port);
});

// POST-Usuarios
app.post("/usuarios", verificarCredenciales, async (req, res) => {
  try {
    console.log("Solicitud POST recibida en /usuarios");
    const { email, password, rol, lenguage } = req.body;
    await agregarUsuarios(email, password, rol, lenguage);
    res.send("Éxito al registrar.");
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

// POST-login
app.post("/login", verificarCredenciales, async (req, res) => {
  try {
    console.log("Solicitud POST recibida en /login");
    const { email, password } = req.body;
    const answer = await autenticarUsuario(email, password);
    if (!answer) {
      res.send("Credenciales incorrectas.");
    }
    res.send(answer);
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});

// GET-usuarios
app.get("/usuarios", async (req, res) => {
  try {
    console.log("Solicitud GET recibida en /usuarios");
    const token = req.header("Authorization").split("Bearer ")[1];
    const answer = await verificarYdecodificar(token);
    if (!answer) {
      res.send("No se ha podido verificar.");
    } else {
      const usuario = answer[0];
      const usuarioFormateado = {
        email: usuario.email,
        rol: usuario.rol,
        lenguage: usuario.lenguage
      };
      res.send(usuarioFormateado);
      console.log("Enviado.");
    }
  } catch (error) {
    res.status(error.code || 500).send(error);
  }
});
