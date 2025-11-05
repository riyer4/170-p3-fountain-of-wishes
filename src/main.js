import GameScene from './scenes/game.js';

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    parent: 'game-container',
    backgroundColor: "#D48A9E",
    physics: {
        default: 'matter',
        matter: { gravity: { y: 0.7 }, debug: false }
    },
    scene: [GameScene]
};

new Phaser.Game(config);
