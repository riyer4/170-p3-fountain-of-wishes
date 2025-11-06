export default class LoseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'loseScene' });
    }


    preload() {

        this.load.image('womp', 'assets/womp.jpg');
    }

    create() {

        this.meme = this.add.image(600, 400, 'womp').setScale(3);

        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.behind = this.add.rectangle(350, 720, 500, 60, 0xffffff).setOrigin(0, 0);

        this.subTitle = this.add.text(600, 750, 'Click [R] to Return', { fontSize: '40px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);

    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.returnKey)) {

            this.scene.start('menuScene');
        }
    }
}


