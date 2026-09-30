import React, { useState, useEffect } from 'react';
import { SceneCanvas } from './components/scene/SceneCanvas';
import { Navbar } from './components/ui/Navbar';
import { HeroSection } from './components/ui/HeroSection';
import { PodiumHUD } from './components/ui/PodiumHUD';
import { ChatDrawer } from './components/ui/ChatDrawer';
import { ToolInspectorModal } from './components/ui/ToolInspectorModal';
import { ConfigModal } from './components/ui/ConfigModal';
import { soundFx } from './utils/audio';

export function App() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [selectedModel, setSelectedModel] = useState('neural');
  const [lightingTheme, setLightingTheme] = useState('cyber');
  const [cameraPreset, setCameraPreset] = useState('studio');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inspectedTool, setInspectedTool] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  const handleSendMessage = async (queryText) => {
    if (!queryText.trim() || isThinking) return;

    const userMessage = {
      role: 'user',
      text: queryText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    setActiveTool(null);
    setIsChatOpen(true);

    soundFx.playSend();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        if (data.tools_used && data.tools_used.length > 0) {
          const lastTool = data.tools_used[data.tools_used.length - 1].name;
          setActiveTool(lastTool);
          soundFx.playToolExecute();
        } else {
          soundFx.playReceive();
        }

        const agentMessage = {
          role: 'agent',
          text: data.output || 'Task complete.',
          tools_used: data.tools_used || [],
        };

        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error('Unexpected response structure.');
      }
    } catch (err) {
      console.error('Agent chat error:', err);
      const errorMessage = {
        role: 'agent',
        text: `⚠️ Execution Notice: ${err.message || 'Could not connect to AI Agent service.'}\n\nPlease verify that the FastAPI server is running with configured API keys.`,
        tools_used: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setTimeout(() => {
        setActiveTool(null);
      }, 4000);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setActiveTool(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D Scene: Elevated Diamond Grid Catwalk, Glossy Coins, Liquid Neon Portal */}
      <SceneCanvas
        selectedModel={selectedModel}
        onSelectModel={(modelId) => {
          setSelectedModel(modelId);
          setCameraPreset('coins');
        }}
        isThinking={isThinking}
        activeTool={activeTool}
        lightingTheme={lightingTheme}
        cameraPreset={cameraPreset}
      />

      {/* Top Navbar */}
      <Navbar
        isThinking={isThinking}
        cameraPreset={cameraPreset}
        setCameraPreset={setCameraPreset}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Hero Typography Section matching reference image */}
      {!isChatOpen && (
        <HeroSection
          onOpenChat={() => setIsChatOpen(true)}
          onSelectPrompt={(prompt) => {
            setIsChatOpen(true);
            handleSendMessage(prompt);
          }}
        />
      )}

      {/* 3D Token & Tool Telemetry HUD */}
      <PodiumHUD
        selectedModel={selectedModel}
        setSelectedModel={(m) => {
          setSelectedModel(m);
          setCameraPreset('coins');
        }}
        activeTool={activeTool}
        isThinking={isThinking}
      />

      {/* Interactive Chat & Command Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        messages={messages}
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
        onClearChat={handleClearChat}
        onInspectTool={(tool) => setInspectedTool(tool)}
      />

      {/* Tool Trace Inspector Modal */}
      <ToolInspectorModal
        tool={inspectedTool}
        onClose={() => setInspectedTool(null)}
      />

      {/* API Key Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}

export default App;
