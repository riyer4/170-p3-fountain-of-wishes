export default class Tier {
    constructor(scene, x, y, width, height, score) {
        this.scene = scene;
        this.score = score;

        // Use Phaser rectangle GameObject
        this.sprite = scene.add.rectangle(x, y, width, height, 0x00ff00, 0);

        // Matter sensor
        this.body = scene.matter.add.gameObject(this.sprite, {
            isStatic: true,
            isSensor: true
        });

        // Attach score
        this.body.score = score;
    }
}





