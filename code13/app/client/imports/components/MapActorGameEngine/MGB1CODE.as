

///// THIS IS HERE SO I CAN DELETE CODE AS I IMPLEMENT IT IN THE NEW CODE :)

package com.mgb.controls
{
	// NEXT STEPs
	//  Work again through all the shot/push/collision logic to handle variable sizes
	//  Fix bug in animation table rendering in actormaker
	//	P1: Rectangle fill for put/erase actor - be smart about bigger actors
	
	
	public class GameEngineTwo extends UIComponent
	{
		
		// Timed redraw state
		private var redrawEventsSet:Boolean = false
		private var needToRedrawMap:Boolean = false
		
		
		// Background music
		private var backgroundMusicSound:Sound;
		private var backgroundMusicSoundChannel:SoundChannel;
		
		// ViewModel we surface from this music player for UI (mostly for attribution)  __TODO__SHOULD_BE_READ_ONLY__ 
		[Bindable] public var backgroundMusicCurrentSource:String;		// This will be the name of the file (eg. joco/foo.mp3) rather than the full URL 
		[Bindable] public var backgroundMusicStatus:String = null;		// This should be NULL when no music playing

		private function playMusic(name:String):void
		{
			var url:String = MgbMusicUrls.musicUrlFromMusicFileName(name)
			if (backgroundMusicCurrentSource != name)
			{
				if (backgroundMusicSound)
				{
					backgroundMusicSound.removeEventListener(Event.COMPLETE, musicLoadedHandler)
					backgroundMusicSound.removeEventListener(IOErrorEvent.IO_ERROR, musicLoadFailedHandler)
					backgroundMusicSound.removeEventListener(IOErrorEvent.IO_ERROR, musicProgressHandler)
				}
				stopMusic()
				backgroundMusicSound = new Sound()
				backgroundMusicSound.addEventListener(Event.COMPLETE, musicLoadedHandler)
				backgroundMusicSound.addEventListener(IOErrorEvent.IO_ERROR, musicLoadFailedHandler)
				backgroundMusicSound.addEventListener(ProgressEvent.PROGRESS, musicProgressHandler)
				backgroundMusicSound.load(new URLRequest(url))
				
				backgroundMusicCurrentSource = name
			}
		}
		
		private function musicLoadedHandler(e:Event):void
		{
			backgroundMusicSoundChannel = backgroundMusicSound.play(0, 10000)	// 10,000 is a hack :)
			backgroundMusicStatus = "Playing music"
		}
		
		private function musicProgressHandler(e:ProgressEvent):void
		{
			var pct:int = (100 * e.bytesLoaded) / e.bytesTotal
			backgroundMusicStatus = new String("Loading Music ... "+String(pct)+"%")
		}
		
		private function musicLoadFailedHandler(e:IOErrorEvent):void
		{
			trace("music load failed")
			backgroundMusicStatus = "Music file not found"
		}
		
		private function stopMusic():void
		{
			if (backgroundMusicSoundChannel)
			{
				backgroundMusicSoundChannel.stop()
				backgroundMusicSoundChannel = null
			}
			backgroundMusicCurrentSource = null
			backgroundMusicStatus = null
		}
		
		private function fixDialogSizes():void
		{
			if (this.npcDialog)
			{
				npcDialog.width = view.width - 40 // Math.max(npcDialog.minWidth, calculateRenderWidth(true))
				npcDialog.height = view.height - 60 // Math.max(npcDialog.minHeight, calculateRenderHeight(true))
			}
			if (this.inventoryDialog)
			{
				inventoryDialog.width = view.width - 40
				inventoryDialog.height = view.height - 60
			}
		}

		public function toggleInventory():void
		{
			if (inventoryDialog)
			{
				if (inventoryDialog.visible)
					hideInventory()
				else
					showInventory()
			}
		}
		
		private function hideInventory():void
		{
			if (inventoryDialog)
				inventoryDialog.visible = false
			pauseGame = false
		}
		
		private function showInventory():void
		{
			inventoryDialog.setInventory(this.inventory)
			if (inventoryDialog.visible == false)
			{
				inventoryDialog.visible = true
				pauseGame = true
			}
		}
		
		private function isObstructedForThisDrop(x:int, y:int, CheckActiveLayer:Boolean):Boolean
		{
			var obstructed:Boolean = false		// until we prove otherwise
			if (x < 0 || x >= mapPiece.width || y < 0 || y >= mapPiece.height)
				return true			// doh!

			var cellToCheck:int = cell(x,y)
			var ACidx:String = mapPiece.mapLayerActors[MgbMap.layerBackground][cellToCheck]
			// 1. Check the background layer. These don't change so we can work out behavior by the generic actorCache[] properties
			if (ACidx)
			{
				var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
				if (ap)
				{
					var itemAct:int = ap.actorXML.databag.item.itemActivationType
					if (itemAct == MgbActor.alItemActivationType_BlocksPlayer || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
						obstructed = true
				}
			}
			
			// 2. Check actives
			
			if (CheckActiveLayer && !obstructed)
			{
				for (var AA:int = 0; AA < activeActors.length && !obstructed; AA++)
				{
					var actor:ActiveActor = activeActors[AA]
					if (actor.alive && actor.x == x && actor.y == y)
						obstructed = true
				}
			}

			return obstructed
		}
		
		private function nextPoint(x:int, y:int, w:int, h:int, stepStyle:int):Point	// TODO - - handle larger sizes for drops
		{
			var r:Point = new Point(x, y)
			
			switch (stepStyle)
			{
				case 0:
					r.y--
					break
				case 1:
					r.x+=w
					break
				case 2:
					r.y+=h
					break
				case 3:
					r.x--
					break
			}
			return r
		}
		
		private function findAdjacentFreeCellForDrop(	AAindexOfActorWhoIsDroppingAnItem:int, 
														preferredDirection:int,	 				// As a 'stepstyle'
														CheckActiveLayer:Boolean = false		// Need to explicitly ask for the Active layer to be checked
													):Point
		{
 			var aa:ActiveActor = activeActors[AAindexOfActorWhoIsDroppingAnItem]
			var goodPoint:Point = null

			for (var d:int = 0; d < 4; d++)
			{
				var r:Point = nextPoint(aa.x, aa.y, aa.cellSpanX, aa.cellSpanY, d)
				if (false == isObstructedForThisDrop(r.x, r.y, CheckActiveLayer))
				{
					if (d == preferredDirection)
						return r
					else
						goodPoint = r
				}
			}
			return goodPoint	// can be null
		}

		private function InventoryDialogEventHandler(event:InventoryDialogEvent):void
		{
			switch (event.action)
			{
				case InventoryDialogEvent.ACTION_CLOSE:
					hideInventory()
					break
				case InventoryDialogEvent.ACTION_DESTROY: 
					inventory.remove(event.item)
					// We won't hideInventory()
					break
				case InventoryDialogEvent.ACTION_DROP: 
					// Find an adjacent free space
					var p:Point = findAdjacentFreeCellForDrop(AA_player_idx, ActiveActor(activeActors[AA_player_idx]).stepStyle)
					if (p)
					{
						playSpawnNewActor(event.item.actor.name, p.x, p.y, true, true)	// @@@@@@ CHANGE TO TRUE -- SO DROPS NOW PERSIST?
						inventory.remove(event.item)
					}
					hideInventory()
					break
				case InventoryDialogEvent.ACTION_EQUIP:
					inventory.equip(event.item, !event.item.equipped)
					// We won't hideInventory()
					break
				case InventoryDialogEvent.ACTION_USE:
					useItemActorOnPlayer(event.item.actor)
					inventory.remove(event.item)
					hideInventory()	// This way the effect is immediate
					break
			}
		}

		private function showNpcMessage(params:Object, actor:ActiveActor = null):void
		{
			if (npcDialog)
			{
				fixDialogSizes()
				npcDialog.setParams(params)
				npcDialog.visible = true
				pauseGame = true
				npcDialogActor = actor				
			}
		}
		
		private function hideNpcMessage():void
		{
			if (npcDialog)
			{
				npcDialog.clearParams()
				npcDialog.visible = false
				pauseGame = false
				npcDialogActor = null
			}
		}

		private function NpcDialogEventHandler(event:NpcDialogEvent):void
		{
			var drop:String = null
			var say:String = null
			var stayYN:int = 1
			var dropPersistsYN:int = 0
			var repeatQuestion:Boolean = false
			
			var ap:MgbActor
			if (npcDialogActor != null && npcDialogActor.ACidx != null)
				ap = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, npcDialogActor.ACidx))
			
			switch (event.choice)
			{
				case 0:
					// do nothing 00 == cancel
					break
				case 1:
					drop = String(ap.actorXML.databag.npc.dropsObjectOnChoice1)
					stayYN = int(ap.actorXML.databag.npc.responseChoice1StayYN)
					dropPersistsYN = int(ap.actorXML.databag.npc.responseChoice1DropPersistsYN)
					say = String(ap.actorXML.databag.npc.saysWhatOnChoice1)
					var take:String = String(ap.actorXML.databag.npc.takesObjectOnChoice1)
					var takeType:int = int(ap.actorXML.databag.npc.takeObjectTypeOnChoice1)
					var takeCount:int = int(ap.actorXML.databag.npc.takesObjectCountOnChoice1Num)
					break
				case 2:
					drop = String(ap.actorXML.databag.npc.dropsObjectOnChoice2)
					stayYN = int(ap.actorXML.databag.npc.responseChoice2StayYN)
					dropPersistsYN = int(ap.actorXML.databag.npc.responseChoice2DropPersistsYN)
					say = String(ap.actorXML.databag.npc.saysWhatOnChoice2)
					take = String(ap.actorXML.databag.npc.takesObjectOnChoice2)
					takeType = int(ap.actorXML.databag.npc.takeObjectTypeOnChoice2)
					takeCount = int(ap.actorXML.databag.npc.takesObjectCountOnChoice2Num)
					break
				case 3:
					drop = String(ap.actorXML.databag.npc.dropsObjectOnChoice3)
					stayYN = int(ap.actorXML.databag.npc.responseChoice3StayYN)
					dropPersistsYN = int(ap.actorXML.databag.npc.responseChoice3DropPersistsYN)
					say = String(ap.actorXML.databag.npc.saysWhatOnChoice3)
					take = String(ap.actorXML.databag.npc.takesObjectOnChoice3)
					takeType = int(ap.actorXML.databag.npc.takeObjectTypeOnChoice3)
					takeCount = int(ap.actorXML.databag.npc.takesObjectCountOnChoice3Num)
					break
			}

			if (take && take == "")
				take = null 	// just normalizing "" to null
			if (take)
			{
				if (takeCount <= 0) 
					takeCount = 1			// <1 isn't valid, minimum is 1.
					
				var item:InventoryItem = inventory.get(take)
				if (!item || item.count < takeCount)
				{
					if (takeCount == 1)
						say = "You don't have the "+take+" to give me."
					else
						say = "You don't have enough "+take+" to give me. I want " + String(takeCount)
					drop = null
					stayYN = 1
				}
				else
				{
					switch (takeType)
					{
						case MgbActor.alNpcTakeType_Take:
							if (false == inventory.removeByName(take, takeCount))
							{
								say = "You don't have the "+take+" to give me..."
								drop = null
								stayYN = 1
							}
							break
						case MgbActor.alNpcTakeType_Require:
							if (null == inventory.get(take))
							{
								say = "You don't have the "+take+" with you..."
								drop = null
								stayYN = 1
							}
							break
					}
				}
			}
			
			switch (stayYN)
			{
				case MgbActor.alNpcDialogFinalAction_disappear:
					npcDialogActor.health = 0
					break;
				case MgbActor.alNpcDialogFinalAction_stay:
					// do nothing
					break;
				case MgbActor.alNpcDialogFinalAction_repeat:
					repeatQuestion = true
					break;
			}
			if (drop)
			{
				playSpawnNewActor(drop, npcDialogActor.x, 
										npcDialogActor.y + (npcDialogActor.health == 0 ? 0 : npcDialogActor.cellSpanY), //drop below if actor stays
										true,
										dropPersistsYN ? true : false)
			}
			if (say)
			{
				var fnt:String = MgbSystem.gameFonts[int(ap.actorXML.databag.npc.talkTextFontIndex)]
				showNpcMessage({message:say, leftActor:ap, font:fnt}, npcDialogActor)
				if (repeatQuestion)
					askNpcQuestion(npcDialogActor, ap, true)		// final "true" asks to queue this up
			}
			else
			{
				if (repeatQuestion)
					askNpcQuestion(npcDialogActor, ap)
				else
					hideNpcMessage()
			}
		}
		
		
		//
		// Map initialize, destroy, zoom, load, and save
		//
		
		private function calculateRenderWidth(capByMapSize:Boolean = false):int
		{
			var renderWidth:int  = Math.max(128, parent ? Container(parent).width  : 0) / zoomLevel	// TODO - I used to add 128 'for luck'.. (also in REnderHeight.. I think not needed now, but watch out...
			if (renderWidth > MgbSystem.FlashLargestBitmapWidth)
				renderWidth = MgbSystem.FlashLargestBitmapWidth
			if (capByMapSize && renderWidth > mapPiece.width * MgbSystem.tileMinWidth)
				renderWidth = mapPiece.width * MgbSystem.tileMinWidth
			return renderWidth
		}
		
		private function calculateRenderHeight(capByMapSize:Boolean = false):int
		{
			var renderHeight:int = Math.max(128, parent ? Container(parent).height : 0) / zoomLevel
			if (renderHeight > MgbSystem.FlashLargestBitmapHeight)
				renderHeight = MgbSystem.FlashLargestBitmapHeight
			if (capByMapSize && renderHeight > mapPiece.height * MgbSystem.tileMinHeight)
				renderHeight = mapPiece.height * MgbSystem.tileMinHeight
			return renderHeight
		}
		
		
		// This gets the name of the INITIAL MAP - if the game is multi-map, this always
		// returns the name of the map where the game play started
		public function get initialMapName():String
		{
			return initialMap ? initialMap.name : mapPiece.name
		}

// 		private function endGame():void
// 		{
// 			stopMusic()
// 			pauseGame = false
// 			hideNpcMessage()
// 			hideInventory()
// 	    	disablePlayerControls()
//         	removeEventListener( "enterFrame", onTickGameDo )
// 	    	G_gameOver = true							// Actually one of the conditions that causes the game loop to call endGame, but let's be sure :)
// 	    	G_tic = null
// 			gameEngineMode = GameEngine.GE_EDIT
// 	    	playCleanupActiveLayer()
// 	    	playCleanupBackgroundLayer()
// 			mapPiece.loadPieceFromPiece(initialMap)		// Replace the initial map that was used to start the game
// 	    	initialMap = null							// No longer needed
// 			var c:Container = Container(parent)
// 			c.horizontalScrollPosition = 0
// 			c.verticalScrollPosition = 0
// 			view.alpha = 1.0							// Just-in case anything bad happened mid-transition.
// 			applyZoomLevel()							// also fixes size and redraws
// 	    	setGameStatusString("Game Over")
// 	    	clearGameStatusString2()
// 			activeActors = new Array()					// Delete references, save memory
// 			respawnMemory = new Array()					// Delete references, save memory
// 			cancelAllSpawnedActorsForAutoRespawn()
// 		}
		

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
