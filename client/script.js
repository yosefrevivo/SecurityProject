server = 'http://localhost:3001';

$(document).ready(() => {

    // Initialize the page

    initPage();

});

async function initPage() {

    $('#code-body').hide();

    // show the project list in the modal
    await showProjectList();

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

    // open the file in the editor
    $('#code').html(file);
    $('#card-header').text(fileName);
    hljs.highlightAll();
    $('#code-body').show();


}