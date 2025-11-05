export default class Tier {
    constructor(scene, x, y, width = 100, height = 30, score = 1) {
        this.score = score;

        // Visible rectangle for debugging
        this.debugRect = scene.add.rectangle(x, y, width, height, 0x00ff00, 0.3);

        // Add Matter sensor to rectangle
        this.body = scene.matter.add.gameObject(this.debugRect, {
            isStatic: true,
            isSensor: true
        });

        // Attach score to Matter body for collision detection
        this.body.score = score;
    }
}



