/**
 * Created by YanChunGuang on 2015/8/4.
 *
 * <font  color=#ff34ff size=10 face='aranl' opacity=100>aaaa</font>
 * <img  opacity=200 size=32  src='res/CloseNormal.png' color=#0000ff/>
 * <br/>
 */

var GRichElement = cc.Class.extend({
    _type: 0,
    _color: null,
    _opacity:0,
    _text: "",
    _fontName: "",
    _fontSize: 0,
    _filePath: "",
    ctor: function (type,color, opacity) {
        this._type = type ? type : 0;
        this._color = color ? color : cc.color(255, 255, 255, 255);
        this._opacity = opacity ? opacity : 255;
        this._fontSize = 22;
    }
});

GRichElement.TYPE = {
    TEXT : 0,
    IMAGE : 1,
    BR : 2,
    NONE : 3
};

var GText = cc.Node.extend({
    _formatTextDirty: false,
    _richElements: null,
    _elementRenders: null,
    _leftSpaceWidth: 0,
    _verticalSpace: 0,
    _elementRenderersContainer: null,
    _textHorizontalAlignment: null,
    _textVerticalAlignment: null,
    ctor : function()
    {
        cc.Node.prototype.ctor.call(this);
        this._formatTextDirty = false;
        this._richElements = [];
        this._elementRenders = [];
        this._leftSpaceWidth = 0;
        this._verticalSpace = 0;
        this._textHorizontalAlignment = cc.TEXT_ALIGNMENT_LEFT;
        this._textVerticalAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this.initRenderer();
    },

    initRenderer: function () {
        this._elementRenderersContainer = new cc.Node();
        this._elementRenderersContainer.setAnchorPoint(0, 0);
        this.addChild(this._elementRenderersContainer, 0, -1);
        this.setAnchorPoint(0, 0);
    },

    setRichText : function(text)
    {
        this._text = text;
        this._parse();
        this._formatTextDirty = true;
        this.adaptRenderers();
    },

    insertElement: function (text, index) {
        this._text = text;
        this._parse();
        var ele = this._richElements.pop();
        this._richElements.splice(index, 0, ele);
        this._formatTextDirty = true;
        this.adaptRenderers();
    },

    pushBackElement: function (text,color,size) {
        this._text = text;
        if(this._getFistElementType() == GRichElement.TYPE.NONE)//���ı�
        {
            var ele = new GRichElement(GRichElement.TYPE.TEXT,color,null);
            ele._text = text;
            ele._fontSize = size ? size : ele._fontSize;
            this._richElements.push(ele);
        }
        else
            this._parse();
        this._formatTextDirty = true;
        this.adaptRenderers();
    },

    removeElement: function (index) {
        if (cc.isNumber(index))
            this._richElements.splice(index, 1);
        else
        return;
        this._formatTextDirty = true;
        this.adaptRenderers();
    },

    //<font  color=#ff34ff size=10 face='aranl' opacity=100>aaaa</font>
    //<img  opacity=200 size=32  src='res/CloseNormal.png' color=#0000ff/>
    //<br/>
    _parse : function()
    {
        var type = this._getFistElementType();

        switch(type)
        {
            case GRichElement.TYPE.TEXT:
                var font = this._text.match(/<font[\s]+[^>]*>([^<>]*)<\/font>/);
                var text = font[1];
                var size = font[0].match(/.+size[\s]*=[\s]*(\d+)[\s]*/); size = size ? size[1] : null;
                var opacity = font[0].match(/.+opacity[\s]*=[\s]*(\d+)[\s]*/); opacity = opacity ? opacity[1] : null;
                var color = font[0].match(/.+color[\s]*=[\s]*([^>\s]+)[\s]*/); color = color ? color[1] : null;
                var face = font[0].match(/.+face[\s]*=[\s]*([^>\s]+)[\s]*/); face = face ? face[1].replace(/'/g,"") : null;

                var ele = new GRichElement(type,cc.hexToColor(color),opacity);
                ele._text = text;
                ele._fontName = face;
                ele._fontSize = size;
                this._richElements.push(ele);

                this._text = this._text.replace(/<font[\s]+[^>]*>[^<>]*<\/font>/,"");
                break;
            case GRichElement.TYPE.IMAGE:
                var image = this._text.match(/<img[\s]+[^>]*\/>/);
                var opacity = image[0].match(/.+opacity[\s]*=[\s]*(\d+)[\s]*/); opacity = opacity ? opacity[1] : null;
                var color = image[0].match(/.+color[\s]*=[\s]*([^\/>\s]+)[\s]*/); color = color ? color[1] : null;
                var filepath = image[0].match(/.+src[\s]*=[\s]*'([^'\s]+)[\s]*/); filepath = filepath ? filepath[1] : null;

                var ele = new GRichElement(type,cc.hexToColor(color),opacity);
                ele._filePath = filepath;
                this._richElements.push(ele);

                this._text = this._text.replace(/<img[\s]+[^>]*\/>/,"");
                break;
            case GRichElement.TYPE.BR:
                var ele = new GRichElement(type,null,null);
                this._richElements.push(ele);
                this._text = this._text.replace(/<br\/>/,"");
                break;
        }
        if(type !=  GRichElement.TYPE.NONE)
            this._parse();
    },

    _getFistElementType : function()
    {
        if(this._text.length == 0)
            return GRichElement.TYPE.NONE;
        if(this._text.match(/^<font/))
            return GRichElement.TYPE.TEXT;
        else if(this._text.match(/^<img/))
            return GRichElement.TYPE.IMAGE;
        else if(this._text.match(/^<br/))
            return GRichElement.TYPE.BR;
        else return GRichElement.TYPE.NONE;
    },

    formatText : function()
    {
        if (this._formatTextDirty) {
            this._elementRenderersContainer.removeAllChildren();
            this._elementRenders.length = 0;
            var i, element, locRichElements = this._richElements;
            this._addNewLine();
            for (i = 0; i < locRichElements.length; i++) {
                element = locRichElements[i];
                var elementRenderer = null;
                switch (element._type) {
                    case GRichElement.TYPE.TEXT:
                            elementRenderer = new cc.LabelTTF(element._text, element._fontName, element._fontSize);
                        break;
                    case GRichElement.TYPE.IMAGE:
                        elementRenderer = new cc.Sprite(element._filePath);
                        break;
                    case GRichElement.TYPE.BR:
                        this._addNewLine();
                        continue;
                    default:
                        break;
                }
                elementRenderer.setColor(element._color);
                elementRenderer.setOpacity(element._opacity);
                this._elementRenders[this._elementRenders.length-1].push(elementRenderer);
            }
            this.formatRenderers();
            this._formatTextDirty = false;
        }
    },

    _addNewLine: function () {
        this._elementRenders.push([]);
    },

    /**
     * Formats richText's renderer.
     */
    formatRenderers: function () {
        var _width = 0,_height=0;
        for(var i= this._elementRenders.length-1;i>=0;i--)
        {
            var eles = this._elementRenders[i];
            var width= 0,height = 0;
            for(var j=0;j<eles.length;j++)
            {
                var e = eles[j];
                e.setAnchorPoint(cc.p(0, 0));
                e.setPosition(width, _height);
                this._elementRenderersContainer.addChild(e, 1);

                var size = e.getContentSize();
                width += size.width;
                height = Math.max(height, size.height);
            }
            _width = Math.max(_width,width);
            _height += height;
        }
        this._contentSize = cc.size(_width,_height);
        this._elementRenderersContainer.setContentSize(this._contentSize);
        this.setContentSize(this._contentSize);
        //this._elementRenderersContainer.setPosition(this._contentSize.width * 0.5, this._contentSize.height * 0.5);
    },

    adaptRenderers: function(){
        this.formatText();
        this.setAnchorPoint(0.5, 0.5);
    },

    setTextHorizontalAlignment: function(value){
        if(value !== this._textHorizontalAlignment) {
            this._textHorizontalAlignment = value;
            this.formatText();
        }
    },

    setTextVerticalAlignment: function(value){
        if(value !== this._textVerticalAlignment) {
            this._textVerticalAlignment = value;
            this.formatText();
        }
    }

});

GText.create = function()
{
    return new GText();
};

GText.test = function(layer)
{
    var size = cc.winSize;

    var t = GText.create();
    t.setRichText("<font  color=#ff0000 size=32>ABCD</font><br/>" +
    "<font size=32 color=#00ff00>ABCD</font><br/>" +
    "<font size=32 color=#00ff00>ABCD</font>" +
    sprintf("<img  opacity=%d size=%d  src='%s' color=%s/>",255,32,"res/CloseNormal.png","#ffffff") +
    "<font size=32 color=#00ff00>ABCD</font>");
    t.setPosition(cc.p(size.width/2,size.height/2));
    layer.addChild(t,2);

    t.pushBackElement("<br/><font  color=#ff0000 size=32>ABCD</font>");
    t.pushBackElement("<img  opacity=200 size=32  src='res/CloseNormal.png' color=#0000ff/>");
    t.pushBackElement(_T("中国"),cc.color(0,0,255),40);

    t.insertElement("<img  opacity=200 size=32  src='res/CloseNormal.png' color=#0000ff/>",0);

    t.removeElement(1);

    t.setAnchorPoint(0, 0.5);

    t.drawDebug();
};