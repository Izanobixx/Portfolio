export const categories = [
    { id: 'jam', label: 'Game Jams' },
    { id: 'prototype', label: 'Prototipos' },
    { id: 'complete', label: 'Completos' },
    { id: 'collab', label: 'Colaboraciones' },
    { id: 'fangame', label: 'Fan Game' },
    { id: 'installed', label: 'Instalados' },
];

export const gamesData = [
    {
        id: 'DiceDefence',
        title: 'Dice Defense',
        platform: 'PC',
        year: '2022',
        categories: ['jam', 'complete', 'collab'],
        description: 'Un juego de estrategia por turnos para un solo jugador. Fue creado en tan solo <b>2 días</b> para la GMTK Game Jam 2022, quedando entre el top 8% de juegos mejores valorados (con más de 6000 juegos presentados).',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/dd2.png',
            import.meta.env.BASE_URL + 'images/screenshots/dd1.png',
            import.meta.env.BASE_URL + 'images/screenshots/dd3.png'
        ],
        itchUrl: 'https://s-dev.itch.io/dice-defence',
        collaborators: ['S-Dev', 'Ángel']
    },
    {
        id: '10devs',
        title: 'Juego de titanes',
        platform: 'PC',
        year: '2023',
        categories: ['jam', 'prototype', 'collab'],
        description: 'Un juego de titanes creado como un reto para redes sociales entre 10 famosos desarrolladores de videojuegos. Cada desarrollador disponía solo de solo 3 horas para trabajar en el juego, y no se permitía la comunicación en la duración del reto.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/titanes1.png',
            import.meta.env.BASE_URL + 'images/screenshots/titanes2.png'
        ],
        itchUrl: 'https://s-dev.itch.io/10-devs-juego',
        collaborators: ['S-Dev', 'Guinxu', 'Alva Majo', 'Gexe', 'Findemor', '...'],
        descargas: '94.3K'
    },
    {
        id: 'hOld',
        title: 'hOld',
        platform: 'Android',
        year: '2020',
        categories: ['complete'],
        description: 'Mantén tu dedo dentro del circulo. No es tan fácil como parece.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/hold1.png',
            import.meta.env.BASE_URL + 'images/screenshots/hold2.png'
        ],
        itchUrl: 'https://s-dev.itch.io/hold',
        collaborators: ['S-Dev'],
    },
    {
        id: 'SMOL',
        title: 'Mario Lego',
        platform: 'PC',
        year: '2022',
        categories: ['complete', 'fangame'],
        description: 'Un fangame de Super Mario Odyssey, pero en su versión de lego.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/smol1.png',
            import.meta.env.BASE_URL + 'images/screenshots/smol2.png',
            import.meta.env.BASE_URL + 'images/screenshots/smol3.png',
            import.meta.env.BASE_URL + 'images/screenshots/smol4.png',
            import.meta.env.BASE_URL + 'images/screenshots/smol5.png',
            import.meta.env.BASE_URL + 'images/screenshots/smol6.png'
        ],
        itchUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRk4mEzoHzeRmX32AJSSnijHd_pOV9aA3pF635blqREAg&s=10',
        collaborators: ['S-Dev'],
    },
    {
        id: 'HGITW',
        title: 'Hardest Game In The World',
        platform: 'PC',
        year: '2025',
        categories: ['prototype'],
        description: 'Prototipo de un juego de puzles. Se te presenta una información en pantalla, y sin instrucciones tienes que averiguar qué hacer. Me parece un concepto muy interesante, y quizás en el futuro lo convierta en un juego completo.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/puzzle1.png'
        ],
        itchUrl: 'https://s-dev.itch.io/10-https://s-dev.itch.io/the-hardest-game-in-the-world-juego',
        collaborators: ['S-Dev'],
    },
    {
        id: 'GOI',
        title: 'Golfing Over It 3D',
        platform: 'PC',
        year: '2022',
        categories: ['complete', 'fangame'],
        description: 'Adaptacióno al 3D del juego Golfing Over It. Un juego similar al Only Up, pero donde intentas llevar una pelota de golf hasta la cima, perdiendo todo tu progreso si te caes.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/GOI1.png',
            import.meta.env.BASE_URL + 'images/screenshots/GOI2.png',
            import.meta.env.BASE_URL + 'images/screenshots/GOI3.png',
            import.meta.env.BASE_URL + 'images/screenshots/GOI4.png',
            import.meta.env.BASE_URL + 'images/screenshots/GOI5.png'
        ],
        itchUrl: 'https://s-dev.itch.io/golfing-over-it-with-alva-majo-3d',
        collaborators: ['S-Dev'],
        descargas: '1.2K'
    },
    {
        id: 'ZombieGame',
        title: 'A Zombie Game',
        platform: 'PC',
        year: '2025',
        categories: ['prototype', ],
        description: 'Prototipo de un friendsolp de zombies por rondas. Tanto los gráficos como el códgio de este juego están hechos por mi.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/azg1.png',
            import.meta.env.BASE_URL + 'images/screenshots/azg2.png',
            import.meta.env.BASE_URL + 'images/screenshots/azg3.png',
            import.meta.env.BASE_URL + 'images/screenshots/azg4.png',
            import.meta.env.BASE_URL + 'images/screenshots/azg5.png'
        ],
        itchUrl: 'https://s-dev.itch.io/zombie-game',
        collaborators: ['S-Dev'],
    },
    {
        id: 'FNAYP',
        title: 'Five Nights At Your Place',
        platform: 'Android',
        year: '2024',
        categories: ['complete', 'fangame'],
        description: 'Un fangame de Five Nights At Freddys, donde en vez de jugar en una clásica pizzería, los 4 animatronicos recorrerán tu casa intentando matarte. Esto se consigue haciendo fotos de las diferentes habitaciones de tu casa y haciendo un mapa de ellas.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/fnaf1.png',
            import.meta.env.BASE_URL + 'images/screenshots/fnaf2.png'
        ],
        playStoreUrl: 'https://s-dev.itch.io/five-nights-at-your-place-alpha-10',
        collaborators: ['S-Dev'],
        descargas: '30.6K'
    },
    {
        id: 'Username',
        title: 'Username',
        platform: 'PC',
        year: '2021',
        categories: ['complete', 'jam'],
        description: 'Juego donde el objetivo es crear un nombre de usuario que cumpla todos los requisitos que se van imponiendo.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/username.png',
            import.meta.env.BASE_URL + 'images/screenshots/username2.png'
        ],
        itchUrl: 'https://s-dev.itch.io/username',
        collaborators: ['S-Dev'],
    },
    {
        id: 'GDL',
        title: 'Google Dinasour Lego',
        platform: 'PC',
        year: '2022',
        categories: ['complete', 'fangame'],
        description: 'Un fangame del dinosaurio de google, pero en su versión de lego.',
        screenshots: [
            import.meta.env.BASE_URL + 'images/screenshots/gdl.png'
        ],
        itchUrl: 'https://s-dev.itch.io/lego-google-dinosaur',
        collaborators: ['S-Dev'],
        descargas: '2.8K'
    },
];