import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Brain, Wifi, WifiOff, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BCIConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BCIConnectionModal({ isOpen, onClose }: BCIConnectionModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const bciDevices = [
    { id: 'muse-2', name: 'Muse 2', type: 'EEG Headband', status: 'available' },
    { id: 'emotiv-insight', name: 'Emotiv Insight', type: 'EEG Headset', status: 'available' },
    { id: 'neurosky', name: 'NeuroSky MindWave', type: 'EEG Headset', status: 'available' },
    { id: 'openbci', name: 'OpenBCI', type: 'Research Grade EEG', status: 'available' },
  ];

  const handleConnect = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    setConnectionStatus('connecting');
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus('connected');
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setSelectedDevice('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-purple-900/30 to-blue-900/30 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
              <Brain className="w-6 h-6" />
            </div>
            BCI Device Connection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              {connectionStatus === 'disconnected' && (
                <>
                  <WifiOff className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">No Device Connected</p>
                    <p className="text-sm text-gray-400">Select a device to connect</p>
                  </div>
                </>
              )}
              {connectionStatus === 'connecting' && (
                <>
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <div>
                    <p className="font-medium">Connecting...</p>
                    <p className="text-sm text-gray-400">Establishing connection to {selectedDevice}</p>
                  </div>
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-gray-400">Receiving brain signals</p>
                  </div>
                </>
              )}
            </div>
            
            {connectionStatus === 'connected' && (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Disconnect
              </Button>
            )}
          </div>

          {/* Available Devices */}
          {connectionStatus !== 'connected' && (
            <div>
              <h3 className="mb-3 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-400" />
                Available Devices
              </h3>
              <div className="space-y-3">
                {bciDevices.map((device) => (
                  <motion.div
                    key={device.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-black/30 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => connectionStatus === 'disconnected' && handleConnect(device.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                          <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-gray-400">{device.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          device.status === 'available' ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-gray-400 capitalize">{device.status}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Connection Info */}
          {connectionStatus === 'connected' && (
            <div className="space-y-4">
              <h3 className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Signal Quality
              </h3>
              
              <div className="space-y-3">
                {['Alpha Waves', 'Beta Waves', 'Theta Waves', 'Delta Waves'].map((wave, index) => (
                  <div key={wave}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">{wave}</span>
                      <span className="text-sm text-green-400">
                        {85 + Math.floor(Math.random() * 15)}%
                      </span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${85 + Math.floor(Math.random() * 15)}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  BCI integration active. Your brain activity is now being monitored to optimize learning.
                </p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <p className="text-sm text-purple-200">
              <strong>Note:</strong> BCI devices help optimize your learning experience by monitoring your cognitive states in real-time. 
              Data is processed locally and never shared with third parties.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
