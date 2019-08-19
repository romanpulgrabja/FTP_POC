/**
 * An Array of strings that holds the docker instruction derived from the selected
 * inputs.
 * @type {Array[String]}
 */
let staticRecipe = [];
/**
 * RegExp to find docker keywords in a string.
 * @type {RegExp}
 */
const dockerKeywords = /(FROM|MAINTAINER|RUN|CMD|LABEL|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)/g
/**
 * Flag that shows if the advanced recipe field is visible
 * @type {Boolean}
 */
let inAdvanced = false;
/**
 * Map of the predefined debian/ubuntu package dependencies. The key corresponds
 * to the package name. The value shows if the dependency is selected to be included
 * in the dockerfile. It is important that the key is exactly the same as the
 * needed package!
 * @type {Map}
 */
const dependencies = new Map([["autoconfig", false],["automake", false],
    ["libbz2", false], ["g++", false], ["gcc", false], ["imagemagick", false]]);



//************************************
// General Functions
//************************************

/**
* Function finds the selected OS from the dropdown
 * @return {String} Docker keyword with the selected OS docker image
 */
function getOS() {
    const dropdownValue = document.getElementById('selectionSystem').value;
    if (dropdownValue === 'Ubuntu') {
        return 'FROM educloud:ubuntu\n';
    } else if (dropdownValue === 'CentOS') {
        return 'FROM educloud:centOS\n';
    }
};

/**
 * Function resets the recipe field to the static recipe.
 */
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
};

/**
 * function finds the selected Port from the input fields
 * @return {String} Docker keyword with the inputed port number
 */
function getPort() {
    if (document.getElementById('port').value === '') {
        return 'EXPOSE 8080';
    } else {
        return 'EXPOSE ' + document.getElementById('port').value;
    }
};

/**
 * function that returns a couple of static functions.
 * @return {string} Docker keyword and the commands that should be run on the image
 */
function getStaticInstructions() {
    //*************************************
    // PUSH YOUR STATIC INSTRUCTIONS HERE!!!!
    //*************************************
    return 'RUN sudo apt-get purge -y python.* && sudo apt-get update && sudo apt-get install -y --no-install-recommends\n';
};

/**
 * function that returns the selected pip packagelist from the dropdownValue
 * @return {string} Docker keyword with the pip command that will be run on the image
 */
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
};

/**
 * function that returns the debian/ubuntu packages from the checkboxes
 * @return {String} Docker keyword with the apt-get command that will be run on the image
 */
function getDependencies() {
    let packageStr = '';
    dependencies.forEach(function (value, key, map) {
        if (value) packageStr += key + " ";
    })
    if(packageStr === "") return "";
    return 'RUN sudo apt-get install ' + packageStr + '\n';
};

/**
 * function that returns a string that can revoke the sudo access from the user
 * @return {String} Docker Keyword with the sudo command that will create a new
 * user without sudo access and then deletes the basic user.
 */
function getSudoAccess() {
    if (document.getElementById("chkBoxSudo").checked){
        return 'RUN sudo useradd -u 1001 -G users -d /home/userPython --shell /bin/bash -m userPython && \\\n'+
        'sudo usermod -p "*" userPython && \\\n' +
        'sudo userdel -r user\n' +
        'USER userPython\n'
    } else return "";
};

/**
 * function that toggles the AdvancedFlag that shows if the advanced recipe
 * field is visible
 */
function toggleAdvancedFlag () {
    inAdvanced = !inAdvanced;
};

/**
 * function runs the getter functions for the dockerfile parts and the calls
 * the compareRecipes() function if the advanced recipe field is visible.
 */
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
        recipe = compareRecipes();}
    else {
        recipe = staticRecipe};
    updateRecipeField(recipe);
};

/**
 * function that updates the value of the recipe field
 * @param  {Array[String]} recipe Array of the docker strings
 */
function updateRecipeField(recipe) {
    let recipeStr = "";
    for (let i=0; i<recipe.length; i++) recipeStr += recipe[i];
    document.getElementById('recipe').value = recipeStr.replace(/\n$/, "").trim();
};

/**
 * function that compares the computed static recipe and the cut recipe from the
 * advanced recipe field. If both are the same, the advanced contains the static
 * or the other way around the advanced part will be used. If they are different
 * the function loks if any of the remaining parts fit together. Otherwise they
 * will both be appended at the end
 * @return {String} Merged Array that contains both instruction elements.
 */
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
        returnRecipe.push(staticRecipe[itStc])};
    for(; itAdv<advancedRecipe.length; itAdv++) {
        returnRecipe.push(advancedRecipe[itAdv])};
    return returnRecipe;
};

/**
 * Function that takes the value of the advanced recipe field and splits it at
 * docker keywords into an array.
 * @return {Array[String]} Array of strings that contain the cut docker instructions
 */
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
};



//************************************
// Event Listener functions
//************************************

/**
 * Event Listener for the window.onload event. Adds the predefined debian/ubuntu
 * package dependencies to the HTML view and runs the buildStaticInstructions()
 * function once.
 */
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

/**
 * Event Listener for the onclick event of the "addButton" button element in the
 * HTML view. Adds a new debian/sudo dependency to the view and the global map.
 * After that it will run the buildStaticInstructions() function once.
 */
function addDependency() {
    const value = document.getElementById('chkBoxInput').value;
    if(value === "" || dependencies.has(value)) return;
    const chkBoxContainer = document.getElementById('checkboxes');
    chkBoxContainer.innerHTML +=
        `<div class='form-group form-check'>
            <label class='form-check-label'>
                <input class='form-check-label' checked="true" id=chkBox` + value + ` type='checkbox' onchange="buildStaticInstructions()">
                ` + value + `
            </label>
        </div>\n`;
    dependencies.set(value, true);
    document.getElementById('chkBoxInput').value = "";
    buildStaticInstructions();
};

/**
 * Event Listener for onclick event of the "downloadButton" button element in the
 * HTML view. Creates a new href element containing the value of the recipe field.
 * Then it simulates a click on that element, which will start the download.
 * @return {[type]} [description]
 */
function startDownload() {
    const recipe = document.getElementById('recipe').value;
    let element = document.createElement('a');
    element.setAttribute('href', 'data:/plain;charset=utf-8,' + encodeURIComponent(recipe));
    element.setAttribute('download', 'DOCKERFILE');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
