/**
 * Created by YanChunGuang on 2015/8/3.
 */

var GUIControl = cc.Class.extend({
    ctor : function()
    {
       // this._super();
    },

    open : function(ui,zorder)
    {
        var scene = cc.director.getRunningScene();
        var u = new ui();
        if(!zorder)
        {
            var childs = scene.getChildren();
            zorder = 1;
            for(var i=0;i<childs.length;i++)
            {
                if(childs[i].getLocalZOrder() > zorder)
                    zorder = childs[i].getLocalZOrder();
            }
        }
        u.setLocalZOrder(zorder);
        scene.addChild(u);
        return u;
    }
});

GUIControl._instance = null;

GUIControl.getInstance = function()
{
    if(!GUIControl._instance)
        GUIControl._instance = new GUIControl();
    return GUIControl._instance;
}