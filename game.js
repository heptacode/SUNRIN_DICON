var gameScene = new Scene();


// skills

class Skill
{
    constructor(_player, _type)
    {
        this.type = _type;
        this.yourPlayer = _player;
    }
    start()
    {

    }
    updating()
    {

    }
    update()
    {
        this.updating();
    }
}
class PassiveSkill extends Skill
{
    constructor(_player)
    {
        super(_player, "passive");
        this.gameStart = false;
    }
    updating2()
    {

    }
    updating()
    {
        if(this.gameStart == false)
        {
            this.start();
            this.gameStart = true;
        }
        this.updating2();
    }
}
class ActiveSkill extends Skill
{
    constructor(_player, _key, _coolTime, _usingElect)
    {
        super(_player, "active");

        this.key = _key;
        this.coolTime = _coolTime;
        this.coolRTime = 0;
        this.usingElect = _usingElect;

        this.activing = false;

        this.attackedList = [];
    }
    isActiving()
    {
        for(let i = 0; i < this.yourPlayer.activeSkills.length; i++)
        {
            if(this.yourPlayer.activeSkills[i] != this)
            {
                return this.yourPlayer.activeSkills[i].activing;
            }
        }
    }
    motion()
    {

    }
    updating2()
    {

    }
    updating()
    {
        if(keys[this.key] == 1 && Date.now() >= this.coolRTime && this.isActiving() == false && this.yourPlayer.attack.canAttack == true && this.yourPlayer.elect >= this.usingElect)
        {
            this.start();
            this.coolRTime = Date.now() + this.coolTime * 1000;

            this.yourPlayer.elect -= this.usingElect;
            this.yourPlayer.chargeElectRTime = Date.now() + this.yourPlayer.chargeElectTime * 1000;
        }
        this.motion();
        this.updating2();
    }
}


// Warrior

class attackDamageUp extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);
        this.increaseDamagePercent = 20;
    }
    start()
    {
        this.yourPlayer.basicDamage *= (100 + this.increaseDamagePercent) / 100;
    }
}
class healthUp extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.increaseHealth = 1.5;
    }
    start()
    {
        this.yourPlayer.maxHp *= this.increaseHealth;
        this.yourPlayer.hp = this.yourPlayer.maxHp;
    }
}
class blooddrain extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.drainPercent = 5;
        this.decreaseDamagePercent = 20;
    }
    start()
    {
        this.yourPlayer.basicDamage *= (100 - this.decreaseDamagePercent) / 100;

        this.yourPlayer.attackAbility = () =>
        {
            for(let i = 0; i < nowScene.enemyList.length; i++)
            {
                for(let j = 0; j < this.yourPlayer.weapon.attackedList.length; j++)
                {
                    if(nowScene.enemyList[i] == this.yourPlayer.weapon.attackedList[j])
                    {
                        this.yourPlayer.heal(this.yourPlayer.maxHp * this.drainPercent / 100);
                    }
                }
            }
        }
    }
}
class attackSpeedUp extends PassiveSkill
{
    constructor(_player, _increasePercent)
    {
        super(_player);

        this.increaseSpeedPercent = _increasePercent;
    }
    start()
    {
        this.yourPlayer.weapon.attackTime *= (100 - this.increaseSpeedPercent) / 100;
    }
}
class attackRangeUp extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.increaseRangePercent = 50;
    }
    start()
    {
        this.yourPlayer.weapon.attackLength += this.yourPlayer.weapon.attackLength * this.increaseRangePercent / 100;
    }
}
class MODBerserker extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.tempDamage = this.yourPlayer.basicDamage;

        this.rangePercent = 40;
        this.rangeDamageUpPercent = 100;
    }
    start()
    {
        this.tempDamage = this.yourPlayer.basicDamage;
    }
    updating2()
    {
        if(this.yourPlayer.hp <= this.yourPlayer.maxHp * this.rangePercent / 100)
        {
            this.yourPlayer.basicDamage = this.tempDamage * (this.rangeDamageUpPercent + 100) / 100;
        }
    }
}

