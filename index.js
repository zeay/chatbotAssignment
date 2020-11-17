require('util').inspect.defaultOptions.depth = null
const fs = require('fs');
const axios = require('axios');
const words = {};
const sortObjectCount = 10;
const wordLength = 4;
const wordsArray = [];
const savingResult = [];
let incrementer = 0

fs.readFile('./big.txt', 'utf8', (err, data) => {
     if(!err){
        mapText(data);
     }else{
         console.log(err);
     }
 });


function performApiCall () { 
axios.get('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf&lang=en-en&text='+wordsArray[incrementer])
  .then(function (response) {
    // handle success
    let result = response.data.def;
    if(result.length > 0){
        let obj = {};
        obj[wordsArray[incrementer]] = result;
        savingResult.push(obj);
    }
    incrementer += 1;
    if(incrementer < wordsArray.length){
        // calling API one by one
        performApiCall();
    }else{
        //writing to disk
        let filename = Date.now();
        let stringifyData = JSON.stringify(savingResult);
        fs.writeFile('./'+filename+'.json', stringifyData, 'utf8', (err) =>{
            if(!err){
                console.log('write completed');
                console.log('File Name is '+filename);
            }else{
                console.log('error writing file to disk');
            }
        })
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
}

function sortObjectEntries(obj, n){
    return  Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n)
}

 function mapText(data){
    let text = data.split('\n');
    text.forEach((item)=>{
        let singleWord = item.split(' ');
        singleWord.forEach((item, index)=>{
            let replaced = item.replace(/[^a-zA-Z ]/g, "");
            if(replaced && replaced.length > wordLength){
                if(words[replaced]){
                    words[replaced] += 1;
                }else{
                    words[replaced] = 1;
                }
            }
        })
    });
    let topWords = sortObjectEntries(words, sortObjectCount);
    // console.log(topWords);
    topWords.forEach((item) => { 
        wordsArray.push(item[0]);
    })
    console.log('------------------Sorted Words---------------------');
    console.log(wordsArray);
    console.log('----------------------------------------------------');
    performApiCall();
 }