/**
 * Created by s16007 on 17/02/20.
 */
"use strict";
/**
 * インベーダーみたいなやつ作ります
 */

class Player {
    /**
     * @return {number}
     */
    static get HALF_WIDTH() {
        return 20;
    }

    constructor(input, x, y, speed, canvas_width) {
        this.input = input;
        this.pos = {'x': x, 'y': y};
        this.bullet = null;
        this.speed = speed * 2;
        this.canvas_width = canvas_width;
    }

    getBullet() {
        return this.bullet;
    }

    move() {
        if (this.input.isLeft && this.input.isRight) {
            // なにもしない
        } else if (this.input.isLeft) {
            this.pos.x -= this.speed;
        } else if (this.input.isRight) {
            this.pos.x += this.speed;
        }
        // 左側へ行き過ぎたら戻す
        if (this.pos.x < Player.HALF_WIDTH) {
            this.pos.x = Player.HALF_WIDTH;
        }
        // 右側へ行きすぎたら戻す
        if (this.pos.x > this.canvas_width - Player.HALF_WIDTH) {
            this.pos.x = this.canvas_width - Player.HALF_WIDTH;
        }

    }

    draw(ctx) {
        this.move();

        if (this.input.isSpace && this.bullet == null) {
            this.bullet = new Bullet(this.pos.x, this.pos.y);
        }
        if (this.bullet != null) {
            this.bullet.draw(ctx);
            if (!this.bullet.isValid()) {
                this.bullet = null;
            }
        }

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#00A";

        ctx.beginPath();
        ctx.moveTo(0, 10);
        /*
        ctx.lineTo(-20, 10);
        ctx.lineTo(-20, -7);
        ctx.lineTo(-3, -7);
        ctx.lineTo(0, -10);
        ctx.lineTo(3, -7);
        ctx.lineTo(20, -7);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.stroke();
        */
        ctx.lineTo(-5, 5);
        ctx.lineTo(-27, 25);
        ctx.lineTo(-30, 15);
        ctx.lineTo(-17, -10);
        ctx.lineTo(-13, -5);
        ctx.lineTo(0, -35);
        ctx.lineTo(13, -5);
        ctx.lineTo(17, -10);
        ctx.lineTo(30, 15);
        ctx.lineTo(27, 25);
        ctx.lineTo(5, 5);
        ctx.closePath();
        ctx.stroke();

        ctx.fill();

        ctx.restore();
    }
}

class Input {
    constructor() {
        this.isLeft = false;
        this.isRight = false;
        this.isSpace = false;
    }

