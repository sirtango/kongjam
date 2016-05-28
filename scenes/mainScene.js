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
			//new Block([WORLD_WIDTH, 20], [0, _top(20)], new Color("grey")), // top
			//new Block([20, WORLD_HEIGHT], [_right(20), 0], new Color("grey")), // right
			new Block([WORLD_WIDTH, 20], [0, _bottom(20)], new Color("grey")), // bottom
			//new Block([20, WORLD_HEIGHT], [_left(20), 0], new Color("grey")), // left

		];

		this.mainScene.add(this.character.mesh);
		for (var i = 0, l = this.blocks.length; i < l; i++) {
			this.mainScene.add(this.blocks[i].mesh);
		}

		this.simulatePhysics = true;
		this.mainScene.setGravity(calculateGravity(this.character, this.blocks));
	}

	Game.prototype._initMainCamera = function() {
		this.mainCamera = new THREE.OrthographicCamera(
			WORLD_WIDTH / - 2,
			WORLD_WIDTH / 2,
			WORLD_HEIGHT / 2,
			WORLD_HEIGHT / - 2,
			1,
			1000
		);

		this.mainCamera.add(new THREE.PointLight(0xffffff, 1));
		this.mainCamera.position.z = 400;
	};

	function Character(size, position, color) {
		this.mesh = new Physijs.BoxMesh(
			new THREE.BoxBufferGeometry(size[0], size[1], 12),
			Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: color.color }), .4, .6)
		);

		this.mesh.receiveShadow = this.mesh.castShadow = true;
		this.mesh.position.set(position[0], position[1], 0);
	}

	function Block(size, position, color) {
		this.mesh = new Physijs.BoxMesh(
			new THREE.CubeGeometry(size[0], size[1], 48),
			Physijs.createMaterial(new THREE.MeshLambertMaterial({ color: color.color }), .8, .4),
			0 // mass, 0 is for zero gravity
		);

		this.mesh.receiveShadow = true;
		this.mesh.castShadow = false;
		this.mesh.position.set(position[0], position[1], 0);
	}

	function Color(name) {
		this.name = name;
		for (var key in Color.COLORS[this.name]) {
			this[key] = Color.COLORS[this.name][key];
		}
	}

	Color.COLORS = {
		grey: { color: 0xcccccc }
	}

	function _top(height) { return _bottom(height) * -1; }
	function _right(width) { return _left(width) * -1; }
	function _bottom(height) { return (height - WORLD_HEIGHT) / 2; }
	function _left(width) { return (width - WORLD_WIDTH) / 2; }

	function calculateGravity(character, blocks) {
		return new THREE.Vector3(0, -30, 0);
	}

	return new Game();
};