class SwordShot extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 3, 2);
        
        this.sampleEffect = {image :  "image/effect/swordEffect.png", showTime : 2};
        
        this.moveSpeed = 10;

        this.nowCnt = 0;
        this.maxCnt = 3;

        this.delayTime = 0.1;
        this.delayRTime = Date.now();

        this.backRTime = Date.now();

        this.damage = this.yourPlayer.skillDamage * 7 / 10;
    }
    end()
    {
        this.nowCnt = 0;
        this.attackedList.length = 0;
        this.updating2 = () => {};
    }
    set()
    {
        this.yourPlayer.leftHand.playerToThis1 = 20;
        this.yourPlayer.leftHand.playerToThis2 = 40;

        this.yourPlayer.rightHand.playerToThis1 = 70;
        this.yourPlayer.rightHand.playerToThis2 = 0;
        
        this.yourPlayer.weapon.angle = 0;

        this.yourPlayer.watchMouse = false;
        this.activing = true;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    collide(_effect)
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(Collision.circleToRotatedRect(nowScene.enemyList[i], _effect) == true && !this.isAttackedList(i))
            {
                nowScene.enemyList[i].damaged(this.damage, Util.getAngle(_effect, nowScene.enemyList[i]), 5);
                this.attackedList.push(nowScene.enemyList[i]);
            }
        }
    }
    start()
    {
        this.set();
        this.updating2 = () =>
        {
            if(this.nowCnt < this.maxCnt && Date.now() >= this.delayRTime)
            {
                let tempEffect = nowScene.addThing(new Effect(this.sampleEffect.image, Util.getCenter(this.yourPlayer, "x"), Util.getCenter(this.yourPlayer, "y"), this.sampleEffect.showTime, this.yourPlayer));
                tempEffect.tempAngle = this.yourPlayer.playerToMouseAngle;
                tempEffect.firstSet();
                Util.moveByAngle(tempEffect.pos, tempEffect.tempAngle, this.yourPlayer.image.width / 2 + tempEffect.image.width);
                tempEffect.move = () =>
                {
                    Util.moveByAngle(tempEffect.pos, tempEffect.tempAngle, this.moveSpeed);
                    this.collide(tempEffect);
                }
                this.nowCnt++;

                nowScene.cam.shaking(15, 15, 0.1);
                this.delayRTime = Date.now() + this.delayTime * 1000;
            }
            if(this.nowCnt == this.maxCnt)
            {
                this.backRTime = Date.now() + 0.2 * 1000;
                this.yourPlayer.setPlayerTemp();
                this.yourPlayer.watchMouse = true;
                this.motion = () =>
                {
                    if(this.yourPlayer.playerHandSlowBasic(0.2, this.backRTime) == true)
                    {
                        this.activing = false;
                        this.motion = () => {};
                    }
                }
                this.end();
            }
        }
    }
}
class SwiftStrike extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 0.5, 1);

        this.activeNowRange = 0;
        this.activeMaxRange = 600;
        this.activeSpeed = 50;
        this.activeDir = this.yourPlayer.playerToMouseAngle;

        this.attackRect = {pos : {x : Util.getCenter(this.yourPlayer, "x") - 125 / 2, y : Util.getCenter(this.yourPlayer, "y") - 125 / 2}, rot : this.yourPlayer.rot, image : {width : 125, height : 125}};

        this.spectrum = new GameImage(this.yourPlayer.image.src, this.yourPlayer.pos.x, this.yourPlayer.pos.y, "none");
        this.spectrumTime = 0.005;
        this.spectrumRTime = Date.now();

        this.backRTime = Date.now();

        this.delayRTime = Date.now();
        this.delayTime = 0.15;

        this.damage = this.yourPlayer.skillDamage * 7 / 10;
    }
    makeSpectrum()
    {
        let tempSpectrum = [];

        tempSpectrum.push(new GameImage(this.yourPlayer.path, this.yourPlayer.pos.x, this.yourPlayer.pos.y, "effect"));
        tempSpectrum[0].rot = this.yourPlayer.rot;
        tempSpectrum[0].setZ(this.yourPlayer.z);

        tempSpectrum.push(new GameImage(this.yourPlayer.leftHand.path, this.yourPlayer.leftHand.pos.x, this.yourPlayer.leftHand.pos.y, "effect"));
        tempSpectrum[1].rot = this.yourPlayer.leftHand.rot;
        tempSpectrum[1].setZ(this.yourPlayer.leftHand.z);

        tempSpectrum.push(new GameImage(this.yourPlayer.rightHand.path, this.yourPlayer.rightHand.pos.x, this.yourPlayer.rightHand.pos.y, "effect"));
        tempSpectrum[2].rot = this.yourPlayer.rightHand.rot;
        tempSpectrum[2].setZ(this.yourPlayer.rightHand.z);

        tempSpectrum.push(new GameImage(this.yourPlayer.weapon.path, this.yourPlayer.weapon.pos.x, this.yourPlayer.weapon.pos.y, "effect"));
        tempSpectrum[3].setAnchor((-this.yourPlayer.weapon.image.width / 2 + this.yourPlayer.rightHand.image.width / 2), (-this.yourPlayer.weapon.height / 2 + this.yourPlayer.rightHand.image.height / 2));
        tempSpectrum[3].rot = this.yourPlayer.weapon.rot;
        tempSpectrum[3].setZ(this.yourPlayer.weapon.z);

        for(let i = 0; i < tempSpectrum.length; i++)
        {
            tempSpectrum[i].update = () =>
            {
                tempSpectrum[i].opacity -= 0.01;
                if(tempSpectrum[i].opacity <= 0)
                {
                    tempSpectrum[i].isDelete = true;
                }
            }
            nowScene.addThing(tempSpectrum[i]);
        }
    }
    end()
    {
        this.activeNowRange = 0;
        this.attackedList.length = 0;
        this.yourPlayer.InvincibleRTime = Date.now() + 0.5 * 1000;
        this.yourPlayer.setStatus("notCollision", false, "invincible", false);
        this.updating2 = () => {};
    }
    set()
    {
        this.yourPlayer.leftHand.playerToThis1 = 0;
        this.yourPlayer.leftHand.playerToThis2 = 50;

        this.yourPlayer.rightHand.playerToThis1 = 80;
        this.yourPlayer.rightHand.playerToThis2 = -20;

        this.yourPlayer.weapon.angle = -135;

        this.activeDir = this.yourPlayer.playerToMouseAngle;

        this.attackRect.pos = {x : Util.getCenter(this.yourPlayer, "x") - this.attackRect.image.width / 2, y : Util.getCenter(this.yourPlayer, "y") - this.attackRect.image.height / 2};
        this.attackRect.rot = this.yourPlayer.rot;

        this.yourPlayer.setStatus("notCollision", true, "invincible", true);
        this.yourPlayer.isDamaged = true;

        nowScene.cam.shaking(5, 5, 0.2);
        this.activing = true;
    }
    moving()
    {
        Util.moveByAngle(this.yourPlayer.pos, this.activeDir, this.activeSpeed);
        Util.moveByAngle(this.yourPlayer.leftHand.pos, this.activeDir, this.activeSpeed);
        Util.moveByAngle(this.yourPlayer.rightHand.pos, this.activeDir, this.activeSpeed);
        Util.moveByAngle(this.yourPlayer.information.hp.pos, this.activeDir, this.activeSpeed);
        this.attackRect.pos = {x : Util.getCenter(this.yourPlayer, "x") - this.attackRect.image.width / 2, y : Util.getCenter(this.yourPlayer, "y") - this.attackRect.image.height / 2};
        this.attackRect.rot = this.yourPlayer.rot;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    collide()
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(Collision.circleToRotatedRect(nowScene.enemyList[i], this.attackRect) == true && !this.isAttackedList(i))
            {
                nowScene.enemyList[i].damaged(this.damage, Util.getAngle(this.yourPlayer, nowScene.enemyList[i]), 30);
                this.attackedList.push(nowScene.enemyList[i]);
            }
        }
    }
    start()
    {
        this.set();
        this.updating2 = () =>
        {
            this.moving();
            this.collide();
            this.activeNowRange += this.activeSpeed;
            if(Date.now() >= this.spectrumRTime)
            {
                this.makeSpectrum();
                this.spectrumRTime = Date.now() + this.spectrumTime * 1000;
            }
            if(this.activeNowRange >= this.activeMaxRange)
            {
                this.delayRTime = Date.now() + this.delayTime * 1000;
                this.backRTime = Date.now() + 0.2 * 1000;
                this.yourPlayer.setPlayerTemp();
                this.motion = () =>
                {
                    if(Date.now() >= this.delayRTime)
                    {
                        if(this.yourPlayer.playerHandSlowBasic(0.2, this.backRTime) == true)
                        {
                            this.delayRTime = Date.now() + this.delayTime * 1000;
                            this.activing = false;
                            this.motion = () => {};
                        }
                    }
                }
                this.end();
            }
        }
    }
}
class SpinShot extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 5, 3);

        this.sampleEffect = {image : "image/effect/swordEffect.png", showTime : 2};

        this.moveSpeed = 10;

        this.nowCnt = 0;
        this.maxCnt = 12;

        this.delayRTime = Date.now();
        this.delayTime = 0.01;

        this.backRTime = Date.now();

        this.damage = this.yourPlayer.skillDamage * 10 / 10;
    }
    end()
    {
        this.nowCnt = 0;
        this.attackedList.length = 0;
        this.updating2 = () => {};
    }
    set()
    {
        this.yourPlayer.watchMouse = false;
        this.activing = true;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    collide(_effect)
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(Collision.circleToRotatedRect(nowScene.enemyList[i], _effect) == true && !this.isAttackedList(i))
            {
                nowScene.enemyList[i].damaged(this.damage, Util.getAngle(_effect, nowScene.enemyList[i]), 5);
                this.attackedList.push(nowScene.enemyList[i]);
            }
        }
    }
    start()
    {
        this.set();
        this.updating2 = () =>
        {
            if(this.nowCnt < this.maxCnt && Date.now() >= this.delayRTime)
            {
                let tempEffect = nowScene.addThing(new Effect(this.sampleEffect.image, Util.getCenter(this.yourPlayer, "x"), Util.getCenter(this.yourPlayer, "y"), this.sampleEffect.showTime, this.yourPlayer));
                tempEffect.tempAngle = this.yourPlayer.rot;
                tempEffect.firstSet();
                Util.moveByAngle(tempEffect.pos, tempEffect.tempAngle, this.yourPlayer.image.width / 2 + tempEffect.image.width);
                tempEffect.move = () =>
                {
                    Util.moveByAngle(tempEffect.pos, tempEffect.tempAngle, this.moveSpeed);
                    this.collide(tempEffect);
                }
                this.nowCnt++;
                this.yourPlayer.rot -= (360 / this.maxCnt) / 180 * Math.PI;

                nowScene.cam.shaking(0.1, 0.1, 0.1);
                this.delayRTime = Date.now() + this.delayTime * 1000;
            }
            if(this.nowCnt == this.maxCnt)
            {
                this.backRTime = Date.now() + 0.2 * 1000;
                this.yourPlayer.setPlayerTemp();
                this.yourPlayer.watchMouse = true;

                this.motion = () =>
                {
                    if(this.yourPlayer.playerHandSlowBasic(0.2, this.backRTime) == true)
                    {
                        this.activing = false;
                        this.motion = () => {};
                    }
                }
                this.end();
            }
        }
    }
}
class WheelWind extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 5, 5);

        this.moveSpeed = 10;

        this.rotatedCnt = 20;

        this.nowCnt = 0;
        this.maxCnt = 12 * this.rotatedCnt;

        this.delayRTime = Date.now();
        this.delayTime = 0.01;

        this.backRTime = Date.now();

        this.damage = this.yourPlayer.skillDamage * 1 / 10;

        this.attackLength = this.yourPlayer.image.width / 2 + this.yourPlayer.weapon.image.width;
    }
    end()
    {
        this.yourPlayer.attack.canAttack = true;
        this.nowCnt = 0;
        this.attackedList.length = 0;
        this.updating2 = () => {};
    }
    set()
    {
        this.yourPlayer.playerHandSlowBasic(0, 0);

        this.delayRTime = Date.now() + 0.3 * 1000;

        this.yourPlayer.weapon.angle = 0;

        this.motion = () =>
        {
            if(Date.now() > this.delayRTime)
            {
                this.delayRTime += 0.5 * 1000;
                this.motion = () => 
                {
                    if(Date.now() > this.delayRTime)
                    {
                        this.delayRTime += 0.2 * 1000;
                        this.motion = () =>
                        {
                            if(Date.now() > this.delayRTime)
                            {
                                this.yourPlayer.playerHandSlowBasic(0, 0);
                                this.yourPlayer.weapon.angle = 0;
                                this.motion = () => {};
                            }
                            else
                            {
                                this.yourPlayer.leftHand.playerToThis1 += 20 / (0.2 * frame);
                                this.yourPlayer.leftHand.playerToThis2 -= 10 / (0.2 * frame);

                                this.yourPlayer.rightHand.playerToThis1 -= 10 / (0.2 * frame);
                                this.yourPlayer.rightHand.playerToThis2 += 80 / (0.2 * frame);

                                this.yourPlayer.weapon.rot += (180 / 180 * Math.PI) / (0.2 * frame);
                            }
                        }
                    }
                };
            }
            else
            {
                this.yourPlayer.leftHand.playerToThis1 -= 20 / (0.3 * frame);
                this.yourPlayer.leftHand.playerToThis2 += 10 / (0.3 * frame);

                this.yourPlayer.rightHand.playerToThis1 += 10 / (0.3 * frame);
                this.yourPlayer.rightHand.playerToThis2 -= 80 / (0.3 * frame);

                this.yourPlayer.weapon.rot -= (180 / 180 * Math.PI) / (0.3 * frame);
            }
        }

        this.yourPlayer.attack.canAttack = false;
        this.yourPlayer.watchMouse = false;
        this.activing = true;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    collide()
    {
        let attacked = false;
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(Collision.circle(nowScene.enemyList[i], this.yourPlayer, nowScene.enemyList[i].image.width, this.attackLength) == true && !this.isAttackedList(i))
            {
                attacked = true;
                nowScene.enemyList[i].damaged(this.damage, Util.getAngle(this.yourPlayer, nowScene.enemyList[i]) / 180 * Math.PI, 5);
                this.attackedList.push(nowScene.enemyList[i]);
            }
        }
        if(attacked == true)
        {
            nowScene.cam.shaking(2, 2, 0.1);
        }
    }
    start()
    {
        this.set();
        this.updating2 = () =>
        {
            if(this.nowCnt < this.maxCnt && Date.now() >= this.delayRTime)
            {
                this.nowCnt++;
                this.yourPlayer.rot -= (360 / 12) / 180 * Math.PI;
                if(this.nowCnt % 12 == 0)
                {
                    this.yourPlayer.rot += 2 * Math.PI;
                }
                this.yourPlayer.weapon.rot = this.yourPlayer.rot;

                if(this.nowCnt % 2 == 0)
                {
                    this.collide();
                    this.attackedList.length = 0;
                }

                nowScene.cam.shaking(0.1, 0.1, 0.1);
                this.delayRTime += this.delayTime * 1000;
            }
            if(this.nowCnt == this.maxCnt)
            {
                this.backRTime = Date.now() + 0.2 * 1000;
                this.yourPlayer.setPlayerTemp();
                this.yourPlayer.watchMouse = true;

                this.motion = () =>
                {
                    if(this.yourPlayer.playerHandSlowBasic(0.2, this.backRTime) == true)
                    {
                        this.activing = false;
                        this.motion = () => {};
                    }
                }
                this.end();
            }
        }
    }
}


// Lancer

class backDashAttack extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.dashDistance = -50;
    }
    start()
    {

    }
    updating2()
    {
        this.yourPlayer.attackAbility = () =>
        {
            Util.moveByAngle(this.yourPlayer.pos, this.yourPlayer.playerToMouseAngle, this.dashDistance);
        }
    }
}
class MODDestroyer extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.specialAttackDamage = this.yourPlayer.basicDamage * 2;
        this.specialAttackKnockbackDistance = 100;
        this.specialAttackTime = 0.07;

        this.specialAttackLength = this.yourPlayer.weapon.collisionRect.image.width + 20;
        this.specialAttackAngle = -170;

        this.attackTime = 0.2;
    }
    isInRange(obj)
    {
        return (Collision.circle(this.yourPlayer, obj, this.specialAttackLength, obj.image.width / 2));
    }
    isInAngle(obj)
    {
        let basicPlayerRot = Util.getAngleBasic(this.yourPlayer.rot * 180 / Math.PI);
        let playerToEnemy = Util.getAngleBasic(Util.getAngle(this.yourPlayer, obj));

        if((basicPlayerRot < -this.specialAttackAngle / 2) && playerToEnemy > (360 + this.specialAttackAngle / 2))
        {
            basicPlayerRot += 360;
        }
        else if((basicPlayerRot > 360 + this.specialAttackAngle / 2) && playerToEnemy < -this.specialAttackAngle / 2)
        {
            basicPlayerRot -= 360;
        }

        let minusAngle = (basicPlayerRot + this.specialAttackAngle / 2);
        let plusAngle = (basicPlayerRot - this.specialAttackAngle / 2);
        
        return (playerToEnemy >= minusAngle && playerToEnemy <= plusAngle);
    }
    attackCheck()
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(this.isInRange(nowScene.enemyList[i]) && this.isInAngle(nowScene.enemyList[i]) && !this.yourPlayer.weapon.isAttackedList(i))
            {
                nowScene.enemyList[i].damaged(this.specialAttackDamage, this.yourPlayer.rot, this.specialAttackKnockbackDistance);
                this.yourPlayer.weapon.attackedList.push(nowScene.enemyList[i]);
            }
        }
        this.yourPlayer.attackAbility();
    }
    start()
    {
        this.yourPlayer.weapon.attackNum = 0;

        this.yourPlayer.basicAttack = () =>
        {
            if(this.yourPlayer.weapon.attackNum == 2)
            {
                if(this.yourPlayer.weapon.attackPattern == 1)
                {
                    if(this.yourPlayer.attack.click == true)
                    {
                        this.yourPlayer.leftHand.playerToThis1 -= this.yourPlayer.leftHand.attackPoint1;
                        this.yourPlayer.leftHand.playerToThis2 -= this.yourPlayer.leftHand.attackPoint2;

                        this.yourPlayer.rightHand.playerToThis1 += 10;
                        this.yourPlayer.rightHand.playerToThis2 += 20;
        
                        this.yourPlayer.weapon.attackRTime = Date.now() + 0.3 * 1000;
                        this.yourPlayer.weapon.angle += 90;
        
                        this.yourPlayer.attack.click = false;
                        nowScene.cam.shaking(30, 30, 0.15);

                        this.attackCheck();
                    }
                    else if(this.yourPlayer.weapon.attackRTime > Date.now())
                    {
                        if(this.yourPlayer.weapon.angle > -80)
                        {
                            this.yourPlayer.weapon.angle += this.specialAttackAngle / (this.specialAttackTime * frame);

                            this.yourPlayer.rightHand.playerToThis1 += 60 / (this.specialAttackTime * frame);
                            this.yourPlayer.rightHand.playerToThis2 -= 120 / (this.specialAttackTime * frame);
                        }
                    }
                    else
                    {
                        this.yourPlayer.weapon.attackRTime = Date.now() + this.attackTime * 1000;
                        this.yourPlayer.weapon.attackPattern++;
                        this.yourPlayer.attack.canAttack = true;

                        this.yourPlayer.weapon.attackedList.length = 0;
                        this.yourPlayer.setPlayerTemp();
    
                        this.yourPlayer.weapon.attackNum = 0;
                    }
                }
                else if(this.yourPlayer.weapon.attackPattern == 2)
                {
                    if(this.yourPlayer.playerHandSlowBasic(this.attackTime, this.yourPlayer.weapon.attackRTime) == true)
                    {
                        this.yourPlayer.attack.attacking = false;
                    }
                }
            }
            else
            {
                if(this.yourPlayer.weapon.attackPattern == 1)
                {
                    if(this.yourPlayer.attack.click == true)
                    {
                        this.yourPlayer.weapon.attackCheck();

                        this.yourPlayer.leftHand.playerToThis1 -= this.yourPlayer.leftHand.attackPoint1;
                        this.yourPlayer.leftHand.playerToThis2 -= this.yourPlayer.leftHand.attackPoint2;
        
                        this.yourPlayer.rightHand.playerToThis1 -= this.yourPlayer.rightHand.attackPoint1;
                        this.yourPlayer.rightHand.playerToThis2 -= this.yourPlayer.rightHand.attackPoint2;
        
                        this.yourPlayer.weapon.attackRTime = Date.now();
        
                        this.yourPlayer.attack.click = false;
                        nowScene.cam.shaking(7, 7, 0.1);
                    }
                    else if(Date.now() > this.yourPlayer.weapon.attackRTime)
                    {
                        this.yourPlayer.weapon.attackRTime = Date.now() + (0.5 / 2) * 1000;
                        this.yourPlayer.weapon.attackPattern++;
                        this.yourPlayer.attack.canAttack = true;
        
                        this.yourPlayer.weapon.attackedList.length = 0;
                        this.yourPlayer.setPlayerTemp();
    
                        this.yourPlayer.weapon.attackNum++;
                    }
                }
                else if(this.yourPlayer.weapon.attackPattern == 2)
                {
                    if(this.yourPlayer.playerHandSlowBasic(0.5 / 2, this.yourPlayer.weapon.attackRTime) == true)
                    {
                        this.yourPlayer.attack.attacking = false;
                    }
                }
            }
        }
    }
    updating2()
    {
        
    }
}

