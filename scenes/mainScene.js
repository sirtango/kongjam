"use strict";

var FixedCameraPosition = function (position, influenceRadius) {
	var self = this;

	init();

	function init () {
		//
	}

	return {
		getPosition: function () {
			return position;
		},
		update: function (playerPosition) {
			return (playerPosition.distanceTo(position) <= influenceRadius);
		}
	};
}

// Scene
var mainScene = function () {

	var self = this;

	var mainScene = {};
	var mainCamera = {};
	var HUDCamera = {};
	var HUDScene = {};
	var time = 0;
	var fixedCameraPosition = new FixedCameraPosition(new THREE.Vector3(10,-10,-50), 25);

	init();

	function init () {
		self.mainScene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
		self.mainScene.setGravity(new THREE.Vector3(100, 0, 0));

		self.mainCamera = new THREE.PerspectiveCamera(50, renderer.domElement.width / renderer.domElement.height, 0.1, 1000);

		// FPS View
		self.mainCamera.position.x = 2;
		self.mainCamera.position.y =-15;	// Depth
		self.mainCamera.position.z = 0;
		self.mainCamera.lookAt(new THREE.Vector3(0, 1, 0));

		// Aerial View
		//self.mainCamera.position.x = 60;
		//self.mainCamera.position.y =-130;	// Depth
		//self.mainCamera.position.z =-50;
		//self.mainCamera.lookAt(new THREE.Vector3(0, 1,-50));

		// Physics
		self.mainScene.setGravity(new THREE.Vector3(-100, 0, 0));

		// 3D Objects

		// Lights
		var primaryLight = new THREE.DirectionalLight(0xffffff, 1);
		primaryLight.position.set(-1,-1,-1).normalize();
		self.mainScene.add(primaryLight);

		var secondaryLight = new THREE.DirectionalLight(0xffffff, .2);
		secondaryLight.position.set(1, 1, 1).normalize();
		self.mainScene.add(secondaryLight);
		self.mainScene.add(new THREE.AmbientLight(0x555555));

		// Skybox
		var skyboxShader = THREE.ShaderLib["cube"];
		skyboxShader.uniforms["tCube"].value = renderer._textureCache.get("starSkybox");

		var skyboxMesh = new THREE.Mesh(
			new THREE.BoxGeometry( 200, 200, 200 ),
			new THREE.ShaderMaterial({
				fragmentShader : skyboxShader.fragmentShader, vertexShader : skyboxShader.vertexShader,
				uniforms : skyboxShader.uniforms, depthWrite : false, side : THREE.BackSide
			})
		);
		self.mainScene.add(skyboxMesh);

		// Environment
		var floorMesh = new Physijs.BoxMesh(
			new THREE.CubeGeometry(.1, 100, 200),
			Physijs.createMaterial(
				new THREE.MeshBasicMaterial({ color: 0x999999 }),
				.8,	// Friction
				0	// Bounciness
			),
			0);
		floorMesh.position.x = -1;
		floorMesh.position.z = -50;
		floorMesh.name = "FLOOR";
		self.mainScene.add(floorMesh);

		var anotherFloorMesh0 = new Physijs.BoxMesh(
			new THREE.CubeGeometry(.1, 20, 10),
			Physijs.createMaterial(
				new THREE.MeshBasicMaterial({ color: 0x444444 }),
				.8,	// Friction
				0	// Bounciness
			),
			0);
		anotherFloorMesh0.position.x = 0;
		anotherFloorMesh0.position.z = -15;
		anotherFloorMesh0.name = "FLOOR";
		self.mainScene.add(anotherFloorMesh0);

		var anotherFloorMesh1 = new Physijs.BoxMesh(
			new THREE.CubeGeometry(.1, 20, 10),
			Physijs.createMaterial(
				new THREE.MeshBasicMaterial({ color: 0x333333 }),
				.8,	// Friction
				0	// Bounciness
			),
			0);
		anotherFloorMesh1.position.x = 1;
		anotherFloorMesh1.position.z = -20;
		anotherFloorMesh1.name = "FLOOR";
		self.mainScene.add(anotherFloorMesh1);

		var anotherFloorMesh2 = new Physijs.BoxMesh(
			new THREE.CubeGeometry(.1, 20, 18),
			Physijs.createMaterial(
				new THREE.MeshBasicMaterial({ color: 0x222222 }),
				.8,	// Friction
				0	// Bounciness
			),
			0);
		anotherFloorMesh2.position.x = 3;
		anotherFloorMesh2.position.z = -30;
		anotherFloorMesh2.name = "FLOOR";
		self.mainScene.add(anotherFloorMesh2);

		var playerMesh = new Physijs.BoxMesh(
			new THREE.BoxGeometry(2, 1, 1),
			Physijs.createMaterial(
				new THREE.MeshBasicMaterial({ color: 0x00dd00 }),
				.5,	// Friction
				.5	// Bounciness
			),
			100);
		playerMesh.name = "PLAYER";
		playerMesh.userData.isJumping = false;
		playerMesh.addEventListener("collision", function (obj) {
			if (obj.name == "FLOOR") {
				renderer._modelCache.get("player").userData.isJumping = false;
			}
		});
		renderer._modelCache.set("player", playerMesh);
		self.mainScene.add(playerMesh);

		// GUI
		//self.HUDScene = new THREE.Scene();

		//self.HUDCamera = new THREE.OrthographicCamera(0, 800, 0, -600, 0, 1);
		//self.HUDCamera.position.x = self.HUDCamera.position.y = 0;
		//self.HUDCamera.position.z = 1;

		self.mainCamera.userData.cameraRig = new THREE.Vector3();
		self.mainCamera.userData.cameraRig.subVectors(playerMesh.position, self.mainCamera.position);
	}

	function followTarget (obj, target)
	{
		var targetPosition = new THREE.Vector3();
		targetPosition.subVectors(target, self.mainCamera.userData.cameraRig);
		var normalizedDistance = obj.position.distanceTo(targetPosition) / 15; // <- max distance
		obj.position.lerp(targetPosition, TWEEN.Easing.Cubic.In(Math.max(0, Math.min(normalizedDistance, 1))));
	}

	function followFixedTarget (obj, target)
	{
		var targetPosition = new THREE.Vector3();
		targetPosition.subVectors(target, self.mainCamera.userData.cameraRig);
		var normalizedDistance = obj.position.distanceTo(targetPosition) / 60; // <- max distance
		obj.position.lerp(targetPosition, TWEEN.Easing.Linear.None(Math.max(0, Math.min(normalizedDistance, 1))));
	}

	return {
		mainScene: self.mainScene,
		mainCamera: self.mainCamera,
//		HUDCamera: self.HUDCamera,
//		HUDScene: self.HUDScene,
		simulatePhysics: true,

		update: function (time) {
			self.time = time;
			var walkingDirection = 0;
			var player = renderer._modelCache.get("player");
			var velocity = player.getLinearVelocity();

			if (keyboard.pressed("left") || keyboard.pressed("a")) {
				walkingDirection = 1;
			}
			else if (keyboard.pressed("right") || keyboard.pressed("d")) {
				walkingDirection = -1;
			}
			if (walkingDirection != 0) {//			   acceleration				   max speed
				var accelerationForce = (player.userData.isJumping) ? 1 : 1; 
				velocity.z = Math.min(Math.max(velocity.z + accelerationForce * walkingDirection, -10), 10);
			}

			if (keyboard.pressed("up") || keyboard.pressed("w")) {
				if (!player.userData.isJumping) {
					player.userData.jumpTime = time;
					player.userData.isJumping = true;
				}

				var jumpDuration = 120;
				if (player.userData.jumpTime + jumpDuration > time) {
					velocity.x += TWEEN.Easing.Back.Out((time - player.userData.jumpTime)/jumpDuration) * 4;
				}
			}

			player.setLinearVelocity(velocity);
			// prevent the rotation of the character
			player.setAngularVelocity(new THREE.Vector3(0, 0, 0));

			if (fixedCameraPosition.update(player.position)) {
				followFixedTarget(self.mainCamera, fixedCameraPosition.getPosition());
			}
			else {
				followTarget(self.mainCamera, player.position);
			}
		}
	}
};