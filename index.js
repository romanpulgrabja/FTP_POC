// this will be our dockerfile
let buildStr = [];
// list of dependencies to install, important: key name has to be equal to the id of the checkbox input
let apiURL = "www.myAPI.com/myendpoint";

const dependencies = {
    "autoconfig": false, "automake": false, "libbz2": false,
    "g++": false, "gcc": false, "imagemagick": false
};

function setPort() {
    if (document.getElementById('port').value === '') {
        return 8080;
    } else {
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
    // client.send();
}

function updatePreview(build) {
    document.getElementById('recipe').value = build.join("\n");
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

function installDependencies(skip) {
    // clear array first to prevent duplicate files
    buildStr = [];
    buildStr.push('RUN sudo apt-get purge -y python.* && sudo apt-get update && sudo apt-get install -y --no-install-recommends \\');
    for (let key in dependencies) {
        if (dependencies.hasOwnProperty(key) && dependencies[key] === true) {
            buildStr.push(key + ' \\');
        }
    }
    //*************************************
    // PUSH YOUR STATIC INSTRUCTIONS HERE!!!!
    //*************************************

    /*
    Installing Python Modules based on selection
     */
    const selectionValue = document.getElementById('selectionPackage').value;
    buildStr.push('RUN pip3 install \\');  // default begin for any Python module install
    if (selectionValue === 'Standard') {
        buildStr.push('PIP STANDARD SET');
    } else if (selectionValue === 'Machine Learning') {
        /* based on Top 10 List: https://www.edureka.co/blog/python-libraries/
        /* this includes: Tensorflow, Scikit-Learn, Numpy, Keras, PyTorch, LightGBM, Eli5,
        Scipy, Theano and Pandas
        */
        buildStr.push('tensorflow scikit-learn numpy Keras ' +
            'https://download.pytorch.org/whl/cpu/torch-1.0.1-cp37-cp37m-win_amd64.whl ' +
            'torchvision lightgbm eli5 scipy Theano pandas')

    } else if (selectionValue === 'Data Science') {
      // based on Top 20 List: https://bigdata-madesimple.com/top-20-python-libraries-for-data-science/
        buildStr.push('numpy thano keras pytorch scipy pandas pybrain' +
              'scikit-learn matplotlib tensorflow seaborn bokeh plotly nltk' +
              'gensim scrapy3 statsmodels kivy pyqt opencv');
    } else if (selectionValue === 'Mathematics') {
        buildStr.push('PIP MATHEMATICS SET');
    }
    // at last set port to which the file should be exposed to
    buildStr.push('EXPOSE ' + setPort());
    // update the preview for advanced mode
    updatePreview(buildStr);
    if (skip === true) {
        // pass, in this case it was called from opening Advanced Mode
    }
    else {
        // show notification that the build was successful
        displayBuildSuccess('successMessage');
    }
}

function displayBuildSuccess(id) {
    let x = document.getElementById(id);
    if (x.style.display === 'none') {
        x.style.display = 'block';
    }
}

function runBuilder(skip = false) {
    for (let key in dependencies) {
        dependencies[key] = document.getElementById(key).checked;
    }
    // called from Advanced Button
    if (skip === true) {
        // disable/enable the Build button when advanced is shown
        document.getElementById('buildButton').disabled = document.getElementById('buildButton').disabled === false;
    }
    installDependencies(skip);
}

function advancedBuild() {
    let dockerfile = document.getElementById('recipe').value;
    console.log(dockerfile);
    displayBuildSuccess('successPreviewMessage')
}

// borrowed this from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// posting buildstring to che API
function postData(url = '', data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
        .then(response => response.json()); // parses JSON response into native JavaScript objects
}
