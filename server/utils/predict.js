const { exec } = require('child_process');
const path = require('path');

async function predictDisease(imagePath) {
  return new Promise((resolve, reject) => {
    // Corrected path to the predict.py file inside the utils folder
    const scriptPath = path.resolve(__dirname, 'predict.py');
    const command = `python "${scriptPath}" "${imagePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(stderr);
        return;
      }
      
      const prediction = stdout.trim();
      resolve(prediction);
    });
  });
}

module.exports = { predictDisease };
