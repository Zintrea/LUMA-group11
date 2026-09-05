const imageUpload = document.getElementById('imageUpload');
const upscaleFactor = document.getElementById('upscaleFactor');
const upscalerModel = document.getElementById('upscalerModel');
const btnProcess = document.getElementById('btnProcess');
const btnDownload = document.getElementById('btnDownload');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const resultImage = document.getElementById('resultImage');
const imageInfo = document.getElementById('imageInfo');
const oldResText = document.getElementById('oldRes');
const newResText = document.getElementById('newRes');

let uploadedFile = null;
let originalWidth = 0;
let originalHeight = 0;

imageUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedFile = file;
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      originalWidth = img.width;
      originalHeight = img.height;
    };
    img.src = event.target.result;

    emptyState.classList.add('d-none');
    imageInfo.classList.add('d-none');
    resultImage.src = event.target.result;
    resultImage.classList.remove('d-none');
    btnProcess.disabled = false;
    btnDownload.classList.add('d-none');
  }
  reader.readAsDataURL(file);
});

btnProcess.addEventListener('click', async () => {
  if (!uploadedFile) return;
  btnProcess.disabled = true;
  btnProcess.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';
  
  resultImage.classList.add('d-none');
  imageInfo.classList.add('d-none');
  loadingState.classList.remove('d-none');

  const factor = parseInt(upscaleFactor.value);
  const model = upscalerModel.value;

  try {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const fakeResultUrl = `https://placehold.co/800x800/123456/FFFFFF/png?text=HD+Upscaled%5CnModel:+${encodeURIComponent(model)}`;
    
    loadingState.classList.add('d-none');
    resultImage.src = fakeResultUrl; 
    resultImage.classList.remove('d-none');
    
    oldResText.innerText = `${originalWidth}x${originalHeight}`;
    newResText.innerText = `${originalWidth * factor}x${originalHeight * factor}`;
    imageInfo.classList.remove('d-none');
    btnDownload.classList.remove('d-none');
  } catch (error) {
    alert('Error connecting to the Upscale server.');
    loadingState.classList.add('d-none');
    resultImage.classList.remove('d-none'); 
  } finally {
    btnProcess.disabled = false;
    btnProcess.innerHTML = '<i class="bi bi-arrows-angle-expand me-1"></i> Upscale Image';
  }
});

btnDownload.addEventListener('click', () => {
  const downloadLink = document.createElement('a');
  downloadLink.download = 'LUMA_upscaled_result.png'; 
  downloadLink.href = resultImage.src;
  downloadLink.click(); 
});