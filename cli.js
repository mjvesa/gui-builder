#!/usr/bin/node
const { exec } = require("child_process");
exec("electron " + __dirname + "/index.js", (err, stdout, stderr) => {
  if (err) {
    console.log("Could not execute electron. Reason:");
    console.log(stderr);
    return;
  }
});
