const { exec } = require("child_process");
const EXEC_OPTS = { maxBuffer: 1024 * 1024 * 50 };

function probeCodec(inputPath) {
  return new Promise((resolve) => {
    exec(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "${inputPath}"`, EXEC_OPTS, (err, stdout) => {
      resolve(err ? null : stdout.trim());
    });
  });
}

async function smartTranscode(inputPath, outputPath, crf = 18) {
  const codec = await probeCodec(inputPath);
  const cmd = codec === "h264"
    ? `ffmpeg -y -i "${inputPath}" -c copy -movflags +faststart "${outputPath}"`
    : `ffmpeg -y -i "${inputPath}" -c:v libx264 -crf ${crf} -preset veryfast -c:a aac -movflags +faststart -pix_fmt yuv420p "${outputPath}"`;
  return new Promise((resolve, reject) => {
    exec(cmd, EXEC_OPTS, (err, stdout, stderr) => err ? reject(stderr || err.message) : resolve());
  });
}

module.exports = { smartTranscode };
