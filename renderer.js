const output = document.getElementById('output');
let estaEsperandoComando = false;  // Controle de quando "Jarvis" for chamado

// Verifica se o navegador suporta o reconhecimento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;  // Escuta contínua
  recognition.interimResults = false;

  // Inicia o reconhecimento assim que a página carregar
  recognition.start();
  output.textContent = 'Escutando para a palavra "Jarvis"...';

  // Quando o reconhecimento de voz captura algo
  recognition.onresult = async (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase().trim();
    console.log(`Você disse: ${transcript}`);
    
    // Se a palavra "Jarvis" for detectada, ativa o modo de espera para comandos
    if (!estaEsperandoComando && transcript.includes('jarvis')) {
      estaEsperandoComando = true;
      output.textContent = 'Jarvis ativado. Pode dizer o comando...';
    } else if (estaEsperandoComando) {
      output.textContent = `Você disse: ${transcript}`;
      estaEsperandoComando = false;

      // Verifica se o comando é sobre clima
      if (transcript.includes('clima')) {
        const cidade = transcript.split('em ')[1] || 'São Paulo';
        const climaResposta = await obterClima(cidade);
        output.textContent += `\nJarvis: ${climaResposta}`;
        falar(climaResposta);
      }
      
      // Verifica se o comando é sobre lembretes
      else if (transcript.includes('adicionar lembrete')) {
        const lembrete = transcript.split('adicionar lembrete ')[1];
        const lembreteResposta = adicionarLembrete(lembrete);
        output.textContent += `\nJarvis: ${lembreteResposta}`;
        falar(lembreteResposta);
      } else if (transcript.includes('listar lembretes')) {
        const lembretesResposta = listarLembretes();
        output.textContent += `\nJarvis: ${lembretesResposta}`;
        falar(lembretesResposta);
      } else {
        // Chama a função para enviar o comando para o ChatGPT
        const resposta = await enviarComando(transcript);
        output.textContent += `\nJarvis: ${resposta}`;
        falar(resposta);
      }
    }
  };

  recognition.onerror = (event) => {
    output.textContent = 'Erro no reconhecimento de voz. Tente novamente.';
    console.log(event.error);
  };

} else {
  output.textContent = 'Seu navegador não suporta reconhecimento de voz.';
}

// Função para enviar o comando para a API do ChatGPT
async function enviarComando(mensagem) {
  const apiKey = 'SUA_API_KEY_AQUI';  // Substitua pela sua chave da OpenAI
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",  // Modelo utilizado
      messages: [{ role: "user", content: mensagem }],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Função para o Jarvis falar em voz alta
function falar(mensagem) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(mensagem);
  utterance.lang = 'pt-BR';  // Define o idioma
  synth.speak(utterance);
}

// Função para buscar o clima usando a API OpenWeather
async function obterClima(cidade) {
  const apiKeyClima = 'SUA_API_OPENWEATHER_KEY';
  const urlClima = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKeyClima}&lang=pt_br&units=metric`;

  const response = await fetch(urlClima);
  const data = await response.json();
  if (data.cod === 200) {
    return `O clima em ${cidade} é ${data.weather[0].description} com temperatura de ${data.main.temp}°C.`;
  } else {
    return `Desculpe, não consegui obter o clima para ${cidade}.`;
  }
}

// Função para adicionar lembretes
function adicionarLembrete(lembrete) {
  const lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
  lembretes.push(lembrete);
  localStorage.setItem('lembretes', JSON.stringify(lembretes));
  return `Lembrete adicionado: ${lembrete}`;
}

// Função para listar lembretes
function listarLembretes() {
  const lembretes = JSON.parse(localStorage.getItem('lembretes')) || [];
  if (lembretes.length > 0) {
    return `Seus lembretes: ${lembretes.join(', ')}`;
  } else {
    return 'Você não tem lembretes.';
  }
}