let server = 'http://localhost:3001';

$(document).ready(() => {

    // Initialize the page

    initPage();

});

async function initPage() {

    $('#code-body').hide();

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

    // open the file in the editor
    $('#code').html(file);
    $('#card-header').text(fileName);
    hljs.highlightAll();
    $('#code-body').show();
}