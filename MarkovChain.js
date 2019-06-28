function selectChunk (chunks) {
    //This function selects a chunk randomly using word frequencies as odds for each chunk
    const total = Object.values(chunks).reduce((a, b) => a + b, 0); //Find the total of all the word frequencies
    //Each new value represents its proportion of the sum total, giving it a percentage chance from 0 to 1 of being selected
    Object.keys(chunks).forEach(function (key) {
        chunks[key] /= total;
    })
    var number = Math.random();
    var index = 0;
    const keys = Object.keys(chunks);
    //Subtract the chances of each word from a random number, return the word if the number hits 0
    while (true) {
        number -= chunks[keys[index]];
        if (number <= 0) {
            return keys[index];
        }

    index += 1;
    }
}

function countNonAlphaNums (s) {
    return (s.toLowerCase().match(/[^(a-z0-9)]/gi)||[]).length;
}

// function searchAndDestroy (wordPatterns, string)  {
//
// }

const stopChar = "\n";

module.exports = {
    chunkText: function (inputText, wordPatterns, wordFrequencies) {
        /*This function takes input text, data about each state, and the frequencies of every word
        * wordPatterns has information about each state and looks like:
        * {word A: {word B: # of times B comes after A, word C: # of times C comes after A},
        * word D: {...}}
        * wordFrequencies is an object with words as keys and frequencies as values
        * Each word has value
        */


        inputText += stopChar;
        var text = inputText.split(" ");
        var currentChunk;
        var nextChunk;

        //If any single word has more than non-alpha characters, return the unmodified data
        for(i = 0; i  < text.length; i++){
            if (countNonAlphaNums(text[i]) > 6) {
                console.log("message bad: " + inputText);
                return [wordPatterns, wordFrequencies];
            }
        }
        for(i = 0; i  < text.length - 1; i++){
            currentChunk = text[i];
            nextChunk = text[i+1];
            //If the current chunk is already in the dict, increment all of its values
            //Values include: word frequency and data about the next chunk's frequency
            if (currentChunk in wordPatterns) {
                wordFrequencies[currentChunk] += 1;
                //If the current chunk already has data on the next chunk, increment its values
                if (nextChunk in wordPatterns[currentChunk]) {
                    wordPatterns[currentChunk][nextChunk] += 1;
                } else {
                    wordPatterns[currentChunk][nextChunk] = 1;
                }
            //Otherwise, add currentChunk to the dict and set its values to 1
            } else {
                wordFrequencies[currentChunk] = 1;
                wordPatterns[currentChunk] = {};
                wordPatterns[currentChunk][nextChunk] = 1;
            }

        }
        return [wordPatterns, wordFrequencies];
    },

    makeChain: function (wordPatterns, chunks) {
        /*This function creates a markov chain based on a list of all chunks and a dict
        * with data about the chunks and frequencies of words following those chunks
        */
        var chain = "";
        const startTime = Date.now();
        var currentChunk = selectChunk(chunks);
        var previousChunk;
        chain += currentChunk;
        count = 1;
        while (1) {
            if (Date.now() - startTime >= 50000) {
                return "No chain could be made at this time";
            }
            if (wordPatterns == {}) {
                return "No chain could be made at this time.";
            }
            previousChunk = currentChunk;
            var removal = [];
            if (count > 50) {
                break;
            }


            if (currentChunk in wordPatterns) {
                currentChunk = selectChunk(wordPatterns[currentChunk]);
            } else {
                currentChunk = selectChunk(chunks);
            }


            chain += " " + currentChunk;
            if (currentChunk.includes(stopChar) && count >= 10) {
                break;
            }

            count++;
        }
        return chain;
    }
}