class Swing extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 2, 1);

        this.delayRTime = Date.now();
        this.delayTime = 0.01;

        this.delayRTime2 = Date.now();
        this.delayTime2 = 0.3;

        this.backRTime = Date.now();
        this.backTime = 0.2;
        this.delayTime2Set = false;

        this.leftPoint1 = 42;
        this.leftPoint2 = -8;
        this.rightPoint1 = 20;
        this.rightPoint2 = 80;

        this.weaponAngle = 105;

        this.nowCnt = 0;
        this.maxCnt = 16;

        this.damage = this.yourPlayer.skillDamage * 10 / 10;

        this.collisionCircle = {pos : {x : this.yourPlayer.pos.x, y : this.yourPlayer.pos.y}, image : {width : 500, height : 500}};
        this.collisionCircle.pos.x -= this.collisionCircle.image.width / 2;
        this.collisionCircle.pos.y -= this.collisionCircle.image.height / 2;
    }
    end()
    {
        this.delayTime2Set = false;
        this.nowCnt = 0;
        this.attackedList.length = 0;

        this.updating2 = () => {};
    }
    set()
    {
        this.yourPlayer.leftHand.playerToThis1 = 0;
        this.yourPlayer.leftHand.playerToThis2 = 50;

        this.yourPlayer.rightHand.playerToThis1 = 80;
        this.yourPlayer.rightHand.playerToThis2 = -20;

        this.yourPlayer.weapon.rot = this.yourPlayer.rot - (45 / 180 * Math.PI);
        this.yourPlayer.weapon.angle = 0;

        this.collisionCircle.pos = {x : this.yourPlayer.pos.x, y : this.yourPlayer.pos.y};
        this.collisionCircle.pos.x -= this.collisionCircle.image.width / 2;
        this.collisionCircle.pos.y -= this.collisionCircle.image.height / 2;

        this.yourPlayer.watchMouse = false;
        this.yourPlayer.attack.canAttack = false;
        this.activing = true;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    collide()
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(Collision.circle(nowScene.enemyList[i], this.collisionCircle) == true && !this.isAttackedList(i))
            {
                nowScene.enemyList[i].damaged(this.damage, Util.getAngle(this.yourPlayer, nowScene.enemyList[i]) / 180 * Math.PI, 100);
                this.attackedList.push(nowScene.enemyList[i]);
                nowScene.cam.shaking(4, 4, 0.2);
            }
        }
    }
    start()
    {
        this.set();
        this.collide();
        
        this.updating2 = () =>
        {
            if(this.nowCnt < this.maxCnt && Date.now() >= this.delayRTime)
            {
                this.yourPlayer.leftHand.playerToThis1 += this.leftPoint1 / this.maxCnt;
                this.yourPlayer.leftHand.playerToThis2 += this.leftPoint2 / this.maxCnt;
                
                this.yourPlayer.rightHand.playerToThis1 += this.rightPoint1 / this.maxCnt;
                this.yourPlayer.rightHand.playerToThis2 += this.rightPoint2 / this.maxCnt;

                this.yourPlayer.rot += (360 / this.maxCnt) / 180 * Math.PI;

                this.yourPlayer.weapon.rot = this.yourPlayer.rot - (45 / 180 * Math.PI);

                nowScene.cam.shaking(1, 1, 0.1);
                this.delayRTime = Date.now() + this.delayTime * 1000;
                this.nowCnt++;
            }
            if(this.nowCnt == this.maxCnt && this.delayTime2Set == false)
            {
                this.delayRTime2 = Date.now() + this.delayTime2 * 1000;
                this.delayTime2Set = true;
                
                this.yourPlayer.weapon.rot += this.weaponAngle / 180 * Math.PI;
            }
            if(this.delayTime2Set == true && Date.now() >= this.delayRTime2)
            {
                this.backRTime = Date.now() + this.backTime * 1000;
                this.yourPlayer.weapon.angle += this.yourPlayer.weapon.rot * 180 / Math.PI;
                this.yourPlayer.weapon.rot -= 2 * Math.PI;
                this.yourPlayer.setPlayerTemp();
                this.yourPlayer.watchMouse = true;

                this.motion = () =>
                {
                    if(this.yourPlayer.playerHandSlowBasic(this.backTime, this.backRTime) == true)
                    {
                        this.yourPlayer.attack.canAttack = true;
                        this.activing = false;
                        this.motion = () => {};
                    }
                }
                this.end();
            }
        }
    }
}
class BuWang extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 5, 2);

        this.RTime = Date.now();

        this.damage = this.yourPlayer.skillDamage * 15 / 10;
    }
    end()
    {
        this.nowCnt = 0;
        this.attackedList.length = 0;

        this.updating2 = () => {};
    }
    set()
    {
        this.activing = true;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    start()
    {
        this.set();
        this.updating2 = () =>
        {
            this.activing = false;
        }
    }
}
class ContinuousAttack extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 2, 3);

        this.delayRTime = Date.now();
        this.delayTime = 0.03;

        this.nowCnt = 0;
        this.maxCnt = 50;

        this.backRTime = Date.now();
        this.backTime = 0.2;

        this.damage = this.yourPlayer.skillDamage * 2 / 10;
        this.knockbackDistance = 5;

        this.collisionRect = {pos : {x : this.yourPlayer.pos.x, y : this.yourPlayer.pos.y}, rot : this.yourPlayer.rot, image : {width : this.yourPlayer.weapon.collisionRect.image.width + this.yourPlayer.image.width / 2, height : this.yourPlayer.image.height * 4 / 5}};
    }
    end()
    {
        this.yourPlayer.attack.canAttack = true;
        this.nowCnt = 0;
        this.attackedList.length = 0;

        this.updating2 = () => {};
    }
    set()
    {
        this.yourPlayer.rightHand.playerToThis1 = 110;
        this.yourPlayer.weapon.angle = -30;

        this.yourPlayer.watchMouse = false;
        this.yourPlayer.attack.canAttack = false;
        this.activing = true;
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    collide()
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(Collision.circleToRotatedRect(nowScene.enemyList[i], this.collisionRect))
            {
                nowScene.enemyList[i].damaged(this.damage, this.yourPlayer.rot, this.knockbackDistance);
                this.attackedList.push(nowScene.enemyList[i]);
            }
        }
    }
    start()
    {
        this.set();
        this.updating2 = () =>
        {
            this.collisionRect.pos = {x : Util.getCenter(this.yourPlayer, "x") - this.collisionRect.image.width / 2, y : Util.getCenter(this.yourPlayer, "y") - this.collisionRect.image.height / 2};
            this.collisionRect.rot = this.yourPlayer.rot;
            Util.moveByAngle(this.collisionRect.pos, this.collisionRect.rot, this.yourPlayer.image.width / 2);

            if(this.nowCnt < this.maxCnt && Date.now() > this.delayRTime)
            {
                this.nowCnt++;
                this.delayRTime = Date.now() + this.delayTime * 1000;

                let random = Math.floor(Math.random() * 71) - 30;
                if(random % 2 == 0)
                {
                    this.yourPlayer.leftHand.playerToThis1 = 15;
                    this.yourPlayer.leftHand.playerToThis2 = 50;
                }
                else
                {
                    this.yourPlayer.leftHand.playerToThis1 = 35;
                    this.yourPlayer.leftHand.playerToThis2 = 50;
                }
                this.yourPlayer.rightHand.playerToThis2 = random;
                if(this.nowCnt % 2 == 0)
                {
                    this.collide();
                    this.attackedList.length = 0;
                }

                nowScene.cam.shaking(10, 10, this.delayTime);
            }
            if(this.nowCnt == this.maxCnt && Date.now() > this.delayRTime)
            {
                this.backRTime = Date.now() + this.backTime * 1000;
                this.yourPlayer.setPlayerTemp();
                this.yourPlayer.watchMouse = true;

                this.motion = () =>
                {
                    if(this.yourPlayer.playerHandSlowBasic(this.backTime, this.backRTime) == true)
                    {
                        this.activing = false;
                        this.motion = () => {};
                    }
                }
                this.end();
            }
        }
    }
}


// Summoner

class chargeElectSpeedUp extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.changeChargeElectTime = 1.5;
    }
    start()
    {
        this.yourPlayer.chargeElectTime = this.changeChargeElectTime;
    }
}
class shotSpeedUp extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.increaseShotSpeedPercent = 50;
    }
    start()
    {
        this.yourPlayer.weapon.shotSpeed *= (100 + this.increaseShotSpeedPercent) / 100;
    }
}
class attackRangeUp_Summoner extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.increaseAttackRangePercent = 100;
    }
    start()
    {
        this.yourPlayer.weapon.range *= (100 + this.increaseAttackRangePercent) / 100;
    }
}
class skillDamageUp extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.increaseSkillDamagePercent = 50;
    }
    start()
    {
        this.yourPlayer.skillDamage *= (100 + this.increaseSkillDamagePercent) / 100;
    }
}
class addShooter extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.addShooterCnt = 2;
    }
    start()
    {
        this.yourPlayer.weapon.addShooter(this.addShooterCnt);
    }
}
class penetrationAttack extends PassiveSkill
{
    constructor(_player)
    {
        super(_player);

        this.addShooterCnt = 2;
    }
    start()
    {
        for(let i = 0; i < this.yourPlayer.weapon.shooters.length; i++)
        {
            this.yourPlayer.weapon.shooters[i].weapon.penetration = true;
        }
    }
}

