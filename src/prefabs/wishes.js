export default class Wishes {
    constructor(scene) {
        this.scene = scene;
        this.wishes = [];
        this.tierDefs = [
            { x: 950, y: 690, width: 280 },
            { x: 950, y: 515, width: 150 },
            { x: 950, y: 355, width: 90 }
        ];

        this.spawnLeftTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000),
            callback: () => this.spawnWish(true),
            loop: true
        });

        this.spawnRightTimer = this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000),
            callback: () => this.spawnWish(false),
            loop: true
        });
    }

    spawnWish(fromLeft) {
        const tier = Phaser.Utils.Array.GetRandom(this.tierDefs);
        const targetY = tier.y;

        const xStart = fromLeft
            ? Phaser.Math.Between(tier.x - 200, tier.x - 150)
            : Phaser.Math.Between(tier.x + 150, tier.x + 200);

        const yStart = targetY - Phaser.Math.Between(150, 200);

        const wish = this.scene.matter.add.image(xStart, yStart, 'coin', null, {
            restitution: 0.4,
            frictionAir: 0.05,
            collisionFilter: { group: -1 } 
        });
        wish.setScale(0.1);
        wish.setCircle(wish.displayWidth / 2);
        wish.isWish = true;

        const targetX = tier.x + Phaser.Math.Between(-tier.width / 3, tier.width / 3);
        const horiz = targetX - xStart;
        const travelTime = Phaser.Math.FloatBetween(2.0, 2.5); 
        const vx = horiz / (travelTime * 60);
        const vy = -Phaser.Math.FloatBetween(2.0, 2.5); 

        wish.setVelocity(vx, vy);
        wish.setAngularVelocity(Phaser.Math.FloatBetween(-0.3, 0.3));

        this.wishes.push({ sprite: wish, targetY });

        this.scene.time.delayedCall(10000, () => {
            if (wish && wish.body) {
                wish.destroy();
                this.wishes = this.wishes.filter(w => w.sprite !== wish);
            }
        });
    }

    update() {
        this.wishes.forEach((w, idx) => {
            const wish = w.sprite;
            if (!wish || !wish.body) return;

            if (wish.y < w.targetY) {
                wish.setVelocityY(Math.min(wish.body.velocity.y + 0.05, 3)); 
            }

            if (Phaser.Math.Distance.Between(wish.x, wish.y, 950, 550) < 50) {
                this.scene.sound.play('splash', { volume: 0.7, rate: 1.5 });
                wish.destroy();
                this.wishes.splice(idx, 1);
            }

            const playerCoin = this.scene.coin;
            if (playerCoin && !playerCoin.hasScored) {
                const dist = Phaser.Math.Distance.Between(wish.x, wish.y, playerCoin.x, playerCoin.y);
                if (dist < (wish.displayWidth + playerCoin.displayWidth) / 2) {
                    this.scene.sound.play('lose', { volume: 0.2, rate: 1.5 });
                    playerCoin.reset();
                    wish.destroy();
                    this.wishes.splice(idx, 1);
                    this.scene.messageText.setText('Blocked by another wish!').setColor("#BD0202");
                }
            }
        });
    }
}






