const server = 'http://localhost:3001';
SECRET = null;
USB_FILE = null;
FILE_TO_PUSH = null;


$(document).ready(() => {

    // hide the pull and push btns.
    $('#pull-btn, #push-btn, #error-msg').hide();
    $('#code-body').hide();

});

function readFile (evt) {

    $('#add-file-btn, #loading-btn').toggle();
    var fileName = $("#file-to-push").val().split('\\').pop();

    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function(event) {
      FILE_TO_PUSH = { fileName: fileName, fileData: event.target.result };  
      $('#add-file-btn, #loading-btn').toggle();
    }
    reader.readAsText(file)

 }

// on uploading the file, update hte USB_FILE variable.
function updateUSBFile(event) {
    USB_FILE = $("#USBFile")[0].files[0];
}

async function Authenticate() {
    // Before the authentication, we need to get the public key from the server and verify the certificate chain.
    let isValid = await validate_certificate_chain();
    if (!isValid) {
        $('#error-msg').text("Untrusted server - the certificate chain is invalid").show();
        return;
    }

    if (USB_FILE == null) {
        $('#error-msg').text("pls Connect your company USB identifier").show();
        return;
    }

    // turn the USB file into a json object.
    const employee_secret = JSON.parse(await USB_FILE.text());

    // get the secret from the json
    SECRET = employee_secret.secret;

    // encrypt the secret with the server public key.
    // const encryptedSecret = await encryptWithServerPublicKey(SECRET);
    const encryptedSecret = SECRET;

    // authenticate the user with the server.
    const {success, name} = await $.ajax({
        data: {
            "secret": encryptedSecret
        },
        type: 'GET',
        url: `${server}/api/authenticate`
    });


    // if the user is authenticated, then init the page.
    if (success) {

        // hide the authentication div
        $('#input-area, #text, #auth-btn, #error-msg').hide();

        // show pull and push buttons.
        $('#pull-btn, #push-btn').show();

        // change the user name to the authenticated user.
        $('#Title').text(`Hi ${name}, you are authenticated.`);

        $('#authentication-card').addClass('text-bg-success');
        $('#authentication-card').removeClass('text-bg-light');
        $('#authentication-card').removeClass('text-bg-danger');

    }

    // if the user is not authenticated, then show the error message.
    else {

        $('#error-msg').text("User not permitted!!").show();

    }

}

async function encryptWithServerPublicKey(text) {

    //? maybe we will save the public key after init connection?
    // get the server public key from the server.
    const {serverPublicKey} = await $.get(`${server}/api/get_server_pub_key`);

    // encrypt the text with the server public key with RSA.
    return CryptoJS.RSA.encrypt(text, serverPublicKey).toString();

}

async function pull_clicked() {

    // get the project list from the server
    let EncryptedProjects = await $.ajax({
        url: `${server}/api/project_list`,
        type: 'GET',
        data: { secret: SECRET }
    });

    let projects = await decrypt_json_list(EncryptedProjects);

    // empty the project list
    $('#projects-pull-list').empty();

    $('#projects-pull-list').append(projects.map(({name, about, projectName, files}) => `
        <li class="btn btn-primary list-group-item d-flex justify-content-between align-items-start" onclick="openProjectForPull('${projectName}', '${files}')">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${name}</div>
                ${about}
            </div>
            <div class="badge bg-primary rounded-pill my-auto">${files.length} files</div>
        </li>
    `));

    // show the modal.
    $('#pull-modal').modal('show');


}

async function push_clicked() {

     // get the project list from the server
     let EncryptedProjects = await $.ajax({
        url: `${server}/api/project_list`,
        type: 'GET',
        data: { secret: SECRET }
    });

    let projects = await decrypt_json_list(EncryptedProjects);

    // empty the project list
    $('#projects-push-list').empty();

    $('#projects-push-list').append(projects.map(({name, about, projectName, files}) => `
        <li class="btn btn-primary list-group-item d-flex justify-content-between align-items-start" onclick="openProjectForPush('${projectName}', '${files}')">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${name}</div>
                ${about}
            </div>
            <div class="badge bg-primary rounded-pill my-auto">${files.length} files</div>
        </li>
    `));

     // show the modal.
     $('#push-modal').modal('show');

}

async function validate_certificate_chain() {
    // First get the chain and then check the validity of the chain
    let certificates_chain = await $.get(`${server}/api/get_certificate_chain`);
    return "certificate's chain is valid";
    let first_certificate = certificates_chain[0];
    
    // Check if root_certificate is in this.root_certificates
    if (first_certificate.issuer !== "RootCertificate") {
        console.log("Unknown root certificate issuer");
        return false;
    }
    
    // Check if the certificate is expired - i.e. valid_to is in the past
    first_certificate.valid_to = new Date(first_certificate.valid_to);
    if (first_certificate.valid_to < new Date()) {
        console.log("Certificate is expired");
        return false;
    }
    
    let certificate_issuer = first_certificate;
    // Check all certificates in the certificates chain
    for (let i = 1; i < certificates_chain.length; i++) {
        let certificate = certificates_chain[i];
        // Check if the certificate is expired - i.e. valid_to is in the past
        certificate.valid_to = new Date(certificate.valid_to);
        if (certificate.valid_to < new Date()) {
            console.log("Certificate is expired");
            // return false;
        }
    
        // Check if the certificate is issued by the issuer of the previous certificate.
        let publicKey = Buffer.from(certificate_issuer.public_key, 'base64');
        // decode certificate_signature from base64 to binary
        let certificate_signature = Buffer.from(certificate.signature, 'base64');
        // Prepare data to be signed
        let data = certificate.getDataForSigning;
        const isValidSignature = crypto.verify('RSA-SHA256', data, publicKey, certificate_signature);
        if (!isValidSignature) {
            console.log("Invalid signature");
            // return false;
        }
    
        certificate_issuer = certificate;
    }
    return true
}

