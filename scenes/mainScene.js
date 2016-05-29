"use strict";

var mainScene = function () {
	var WORLD_WIDTH = renderer.domElement.width;
	var WORLD_HEIGHT = renderer.domElement.height;

	function Game() {
		this._initMainCamera();

		this.mainScene = new Physijs.Scene();
		this.mainScene.add(this.mainCamera);

		this.character = new Character(12, 24, 0, _bottom(24) + 20 + 12, "grey");

		this.blocks = [
			new Magnet(20, WORLD_WIDTH, _right(20), 0, "red"),
			new Magnet(20, WORLD_WIDTH, _left(20), 0, "blue"),
			new Magnet(WORLD_WIDTH, 20, 0, _top(20), "grey"),
			new Magnet(WORLD_WIDTH, 20, 0, _bottom(20), "grey"),
		];

		this.colors = ["grey", "red", "blue", "yellow"];

		this.mainScene.add(this.character.mesh);
		for (var i = 0, l = this.blocks.length; i < l; i++) {
			this.mainScene.add(this.blocks[i].mesh);
		}

		this.mainScene.setGravity(new THREE.Vector3());
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
		this.mainCamera.updateMatrixWorld();

		this.character.mesh.__dirtyPosition = true;
		this.character.mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0)); // prevent the rotation of the character

		if (keyboard.pressed("space")) {
			this.character.jump(time);
		}

		for (var i = 0, l = this.colors.length; i < l; i++) {
			if (keyboard.pressed((i + 1).toString())) {
				this.character.setColor(this.colors[i]);
				this.character.isJumping = true;
			}
		}

		this.character.magnet = this.findMagnet();

		if (this.character.magnet) {
			this.character.mesh.rotation.z = this.character.magnet.angle;
			this.mainScene.setGravity(this.character.magnet.gravity.multiplyScalar(90));
		}
	};

	Game.prototype.findMagnetDirections = [
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(1, 1, 0),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0, -1, 0),
		new THREE.Vector3(-1, -1, 0),
		new THREE.Vector3(-1, 0, 0),
		new THREE.Vector3(-1, 1, 0),
	];

	Game.prototype.findMagnet = function () {
		var block, found = [], direction, raycaster, intersect;

		for (block in this.blocks) {
			block = this.blocks[block];

			if (this.character.color.name !== block.color.name) {
				continue;
			}

			for (direction in this.findMagnetDirections) {
				direction = this.findMagnetDirections[direction];
				raycaster = new THREE.Raycaster(this.character.mesh.position, direction);
				intersect = raycaster.intersectObject(block.mesh);

				if (intersect.length > 0) {
					intersect = intersect.pop();
					intersect.block = block;
					intersect.angle = direction.angleTo(this.character.mesh.up);
					intersect.gravity = intersect.point.clone().sub(this.character.mesh.position).normalize();
					intersect.direction = direction;

					found.push(intersect);
				}
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

	function Character(width, height, x, y, color) {
		this.color = new Color(color);
		this.mesh = new Physijs.BoxMesh(new THREE.CubeGeometry(width, height, 12),
			Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: this.color.hex }), .4, .6)
		);

		this.mesh.position.setX(x);
		this.mesh.position.setY(y);

		this.mesh.receiveShadow = this.mesh.castShadow = true;
		this.mesh.addEventListener("collision", function () { this.isJumping = false; }.bind(this));
	}

	Character.prototype.isJumping = false;

	Character.prototype.jumpDuration = 120;

	Character.prototype.jump = function (time) {
		var velocity = this.mesh.getLinearVelocity();

		if (this.isJumping === false) {
			this.isJumping = true;
			this.jumpTime = time;
		}

		if (this.jumpTime + this.jumpDuration > time) {
			var effect = TWEEN.Easing.Back.Out((time - this.jumpTime) / this.jumpDuration);

			velocity.x += effect * this.magnet.direction.x * -10;
			velocity.y += effect * this.magnet.direction.y * -10;
		}

		this.mesh.setLinearVelocity(velocity);
	};

	Character.prototype.setColor = function (color) {
		this.color = new Color(color);
		this.mesh.material.color.setHex(this.color.hex);
	};

	function Magnet(width, height, x, y, color) {
		this.color = new Color(color);
		this.mesh = new Physijs.BoxMesh(new THREE.CubeGeometry(width, height, 210),
			Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: this.color.hex }), .8, .4),
			0 // mass, 0 is for zero gravity
		);

		this.mesh.position.setX(x);
		this.mesh.position.setY(y);

		this.mesh.receiveShadow = true;
		this.mesh.castShadow = false;
	}

	function Color(name) {
		this.name = name;
		for (var key in Color.COLORS[this.name]) {
			this[key] = Color.COLORS[this.name][key];
		}
	}

	Color.COLORS = {
		grey:   { hex: 0xcccccc },
		red:    { hex: 0xff0000 },
		blue:   { hex: 0x0000ff },
		yellow: { hex: 0xffff00 },
	}

	function _top(height) { return _bottom(height) * -1; }
	function _right(width) { return _left(width) * -1; }
	function _bottom(height) { return (height - WORLD_HEIGHT) / 2; }
	function _left(width) { return (width - WORLD_WIDTH) / 2; }

	return new Game();
};