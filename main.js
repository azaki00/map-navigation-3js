let infoLog = false;

let overlayRemoved = false;

setTimeout(function () {
    document.getElementById("blackOverlay").style.opacity = 0;
    document.getElementById("blackOverlay").style.pointerEvents = "none";
    overlayRemoved = true;
    initializeThreeJS();
}, 3000);

// const raycaster = new THREE.Raycaster(); // Define raycaster variable here

function initializeThreeJS() {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.2,
        1000
    );
    let mainPosition = {
        x: 1,
        y: 18,
        z: 22,
    };
    camera.position.set(mainPosition.x, mainPosition.y, mainPosition.z);
    camera.rotation.x = -0.7;

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //   renderer.setClearColor("#e5e5e5");

    const textureLoader = new THREE.CubeTextureLoader();
    const texture = textureLoader.load([
        "./media/sky.jpg",
        "./media/sky.jpg",
        "./media/sky.jpg",
        "./media/sky.jpg",
        "./media/sky.jpg",
        "./media/sky.jpg",
    ]);

    scene.background = texture;

    // const gridHelper = new THREE.GridHelper(20, 20);
    // scene.add(gridHelper);

    const gridSize = 20; // The size of the grid
    const sphereRadius = 0.5; // The radius of each sphere
    const clickablePoints = [];
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            // Exclude spheres that are not at the corners
            if (
                !(
                    (x === 0 || x === gridSize - 1) &&
                    (y === 0 || y === gridSize - 1)
                )
            ) {
                continue;
            }

            const sphereGeometry = new THREE.SphereGeometry(
                sphereRadius,
                32,
                32
            );
            const sphereMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
            });
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

            sphereMesh.position.x = x - gridSize / 2 + 0.5;
            sphereMesh.position.z = y - gridSize / 2 + 0.5;

            scene.add(sphereMesh);
            clickablePoints.push(sphereMesh);
        }
    }

    const lightA = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(lightA);

    var light = new THREE.PointLight(0xffffff, 4, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    //panToObject
    const panToObject = (cam, objPos) => { };
    //Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onKeyDown(event) {
        if (event.code === "Space") {
            // Reset camera position to default
            gsap.to(camera.position, {
                duration: 1,
                x: mainPosition.x,
                y: mainPosition.y,
                z: mainPosition.z,
                ease: "power2.inOut",
            });
        }
    }

    // Declare variables for the tooltip element and the currently hovered sphere
    const tooltipElement = document.querySelector(".tooltip");
    let hoveredSphere = null;

    // Declare variables to store the initial mouse position
    let initialMouseX = 0;
    let initialMouseY = 0;

    // Declare variables to control camera movement
    let cameraOffsetX = 0;
    let cameraOffsetY = 0;

    // Modify the onMouseMove function
    function onMouseMove(event) {
        // Calculate the mouse movement from the initial position
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const mouseMoveX = mouseX - initialMouseX;
        const mouseMoveY = mouseY - initialMouseY;

        // Update the initial mouse position
        initialMouseX = mouseX;
        initialMouseY = mouseY;
        if (infoLog) {
            console.log("mouseX:" + mouseMoveX + " | mouseY:" + mouseMoveY);
        }

        // Calculate the camera movement based on the mouse movement
        cameraOffsetX += mouseMoveX * 0.006;
        cameraOffsetY += mouseMoveY * 0.006;
        if (infoLog) {
            console.log("Camera-Offset-X: "+cameraOffsetX + " | Camera-Offset-Y: " + cameraOffsetY);
        }
        camera.position.set(camera.position.x + cameraOffsetX * 0.01, camera.position.y - cameraOffsetY * 0.01, camera.position.z);
        // camera.position.Y = cameraOffsetY;


        // Apply the camera movement to the camera's rotation
        // camera.rotation.x += cameraOffsetY*0.0005;
        // camera.rotation.y += cameraOffsetX*0.0005;

        // Dampen the camera movement gradually
        cameraOffsetX *= 0.9;
        cameraOffsetY *= 0.9;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickablePoints);

        if (intersects.length > 0) {
            const intersectedSphere = intersects[0].object;

            if (hoveredSphere !== intersectedSphere) {
                hoveredSphere = intersectedSphere;

                // Calculate the position of the tooltip in screen coordinates
                const screenPosition = new THREE.Vector3();
                screenPosition.copy(intersectedSphere.position);
                screenPosition.project(camera);

                // Convert the screen coordinates to CSS coordinates
                const x = ((screenPosition.x + 1) / 2) * window.innerWidth;
                const y = ((-screenPosition.y + 1) / 2) * window.innerHeight;

                // Position and show the tooltip
                tooltipElement.style.left = `${x}px`;
                tooltipElement.style.top = `${y}px`;
                tooltipElement.classList.add("show");
            }
        } else {
            // No sphere is hovered, hide the tooltip
            tooltipElement.classList.remove("show");
            hoveredSphere = null;
        }
    }

    function onClick() {
        if (intersects.length > 0) {
            const intersectedSphere = intersects[0].object;
            const spherePosition = intersectedSphere.position;
            if (infoLog) {
                console.log(
                    `Clicked sphere coordinates: (${spherePosition.x}, ${spherePosition.z * -1
                    })`
                );
            }
            gsap.to(camera.position, {
                duration: 1,
                x: spherePosition.x,
                y: spherePosition.y + 5,
                z: spherePosition.z + 5,
                ease: "power2.inOut",
            });
        } else {
            // Clicked on a non-intersecting object, return camera to default position
            gsap.to(camera.position, {
                duration: 1,
                x: mainPosition.x,
                y: mainPosition.y,
                z: mainPosition.z,
                ease: "power2.inOut",
            });
        }
    }

    window.addEventListener("mousemove", onMouseMove, false);
    window.addEventListener("click", onClick, false);
    window.addEventListener("keydown", onKeyDown, false);

    let loader = new THREE.GLTFLoader();
    let obj;
    const excludeObjects = []; // Array to hold objects to be excluded from raycasting

    loader.load(
        "media/old_map_3d_model/old_map_3d_model.glb",
        function (gltf) {
            obj = gltf.scene;

            // Set the desired scale factor
            let scaleFactor = 10;

            // Apply the scale to the object
            obj.scale.set(scaleFactor, scaleFactor, scaleFactor);

            scene.add(obj);
            excludeObjects.push(obj); // Add the object to the raycastObjects array

            initialAnimation(camera);
            console.log(`3D model loading info:\n`);
        },
        function (xhr) {
            if (infoLog) {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                console.log("Model loaded successfully!");
            }

        },
        function (error) {
            if (infoLog) {
                console.log("An error occurred:", error);
            }
            console.error();
        }
    );

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    function initialAnimation(camera) {
        const target = new THREE.Vector3(0, 0, 0); // Target position (center of the grid)
        const radius = 30; // Radius of the circular path
        const duration = 3; // Animation duration in seconds
        const angleIncrement = Math.PI / 2 / (60 * duration); // Angle increment for each frame

        let angle = Math.PI / 2; // Start at the final quarter of the circular motion

        function animateCamera() {
            const x = target.x + radius * Math.sin(angle);
            const z = target.z + radius * Math.cos(angle);

            camera.position.set(x, camera.position.y, z);
            camera.lookAt(target);

            angle -= angleIncrement; // Decrease the angle

            if (angle >= 0) {
                requestAnimationFrame(animateCamera);
            } else {
                // Lock camera position to the default position
                // camera.position.set(target.x, camera.position.y, target.z + 20);
                // camera.lookAt(target);

                // Smooth transition to the default position and rotation
                gsap.to(camera.position, {
                    duration: 1,
                    x: mainPosition.x,
                    y: mainPosition.y,
                    z: mainPosition.z,
                    ease: "power2.inOut",
                });
                gsap.to(camera.rotation, {
                    duration: 1,
                    x: -0.7,
                    y: 0,
                    z: 0,
                    ease: "power2.inOut",
                });
            }
        }
        animateCamera();
    }

    const animate = () => {
        requestAnimationFrame(animate);

        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // Calculate intersections
        intersects = raycaster.intersectObjects(
            scene.children.filter((obj) => !excludeObjects.includes(obj))
        );
        if(infoLog){
            console.log("Excluded Objects: "+excludeObjects);
        }
        // Reset colors of all spheres
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                // console.log(object.parent);
                if (clickablePoints.includes(object)) {
                    object.material.color.set(0xff0000); // Reset to initial color
                }
            }
        });

        // Change color of the sphere being hovered over
        if (intersects.length > 0) {
            const intersectedSphere = intersects[0].object;
            intersectedSphere.material.color.set(0x00ff00); // Set to a different color
        }

        renderer.render(scene, camera);
    };

    animate();
}

