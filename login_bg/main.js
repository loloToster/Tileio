const dynamicCells = [
    {
        img: "calendar.png",
        w: 2,
        h: 3
    },
    {
        img: "music.png",
        w: 2,
        h: 2
    },
    {
        img: "note.png",
        w: 2,
        h: 2
    },
    {
        img: "weather.png",
        w: 3,
        h: 2
    },
    {
        img: "calculator.png",
        w: 2,
        h: 1
    }
]

const linkCells = [
    { slug: 'facebook', color: '#1877F2' },
    { slug: 'spotify', color: '#1DB954' },
    { slug: 'stackoverflow', color: '#F58025' },
    { slug: 'youtube', color: '#FF0000' },
    { slug: 'messenger', color: '#00B2FF' },
    { slug: 'discord', color: '#5865F2' },
    { slug: 'gmail', color: '#EA4335' },
    { slug: 'reddit', color: '#FF4500' },
    { slug: 'instagram', color: '#E4405F' },
    { slug: 'twitch', color: '#9146FF' },
    { slug: 'tiktok', color: '#000000' },
    { slug: 'github', color: '#181717' },
    { slug: 'twitter', color: '#1DA1F2' },
    { slug: 'netflix', color: '#E50914' },
    { slug: 'zoom', color: '#2D8CFF' },
    { slug: 'steam', color: '#000000' },
    { slug: 'xbox', color: '#107C10' },
    { slug: 'evernote', color: '#00A82D' },
    { slug: 'googlechat', color: '#00AC47' },
    { slug: 'itunes', color: '#FB5BC5' },
    { slug: 'kahoot', color: '#46178F' },
    { slug: 'githubsponsors', color: '#EA4AAA' },
    { slug: 'googletranslate', color: '#4285F4' },
    { slug: 'youtubemusic', color: '#FF0000' },
    { slug: 'bitcoin', color: '#F7931A' },
    { slug: 'googlemaps', color: '#4285F4' },
    { slug: 'googlekeep', color: '#FFBB00' },
    { slug: 'jamboard', color: '#F37C20' },
    { slug: 'socialblade', color: '#B3382C' },
    { slug: 'nodered', color: '#8F0000' },
    { slug: 'wikipedia', color: '#000000' },
    { slug: 'paypal', color: '#00457C' },
    { slug: 'revolut', color: '#0075EB' },
    { slug: 'googlemeet', color: '#00897B' },
    { slug: 'googlesheets', color: '#34A853' },
    { slug: 'octoprint', color: '#13C100' }
]

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const grid = GridStack.init({
    margin: "5px",
    column: 20,
    row: 10,
    cellHeight: 96,
    float: true
})

let loginBox = grid.addWidget({
    x: 8, y: 2,
    w: 4, h: 6,
    noResize: true
})

dynamicCells.forEach(c => {
    while (true) {
        const x = random(1, 19 - c.w)
        const y = random(1, 9 - c.h)

        if (!grid.isAreaEmpty(x, y, c.w, c.h)) continue

        grid.addWidget({
            x, y, w: c.w, h: c.h,
            content: `<img class="dynamic" src="./dynamic-cells/${c.img}">`
        })

        break
    }
})

linkCells.forEach(l => {
    while (true) {
        const w = random(1, 2)
        const h = random(1, 2)
        const x = random(0, 19 - (w - 1))
        const y = random(0, 9 - (h - 1))

        if (!grid.isAreaEmpty(x, y, w, h)) continue

        let widget = grid.addWidget({
            x, y, w, h,
            content: `<div class="link">
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/${l.slug}.svg">
                      </div>`
        })

        widget.style.setProperty("--bg", l.color)

        break
    }
})

const fillBtn = document.getElementById("fill")
fillBtn.onclick = () => {
    grid.removeWidget(loginBox)

    while (true) {
        if (!grid.willItFit({})) break
        grid.addWidget({ content: "" })
    }

    fillBtn.remove()
    setTimeout(() => window.scrollTo(0, 0), 10)
}

setTimeout(() => window.scrollTo(0, 0), 10)
