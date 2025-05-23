
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const videoInput = document.getElementById('videoInput');
const videoPlayer = document.getElementById('videoPlayer');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const trimButton = document.getElementById('trimButton');
const output = document.getElementById('output');

let selectedFile;

videoInput.addEventListener('change', (e) => {
  selectedFile = e.target.files[0];
  videoPlayer.src = URL.createObjectURL(selectedFile);
  videoPlayer.onloadedmetadata = () => {
    endTime.value = Math.floor(videoPlayer.duration);
  };
});

trimButton.addEventListener('click', async () => {
  if (!selectedFile) return alert('Please select a video.');

  const start = parseFloat(startTime.value);
  const end = parseFloat(endTime.value);

  if (end <= start) return alert('End time must be greater than start time.');

  output.innerHTML = '⏳ Processing...';

  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(selectedFile));
  await ffmpeg.run('-i', 'input.mp4', '-ss', `${start}`, '-to', `${end}`, '-c', 'copy', 'output.mp4');

  const data = ffmpeg.FS('readFile', 'output.mp4');
  const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

  output.innerHTML = `
    <h3>✅ Trimmed Video:</h3>
    <video controls src="${url}" style="width: 100%;"></video>
    <a href="${url}" download="trimmed.mp4">⬇️ Download</a>
  `;
});
