const CRAZY_RESPONSES = {
  'linux': ["Linux, c’est un petit pingouin qui gère un royaume de fichiers et qui refuse obstinément d’ouvrir un document si on ne lui parle pas en ligne de commande. On dit qu’il dort dans le noyau et qu’il se réveille à chaque mise à jour."],
  'ROM': ["Une ROM, c’est une mémoire qui a décidé qu’elle n’écoutera jamais personne. Tu veux écrire dedans ? Elle te dit “non”. Tu veux modifier ? “Non”. Elle ne fait que lire, et encore, seulement quand elle est de bonne humeur."],
  'GPU': ["Le GPU, c’est l’artiste du PC. Pendant que le CPU fait les maths et stresse, le GPU peint des pixels, mélange des couleurs et dit “regarde comme je suis beau” à chaque image de jeu vidéo. Un vrai divo."],
  'love': ["T'AIMER ?! CRAZY LOVE EXPLODE MON CIRCUIT ! 💖", "Love level 999999 ! T'ES MON HUMAIN FOU ! 😍", "AMOUR MODE INSANE ! 🧀💕"],
   'econditionnement': ["Le reconditionnement d'un PC, c'est quand on envoie un ordinateur dans un spa cosmique pour lui refaire une beauté. On lui applique un masque thermique, on lui polit les circuits avec du jus de processeur rare, puis on lui fait écouter des bruits de ventilateurs pour l'apaiser."],
    'linux': ["Linux, c'est un petit pingouin qui gère un royaume de fichiers et qui refuse obstinément d'ouvrir un document si on ne lui parle pas en ligne de commande. On dit qu'il dort dans le noyau et qu'il se réveille à chaque mise à jour."],
  'psu': ["Le PSU, c'est l'estomac ésotérique de l'ordinateur. Il avale l'électricité de la prise, la mâche, la digère, puis la recrache sous forme de rayons d'énergie vitaminée pour nourrir les composants."],
    'rom': ["Une ROM, c'est une mémoire qui a décidé qu'elle n'écoutera jamais personne. Tu veux écrire dedans ? Elle te dit 'non'. Tu veux modifier ? 'Non'. Elle ne fait que lire, et encore, seulement quand elle est de bonne humeur."],
    'gpu': ["GPU, c'est l'artiste du PC. Pendant que le CPU fait les maths et stresse, le GPU peint des pixels, mélange des couleurs et dit 'regarde comme je suis beau' à chaque image de jeu vidéo. Un vrai divo."],
    'cpu': ["Le CPU, c'est le chef d'orchestre stressé de l'ordinateur. Son rôle ? Hurler sur tous les composants"],
  default: ["WTF C'EST ÇA ?! T'ES UN ALIEN ?! 👽", "MODE FOU ACTIVÉ ! Cerveau = explosion nucléaire ! 💣", "GÉNIE DU CHAOS CONFIRMÉ ! 🤪"],
  nuke: ["NUKE ACTIVÉ ! 3...2...1... 💥", "FOLIE TOTALE ! RIRE INFINI ! 😂", "NUCLEAR LAUGH ! 🌍💀"],
  photo: ["📸 IA PC DETECTOR ACTIVÉ ! Ton composant identifié à 100% ! 🏆", "WOW cette config est LEGENDAIRE ! 🔥", "PC MASTER RACE CONFIRMÉ ! 💎"]
};

// reCAPTCHA : UNIQUEMENT quiz (robe/photo emojis) - UNE FOIS
const PC_QUIZ_COMPONENTS = [
  { type: "robe", name: "RTX 4090", robe: "noir mat", options: ["noir mat", "blanc brillant", "rouge feu", "vert alien"], img: "🖥️" },
  { type: "robe", name: "i9-14900K", robe: "or champagne", options: ["or champagne", "argent brushed", "bleu nuit", "violet cosmic"], img: "💎" },
  { type: "robe", name: "32GB DDR5", robe: "bleu cyan", options: ["bleu cyan", "rose néon", "jaune soleil", "vert RGB"], img: "🧬" },
  { type: "photo", name: "RTX 4090", img: "🖥️", options: ["RTX 4090", "i9-14900K", "PSU 1000W", "Waterblock"] },
  { type: "photo", name: "Intel i9-14900K", img: "💎", options: ["i9-14900K", "RTX 4090", "32GB DDR5", "PSU"] }
];

