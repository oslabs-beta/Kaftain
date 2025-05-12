import React, { useReducer } from 'react';
import { Server, X, Check, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import KubeConnectionSettings from '../components/KubeConnectionSettings';

type SecurityProtocol = 'PLAINTEXT' | 'TLS' | 'SASL_TLS';

interface KafkaConfig {
  bootstrapServers: string;
  securityProtocol: SecurityProtocol;
  username: string;
  password: string;
  caCert: File | null;
  clientCert: File | null;
  clientKey: File | null;
  topicIncludeRegex: string;
  topicExcludeRegex: string;
}

interface KubeSettings {
  kubeconfigYAML: string;
  contextName: string;
  namespace: string;
  serverUrl: string;
  userName: string;
  lastValidated: number;
}

type KafkaConfigAction = 
  | { type: 'SET_FIELD'; field: keyof KafkaConfig; value: any }
  | { type: 'RESET' };

const initialConfig: KafkaConfig = {
  bootstrapServers: '',
  securityProtocol: 'PLAINTEXT',
  username: '',
  password: '',
  caCert: null,
  clientCert: null,
  clientKey: null,
  topicIncludeRegex: '',
  topicExcludeRegex: ''
};

function kafkaConfigReducer(state: KafkaConfig, action: KafkaConfigAction): KafkaConfig {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialConfig;
    default:
      return state;
  }
}

function validateConfig(config: KafkaConfig): boolean {
  const hostsValid = config.bootstrapServers
    .split(',')
    .every(host => /^[\w.-]+:\d+$/.test(host.trim()));

  if (!hostsValid) return false;

  if (config.securityProtocol.includes('SASL')) {
    if (!config.username || !config.password) return false;
  }

  if (config.securityProtocol.includes('TLS')) {
    if (!config.caCert) return false;
  }

  return true;
}

async function testKafkaConnection(config: KafkaConfig): Promise<boolean> {
  // Mock connection test
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

export default function Settings() {
  const [config, dispatch] = useReducer(kafkaConfigReducer, initialConfig);
  const [testSuccess, setTestSuccess] = React.useState<boolean | null>(null);
  const [testing, setTesting] = React.useState(false);
  const [kubeSettings, setKubeSettings] = React.useState<KubeSettings | null>(null);

  const handleFileChange = (field: 'caCert' | 'clientCert' | 'clientKey') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    dispatch({ type: 'SET_FIELD', field, value: file });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await testKafkaConnection(config);
      setTestSuccess(success);
      toast.success('Connection test successful!');
    } catch (error) {
      setTestSuccess(false);
      toast.error('Connection test failed!');
    }
    setTesting(false);
  };

  const handleSave = () => {
    toast.success('Configuration saved successfully!');
  };

  const isValid = validateConfig(config);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Server className="h-5 w-5 text-white" />
          <h2 className="text-xl font-semibold text-white">Kafka Broker Connection</h2>
        </div>

        <div className="space-y-4">
          {/* Bootstrap Servers */}
          <div>
            <label className="text-white/70 block mb-2">Servers</label>
            <input
              type="text"
              placeholder="localhost:9092,broker2:9092"
              value={config.bootstrapServers}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'bootstrapServers', value: e.target.value })}
              className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Security Protocol */}
          <div>
            <label className="text-white/70 block mb-2">Security Protocol</label>
            <div className="relative">
              <select
                value={config.securityProtocol}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'securityProtocol', value: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
              >
                <option value="PLAINTEXT" className="bg-gray-800">PLAINTEXT</option>
                <option value="TLS" className="bg-gray-800">TLS</option>
                <option value="SASL_TLS" className="bg-gray-800">SASL_TLS</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
            </div>
          </div>

          {/* SASL Credentials */}
          {config.securityProtocol.includes('SASL') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 block mb-2">Username</label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'username', value: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div>
                <label className="text-white/70 block mb-2">Password</label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
                  className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          )}

          {/* TLS Certificates */}
          {config.securityProtocol.includes('TLS') && (
            <div className="space-y-4">
              <div>
                <label className="text-white/70 block mb-2">CA Certificate</label>
                <input
                  type="file"
                  onChange={handleFileChange('caCert')}
                  className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 block mb-2">Client Certificate</label>
                  <input
                    type="file"
                    onChange={handleFileChange('clientCert')}
                    className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  />
                </div>
                <div>
                  <label className="text-white/70 block mb-2">Client Key</label>
                  <input
                    type="file"
                    onChange={handleFileChange('clientKey')}
                    className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Topic Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 block mb-2">Topic Include Regex</label>
              <input
                type="text"
                placeholder=".*"
                value={config.topicIncludeRegex}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'topicIncludeRegex', value: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="text-white/70 block mb-2">Topic Exclude Regex</label>
              <input
                type="text"
                placeholder="^_.*"
                value={config.topicExcludeRegex}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'topicExcludeRegex', value: e.target.value })}
                className="w-full p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleTestConnection}
              disabled={!isValid || testing}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isValid && !testing
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 cursor-not-allowed'
              }`}
            >
              {testing ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : testSuccess === true ? (
                <Check className="h-5 w-5 text-emerald-400" />
              ) : testSuccess === false ? (
                <X className="h-5 w-5 text-rose-400" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              Test Connection
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || !testSuccess}
              className={`px-4 py-2 rounded-lg ${
                isValid && testSuccess
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 cursor-not-allowed'
              }`}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Kubernetes Connection Settings */}
      <KubeConnectionSettings
        value={kubeSettings}
        onChange={setKubeSettings}
      />
    </div>
  );
}