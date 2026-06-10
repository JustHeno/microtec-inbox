import { MicrotecChatbot } from "./chatbot/MicrotecChatbot";

const chatbot = new MicrotecChatbot("http://localhost:8000");

chatbot.mount();