const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

class PrcessCsv {
  static async upload(file) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(__dirname, 'uploads', file.filename);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject('Error reading file');
        }

        const parsedData = Papa.parse(data, {
          header: true,
          skipEmptyLines: true
        });

        console.log("data here =====>",parsedData.data);
        resolve(parsedData.data);
      });
    });
  }
}

module.exports = PrcessCsv;
