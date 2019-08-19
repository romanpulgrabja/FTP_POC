let staticRecipe = [];
const apiURL = "www.myAPI.com/myendpoint";
const dockerKeywords = /(FROM|MAINTAINER|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)/g
let inAdvanced = false;

// List of dependencies to install, important: key name has to be equal to the
// requested debian/ubuntu package.
const dependencies = new Map([["autoconfig", false],["automake", false],
    ["libbz2", false], ["g++", false], ["gcc", false], ["imagemagick", false]]);


//************************************
// General Functions
//************************************

function getOS() {
    const dropdownValue = document.getElementById('selectionSystem').value;
    if (dropdownValue === 'Ubuntu') {
        return 'FROM educloud:ubuntu\n';
    } else if (dropdownValue === 'CentOS') {
        return 'FROM educloud:centOS\n';
    }
}

function startDownload() {
    const recipe = document.getElementById('recipe').value;
    console.log(recipe);
    console.log(staticRecipe);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:/plain;charset=utf-8,' + encodeURIComponent(recipe));
    element.setAttribute('download', 'DOCKERFILE');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function resetRecipe() {
    buildStr = [];
    buildStr.push(getOS());
    buildStr.push(getStaticInstructions());
    buildStr.push(getPipPackages());
    buildStr.push(getDependencies());
    //buildStr.push(getSudoAccess());
    buildStr.push(getPort());
    staticRecipe = buildStr;
    updateRecipeField(staticRecipe);
    $('#resetModal').modal('hide');
}

function getPort() {
    if (document.getElementById('port').value === '') {
        return 'EXPOSE 8080';
    } else {
        return 'EXPOSE ' + document.getElementById('port').value;
    }
}

function getStaticInstructions() {
    //*************************************
    // PUSH YOUR STATIC INSTRUCTIONS HERE!!!!
    //*************************************
    return 'RUN sudo apt-get purge -y python.* && sudo apt-get update && sudo apt-get install -y --no-install-recommends\n';
}

function getPipPackages() {
    const strStart = 'RUN pip3 install ';
    const package = document.getElementById('selectionPackage').value;
    if (package === 'Standard') {
        // based on Top 20 List: https://pythontips.com/2013/07/30/20-python-libraries-you-cant-live-without/
        return(strStart + 'requests scrapy wxpython pillow sqlalchemy beautifulsoup '+
        'twisted numpy scipy matplotlib pygame pyglet pyqt pygtk scapy pywin32 ' +
        'nltk nose sympy ipython\n');
    } else if (package === 'Machine Learning') {
        // based on Top 10 List: https://www.edureka.co/blog/python-libraries/
        return(strStart + 'tensorflow scikit-learn numpy Keras ' +
        'pytorch torchvision lightgbm eli5 scipy Theano pandas\n')
    } else if (package === 'Data Science') {
        // based on Top 20 List: https://bigdata-madesimple.com/top-20-python-libraries-for-data-science/
        return(strStart + 'numpy thano keras pytorch scipy pandas pybrain ' +
        'scikit-learn matplotlib tensorflow seaborn bokeh plotly nltk ' +
        'gensim scrapy3 statsmodels kivy pyqt opencv\n');
    } else if (package === 'Mathematics') {
        // based on Top 11 List: https://www.quora.com/What-are-the-best-Python-mathematics-libraries
        return(strStart + 'numpy pandas scipy matplotlib patsy sympy plotly ' +
        'statsmodels adipy matalg27 mlpstyler\n');
    }
}

function getDependencies() {
    let packageStr = '';
    dependencies.forEach(function (value, key, map) {
        if (value) packageStr += key + " ";
    })
    if(packageStr === "") return "";
    return 'RUN sudo apt-get install ' + packageStr + '\n';
}

function getSudoAccess() {
    if (document.getElementById("chkBoxSudo").checked){
        return 'RUN sudo useradd -u 1001 -G users -d /home/userPython --shell /bin/bash -m userPython && \\\n'+
        'sudo usermod -p "*" userPython && \\\n' +
        'sudo userdel -r user\n' +
        'USER userPython\n'
    } else return "";
}

function toggleAdvancedFlag () {
    inAdvanced = !inAdvanced;
}

function buildStaticInstructions() {
    buildStr = [];
    buildStr.push(getOS());
    buildStr.push(getStaticInstructions());
    buildStr.push(getPipPackages());
    buildStr.push(getDependencies());
    buildStr.push(getSudoAccess());
    buildStr.push(getPort());
    staticRecipe = buildStr;
    let recipe = [];
    if (inAdvanced) {
        console.log("in");
        recipe = compareRecipes();}
    else {
        console.log("in2");
        recipe = staticRecipe};
    updateRecipeField(recipe);
}

function updateRecipeField(recipe) {
    let recipeStr = "";
    for (let i=0; i<recipe.length; i++) recipeStr += recipe[i];
    document.getElementById('recipe').value = recipeStr.replace(/\n$/, "").trim();
    console.log("INININ");
}

function compareRecipes() {
    if (document.getElementById('recipe').value === "") {
        return staticRecipe;
    }
    advancedRecipe = cutAdvancedRecipe();
    let returnRecipe = []
    // Compare staticRecipe and the recipe sliced from the recipe field. If they
    // are the same one will be used for the output. If the advanced contains
    // the static the advanced recipe will be appended to the output. If both
    // recipes are different, both reciupes will be attended. It is up to the
    // user to then select the one he wants to keep.
    let itAdv = 0;
    let itStc = 0;
    while(itStc < staticRecipe.length && itAdv < advancedRecipe.length){
        if (staticRecipe[itStc] === ""){
            itStc++;
        } else if (advancedRecipe[itAdv].includes(staticRecipe[itStc]) ||
            staticRecipe[itStc].includes(advancedRecipe[itAdv])) {
            returnRecipe.push(advancedRecipe[itAdv]);
            itStc++;
            itAdv++;
        } else {
            returnRecipe.push(advancedRecipe[itAdv]);
            itAdv++;
        }
    }
    returnRecipe[returnRecipe.length-1] += " \n";
    for(; itStc<staticRecipe.length; itStc++) {
        console.log("in");
        returnRecipe.push(staticRecipe[itStc])};
    for(; itAdv<advancedRecipe.length; itAdv++) {
        console.log("in2");
        returnRecipe.push(advancedRecipe[itAdv])};
    return returnRecipe;
}

function cutAdvancedRecipe() {
    advancedRecipe = [];
    let recipe = document.getElementById('recipe').value;
    // Split the recipe on every dockerfile keyword and append it to the output
    // recipe.substr(1).search(dockerKeywords) is a workaround so search() does
    // not use the beginning of the string (the current starting keyword) as a result
    for (let pos = recipe.substr(1).search(dockerKeywords); pos != -1;){
        advancedRecipe.push(recipe.substr(0, pos+1));
        // To cut at the right position it needs to be +1 and +1 for the \n character
        recipe = recipe.substr(pos+1);
        pos = recipe.substr(1).search(dockerKeywords);
    }
    advancedRecipe.push(recipe);
    return advancedRecipe;
}


//************************************
// Event Listener functions
//************************************

window.onload = function () {
    const chkBoxContainer = document.getElementById('checkboxes');
    dependencies.forEach(function (value, key, map) {
        chkBoxContainer.innerHTML +=
            `<div class='form-group form-check'>
                <label class='form-check-label'>
                    <input class='form-check-label' id=chkBox` + key + ` type='checkbox' onchange="buildStaticInstructions()">
                    ` + key + `
                </label>
            </div>\n`;
    })
    buildStaticInstructions();
};

function addDependency() {
    const value = document.getElementById('chkBoxInput').value;
    if(value === "" || dependencies.has(value)) return;
    const chkBoxContainer = document.getElementById('checkboxes');
    chkBoxContainer.innerHTML +=
        `<div class='form-group form-check'>
            <label class='form-check-label'>
                <input class='form-check-label' id=chkBox` + value + ` type='checkbox' onchange="buildStaticInstructions()">
                ` + value + `
            </label>
        </div>\n`;
    dependencies.set(value, true);
    document.getElementById('chkBoxInput').value = "";
};

function updateDependencies() {
    dependencies.forEach(function (value, key, map){
        dependencies.set(key, document.getElementById('chkBox'+key).checked);
    })
};
