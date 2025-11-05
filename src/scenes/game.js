import Coin from '../prefabs/coin.js';
import Tier from '../prefabs/tier.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'gameScene' });
        this.score = 0;
    }

    preload() {
        this.load.image('coin', 'assets/wish.png');
        this.load.image('fountain', 'assets/fountain.png');
        this.load.image('topWater', 'assets/topWater.png');
        this.load.image('midWater', 'assets/midWater.png');
        this.load.image('bottomWater', 'assets/bottomWater.png');
    }

    create() {
        this.add.image(950, 550, 'fountain').setScale(0.5);

        this.coin = new Coin(this, 200, 600, 'coin');

        this.scoreText = this.add.text(20, 20, 'Fortune Gained: 0', { fontSize: '28px', fill: '#000' });
        this.messageText = this.add.text(20, 60, 'Click & drag to throw', { fontSize: '28px', fill: '#FFD903' });

        this.dragLine = this.add.graphics();
        this.isDragging = false;
        this.dragStart = null;

        // Create tiers
        this.tiers = [
            new Tier(this, 950, 690, 280, 50, 1),
            new Tier(this, 950, 515, 150, 25, 3),
            new Tier(this, 950, 355, 90, 10, 5)
        ];

        this.topTier = this.add.image(950, 550, "topWater").setScale(0.5).setAlpha(0.5);
        this.midTier = this.add.image(950, 550, "midWater").setScale(0.5).setAlpha(0.5);
        this.bottomTier = this.add.image(950, 550, "bottomWater").setScale(0.5).setAlpha(0.5);

        this.input.on('pointerdown', pointer => {
            const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.coin.x, this.coin.y);
            if (dist < 60) {
                this.isDragging = true;
                this.dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y);
            }
        });

        this.input.on('pointermove', pointer => {
            if (!this.isDragging) return;
            this.dragLine.clear();
            this.dragLine.lineStyle(3, 0x0077ff, 0.7);
            this.dragLine.strokeLineShape(new Phaser.Geom.Line(this.coin.x, this.coin.y, pointer.x, pointer.y));
        });

        this.input.on('pointerup', pointer => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.dragLine.clear();

            const dragEnd = new Phaser.Math.Vector2(pointer.x, pointer.y);
            let pullVec = this.dragStart.clone().subtract(dragEnd);
            this.coin.launch(pullVec);
        });

        // Collision detection
        this.matter.world.on('collisionstart', event => {
            if (this.coin.hasScored) return;

            event.pairs.forEach(pair => {
                const bodies = [pair.bodyA, pair.bodyB];
                bodies.forEach(b => {
                    if (b.gameObject && b.gameObject.score) {
                        const tierScore = b.gameObject.score;

                        // Add score once per throw
                        this.score += tierScore;
                        this.coin.hasScored = true;

                        this.scoreText.setText('Fortune Gained: ' + this.score);
                        this.messageText.setText('Score! Wish received').setColor("#00FF0D");
                        this.showScorePopup(tierScore, this.coin.x, this.coin.y);
                        this.coin.reset();
                    }
                });
            });
        });

        this.add.text(1180, 20, '[Click Here to Reset]', { fontSize: '30px', fill: '#00FFFF' })
            .setOrigin(1, 0)
            .setInteractive()
            .on('pointerdown', () => this.resetGame());
    }

    update() {
        if (!this.coin || this.coin.hasScored) return;

        // Get coin bounds
        const cx = this.coin.x;
        const cy = this.coin.y;
        const r = this.coin.displayWidth / 2;

        const SCREEN_WIDTH = this.sys.game.config.width;
        const SCREEN_HEIGHT = this.sys.game.config.height;

        // If coin goes off screen
        if (cx + r < 0 || cx - r > SCREEN_WIDTH || cy - r > SCREEN_HEIGHT || cy + r < 0) {
            this.coin.reset();
            this.messageText.setText('Miss :(').setColor("#BD0202");
        }
    }


    resetGame() {
        this.coin.reset();
        this.score = 0;
        this.scoreText.setText('Fortune Gained: 0');
        this.messageText.setText('Click & drag to throw').setColor("#FFD903");
    }

    showScorePopup(value, x, y) {
        const popup = this.add.text(x, y - 30, `+${value}`, { fontSize: '24px', fill: '#00FF0D', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({
            targets: popup,
            y: y - 60,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => popup.destroy()
        });
    }
}


