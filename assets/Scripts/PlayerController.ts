// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {
  _decorator,
  Component,
  Vec3,
  systemEvent,
  EventMouse,
  Animation,
  SystemEvent,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
  @property({ type: Animation })
  public BodyAnim: Animation = null;
  /* class member could be defined like this */
  // dummy = '';

  /* use `property` decorator if your want the member to be serializable */
  // @property
  // serializableDummy = 0;

  private _startJump: boolean = false;
  private _jumpStep: number = 0;
  private _curJumpTime: number = 0;
  private _jumpTime: number = 0.1;
  private _curJumpSpeed: number = 0;
  private _curPos: Vec3 = new Vec3();
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  private _targetPos: Vec3 = new Vec3();
  private _isMoving = false;
  private _curMoveIndex = 0;

  start() {
    // Your initialization goes here.
    console.log('_targetPos', this._targetPos);
    // systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  setInputActive(active: boolean) {
    if (active) {
      systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  onMouseUp(event: EventMouse) {
    console.log('curButton', event.getButton());
    if (event.getButton() === 0) {
      this.jumpByStep(1);
    } else if (event.getButton() === 2) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._isMoving) {
      return;
    }

    if (step === 1) {
      this.BodyAnim.play('oneStep');
    } else if (step === 2) {
      this.BodyAnim.play('twoStep');
    }

    this._startJump = true;
    this._jumpStep = step;
    this._curJumpTime = this._jumpStep / this._jumpTime;
    this.node.getPosition(this._curPos);
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));

    this._isMoving = true;
    this._curMoveIndex += step;
  }

  onOnceJumpEnd() {
    this._isMoving = false;
    this.node.emit('JumpEnd', this._curMoveIndex);
  }

  update(deltaTime: number) {
    // Your update function goes here.
    if (this._startJump) {
      this._curJumpTime += deltaTime;
      if (this._curJumpTime > this._jumpTime) {
        this.node.setPosition(this._targetPos);
        this._startJump = false;
        this.onOnceJumpEnd();
      } else {
        this.node.getPosition(this._curPos);
        this._deltaPos.x = this._curJumpSpeed * deltaTime;
        Vec3.add(this._curPos, this._curPos, this._deltaPos);
        this.node.setPosition(this._curPos);
      }
    }
  }

  reset() {
    this._curMoveIndex = 0;
  }
}
