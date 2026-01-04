import React, { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export default function YjsCollaborative() {
  const [connected, setConnected] = useState(false);
  const [value, setValue] = useState('');
  const ytextRef = useRef(null);
  const providerRef = useRef(null);

  useEffect(() => {
    const doc = new Y.Doc();
    // default to local server for dev
    const server = import.meta.env.VITE_YJS_SERVER_URL || 'ws://localhost:6001';
    const provider = new WebsocketProvider(server, 'collab-doc', doc);
    provider.on('status', (ev) => { setConnected(ev.status === 'connected'); });

    const ytext = doc.getText('content');
    ytextRef.current = ytext;
    providerRef.current = provider;

    const observer = () => setValue(ytext.toString());
    ytext.observe(observer);

    // initialize local value
    setValue(ytext.toString());

    return () => {
      try { ytext.unobserve(observer); } catch (e) {}
      try { provider.disconnect(); } catch (e) {}
      doc.destroy();
    };
  }, []);

  function onChange(e) {
    const txt = e.target.value;
    const ytext = ytextRef.current;
    if (!ytext) return;
    // simple replace strategy
    ytext.delete(0, ytext.length);
    ytext.insert(0, txt);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Collaborative Editor (Yjs POC)</h2>
      <div>Connection: {connected ? '✅' : '❌'}</div>
      <textarea value={value} onChange={onChange} style={{ width: '100%', height: 300 }} />
    </div>
  );
}
