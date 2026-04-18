import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GeminiChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'model', parts: [{ text: '👋 ¡Hola! Soy tu asistente 5S con Gemini. ¿En qué puedo ayudarte?' }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSessionRef = useRef(null);

  // Configuración de Gemini con TU API key
  const API_KEY = 'AIzaSyAS9L-N55RpCaOvQ58IBN7bsyYN_g0Y29E';
  const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
    systemInstruction: `Eres un asistente experto en metodología 5S y también conoces perfectamente el funcionamiento de esta aplicación.

INFORMACIÓN SOBRE LA APLICACIÓN:
- Nombre: 5S OPTIMA
- Es una herramienta para gestionar las 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)
- Los usuarios pueden seleccionar una S del panel izquierdo
- Marcar checks en el checklist
- Agregar notas y fotos como evidencia
- Guardar entradas que se muestran en "Entradas recientes"
- Ver gráfico de estado general
- Exportar reportes en PDF con resumen e imágenes
- Hay 3 roles: Administrador, Supervisor, Empleado

RESPONDE:
- Explica qué es cada S de forma clara
- Da consejos para mejorar cada S
- Ayuda a los usuarios a entender cómo usar la aplicación
- Responde dudas sobre la metodología 5S
- Sé amigable y usa emojis cuando sea apropiado`
  });

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = model.startChat({
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = model.startChat({
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          },
        });
      }

      const result = await chatSessionRef.current.sendMessage(input);
      const response = await result.response;
      const text = response.text();

      const modelMessage = { role: 'model', parts: [{ text }] };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error detallado:', error);
      
      let errorText = 'Lo siento, hubo un error. ';
      
      // Mensajes de error más específicos
      if (error.message.includes('API_KEY_INVALID')) {
        errorText += '🔑 La API key no es válida. Por favor verifica tu key en Google AI Studio.';
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        errorText += '⏳ Se alcanzó el límite de uso. Espera un momento y vuelve a intentar.';
      } else if (error.message.includes('model') || error.message.includes('not found')) {
        errorText += '🤖 El modelo no está disponible. Probando con modelo alternativo...';
        
        // Intentar con otro modelo
        try {
          const altModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const altResult = await altModel.generateContent(input);
          const altResponse = await altResult.response;
          const altText = altResponse.text();
          
          const modelMessage = { role: 'model', parts: [{ text: altText }] };
          setMessages(prev => [...prev, modelMessage]);
          setIsLoading(false);
          return;
        } catch (altError) {
          errorText = '❌ No se pudo conectar con Gemini. Verifica tu conexión y API key.';
        }
      } else if (error.message.includes('network')) {
        errorText += '🌐 Error de red. Verifica tu conexión a internet.';
      } else {
        errorText += 'Por favor intenta de nuevo. Si el problema persiste, verifica tu API key en Google AI Studio.';
      }
      
      const errorMessage = { 
        role: 'model', 
        parts: [{ text: errorText }] 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <div className="chatbot-header">
        <h4>
          <span>✨</span> Asistente 5S (Gemini)
        </h4>
        <button onClick={onClose} className="chatbot-close">✕</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
            {msg.role === 'model' && <span className="bot-icon">✨</span>}
            <div className="message-text">{msg.parts[0].text}</div>
            {msg.role === 'user' && <span className="user-icon">👤</span>}
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <span className="bot-icon">✨</span>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu pregunta..."
          rows="1"
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading}>
          {isLoading ? '...' : 'Enviar'}
        </button>
      </div>

      <div className="chatbot-suggestions">
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("qué es Seiri")}
        >
          📋 Seiri
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("qué es Seiton")}
        >
          📦 Seiton
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("qué es Seiso")}
        >
          🧹 Seiso
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("beneficios 5S")}
        >
          ✨ Beneficios
        </button>
        <button 
          className="suggestion-chip"
          onClick={() => handleSuggestionClick("cómo empezar")}
        >
          🚀 Iniciar
        </button>
      </div>
    </div>
  );
};

export default GeminiChatbot;