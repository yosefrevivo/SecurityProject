const express = require("express");
const path = require('path');
const fs = require('fs');
const crypto = require("crypto");


const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = crypto.randomBytes(32);


// TODO not working
function encrypt(text) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// TODO delete: yosef - test
app.get('/api/encrypt', (req, res) => {

    let text = req.params.text;
    let encrypted = encrypt(text);
    console.log(encrypted);
    res.send(encrypted);

});
   
// TODO delete: yosef - need to check that its working.
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = createDecipheriv('aes-256-cbc', Buffer.from(SECRET), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// TODO implement encryption and decryption for text file.
// TODO think where the tree should get in.

// api for getting the projects list.
app.get("/api/project_list", async (req, res) => {

    // joining path of directory 
    const directoryPath = path.join(__dirname, 'Projects');

    // reading directory
    dirs = fs.readdirSync(directoryPath);

    // making the json data.
    projects = dirs.map( file => {
        splitted_file = file.split(' - ');
        dir_path = path.join(directoryPath, file)
        return {
            name: splitted_file[0],
            about:  splitted_file[1],
            projectName: file,
            files: fs.readdirSync(dir_path)
        }
    });

    // sending the json back.
    return res.json(projects);

  });

// api for getting specific file from specific project.
app.get("/api/get_file", async (req, res) => {

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
    if (!fs.existsSync(directoryPath)) 
        fs.mkdirSync(directoryPath);
    
    // write the file to the directory
    fs.writeFileSync(filePath, req.body.file);

    // return success message
    return res.send('File uploaded successfully');

});


//! methods for creating the server and connect it to the client, don't change the three methods below!.
app.get('/', (req, res) => {
res.sendFile(path.join(__dirname, '/../client/index.html'));
});

app.get('/script.js', (req, res) => {
res.sendFile(path.join(__dirname, '/../client/script.js'));
});

app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});