class LaserAttack extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 1, 1);
    }
    end()
    {

    }
    set()
    {

    }
    start()
    {

    }
}
class AttackSpeedBuff extends ActiveSkill
{
    constructor(_player, _key)
    {
        super(_player, _key, 30, 5);

        this.delayRTime = Date.now();

        this.durationRTime = Date.now();
        this.durationTime = 10;

        this.increaseAttackSpeedPercent = 200;
        this.tempAttackSpeed = 0;
    }
    end()
    {
        this.yourPlayer.weapon.attackTime = this.tempAttackSpeed;
        this.updating2 = () => {};
    }
    set()
    {
        this.delayRTime = Date.now() + 0.1 * 1000;

        this.motion = () =>
        {
            if(Date.now() > this.delayRTime)
            {
                this.delayRTime += 0.3 * 1000;
                this.motion = () =>
                {
                    if(Date.now() > this.delayRTime)
                    {
                        this.delayRTime += 0.1 * 1000;
                        this.motion = () =>
                        {
                            if(Date.now() > this.delayRTime)
                            {
                                this.delayRTime += 1 * 1000;
                                nowScene.cam.shaking(5, 5, 1);
                                this.motion = () => 
                                {
                                    if(Date.now() > this.delayRTime)
                                    {
                                        this.delayRTime += 0.2 * 1000;
                                        this.yourPlayer.setPlayerTemp();
                                        this.motion = () =>
                                        {
                                            if(this.yourPlayer.playerHandSlowBasic(0.2, this.delayRTime) == true)
                                            {
                                                this.tempAttackSpeed = this.yourPlayer.weapon.attackTime;
                                                this.yourPlayer.weapon.attackTime *= (100 - this.increaseAttackSpeedPercent) / 100;
                                                this.durationRTime = Date.now() + this.durationTime * 1000;
                
                                                this.updating2 = () =>
                                                {
                                                    if(Date.now() > this.durationRTime)
                                                    {
                                                        this.end();
                                                    }
                                                }
                                                this.motion = () => {};
                                            }
                                        }
                                    }
                                }
                            }
                            else
                            {
                                this.yourPlayer.leftHand.playerToThis1 -= 10 / (0.1 * frame);
                                this.yourPlayer.leftHand.playerToThis2 -= 100 / (0.1 * frame);

                                this.yourPlayer.rightHand.playerToThis1 -= 10 / (0.1 * frame);
                                this.yourPlayer.rightHand.playerToThis2 -= 100 / (0.1 * frame);
                            }
                        }
                    }
                }
            }
            else
            {
                this.yourPlayer.leftHand.playerToThis1 += 20 / (0.1 * frame);
                this.yourPlayer.leftHand.playerToThis2 += 50 / (0.1 * frame);

                this.yourPlayer.rightHand.playerToThis1 += 20 / (0.1 * frame);
                this.yourPlayer.rightHand.playerToThis2 += 50 / (0.1 * frame);
            }
        }
    }
    start()
    {
        this.set();
    }
}


// class

class Effect extends GameImage
{
    constructor(path, _x, _y, _showTime, _unit)
    {
        super(path, _x, _y, "effect");
        this.unit = _unit;
        
        this.RTime = 0;
        this.showTime = _showTime;
        
        this.effectOn = false;
    }
    firstSet()
    {
        this.pos = {x : this.unit.pos.x + this.unit.image.width / 2 - this.image.width / 2, y : this.unit.pos.y + this.unit.image.height / 2 - this.image.height / 2};

        this.rot = this.unit.rot;
        this.setZ(5);
    }
    basicSet()
    {
        if(this.effectOn == false)
        {
            this.RTime = Date.now() + this.showTime * 1000;
            this.effectOn = true;
        }
        if(Date.now() >= this.RTime)
        {
            this.opacity -= 0.01;
        }
        if(this.opacity <= 0)
        {
            this.isDelete = true;
        }
    }
    collision()
    {

    }
    move()
    {

    }
    update()
    {
        this.move();
        this.collision();
        this.basicSet();
    }
}
class Weapon extends GameImage
{
    constructor(path, _x, _y, _angle, _attackAngle, _attackTime, _player)
    {
        super(path, _x, _y, "weapon");
        this.angle = _angle;
        this.basicAngle = _angle;
        this.tempAngle = this.angle;
        this.attackAngle = _attackAngle;
        this.yourPlayer = _player;

        this.attackRTime = 0;
        this.attackTime = _attackTime;
        this.attackBTime = 0;

        this.attackPattern = 1;

        this.damage = this.yourPlayer.basicDamage;
        this.attackEffect = new Effect("image/effect/swordEffect.png", this.yourPlayer.pos.x, this.yourPlayer.pos.y, 0.3, this.yourPlayer);
        this.attackLength = this.yourPlayer.image.width / 2 + this.image.width + this.attackEffect.image.width;

        this.knockbackDistance = 30;

        this.attackedList = [];
    }
    firstSet()
    {
        this.yourPlayer.job.setAttackRange(this.yourPlayer);
    }
    setBasic()
    {
        this.angle = this.basicAngle;
        this.attackRTime = 0;
        this.attackPattern = 1;
    }
    isInRange()
    {
        
    }
    isInAngle()
    {
        
    }
    isAttackedList(_index)
    {
        for(let i = 0; i < this.attackedList.length; i++)
        {
            if(nowScene.enemyList[_index] == this.attackedList[i])
            {
                return true;
            }
        }
        return false;
    }
    attackCheck()
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(this.isInRange(nowScene.enemyList[i]) && this.isInAngle(nowScene.enemyList[i]) && !this.isAttackedList(i))
            {
                nowScene.enemyList[i].damaged(this.damage, this.yourPlayer.rot, this.knockbackDistance);
                this.attackedList.push(nowScene.enemyList[i]);
            }
        }
        this.yourPlayer.attackAbility();
    }
    updatingDamage()
    {
        this.damage = this.yourPlayer.basicDamage;
    }
    updating()
    {

    }
    update()
    {
        this.updatingDamage();
        this.updating();
    }
}
class PlayerHand extends GameImage
{
    constructor(path, _player, _PPT1, _PPT2)
    {
        super(path, _player.pos.x, _player.pos.y, "playerHand");
        this.playerToThis1 = _PPT1;
        this.playerToThis2 = _PPT2;

        this.basic1 = _PPT1;
        this.basic2 = _PPT2;

        this.tempPTT1 = this.playerToThis1;
        this.tempPTT2 = this.playerToThis2;
        
        this.yourPlayer = _player;

        this.attackPoint1 = 0;
        this.attackPoint2 = 0;
    }
    setAttackPoint(num, point)
    {
        eval("this.attackPoint" + num + "= this.playerToThis" + num + "- " + point);
    }
    setTempPoint(num, nowPoint, point)
    {
        eval("this.tempPTT" + num + "= " + (nowPoint - point));
    }
    setBasic()
    {
        this.playerToThis1 = this.basic1;
        this.playerToThis2 = this.basic2;
    }
}
class HpBar extends GameImage
{
    constructor(_inPath, _outPath, _unit)
    {
        super(_inPath, _unit.pos.x, _unit.pos.y, "hpBar");
        this.unit = _unit;
        this.hpBarOut = nowScene.addThing(new GameImage(_outPath, this.unit.pos.x, this.unit.pos.y, "hpBar"));

        this.setAnchor(-this.image.width / 2, -this.image.height / 2);
        this.tempScaleX = this.scale.x;

        this.setZ(19);
        this.hpBarOut.setZ(20);
    }
    setPos(_x, _y)
    {
        this.pos = {x : _x, y : _y};
        this.hpBarOut.pos = this.pos;
    }
    update()
    {
        if(this.isFixed != true)
        {
            this.pos = {x : Util.getCenter(this.unit, "x") - this.image.width / 2, y : this.unit.pos.y - this.unit.image.height / 2};
            this.hpBarOut.pos = this.pos;
        }

        let ratio = this.tempScaleX / this.unit.maxHp;
        this.scale.x = ratio * this.unit.hp;
        if(this.unit.isDelete == true)
        {
            this.hpBarOut.isDelete = true;
            this.isDelete = true;
        }
    }
}
class Player extends GameImage
{
    constructor(path, _x, _y, _job)
    {
        super(path, _x, _y, "player");
        this.job = _job;
        this.jobName = _job;
        
        this.pos = {x : this.pos.x - this.image.width / 2, y : this.pos.y - this.image.height / 2};
        
        this.move = {speed : 500, crash : false};
        this.setHandMove = false;
        this.velocity = new Vector(0, 0);
        this.playerToMouseAngle = 0;
        this.watchMouse = true;

        this.maxHp = 10;
        this.hp = this.maxHp;

        this.maxElect = 6;
        this.elect = this.maxElect;
        this.chargeElectRTime = Date.now();
        this.chargeElectTime = 3;

        this.basicDamage = 10;
        this.skillDamage = this.basicDamage;

        this.isDamaged = false;
        this.InvincibleTime = 0.3;
        this.InvincibleRTime = Date.now();
        
        this.attack = {canAttack : true, attacking : false, click : false};
        this.passiveSkills = [];
        this.activeSkills = [];
        
        this.information = {hp : nowScene.addThing(new HpBar("image/PlayerHpBarIn.png", "image/hpBarOut.png", this))};
        this.status = {notCollision : false, invincible : false, cantSkill : false};
        
        this.killCnt = 0;
        
        this.circleStrokeWidth = 100;
        this.circleStrokeStyle = "#000000";
        
        this.restHeal = this.maxHp / 7;

        this.firstSet();
    }
    setStatus(_status, _trueFalse)
    {
        for(let i = 0; i < arguments.length; i+=2)
        {
            switch(arguments[i])
            {
                case "notCollision" : this.status.notCollision = arguments[i + 1]; break;
                case "invincible" : this.status.invincible = arguments[i + 1]; break;
                case "cantSkill" : this.status.cantSkill = arguments[i + 1]; break;
            }
        }
    }
    statusUpdating()
    {
        if(this.status.notCollision == true) // 충돌처리 x
        {
            // nowScene.collisionList에서 뺌
        }
        if(this.status.invincible == true) // 무적
        {
            // 무적시간 = Date.now()
            this.InvincibleRTime = Date.now();
        }
        if(this.status.cantSkill == false) // skill 사용 못함
        {
            // activeSkill 업데이트 x
        }
    }
    setPlayerTemp()
    {
        this.leftHand.tempPTT1 = this.leftHand.playerToThis1 - this.leftHand.basic1;
        this.leftHand.tempPTT2 = this.leftHand.playerToThis2 - this.leftHand.basic2;

        this.rightHand.tempPTT1 = this.rightHand.playerToThis1 - this.rightHand.basic1;
        this.rightHand.tempPTT2 = this.rightHand.playerToThis2 - this.rightHand.basic2;

        this.weapon.tempAngle = this.weapon.angle - this.weapon.basicAngle;
    }
    firstSet()
    {
        setJob(this);
        this.job.setPlayerHand(this);
        this.job.setAttackHandPoint(this);
        this.job.setStat(this);
        this.job.setWeapon(this);
        this.job.setPlayerAttackMotion(this);
        this.job.setAttackRange(this);
        this.job.setSkills(this);
    }
    playerHandsBasic()
    {
        this.leftHand.setBasic();
        this.rightHand.setBasic();
        this.weapon.setBasic();
    }
    playerHandSlowBasic(_Time, _RTime)
    {
        this.leftHand.playerToThis1 -= this.leftHand.tempPTT1 / (_Time * frame);
        this.leftHand.playerToThis2 -= this.leftHand.tempPTT2 / (_Time * frame);

        this.rightHand.playerToThis1 -= this.rightHand.tempPTT1 / (_Time * frame);
        this.rightHand.playerToThis2 -= this.rightHand.tempPTT2 / (_Time * frame);

        this.weapon.angle -= this.weapon.tempAngle / (_Time * frame);
        
        if(Date.now() >= _RTime)
        {
            this.playerHandsBasic();
            return true;
        }
    }
    attackAbility()
    {

    }
    basicAttack()
    {

    }
    playerAttack()
    {
        if(mouseValue["Left"] == 1 && this.attack.canAttack == true && this.attack.attacking == false)
        {
            this.playerHandsBasic();
            this.attack.attacking = true;
            this.attack.canAttack = false;
            this.attack.click = true;
            this.weapon.attackRTime = Date.now();
        }
        if(this.attack.attacking == true)
        {
            this.basicAttack();
        }
    }
    passiveSkillUpdating()
    {
        this.passiveSkills.forEach(skill => skill.update());
    }
    activeSkillUpdating()
    {
        this.activeSkills.forEach(skill => skill.update());
    }
    skillUpdate()
    {
        this.passiveSkillUpdating();
        this.activeSkillUpdating();
    }
    heal(_hp)
    {
        this.hp += _hp;
        if(this.hp > this.maxHp)
        {
            this.hp = this.maxHp;
        }
    }
    watchingMouse()
    {
        if(this.watchMouse == true)
        {
            this.playerToMouseAngle = Math.atan2(Util.getCenter(nowScene.cursor, "y") - Util.getCenter(this, "y") + nowScene.cam.pos.y, Util.getCenter(nowScene.cursor, "x") - Util.getCenter(this, "x") + nowScene.cam.pos.x);
            this.rot = this.playerToMouseAngle;
            this.leftHand.rot = this.playerToMouseAngle;
            this.rightHand.rot = this.playerToMouseAngle;
        }
    }
    moving()
    {
        let vX = 0;
        let vY = 0;
        
        if(keys["KeyW"] > 0)
        {
            vY -= 10;
        }
        else if(keys["KeyS"] > 0)
        {
            vY += 10;
        }
        if(keys["KeyA"] > 0)
        {
            vX -= 10;
        }
        else if(keys["KeyD"] > 0)
        {
            vX += 10;
        }

        this.velocity.set(vX, vY);
        this.velocity.fixSpeed(this.move.speed);

        this.pos.x += this.velocity.x * deltaTime;
        this.pos.y += this.velocity.y * deltaTime;
    }
    handMove()
    {
        
    }
    damaged(_damge)
    {
        if(this.isDamaged == false && this.status.invincible == false)
        {
            this.hp -= _damge;
            this.InvincibleRTime = Date.now() + this.InvincibleTime * 1000;
            this.isDamaged = true;
            nowScene.cam.shaking(2, 2, 0.35);
            $(".overlay").fadeIn(100).fadeOut(250);
        }
    }
    deadCheck()
    {
        if(this.hp <= 0)
        {
            this.isDelete = true;
            this.leftHand.isDelete = true;
            this.rightHand.isDelete = true;
            this.weapon.isDelete = true;
            this.information.hp.isDelete = true;
        }
    }
    collisionSet()
    {
        if(this.isDamaged == true && (Date.now() > this.InvincibleRTime))
        {
            this.isDamaged = false;
        }

        this.deadCheck();

        if(this.status.notCollision == false)
        {
            for(let i = 0; i < nowScene.collisionList.length; i++)
            {
                if(nowScene.collisionList[i] != this)
                {
                    if(Collision.circle(this, nowScene.collisionList[i]))
                    {
                        this.move.crash = true;
                        let collideAngle = Math.atan2(this.pos.y - nowScene.collisionList[i].pos.y, this.pos.x - nowScene.collisionList[i].pos.x);
                        this.velocity.set(Math.cos(collideAngle), Math.sin(collideAngle));
                        this.velocity.fixSpeed(this.move.speed);
        
                        this.pos.x += this.velocity.x * 1.25 * deltaTime;
                        this.pos.y += this.velocity.y * 1.25 * deltaTime;
                    }
                }
            }
        }

        if(this.pos.x <= nowScene.background.pos.x)
        {
            this.pos.x = nowScene.background.pos.x;
        }
        else if(this.pos.x >= nowScene.background.pos.x + nowScene.background.image.width - this.image.width)
        {
            this.pos.x = nowScene.background.pos.x + nowScene.background.image.width - this.image.width;
        }
        if(this.pos.y <= nowScene.background.pos.y)
        {
            this.pos.y = nowScene.background.pos.y;
        }
        else if(this.pos.y >= nowScene.background.pos.y + nowScene.background.image.height - this.image.height)
        {
            this.pos.y = nowScene.background.pos.y + nowScene.background.image.height - this.image.height;
        }
    }
    showInformation()
    {
        this.information.hp.update();
    }
    isInattackedList(_enemy)
    {
        for(let i = 0; i < this.weapon.attackedList.length; i++)
        {
            if(_enemy == this.weapon.attackedList[i])
            {
                return true;
            }
        }
        for(let i = 0; i < this.activeSkills.length; i++)
        {
            for(let j = 0; j < this.activeSkills[i].attackedList.length; j++)
            {
                if(_enemy == this.activeSkills[i].attackedList[j])
                {
                    return true;
                }
            }
        }
    }
    countKillEnemy()
    {
        for(let i = 0; i < nowScene.enemyList.length; i++)
        {
            if(nowScene.enemyList[i].hp <= 0 && this.isInattackedList(nowScene.enemyList[i]))
            {
                this.killCnt++;
            }
        }
    }
    chargeElect()
    {
        if(Date.now() > this.chargeElectRTime && this.elect < this.maxElect)
        {
            this.elect++;
            this.chargeElectRTime = Date.now() + this.chargeElectTime * 1000;
        }
    }
    update()
    {
        this.statusUpdating();
        this.chargeElect();
        this.moving();
        this.watchingMouse();
        this.collisionSet();
        this.showInformation();
        this.handMove();
        this.weapon.update();
        this.playerAttack();
        this.skillUpdate();
        this.countKillEnemy();
        this.setZ(2);
    }
}

