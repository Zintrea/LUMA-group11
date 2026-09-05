const imageUpload = document.getElementById('imageUpload');
const btnProcess = document.getElementById('btnProcess');
const btnDownload = document.getElementById('btnDownload');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const resultImage = document.getElementById('resultImage');

let uploadedFile = null;

imageUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedFile = file;
  const reader = new FileReader();
  
  reader.onload = function(event) {
    emptyState.classList.add('d-none');
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
  loadingState.classList.remove('d-none');

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const fakeResultUrl = `https://placehold.co/512x512/transparent/FFFFFF/png?text=Background%5CnRemoved`;
    
    loadingState.classList.add('d-none');
    resultImage.src = fakeResultUrl; 
    resultImage.classList.remove('d-none');
    btnDownload.classList.remove('d-none');
  } catch (error) {
    alert('Error connecting to the processing server.');
    loadingState.classList.add('d-none');
    resultImage.classList.remove('d-none'); 
  } finally {
    btnProcess.disabled = false;
    btnProcess.innerHTML = '<i class="bi bi-eraser-fill me-1"></i> Remove Background';
  }
});

btnDownload.addEventListener('click', () => {
  const downloadLink = document.createElement('a');
  downloadLink.download = 'LUMA_rembg_result.png'; 
  downloadLink.href = resultImage.src;
  downloadLink.click(); 
});