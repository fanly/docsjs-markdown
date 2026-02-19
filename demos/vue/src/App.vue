import { createApp, ref } from 'vue';
import { htmlToMarkdown } from '@coding01/docsjs-markdown';

const SAMPLE_HTML = `
<h1>Sample Document</h1>
<p>This is a <strong>sample</strong> document with various formatting options.</p>
<h2>Features</h2>
<ul>
  <li>Bold and <em>italic</em> text</li>
  <li><a href="https://example.com">Links</a></li>
  <li>Images</li>
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

const App = {
  setup() {
    const html = ref(SAMPLE_HTML);
    const format = ref<'gfm' | 'standard'>('gfm');
    const showFrontmatter = ref(false);
    const markdown = ref('');

    const convert = () => {
      const options = { format: format.value, frontmatter: showFrontmatter.value };
      markdown.value = htmlToMarkdown(html.value, options);
    };

    const download = () => {
      const blob = new Blob([markdown.value], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      a.click();
      URL.revokeObjectURL(url);
    };

    return { html, format, showFrontmatter, markdown, convert, download };
  },
  template: `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1>docsjs-markdown Vue Demo</h1>

      <div style="margin-bottom: 20px;">
        <label>
          <input type="checkbox" v-model="showFrontmatter" />
          Include Frontmatter
        </label>

        <select v-model="format" style="margin-left: 20px;">
          <option value="gfm">GFM (GitHub Flavored)</option>
          <option value="standard">Standard Markdown</option>
        </select>

        <button @click="convert" style="margin-left: 20px; padding: 8px 16px;">
          Convert
        </button>

        <button v-if="markdown" @click="download" style="margin-left: 10px; padding: 8px 16px;">
          Download
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div>
          <h3>HTML Input</h3>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 400px;">
{{ html }}
          </pre>
        </div>

        <div>
          <h3>Markdown Output</h3>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto; max-height: 400px;">
{{ markdown || 'Click Convert to see output' }}
          </pre>
        </div>
      </div>
    </div>
  `
};

createApp(App).mount('#app');