class Enemy extends GameImage
{
    constructor(path, _x, _y, _player)
    {
        super(path, _x, _y, "enemy");

        this.yourPlayer = _player;
        this.velocity = new Vector(0, 0);

        this.maxHp = 10;
        this.hp = this.maxHp;

        this.InvincibleTime = 0.2;
        this.damagedRTime = 0;
        this.isDamaged = false;
        
        this.bodyDamage = 1 + nowScene.gameController.wave / 10;
        this.moveSpeed = 1 + nowScene.gameController.wave / 10;

        this.enemyToPlayerAngle = Math.atan2(this.yourPlayer.pos.y - this.pos.y, this.yourPlayer.pos.x - this.pos.x);

        this.information = {hp : nowScene.addThing(new HpBar("image/EnemyHpBarIn.png", "image/hpBarOut.png", this))};
    }
    damaged(_damage, _angle, _force)
    {
        this.hp -= _damage;

        Util.moveByAngle(this.pos, _angle, _force);
    }
    watchPlayer()
    {
        this.enemyToPlayerAngle = Math.atan2(this.yourPlayer.pos.y - this.pos.y, this.yourPlayer.pos.x - this.pos.x);
        this.rot = this.enemyToPlayerAngle;
    }
    collisionSet()
    {
        if(this.isDamaged == true && Date.now() >= this.damagedRTime)
        {
            this.isDamaged = false;
        }
        if(this.hp <= 0)
        {
            this.isDelete = true;
            this.information.hp.isDelete = true;
        }
        for(let i = 0; i < nowScene.collisionList.length; i++)
        {
            if(nowScene.collisionList[i] != this)
            {
                if(Collision.circle(this, nowScene.collisionList[i]))
                {
                    if(nowScene.collisionList[i].type == "enemy" || nowScene.collisionList[i].type == "object" || nowScene.collisionList[i].type == "player")
                    {
                        if(nowScene.collisionList[i].type == "player")
                        {
                            this.bodyAttack();
                        }
                        let collideAngle = Math.atan2(nowScene.collisionList[i].pos.y - this.pos.y, nowScene.collisionList[i].pos.x - this.pos.x);
                        this.pos.x -= Math.cos(collideAngle);
                        this.pos.y -= Math.sin(collideAngle);
                    }
                }
            }
        }
    }
    bodyAttack()
    {
        this.yourPlayer.damaged(this.bodyDamage);
    }
    attack()
    {

    }
    showInformation()
    {
        this.information.hp.update();
    }
    update()
    {
        this.attack();
        this.collisionSet();
        this.showInformation();
    }
}
class TrackingEnemy extends Enemy
{
    constructor(_x, _y)
    {
        super("image/enemy/trackingEnemy.png", _x, _y, nowScene.player);

        this.maxHp = 55;
        this.hp = this.maxHp;
        
        this.trackOn = true;
    }
    playerTracking()
    {
        let vX = this.yourPlayer.pos.x - this.pos.x;
        let vY = this.yourPlayer.pos.y - this.pos.y;
        this.velocity.set(vX, vY);
        this.velocity.fixSpeed(this.moveSpeed);
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
    }
    attack()
    {
        this.watchPlayer();
        if(this.trackOn == true)
        {
            this.playerTracking();
        }
    }
}
class ShootingEnemy extends Enemy
{
    constructor(_x, _y)
    {
        super("image/enemy/shootingEnemy.png", _x, _y, nowScene.player);

        this.pattern = 1;

        this.range = 400;
        this.attackRange = 600;

        this.bullet = {image : "image/effect/enemyBullet1.png", showTime : 5};

        this.shotRTime = Date.now();
        this.shotSpeed = 2 + nowScene.gameController.wave / 10;
        this.shotDamage = 2 + nowScene.gameController.wave / 10;
        this.shotDelay = 2 - nowScene.gameController.wave / 10;

        this.maxHp = 35;
        this.hp = this.maxHp;
    }
    playerTracking()
    {
        let vX = this.yourPlayer.pos.x - this.pos.x;
        let vY = this.yourPlayer.pos.y - this.pos.y;
        this.velocity.set(vX, vY);
        this.velocity.fixSpeed(this.moveSpeed);
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
    }
    shooting()
    {
        let tempBullet = new Effect(this.bullet.image, 0, 0, this.bullet.showTime, this);
        tempBullet.tempAngle = this.enemyToPlayerAngle;
        nowScene.effectList.push(nowScene.addThing(tempBullet));
        tempBullet.firstSet();
        Util.moveByAngle(tempBullet.pos, tempBullet.rot, tempBullet.image.width / 2);
        tempBullet.move = () =>
        {
            Util.moveByAngle(tempBullet.pos, tempBullet.tempAngle, this.shotSpeed);
        }
        tempBullet.collision = () =>
        {
            if(Collision.circle(tempBullet, this.yourPlayer))
            {
                this.yourPlayer.damaged(this.shotDamage);
            }
        }
        this.shotRTime = Date.now() + this.shotDelay * 1000;
        nowScene.cam.shaking(5, 5, 0.1);
    }
    checkRange()
    {
        if(this.pattern == 1)
        {
            if(Collision.circle(this, this.yourPlayer, this.range, this.yourPlayer.image.width))
            {
                this.pattern = 2;
                this.shotRTime = Date.now() + this.shotDelay * 1000;
            }
        }
        else if(this.pattern == 2)
        {
            if(Collision.circle(this, this.yourPlayer, this.attackRange, this.yourPlayer.image.width) == false)
            {
                this.pattern = 1;
            }
        }
    }
    attack()
    {
        this.watchPlayer();
        if(this.pattern == 1)
        {
            this.playerTracking();
        }
        else if(this.pattern == 2)
        {
            if(Date.now() >= this.shotRTime)
            {
                this.shooting();
            }
        }
        this.checkRange();
    }
}

