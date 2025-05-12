import React, { useState, useEffect } from 'react';
import { load as yamlLoad } from 'js-yaml';
import { AES, enc } from 'crypto-js';
import { 
  Upload,
  FileCode,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Server,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface KubeSettings {
  kubeconfigYAML: string;
  contextName: string;
  namespace: string;
  serverUrl: string;
  userName: string;
  lastValidated: number;
}

interface Props {
  value: KubeSettings | null;
  onChange: (settings: KubeSettings | null) => void;
}

type InputMode = 'file' | 'yaml';
type ConnectionStatus = 'not_configured' | 'testing' | 'ready' | 'denied';

const STORAGE_KEY = 'kube_settings';
const PASSPHRASE_KEY = 'kube_passphrase';

export default function KubeConnectionSettings({ value, onChange }: Props) {
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [yamlContent, setYamlContent] = useState('');
  const [contexts, setContexts] = useState<{ name: string; cluster: { server: string } }[]>([]);
  const [selectedContext, setSelectedContext] = useState('');
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>('not_configured');
  const [isNewNamespaceModalOpen, setIsNewNamespaceModalOpen] = useState(false);
  const [newNamespaceName, setNewNamespaceName] = useState('');
  const [serverInfo, setServerInfo] = useState<{ url: string; cert: string } | null>(null);

  useEffect(() => {
    const loadStoredSettings = () => {
      const passphrase = sessionStorage.getItem(PASSPHRASE_KEY);
      if (!passphrase) return;

      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return;

      try {
        const decrypted = AES.decrypt(encrypted, passphrase).toString(enc.Utf8);
        const settings: KubeSettings = JSON.parse(decrypted);
        onChange(settings);
      } catch (error) {
        console.error('Failed to load stored settings:', error);
      }
    };

    if (!value) {
      loadStoredSettings();
    }
  }, []);

  const parseKubeconfig = (content: string) => {
    try {
      const config = yamlLoad(content) as any;
      const parsedContexts = config.contexts.map((ctx: any) => ({
        name: ctx.name,
        cluster: config.clusters.find((c: any) => c.name === ctx.context.cluster)?.cluster || {}
      }));
      setContexts(parsedContexts);
      setYamlContent(content);
      toast.success('Kubeconfig parsed successfully');
    } catch (error) {
      toast.error('Invalid kubeconfig format');
      console.error('Failed to parse kubeconfig:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseKubeconfig(content);
    };
    reader.readAsText(file);
  };

  const handleYamlPaste = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    parseKubeconfig(event.target.value);
  };

  const handleContextChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const contextName = event.target.value;
    setSelectedContext(contextName);
    const context = contexts.find(c => c.name === contextName);
    if (context) {
      setServerInfo({
        url: context.cluster.server,
        cert: 'Certificate information would be displayed here'
      });
    }
    // In a real implementation, this would fetch namespaces from the cluster
    setNamespaces(['default', 'kube-system', 'monitoring']);
  };

  const createNamespace = async () => {
    if (!newNamespaceName.trim()) return;
    
    try {
      // Mock API call to create namespace
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNamespaces(prev => [...prev, newNamespaceName]);
      setSelectedNamespace(newNamespaceName);
      setIsNewNamespaceModalOpen(false);
      setNewNamespaceName('');
      toast.success('Namespace created successfully');
    } catch (error) {
      toast.error('Failed to create namespace');
    }
  };

  const testConnection = async () => {
    setStatus('testing');
    try {
      // Mock API call to test cluster access
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('ready');
      toast.success('Connection test successful');
    } catch (error) {
      setStatus('denied');
      toast.error('Connection test failed');
    }
  };

  const handleSave = () => {
    if (!yamlContent || !selectedContext || !selectedNamespace) return;

    const settings: KubeSettings = {
      kubeconfigYAML: yamlContent,
      contextName: selectedContext,
      namespace: selectedNamespace,
      serverUrl: serverInfo?.url || '',
      userName: 'admin', // This would come from the actual kubeconfig
      lastValidated: Date.now()
    };

    // Generate a random passphrase if not exists
    let passphrase = sessionStorage.getItem(PASSPHRASE_KEY);
    if (!passphrase) {
      passphrase = Math.random().toString(36).slice(2);
      sessionStorage.setItem(PASSPHRASE_KEY, passphrase);
    }

    const encrypted = AES.encrypt(JSON.stringify(settings), passphrase).toString();
    localStorage.setItem(STORAGE_KEY, encrypted);
    onChange(settings);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setYamlContent('');
    setContexts([]);
    setSelectedContext('');
    setNamespaces([]);
    setSelectedNamespace('');
    setStatus('not_configured');
    setServerInfo(null);
    localStorage.removeItem(STORAGE_KEY);
    onChange(null);
    toast.success('Settings reset successfully');
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg space-y-6">
      <div className="flex items-center gap-2">
        <Server className="h-5 w-5 text-white" />
        <h2 className="text-xl font-semibold text-white">Kubernetes Connection</h2>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
        <button
          onClick={() => setInputMode('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            inputMode === 'file' 
              ? 'bg-white/10 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </button>
        <button
          onClick={() => setInputMode('yaml')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            inputMode === 'yaml' 
              ? 'bg-white/10 text-white' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          <FileCode className="h-4 w-4" />
          Paste YAML
        </button>
      </div>

      {/* File Upload */}
      {inputMode === 'file' && (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".yaml,.yml"
            className="hidden"
            id="kubeconfig-upload"
          />
          <label
            htmlFor="kubeconfig-upload"
            className="cursor-pointer flex flex-col items-center gap-2 text-white/70 hover:text-white"
          >
            <Upload className="h-8 w-8" />
            <span>Click to upload kubeconfig</span>
          </label>
        </div>
      )}

      {/* YAML Input */}
      {inputMode === 'yaml' && (
        <textarea
          placeholder="Paste your kubeconfig YAML here..."
          onChange={handleYamlPaste}
          value={yamlContent}
          className="w-full h-48 p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 font-mono text-sm"
        />
      )}

      {/* Context Status */}
      {contexts.length > 0 && (
        <div className="text-white/70 text-sm">
          Detected {contexts.length} cluster{contexts.length !== 1 ? 's' : ''} / context{contexts.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Context Selector */}
      {contexts.length > 0 && (
        <div>
          <label className="text-white/70 block mb-2">Context</label>
          <select
            value={selectedContext}
            onChange={handleContextChange}
            className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <option value="" disabled>Select a context</option>
            {contexts.map(ctx => (
              <option key={ctx.name} value={ctx.name} className="bg-gray-800">
                {ctx.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Namespace Selector */}
      {selectedContext && (
        <div>
          <label className="text-white/70 block mb-2">Namespace</label>
          <div className="flex gap-2">
            <select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="" disabled>Select a namespace</option>
              {namespaces.map(ns => (
                <option key={ns} value={ns} className="bg-gray-800">
                  {ns}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsNewNamespaceModalOpen(true)}
              className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {status !== 'not_configured' && (
        <div className="flex items-center gap-2">
          {status === 'testing' && (
            <div className="flex items-center gap-2 text-blue-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Testing connection...</span>
            </div>
          )}
          {status === 'ready' && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="h-5 w-5" />
              <span>Connection ready</span>
            </div>
          )}
          {status === 'denied' && (
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="h-5 w-5" />
              <span>RBAC access denied</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={testConnection}
          disabled={!selectedContext || !selectedNamespace || status === 'testing'}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectedContext && selectedNamespace && status !== 'testing'
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white/5 text-white/50 cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`h-5 w-5 ${status === 'testing' ? 'animate-spin' : ''}`} />
          Test Connection
        </button>
        <button
          onClick={handleSave}
          disabled={status !== 'ready'}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            status === 'ready'
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white/5 text-white/50 cursor-not-allowed'
          }`}
        >
          <Check className="h-5 w-5" />
          Save
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
        >
          <X className="h-5 w-5" />
          Reset
        </button>
      </div>

      {/* New Namespace Modal */}
      {isNewNamespaceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Namespace</h3>
            <input
              type="text"
              value={newNamespaceName}
              onChange={(e) => setNewNamespaceName(e.target.value)}
              placeholder="namespace-name"
              className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsNewNamespaceModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                Cancel
              </button>
              <button
                onClick={createNamespace}
                disabled={!newNamespaceName.trim()}
                className={`px-4 py-2 rounded-lg ${
                  newNamespaceName.trim()
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/5 text-white/50 cursor-not-allowed'
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}