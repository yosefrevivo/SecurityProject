let server = 'http://localhost:3001';
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

    let isValid = await validate_certificate_chain();
    if (!isValid) {
        alert("Invalid certificate chain - untrusted server!");
        return;
    }
    // show the project list in the modal
    await showProjectList();

}

async function showProjectList() {

    $('#choose-project-modal').modal('show');

    // get the project list from the server
    let projects = await $.get(`${server}/api/project_list`);

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

async function validate_certificate_chain() {
    // First get the chain and then check the validity of the chain
    let certificates_chain = await $.get(`${server}/api/get_certificate_chain`);
    return false; // TODO @yossef Remove the false once you fix the imports
    // TODO @Yossef - please fix the imports - the logic of this function work!
    // // Extract first certificate from the certificates chain and convert to Certificate object
    // let first_certificate = certificates_chain[0];
    // // Check if root_certificate is in this.root_certificates
    // if (first_certificate.issuer !== "RootCertificate") {
    //     console.log("Unknown root certificate issuer");
    //     return false;
    // }
    //
    // // Check if the certificate is expired - i.e. valid_to is in the past
    // first_certificate.valid_to = new Date(first_certificate.valid_to);
    // if (first_certificate.valid_to < new Date()) {
    //     console.log("Certificate is expired");
    //     return false;
    // }
    //
    // let certificate_issuer = first_certificate;
    // // Check all certificates in the certificates chain
    // for (let i = 1; i < certificates_chain.length; i++) {
    //     let certificate = certificates_chain[i];
    //     // Check if the certificate is expired - i.e. valid_to is in the past
    //     certificate.valid_to = new Date(certificate.valid_to);
    //     if (certificate.valid_to < new Date()) {
    //         console.log("Certificate is expired");
    //         // return false;
    //     }
    //
    //     // Check if the certificate is issued by the issuer of the previous certificate.
    //     let publicKey = Buffer.from(certificate_issuer.public_key, 'base64');
    //     // decode certificate_signature from base64 to binary
    //     let certificate_signature = Buffer.from(certificate.signature, 'base64');
    //     // Prepare data to be signed
    //     let data = certificate.getDataForSigning;
    //     const isValidSignature = crypto.verify('RSA-SHA256', data, publicKey, certificate_signature);
    //     if (!isValidSignature) {
    //         console.log("Invalid signature");
    //         // return false;
    //     }
    //
    //     certificate_issuer = certificate;
    // }
    // return true
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
    let file = await $.ajax({
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