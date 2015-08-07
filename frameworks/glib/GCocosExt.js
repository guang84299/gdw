/**
 * Created by YanChunGuang on 2015/8/2.
 * 对cocos原来的类进行扩展
 */

//node
cc.Node = cc.Node || {};
cc.Node.prototype.drawDebug = function()
{
    if(!this._draw)
    {
        var draw = this._draw = new cc.DrawNode();

        var size = this.getContentSize();
        var rec = [
            cc.p(0,0), cc.p(size.width, 0), cc.p(size.width,size.height), cc.p(0,size.height)
        ];
        var rand = parseInt(cc.rand()%3);
        var r = 0,g= 0,b=0;
        if(rand == 0)r = 255;
        else  if(rand == 1)g = 255;
        else b = 255;
        draw.drawPoly(rec, cc.color(0,0,0,0),2, cc.color(r,g,b,255) );
        this.addChild(draw);
    }
};

cc.Node.prototype.w = function()
{
    return this.getContentSize().width;
};

cc.Node.prototype.h = function()
{
    return this.getContentSize().height;
};

cc.Node.prototype.center = function()
{
    return cc.p(this.w()/2,this.h()/2);
};

cc.Node.prototype.centerX = function()
{
    return this.w()/2;
};

cc.Node.prototype.centerY = function()
{
    return this.h()/2;
};

function encodeUTF8(str){
    var temp = "",rs = "";
    for( var i=0 , len = str.length; i < len; i++ ){
        temp = str.charCodeAt(i).toString(16);
        rs  += "\\u"+ new Array(5-temp.length).join("0") + temp;
    }
    return rs;
}

function decodeUTF8(str){
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function($0,$1,$2){
        return String.fromCharCode(parseInt($2,16));
    });
}

var _T = function(text)
{
   return decodeUTF8(encodeUTF8(text));
};

var sprintf = function(text)
{
    var arr = arguments;
    for(var i=1;i<arr.length;i++)
    {
        var a = arr[i];
        if(cc.isNumber(a))
        {
            text = text.replace(/%d/,a);
        }
        else if(cc.isString(a))
        {
            text = text.replace(/%s/,a);
        }
    }
   return text;
};

//cc.Sprite.prototype.{name:font,size=12,}
