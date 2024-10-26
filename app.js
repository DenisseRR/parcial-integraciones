const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("./public/scripts/config");

const adminUser = { username: "JosePerez", password: "29", role: "admin" };
const clientUser = { username: "MartaPardo", password: "29", role: "client" };

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, config.secret, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;

    next();
  });
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/registro", (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

app.get("/pedidos", (req, res) => {
  res.sendFile(__dirname + "/public/pedidos.html");
});

app.get("/productos", (req, res) => {
  res.sendFile(__dirname + "/public/productos.html");
});

app.get("/user", autenticarToken, (req, res) => {
  res.json({ user: req.user });
});

app.post("/sinup", (req, res) => {
  const username = String(req.body.username);
  const password = String(req.body.password);
  console.log(`Post Pagina de register ${username}`);
  console.log(`Post Pagina de register ${password}`);

  if (username === "JosePerez" && password === "29") {
    console.log(`Nombre: ${username}, password: ${password}`);
    const user = { nombre: username, role: "admin" };

    jwt.sign(user, config.secret, { expiresIn: "10000s" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Error generando token" });
      }
      res.json({ token: token });
    });
  } else {
    return res.status(401).json({
      aut: false,
      message: "No hay token",
    });
  }
});

app.post("/sinin", (req, res) => {
  const username = String(req.body.username);
  const password = String(req.body.password);

  let user;
  if (username === adminUser.username && password === adminUser.password) {
    user = adminUser;
  } else if (username === clientUser && password === clientUser.password) {
    user = clientUser;
  } else {
    return res.status(401).json({
      success: false, // Campo para indicar que el inicio de sesión falló
      mensaje: "Credenciales incorrectas", // Mensaje de error
    });
  }

  if (user) {
    jwt.sign(
      { username: user.username, role: user.role },
      config.secret,
      { expiresIn: "10000s" },
      (err, token) => {
        if (err) {
          return res.status(500).json({ mensaje: "Error generando token" });
        }
        res.json({
          success: true, // Campo añadido para indicar éxito
          mensaje: "Login successful!", // Mensaje de éxito
          token: token, // Incluir el token en la respuesta
        });
      }
    );
  }
});

app.listen(config.port, () => {
  console.log(`Servidor en  ${config.port}, http://localhost:${config.port}`);
});