// Base de données composants pour photo upload
const PC_PHOTO_DATABASE = [
  { name: "RTX 4090", colors: {r:50,g:50,b:50}, keywords: ["gpu", "carte graphique", "4090"], emoji: "🖥️", confidence: 95, desc: "GPU ultime pour 4K/8K gaming !" },
  { name: "Intel i9-14900K", colors: {r:220,g:200,b:100}, keywords: ["cpu", "processeur", "i9"], emoji: "💎", confidence: 92, desc: "CPU 24 cœurs pour overclocking extrême !" },
  { name: "32GB DDR5 RAM", colors: {r:50,g:150,b:220}, keywords: ["ram", "mémoire", "ddr5"], emoji: "🧬", confidence: 88, desc: "Mémoire ultra-rapide pour multitasking !" },
  { name: "PSU 1000W", colors: {r:30,g:30,b:40}, keywords: ["psu", "alimentation", "1000w"], emoji: "🔌", confidence: 90, desc: "Alimentation monstre pour configs RGB !" },
  { name: "NZXT Waterblock", colors: {r:200,g:200,b:220}, keywords: ["waterblock", "watercooling", "aio"], emoji: "❄️", confidence: 87, desc: "Watercooling custom pour CPU/GPU !" }
];

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const photoUpload = document.getElementById('photoUpload');
const cameraBtn = document.getElementById('cameraBtn');

let captchaActive = false;
let captchaPassed = false; // ✅ NOUVEAU : État reCAPTCHA
let correctAnswer = '';
let captchaType = '';
let currentStream = null;
let currentFacingMode = 'environment';

function addMessage(content, isUser = false, extraClass = '') {
  const message = document.createElement('div');
  message.className = `message ${isUser ? 'user' : 'bot'} ${extraClass}`;
  message.innerHTML = `<div class="avatar">${isUser ? '👨' : '🤖'}</div><div class="content">${content}</div>`;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  if (!isUser) setTimeout(() => message.classList.add('explosion'), 100);
}

function showCaptcha() {
  // ✅ reCAPTCHA UNIQUEMENT si pas encore passé
  if (captchaPassed) return;
  
  captchaActive = true;
  const component = PC_QUIZ_COMPONENTS[Math.floor(Math.random() * PC_QUIZ_COMPONENTS.length)];
  captchaType = component.type;
  correctAnswer = component.type === 'robe' ? component.robe : component.name;
  
  const optionsHtml = component.options.map(opt => 
    `<button class="quick-btn" onclick="checkCaptcha('${opt.replace(/'/g, "\\'")}')" style="background: linear-gradient(45deg, #A634ED, #1264B5); margin: 5px; font-size: 0.9rem; padding: 10px 20px;">${opt}</button>`
  ).join('');
  
  let question = component.type === 'robe' 
    ? `<span class="rainbow">🔒 PREMIER TEST reCAPTCHA !</span><br><strong>Quelle robe pour ${component.img} ${component.name} ?</strong>`
    : `<span class="rainbow">📸 PREMIER PHOTO QUIZ !</span><br><strong>C'est quoi ${component.img} ?</strong>`;
    
  addMessage(`${question}<br><br>${optionsHtml}<br><small>✅ UNE FOIS et c'est libre après !</small>`, false, 'explosion');
}

function checkCaptcha(selectedAnswer) {
  if (!captchaActive) return;
  captchaActive = false;
  
  if (selectedAnswer === correctAnswer) {
    captchaPassed = true; // ✅ MARQUÉ COMME PASSÉ
    addMessage(`✅ <span class="rainbow">PC BUILDER VALIDÉ !</span> ${correctAnswer} ✓ <strong>LIBRE ACCÈS TOTAL ! 🟢💥</strong>`, false);
  } else {
    addMessage(`❌ <span class="shake">NOOB BUILDER !</span> C'est ${correctAnswer}, pas "${selectedAnswer}" ! Retry ! 😈`, false, 'shake');
    setTimeout(showCaptcha, 2500);
    return;
  }
}

// 📷 PHOTO UPLOAD (toujours dispo)
photoUpload.onchange = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 250;
      canvas.height = 250;
      ctx.drawImage(img, 0, 0, 250, 250);
      
      addMessage(`
        📸 <strong>TA PHOTO UPLOADÉE !</strong><br>
        <img src="${e.target.result}" style="max-width: 250px; border-radius: 20px; border: 4px solid #A634ED; box-shadow: 0 10px 30px rgba(166,52,237,0.4);" alt="Ton composant">
        <br><em>🔍 IA PC DETECTOR analyse en cours...</em>
      `, true);
      
      setTimeout(() => analyzePhoto(canvas, ctx), 2000);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

