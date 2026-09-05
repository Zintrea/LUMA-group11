const btnGenerate = document.getElementById('btnGenerate');
const promptInput = document.getElementById('promptInput');
const negativePromptInput = document.getElementById('negativePromptInput');
const aiModel = document.getElementById('aiModel');
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    const fakeImageUrl = `https://placehold.co/512x512/3a0088/FFFFFF/png?text=${encodeURIComponent(aiModel.value.toUpperCase())}+Image%5Cn${encodeURIComponent(promptText.substring(0, 15))}...`;
    
    loadingState.classList.add('d-none');
    resultImage.src = fakeImageUrl; 
    resultImage.classList.remove('d-none');
  } catch (error) {
    alert('Error connecting to the AI server.');
    loadingState.classList.add('d-none');
    emptyState.classList.remove('d-none');
  } finally {
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = '<i class="bi bi-magic me-1"></i> Generate Image';
  }
});

promptInput.addEventListener('input', () => promptInput.classList.remove('is-invalid'));