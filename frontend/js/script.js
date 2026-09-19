const BACKEND_URL = '/api/generate'; 

const btnGenerate = document.getElementById('btnGenerate');
const promptInput = document.getElementById('promptInput');
const negativePromptInput = document.getElementById('negativePromptInput');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const resultImage = document.getElementById('resultImage');

btnGenerate.addEventListener('click', async () => {
  const promptText = promptInput.value.trim();
  
  if (promptText === '') {
    promptInput.classList.add('is-invalid');
    return;
  }
  promptInput.classList.remove('is-invalid');

  btnGenerate.disabled = true;
  btnGenerate.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Generating...';
  emptyState.classList.add('d-none');
  resultImage.classList.add('d-none');
  loadingState.classList.remove('d-none');

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'ok' && data.image) {
      resultImage.src = `data:image/png;base64,${data.image}`; 
      loadingState.classList.add('d-none');
      resultImage.classList.remove('d-none');
    } else {
      throw new Error('Backend responded with an error or invalid format.');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Failed to generate image. Please check the backend connection or API status.');
    loadingState.classList.add('d-none');
    emptyState.classList.remove('d-none');
  } finally {
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = '<i class="bi bi-magic me-1"></i> Generate Image';
  }
});

promptInput.addEventListener('input', () => promptInput.classList.remove('is-invalid'));