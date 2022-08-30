server = 'http://localhost:3001';
SECRET = null;
USB_FILE = null;


$(document).ready(() => {

    // hide the pull and push btns.
    $('#pull-btn, #push-btn').hide();
    $('#code-body').hide();

});

// on uploading the file, update hte USB_FILE variable.
function updateUSBFile(event) {
    USB_FILE = $("#USBFile")[0].files[0];
}

async function Authenticate() {
    
    if (USB_FILE == null) {
        $('#error-msg').text("pls Connect your company USB identifier").show();
        return;
    }

    // turn the USB file into a json object.
    const employee_secret = JSON.parse(await USB_FILE.text());

    // get the secret from the json
    SECRET = employee_secret.secret;

    // encrypt the secret with the server public key.
    const encryptedSecret = await encryptWithServerPublicKey(SECRET);

    // authenticate the user with the server.
    const userName = await $.ajax({
        data: {
            "secret": encryptedSecret
        },
        type: 'GET',
        url: `${server}/api/authenticate`
    });


    // if the user is authenticated, then init the page.
    if (userName) {

        // hide the authentication div
        $('#input-area, #text, #auth-btn, #error-msg').hide();

        // show pull and push buttons.
        $('#pull-btn, #push-btn').show();

        // change the user name to the authenticated user.
        $('#Title').text(`Hi ${userName}, you are authenticated.`);

        $('#authentication-card').toggleClass('text-bg-success');
        $('#authentication-card').toggleClass('text-bg-light');

    }

    // if the user is not authenticated, then show the error message.
    else {

        $('#error-msg').text("User not permitted!!").show();

    }

}

async function encryptWithServerPublicKey(text) {

    //? maybe we will save the public key after init connection?
    // get the server public key from the server.
    const serverPublicKey = await $.get(`${server}/api/public_key`);
    
    // encrypt the text with the server public key with aes-256-cbc.
    return CryptoJS.AES.encrypt(text, serverPublicKey).toString();


}

async function showProjectList() {

    $('#choose-project-modal').modal('show');

    // get the project list from the server
    projects = await $.get(`${server}/api/project_list`);

    // empty the project list
    $('#projects-list').empty();

    $('#projects-list').append(projects.map(({name, about, projectName, files}) => `
        <li class="btn btn-primary list-group-item d-flex justify-content-between align-items-start" onclick="openProject('${projectName}', '${files}')">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${name}</div>
                ${about}
            </div>
            <div class="badge bg-primary rounded-pill my-auto">${files.length} files</div>
        </li>
    `));

    // open boot strap modal for choosing a project
    $('#choose-file-modal').modal('show');

}
 
async function openProject(projectName, files) {

    // empty the project list
    $('#projects-list').empty();

    // append the files to the project list
    $('#projects-list').append(files.split(',').map(name => `
        <li class="btn btn-primary list-group-item d-flex justify-content-between align-items-start" onclick="get_file('${projectName}', '${name}')">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${name}</div>
            </div>
        </li>
    `));

}

async function get_file(projectName, fileName) {

    // get the file from the server
    file = await $.ajax({
        data: {
            "projectName": projectName,
            "fileName": fileName
        },
        type: 'GET',
        url: `${server}/api/get_file`
    });


    // hide the modal
    $('#choose-file-modal').modal('hide');

    // decrypt the file
    file = decrypt(file);

    // open the file in the editor
    $('#code').html(file);
    $('#card-header').text(fileName);
    hljs.highlightAll();
    $('#code-body').show();


}

// decrypt text with the secret key with aes-256-cbc.
function decryptText(text) {

    // decrypt the text with the secret key with aes-256-cbc.
    return CryptoJS.AES.decrypt(text, SECRET).toString(CryptoJS.enc.Utf8);

}

// function decrypt({encryptedText, initVector}) {

//     // create the decryption object.
//     const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET, initVector);

//     // update the decryption object with the encrypted text.
//     let decryptedData = decipher.update(encryptedText, "hex", "utf-8");

//     // finalize the decryption object with the initial vector.
//     return decryptedData + decipher.final("utf8");

// }