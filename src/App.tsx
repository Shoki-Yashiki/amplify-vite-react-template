import React, { useState, useEffect } from 'react';
import './App.css';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();
const WEBSOCKET_URL = "wss://b96kdpstti.execute-api.ap-northeast-1.amazonaws.com/dev/";

function App() {
  const [email, setEmail] = useState('');
  const [keyword, setKeyword] = useState('');
  const [source, setSource] = useState('');
  const [period, setPeriod] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [progress, setProgress] = useState({ received: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    connectWebSocket();
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket(WEBSOCKET_URL);
    ws.onopen = () => console.log("✅ WebSocket 接続成功");
    ws.onmessage = (event) => handleMessage(event);
    ws.onerror = (error) => console.error("❌ WebSocket エラー:", error);
    ws.onclose = () => console.log("🔌 WebSocket 接続終了");
    setSocket(ws);
  };

  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.message === "総検索件数") {
      setProgress({ received: 0, total: data.data });
      return;
    }

    if (data.message === "分析結果" && data.data) {
      const { timestamp, 回収理由, 危惧される具体的な健康被害, 現象・リスク分析 } = data.data;
      const productId = timestamp.split('#')[1] || '不明';
      const resultHTML = `
        <div class="result-item">
          <strong>製品ID:</strong> ${productId}<br/><br/>
          <strong>回収理由:</strong><pre>${回収理由}</pre><br/>
          <strong>危惧される具体的な健康被害:</strong><pre>${危惧される具体的な健康被害}</pre><br/>
          <strong>現象・リスク分析:</strong><pre>${現象・リスク分析}</pre>
        </div>
      `;
      setResults(prev => [...prev, resultHTML]);
      setProgress(prev => ({ ...prev, received: prev.received + 1 }));
      return;
    }

    if (data.message === "CSVファイルが生成されました。以下のリンクからダウンロードできます。" && data.url) {
      const downloadHTML = `
        <div style="margin-top: 20px;">
          <a href="${data.url}" download target="_blank" style="color: #008D61; font-weight: bold;">
            📥 CSVファイルをダウンロード
          </a>
        </div>
      `;
      setResults(prev => [...prev, downloadHTML]);
      return;
    }

    if (data.message === "全件の処理が完了しました" || data.message === "条件に該当する回収情報はありませんでした。") {
      setLoading(false);
      alert(data.message);
    }
  };

  const handleSearch = () => {
    if (!email || !keyword || !source || !period) {
      alert("⚠️ 入力に不備があります。すべての項目を入力してください。");
      return;
    }

    setLoading(true);
    setResults([]);
    setProgress({ received: 0, total: 0 });

    const message1 = {
      action: "sendMessage",
      data: { keyword, period, source, email }
    };
    const message2 = {
      action: "PMDA",
      data: { keyword, period, source, email }
    };

    socket?.send(JSON.stringify(message1));
    socket?.send(JSON.stringify(message2));
  };

  const handleReset = () => {
    setEmail('');
    setKeyword('');
    setSource('');
    setPeriod('');
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>検索条件</h2>
        <label>メールアドレス</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレスを入力" />

        <label>カテゴリ</label>
        <select value={source} onChange={e => setSource(e.target.value)}>
          <option value="">選択してください</option>
          <option value="PMDA">PMDA</option>
          <option value="FDA">FDA</option>
        </select>

        <label>全文検索キーワード</label>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="キーワードを入力" />

        <label>期間</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="">選択してください</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>

        <button className="reset-button" onClick={handleReset}>リセット</button>
        <button className="search-button" onClick={handleSearch} disabled={loading}>
          {loading ? "検索中..." : "検索"}
        </button>
        {loading && <div id="loadingMessage">🔄 検索中です...</div>}
        <button className="history-button">履歴</button>
      </div>

      <div className="main">
        <h2>検索結果</h2>
        <div id="progressDisplay">{progress.received}件 / {progress.total}件</div>
        <div className="results" dangerouslySetInnerHTML={{ __html: results.join('') }} />
        <div className="export-section">
          <select>
            <option value="">選択してください</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
          <button>出力</button>
        </div>
      </div>
    </div>
  );
}

export default App;
