"use strict";

var mainScene = function () {
	var WORLD_WIDTH = renderer.domElement.width;
	var WORLD_HEIGHT = renderer.domElement.height;

	function Game() {
		this._initMainCamera();

		this.mainScene = new Physijs.Scene();
		this.mainScene.add(this.mainCamera);

		this.character = new Character([12, 24], [0, _bottom(24) + 20 + 12], new Color("grey"));

		this.blocks = [
			new Magnet([-1, 0], [20, WORLD_HEIGHT], [_right(20), 0], new Color("red")), // right
			new Magnet([1, 0], [20, WORLD_HEIGHT], [_left(20), 0], new Color("blue")), // left
			new Magnet([0, -1], [WORLD_WIDTH, 20], [0, _top(20)], new Color("grey")), // top
			new Magnet([0, 1], [WORLD_WIDTH, 20], [0, _bottom(20)], new Color("grey")), // bottom
		];

		this.colors = ["grey", "red", "blue"];

		this.mainScene.add(this.character.mesh);
		for (var i = 0, l = this.blocks.length; i < l; i++) {
			this.mainScene.add(this.blocks[i].mesh);
		}

		this.setCharacterColor("grey");
	}

	Game.prototype.simulatePhysics = true;

	Game.prototype._initMainCamera = function () {
		this.mainCamera = new THREE.OrthographicCamera(
			WORLD_WIDTH / - 2,
			WORLD_WIDTH / 2,
			WORLD_HEIGHT / 2,
			WORLD_HEIGHT / - 2,
			1,
			1000
		);

		this.mainCamera.add(new THREE.PointLight(0xffffff, 1));
		this.mainCamera.position.z = 300;
	};

	Game.prototype.update = function (time) {
		var velocity = this.character.mesh.getLinearVelocity();
		var walkingDirection = 0;

		if (keyboard.pressed("left")) {
			walkingDirection = 1;
		} else if (keyboard.pressed("right")) {
			walkingDirection = -1;
		}
		if (walkingDirection !== 0) {
			//velocity.x = Math.min(Math.max(velocity.x + 30 * walkingDirection * this.character.magnet.mesh.up.y, -30), 30);
			//velocity.y = Math.min(Math.max(velocity.x + 30 * walkingDirection * this.character.magnet.mesh.up.x, -30), 30);
		}

		if (keyboard.pressed("space")) {
			if (!this.character.isJumping) {
				this.character.jumpTime = time;
				this.character.isJumping = true;
			}
			if (this.character.jumpTime + this.character.jumpDuration > time) {
				var effect = TWEEN.Easing.Back.Out((time - this.character.jumpTime) / this.character.jumpDuration);

				velocity.x += effect * this.character.magnet.mesh.up.x * 15;
				velocity.y += effect * this.character.magnet.mesh.up.y * 15;
			}
		}

		this.character.mesh.__dirtyPosition = true;
		this.character.mesh.setLinearVelocity(velocity);
		this.character.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0)); // prevent the rotation of the character

		for (var i = 0, l = this.colors.length; i < l; i++) {
			if (keyboard.pressed((i + 1).toString())) {
				this.setCharacterColor(this.colors[i]);
			}
		}

		this.character.mesh.rotation.z = this.character.magnetAngle;
	};

	Game.prototype.setCharacterColor = function (name) {
		this.character.color = new Color(name);
		this.character.mesh.material.color.setHex(this.character.color.color);

		var magnet = this.findMagnet();
		var gravity = new THREE.Vector3(0, 0, 0);

		if (magnet) {
			this.character.isJumping = true;
			this.character.magnet = magnet.block;
			this.character.magnetAngle = magnet.angle;

			gravity = magnet.block.mesh.up.clone().negate().multiplyScalar(90);
		}

		this.mainScene.setGravity(gravity);
	};

	Game.prototype.findMagnet = function () {
		var characterColor = this.character.color.name;
		var block, blockColor, found = [];

		for (block in this.blocks) {
			block = this.blocks[block];
			blockColor = block.color.name;

			if (characterColor === blockColor) {
				found.push({
					distance: this.character.mesh.position.distanceTo(block.mesh.position),
					angle: this.character.mesh.up.angleTo(block.mesh.up),
					block: block
				});
			}
		}

		if (found.length === 1) {
			return found.pop();
		} else {
			var closest = false;

			for (var i = 0, l = found.length; i < l; i++) {
				if (closest === false || found[i].distance < closest.distance) {
					closest = found[i];
				}
			}

			if (closest !== false) {
				return closest;
			}
		}

		return false;
	};

	function Character(size, position, color) {
		this.color = color;
		this.mesh = new Physijs.BoxMesh(
			new THREE.BoxBufferGeometry(size[0], size[1], 12),
			Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: color.color }), .4, .6)
		);

		this.mesh.receiveShadow = this.mesh.castShadow = true;
		this.mesh.position.set(position[0], position[1], 0);

		this.time = performance.now();
		this.velocity = new THREE.Vector3();

		this.mesh.addEventListener("collision", function () { this.isJumping = false; }.bind(this));
	}

	Character.prototype.isJumping = false;

	Character.prototype.jumpDuration = 120;

	function Magnet(normal, size, position, color) {
		this.color = color;
		this.mesh = new Physijs.BoxMesh(
			new THREE.CubeGeometry(size[0], size[1], 210),
			Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: color.color }), .8, .4),
			0 // mass, 0 is for zero gravity
		);

		this.mesh.receiveShadow = true;
		this.mesh.castShadow = false;
		this.mesh.up.set(normal[0], normal[1], 0);
		this.mesh.position.set(position[0], position[1], 0);
	}

	function Color(name) {
		this.name = name;
		for (var key in Color.COLORS[this.name]) {
			this[key] = Color.COLORS[this.name][key];
		}
	}

	Color.COLORS = {
		grey: { color: 0xcccccc },
		red:  { color: 0xff0000 },
		blue: { color: 0x0000ff },
	}

	function _top(height) { return _bottom(height) * -1; }
	function _right(width) { return _left(width) * -1; }
	function _bottom(height) { return (height - WORLD_HEIGHT) / 2; }
	function _left(width) { return (width - WORLD_WIDTH) / 2; }

	return new Game();
};