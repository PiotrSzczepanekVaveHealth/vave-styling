// Run this in a Figma plugin context for file:
// https://www.figma.com/design/kxh6WdJoOH391Llbs8MvEv/Vave-4-Design-System?node-id=408-7788&m=dev
//
// Save the downloaded JSON as:
// tokens/figma.icon-assets.json
//
// Then run:
// npm run import:icons

const iconRoot = await figma.getNodeByIdAsync('408:7788');

if (!iconRoot || !('findAll' in iconRoot)) {
  throw new Error('Icon root node 408:7788 was not found or cannot be traversed.');
}

const parseVariantName = (name) => {
  const result = {};

  for (const part of name.split(',')) {
    const [key, value] = part.split('=').map((item) => item.trim());

    if (key && value) {
      result[key] = value;
    }
  }

  return result;
};

const normalizeIconName = (name) => name.replace(/^icon\//, '').replace(/^[A-Z]/, (letter) => letter.toLowerCase());

const bytesToString = (bytes) => {
  let result = '';
  const chunkSize = 8192;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    result += String.fromCharCode(...bytes.slice(index, index + chunkSize));
  }

  return result;
};

const iconSets = iconRoot.findAll((node) => node.type === 'COMPONENT_SET' && node.name.startsWith('icon/'));
const sizeByIcon = new Map();
const weightByIcon = new Map();
const components = [];

for (const set of iconSets) {
  const iconName = normalizeIconName(set.name);

  if (!sizeByIcon.has(iconName)) {
    sizeByIcon.set(iconName, new Set());
  }

  if (!weightByIcon.has(iconName)) {
    weightByIcon.set(iconName, new Set());
  }

  for (const component of set.children.filter((child) => child.type === 'COMPONENT')) {
    const variant = parseVariantName(component.name);
    const size = Number(variant.size);
    const weight = variant.weight || 'regular';

    if (!size) {
      continue;
    }

    sizeByIcon.get(iconName).add(size);
    weightByIcon.get(iconName).add(weight);

    components.push({ iconName, weight, size, component });
  }
}

const icons = [];

for (const { iconName, weight, size, component } of components) {
  const svg = bytesToString(await component.exportAsync({ format: 'SVG' }));

  icons.push({
    name: iconName,
    weight,
    size,
    sizes: [...sizeByIcon.get(iconName)].sort((a, b) => a - b),
    weights: [...weightByIcon.get(iconName)].sort(),
    svg,
    sourceNodeId: component.id,
  });
}

const payload = JSON.stringify({ icons }, null, 2);

figma.showUI(
  `<html>
    <body style="font-family: sans-serif; padding: 16px;">
      <h2>Vave icon export</h2>
      <p>Exported ${icons.length} SVG icon assets.</p>
      <button id="download">Download figma.icon-assets.json</button>
      <textarea id="payload" style="width: 100%; height: 280px; margin-top: 12px;">${payload
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')}</textarea>
      <script>
        const payload = document.getElementById('payload').value;
        document.getElementById('download').onclick = () => {
          const blob = new Blob([payload], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'figma.icon-assets.json';
          link.click();
          URL.revokeObjectURL(url);
        };
      </script>
    </body>
  </html>`,
  { width: 720, height: 480 },
);
