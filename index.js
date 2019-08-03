// this will be our dockerfile
var buildStr = [];
// list of dependencies to install
var dependencies = {"autoconf": true, "automake": true, "bzip": true, "file": true, "g++": true, "gcc": true, };
var ENV_map = {};
var port = "8080";

function setPort() {
    return document.getElementById('port').value === null ? "8080" : document.getElementById('port').value;
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
    }
    else if (OS === 'centOS') {
        buildStr[0] = 'FROM educloud:centOS\n';
    }
}

function setDependencies() {
    for(key in dependencies) {
        if (dependencies.hasOwnProperty(key)) {
            //alternative method if value is not set by checkbox
            if (key === 'something' || key === 'somethingelse') {
                // method to read from non-checkbox
            }
            //only works for checkboxes
            dependencies[key] = document.getElementById(key).value;
        }
    }
}

function installDependencies() {
    buildStr.push('RUN sudo apt-get purge -y python.* &&   sudo apt-get update &&   sudo apt-get install -y --no-install-recommends \\');
    for (let key in dependencies) {
        if (dependencies.hasOwnProperty(key) && dependencies[key] === true) {
            buildStr.push(key + ' \\');
        }
    }
    //*************************************
    // PUSH YOUR STATIC INSTRUCTIONS HERE!!!!
    //*************************************
    //at last set port to which the file should be exposed to
    buildStr.push('EXPOSE ' + port);
}

function compileDF() {
    return buildStr.join('\n');
}

function runBuilder() {
    dependencies['gcc'] = document.getElementById('gcc').value;
    // setDependencies();
    installDependencies();
    console.log(compileDF())
}