async function openProjectForPush(projectName, files) {

    // empty the project list
    $('#projects-push-list').empty();

    // append the files to the project list
    $('#projects-push-list').append(files.split(',').map(name => `
        <li class="list-group-item d-flex">
            <div class="fw-bold me-auto">${name}</div>
            <button class="btn btn-outline-primary" type="button" onclick="UpdateFileInProject('${projectName}', '${name}')">Update</div>
        </li>
    `));


    // show the input and add file buttons.
    $('#file-to-push, #add-file-btn').removeClass('d-none');

    document.getElementById('file-to-push').addEventListener('change', readFile, false);


    // change the click behavior of add new file button.
    $('#add-file-btn').on('click', () => AddFileToProject(projectName));

}

async function UpdateFileInProject(projectName, file) {

    // if FILE_TO_PUSH is empty, then show the error message.
    if (!FILE_TO_PUSH) {
        alert('pls upload file first');
        return;
    }


    // update the file in the server.
    const { fileData } = FILE_TO_PUSH;
    await $.post(`${server}/api/update_file_in_project`, {projectName: projectName, fileName: file, fileData: fileData, secret: SECRET});

}

async function AddFileToProject(projectName) {

    // if FILE_TO_PUSH is empty, then show the error message.
    if (!FILE_TO_PUSH) {
        alert('pls upload file first');
        return;
    }


    // add file to the project in the server
    const {fileData, fileName } = FILE_TO_PUSH;

    await $.ajax({
        url: `${server}/api/update_file_in_project`,
        type: 'POST',
        data: {
            projectName: projectName,
            fileName: fileName,
            fileData: fileData,
             secret: SECRET
            },
        success: (data) => {
            alert(JSON.stringify(data));
        }, 
        error: (err) => {
            console.log(err);
        }
    });

    // close the modal.
    $('#push-modal').modal('hide');

}

async function openProjectForPull(projectName, files) {

    // empty the project list
    $('#projects-pull-list').empty();

    // append the files to the project list
    $('#projects-pull-list').append(files.split(',').map(name => `
        <li class="btn btn-primary list-group-item d-flex justify-content-between align-items-start" onclick="get_file('${projectName}', '${name}')">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${name}</div>
            </div>
        </li>
    `));

}

async function get_file(projectName, fileName) {

    // get the file from the server
    let encryptedFile = await $.ajax({
        data: {
            "projectName": projectName,
            "fileName": fileName,
            "secret": SECRET
        },
        type: 'GET',
        url: `${server}/api/get_file`
    });

    let file = await decrypt_using_private_key(encryptedFile);

    // hide the modal
    $('#pull-modal').modal('hide');

    // open the file in the editor
    $('#code').html(file);
    $('#card-header').text(fileName);
    hljs.highlightAll();
    $('#code-body').show();
}

async function encrypt_using_server_public_key(text_to_encrypt) {

    // get the server public key from server.
    const {serverPublicKey} = await $.get(`${server}/api/get_server_public_key`);

    // create the initialization vector.
    var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");

    // create the encryption object.
    var aesEncryptor = CryptoJS.algo.AES.createEncryptor(serverPublicKey, { iv: iv });

    // encrypt the text.
    aesEncryptor.process(text_to_encrypt);

    // finalize the encryption object.
    var encrypted = aesEncryptor.finalize();


    return {"encryptedText": encrypted, "initVector": iv};

}

async function decrypt_using_private_key({ iv, encryptedData }) {
            
    // convert all the data to bytes.
    encryptedData = aesjs.utils.hex.toBytes(encryptedData);
    iv = aesjs.utils.hex.toBytes(iv);
    secret = aesjs.utils.hex.toBytes(SECRET);

    // decrypt the bytes.
    var aesCbc = new aesjs.ModeOfOperation.cbc(secret, iv);
    var decryptedBytes = aesCbc.decrypt(encryptedData);

    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    
    // return the decrypted text.
    return decryptedText.replaceAll('\\n', '\n').replaceAll('\\r', '\r');

}

encrypt_json = async (json) => {

    // encrypt the json with the server public key.
    return await encrypt_using_server_public_key(JSON.stringify(json));
}

decrypt_json_list = async (encryptedObj) => {

    // decrypt the json with the private key.
    const decryptedText = await decrypt_using_private_key(encryptedObj);

    // return the decrypted json.
    return JSON.parse(decryptedText.split(']').slice(0, -1).join(']') + ']');

}
