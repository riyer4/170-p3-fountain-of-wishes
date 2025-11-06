// src/prefabs/tier.js
export default class Tier extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, width, height, score, key = 'topWater') {
        super(scene.matter.world, x, y, key);
        scene.add.existing(this);

        this.setDisplaySize(width, height);
        this.setOrigin(0.5, 0.5);

        this.setStatic(true);
        this.setSensor(true);

        this.setAlpha(0.5);

        this.score = score;
    };
};






