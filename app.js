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
  let { username, name, password, gender, location } = request.body;
  let hashedpassword = await bcrypt.hash(password, 10);
  let postregister = `SELECT * FROM user WHERE username='${username}'`;
  let register = await database.get(postregister);
  if (register === undefined) {
    let createUser = `INSERT INTO user(username,name,password,gender,location) VALUES ('${username}','${name}','${password}','${gender}','${location}');`;
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let dbUser = await database.run(createUser);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
app.post("/login", async (request, response) => {
  let { username, password } = request.body;
  const selectUserquery = `SELECT * FROM user WHERE username='${username}';`;
  const dbUser = await database.get(selectUserquery);
  if (dbUser !== true) {
    response.status = 400;
    response.send("Invalid user");
  }
  if (password !== true) {
    response.status = 400;
    response.send("Invalid Password");
  } else {
    response.status = 200;
    response.send("User created successfully");
  }
});
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkUser = `SELECT * FROM user WHERE username='${username}'`;
  const dbUser = await database.get(checkUser);
  if (dbUser === undefined) {
    response.status(400);
    response.send("User not registered");
  } else {
    const isValidPassword = await bcrypt.compare(oldPassword, dbUser.password);
    if (isValidPassword === true) {
      const len_ofnew_password = newPassword.length;
      if (len_ofnew_password < 5) {
        response, status(400);
        response.send("Password is too short");
      } else {
        const encryptPass = await bcrypt.hash(newPassword, 10);
        const update_encrypt_pass = `UPDATE user SET password='${encryptPass}' WHERE username='${username}'`;
        const newPass = await database.run(update_encrypt_pass);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});
module.exports = app;
