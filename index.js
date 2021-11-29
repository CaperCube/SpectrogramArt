////////////////////////////////////////
// required packages
////////////////////////////////////////
const express = require('express');

////////////////////////////////////////
// Server constsants
////////////////////////////////////////
const PORT = process.env.PORT || 3001;
const app = express();
const serv = require('http').Server(app);

////////////////////////////////////////
// File Stream
////////////////////////////////////////
const fs = require("fs");
const { callbackify } = require('util');

// Exports the given array as a text file 
function ExportFile(stringArray, fName, dir) {
    // Get dir
    var fileDir = dir || "";
    
    // Format array for text file
    var saveData = "";
    for (var i = 0; i < stringArray.length; i++) {
        if (i === 0) saveData += stringArray[i];
        else saveData += `\n${stringArray[i]}`;
    }

    // Save file
    if (fileDir != "") {
        // Create directory if it doesn't exist
        if (!fs.existsSync(fileDir)){
            fs.mkdirSync(fileDir);
        }
        // Write file to directory
        fs.writeFile(`${fileDir}/${fName}`, saveData, function(err, data){
            if (err) {
                return console.log(err);
            }
        });
    }
    else {
        // Write file
        fs.writeFile(`./${fName}`, saveData, function(err, data){
            if (err) {
                return console.log(err);
            }
        });
    }
}

// Imports the given file as a string array
function ImportFile(fName, callback) {
    let output = [];
    // Read entire file and split it up
    if (fs.existsSync(fName)){
        fs.readFile(fName, function(err, data) {
            if(err) throw err;
            var array = data.toString().split("\n");
            for(i in array) {
                // Append each line to array
                array[i] = array[i].replace(/(\r\n|\n|\r)/gm, ""); // removes text file formats and line breaks
                output.push(array[i]);
            }

            console.log(`File ${fName} has finished loading.`);
            //console.log(output);
            callback(output);
        });
    }
    else {
        const message = `${fName} does not exist.`; 
        console.log(message);
    }
}

// Parse the loaded CSV
function ParseCSV(csvArray, callback) {
    let outputObj = {};
    let chunks = [];
    for (let i = 0; i < csvArray.length; i++) {
        // Remove all lines starting with "//"
        if (csvArray[i].startsWith("//")) continue; // Skip this iteration
        
        // Split at commas unless in quotes
        chunks.push(csvArray[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/) );// RegEx: https://regex101.com/r/eJ9jP3/1

        // Remove triple quotes
        for (let j = 0; j < chunks[chunks.length - 1].length; j++) {
            chunks[chunks.length - 1][j] = chunks[chunks.length - 1][j].replace(/"([^"]+(?="))"/g, '$1').replace(/"([^"]+(?="))"/g, '$1').replace(/"([^"]+(?="))"/g, '$1');
        }
    }

    // Parse into a .json object
    let lastKey = '';
    for (let i = 0; i < chunks.length; i++) {
        if (chunks[i]) {
            // Nodes
            // If the chunk starts with a filled segment
            if (chunks[i][0] !== '') {
                lastKey = chunks[i][0];
                outputObj[lastKey] = {
                    speaker: chunks[i][1],
                    lines: [],
                    responses: []
                    //option: true
                    //setting: false
                };
            }
            // Lines
            // If the chunk starts with an empty segment
            else if (chunks[i][1] !== '') {
                if (outputObj[lastKey]) {
                    outputObj[lastKey].lines.push(chunks[i][1]);
                }
            }
            // Responses
            // If the chunk starts with two empty segments and the third is not empty
            else if (chunks[i][2]) {
                if (outputObj[lastKey]) {
                    outputObj[lastKey].responses.push({
                        text: chunks[i][2],
                        node: chunks[i][3] ? chunks[i][3] : '',
                        event: chunks[i][4] ? chunks[i][4] : -1
                    });
                }
            }
        }
    }
    
    callback(outputObj);
}

////////////////////////////////////////
// Server setup
////////////////////////////////////////
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname + '/client'));

// listen for requests
serv.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

///////////////////////////////////////
// Server started
///////////////////////////////////////
console.log(
    "Server has started!"
    //`Convert .CSV: http://localhost:${PORT}/convert`
    //`UI test: http://localhost:${PORT}/testing/ui/testui.html`
);