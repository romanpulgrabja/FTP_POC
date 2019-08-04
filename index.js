// this will be our dockerfile
let buildStr = [];
// list of dependencies to install, important: key name has to be equal to the id of the checkbox input
const dependencies = {
    "autoconfig": false, "automake": false, "libbz2": false,
    "label-example": false, "g++": false, "gcc": false, "imagemagick": false
};

function setPort() {
    if (document.getElementById('port').value === '') {
        return 8080;
    }
    else {
        return document.getElementById('port').value;
    }
}

function readTxt() {
    textArea = document.getElementById('recipe');
    var client = new XMLHttpRequest();
    client.open('GET', 'recipe.txt');
    client.onreadystatechange = function () {
        textArea.value = client.responseText;
    };
    client.send();
}

function selectOS(OS) {
    //add needed OS
    if (OS === 'ubuntu') {
        buildStr[0] = 'FROM educloud:ubuntu';
    } else if (OS === 'centOS') {
        buildStr[0] = 'FROM educloud:centOS\n';
    }
}

function setDependencies() {
    for (key in dependencies) {
        if (dependencies.hasOwnProperty(key)) {
            //alternative method if value is not set by checkbox
            if (key === 'something' || key === 'somethingelse') {
                // method to read from non-checkbox
            }
            //only works for checkboxes
            dependencies[key] = document.getElementById(key).checked;
        }
    }
}

function installDependencies() {
    // clear array first to prevent duplicate files
    buildStr = [];
    buildStr.push('RUN sudo apt-get purge -y python.* &&   sudo apt-get update &&   sudo apt-get install -y --no-install-recommends \\');
    for (let key in dependencies) {
        if (dependencies.hasOwnProperty(key) && dependencies[key] === true) {
            console.log(key + 'hello');
            buildStr.push(key + '\\');
        }
    }
    //*************************************
    // PUSH YOUR STATIC INSTRUCTIONS HERE!!!!
    //*************************************
    //at last set port to which the file should be exposed to
    buildStr.push('EXPOSE ' + setPort());
}

function compileDF() {
    return buildStr.join('\n');
}

function runBuilder() {
    for (let key in dependencies) {
        dependencies[key] = document.getElementById(key).checked;
    }
    // setDependencies();
    installDependencies();
    alert(compileDF());
}