    onKeyDown(event) {
        switch (event.code) {
            case "ArrowLeft":
                this.isLeft = true;
                break;
            case "ArrowRight":
                this.isRight = true;
                break;
            case "Space":
                this.isSpace = true;
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    onKeyUp(event) {
        switch (event.code) {
            case "ArrowLeft":
                this.isLeft = false;
                break;
            case "ArrowRight":
                this.isRight = false;
                break;
            case "Space":
                this.isSpace = false;
                break;
            default:
                return;
        }
        event.preventDefault();
    }
}

class Bullet {
    /**
     * @return {number}
     */
    static get SPEED() {
        return 20;
    }

    /**
     * @return {number}
     */
    static get HALF_HEIGHT() {
        return 5;
    }

    /**
     * @return {number}
     */
    static get HALF_WIDTH() {
        return 1.5;
    }

    constructor(x, y) {
        this.pos = {'x': x, 'y': y};
        this.isCollied = false;
    }

    move() {
        this.pos.y -= Bullet.SPEED;
    }

    isValid() {
        if (this.isCollied){
            return false;
        }
        return this.pos.y >= -Bullet.HALF_HEIGHT;
    }

    setInvalidate() {
        this.isCollied = true;
    }

    draw(ctx) {
        this.move();

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();

        ctx.restore();
    }
}

class Enemy {
    /**
     * @return {number}
     */
    static get HALF_SIZE() {
        return Enemy.SIZE / 2;
    }

    /**
     * @return {number}
     */
    static get SIZE() {
        return 64;
    }

    constructor(image, x, y) {
        this.image = image;
        this.pos = {'x': x, 'y': y};
    }

    move(dx, dy) {
        this.pos.x += dx;
        this.pos.y += dy;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        // 画像サイズの半分を左と上にずらして基準点の真ん中に来るように調整して描画
        ctx.drawImage(this.image, -Enemy.HALF_SIZE, -Enemy.HALF_SIZE,
            Enemy.SIZE, Enemy.SIZE);

        ctx.restore();
    }

    isCollision(bullet) {
        // まず横の判定の準備?
        let dx = Math.abs(this.pos.x - bullet.pos.x);
        let dw = Enemy.HALF_SIZE + Bullet.HALF_WIDTH;
        // 縦の判定準備
        let dy = Math.abs(this.pos.y - bullet.pos.y);
        let dh = Enemy.HALF_SIZE + Bullet.HALF_HEIGHT;

        // 判定
        return (dx < dw && dy < dh);
    }
}

class EnemyManager {
    constructor(dx, dy, width) {
        this.dx = dx;
        this.dy = dy;
        this.canvas_width = width;
        this.enemyList = [];
    }

    generateEnemies() {
        let image = new Image();
        image.src = "type_a.png";
        for (let h = 0; h < 5; h++) {
            for (let w = 0; w < 10; w++) {
                this.enemyList.push(
                    new Enemy(image,
                        50 + Enemy.SIZE * w,
                        50 + Enemy.SIZE * h));
            }
        }
    }

    move() {
        this.enemyList.forEach(
            (enemy) => enemy.move(this.dx, this.dy));
        for(let ss = 0; ss < this.enemyList.length; ss++) {
            if(this.enemyList[ss].pos.x >= this.canvas_width - Enemy.HALF_SIZE) {
                this.dx *= -1;
            }
            else if (this.enemyList[ss].pos.x <= (this.canvas_width-800) + Enemy.HALF_SIZE) {
                this.dx *= -1;
            }
        }
    }

    draw(ctx) {
        this.enemyList.forEach(
            (enemy) => enemy.draw(ctx)
        );
    }

    collision(bullet) {
        if (bullet == null) {
            return;
        }
        const length = this.enemyList.length;
        for (let i = 0; i < length; i++) {
            if (this.enemyList[i].isCollision(bullet)) {
                this.enemyList.splice(i, 1);
                bullet.setInvalidate();
                return;
            }
        }
    }
}

window.addEventListener("DOMContentLoaded", function () {
    // 必要な定数、変数を設定しておく
    const canvas = document.getElementById("main");
    const ctx = canvas.getContext('2d');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const SPF = 1000 / 30;
    const PLAYER_SPEED = 5;

    let dx = 3;
    let dy = 0;
    let input = new Input();
    let player = new Player(input, WIDTH / 2, HEIGHT * 14 / 15, PLAYER_SPEED, WIDTH);

    // キーボード入力イベントをInputクラスとバインド
    document.addEventListener("keydown", (evt) => input.onKeyDown(evt));
    document.addEventListener("keyup", (evt) => input.onKeyUp(evt));

    // EnemyManagerの準備
    let manager = new EnemyManager(dx, dy, WIDTH);
    manager.generateEnemies();

    // メインループ
    let mainLoop = function () {
        // 画面消去
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // プレイヤーの描画
        player.draw(ctx);

        // 敵の衝突判定
        manager.collision(player.getBullet());

        manager.move(dx, dy);

        // 敵の描画
        manager.draw(ctx);

        // 再度この関数を呼び出す予約をする
        setTimeout(mainLoop, SPF);
    };
    // ゲーム起動開始
    setTimeout(mainLoop, SPF);
});