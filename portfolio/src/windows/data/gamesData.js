export const categories = [
    { id: 'jam', label: 'Game Jams' },
    { id: 'demo', label: 'Demos' },
    { id: 'prototype', label: 'Prototipos' },
    { id: 'complete', label: 'Completos' },
    { id: 'collab', label: 'Colaboraciones' },
    { id: 'hidden', label: '🔒 Oculto' }
];

export const gamesData = [
    {
        id: 'game1',
        title: 'Dungeon Crawler Jam',
        platform: 'PC, Web',
        year: '2024',
        categories: ['jam', 'complete'],
        description: 'Un roguelike en 2D hecho para la Global Game Jam 2024. Controlas a un héroe que debe bajar a las mazmorras para recuperar el amuleto perdido. Tiene tres niveles, combate por turnos y arte pixel art.',
        cartridgeImage: '/images/cartuchos/dungeon.png',
        screenshots: ['/images/screenshots/dungeon1.png', '/images/screenshots/dungeon2.png'],
        itchUrl: 'https://itch.io/embed/dungeon',
        collaborators: ['Alva Majo', 'Guinxu']
    },
    {
        id: 'game2',
        title: 'Space Invaders Remix',
        platform: 'Android, PC',
        year: '2023',
        categories: ['complete', 'collab'],
        description: 'Un homenaje a Space Invaders con mecánicas modernas y modo cooperativo. Desarrollado junto a Arakuma Studio. Más de 100k descargas en Play Store.',
        cartridgeImage: '/images/cartuchos/space.png',
        screenshots: ['/images/screenshots/space1.png', '/images/screenshots/space2.png'],
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.arakuma.space',
        collaborators: ['JasperDev', 'Arakuma Studio']
    },
    {
        id: 'game3',
        title: 'Puzzle Prototype',
        platform: 'PC',
        year: '2022',
        categories: ['prototype', 'demo'],
        description: 'Un prototipo de puzzle en 3D donde debes girar una esfera para alinear colores. Fue mi primera demo publicada en Itch.',
        cartridgeImage: '/images/cartuchos/puzzle.png',
        screenshots: ['/images/screenshots/puzzle1.png'],
        itchUrl: 'https://itch.io/embed/puzzle',
        collaborators: []
    },
    // ... más juegos ...
    {
        id: 'hidden_cartridge',
        title: '???.exe',
        platform: '???',
        year: '????',
        categories: ['hidden'],
        description: 'Este cartucho está sellado. Solo los que han descubierto la verdad pueden abrirlo.',
        cartridgeImage: '/images/cartuchos/hidden.png',
        screenshots: [],
        itchUrl: '',
        collaborators: [],
        isHidden: true // flag para saber que está bloqueado por defecto
    }
];