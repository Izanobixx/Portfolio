import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPUTER_ROOT = path.resolve(__dirname, '../../public/computer');
const OUTPUT_FILE = path.resolve(__dirname, '../../public/files.json');

const TYPE_MAP = {
    '.pdf': 'pdf',
    '.doc': 'doc',
    '.docx': 'doc',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.mp4': 'video',
    '.webm': 'video',
    '.mov': 'video',
    '.txt': 'text',
    '.md': 'text',
    '.html': 'html',
    '.css': 'css',
    '.js': 'js',
    '.json': 'json'
};

function getFileType(filename){
    const ext = path.extname(filename).toLowerCase();
    return TYPE_MAP[ext] || 'file';
}

function getIcon(type) {
    const icons = {
        'pdf': '📄',
        'doc': '📄',
        'image': '🖼️',
        'video': '🎬',
        'text': '📝',
        'html': '🌐',
        'css': '🎨',
        'js': '⚙️',
        'json': '📋',
        'folder': '📁',
        'file': '📎'
    };
    return icons[type] || '📎';
}

function readDirectory(dirPath, relativePath = ''){
    const entries = fs.readdirSync(dirPath, {withFileTypes: true });
    const result = [];

    for (const entry of entries){
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()){
            result.push({
                id: relPath.replace(/\\/g, '/'),
                label: entry.name,
                icon: '📁',
                type: 'folder',
                children: readDirectory(fullPath,relPath)
            });
        }
        else{
            const type = getFileType(entry.name);
            const icon = getIcon(type);
            result.push({
                id: relPath.replace(/\\/g, '/'),
                label: entry.name,
                icon: icon,
                type: type,
                url: `/computer/${relPath.replace(/\\/g, '/')}`
            });
        }
    }

    result.sort((a,b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.label.localeCompare(b.label);
    });

    return result;
}

function generate(){
    console.log('Scanning computer directory...');
    if (!fs.existsSync(COMPUTER_ROOT)){
        console.warn(`Directory ${COMPUTER_ROOT} does not exist. Creating empty structure.`);
        fs.mkdirSync(COMPUTER_ROOT, { recursive: true });
    }

    const tree = readDirectory(COMPUTER_ROOT, '');

    const root = {
        id: 'root',
        label: 'Este equipo',
        icon: '📁',
        type: 'folder',
        children: tree
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(root, null, 2));
    console.log(`Files succesfully written to ${OUTPUT_FILE}`);
}

generate();