import { useState } from 'react';
import { htmlToMarkdown } from '@coding01/docsjs-markdown';

const SAMPLE_HTML = `
<h1>Sample Document</h1>
<p>This is a <strong>sample</strong> document with various formatting options.</p>
<h2>Features</h2>
<ul>
  <li>Bold and <em>italic</em> text</li>
  <li><a href="https://example.com">Links</a></li>
  <li>![Image](image.png)</li>
</ul>
<h2>Table</h2>
<table>
  <tr><th>Header 1</th><th>Header 2</th></tr>
  <tr><td>Cell 1</td><td>Cell 2</td></tr>
</table>
<blockquote>This is a quote</blockquote>
<pre><code>const x = 1;</code></pre>
<hr/>
`;

function App() {
  const [html] = useState(SAMPLE_HTML);
  const [format, setFormat] = useState<'gfm' | 'standard'>('gfm');
  const [showFrontmatter, setShowFrontmatter] = useState(false);
  const [markdown, setMarkdown] = useState('');

  const convert = () => {
    const options = { format, frontmatter: showFrontmatter };
    const result = htmlToMarkdown(html, options);
    setMarkdown(result);
  };

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>docsjs-markdown React Demo</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={showFrontmatter}
            onChange={e => setShowFrontmatter(e.target.checked)}
          />
          Include Frontmatter
        </label>

        <select
          value={format}
          onChange={e => setFormat(e.target.value as 'gfm' | 'standard')}
          style={{ marginLeft: '20px' }}
        >
          <option value="gfm">GFM (GitHub Flavored)</option>
          <option value="standard">Standard Markdown</option>
        </select>

        <button
          onClick={convert}
          style={{ marginLeft: '20px', padding: '8px 16px' }}
        >
          Convert
        </button>

        {markdown && (
          <button onClick={download} style={{ marginLeft: '10px', padding: '8px 16px' }}>
            Download
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>HTML Input</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
            {html}
          </pre>
        </div>

        <div>
          <h3>Markdown Output</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
            {markdown || 'Click Convert to see output'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
