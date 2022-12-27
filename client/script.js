import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const container = document.getElementById('chat_container');

let loadInterval;

const loading = (element) => {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
};

const typeWord = (element, text) => {
  let index = 0;
  let typeInterval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(typeInterval);
    }
  }, 20);
};

const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
};

const chatStripes = (isAi, value, uniqueId) => {
  return `
  <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
      <div class="profile">
        <img 
        alt="${isAi ? 'bot' : 'user'}" 
        src="${isAi ? bot : user}"  />
      </div>
      <div class="message" id="${uniqueId}">${value}</div>
    </div>
  </div>`;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  container.innerHTML += chatStripes(false, data.get('prompt'));
  form.reset();

  const uniqueId = generateUniqueId();
  container.innerHTML += chatStripes(true, ' ', uniqueId);

  container.scrollTop = container.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loading(messageDiv);

  const response = await fetch('https://oraculo.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeWord(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = 'Something went wrong!';
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
