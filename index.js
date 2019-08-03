
// this will be our dockerfile
let buildString = [];
// list of dependencies to install
let dependencies = {"autoconf": true, "automake": true, "bzip": true, "file": true, "g++": true, "gcc": true, };
let ENV_map = {};
let port = document.getElementById('port').value;

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
        buildString[0] = 'FROM educloud:ubuntu';
    }
    else if (OS === 'centOS') {
        buildString[0] = 'FROM educloud:centOS\n';
    }
}
function installDependencies() {
    buildString.push('RUN sudo apt-get purge -y python.* &&   sudo apt-get update &&   sudo apt-get install -y --no-install-recommends \\');
    for (let key in dependencies) {
        if (dependencies.hasOwnProperty(key) && dependencies[key] === true) {
            buildString.push(key + ' \\');
        }
    }
    //*************************************
    // PUSH YOUR STATIC INSTRUCTIONS HERE!!!!
    //*************************************
    //at last set port to which the file should be exposed to
    buildString.push('EXPOSE ' + port);
}

function compileDF() {
    return buildString.join('\n');
}

