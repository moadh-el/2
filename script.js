// 🔥 TA CLÉ PERPLEXITY INTÉGRÉE
const PERPLEXITY_API_KEY = '';
const API_URL = 'https://api.perplexity.ai/chat/completions';

let currentImage = null;
let stream = null;

// Éléments
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const fileInput = document.getElementById('fileInput');
const aiResponse = document.getElementById('aiResponse');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Événements
startCameraBtn.onclick = startCamera;
captureBtn.onclick = capturePhoto;
analyzeBtn.onclick = analyzeImage;
fileInput.onchange = loadFile;
window.onload = initApp;

function initApp() {
  console.log('🚀 AI4GOOD démarré avec Perplexity');
  testAPI();
}

async function testAPI() {
  statusText.textContent = '🧪 Connexion Perplexity...';
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        max_tokens: 5,
        messages: [{role: "user", content: "OK"}]
      })
    });
    
    if (res.ok) {
      statusDot.className = 'status-dot online';
      statusText.textContent = '✅ Perplexity CONNECTÉ';
      console.log('✅ API OK ! Prêt pour photos PC');
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch(e) {
    console.error('❌ API Error:', e);
    statusDot.className = 'status-dot offline';
    statusText.textContent = '❌ Problème connexion';
  }
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment', width: 640, height: 480 } 
    });
    video.srcObject = stream;
    video.play();
    startCameraBtn.style.display = 'none';
    captureBtn.disabled = false;
    console.log('📱 Caméra activée');
  } catch(e) {
    console.error('Caméra:', e);
    aiResponse.innerHTML = '<div class="error">HTTPS requis pour caméra</div>';
  }
}

function capturePhoto() {
  canvas.width = 640;
  canvas.height = 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  
  currentImage = canvas.toDataURL('image/jpeg', 0.8);
  photo.src = currentImage;
  photo.style.display = 'block';
  video.style.display = 'none';
  
  aiResponse.innerHTML = '<div class="success">✅ Photo PC prise ! <strong>Clique ANALYSER</strong></div>';
  analyzeBtn.disabled = false;
  console.log('📸 Photo capturée');
}

function loadFile(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImage = e.target.result;
    photo.src = currentImage;
    photo.style.display = 'block';
    video.style.display = 'none';
    analyzeBtn.disabled = false;
    aiResponse.innerHTML = '<div class="success">✅ Photo uploadée ! ANALYSE</div>';
  };
  reader.readAsDataURL(file);
}

async function analyzeImage() {
  if (!currentImage) return;
  
  analyzeBtn.innerHTML = '⏳ IA analyse...';
  analyzeBtn.disabled = true;
  
  aiResponse.innerHTML = '<div class="loading">🤖 Perplexity identifie ta pièce PC...</div>';
  
  try {
    // Resize 512x512
    const img = new Image();
    img.onload = async () => {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      tempCanvas.width = tempCanvas.height = 512;
      ctx.drawImage(img, 0, 0, 512, 512);
      
      const base64 = tempCanvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          max_tokens: 400,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: `🎮 AI4GOOD - IDENTIFIE cette pièce PC pour jeu éducatif assemblage.

Réponds FORMAT SIMPLE :
PIÈCE: CPU/RAM/GPU/Carte mère/SSD/Alim/Ventilo
CONFIDENCE: 95%
DÉTAILS: Intel i7, DDR4 16Go, etc (lis inscriptions)
RÔLE: fait quoi dans PC
JEU: où placer dans assemblage

Exemple: "PIÈCE: CPU Intel i7 | CONFIDENCE: 98% | ..."
`
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` }
              }
            ]
          }]
        })
      });
      
      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      const data = await response.json();
      const result = data.choices[0].message.content;
      
      aiResponse.innerHTML = `
        <div class="result-card">
          <h3>🎯 ${result.split('\n')[0] || 'Pièce détectée !'}</h3>
          <div style="background:#f8f9fa;padding:16px;border-radius:12px;font-size:0.95rem;line-height:1.6;">
            ${result.replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
      console.log('✅ Analyse réussie:', result);
    };
    img.src = currentImage;
    
  } catch(e) {
    console.error('Erreur:', e);
    aiResponse.innerHTML = `<div class="error">❌ ${e.message}</div>`;
  } finally {
    analyzeBtn.innerHTML = '🚀 ANALYSER IA';
    analyzeBtn.disabled = false;
  }
}
