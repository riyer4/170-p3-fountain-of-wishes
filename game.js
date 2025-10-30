const coinStart = { x: 200, y: 600 };

let coin, dragLine, isDragging = false, dragStart;
let score = 0;
let scoreText, messageText;
let coinHasScored = false;

const tierBounds = [
    { x: 750, y: 550, width: 340, height: 70, score: 1 },
    { x: 750, y: 550, width: 170, height: 45, score: 3 },
    { x: 750, y: 550, width: 110, height: 30, score: 5 }
];


const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 800,
    backgroundColor: '#D48A9E',
    parent: 'game-container',
    physics: {
        default: 'matter',
        matter: { gravity: { y: 0.7 }, debug: false, setBounds: false }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('coin', 'wish.png');
    this.load.image('fountain', 'fountain.png');
    this.load.image('topWater', "topWater.png");
    this.load.image("midWater", "midWater.png");
    this.load.image("bottomWater", "bottomWater.png");
}

function create() {
    const scene = this;
    scene.add.image(750, 550, 'fountain').setScale(0.5);

    coin = scene.matter.add.image(coinStart.x, coinStart.y, 'coin').setScale(0.1);
    coin.setCircle((coin.displayWidth / 2) * 0.9);
    coin.setBounce(0.5);
    coin.setFriction(0.005);
    coin.setStatic(true);
    coin.setSleepThreshold(Infinity);
    coin.body.ignoreWorldBounds = true;


    // const topWater = scene.add.image(750, 550, 'topWater').setScale(0.5);
    // const midWater = scene.add.image(750, 550, 'midWater').setScale(0.5);
    // const bottomWater = scene.add.image(750, 550, 'bottomWater').setScale(0.5);

    // topWater.alpha = 1;
    // midWater.alpha = 1;
    // bottomWater.alpha = 1;

    // topWater.setAlpha(0.5);
    // midWater.setAlpha(0.5);
    // bottomWater.setAlpha(0.5);

    const waterSprites = [
        { key: 'bottomWater', x: tierBounds[0].x, y: tierBounds[0].y, score: tierBounds[0].score, alpha: 1 },
        { key: 'midWater', x: tierBounds[1].x, y: tierBounds[1].y, score: tierBounds[1].score, alpha: 1 },
        { key: 'topWater', x: tierBounds[2].x, y: tierBounds[2].y, score: tierBounds[2].score, alpha: 1 }
    ];

    waterSprites.forEach(w => {
        const sprite = scene.matter.add.sprite(w.x, w.y, w.key, null, { 
            isStatic: true, 
            isSensor: true
        });
        sprite.setScale(0.5);
        sprite.score = w.score;
        sprite.setAlpha(0.5);
    });

    scene.matter.world.on('collisionstart', event => {
        if (coinHasScored) return; 
        event.pairs.forEach(pair => {
            const bodies = [pair.bodyA, pair.bodyB];
            if (bodies.includes(coin.body)) {
                bodies.forEach(b => {
                    if (b.gameObject && b.gameObject.score) {
                        const tierScore = b.gameObject.score;
                        score += tierScore;
                        coinHasScored = true;
                        scoreText.setText('Fortune Gained: ' + score);
                        messageText.setText('Score! Wish received').setColor("#00FF0D");
                        showScorePopup(scene, tierScore, coin.x, coin.y);
                        resetCoin();
                    }
                });
            }
        });
    });

    scene.add.text(990, 20, '[Click Here to Reset]', { fontSize: '30px', fill: '#00FFFF' })
        .setOrigin(1, 0)
        .setInteractive()
        .on('pointerdown', () => resetCoin(true));

    dragLine = scene.add.graphics();
    scoreText = scene.add.text(20, 20, 'Fortune Gained: 0', { fontSize: '38px', fill: '#000000' });
    messageText = scene.add.text(20, 80, 'Click & drag to throw', { fontSize: '38px', fill: '#FFD903' });

    scene.input.on('pointerdown', pointer => {
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, coin.x, coin.y);
        if (dist < 60) {
            isDragging = true;
            dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y);
        }
    });

    scene.input.on('pointermove', pointer => {
        if (!isDragging) return;
        dragLine.clear();
        dragLine.lineStyle(3, 0x0077ff, 0.7);
        dragLine.strokeLineShape(new Phaser.Geom.Line(coinStart.x, coinStart.y, pointer.x, pointer.y));
    });

    scene.input.on('pointerup', pointer => {
        if (!isDragging) return;
        isDragging = false;
        dragLine.clear();

        const dragEnd = new Phaser.Math.Vector2(pointer.x, pointer.y);
        let pullVec = dragStart.clone().subtract(dragEnd);
        pullVec.y *= 1;

        const LAUNCH_MULT = 0.08;
        coin.setStatic(false);
        coin.setVelocity(pullVec.x * LAUNCH_MULT, pullVec.y * LAUNCH_MULT);
        coin.setAngularVelocity(0.2);
    });
}

function update() {
    if (!coin || coin.isStatic()) return;
    const cx = coin.x, cy = coin.y, r = (coin.displayWidth / 2) * 0.9;
    const SCREEN_WIDTH = 1000;
    const SCREEN_HEIGHT = 800;

    if (cx + r < 0 || cx - r > SCREEN_WIDTH || cy - r > SCREEN_HEIGHT) {
        resetCoin();
        messageText.setText('Miss :(').setColor("#BD0202");
        score -= 10;
        scoreText.setText('Fortune Gained: ' + score);
    }
}

function overlapsCircleRect(cx, cy, radius, rect, padding = 6) {
    const rx = rect.x - rect.width / 2 - padding;
    const ry = rect.y - rect.height / 2 - padding;
    const rw = rect.width + padding * 2;
    const rh = rect.height + padding * 2;
    const closestX = Phaser.Math.Clamp(cx, rx, rx + rw);
    const closestY = Phaser.Math.Clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy <= radius * radius;
}

function resetCoin(resetMessage = false) {
    if (!coin) return;
    coin.setStatic(true);
    coin.setVelocity(0, 0);
    coin.setAngularVelocity(0);
    coin.setPosition(coinStart.x, coinStart.y);
    isDragging = false;
    dragLine.clear();
    coinHasScored = false;

    if (resetMessage) {
        messageText.setText('Click & drag to throw').setColor("#FFd903");
        scoreText.setText('Fortune Gained: 0').setColor("#000000");
        score = 0;
    }
}


function showScorePopup(scene, value, x, y) {
    const popup = scene.add.text(x, y - 30, `+${value}`, { fontSize: '24px', fill: '#00FF0D', fontStyle: 'bold' }).setOrigin(0.5);
    scene.tweens.add({
        targets: popup,
        y: y - 60,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => popup.destroy()
    });
}

