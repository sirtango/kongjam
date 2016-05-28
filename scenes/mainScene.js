"use strict";

// Scene

var mainScene = function () {

	var self = this;

	var mainScene = {};
	var mainCamera = {};
	var HUDCamera = {};
	var HUDScene = {};
	var time = 0;

	init();

	function init () {
		self.mainScene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });

		self.mainCamera = new THREE.PerspectiveCamera(50, renderer.domElement.width / renderer.domElement.height, 0.1, 1000);

		// FPS View
		self.mainCamera.position.x = 0;
		self.mainCamera.position.y =-15;	// Depth
		self.mainCamera.position.z = 0;
		self.mainCamera.lookAt(new THREE.Vector3(1, 20, 0));

		// Aerial View
		//self.mainCamera.position.x =-80;
		//self.mainCamera.position.y = -100;	// Depth
		//self.mainCamera.position.z = 0;
		//self.mainCamera.lookAt(new THREE.Vector3(0, 10, 0));

		// Physics
		self.mainScene.setGravity(new THREE.Vector3(100, 0, 0));

		// 3D Objects

		// Lights
		var primaryLight = new THREE.DirectionalLight(0xffffff, 1);
		primaryLight.position.set(-1,-1,-1).normalize();
		self.mainScene.add(primaryLight);

		var secondaryLight = new THREE.DirectionalLight(0xffffff, .2);
		secondaryLight.position.set(1, 1, 1).normalize();
		self.mainScene.add(secondaryLight);
		self.mainScene.add(new THREE.AmbientLight(0x555555));

		// Environment
		var floorMesh = new Physijs.BoxMesh(
			new THREE.CubeGeometry(.1, 100, 200),
			Physijs.createMaterial(
				new THREE.MeshBasicMaterial({ color: 0xcccccc }),
				.8,
				1),
			0);
		floorMesh.position.x = 5;
		floorMesh.position.y = 26;
		floorMesh.position.z = 0;
		floorMesh.receiveShadow = true;
		floorMesh.castShadow = false;
		self.mainScene.add(floorMesh);

		// GUI
		self.HUDScene = new THREE.Scene();

		self.HUDCamera = new THREE.OrthographicCamera(0, 800, 0, -600, 0, 1);
		self.HUDCamera.position.x = self.HUDCamera.position.y = 0;
		self.HUDCamera.position.z = 1;
	}
};