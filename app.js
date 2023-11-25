const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const bcrypt = require("bcrypt");
const databasePath = path.join(__dirname, "userData.db");

const app = express();
app.use(express.json());
let database = null;

const initializeDataBaseAndResponseServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error :{error:message}`);
    process.exit(1);
  }
};
initializeDataBaseAndResponseServer();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  let hashedpassword = await bcrypt.hash(password, 10);
  const postregister = `SELECT * FROM user WHERE username='${username}'`;
  const register = await database.get(postregister);
  if (register === undefined) {
    let createUser = `INSERT INTO user(username,name,password,gender,location) VALUES ('${username}','${name}','${password}','${gender}','${location}')`;
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let dbUser = await database.run(createUser);
      if (dbUser === true) {
        response.status(200);
        response.send("User created successfully");
      } else {
        response.status(400);
        response.send("User already exists");
      }
    }
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserquery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await database.get(selectUserquery);
  if (dbUser !== true) {
    response.status = 400;
    response.send("Invalid user");
  } else {
    if (password !== true) {
      response.status = 400;
      response.send("Invalid Password");
    } else {
      response.status = 200;
      response.send("User created successfully");
    }
  }
});

module.exports = app;
