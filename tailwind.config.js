/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './js/**/*.js'
  ],
  safelist: [
    {
      pattern: /(bg|text|border)-(mars-(cyan|magenta|yellow|green|bg|card|border)|amber-400|blue-300|blue-400|blue-500|purple-400|red-400|red-500|red-600|slate-(200|300|400|500|600|700|800|900|950))/
    },
    {
      pattern: /(bg|border)-(mars-(cyan|magenta|yellow|green|border)|blue-500|red-950)\/(10|20|30|40|50|60|70|80|90)/
    },
    'tab-active',
    'company-header-title',
    'glow-cyan',
    'terminal-border',
    'break-words',
    'truncate-line',
    'table-responsive-container',
    'overflow-x-auto',
    'whitespace-nowrap',
    'min-h-[44px]',
    'min-w-[44px]'
  ],
  theme: {
    extend: {
      colors: {
        'mars-bg': '#05070f',
        'mars-card': '#0b1120',
        'mars-border': '#1e293b',
        'mars-cyan': '#00f0ff',
        'mars-magenta': '#ff0055',
        'mars-yellow': '#ffb703',
        'mars-green': '#00ff66'
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['Courier New', 'Courier', 'monospace']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-magenta': '0 0 15px rgba(255, 0, 85, 0.4)',
        'neon-green': '0 0 15px rgba(0, 255, 102, 0.4)'
      }
    }
  },
  plugins: []
};