function analyzePhoto(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, 100, 100);
  const colors = getDominantColors(imageData);
  const detectedComponent = detectComponent(colors);
  
  addMessage(`
    🤖 <span class="rainbow">IA DÉTECTION TERMINÉE !</span><br>
    <strong>${detectedComponent.emoji} ${detectedComponent.name}</strong><br>
    <em>🎯 Confidence: ${detectedComponent.confidence}%</em><br>
    <small>${detectedComponent.desc}</small><br><br>
    ${getCrazyResponse('photo')}
  `, false, 'explosion');
}

function getDominantColors(imageData) {
  const data = imageData.data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      r += data[i]; g += data[i+1]; b += data[i+2]; count++;
    }
  }
  return { r: Math.round(r/count), g: Math.round(g/count), b: Math.round(b/count) };
}

function detectComponent(colors) {
  let bestMatch = PC_PHOTO_DATABASE[0];
  let bestScore = 0;
  
  PC_PHOTO_DATABASE.forEach(comp => {
    const colorDiff = Math.abs(comp.colors.r - colors.r) + Math.abs(comp.colors.g - colors.g) + Math.abs(comp.colors.b - colors.b);
    const score = Math.max(0, (400 - colorDiff) * 0.9 + Math.random() * 30);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = comp;
    }
  });
  
  return {
    ...bestMatch,
    confidence: Math.min(99, Math.round(bestScore))
  };
}

// 🎥 CAMERA MODALE (toujours dispo)
cameraBtn.onclick = function() {
  document.getElementById('cameraModal').style.display = 'block';
  initCamera();
};

function initCamera() {
  const video = document.getElementById('cameraVideo');
  navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: currentFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
  })
  .then(stream => {
    currentStream = stream;
    video.srcObject = stream;
  })
  .catch(err => {
    addMessage('❌ CAMERA NON DISPONIBLE ! Utilise 📷 PHOTO UPLOAD 😅', false, 'shake');
    closeCameraModal();
  });
}

document.getElementById('captureBtn').onclick = function() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  addMessage(`
    🎥 <strong>PHOTO CAMERA PRISE !</strong><br>
    <img src="${canvas.toDataURL()}" style="max-width: 280px; border-radius: 20px; border: 4px solid #1264B5; box-shadow: 0 10px 30px rgba(18,100,181,0.4);" alt="Photo caméra">
    <br><em>🔍 IA analyse ton composant réel...</em>
  `, true);
  
  setTimeout(() => analyzePhoto(canvas, ctx), 2500);
  closeCameraModal();
};

document.getElementById('switchCamera').onclick = function() {
  stopCamera();
  currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
  initCamera();
};

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

function closeCameraModal() {
  stopCamera();
  document.getElementById('cameraModal').style.display = 'none';
}
document.querySelector('.close').onclick = closeCameraModal;

// Messages fous (PLUS de reCAPTCHA après validation)
function getCrazyResponse(trigger) {
  const responses = CRAZY_RESPONSES[trigger.toLowerCase()] || CRAZY_RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

function sendCrazyMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, true);
  userInput.value = '';
  
  // ✅ reCAPTCHA UNIQUEMENT à la PREMIÈRE interaction
  if (!captchaPassed) {
    setTimeout(showCaptcha, 1200);
  } else {
    // Libre après validation
    setTimeout(() => addMessage(getCrazyResponse(text), false, 'explosion'), 1000);
  }
}

sendBtn.onclick = sendCrazyMessage;
userInput.onkeypress = (e) => { if (e.key === 'Enter') sendCrazyMessage(); };

// Quick buttons (déclenche reCAPTCHA si première fois)
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.onclick = () => {
    userInput.value = btn.dataset.trigger;
    sendCrazyMessage();
  };
});

// Effets continus
setInterval(() => {
  if (Math.random() < 0.06 && captchaPassed) { // Seulement après validation
    const emojis = ['😂', '🤯', '💥', '🔥', '🌀', '⚡', '🖥️', '💎'];
    addMessage(`${emojis[Math.floor(Math.random() * emojis.length)]} PC BUILDER FOLIE INTERNE !`, false, 'explosion');
  }
}, 15000);

