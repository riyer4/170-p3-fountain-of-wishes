export default class Coin extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, key) {
        super(scene.matter.world, x, y, key);

        scene.add.existing(this);
        this.setScale(0.1);
        this.setCircle((this.displayWidth / 2) * 0.9);
        this.setBounce(0.5);
        this.setFriction(0.005);
        this.setStatic(true);
        this.setSleepThreshold(Infinity);
        this.body.ignoreWorldBounds = true;

        this.startX = x;
        this.startY = y;
        this.hasScored = false;
    }

    launch(pullVec) {
        this.setStatic(false);
        const LAUNCH_MULT = 0.08;
        this.setVelocity(pullVec.x * LAUNCH_MULT, pullVec.y * LAUNCH_MULT);
        this.setAngularVelocity(0.2);
    }

    reset() {
        this.setStatic(true);
        this.setVelocity(0, 0);
        this.setAngularVelocity(0);
        this.setPosition(this.startX, this.startY);
        this.hasScored = false;
    }

    applyWind(windVector) {
        const forceScale = 0.0005; 
        this.applyForce({ x: windVector.x * forceScale, y: windVector.y * forceScale });
    }
}