class Boss extends GameImage // 작업중
{
    constructor(_path, _x, _y)
    {
        super(_path, _x, _y, "boss");

        this.maxHp = 200;
        this.hp = this.maxHp;

        this.information = {hp : nowScene.addThing(new HpBar("image/EnemyHpBarIn.png", "image/hpBarOut.png", this))};
        this.information.hp.isFixed = true;
        this.information.hp.hpBarOut.isFixed = true;
        this.information.hp.setPos(canvas.width / 2 - this.information.hp.image.width / 2, canvas.height - this.information.hp.image.height - 30)
    }
    damaged(_damage)
    {
        this.hp -= _damage;
    }
    showInformation()
    {
        this.information.hp.update();
    }
    updating()
    {

    }
    collisionCheck()
    {

    }
    deadCheck()
    {
        if(this.hp <= 0)
        {
            this.isDelete = true;
            this.information.hp.isDelete = true;
        }
    }
    update()
    {
        this.deadCheck();
        this.collisionCheck();
        this.updating();
        this.showInformation();
    }
}
class Cube extends Boss
{
    constructor()
    {
        super("image/boss/cube.png", nowScene.background.pos.x + nowScene.background.image.width / 2, nowScene.background.pos.y + nowScene.background.image.height / 2 - 500);

        this.pos.x -= this.image.width / 2;

        this.pattern = 1;
        this.shotTime1 = 1;
        this.shotSpeed1 = 2;
        this.actCnt = 0;
        this.shotRTIme = Date.now() + this.shotTime1 * 1000;

        this.shotTime2 = 0.3;
        this.shotSpeed2 = 3;

        this.shotDamage = 5;
    }
    allAngleShot()
    {
        for(let i = 0; i < 8; i++)
        {
            let bullet = nowScene.addThing(new GameImage("image/effect/enemyBullet1.png", Util.getCenter(this, "x"), Util.getCenter(this, "y"), "bullet"));
            bullet.pos.x -= bullet.image.width / 2;
            bullet.pos.y -= bullet.image.height / 2;
            bullet.rot = (i * 45 + this.actCnt * 10) / 180 * Math.PI;
            bullet.showRTime = Date.now() + 3 * 1000;
            bullet.setZ(this.z + 1);
            bullet.update = () =>
            {
                if(Date.now() > bullet.showRTime)
                {
                    bullet.isDelete = true;
                }
                else if(Collision.circle(bullet, nowScene.player) == true)
                {
                    nowScene.player.damaged(this.shotDamage);
                    bullet.isDelete = true;
                }
                Util.moveByAngle(bullet.pos, bullet.rot , this.shotSpeed1);
            }
            nowScene.updateList.push(bullet);
        }
        nowScene.cam.shaking(10, 10, 0.5);
    }
    pointShot()
    {
        let bullet = nowScene.addThing(new GameImage("image/effect/enemyBullet1.png", Util.getCenter(this, "x"), Util.getCenter(this, "y"), "bullet"));
        bullet.pos.x -= bullet.image.width / 2;
        bullet.pos.y -= bullet.image.height / 2;
        bullet.rot = Util.getAngle(this, nowScene.player) / 180 * Math.PI;
        bullet.showRTime = Date.now() + 3 * 1000;
        bullet.setZ(this.z + 1);
        bullet.update = () =>
        {
            if(Date.now() > bullet.showRTime)
            {
                bullet.isDelete = true;
            }
            else if(Collision.circle(bullet, nowScene.player) == true)
                {
                    nowScene.player.damaged(this.shotDamage);
                    bullet.isDelete = true;
                }
            Util.moveByAngle(bullet.pos, bullet.rot , this.shotSpeed2);
        }
        nowScene.updateList.push(bullet);
    }
    updating()
    {
        if(this.pattern == 1)
        {
            if(Date.now() > this.shotRTIme)
            {
                this.allAngleShot();
                this.shotRTIme = Date.now() + this.shotTime1 * 1000;
                this.actCnt++;
            }
            if(this.actCnt == 5)
            {
                this.pattern = 2;
                this.actCnt = 0;
            }
        }
        else if(this.pattern == 2)
        {
            if(Date.now() > this.shotRTIme)
            {
                this.pointShot();
                this.shotRTIme = Date.now() + this.shotTime2 * 1000;
                this.actCnt++;
            }
            if(this.actCnt == 20)
            {
                this.pattern = 1;
                this.actCnt = 0;
                this.shotRTIme = Date.now() + this.shotTime1 * 1000;
            }
        }

    }
}

class monsterMaker
{
    constructor(_x, _y)
    {
        this.pos = {x : _x, y : _y};

        this.spawnRTime = 0;
        this.spawnDelay = 1;
        this.spawnCount = 0;
        this.spawnMax = 0;
        this.spawnMonsterType = "TrackingEnemy";
        this.startSpawn = false;

        nowScene.updateList.push(this);
    }
    makeEnemy(_type, _pos)
    {
        switch(_type)
        {
            case "TrackingEnemy" : nowScene.addThing(new TrackingEnemy(_pos.x, _pos.y)); break;
            case "ShootingEnemy" : nowScene.addThing(new ShootingEnemy(_pos.x, _pos.y)); break;

            case "Cube" : nowScene.addThing(new Cube()); break;
        }
    }
    spawnMonsters()
    {
        if(Date.now() >= this.spawnRTime)
        {
            this.makeEnemy(this.spawnMonsterType, this.pos);
            this.spawnCount++;
            this.spawnRTime = Date.now() + this.spawnDelay * 1000;
        }
    }
    spawnFinish()
    {
        return (this.spawnCount >= this.spawnMax);
    }
    setWaveStart(_type, _max, _delay, _firstD)
    {
        this.spawnMonsterType = _type;
        this.spawnMax = _max;
        this.spawnDelay = _delay;
        this.spawnRTime = Date.now() + _firstD * 1000;
    }
    collisionCheck()
    {
        for(let i = 0; i < nowScene.collisionList.length; i++)
        {
            if(nowScene.collisionList[i] != this)
            {
                if(nowScene.collisionList[i].pos.x <= this.pos.x)
                {
                    nowScene.collisionList[i].pos.x = this.pos.x;
                }
                else if(nowScene.collisionList[i].pos.x >= this.pos.x + this.image.width - nowScene.collisionList[i].image.width)
                {
                    nowScene.collisionList[i].pos.x = this.pos.x + this.image.width - nowScene.collisionList[i].image.width;
                }
                if(nowScene.collisionList[i].pos.y <= this.pos.y)
                {
                    nowScene.collisionList[i].pos.y = this.pos.y;
                }
                else if(nowScene.collisionList[i].pos.y >= this.pos.y + this.image.height - nowScene.collisionList[i].image.height)
                {
                    nowScene.collisionList[i].pos.y = this.pos.y + this.image.height - nowScene.collisionList[i].image.height;
                }
            }
        }
    }
    update()
    {
        if(this.spawnCount < this.spawnMax && this.startSpawn == true)
        {
            this.spawnMonsters();
        }
    }
}

