const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const conn = require("./db/db");
require('dotenv').config(); 
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/get-data/tokens", function (req, res) {
  const token = jwt.sign({}, "secret key");
  res.json({
    token: token,
  });
});

app.get("/read-data", checkToken, function (req, res) {
  const queryData = "SELECT * FROM user";
  jwt.verify(req.token, "secret key", function (err, data) {
    if (err) {
      res.sendStatus(403);
    } else {
      conn.query(queryData, (err, result) => {
        if (err) {
          res.status(500).json({
            status: "fail",
            message: "Internal Server Error",
          });
        } else {
          res.status(200).json({
            status: "success",
            message: "Sukses Menampilkan Data",
            data: result,
          });
        }
      });
    }
  });
});

app.get("/read-data/id", function (req, res) {
  const params = req.body;
  const npm = params.Npm;
  const queryData = "SELECT * FROM user WHERE NPM = ?";
  const values = [npm];

  conn.query(queryData, values, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "fail",
        message: "Internal Server Error",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Sukses Menampilkan Data",
        data: result,
      });
    }
  });
});

app.post("/insert-data", function (req, res) {
  const params = req.body;
  const npm = params.Npm;
  const nama = params.Nama;
  const ipk = params.Ipk;
  const smt = params.Smt;
  const tempat = params.Tempat;
  const queryData = "INSERT INTO user(NPM, Nama, IPK, Smt, Tempat) VALUES(?, ?, ?, ?, ?)";
  const values = [npm, nama, ipk, smt, tempat];

  conn.query(queryData, values, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "fail",
        message: "Internal Server Error",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Sukses Menambahkan Data",
      });
    }
  });
});

app.put("/update-data", function (req, res) {
  const params = req.body;
  const npm = params.Npm;
  const nama = params.Nama;
  const queryData = "UPDATE user SET Nama = ? WHERE NPM = ?";
  const checkData = "SELECT * FROM user WHERE NPM = ?";
  const values = [nama, npm];
  const checkValues = [npm];

  conn.query(checkData, checkValues, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "fail",
        message: "Internal Server Error",
      });
    } else {
      if (result.length > 0) {
        conn.query(queryData, values, (err, result) => {
          if (err) {
            res.status(500).json({
              status: "fail",
              message: "Internal Server Error",
            });
          } else {
            res.status(200).json({
              status: "success",
              message: "Sukses Menganti Data",
            });
          }
        });
      } else {
        res.status(404).json({
          status: "fail",
          message: "Data Tidak Ditemukan",
        });
      }
    }
  });
});

app.delete("/delete-data", function (req, res) {
  const params = req.body;
  const npm = params.Npm;
  const queryData = "DELETE FROM user WHERE NPM = ?";
  const checkData = "SELECT * FROM user WHERE NPM = ?";
  const values = [npm];

  conn.query(checkData, values, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "fail",
        message: "Internal Server Error",
      });
    } else {
      if (result.length > 0) {
        conn.query(queryData, values, (err, result) => {
          if (err) {
            res.status(500).json({
              status: "fail",
              message: "Internal Server Error",
            });
          } else {
            res.status(200).json({
              status: "success",
              message: "Sukses Menghapus Data",
            });
          }
        });
      } else {
        res.status(404).json({
          status: "fail",
          message: "Data Tidak Ditemukan",
        });
      }
    }
  });
});

function checkToken(req, res, next) {
  const beraerHeader = req.headers["authorization"];
  if (typeof beraerHeader !== "undefined") {
    const bearer = beraerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});