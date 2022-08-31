// const express = require("express");
// const path = require('path');
// const fs = require('fs');
// const crypto = require("crypto");
// const Certificate = require("./models/certificates/Certificate");


import {MockCertificateChain, MockRootCertificate} from "./models/certificates/MockCertificateChain.js";
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {Certificate} from "./models/certificates/Certificate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = crypto.randomBytes(32);


// function to encrypt text as a string and return it as a json object {iv, encryptedData}.
function encrypt(text) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
}

// function to decrypt text in a form of a json object {iv, encryptedData}.
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


// TODO DELETE: yosef - test
app.get('/api/encrypt', (req, res) => {

    let text = req.query.text;
    let encrypted = encrypt(text);
    console.log(encrypted);
    console.log(decrypt(encrypted));
    res.send(encrypted);

});


// TODO think where the merkel tree should get in.

// api for getting the projects list.
app.get("/api/project_list", async (req, res) => {
    console.log(req.query);

    // joining path of directory 
    const directoryPath = path.join(__dirname, 'Projects');

    // reading directory
    let dirs = fs.readdirSync(directoryPath);

    // making the json data.
    let projects = dirs.map(file => {
        let splitted_file = file.split(' - ');
        let dir_path = path.join(directoryPath, file)
        return {
            name: splitted_file[0], about: splitted_file[1], projectName: file, files: fs.readdirSync(dir_path)
        }
    });

    // sending the json back.
    return res.json(projects);

});

// api for getting specific file from specific project.
app.get("/api/get_file", async (req, res) => {
    console.log(req.query);
    // joining path of directory 
    const directoryPath = path.join(__dirname, 'Projects', req.query.projectName);
    const filePath = path.join(directoryPath, req.query.fileName);
    const file = fs.readFileSync(filePath);


    // return the data as string
    return res.send(file);

});

// method to post file to specific project in the server
app.post("/api/post_file", async (req, res) => {

    // joining path of directory
    const directoryPath = path.join(__dirname, 'Projects', req.query.projectName);
    const filePath = path.join(directoryPath, req.query.fileName);

    // check if the directory exists, and create the directory if it doesn't exist
    if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath);

    // write the file to the directory
    fs.writeFileSync(filePath, req.body.file);

    // return success message
    return res.send('File uploaded successfully');

});

//! ------------------------------------------------------------
//! Certificate endpoint
//! ------------------------------------------------------------
// TODO delete once we don't need to generate new private keys!
// app.get('/api/sign', (req, res) => {
//
//     console.log("====================================");
//     // fs.writeFileSync("public1.pem", publicKey1);
//     // fs.writeFileSync("private1.pem", privateKey1);
//     console.log("====================================");
//
//     console.log("====================================");
//     // fs.writeFileSync("public2.pem", publicKey2);
//     // fs.writeFileSync("private2.pem", privateKey2);
//     console.log("====================================");
//
//
//     console.log("====================================");
//     // fs.writeFileSync("public3.pem", publicKey3);
//     // fs.writeFileSync("private3.pem", privateKey3);
//     console.log("====================================");
//     const privateKey1 = crypto.createPrivateKey({key: fs.readFileSync('./private1.pem'),});
//     const privateKey2 = crypto.createPrivateKey({key: fs.readFileSync('./private2.pem'),});
//     const privateKey3 = crypto.createPrivateKey({key: fs.readFileSync('./private3.pem'),});
//
//     let certificates = MockCertificateChain;
//     let data1 = certificates[0].getDataForSigning;
//     let data2 = certificates[1].getDataForSigning;
//     let data3 = certificates[2].getDataForSigning;
//     let signature1 = req.query.signature = crypto.createSign('RSA-SHA256').update(data1).sign(privateKey1, "base64");
//     fs.writeFileSync("signature1.txt", signature1);
//     let signature2 = req.query.signature = crypto.createSign('RSA-SHA256').update(data2).sign(privateKey1, "base64");
//     fs.writeFileSync("signature2.txt", signature2);
//     let signature3 = req.query.signature = crypto.createSign('RSA-SHA256').update(data3).sign(privateKey2, "base64");
//     fs.writeFileSync("signature3.txt", signature3);
//
//
//     const isValidSignature = crypto.verify('RSA-SHA256', data1, publicKey1, Buffer.from(signature1, 'base64'));
//     res.send(signature);
// });

// TODO this method work! the certification step is valid
// TODO - Yosef - take this logic from the function and put it in the client in the
app.get('/api/get_certificate_chain', (req, res) => {

    // return true;
    res.send(MockCertificateChain);
});


//! ------------------------------------------------------------
//! methods for creating the server and connect it to the client,
//! don't change the three methods below!.
//! ------------------------------------------------------------

app.get('/', (req, res) => {
    // Return index.html file
    console.log('index.html requested');
    res.sendFile(path.join(__dirname, '/../client/index.html'));
});

app.get('/script.js', (req, res) => {
    console.log('script.js requested');
    res.sendFile(path.join(__dirname, '/../client/script.js'));
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});