var gameoverScene = new Scene();

gameoverScene.init = function()
{
    preloadImage("image/cursor.png");
    
    this.reStartButton = nowScene.addImage(new Button("image/player/playerHand.png", canvas.width / 2, canvas.height / 2 + 200));
    this.reStartButton.clickEventSet(function()
    {
        startScene.start();
    });

    this.cursor = nowScene.addImage(new MousePoint("image/cursor.png", mouseX, mouseY));
    this.cam = new Camera();
}
gameoverScene.update = function()
{
    for(let i = 0; i < this.updateList.length; i++)
    {
        this.updateList[i].update();
    }
    this.reStartButton.update();
}