var JobWarrior =
{
    setPlayerHand : (player) =>
    {
        player.path = "image/player/Warrior/player.png";
        player.setImage();

        player.leftHand = nowScene.addThing(new PlayerHand("image/player/playerHand.png", player, 42, 42));
        player.rightHand = nowScene.addThing(new PlayerHand("image/player/playerHand.png", player, 42, 42));
        player.handMove = () =>
        {
            player.leftHand.pos = {x : Util.getCenter(player, "x"), y : Util.getCenter(player, "y")};
            player.rightHand.pos = {x : Util.getCenter(player, "x"), y : Util.getCenter(player, "y")};
            player.leftHand.setCenter();
            player.rightHand.setCenter();

            Util.moveByAngle(player.leftHand.pos, player.rot, player.leftHand.playerToThis1);
            let leftHandAngle = player.rot * 180 / Math.PI - (player.rot < -90 ? (-270) : (90));
            Util.moveByAngle(player.leftHand.pos, leftHandAngle / 180 * Math.PI, player.leftHand.playerToThis2);
            player.leftHand.setZ(4);

            Util.moveByAngle(player.rightHand.pos, player.rot, player.rightHand.playerToThis1);
            let rightHandAngle = player.rot * 180 / Math.PI - (player.rot > 90 ? (270) : (-90));
            Util.moveByAngle(player.rightHand.pos, rightHandAngle / 180 * Math.PI, player.rightHand.playerToThis2);
            player.rightHand.setZ(4);
        }
    },
    setAttackHandPoint : (player) =>
    {
        player.leftHand.setAttackPoint(1, 12);
        player.leftHand.setAttackPoint(2, 55);
        player.rightHand.setAttackPoint(1, 60);
        player.rightHand.setAttackPoint(2, -30);
    },
    setPlayerAttackMotion : (player) =>
    {
        player.basicAttack = () =>
        {
            if(player.weapon.attackPattern == 1)
            {
                if(player.attack.click == true)
                {
                    player.weapon.attackCheck();
                    let tempEffect = nowScene.addThing(new Effect(player.weapon.attackEffect.src, 0, 0, player.weapon.attackEffect.showTime, player));
                    tempEffect.firstSet();
                    Util.moveByAngle(tempEffect.pos, player.rot, player.weapon.attackLength);
                    nowScene.effectList.push(tempEffect);
    
                    player.leftHand.playerToThis1 -= player.leftHand.attackPoint1;
                    player.leftHand.playerToThis2 -= player.leftHand.attackPoint2;
    
                    player.rightHand.playerToThis1 -= player.rightHand.attackPoint1;
                    player.rightHand.playerToThis2 -= player.rightHand.attackPoint2;
    
                    player.weapon.angle = player.weapon.attackAngle;
    
                    player.attack.click = false;
                    nowScene.cam.shaking(10, 10, 0.1);
                }
                if(Date.now() >= player.weapon.attackRTime + player.weapon.attackTime * 1000)
                {
                    player.weapon.attackRTime = Date.now() + (player.weapon.attackTime / 2) * 1000;
                    player.weapon.attackPattern++;
                    player.attack.canAttack = true;

                    player.weapon.attackedList.length = 0;
                    player.setPlayerTemp();
                }
            }
            else if(player.weapon.attackPattern == 2)
            {
                if(player.playerHandSlowBasic(player.weapon.attackTime / 2, player.weapon.attackRTime) == true)
                {
                    player.attack.attacking = false;
                };
            }
        }
    },
    setStat : (player) =>
    {
        player.basicDamage = 9;
        player.skillDamage = player.basicDamage;

        player.maxHp = 10;
        player.hp = player.maxHp;

        player.maxElect = 6;
        player.elect = player.maxElect;
    },
    setWeapon : (player) =>
    {
        player.weapon = nowScene.addThing(new Weapon("image/weapon/sword.png", player.rightHand.pos.x, player.rightHand.pos.y, 120, -90, 0.2, player));
        player.weapon.damage = player.basicDamage;
        player.weapon.attackEffect = {src : "image/effect/swordEffect.png", showTime : 0.3};    
        player.weapon.attackLength = player.image.width / 2 + player.weapon.image.width + 50;
        player.weapon.setAnchor((-player.weapon.image.width / 2 + player.rightHand.image.width / 2), (-player.weapon.image.height / 2 + player.rightHand.image.height / 2));
        player.weapon.updating = () =>
        {
            if(player.watchMouse == true)
            {
                player.weapon.rot =  player.rot + player.weapon.angle / 180 * Math.PI;
            }
            player.weapon.pos = player.rightHand.pos;
            Util.moveByAngle(player.weapon.pos, player.playerToMouseAngle, (player.weapon.image.height - player.rightHand.image.height) / 2);
            player.weapon.setZ(3);
        }
    },
    setAttackRange : (player) =>
    {
        player.weapon.isInRange = (obj) =>
        {
            return (Collision.circle(player, obj, player.weapon.attackLength, obj.image.width / 2));
        }
        player.weapon.isInAngle = (obj) =>
        {
            let basicPlayerRot = Util.getAngleBasic(player.rot * 180 / Math.PI);
            let playerToEnemy = Util.getAngleBasic(Util.getAngle(player, obj));
    
            if((basicPlayerRot < -player.weapon.attackAngle / 2) && playerToEnemy > (360 + player.weapon.attackAngle / 2))
            {
                basicPlayerRot += 360;
            }
            else if((basicPlayerRot > 360 + player.weapon.attackAngle / 2) && playerToEnemy < -player.weapon.attackAngle / 2)
            {
                basicPlayerRot -= 360;
            }
    
            let minusAngle = (basicPlayerRot + player.weapon.attackAngle / 2);
            let plusAngle = (basicPlayerRot - player.weapon.attackAngle / 2);
            
            return (playerToEnemy >= minusAngle && playerToEnemy <= plusAngle);
        }
    },
    setSkills : (player) => 
    {
        for(let i = 0; i < nowScene.selectedInfo.player.skill.passive.length; i++)
        {
            let passiveSkill;
            switch(nowScene.selectedInfo.player.skill.passive[i])
            {
                case "attackDamageUp" : passiveSkill = new attackDamageUp(player); break;
                case "healthUp" : passiveSkill = new healthUp(player); break;
                case "blooddrain" : passiveSkill = new blooddrain(player); break;
                case "attackSpeedUp" : passiveSkill = new attackSpeedUp(player, 20); break;
                case "attackRangeUp" : passiveSkill = new attackRangeUp(player); break;
                case "MOD:Berserker" : passiveSkill = new MODBerserker(player); break;
            }
            player.passiveSkills.push(passiveSkill);
        }
        
        for(let i = 0; i < nowScene.selectedInfo.player.skill.active.length; i+=2)
        {
            let activeSkill;
            switch(nowScene.selectedInfo.player.skill.active[i])
            {
                case "SwordShot" : activeSkill = new SwordShot(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
                case "SwiftStrike" : activeSkill = new SwiftStrike(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
                case "SpinShot" : activeSkill = new SpinShot(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
                case "WheelWind" : activeSkill = new WheelWind(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
            }
            player.activeSkills.push(activeSkill);
        }
    }
}
var JobLancer =
{
    setPlayerHand : (player) =>
    {
        player.path = "image/player/Lancer/player.png";
        player.setImage();

        player.leftHand = nowScene.addThing(new PlayerHand( "image/player/playerHand.png", player, 42, 42));
        player.rightHand = nowScene.addThing(new PlayerHand( "image/player/playerHand.png", player, 42, 42));
        player.handMove = () =>
        {
            player.leftHand.pos = {x : Util.getCenter(player, "x") - player.leftHand.image.width / 2, y : Util.getCenter(player, "y") - player.leftHand.image.height / 2};
            player.rightHand.pos = {x : Util.getCenter(player, "x") - player.rightHand.image.width / 2, y : Util.getCenter(player, "y") - player.rightHand.image.height / 2};

            Util.moveByAngle(player.leftHand.pos, player.rot, player.leftHand.playerToThis1);
            let leftHandAngle = player.rot * 180 / Math.PI - (player.rot < -90 ? (-270) : (90));
            Util.moveByAngle(player.leftHand.pos, leftHandAngle / 180 * Math.PI, player.leftHand.playerToThis2);
            player.leftHand.setZ(4);

            Util.moveByAngle(player.rightHand.pos, player.rot, player.rightHand.playerToThis1);
            let rightHandAngle = player.rot * 180 / Math.PI - (player.rot > 90 ? (270) : (-90));
            Util.moveByAngle(player.rightHand.pos, rightHandAngle / 180 * Math.PI, player.rightHand.playerToThis2);
            player.rightHand.setZ(4);
        }
    },
    setAttackHandPoint : (player) =>
    {
        player.leftHand.setAttackPoint(1, 8);
        player.leftHand.setAttackPoint(2, 45);
        player.rightHand.setAttackPoint(1, 150);
        player.rightHand.setAttackPoint(2, 10);
    },
    setPlayerAttackMotion : (player) =>
    {
        player.basicAttack = () =>
        {
            if(player.weapon.attackPattern == 1)
            {
                if(player.attack.click == true)
                {
                    player.weapon.attackCheck();

                    player.leftHand.playerToThis1 -= player.leftHand.attackPoint1;
                    player.leftHand.playerToThis2 -= player.leftHand.attackPoint2;

                    player.rightHand.playerToThis1 -= player.rightHand.attackPoint1;
                    player.rightHand.playerToThis2 -= player.rightHand.attackPoint2;

                    player.weapon.attackRTime = Date.now();

                    player.attack.click = false;
                    nowScene.cam.shaking(7, 7, 0.1);
                }
                else if(Date.now() > player.weapon.attackRTime)
                {
                    player.weapon.attackRTime = Date.now() + (0.5 / 2) * 1000;
                    player.weapon.attackPattern++;
                    player.attack.canAttack = true;

                    player.weapon.attackedList.length = 0;
                    player.setPlayerTemp();
                }
            }
            else if(player.weapon.attackPattern == 2)
            {
                if(player.playerHandSlowBasic(0.5 / 2, player.weapon.attackRTime) == true)
                {
                    player.attack.attacking = false;
                }
            }
        }
    },
    setStat : (player) =>
    {
        player.basicDamage = 15;
        player.skillDamage = player.basicDamage;

        player.maxHp = 6;
        player.hp = player.maxHp;

        player.maxElect = 4;
        player.elect = player.maxElect;
    },
    setWeapon : (player) =>
    {
        player.weapon = nowScene.addThing(new Weapon("image/weapon/spear.png", Util.getCenter(player.rightHand, "x"), Util.getCenter(player.rightHand, "y"), -10, 0, 0, player));
        player.weapon.damage = player.basicDamage;
        player.weapon.setAnchor((player.rightHand.pos.x - Util.getCenter(player, "x")), 0);

        player.weapon.collisionRect = {pos : {x : Util.getCenter(player, "x"), y : Util.getCenter(player, "y")}, rot : 0, image : {width : 300, height : 50}};
        player.weapon.collisionRect.pos.x -= player.weapon.collisionRect.image.width / 2;
        player.weapon.collisionRect.pos.y -= player.weapon.collisionRect.image.height / 2;
        Util.moveByAngle(player.weapon.pos, player.rot, player.weapon.image.width / 2);

        player.weapon.updating = () =>
        {
            if(player.watchMouse == true)
            {
                player.weapon.rot =  player.rot + player.weapon.angle / 180 * Math.PI;
            }
            player.weapon.pos.x = player.rightHand.pos.x - player.weapon.image.width / 5;
            player.weapon.pos.y = player.rightHand.pos.y + player.weapon.image.height / 3;
            player.weapon.setZ(3);

            player.weapon.collisionRect.pos = {x : Util.getCenter(player, "x") - player.weapon.collisionRect.image.width / 2, y : Util.getCenter(player, "y") - player.weapon.collisionRect.image.height / 2};
            player.weapon.collisionRect.rot = player.rot;
            Util.moveByAngle(player.weapon.collisionRect.pos, player.rot, player.weapon.collisionRect.image.width / 2);
        }
    },
    setAttackRange : (player) =>
    {
        player.weapon.isInRange = (obj) =>
        {
            return (Collision.circleToRotatedRect(obj, player.weapon.collisionRect));
        }
        player.weapon.isInAngle = (obj) =>
        {
            return true;
        }
    },
    setSkills : (player) =>
    {
        for(let i = 0; i < nowScene.selectedInfo.player.skill.passive.length; i++)
        {
            let passiveSkill;
            switch(nowScene.selectedInfo.player.skill.passive[i])
            {
                case "attackDamageUp" : passiveSkill = new attackDamageUp(player); break;
                case "attackSpeedUp" : passiveSkill = new attackSpeedUp(player, 40); break;
                case "backDashAttack" : passiveSkill = new backDashAttack(player); break;
                case "MOD:Destroyer" : passiveSkill = new MODDestroyer(player); break;
            }
            player.passiveSkills.push(passiveSkill);
        }
        
        for(let i = 0; i < nowScene.selectedInfo.player.skill.active.length; i+=2)
        {
            let activeSkill;
            switch(nowScene.selectedInfo.player.skill.active[i])
            {
                case "Swing" : activeSkill = new Swing(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
                case "Bu-Wang" : activeSkill = new BuWang(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
                case "ContinuousAttack" : activeSkill = new ContinuousAttack(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
            }
            player.activeSkills.push(activeSkill);
        }
    }
}
var JobSummoner =
{
    setPlayerHand : (player) =>
    {
        player.path = "image/player/Summoner/player.png";
        player.setImage();

        player.leftHand = nowScene.addThing(new PlayerHand( "image/player/playerHand.png", player, 42, 42));
        player.rightHand = nowScene.addThing(new PlayerHand( "image/player/playerHand.png", player, 42, 42));
        player.handMove = () =>
        {
            player.leftHand.pos = {x : Util.getCenter(player, "x") - player.leftHand.image.width / 2, y : Util.getCenter(player, "y") - player.leftHand.image.height / 2};
            player.rightHand.pos = {x : Util.getCenter(player, "x") - player.rightHand.image.width / 2, y : Util.getCenter(player, "y") - player.rightHand.image.height / 2};

            Util.moveByAngle(player.leftHand.pos, player.rot, player.leftHand.playerToThis1);
            let leftHandAngle = player.rot * 180 / Math.PI - (player.rot < -90 ? (-270) : (90));
            Util.moveByAngle(player.leftHand.pos, leftHandAngle / 180 * Math.PI, player.leftHand.playerToThis2);
            player.leftHand.setZ(4);

            Util.moveByAngle(player.rightHand.pos, player.rot, player.rightHand.playerToThis1);
            let rightHandAngle = player.rot * 180 / Math.PI - (player.rot > 90 ? (270) : (-90));
            Util.moveByAngle(player.rightHand.pos, rightHandAngle / 180 * Math.PI, player.rightHand.playerToThis2);
            player.rightHand.setZ(4);
        }
    },
    setAttackHandPoint : (player) =>
    {
        player.leftHand.setAttackPoint(1, 15);
        player.leftHand.setAttackPoint(2, 70);
        player.rightHand.setAttackPoint(1, 100);
        player.rightHand.setAttackPoint(2, 20);
    },
    setPlayerAttackMotion : (player) =>
    {
        player.playerAttack = () =>
        {
            if(mouseValue["Left"] == 2 && player.attack.canAttack == true && player.attack.attacking == false && Date.now() > nowScene.startRTime)
            {
                player.playerHandsBasic();
                player.attack.attacking = true;
                player.attack.canAttack = false;
                player.attack.click = true;
                player.weapon.attackRTime = Date.now();
            }
            if(player.attack.attacking == true)
            {
                player.basicAttack();
            }
        }

        player.basicAttack = () =>
        {
            if(player.weapon.attackPattern == 1)
            {
                if(player.attack.click == true)
                {
                    player.leftHand.playerToThis1 -= player.leftHand.attackPoint1;
                    player.leftHand.playerToThis2 -= player.leftHand.attackPoint2;

                    player.rightHand.playerToThis1 -= player.rightHand.attackPoint1;
                    player.rightHand.playerToThis2 -= player.rightHand.attackPoint2;

                    player.weapon.attackRTime = Date.now() + 0.25 * 1000;

                    player.weapon.attack();

                    player.attack.click = false;
                    nowScene.cam.shaking(3, 3, 0.1);
                }
                else if(Date.now() >= player.weapon.attackRTime)
                {
                    player.weapon.attackRTime = Date.now() + player.weapon.attackTime * 1000;
                    player.weapon.attackPattern++;
                    player.attack.canAttack = true;
                    player.weapon.shooters.forEach(shooter => shooter.weapon.watchMouse = true);

                    player.setPlayerTemp();
                }
            }
            else if(player.weapon.attackPattern == 2)
            {
                if(player.playerHandSlowBasic(player.weapon.attackTime, player.weapon.attackRTime) == true)
                {
                    player.attack.attacking = false;
                }
            }
        }
    },
    setStat : (player) =>
    {
        player.basicDamage = 18;
        player.skillDamage = player.basicDamage;

        player.maxHp = 4;
        player.hp = player.maxHp;

        player.maxElect = 8;
        player.elect = player.maxElect;
    },
    setWeapon : (player) =>
    {
        player.weapon = nowScene.addThing(new Weapon("image/weapon/shooter-body.png", Util.getCenter(player, "x"), Util.getCenter(player, "y"), -10, 0, 1, player));
        player.weapon.setCenter();
        player.weapon.opacity = 0;

        player.weapon.damage = player.basicDamage;
        player.weapon.knockbackDistance = 5;
        player.weapon.distanceToPlayer = player.image.width / 2 + player.weapon.image.width + 30;
        player.weapon.shotSpeed = 10;
        player.weapon.range = 300;
        player.weapon.shooterCnt = 0;

        player.weapon.shooters = [];

        player.weapon.addShooter = (_num) =>
        {
            player.weapon.shooterCnt += _num;
            for(let i = 0; i < _num; i++)
            {
                let shooter = nowScene.addThing(new GameImage("image/weapon/shooter-body.png", Util.getCenter(player, "x"), Util.getCenter(player, "y"), "shooter-body"));
                shooter.moveAngle =  i * (360 / (_num - 1));
                shooter.rotateSpeed = 0.3;
                shooter.attackedList = [];
                shooter.setCenter();
                shooter.setZ(player.rightHand.z + 1);
                
                shooter.isAttackedList = (_index) =>
                {
                    for(let i = 0; i < shooter.attackedList.length; i++)
                    {
                        if(nowScene.enemyList[_index] == shooter.attackedList[i])
                        {
                            return true;
                        }
                    }
                    return false;
                }

                shooter.attack = () =>
                {
                    let bullet = nowScene.addThing(new Effect("image/weapon/basicBullet.png", Util.getCenter(shooter.weapon, "x"), Util.getCenter(shooter.weapon, "y"), 0.2, shooter.weapon));
                    bullet.tempAngle = shooter.weapon.rot;
                    bullet.firstSet();
                    Util.moveByAngle(bullet.pos, bullet.tempAngle, bullet.image.width / 2);

                    bullet.tempPos = {x : bullet.pos.x, y : bullet.pos.y};

                    bullet.basicSet = () =>
                    {
                        if(bullet.effectOn == false)
                        {
                            bullet.tempPos = {x : bullet.pos.x, y : bullet.pos.y};
                            bullet.effectOn = true;
                        }
                        if(Util.getDistance(bullet.pos.x, bullet.pos.y, bullet.tempPos.x, bullet.tempPos.y) >= player.weapon.range * 8 / 10)
                        {
                            bullet.opacity -= 1 * (player.weapon.range * 2 / 10) / player.weapon.shotSpeed;
                        }
                        if(bullet.opacity <= 0)
                        {
                            bullet.isDelete = true;
                            shooter.attackedList.length = 0;
                        }
                    }

                    bullet.move = () =>
                    {
                        Util.moveByAngle(bullet.pos, bullet.tempAngle, player.weapon.shotSpeed);
                    }
                    bullet.collision = () =>
                    {
                        for(let j = 0; j < nowScene.enemyList.length; j++)
                        {
                            if(Collision.circleToRotatedRect(nowScene.enemyList[j], bullet) == true && !shooter.isAttackedList(j))
                            {
                                nowScene.enemyList[j].damaged(player.weapon.damage, Util.getAngle(bullet, nowScene.enemyList[j]) * 180 / Math.PI, player.weapon.knockbackDistance);
                                if(shooter.weapon.penetration == false)
                                {
                                    bullet.isDelete = true;
                                }
                                shooter.attackedList.push(nowScene.enemyList[j]);
                                if(nowScene.enemyList[j].hp <= 0 && shooter.isAttackedList(i))
                                {
                                    nowScene.enemyList[j].isDelete = true;
                                    nowScene.delete(shooter.attackedList);
                                    player.killCnt++;
                                }
                                nowScene.cam.shaking(5, 5, 0.1);
                            }
                        }
                    }
                    bullet.setZ(shooter.z + 1);

                    shooter.weapon.watchMouse = false;
                }

                shooter.weapon = nowScene.addThing(new GameImage("image/weapon/shooter-weapon.png", Util.getCenter(shooter, "x"), Util.getCenter(shooter, "y"), "shooter-weapon"));
                shooter.weapon.setCenter();
                shooter.weapon.penetration = false;
                shooter.weapon.attacking = false;
                shooter.weapon.watchMouse = true;

                shooter.weapon.update = () =>
                {
                    shooter.weapon.pos = {x : Util.getCenter(shooter, "x"), y : Util.getCenter(shooter, "y")};
                    if(shooter.weapon.watchMouse == true)
                    {
                        shooter.weapon.rot = Math.atan2(Util.getCenter(nowScene.cursor, "y") - Util.getCenter(shooter.weapon, "y") + nowScene.cam.pos.y, Util.getCenter(nowScene.cursor, "x") - Util.getCenter(shooter.weapon, "x") + nowScene.cam.pos.x);
                    }
                    shooter.weapon.setCenter();
                    shooter.weapon.setZ(shooter.z + 1);
                }

                shooter.weapon.setZ(shooter.z + 1);

                shooter.update = () =>
                {
                    shooter.pos = {x : Util.getCenter(player, "x"), y : Util.getCenter(player, "y")};
                    shooter.rot = player.rot;
                    shooter.moveAngle += shooter.rotateSpeed / 180 * Math.PI;
                    shooter.moveAngle = (shooter.moveAngle * 180 / Math.PI > 360 ? (shooter.moveAngle * 180 / Math.PI - 360) / 180 * Math.PI : shooter.moveAngle);

                    shooter.setCenter();
                    Util.moveByAngle(shooter.pos, shooter.moveAngle, player.weapon.distanceToPlayer);
                    shooter.setZ(player.rightHand.z + 1);
                    shooter.weapon.update();
                }
                nowScene.updateList.push(shooter);
                player.weapon.shooters.push(shooter);
            }
            for(let i = 0; i < player.weapon.shooterCnt; i++)
            {
                player.weapon.shooters[i].moveAngle = (i * (360 / (player.weapon.shooterCnt))) / 180 * Math.PI;
            }
        }
        player.weapon.attack = () =>
        {
            player.weapon.shooters.forEach(shooter => shooter.attack());
        }

        player.weapon.addShooter(3);

        player.weapon.updating = () =>
        {
            if(player.watchMouse == true)
            {
                player.weapon.rot =  player.rot + player.weapon.angle / 180 * Math.PI;
            }
            player.weapon.pos.x = player.rightHand.pos.x - player.weapon.image.width / 5;
            player.weapon.pos.y = player.rightHand.pos.y + player.weapon.image.height / 3;
            player.weapon.setZ(3);
        }
    },
    setAttackRange : (player) =>
    {
        player.weapon.attackCheck = () =>
        {
            player.attackAbility();
        }
    },
    setSkills : (player) =>
    {
        for(let i = 0; i < nowScene.selectedInfo.player.skill.passive.length; i++)
        {
            let passiveSkill;
            switch(nowScene.selectedInfo.player.skill.passive[i])
            {
                case "chargeElectSpeedUp" : passiveSkill = new chargeElectSpeedUp(player); break;
                case "shotSpeedUp" : passiveSkill = new shotSpeedUp(player); break;
                case "attackRangeUp" : passiveSkill = new attackRangeUp_Summoner(player); break;
                case "skillDamageUp" : passiveSkill = new skillDamageUp(player); break;
                case "addShooter" : passiveSkill = new addShooter(player); break;
                case "penetrationAttack" : passiveSkill = new penetrationAttack(player); break;
            }
            player.passiveSkills.push(passiveSkill);
        }
        
        for(let i = 0; i < nowScene.selectedInfo.player.skill.active.length; i+=2)
        {
            let activeSkill;
            switch(nowScene.selectedInfo.player.skill.active[i])
            {
                case "LaserAttack" : activeSkill = new LaserAttack(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
                case "AttackSpeedBuff" : activeSkill = new AttackSpeedBuff(player, nowScene.selectedInfo.player.skill.active[i + 1]); break;
            }
            player.activeSkills.push(activeSkill);
        }
    }
}

var setJob = (player) =>
{
    switch(player.job)
    {
        case "Warrior" : player.job = JobWarrior; break;
        case "Lancer" : player.job = JobLancer; break;
        case "Summoner" : player.job = JobSummoner; break;
    }
}

var addOtherPlayer = () =>
{

}


// server function

// function fetchData() {
//     $.post(
//         "proxy.php",
//         {
//             do: "fetchData",
//             uId: Cookies.get("uId")
//         },
//         function(response) {
//             console.log(response);
//             console.log(response["playerPosX"]);
//         }
//     );
// }

gameScene.init = function()
{
    this.collisionList = [];
    this.enemyList = [];
    this.effectList = [];
    this.otherPlayerList = [];
    
    this.background = nowScene.addThing(new GameImage("image/background/ingame.png", 0, 0, "background"));
    this.background.setCanvasCenter();

    this.player = nowScene.addThing(new Player("image/player/Warrior/player.png", 700, 400, this.selectedInfo.player.job));
    
    this.gameController = new GameController();
    
    this.cam = new Camera(this.player);
    this.cursor = nowScene.addThing(new MousePoint( "image/cursor.png", mouseX, mouseY));

    this.startRTime = Date.now() + 0.5 * 1000;
}
gameScene.update = function()
{
    this.updateList.forEach(obj => obj.update());
    this.delete(this.updateList);

    this.effectList.forEach(effect => effect.update());
    this.gameController.update();
    this.cam.update();
    
    this.delete(this.collisionList);
    this.delete(this.enemyList);
    this.delete(this.effectList);
}