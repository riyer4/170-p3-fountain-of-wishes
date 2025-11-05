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
        this.load.image('arrow', 'assets/arrow.png');

        this.load.audio('splash', 'assets/splash.mp3');
        this.load.audio('ding', 'assets/ding.mp3');
        this.load.audio('lose', 'assets/youLose.mp3');
    }

    create() {
        this.add.image(950, 550, 'fountain').setScale(0.5);

        this.coin = new Coin(this, 200, 600, 'coin');

        this.fortuneBarBG = this.add.rectangle(200, 40, 300, 30, 0xAAAAAA).setOrigin(0, 0.5);
        this.fortuneBar = this.add.rectangle(200, 40, 300 * 0.25, 30, 0xFFD903).setOrigin(0, 0.5);
        this.fortuneLabel = this.add.text(50, 40, 'Fortune: ', { fontSize: '28px', fill: '#000', fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.fortuneValue = 0.25;

        this.messageText = this.add.text(20, 60, 'Click & drag to throw', { fontSize: '28px', fill: '#FFD903', fontStyle: 'bold' });

        this.dragLine = this.add.graphics();
        this.isDragging = false;
        this.dragStart = null;

        this.tiers = [
            new Tier(this, 950, 690, 280, 50, 1),
            new Tier(this, 950, 515, 150, 25, 3),
            new Tier(this, 950, 355, 90, 30, 5)
        ];

        this.topTier = this.add.image(950, 550, "topWater").setScale(0.5).setAlpha(0.5);
        this.midTier = this.add.image(950, 550, "midWater").setScale(0.5).setAlpha(0.5);
        this.bottomTier = this.add.image(950, 550, "bottomWater").setScale(0.5).setAlpha(0.5);

        this.windArrow = this.add.image(80, 700, 'arrow').setOrigin(0.5).setScale(0.25);
        this.windText = this.add.text(50, 750, '0 mph', { fontSize: '24px', fill: '#000', fontStyle: 'bold' });
        this.stageText = this.add.text(600, 60, '20', { fontSize: '32px', fill: '#000', fontStyle: 'bold' });
        this.timerText = this.add.text(585, 15, 'Timer', { fontSize: '24px', fill: '#000', fontStyle: 'bold' });
        this.timerBox = this.add.graphics();
        this.timerBox.lineStyle(4, 0x000000);
        this.timerBox.strokeRect(580, 45, 80, 60);

        this.stageDuration = 20000;
        this.stageNumber = 1;
        this.windForce = new Phaser.Math.Vector2(0, 0);

        this.stageTimer = this.time.addEvent({
            delay: this.stageDuration,
            callback: this.nextStage,
            callbackScope: this,
            loop: true
        });

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

            this.fortuneValue -= 0.25 / 8;
            if (this.fortuneValue < 0) this.fortuneValue = 0;
            this.updateFortuneBar();
        });

        this.matter.world.on('collisionstart', event => {
            if (this.coin.hasScored) return;
            event.pairs.forEach(pair => {
                const bodies = [pair.bodyA, pair.bodyB];
                bodies.forEach(b => {
                    if (b.gameObject && b.gameObject.score) {
                        const tierScore = b.gameObject.score;
                        this.sound.play('ding', { volume: 0.2, rate: 1.5 });
                        this.sound.play('splash', { volume: 0.7, rate: 1.5 });
                        this.coin.hasScored = true;
                        this.messageText.setText('Score! Wish received').setColor("#00FF0D");
                        this.showScorePopup(tierScore, this.coin.x, this.coin.y);
                        this.coin.reset();

                        const incrementMap = {1: 1/32, 3: 3/32, 5: 5/32};
                        this.fortuneValue += incrementMap[tierScore] || 0;
                        if (this.fortuneValue > 1) this.fortuneValue = 1;
                        this.updateFortuneBar();
                    }
                });
            });
        });

        this.add.text(1180, 20, '[Click Here to Reset]', { fontSize: '30px', fill: '#00FFFF', fontStyle: "bold" })
            .setOrigin(1, 0)
            .setInteractive()
            .on('pointerdown', () => this.resetGame());

    }

    update(time, delta) {
        if (!this.coin || this.coin.hasScored) return;

        this.coin.applyWind(this.windForce);

        const cx = this.coin.x;
        const cy = this.coin.y;
        const r = this.coin.displayWidth / 2;
        const SCREEN_WIDTH = this.sys.game.config.width;
        const SCREEN_HEIGHT = this.sys.game.config.height;

        if (cx + r < 0 || cx - r > SCREEN_WIDTH || cy - r > SCREEN_HEIGHT || cy + r < 0) {
            this.coin.reset();
            this.sound.play('lose', { volume: 0.2, rate: 1.5 });
            this.messageText.setText('Miss :(').setColor("#BD0202");
        }

        this.windArrow.setRotation(this.windForce.angle());
        this.windText.setText(Math.round(this.windForce.length()) + ' mph');
        this.stageText.setText(Math.ceil(this.stageTimer.getRemaining() / 1000));
    }

    nextStage() {
        this.stageNumber++;
        const angle = Phaser.Math.FloatBetween(0, 2 * Math.PI);
        const speed = Phaser.Math.FloatBetween(2, 10);
        this.windForce = new Phaser.Math.Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
        console.log(`Stage ${this.stageNumber} wind: angle ${angle}, speed ${speed}`);
    }

    resetGame() {
        this.coin.reset();
        this.fortuneValue = 0.25;
        this.updateFortuneBar();
        this.stageNumber = 1;
        this.windForce.set(0, 0);
        this.windArrow.setRotation(0);
        this.windText.setText('0 mph');
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

    updateFortuneBar() {
        this.fortuneBar.width = 300 * this.fortuneValue;
    }
}

