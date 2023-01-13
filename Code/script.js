
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 } } },


  scene: {
    preload: preload,
    create: create,
    update: update } };



const game = new Phaser.Game(config);
let cursors;
let player;
let showDebug = false;

function preload() {

  // Loading tileset and tilemap
  this.load.image("tiles", "https://raw.githubusercontent.com/OskarWojtczak/PhaserGamePokemon/main/Assets/Pokemon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "https://raw.githubusercontent.com/OskarWojtczak/PhaserGamePokemon/main/Assets/Oskemon-town-noflowers.tmj");

  
  // Loading character Atlas png with associated json
  this.load.atlas("atlas", "https://raw.githubusercontent.com/OskarWojtczak/PhaserGamePokemon/main/Assets/OskarAtlas2.png", "https://raw.githubusercontent.com/OskarWojtczak/PhaserGamePokemon/main/Assets/OskarAtlas2.json");
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  
  // The parameters are the name given to the tileset in Tiled and the key given in preload above
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // Parameters: layer name assigned in Tiled, tileset, x, y

  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

  
// Enable collisons
  worldLayer.setCollisionByProperty({ collides: true });

  
  // Making sure all tiles in the above layer from Tiled are on top.
  aboveLayer.setDepth(10);

  
  // In Tiled, a spawn point was set using an object layer
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  
  // Creating a sprite with physics enabled. I had a little trouble with the collision box so I added a collison box checker and adjusted it using the setSize and setOffset
  player = this.physics.add.
  sprite(spawnPoint.x, spawnPoint.y, "atlas", "oskar-front.png").
  setSize(105, 85).
  setOffset(44, 95).
  setDisplaySize(65,65);


  // Add check for player and worldLayer collisions throughout scene
  this.physics.add.collider(player, worldLayer);


  // Sprite animations created from atlas
  const anims = this.anims;
  anims.create({
    key: "oskar-left-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "oskar-left-walk.", suffix: ".png", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });

  anims.create({
    key: "oskar-right-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "oskar-right-walk.", suffix: ".png", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });

  anims.create({
    key: "oskar-front-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "oskar-front-walk.", suffix: ".png", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });

  anims.create({
    key: "oskar-back-walk",
    frames: anims.generateFrameNames("atlas", { prefix: "oskar-back-walk.", suffix: ".png", start: 0, end: 3, zeroPad: 3 }),
    frameRate: 10,
    repeat: -1 });


  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  // Instruction box in fixed position on screen
  this.add.
  text(16, 16, 'Use arrow keys to move\nPress "D" to show hitboxes', {
    font: "18px monospace",
    fill: "#000000",
    padding: { x: 20, y: 10 },
    backgroundColor: "#ffffff" }).

  setScrollFactor(0).
  setDepth(30);

  // Debug graphics
  this.input.keyboard.once("keydown-D", event => {
    // Turn on physics debugging to show player's hitbox
    this.physics.world.createDebugGraphic();

    // Create worldLayer collision graphic above the player, but below the help text
    const graphics = this.add.
    graphics().
    setAlpha(0.75).
    setDepth(20);
    worldLayer.renderDebug(graphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });
  });
}

function update(time, delta) {
  const speed = 170;
  const prevVelocity = player.body.velocity.clone();

  // Stop any movement from prior frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalise and scale to ensure player doesnt move faster when travelling in a diagonal line
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("oskar-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("oskar-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("oskar-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("oskar-front-walk", true);
  } else {
    player.anims.stop();

    // Pick a standing frame which is appropriate given previous motion
    if (prevVelocity.x < 0) player.setTexture("atlas", "oskar-left.png");else
    if (prevVelocity.x > 0) player.setTexture("atlas", "oskar-right.png");else
    if (prevVelocity.y < 0) player.setTexture("atlas", "oskar-back.png");else
    if (prevVelocity.y > 0) player.setTexture("atlas", "oskar-front.png");
  }
}