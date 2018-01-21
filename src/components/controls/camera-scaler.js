var UP = new THREE.Vector3(0, 1, 0);

AFRAME.registerComponent('camera-scaler', {
  schema: {
    enabled: {default: false},
    cameraRigId: {default: 'cameraRig'}
  },

  init: function () {
    this.cameraEl = document.getElementById(this.data.cameraId);
    this.cameraRigEl = document.getElementById(this.data.cameraRigId);

    this.currentDragCenter = new THREE.Vector3();
    this.panningController = null;

    this.controllers = {
      left: {
        entity: null,
        dragging: false,
        dragStartPoint: new THREE.Vector3()
      },
      right: {
        entity: null,
        dragging: false,
        dragStartPoint: new THREE.Vector3()
      }
    };

    this.originalPosition = new THREE.Vector3();
    this.originalScale = new THREE.Vector3();
    this.originalRotation = new THREE.Vector3();

    this.leftGripDown = false;
    this.rightGripDown = false;

    this.cameraScaleEventDetail = {cameraScaleFactor: 1};
  },

  /**
   * Reset original camera rig transforms if disabling camera scaler.
   */
  update: function (oldData) {
    var cameraRigEl = this.cameraRigEl;

    // Enabling. Store original transformations.
    if (!oldData.enabled && this.data.enabled) {
      this.originalPosition.copy(cameraRigEl.object3D.position);
      this.originalScale.copy(cameraRigEl.object3D.scale);
      this.originalRotation.copy(cameraRigEl.getAttribute('rotation'));
    }

    // Disabling, reset to original transformations.
    if (oldData.enabled && !this.data.enabled) {
      cameraRigEl.setAttribute('position', this.originalPosition);
      cameraRigEl.setAttribute('scale', this.originalScale);
      cameraRigEl.setAttribute('rotation', this.originalRotation.clone());
    }
  },

  tick: function () {
    if (!this.data.enabled) { return; }

    if (!this.isLeftGripDown && !this.isRightGripDown) { return; }

    if (this.isLeftGripDown && this.isRightGripDown) {
      this.twoHandInteraction();
    } else {
      this.processPanning();
    }
  },

  onGripDown: function (evt) {
    var left;
    var target;

    if (!this.cameraRigEl.object3D) { return; }

    target = evt.target;
    left = target === this.leftHandEl;

    if (left) {
      this.isLeftGripDown = true;
      this.panningController = this.controllers.left;
    } else {
      this.isRightGripDown = true;
      this.panningController = this.controllers.right;
    }

    this.panningController.entity.object3D.getWorldPosition(
      this.panningController.dragStartPoint);

    this.released = this.isLeftGripDown && this.isRightGripDown;
  },

  onGripUp: function (evt) {
    var left;
    var target;

    target = evt.target;
    left = evt.target === this.leftHandEl;

    if (left) {
      this.panningController = this.controllers.right;
      this.isLeftGripDown = false;
    } else {
      this.panningController = this.controllers.left;
      this.isRightGripDown = false;
    }

    this.panningController.entity.object3D.getWorldPosition(
      this.panningController.dragStartPoint);

    if (!this.isLeftGripDown && !this.isRightGripDown) {
      this.cameraScaleEventDetail.cameraScaleFactor = this.cameraRigEl.object3D.scale.x;
      this.el.emit('camerascale', this.cameraScaleEventDetail);
    }

    this.released = true;
  },

  /**
   * With two hands, translate/rotate/zoom.
   */
  twoHandInteraction: (function () {
    var centerVec3 = new THREE.Vector3();
    var currentControllersSegment = new THREE.Line3();
    var currentDistanceVec3 = new THREE.Vector3();
    var currentPositionLeft = new THREE.Vector3();
    var currentPositionRight = new THREE.Vector3();
    var deltaCurrentSegment = new THREE.Vector3();
    var deltaPreviousSegment = new THREE.Vector3();
    var midPoint = new THREE.Vector3();
    var prevDistanceVec3 = new THREE.Vector3();
    var previousControllersSegment = new THREE.Line3();

    return function () {
      var currentAngle;
      var currentDistance;
      var deltaAngle;
      var deltaDistance;
      var translation;

      this.leftHandEl.object3D.getWorldPosition(currentPositionLeft);
      this.rightHandEl.object3D.getWorldPosition(currentPositionRight);

      if (this.released) {
        this.prevAngle = signedAngleTo(currentPositionLeft, currentPositionRight);
        this.initAngle = this.prevAngle = Math.atan2(
          currentPositionLeft.x - currentPositionRight.x,
          currentPositionLeft.z - currentPositionRight.z);
        midPoint.copy(currentPositionLeft)
          .add(currentPositionRight)
          .multiplyScalar(0.5);
        this.prevDistance = prevDistanceVec3.copy(currentPositionLeft)
          .sub(currentPositionRight)
          .length();
        this.released = false;
      }

      currentDistance = currentDistanceVec3.copy(currentPositionLeft)
        .sub(currentPositionRight)
        .length();
      deltaDistance = this.prevDistance - currentDistance;

      //Get center point using local positions.
      centerVec3.copy(this.leftHandEl.object3D.position)
        .add(this.rightHandEl.object3D.position)
        .multiplyScalar(0.5);

      // Set camera rig scale.
      this.cameraRigEl.object3D.scale.addScalar(deltaDistance);
      this.cameraRigEl.setAttribute('scale', this.cameraRigEl.object3D.scale);

      // Set camera rig position.
      translation = centerVec3
        .applyQuaternion(this.cameraRigEl.object3D.quaternion)
        .multiplyScalar(deltaDistance);
      this.cameraRigEl.object3D.position.sub(translation);
      this.cameraRigEl.setAttribute('position', this.cameraRigEl.object3D.position);

      // Set camera rig rotation.
      currentAngle = Math.atan2(currentPositionLeft.x - currentPositionRight.x,
                                currentPositionLeft.z - currentPositionRight.z);
      deltaAngle = currentAngle - this.prevAngle;
      this.rotateScene(midPoint, deltaAngle);

      this.prevAngle = currentAngle - deltaAngle;
    }
  })(),

  rotateScene: (function () {
    var dirVec3 = new THREE.Vector3();

    return function (midPoint, deltaAngle) {
      var cameraRigEl = this.cameraRigEl;
      var rotation;

      // Rotate the direction.
      dirVec3.copy(cameraRigEl.object3D.position)
        .sub(midPoint)
        .applyAxisAngle(UP, -deltaAngle);

      cameraRigEl.object3D.position.copy(midPoint).add(dirVec3);
      cameraRigEl.setAttribute('position', cameraRigEl.object3D.position);

      rotation = cameraRigEl.getAttribute('rotation');
      rotation.y -= deltaAngle * THREE.Math.RAD2DEG;
      cameraRigEl.setAttribute('rotation', rotation);
    };
  })(),

  /**
   * One hand panning.
   */
  processPanning: (function () {
    var currentPosition = new THREE.Vector3();
    var deltaPosition = new THREE.Vector3();

    return function () {
      var dragStartPoint = this.panningController.dragStartPoint;
      this.panningController.entity.object3D.getWorldPosition(currentPosition);
      deltaPosition.copy(dragStartPoint).sub(currentPosition);

      // Apply panning.
      this.cameraRigEl.object3D.position.add(deltaPosition);
      this.cameraRigEl.setAttribute('position', this.cameraRigEl.object3D.position);
    };
  })(),

  registerHand: function (entity, hand) {
    this.controllers[hand].entity = entity;
    entity.addEventListener('gripdown', this.onGripDown.bind(this));
    entity.addEventListener('gripup', this.onGripUp.bind(this));

    if (hand === 'left') {
      this.leftHandEl = entity;
    } else {
      this.rightHandEl = entity;
    }
  }
});

AFRAME.registerComponent('camera-scaler-hand', {
  schema: {
    hand: {default: 'right'}
  },

  play: function () {
    this.el.sceneEl.components['camera-scaler'].registerHand(this.el, this.data.hand);
  }
});

function signedAngleTo (fromVec3, toVec3) {
  var angle;
  var cross;
  angle = fromVec3.angleTo(toVec3);
  cross = fromVec3.clone().cross(toVec3);
  if (UP.dot(cross) < 0) {  // Or > 0.
    angle = -angle;
  }
  return angle;
}
