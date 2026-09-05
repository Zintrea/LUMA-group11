const brushSizeSlider = document.getElementById('brushSize');
if(brushSizeSlider) {
  const brushSizeVal = document.getElementById('brushSizeVal');
  brushSizeSlider.addEventListener('input', function() { brushSizeVal.innerText = this.value; });
}

const imageUpload = document.getElementById('imageUpload');
const imageCanvas = document.getElementById('imageCanvas');
const maskCanvas = document.getElementById('maskCanvas');
const ctxImage = imageCanvas ? imageCanvas.getContext('2d') : null;
const ctxMask = maskCanvas ? maskCanvas.getContext('2d') : null;
const canvasContainer = document.getElementById('canvasContainer');
const placeholderText = document.getElementById('placeholderText');
let originalImage = null; 

if(imageUpload) {
  imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        originalImage = img;
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;

        const containerWidth = canvasContainer.clientWidth - 40; 
        const containerHeight = 460; 
        const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
        const finalScale = scale > 1 ? 1 : scale; 
        
        const displayWidth = img.width * finalScale;
        const displayHeight = img.height * finalScale;

        imageCanvas.style.width = displayWidth + 'px';
        imageCanvas.style.height = displayHeight + 'px';
        maskCanvas.style.width = displayWidth + 'px';
        maskCanvas.style.height = displayHeight + 'px';

        ctxImage.drawImage(img, 0, 0);
        ctxMask.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        placeholderText.classList.add('d-none');
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(file);
  });
}

let isDrawing = false;
let currentTool = 'brush'; 
let lastX = 0, lastY = 0;

const btnBrush = document.getElementById('btnBrush');
const btnErase = document.getElementById('btnErase');
const btnClear = document.getElementById('btnClear');

function setActiveTool(tool) {
  currentTool = tool;
  if (tool === 'brush') {
    btnBrush.classList.add('active');
    btnErase.classList.remove('active');
  } else if (tool === 'erase') {
    btnErase.classList.add('active');
    btnBrush.classList.remove('active');
  }
}

if(btnBrush) btnBrush.addEventListener('click', () => setActiveTool('brush'));
if(btnErase) btnErase.addEventListener('click', () => setActiveTool('erase'));
if(btnClear) btnClear.addEventListener('click', () => { ctxMask.clearRect(0, 0, maskCanvas.width, maskCanvas.height); });

function getMousePos(e) {
  const rect = maskCanvas.getBoundingClientRect(); 
  const scaleX = maskCanvas.width / rect.width;
  const scaleY = maskCanvas.height / rect.height;
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
}

if(maskCanvas) {
  maskCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x; lastY = pos.y;
  });

  maskCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const brushSize = document.getElementById('brushSize').value; 
    
    ctxMask.lineWidth = brushSize;
    ctxMask.lineCap = 'round';
    ctxMask.lineJoin = 'round';

    if (currentTool === 'brush') {
      ctxMask.globalCompositeOperation = 'source-over';
      ctxMask.strokeStyle = '#ffffff'; 
    } else {
      ctxMask.globalCompositeOperation = 'destination-out';
    }

    ctxMask.beginPath();
    ctxMask.moveTo(lastX, lastY);
    ctxMask.lineTo(pos.x, pos.y);
    ctxMask.stroke();

    lastX = pos.x; lastY = pos.y;
  });

  maskCanvas.addEventListener('mouseup', () => isDrawing = false);
  maskCanvas.addEventListener('mouseout', () => isDrawing = false);
}

const btnExport = document.getElementById('btnExport');
if(btnExport) {
  btnExport.addEventListener('click', () => {
    if (!originalImage) {
      alert('Please upload an image first.');
      return;
    }
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = maskCanvas.width;
    tempCanvas.height = maskCanvas.height;
    tempCtx.fillStyle = '#000000';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(maskCanvas, 0, 0);

    const dataURL = tempCanvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = 'LUMA_mask.png'; 
    downloadLink.href = dataURL;
    downloadLink.click(); 
  });
}