export default class Wishes {
    constructor(scene) {
        this.scene = scene;
        this.wishes = [];
        this.tierDefs = [
            { x: 950, y: 690, width: 280 },
            { x: 950, y: 515, width: 150 },
            { x: 950, y: 355, width: 90 }
        ];

        this.spawnTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(2000, 3000),
            callback: this.spawnWave,
            callbackScope: this,
            loop: true
        });
    }

    spawnWave() {
        if (!this.scene) return;

        // Spawn left wish
        this.spawnWish(true);

        // Spawn right wish
        this.spawnWish(false);
    }

    spawnWish(fromLeft) {
        const tier = Phaser.Utils.Array.GetRandom(this.tierDefs);
        const xStart = fromLeft
            ? tier.x - Phaser.Math.Between(200, 400) // left side
            : tier.x + Phaser.Math.Between(150, 200); // right side
        const spawnY = tier.y;

        const wish = this.scene.matter.add.image(xStart, spawnY, 'coin', null, {
            restitution: 0.4,
            frictionAir: 0.04,
            collisionFilter: { group: -1 } // no collision with other wishes
        });
        wish.setScale(0.12);
        wish.setCircle((wish.displayWidth / 2) * 0.9);
        wish.isWish = true;

        const targetX = tier.x + Phaser.Math.Between(-tier.width / 3, tier.width / 3);
        const horiz = targetX - xStart;
        const travelTime = Phaser.Math.FloatBetween(2.0, 2.5); // slower arch
        const vx = horiz / (travelTime * 60);
        const vy = -Phaser.Math.FloatBetween(2.5, 3.5); // gentle upward arc
        wish.setVelocity(vx, vy);
        wish.setAngularVelocity(Phaser.Math.FloatBetween(-0.3, 0.3));

        this.wishes.push(wish);

        this.scene.time.delayedCall(10000, () => {
            if (wish && wish.body) {
                wish.destroy();
                this.wishes = this.wishes.filter(w => w !== wish);
            }
        });
    }

    update() {
        this.wishes.forEach(wish => {
            if (!wish || !wish.body) return;

            const fountainX = 950;
            const fountainY = 550;
            const r = wish.displayWidth / 2;

            if (Phaser.Math.Distance.Between(wish.x, wish.y, fountainX, fountainY) < 50) {
                this.scene.sound.play('splash', { volume: 0.7, rate: 1.5 });
                wish.destroy();
                this.wishes = this.wishes.filter(w => w !== wish);
            }

            const playerCoin = this.scene.coin;
            if (playerCoin && !playerCoin.hasScored) {
                const dist = Phaser.Math.Distance.Between(wish.x, wish.y, playerCoin.x, playerCoin.y);
                if (dist < r + playerCoin.displayWidth / 2) {
                    this.scene.sound.play('lose', { volume: 0.2, rate: 1.5 });
                    playerCoin.reset();
                    wish.destroy();
                    this.wishes = this.wishes.filter(w => w !== wish);
                    this.scene.messageText.setText('Blocked by another wish!').setColor("#BD0202");
                }
            }
        });
    }
}





