export default class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'winScene' });
    }


    preload() {

        this.load.image('granted', 'assets/granted.png');
    }

    create() {

        this.meme = this.add.image(600, 400, 'granted').setScale(2.35);
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.behind = this.add.rectangle(350, 20, 500, 60, 0xffffff).setOrigin(0, 0);

        this.subTitle = this.add.text(600, 50, 'Click [R] to Return', { fontSize: '40px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);

    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.returnKey)) {

            this.scene.start('menuScene');
        }
    }
}
