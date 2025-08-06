import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [exportFormat, setExportFormat] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate search logic
    setTimeout(() => {
      setIsLoading(false);
      setResultCount(5); // Example result count
      setTotalCount(100); // Example total count
      setHistory(prev => [...prev, `検索: ${keyword}`]);
    }, 1000);
  };

  const handleReset = () => {
    setEmail('');
    setCategory('');
    setKeyword('');
    setYear('');
    setExportFormat('');
    setResultCount(0);
    setTotalCount(0);
  };

  return (
    <div className="App">
      <h1>検索ページ</h1>
      <form onSubmit={handleSearch}>
        <div>
          <label>メールアドレス</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>カテゴリ</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">選択してください</option>
            <option value="PMDA">PMDA</option>
            <option value="FDA">FDA</option>
          </select>
        </div>
        <div>
          <label>全文検索キーワード</label>
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
        <div>
          <label>期間</label>
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="">選択してください</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <button type="button" onClick={handleReset}>リセット</button>
        <button type="submit">検索</button>
      </form>

      {isLoading && <p>🔄 検索中です...</p>}

      <h3>履歴</h3>
      <ul>
        {history.map((item, index) => <li key={index}>{item}</li>)}
      </ul>

      <div>
        <p>{resultCount}件 / {totalCount}件</p>
        <label>出力形式</label>
        <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
          <option value="">選択してください</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </select>
        <button>出力</button>
      </div>
    </div>
  );
}

export default App;
