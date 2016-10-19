

///// THIS IS HERE SO I CAN DELETE CODE AS I IMPLEMENT IT IN THE NEW CODE :)

package com.mgb.controls
{
	// NEXT STEPs
	//  Work again through all the shot/push/collision logic to handle variable sizes
	//  Fix bug in animation table rendering in actormaker	
	
	public class GameEngineTwo extends UIComponent
	{
		
		
		
// 		// With no parameters (or -1,-1), this function just uses the default player position (activeActors[AA_player_idx].x, activeActors[AA_player_idx].y)
// 		public function scrollMapToSeePlayer(overrideX:int = -1, overrideY:int = -1):void
// 		{
// 			var margin:int = 5
// 			var sx:int = overrideX == -1 ? activeActors[AA_player_idx].x : overrideX
// 			var sy:int = overrideY == -1 ? activeActors[AA_player_idx].y : overrideY
// 			if (parent is Container)
// 			{
// 				G_HSPdelta = 0
// 				G_VSPdelta = 0
// 				var c:Container = Container(parent)
// 				var w:int = width - c.maxHorizontalScrollPosition
// 				var h:int = height- c.maxVerticalScrollPosition
// 				var maxHSP_toSeePlayer:int = (sx-margin) * MgbSystem.tileMinWidth					// Maximum Horizontal Scroll Position to see player
// 				var maxVSP_toSeePlayer:int = (sy-margin) * MgbSystem.tileMinWidth					// Maximum Vertical Scroll Position to see player
// 				if (c.horizontalScrollPosition > maxHSP_toSeePlayer)
// 					G_HSPdelta = ((maxHSP_toSeePlayer) - c.horizontalScrollPosition)/G_tweensPerTurn;	// Scroll left if needed
// 				if (c.verticalScrollPosition > maxVSP_toSeePlayer)
// 					G_VSPdelta = ((maxVSP_toSeePlayer) - c.verticalScrollPosition)/G_tweensPerTurn;	// Scroll up if needed

// 				var minHSP_toSeePlayer:int = ((sx+1+margin) * MgbSystem.tileMinWidth) - w;				// Minimum Horizontal Scroll Position to see player
// 				var minVSP_toSeePlayer:int = ((sy+1+margin) * MgbSystem.tileMinHeight) - h;			// Minimum Vertical Scroll Position to see player
// 				if (minHSP_toSeePlayer > 0 && c.horizontalScrollPosition < minHSP_toSeePlayer)				
// 					G_HSPdelta = ((minHSP_toSeePlayer) - c.horizontalScrollPosition) / G_tweensPerTurn;	// Scroll right if needed
// 				if (minVSP_toSeePlayer > 0 && c.verticalScrollPosition < minVSP_toSeePlayer)				
// 					G_VSPdelta = ((minVSP_toSeePlayer) - c.verticalScrollPosition) / G_tweensPerTurn;		// Scroll down if needed
// 			}
// 		}
		

// 	}
// }
