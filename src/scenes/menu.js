export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'menuScene' });
    }


    preload() {

        this.load.image('coin', 'assets/wish.png');

    }

    create() {


        this.title = this.add.text(600, 150, 'Fountain of', { fontSize: '100px', fill: '#114cc1ff', fontStyle: 'bold' }).setOrigin(0.5);
        this.title2 = this.add.text(600, 250, 'Wishes', { fontSize: '100px', fill: '#ffcc00ff', fontStyle: 'bold' }).setOrigin(0.5);
        this.subTitle = this.add.text(600, 350, 'Click [S] to Start!', { fontSize: '40px', fill: '#000', fontStyle: 'bold' }).setOrigin(0.5);

        this.coin1 = this.add.image(600, 550, 'coin').setScale(0.8);
        this.coin2 = this.add.image(500, 650, 'coin').setScale(0.3);
        this.coin3 = this.add.image(700, 450, 'coin').setScale(0.3);

        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.startKey)) {

            this.scene.start('gameScene');
        }
    }
}
