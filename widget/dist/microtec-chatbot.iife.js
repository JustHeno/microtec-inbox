(function(){var e=`http://localhost:8000/chat`,t=document.createElement(`div`);t.innerHTML=`
  <div id="microtec-chatbot-button">💬</div>

  <div id="microtec-chatbot-window">
    <div id="microtec-chatbot-header">Microtec Assistant</div>
    <div id="microtec-chatbot-messages"></div>
    <form id="microtec-chatbot-form">
      <input id="microtec-chatbot-input" placeholder="Pose ta question..." />
      <button type="submit">Envoyer</button>
    </form>
  </div>
`,document.body.appendChild(t);var n=document.createElement(`style`);n.textContent=`
  #microtec-chatbot-button {
    position: fixed;
    right: 24px;
    bottom: 24px;
    width: 60px;
    height: 60px;
    border-radius: 999px;
    background: #124F83;
    color: white;
    display: grid;
    place-items: center;
    font-size: 26px;
    cursor: pointer;
    z-index: 999999;
    box-shadow: 0 14px 40px rgba(0,0,0,.25);
  }

  #microtec-chatbot-window {
    position: fixed;
    right: 24px;
    bottom: 96px;
    width: 360px;
    max-width: calc(100vw - 32px);
    height: 500px;
    background: white;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 24px 80px rgba(0,0,0,.3);
    display: none;
    flex-direction: column;
    z-index: 999999;
    font-family: Arial, sans-serif;
  }

  #microtec-chatbot-header {
    background: #124F83;
    color: white;
    padding: 16px;
    font-weight: 700;
  }

  #microtec-chatbot-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    font-size: 14px;
  }

  .microtec-message {
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    line-height: 1.4;
  }

  .microtec-user {
    background: #E5700B;
    color: white;
    margin-left: 40px;
  }

  .microtec-bot {
    background: #f1f5f9;
    color: #0f172a;
    margin-right: 40px;
  }

  #microtec-chatbot-form {
    display: flex;
    border-top: 1px solid #e5e7eb;
  }

  #microtec-chatbot-input {
    flex: 1;
    border: none;
    padding: 14px;
    outline: none;
  }

  #microtec-chatbot-form button {
    border: none;
    background: #E5700B;
    color: white;
    padding: 0 16px;
    cursor: pointer;
    font-weight: 700;
  }
`,document.head.appendChild(n);var r=document.getElementById(`microtec-chatbot-button`),i=document.getElementById(`microtec-chatbot-window`),a=document.getElementById(`microtec-chatbot-form`),o=document.getElementById(`microtec-chatbot-input`),s=document.getElementById(`microtec-chatbot-messages`);r.addEventListener(`click`,()=>{i.style.display=i.style.display===`flex`?`none`:`flex`});function c(e,t){let n=document.createElement(`div`);n.className=`microtec-message microtec-${t}`,n.textContent=e,s.appendChild(n),s.scrollTop=s.scrollHeight}a.addEventListener(`submit`,async t=>{t.preventDefault();let n=o.value.trim();if(n){c(n,`user`),o.value=``;try{c((await(await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({message:n,page_url:window.location.href})})).json()).reply,`bot`)}catch{c(`Erreur de connexion avec l’assistant Microtec.`,`bot`)}}}),c(`Salut 👋 Je suis l’assistant Microtec. Comment je peux t’aider?`,`bot`)})();