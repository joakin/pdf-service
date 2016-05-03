# pdf-service

Node.js service that renders urls as pdfs.

## Usage

```
npm install
PORT=3000 node index.js
wget -o out.pdf http://localhost:3000/?url=http://en.m.wikipedia.org/wiki/Donut
# Awesome pdf at out.pdf
```

Requires node.js > 4.3
