import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Shield, Activity, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { toast, Toaster } from 'sonner';
import { cn } from './lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatMessage = ({ message, isUser }) => {
  const renderContent = () => {
    if (isUser) {
      return <p className="text-gray-100">{message.content}</p>;
    }

    // Handle structured responses from assistant
    if (typeof message.content === 'object') {
      const data = message.content;
      
      if (data.type === 'table') {
        return (
          <div className="space-y-4">
            {data.ai_analysis && (
              <details className="group bg-slate-800/30 rounded-lg mb-4 overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-700/50 hover:bg-slate-600/50 transition-colors">
                  <span className="text-blue-300 font-medium">AI Analysis</span>
                  <svg className="w-5 h-5 text-blue-300 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-4 pt-2 text-blue-100 whitespace-pre-wrap">
                  {data.ai_analysis}
                </div>
              </details>
            )}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">{data.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      {data.headers.map((header, idx) => (
                        <th key={idx} className="text-left p-2 text-cyan-300 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="p-2 text-gray-200">
                            {cellIdx === data.headers.length - 1 ? (
                              <Badge 
                                variant={cell === 'Critical' ? 'destructive' : 
                                        cell === 'High' ? 'default' : 'secondary'}
                                className={cell === 'Critical' ? 'bg-red-600' : 
                                          cell === 'High' ? 'bg-orange-600' : 'bg-slate-600'}
                              >
                                {cell}
                              </Badge>
                            ) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      
      if (data.type === 'chart') {
        const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
        
        return (
          <div className="space-y-4">
            {data.ai_analysis && (
              <p className="text-blue-100 mb-4">{data.ai_analysis}</p>
            )}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">{data.title}</h3>
              <div className="h-64">
                {data.chart_type === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #475569',
                          borderRadius: '6px' 
                        }} 
                      />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {data.chart_type === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #475569',
                          borderRadius: '6px' 
                        }} 
                      />
                      <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {data.chart_type === 'pie' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#3B82F6"
                      >
                        {data.data && data.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #475569',
                          borderRadius: '6px' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        );
      }
    }
    
    // Get content with fallback
    const content = message.content || '';
    
    // Handle code blocks in the message
    if (typeof content === 'string' && content.includes('```')) {
      const parts = content.split(/```(\w*)\n?([\s\S]*?)```/g);
      return (
        <div className="space-y-2">
          {parts.map((part, index) => {
            if (index % 3 === 2) {
              // This is a code block
              const language = parts[index - 1] || '';
              const code = part.replace(/^\n|\n$/g, ''); // Trim newlines
              return (
                <pre key={index} className="bg-slate-800/80 p-4 rounded-md overflow-x-auto text-sm">
                  <code className={`language-${language}`}>
                    {code}
                  </code>
                </pre>
              );
            } else if (part.trim() !== '') {
              // This is regular text
              return <p key={index} className="text-blue-100 whitespace-pre-line">{part}</p>;
            }
            return null;
          })}
        </div>
      );
    }
    
    // Handle large content by making it scrollable
    if (typeof content === 'string' && content.length > 1000) {
      return (
        <div className="max-h-96 overflow-y-auto pr-2">
          <p className="text-blue-100 whitespace-pre-line">{content}</p>
        </div>
      );
    }
    
    // Default text response
    return <p className="text-blue-100 whitespace-pre-line">{content}</p>;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={cn(
        'max-w-3xl rounded-lg p-4',
        isUser 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 ml-12' 
          : 'bg-gradient-to-r from-slate-700 to-slate-800 mr-12',
        'w-full' // Ensure full width for accordion
      )}>
        <div className="flex items-start space-x-2">
          {!isUser && (
            <Shield className="w-5 h-5 text-cyan-300 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatWindow = ({ onReportGenerate }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🛡️ CyRA Security Assistant initialized. I\'m here to help analyze ISRO\'s cybersecurity posture. You can ask me about:\n\n• Malware detections and threats\n• Failed login attempts and authentication issues\n• Network anomalies and traffic analysis\n• Threat intelligence and active attacks\n• Security compliance and system status\n\nWhat would you like to investigate today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare messages for the API - ensure content is always a string
      const apiMessages = newMessages.map(msg => {
        // If content is an object, stringify it
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : JSON.stringify(msg.content);
          
        return {
          role: msg.role,
          content: content
        };
      });
      
      console.log('Sending messages to API:', apiMessages);
      const response = await axios.post(`${API}/chat`, {
        messages: apiMessages
      });
      
      let assistantMessage;
      
      // Handle different response types
      if (response.data.response_type === 'text' || typeof response.data.response === 'string') {
        assistantMessage = {
          role: 'assistant',
          content: typeof response.data.response === 'string' 
            ? response.data.response 
            : JSON.stringify(response.data.response)
        };
      } else {
        // If it's an object (table/chart), store it as is
        assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          responseType: response.data.response_type || 'text'
        };
      }
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // If the response contains data that could be turned into a report, suggest it
      if (response.data.response_type === 'table' || response.data.response_type === 'chart') {
        setTimeout(() => {
          toast.info('Tip: You can generate an immutable report from this analysis using the Report Generator below.');
        }, 2000);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from CyRA assistant');
      
      // Log the full error for debugging
      console.error('Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 422) {
        // For 422 errors, show the backend's validation message if available
        const errorMsg = error.response?.data?.detail?.[0]?.msg || 
                        error.response?.data?.detail || 
                        'Invalid message format. Please try again.';
        toast.error(`Validation error: ${errorMsg}`);
        setMessages(messages); // Revert to previous messages
      } else {
        // For other errors, show a generic error message
        setMessages([...newMessages, {
          role: 'assistant',
          content: '❌ I apologize, but I\'m currently experiencing connectivity issues. Please try again in a moment.'
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full bg-slate-900/50 border-slate-600">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
        <CardTitle className="flex items-center space-x-2 text-cyan-300">
          <Activity className="w-5 h-5" />
          <span>Security Analysis Console</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" data-testid="chat-messages">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              isUser={message.role === 'user'}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-4 mr-12">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-cyan-300 animate-pulse" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        <Separator className="bg-slate-600" />
        <div className="p-4">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the security incident or ask about ISRO system status..."
              className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              data-testid="chat-input"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="send-message-btn"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportGenerator = () => {
  const [reportText, setReportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReport, setLastReport] = useState(null);

  const generateReport = async () => {
    if (!reportText.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API}/log_report`, {
        report_summary: reportText
      });
      
      setLastReport(response.data);
      toast.success('Report logged to blockchain successfully!');
      setReportText('');
      
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to log report to blockchain');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-600">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700">
        <CardTitle className="flex items-center space-x-2 text-cyan-300">
          <Database className="w-5 h-5" />
          <span>Immutable Report Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Security Report Summary
          </label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Enter detailed security incident report, analysis findings, or threat intelligence summary..."
            className="w-full h-32 p-3 bg-slate-800 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            data-testid="report-textarea"
          />
        </div>
        
        <Button 
          onClick={generateReport}
          disabled={isLoading || !reportText.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
          data-testid="generate-report-btn"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating & Logging...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Generate & Log Immutable Report</span>
            </div>
          )}
        </Button>
        
        {lastReport && (
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Report Logged Successfully</span>
            </div>
            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="font-medium text-cyan-300">Block Index:</span> #{lastReport.block_index}</p>
              <p><span className="font-medium text-cyan-300">Hash:</span> 
                <code className="ml-2 bg-slate-700 px-2 py-1 rounded text-xs">
                  {lastReport.hash.substring(0, 32)}...
                </code>
              </p>
              <p className="text-xs text-gray-400 mt-2">{lastReport.message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SystemStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${API}/`);
        setIsOnline(!!response.data);
        setLastUpdate(new Date());
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
        <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
          {isOnline ? 'CyRA Online' : 'CyRA Offline'}
        </span>
      </div>
      <div className="flex items-center space-x-1 text-gray-400">
        <Clock className="w-3 h-3" />
        <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  CyRA
                </h1>
                <p className="text-gray-400 text-sm">Conversational SIEM Assistant for ISRO</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SystemStatus />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface - Takes 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            <ChatWindow />
          </div>
          
          {/* Report Generator - Takes 1/3 of the space on large screens */}
          <div>
            <ReportGenerator />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p></p>
        </div>
      </div>
      
      <Toaster 
        theme="dark" 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            border: '1px solid #475569',
            color: '#F1F5F9'
          }
        }}
      />
    </div>
  );
}

export default App;