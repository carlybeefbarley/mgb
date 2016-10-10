

///// THIS IS HERE SO I CAN DELETE CODE AS I IMPLEMENT IT IN THE NEW CODE :)

package com.mgb.controls
{
	// NEXT STEPs
	//  Work again through all the shot/push/collision logic to handle variable sizes
	//  Fix bug in animation table rendering in actormaker
	//	P1: Rectangle fill for put/erase actor - be smart about bigger actors
	
	
	public class GameEngineTwo extends UIComponent
	{
		// Background blockages map
		private var backgroundBlockageMap:BlockageMap = new BlockageMap;
		
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
		
		
		private var deferredAsk_aa:ActiveActor = null
		private var deferredAsk_ap:MgbActor = null
		
		private function askDeferredNpcQuestion():void
		{
			if (deferredAsk_aa != null && deferredAsk_ap != null)
			{
				askNpcQuestion(deferredAsk_aa, deferredAsk_ap)
				deferredAsk_aa = null
				deferredAsk_ap = null
			}
		}
		
		private function askNpcQuestion(aa:ActiveActor, ap:MgbActor, deferredAsk:Boolean = false):void
		{
			if (deferredAsk)
			{
				deferredAsk_aa = aa
				deferredAsk_ap = ap
			}
			else
			{
				var msg:String = ap.actorXML.databag.npc.talkText
				var fnt:String = MgbSystem.gameFonts[int(ap.actorXML.databag.npc.talkTextFontIndex)]
				var c1:String = ap.actorXML.databag.npc.responseChoice1
				var c2:String = ap.actorXML.databag.npc.responseChoice2
				var c3:String = ap.actorXML.databag.npc.responseChoice3
				if (msg && msg.length > 0)
					showNpcMessage({leftActor:ap, message:msg, font:fnt, choice1:c1, choice2:c2, choice3:c3}, aa)
			}
		}

		public function printMap():void
		{		
			try
			{
				// This just prints a single page, scaled to fit - no frills.
				// For bonus points we could
				//  (1) offset the printaed image a bit (view.y = 40) and add a Text object describing the maps (name, coment etc)
				//	(2) Do multi-page printing to support maps larger thna 90x90 cells (90x32=2880 - the largest bitmap flex supports
				//  (3) turn off the grid for any large maps (probably > 40x40) since it gets messed up in the downscaling and we get moire effects
				var printJob:FlexPrintJob = new FlexPrintJob()
				if (printJob.start()) 
				{
					var z:Number = zoomLevel
					var ow:Number = width, oh:Number = height
					redrawMap(	width = Math.min(MgbSystem.FlashLargestBitmapWidth, mapPiece.width * MgbSystem.tileMinWidth), 
								height = Math.min(MgbSystem.FlashLargestBitmapHeight, mapPiece.width * MgbSystem.tileMinHeight), 0, 0)
					printJob.addObject(this, FlexPrintJobScaleType.SHOW_ALL)
					view.scaleX = 1
					view.scaleY = 1
					printJob.send()
					width = ow
					height = oh
					view.scaleX = z
					view.scaleY = z
					redrawMap()		// reset size
				}
	    	}
	    	catch (err:Error)
	    	{
	    		MgbLogger.getInstance().logException("printMap()", err)
	    	}
			tagCheck("print")
		}

		private function startTimedRedraws():void
		{
        	addEventListener("enterFrame", timeToDrawMap)
		}

        private function timeToDrawMap(e:Event = null):void 
        {
        	if (needToRedrawMap)
   	    		redrawMap()
    		needToRedrawMap = false
	    }

        public function pleaseRedrawMapSoon():void 
        {
        	needToRedrawMap = true
        }

		// 
		// Component support functions for UIComponent
		//
		public function GameEngineTwo()
		{
			trace("GE2 constructor")
			super()
			gameEngineMode = GameEngine.GE_EDIT			// TODO: smart constructor for load/play handling, choice of sizes etc
			newMap()
			triggerPlayMode()
			for (var l:int=0; l < MgbMap.layerGameCount; l++)
				layerAlphas[l] = Number(1.0)
			MgbGlobalEventer.getInstance().addEventListener(PieceChangedEvent.CHANGE, processPieceChange)
		}
		
		// public function tagCheck(suffix:String):void
		// {
		// 	// ActiveTutorial.getInstance().tutorialTagCheck("mapmaker_"+suffix)
		// }
		
		private function processPieceChange(event:PieceChangedEvent):void		// Called when a piece is saved
   		{
	    	try
	    	{
	   			// Todo - handle cases for event.pieceProject 
	   			if ((event.pieceType == Piece.MGB_MAP || event.pieceType == Piece.MGB_ACTOR ) && event.wasPieceSavedOrDeleted())
		   			stopGameIfPlaying()													// Actor and updates can change game logic so stop game. Tile updates aren't an issue
		   		this.pleaseRedrawMapSoon()
	    	}
	    	catch (err:Error)
	    	{
	    		MgbLogger.getInstance().logException("processPieceChange()", err)
	    	}
   		}   		

		override protected function createChildren():void
		{
			super.createChildren()
			createBlitter()
			startTimedRedraws()
			MgbGlobalEventer.getInstance().addEventListener(MgbSession.EVENT_MGB_PROJECT_CHANGED, processProjectChange)
		}


		private function redrawEvent(event:Event):void
		{
			pleaseRedrawMapSoon()
		}

		//
		// Create/destroy Blitter
		// 

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
		
		protected function redrawMap(overrideWidth:int = -1, overrideHeight:int = -1, overrideHScroll:int = -1, overrideVScroll:int = -1):void
		{
			var x:int, y:int
			
			needToRedrawMap = false

			var container:Container=Container(parent)
			if (container && container.verticalScrollPosition > container.maxVerticalScrollPosition)
				container.verticalScrollPosition = container.maxVerticalScrollPosition
			if (container && container.horizontalScrollPosition > container.maxHorizontalScrollPosition)
				container.horizontalScrollPosition = container.maxHorizontalScrollPosition

			var renderWidth:int  = overrideWidth != -1 ? overrideWidth : calculateRenderWidth()
			var renderHeight:int = overrideHeight != -1 ? overrideHeight : calculateRenderHeight()
			
			var hScroll:int = overrideHScroll != -1 ? overrideHScroll : (parent ? Number(container.horizontalScrollPosition) / zoomLevel : 0)
			var vScroll:int = overrideVScroll != -1 ? overrideVScroll : (parent ? Number(container.verticalScrollPosition) / zoomLevel : 0)
			
			if (npcDialog)
			{
				npcDialog.x = hScroll
				npcDialog.y = vScroll
			}
			
			if (inventoryDialog)
			{
				inventoryDialog.x = hScroll
				inventoryDialog.y = vScroll
			}

			if (!view)
				createBlitter()
			else if (view.frameBuffer != null)
			{
				if (view.frameBuffer.width != renderWidth || view.frameBuffer.height != renderHeight)
					view.updateSize(renderWidth, renderHeight)
			}
				
			if (view && view.frameBuffer && view.bitmapData)
			{
				view.frameBuffer.lock()
				view.frameBuffer.fillRect(new Rectangle(0, 0, view.frameBuffer.width, view.frameBuffer.height), 0xffffffff)		// Solid white
				var p:Point = new Point()
				
				// Calculations need to account for (a) view size, (b) scroll position, (c) play mode, (d) oversized (multi-cell) tiles
				var startX:int = Math.max((hScroll / MgbSystem.tileMinWidth) - (MgbSystem.tileMaxSizeInCells - 1), 0)
				var endX:int = 1+int((hScroll + renderWidth) / MgbSystem.tileMinWidth)		// Exclude this cell 
				if (endX > mapPiece.width)
					endX = mapPiece.width
				var pixelShiftLeftX:int =	(hScroll % MgbSystem.tileMinWidth) + 
											(Math.min((MgbSystem.tileMaxSizeInCells - 1), int(hScroll / MgbSystem.tileMinWidth)) * MgbSystem.tileMinWidth)
				
				var startY:int = Math.max((vScroll / MgbSystem.tileMinHeight) - (MgbSystem.tileMaxSizeInCells - 1), 0)
				var endY:int = 1+int((vScroll + renderHeight) / MgbSystem.tileMinHeight)
				if (endY > mapPiece.height)
					endY = mapPiece.height
				var pixelShiftUpY:int = vScroll % MgbSystem.tileMinHeight  + (Math.min((MgbSystem.tileMaxSizeInCells - 1), int(vScroll / MgbSystem.tileMinWidth)) * MgbSystem.tileMinWidth)
				
				for (var layer:int = 0; layer<MgbMap.layerGameCount ; layer++)
				{
					if (layer == MgbMap.layerActive && gameEngineMode == GameEngine.GE_PLAY)
					{
						// Render from ActiveActors[] array
						var aalen:int = activeActors.length
			   			for (var AAi:int = 0; AAi < aalen; AAi++)
			   			{
			   				var aa:ActiveActor = activeActors[AAi]
			   				if (aa.alive && aa.renderBD)
			   				{
			   					// Potentially needs to be rendered.. if on-screen
			   					x = aa.renderX - hScroll
			   					y = aa.renderY - vScroll
			   					// Apply any position adjustments (Melee for example uses this)
		   						x += (aa.renderOffsetCellsX * MgbSystem.tileMinWidth) 
		   						y += (aa.renderOffsetCellsY * MgbSystem.tileMinWidth)
			   					
			   					if (x + MgbSystem.tileMaxWidth < 0 || x > renderWidth || y + MgbSystem.tileMaxHeight < 0 || y > renderHeight)
			   					{
			   					}
			   					else
			   					{
			   						p.x = x
			   						p.y = y
			   						try
			   						{
										view.frameBuffer.copyPixels(aa.renderBD, new Rectangle(0, 0, aa.renderBD.width, aa.renderBD.height), p, null, null, true)
			   						}
   							    	catch (err:Error)
   							    	{
   							    		trace("renderBD not ready for actor '"+aa.ACidx+"'")
   							    	}
			   					}
			   				}
			   			}
					}
					else
					{
						// Render from map [] array - there are no 'activeActors' since this is either an inactive layer or we're in edit mode  --- mapPiece.mapLayerActors
						if (layerAlphas[layer] > 0)			// Optimization: Don't draw if alpha == 0 of course
						{
							for (y = startY ; y<endY; y++)		// TODO - -12 for 512pixel images 
							{
								for (x = startX; x < endX; x++)		// TODO - -12 for 512pixel images
								{
									var actorName:String = mapPiece.mapLayerActors[layer][cell(x, y)]
									if (actorName)
									{
										p.x = ((x - startX) * MgbSystem.tileMinWidth) - pixelShiftLeftX
										p.y = ((y - startY) * MgbSystem.tileMinHeight) - pixelShiftUpY
										if (layer == MgbMap.layerEvents)
										{
											// the entry isn't really an actorname, it's an event script, but who cares... 
											if (gameEngineMode == GameEngine.GE_EDIT && actorName != null && actorName != "")
											{
												// mark these...
												var tf:TextField = new TextField()
												tf.textColor = 0xFF0000
												tf.background = true
												tf.backgroundColor = 0x00FFFF
												tf.text = " **  "
												tf.width = tf.textWidth ; tf.height = tf.textHeight
												var ct:ColorTransform = new ColorTransform(1.0, 1.0, 1.0, layerAlphas[layer])
												var matrix:Matrix = new Matrix(1.0, 0.0, 0.0, 1.0, p.x + (MgbSystem.tileMinWidth - tf.textWidth) / 2, p.y + (MgbSystem.tileMinHeight - tf.textHeight) / 2)
												view.frameBuffer.draw(tf, matrix, ct, "normal", null, false)
											}
										}
										else
										{
											var effect:String = null
											var ap2:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actorName))
											if (ap2)
											{
												var animationTableIndex:int = getAnimationIndex(ap2, -1, -1, G_tweenCount)
												var newTileName:String = getAnimationTileFromIndex(ap2, animationTableIndex)
												// effect = getAnimationEffectFromIndex(ap2, animationTableIndex)
												// var t:MgbTile = newTileName ? MgbTile(tileCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, newTileName)) : null
												// if (t)
												// {
												// 	var b:BitmapData = t.bitmapDataVariant(effect)
												// 	if ()
												// 	{
												// 		if (layerAlphas[layer] == 1.0 || gameEngineMode != GameEngine.GE_EDIT)
												// 			view.frameBuffer.copyPixels(b, new Rectangle(0, 0, b.width, b.height), p, null, null, true)
												// 		else
												// 		{
												// 			ct = new ColorTransform(1.0, 1.0, 1.0, layerAlphas[layer])
												// 			matrix = new Matrix(1.0, 0.0, 0.0, 1.0, p.x, p.y)
												// 			view.frameBuffer.draw(b, matrix, ct, "normal", null, false)
												// 		}
												// 	}
												}
											}
											else
												loadActorByName(actorName)			// for next time around...


										}
									}
								}
							}
						}
					}
				}
				
//	   			if (true == G_gameOver)
//					  drawMessageOnGame(view.frameBuffer, pixelShiftLeftX, pixelShiftUpY, "G A M E   O V E R")
				redrawAddGameStatusString2(view.frameBuffer, pixelShiftLeftX, pixelShiftUpY, renderWidth)
				
				view.x = Number(hScroll) * zoomLevel
				view.y = Number(vScroll) * zoomLevel
				view.frameBuffer.unlock()
				view.blit()
			}
		}


/*		private function drawTextOnGame(gbd:BitmapData, pixelShiftLeftX:int, pixelShiftUpY:int, message:String):void
		{
			var format:TextFormat = new TextFormat()
			var tf:TextField = new TextField()
			tf.text = message
			tf.embedFonts = true
			format.font = "titlefont"
			format.size = 14
//			tf.background = false
//			tf.backgroundColor = 0x00FFFF
			tf.setTextFormat(format)
			tf.width = tf.textWidth + 20
			tf.height = tf.textHeight
			format.color = 0x0
			var matrix:Matrix = new Matrix(1.0, 0.0, 0.0, 1.0, 8, 4)
			if (pixelShiftLeftX < 0)
				matrix.translate(-pixelShiftLeftX, 0)
			if (pixelShiftUpY < 0)
				matrix.translate(0, -pixelShiftUpY)
			gbd.draw(tf, matrix)
			matrix.translate(-1, -1)
			format.color = 0xFFFFFFFF
			tf.setTextFormat(format)
			gbd.draw(tf, matrix)
		}
*/


		// This is very pretty, but the 'draw' operation has a HUGE perf cost for some reason... 
		//
		private function redrawAddGameStatusString2(gbd:BitmapData, 
													pixelShiftLeftX:int, 
													pixelShiftUpY:int,
													renderWidth:int			// How many pixels wide the usable screen is
													):void
		{
			if (gameEngineMode == GameEngine.GE_PLAY && gameStatusString2 && gameStatusString2.length > 0)
			{
				const xpad:int = 16
				const ypad:int = 32
				var format:TextFormat = new TextFormat()
				var tf:TextField = new TextField()
				tf.text = gameStatusString2
				tf.embedFonts = true
				tf.wordWrap = true
				format.font = "titlefont"
				format.size = 14
			tf.background = true
			tf.backgroundColor = 0xFFFFFF
//			tf.alpha = 0.5
				tf.setTextFormat(format)
				tf.width = renderWidth - xpad
				tf.height = tf.textHeight + 4 //* 4	// 4 lines should be enough!?
				format.color = 0x000000
				var matrix:Matrix = new Matrix(1.0, 0.0, 0.0, 1.0, xpad, ypad)
				if (pixelShiftLeftX < 0)
					matrix.translate(-pixelShiftLeftX, 0)
				if (pixelShiftUpY < 0)
					matrix.translate(0, -pixelShiftUpY)
				gbd.draw(tf, matrix, new ColorTransform(1.0, 1.0, 1.0, 0.60))
				matrix.translate(0, 0)
				format.color = 0x000000
				tf.background = false
				tf.setTextFormat(format)
				gbd.draw(tf, matrix)
			}
		}
		
		
		// This gets the name of the INITIAL MAP - if the game is multi-map, this always
		// returns the name of the map where the game play started
		public function get initialMapName():String
		{
			return initialMap ? initialMap.name : mapPiece.name
		}
		
	    public function loadMapResult(event:Event):void 
	    {
			tagCheck("load_complete")					// load of the map data piece is complete - now we need to load the resources it requires
	    	setGameStatusString("Loading game...")
			dispatchEvent(new GameEngineEvent(GameEngineEvent.LOADING, mapPiece.userName, mapPiece.projectName, mapPiece.name))
	    	preloadThisMap()
	    	prepareMapEditResoures()
			scrollMapToSeePlayer(0, 0)
	    }

		//
		// Event setup and teardown
		//
		protected function addGe2Events(mode:String):void
		{
			switch (mode)
			{
				case GameEngine.GE_EDIT:
					throw new Error("Should be handled by subclass")
					break
				case GameEngine.GE_PLAY:
					// TODO: build the "play" mode for GameEngineTwo
			}
		}

		protected function removeGe2Events(mode:String):void
		{
			switch (mode)
			{
				case GameEngine.GE_EDIT:
					throw new Error("Should be handled by subclass")
					break
				case GameEngine.GE_PLAY:
					// TODO: build the "play" mode for GameEngineTwo
			}
		}
    
    	// This is used by the edit mode so it is session-oriented
		protected function actorTileBitMapData(actorName:String, effect:String = null):BitmapData
		{
			var t:MgbTile = null
			if (actorName != null)
			{
				var p:MgbActor = MgbActor(actorCache.getPieceIfCached(mgbSession.userName, mgbSession.activeProject, actorName))
				if (p != null)
					t = MgbTile(tileCache.getPieceIfCached(p.userName, p.projectName, p.tilename))
				else
					loadActorByName(actorName)
			}
			return t == null ? null : t.bitmapDataVariant(effect)
		}

		protected function computeMapPixelWidth():int
		{
			return MgbSystem.tileMinWidth * mapPiece.width;		// Note - doesn't factor in zoomLevel - must multiply by ZoomLevel if counting mouse/screen coords
		}
		
		protected function computeMapPixelHeight():int
		{
			return MgbSystem.tileMinHeight * mapPiece.height;			// Note - doesn't factor in zoomLevel - must multiply by ZL if counting mouse/screen coords
		}
		
		
		//
		// Actor load/save/cache functions. This needs some work - the counters don't match up (go below zero, and we also need to handle 
		// drops that shoot etc
		//
		
		
		private function notifyThatGameIsReadyToPlay():void
		{
			setGameStatusString("Ready")
			dispatchEvent(new GameEngineEvent(GameEngineEvent.LOADED, mapPiece.userName, mapPiece.projectName, mapPiece.name))
		}
   		public function stopGameIfPlaying():void
   		{
   			if (GameEngine.GE_PLAY == gameEngineMode && false == G_gameOver)
   				endGame()
   		}

		//
		// Main PLAY GAME handler
		//

		private var respawnMemory:Array = new Array		// See respawnId in the ActiveActors array
		private var G_gameStartedAtMS:Number
		private var AA_player_idx:int = 0
		private var activeActors:Array = new Array()
		// These get set by the event handlers; in the game loop we can read them to see the intent
		private var G_player_action_up:Boolean = false,
					G_player_action_down:Boolean = false,
					G_player_action_left:Boolean = false,
					G_player_action_right:Boolean = false,
					G_player_action_shift:Boolean = false,
					G_player_action_push:Boolean = false,
					G_player_action_melee:Boolean = false,
					G_player_action_shoot:Boolean = false,
					G_player_action_jump:Boolean = false;
	    [Bindable] public var G_gameOver:Boolean = true;
		
		// Tweening state. Decisions about moves are made once per turn. A turn consists of multple 'tweens' that animate the turn.
		private var G_xMovePerTween:int = 0, G_yMovePerTween:int = 0;	// Player movement per tween this turn.
		private var G_tweenCount:int = 0;								// Current tween count in this turn
		private var G_tweensPerTurn:int = 4;							// Needs to be a divisor of MgbSystem.tileMinWidth and MgbSystem/tileMinHeight
		private var G_VSPdelta:int = 0, G_HSPdelta:int = 0;				// Scroll change per tween
		private var G_tweenSinceMapStarted:int = 0;						// Current tween count in this map - used for timing end of powers etc

	    public function triggerPlayMode():void
	    {
	    	stopGameIfPlaying()
	    	gameEngineMode = GameEngine.GE_PLAY
			pleaseRedrawMapSoon()
	    }
	    
		public function triggerLobbyMode():void
	    {
			removeGe2Events(GameEngine.GE_PLAY)
	    	gameEngineMode = GameEngine.GE_LOBBY
			pleaseRedrawMapSoon()
	    }
	    
	    public function triggerEditMode():void
	    {
			removeGe2Events(GameEngine.GE_PLAY)
			pleaseRedrawMapSoon()
	    }

		private function clearPlayerKeys():void
		{
			G_player_action_up = false;
			G_player_action_down = false;
			G_player_action_left = false;
			G_player_action_right = false;
			G_player_action_shift = false;
			G_player_action_push = false;
			G_player_action_melee = false;
			G_player_action_shoot = false;
			G_player_action_jump = false;
		}

	    private function enablePlayerControls():void
	    {
			clearPlayerKeys()
			stage.addEventListener(KeyboardEvent.KEY_DOWN, playHandleKeyEvents)
			stage.addEventListener(KeyboardEvent.KEY_UP, playHandleKeyEvents)
	    }
	    
 	    private function disablePlayerControls():void
	    {
			stage.removeEventListener(KeyboardEvent.KEY_DOWN, playHandleKeyEvents)
			stage.removeEventListener(KeyboardEvent.KEY_UP, playHandleKeyEvents)
	    }
	    
	    private function playHandleKeyEvents(k:KeyboardEvent):void
	    {
	    	if (!G_gameOver && !transitionInProgress)
	    	{
	    		var newstate:Boolean = k.type == KeyboardEvent.KEY_DOWN ? true : false
		    	var pp:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA_player_idx].ACidx))
		    	switch (k.keyCode)
		    	{
		    		case Keyboard.DELETE:
		    			if (newstate)
		    				toggleInventory();
		    			break;
		    		case Keyboard.LEFT:
		    			if (pp.actorXML.databag.allchar.leftYN)
					    	G_player_action_left = newstate
			    		break
		    		case Keyboard.RIGHT:
		    			if (pp.actorXML.databag.allchar.rightYN)
			    			G_player_action_right = newstate
			    		break
		    		case Keyboard.UP:
		    			if (pp.actorXML.databag.allchar.upYN)
			    			G_player_action_up = newstate
			    		break
		    		case Keyboard.DOWN:
		    			if (pp.actorXML.databag.allchar.downYN)
			    			G_player_action_down = newstate
			    		break
		    		case Keyboard.SPACE:
		    			if (pp.actorXML.databag.allchar.pushYN)
			    			G_player_action_push = newstate
			    		break
		    		case Keyboard.END:		// Melee
		    		case 77:	//Keyboard.M:		// Melee
//		    			if (pp.actorXML.databag.allchar.meleeYN)
			    			G_player_action_melee = newstate
			    		break
		    		case Keyboard.CONTROL:
		    			if (pauseGame && newstate)
			    			hideNpcMessage()				// unpause
			    		else if (!pauseGame && newstate)	// "key down" event
			    			doPauseGame()
			    		break
		    		case Keyboard.ENTER:
		    			if (pp.actorXML.databag.allchar.shotRateNum)
			    			G_player_action_shoot = newstate
			    		break		    		
		    	}
		    }
	    }
	    
	    public function togglePause():void
	    {
	    	if (pauseGame)
	    		hideNpcMessage()
	    	else
	    		doPauseGame()
	    }

		public function doPauseGame():void 
		{
			if (!pauseGame)
			{
		    	var playerActor:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA_player_idx].ACidx))
				showNpcMessage({message:"Game Paused", leftActor:playerActor})
			}
		}

		// playPrepareActiveLayer - called when a game starts on a map - create individual bitmaps for the active elements
		// 
		// Effects:
		//  1. Erase and hide the current 'activeLayer' bitmap
		//	2. For each item on the active Layer in the specified map, 
		//		Create a new (global to this GE1 class) activeActors[] array entry (and implicitly update array.length)
		//		Create a bitmap, associate it with the BitmapData from the applicable actorCache.tilePiece
		//  	Add that bitmap to the display list
		//  3. Move layerForeground to be at the front (z-order) of the screen
		// Return value is the # of player items on the specified map
		// @@ todo - make sure the player is in a deterministic slot - either first or last - to make behavior more consistent
		private function playPrepareActiveLayer(map:MgbMap, skipCreatingPlayers:Boolean = false):int
		{
			var missingActors:int = 0
			var num_players:int
	    	var layer:int = MgbMap.layerActive
	    	activeActors = new Array()
	    	
			// Instantiate instances of the Actors using the map data
   			for (var y:int = 0; y<mapPiece.height; y++)
   			{
				for (var x:int = 0; x < mapPiece.width; x++)
				{
					var actorName:String = mapPiece.mapLayerActors[layer][cell(x, y)]
					if (null != actorName)
					{
						var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actorName))
						if (null != ap)
						{
							var thisAAidx:int = activeActors.length
							var at:int = ap.actorXML.databag.all.actorType
							
							if (skipCreatingPlayers == true && at == MgbActor.alActorType_Player)
								continue;

							var respawnId:String = mapPiece.name + "/" + x + "/" +y				// This is the only place I do this format, so no need for a function yet for it
							if (at != MgbActor.alActorType_Player && respawnMemory[respawnId])
							{
								// Aha.. there's a respawn behavior on this, and we've got to something we've remembered about it
								continue;		// This is something we've decided will not respawn once killed/removed
								
								// what about items that can be picked up? 
							}
								
							var aa:ActiveActor = new ActiveActor
							aa.creationCause = ActiveActor.CREATION_BY_MAP
							aa.respawnId = respawnId
							aa.birthTweenCount = G_tweenCount
							aa.meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE

							preLoadPotentialSpawns(ap)
								
							// Now create activeActors for the required actors on this map
							switch (at)
							{
								case MgbActor.alActorType_Shot:
									MgbLogger.getInstance().logGameBug("Actor "+actorName+" is a shot - it shouldn't be placed directly on the map. Ignoring...")
									// ignore shots
									break;
								case MgbActor.alActorType_NPC:
								case MgbActor.alActorType_Player:
									aa.moveSpeed = Number(ap.actorXML.databag.allchar.movementSpeedNum)
									// no 'break' here: falling through to next clause on purpose...
								case MgbActor.alActorType_Item:
									var tp:MgbTile = MgbTile(tileCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ap.tilename))
									if (!tp)
									{
										MgbLogger.getInstance().logGameBug("Actor '"+ap.name+"' does not have a valid tile and will not be in the game", false)
										missingActors++
									}
									else
									{
										if (tp.loadFailed)
										{
											///The issue is we don't have a clear place to reload failed pieces systematically. How/when to do this. 
											// Design decision: Do on-demand in application? Play game? Reasonable case - focus on this. 
											actorLoadsPending++
											getActorResultHandler(ap)		// this uses getPiece, so it will reload
										}
										aa.wasStopped = false
										aa.startx = x
										aa.x = x
										aa.fromx = x
										aa.type = at
										aa.starty = y
										aa.fromy = y
										aa.y = y
										aa.health = ap.actorXML.databag.all.initialHealthNum
										aa.maxHealth = ap.actorXML.databag.all.initialMaxHealthNum
										aa.appearIf = ap.actorXML.databag.itemOrNPC.appearIf ? ap.actorXML.databag.itemOrNPC.appearIf : MgbActor.alAppearDisappear_NoCondition
										aa.ACidx = actorName
										aa.renderBD = tp.bitmapData
										aa.renderX = x * MgbSystem.tileMinWidth
										aa.renderY = y * MgbSystem.tileMinHeight
										aa.cellSpanX = (tp.width  + (MgbSystem.tileMinWidth  - 1))/ MgbSystem.tileMinWidth		// Round up
										aa.cellSpanY = (tp.height + (MgbSystem.tileMinHeight - 1))/ MgbSystem.tileMinHeight		// Round up
										var spawnShot:String = ap.actorXML.databag.allchar.shotActor
										aa.maxActiveShots = (spawnShot == null || spawnShot == "") ? 0 : int(ap.actorXML.databag.allchar.shotRateNum)
										aa.alive = true;
										if (aa.moveSpeed == 0)
											activeActors.unshift(aa)			// non-movers at the front of the array
										else
											activeActors.push(aa)				// movers at the end of the array. This makes sure they are in front visually, that's all
									}
									break;
								default:
									throw new Error("Unknown Actor type "+at);
							}
						}
					}
				}
   			}
   			
   			// Next, look for items that were spawned before, but had been selected to drop persistently on the map
   			respawnRequiredActorsForMap()
   			
   			
   			// Now find the player
   			for (var AA:int = 0; AA < activeActors.length; AA++)
   			{
	  			if (MgbActor.alActorType_Player == activeActors[AA].type)
				{
					// This is the player, so make a note...
					AA_player_idx = AA
					num_players++
				}
   			}
   			
   			if (missingActors)
   				MgbLogger.getInstance().logGameBug(missingActors+" actors did not have valid tiles and so are not in the game. Check the Log for details", true)
   			
			return num_players;
		}
		
		private function respawnRequiredActorsForMap():void
		{
			// See the complementary code in playSpawnNewActor()
			if (null != respawnMemoryAutoRespawningActors[mapPiece.name])
			{
				var a:Array = respawnMemoryAutoRespawningActors[mapPiece.name]		
				for (var i:String in a)
				{
					var ob:Object = a[i]
					if (ob.actorname)
						playSpawnNewActor(ob.actorname, ob.x, ob.y, false, true, i)
				}				
			}
		}
		
		
		private var respawnMemoryAutoRespawningActors:Array = new Array			// This is an array index by map name  // BUGBUG - Array, so will not work with names like 'map' , Should be object
		private var respawnMemoryAutoRespawningActorsCurrentIndex:int = 1
		// returns a unique respawn id that acn be later used to cancel respawning of this actor 
		private function markSpawnedActorForAutoRespawn(mapName:String, actorName:String, startX:int, startY:int):String
		{
			if (null == respawnMemoryAutoRespawningActors[mapName])
				respawnMemoryAutoRespawningActors[mapName] = new Array
			var a:Array = respawnMemoryAutoRespawningActors[mapName]			// BUGBUG - Array, so will not work with names like 'map' , Should be object
			var respawnIndex:int = respawnMemoryAutoRespawningActorsCurrentIndex
			respawnMemoryAutoRespawningActorsCurrentIndex++
			var s:String = String(respawnIndex) 
			a[respawnIndex] = {actorname:actorName, x:startX, y:startY}
			return s
		}

		private function cancelSpawnedActorForAutoRespawn(mapName:String, respawnId:String):void
		{
			if (respawnId != null && null != respawnMemoryAutoRespawningActors[mapName])
			{
				var a:Array = respawnMemoryAutoRespawningActors[mapName]				// BUGBUG - Array, so will not work with names like 'map' , Should be object
				if (a[respawnId] != null)
					a[respawnId].actorname = null
			}
		}
		
		private function cancelAllSpawnedActorsForAutoRespawn():void
		{
			respawnMemoryAutoRespawningActors = new Array							// BUGBUG - Array, so will not work with names like 'map' , Should be object
		}
		
		private function playPrepareBackgroundLayer():void
		{
			backgroundBlockageMap.reset(mapPiece.width, mapPiece.height)
   			for (var y:int = 0; y<mapPiece.height; y++)
   			{
				for (var x:int = 0; x < mapPiece.width; x++)
				{
					var cellToCheck:int = cell(x,y)		// put this in a var to eliminate multiple lookups.
					var ACidx:String = mapPiece.mapLayerActors[MgbMap.layerBackground][cellToCheck]
					if (null != ACidx)
		 			{
						var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
						if (null != ap)
						{
							var at:int = ap.actorXML.databag.all.actorType
							if (at == MgbActor.alActorType_Item)
							{
								// Now, we need to work out how big this thing is. We learn this from the tile
								var tp:MgbTile = MgbTile(tileCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ap.tilename))
								if (!tp)
									trace("playPrepareBackgroundLayer() can't measure background actor '"+ap.name+"' - unknown tile '"+ap.tilename+"'. Assuming 1x1.")

								var width:int = tp ? (tp.width / MgbSystem.tileMinWidth) : 1 
								var height:int =  tp ? (tp.height / MgbSystem.tileMinHeight) : 1
								var itemAct:int = ap.actorXML.databag.item.itemActivationType
								
								// OK, now mark the appropriate number of spaces as blocked
								if (itemAct == MgbActor.alItemActivationType_BlocksPlayer || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
									backgroundBlockageMap.blockEntity(x, y, BlockageMap.ENTITY_PLAYER, width, height)
								if (itemAct == MgbActor.alItemActivationType_BlocksNPC || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
									backgroundBlockageMap.blockEntity(x, y, BlockageMap.ENTITY_NPC, width, height)
							}
						}
					}
				}
			}
		}
		
		private function playCleanupBackgroundLayer():void
		{
			this.backgroundBlockageMap.reset(1, 1)
		}
		
		private function preLoadPotentialSpawns(ap:MgbActor):void
		{
			// Pre-load actors that can be spawned - typically shots & drops - but no need to create activeActors for them yet
			var spawn:String = ap.actorXML.databag.itemOrNPC.dropsObjectWhenKilledName
			if (spawn && "" != spawn)
 				loadActorByName(spawn)

			spawn = ap.actorXML.databag.itemOrNPC.dropsObjectWhenKilledName2
			if (spawn && "" != spawn)
 				loadActorByName(spawn)

			spawn = ap.actorXML.databag.itemOrNPC.dropsObjectRandomlyName
			if (spawn && "" != spawn)
 				loadActorByName(spawn)


 			spawn = ap.actorXML.databag.allchar.shotActor
			if (spawn && spawn != "")
				loadActorByName(spawn)
				
			spawn = ap.actorXML.databag.npc.dropsObjectOnChoice1
			if (spawn && spawn != "")
				loadActorByName(spawn)
				
			spawn = ap.actorXML.databag.npc.dropsObjectOnChoice2
			if (spawn && spawn != "")
				loadActorByName(spawn)
				
			spawn = ap.actorXML.databag.npc.dropsObjectOnChoice3
			if (spawn && spawn != "")
				loadActorByName(spawn)

			spawn = ap.actorXML.databag.item.equippedNewShotActor
			if (spawn && spawn != "")		// TODO:  AND ap.actorXML.databag.item.itemActivationType.alItemActivationType_PlayerPicksUpUsesLater && inventoryEquippableYN == 1 ///equipeffects
				loadActorByName(spawn)
				
			spawn = ap.actorXML.databag.item.equippedNewActorGraphics
			if (spawn && spawn != "")		// TODO:  AND ap.actorXML.databag.item.itemActivationType.alItemActivationType_PlayerPicksUpUsesLater && inventoryEquippableYN == 1 ///equipeffects
				loadActorByName(spawn)
				
		}
		
		// These will always be added to the active layer, at the front of the draw list (since redraw's blitter uses the "painters algorithm"). 
		// Callers should set G_tic = null to invalidate the collision detection cache.   TODO: Recycle the actors (shots)
		// return -1 means failure
		private function playSpawnNewActor(actorName:String, x:int, y:int, recycle:Boolean = false, dropPersists:Boolean = false, respawnId:String=null):int
		{
			// Put within bounds
			if (x < 0)
				x = 0
			if (y < 0)
				y = 0
			if (x >= mapPiece.width)
				x = mapPiece.width - 1			// todo - -1 should be actor.cellspanx
			if (y >= mapPiece.height)
				y = mapPiece.height - 1			// todo - -1 should be actor.cellspany
			
			// Spawn?
			var thisAAidx:int = activeActors.length
			if (recycle)
			{
				// We want to look for a dead item to reuse. NOTE - don't re-use items that have conditions - they may just be dormant
				for (var j:int = 0; j < activeActors.length; j++)
				{
					if (activeActors[j].alive == false && 
						activeActors[j].dyingAnimationFrameCount == 0 && 
						activeActors[j].appearIf == MgbActor.alAppearDisappear_NoCondition)
					{
						thisAAidx = j
						break
					}
				}
			}
			var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actorName))
			if (null == ap || null == ap.actorXML)
			{
				throw new Error("Can't spawn an actor that hasn't been pre-loaded")
				return -1
			}
			var at:int = ap.actorXML.databag.all.actorType
			if (MgbActor.alActorType_Player == at)
			{
				MgbLogger.getInstance().logGameBug("Can't spawn additional players")
				return -1
			}
			else
			{
				var aa:ActiveActor = new ActiveActor
				aa.meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE
				aa.creationCause = ActiveActor.CREATION_BY_SPAWN
				if (at == MgbActor.alActorType_NPC)
					aa.moveSpeed = Number(ap.actorXML.databag.allchar.movementSpeedNum)
				aa.type = at
				aa.wasStopped = false
				aa.startx = aa.x = aa.fromx = x
				aa.starty = aa.y = aa.fromy = y
				aa.health = ap.actorXML.databag.all.initialHealthNum
				aa.maxHealth = ap.actorXML.databag.all.initialMaxHealthNum
				aa.ACidx = actorName
				var tp:MgbTile = MgbTile(tileCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ap.tilename))
				if (!tp)
					throw new Error("Can't spawn new actor - unknown tile")			// FIXME - use a default tile
				aa.renderBD = tp.bitmapData
				aa.appearIf = MgbActor.alAppearDisappear_NoCondition			// Shots can't have conditions
				aa.renderX = x * MgbSystem.tileMinWidth
				aa.renderY = y * MgbSystem.tileMinHeight
				aa.cellSpanX = (tp.width  + (MgbSystem.tileMinWidth  - 1))/ MgbSystem.tileMinWidth		// Round up
				aa.cellSpanY = (tp.height + (MgbSystem.tileMinHeight - 1))/ MgbSystem.tileMinHeight		// Round up
				
				var spawnShot:String = ap.actorXML.databag.allchar.shotActor
				aa.maxActiveShots = (spawnShot == null || spawnShot == "") ? 0 : int(ap.actorXML.databag.allchar.shotRateNum)
				
				aa.alive = true
				aa.birthTweenCount = G_tweenCount
				activeActors[thisAAidx] = aa
				
				preLoadPotentialSpawns(ap)
				
				if (dropPersists)
					aa.respawnId = respawnId ? respawnId : markSpawnedActorForAutoRespawn(this.mapPiece.name, actorName, aa.startx, aa.starty)
			}
			return thisAAidx
		}
		
		// playCleanupActiveLayer - called when a game ends on a map - undo what playPrepareActiveLayer did
		private function playCleanupActiveLayer():void
		{
			for (var AA:int = 0; AA < activeActors.length; AA++)
				activeActors[AA] = null
			activeActors.length = 0
		}

	    // Play ball!
	    public function playGame():Boolean		// returns true if the game successfully started
	    {
	    	// The game really happens with things moving on Layer "layerActive". Other layers don't move
			setGameStatusString("Starting game")
			clearGameStatusString2()
			pauseGame = false
			hideNpcMessage()
			respawnMemory = new Array()
			cancelAllSpawnedActorsForAutoRespawn()
			initialMap = new MgbMap()					// Save this in case we load another while playing
			initialMap.loadPieceFromPiece(mapPiece)		// Save this in case we load another while playing
			
			var num_players:int = playPrepareActiveLayer(mapPiece)
			if (0 == num_players)
	    	{
	    		Alert.show(setGameStatusString("No player defined for this map"))
	    		return false
	    	}
			if (num_players > 1)
	    	{
	    		Alert.show(setGameStatusString("A map can only have one player on it; this map has "+num_players+" player actors on the map"))
	    		return false
	    	}
						
			playPrepareBackgroundLayer()
			
			// Set up and start Game events
			transitionStateWaitingForActorLoadRequests = false
			transitionInProgress = false
	    	G_tweenCount = 0;
	    	enablePlayerControls()
        	addEventListener( "enterFrame", onTickGameDo )
	    	G_gameOver = false
	    	var now:Date = new Date()
	    	G_gameStartedAtMS = now.getTime()
	    	
	    	//initialise inventory
	    	inventory = new Inventory()
	    	
	    	if (!mgbSession.alertOnceAboutKeys)
	    	{
		    	var playerActor:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA_player_idx].ACidx))
		    	showNpcMessage({message:"Use the arrow keys to move/push and 'Enter' to shoot (if allowed)", leftActor:playerActor})
		    	mgbSession.alertOnceAboutKeys = true
		    }
	    	return true
		}


		private static var transitionInProgress:Boolean = false
		private static var transitionNewX:int
		private static var transitionNewY:int
		private static var transitionPlayerAA:ActiveActor
		private static var transitionStateWaitingForActorLoadRequests:Boolean = false


		private function preloadThisMap():void
		{
			actorLoadsPending = 0	// TODO -  Hmm, be nice to have something more robust..
			var userName:String = mapPiece.userName
			var project:String = mapPiece.projectName
			for (var layer:int = 0; layer<MgbMap.layerVisibleActorsCount; layer++)
			{
				var maxCell:int = mapPiece.width * mapPiece.height
				for (var cell:int = 0; cell < maxCell; cell++)
				{
					var actorName:String = mapPiece.mapLayerActors[layer][cell]
					if (actorName != null && MgbActor(actorCache.getPieceIfCached(userName, project, actorName)) == null)
						loadActorByName(actorName)
				}
			}
			if (actorLoadsPending == 0)
			{
				// Cool, it was all cached!
				notifyThatGameIsReadyToPlay()
			}
		}

		private function transitionToNewMap(userName:String, projectName:String, newmapname:String, newX:int, newY:int):void
		{
			transitionPlayerAA = activeActors[AA_player_idx]
			playCleanupActiveLayer()
			playCleanupBackgroundLayer()
			mapPiece.loadByName(userName, projectName, newmapname, loadMapDuringGameResult)
			transitionNewX = newX
			transitionNewY = newY
			transitionStateWaitingForActorLoadRequests = true
			transitionInProgress = true
		}
		
	    private function loadMapDuringGameResult(event:Event):void 
	    {
	    	// FIXME: error cases???
	    	preloadResourcesNeededForMap()
		}
		
		private function preloadResourcesNeededForMap():void
		{
			actorLoadsPending = 0	// TODO -  Hmm, be nice to have something more robust..
			preloadThisMap()
			transitionStateWaitingForActorLoadRequests = false	
		}
		
		// Called on 'Tick' by game loop if transitioning to new map
		private function transitionTick():void
		{
			if (transitionStateWaitingForActorLoadRequests || actorLoadsPending > 0)
			{
				trace("transitionTick: "+actorLoadsPending+" actor loads still Pending")
				if (view.alpha > 0.1)
					view.alpha -= 0.1
			}
			else
			{
				if (view.alpha < 1.0)
				{
					// Fade it in - looks nice
					view.alpha += 0.1
					if (view.alpha > 1.0)
						view.alpha = 1.0
					return
				}
				// Fade-in done.. We're ready to play!
				playPrepareActiveLayer(mapPiece, true)
				playPrepareBackgroundLayer()
	
		    	transitionPlayerAA.x = transitionNewX
		    	transitionPlayerAA.fromx = transitionNewX
		    	transitionPlayerAA.y = transitionNewY
		    	transitionPlayerAA.fromy = transitionNewY
				transitionPlayerAA.renderX = transitionPlayerAA.fromx * MgbSystem.tileMinWidth
				transitionPlayerAA.renderY = transitionPlayerAA.fromy * MgbSystem.tileMinHeight
	
		    	transitionPlayerAA.currentActiveShots = 0
	
				AA_player_idx = activeActors.length
				activeActors[AA_player_idx] = transitionPlayerAA
		    	
				scrollMapToSeePlayer()
	
				G_tic = null
				G_tweenCount = 0
				applyZoomLevel()		// measure and redraw
				transitionInProgress = false
				clearPlayerKeys()
			}
		}

		private function playPushItemToStartSliding(AA_pusher_idx:int, AA_item_idx:int):void
		{
			// 0. Some shortcuts
			var aap:ActiveActor = activeActors[AA_pusher_idx]
			var aai:ActiveActor = activeActors[AA_item_idx]
			
			// 1. Work out direction of movement
			var dx:int = aap.x - aap.fromx
			var dy:int = aap.y - aap.fromy
        	if (dy < 0 && dx == 0)
        		aai.stepStyle = 0		// N
        	else if (dx > 0 && dy == 0)
        		aai.stepStyle = 1		// E
        	else if (dy > 0 && dx == 0)
        		aai.stepStyle = 2		// S
        	else if (dx < 0 && dy == 0)
        		aai.stepStyle = 3		// W
        	else
        		return // throw new Error("Unknown direction type ("+dx+","+dy+") in playPushItemToStartSliding()")  ??
        	
			// 2. Move the block
			aai.isSliding = true
			aai.moveSpeed = 1				// Special case - see note in class definition
	        calculateNewEnemyPosition(AA_item_idx)
	        if (aai.y < 0 || aai.x < 0 || aai.x >= mapPiece.width || aai.y >= mapPiece.height || checkIfActorObstructed(AA_item_idx, true))
	        {
	        	// Not a valid new space; revert to staying in place
	        	aai.x = aai.fromx;
	        	aai.y = aai.fromy;
	        	aai.stepCount = 0;				// Reset the step count; used to trigger a new movement choice.
				aai.isSliding = false
				aai.moveSpeed = 0				// Special case - see note in class definition

	        	// This means the pusher is blocked also - we need to put them back in place
	        	aap.x = aap.fromx
	        	aap.y = aap.fromy
	        	aap.xMovePerTween = 0			// TODO: Might be nicer to calculate how to tween this..?
	        	aap.yMovePerTween = 0			// TODO: Might be nicer to calculate how to tween this..?
				aap.renderX = aap.fromx * MgbSystem.tileMinWidth
				aap.renderY = aap.fromy * MgbSystem.tileMinHeight
	        }
	        else
	        {
		        // The space is available. Convert intended move into per-tween amounts and move
		        aai.xMovePerTween = (aai.x - aai.fromx) * (MgbSystem.tileMinWidth / (G_tweensPerTurn - (G_tweenCount-1)))
	    	    aai.yMovePerTween = (aai.y - aai.fromy) * (MgbSystem.tileMinHeight / (G_tweensPerTurn - (G_tweenCount-1)))
	    	    G_tic = null;			// Important, need to invalidate the collision detection cache. TODO Potentially just update the cells we know have changed - i.e. aai.x,aai.y
	        }
		}

		// Called when either a sliding block hits something solid, OR when a shot has hit it's target.
		// This function only handles the effects on the shot/block, not on what it hit
		private function playStopItemSliding(aai:ActiveActor):void
		{
			aai.isSliding = false
			aai.moveSpeed = 0
			aai.stepCount = 0
			aai.renderX = aai.x * MgbSystem.tileMinWidth
			aai.renderY = aai.y * MgbSystem.tileMinHeight
			if (aai.isAShot)
				destroyShot(aai)
		}

		private function addCellsActorIsFacingToCellList(cellList:Array, actor:ActiveActor, stepStyle:int):void
		{
			var x:int, y:int, w:int = 1, h:int = 1
			
			switch (stepStyle)
			{
				case 0:		// North
					x = actor.x
					y = actor.y - 1
					w = actor.cellSpanX
					break
				case 1:
					x = actor.x + actor.cellSpanX
					y = actor.y
					h = actor.cellSpanY
					break
				case 2:
					x = actor.x
					y = actor.y + actor.cellSpanY
					w = actor.cellSpanX
					break
				case 3: 
					x = actor.x - 1
					y = actor.y
					h = actor.cellSpanY
			}
			for (var i:int = x; i < x+w ; i++)
			{
				for (var j:int = y; j < y+h; j++)
				{
					addValidCellToCellList(cellList, i, j)
				}
			}
		}	

		private function addValidCellToCellList(cellList:Array, x:int, y:int):void
		{
			var cellIndex:int = cell(x, y, true)
			if (cellIndex != -1)
				cellList.push(cellIndex)
		}	

		private function checkForGeneratedActorsThisSecond():void
		{
			for (var AA:int = 0; AA < activeActors.length; AA++)
			{
				var actor:ActiveActor = activeActors[AA]
				if (actor.alive && actor.birthTweenCount != G_tweenCount)
				{
					var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actor.ACidx))
					var spawn:String = ap.actorXML.databag.itemOrNPC.dropsObjectRandomlyName
					if (spawn && spawn !="")
					{
						var dropChancePct:int = ap.actorXML.databag.itemOrNPC.dropsObjectRandomlyChance
						if ((100 * Math.random()) < dropChancePct)
						{			
							var p:Point = findAdjacentFreeCellForDrop(AA, ActiveActor(activeActors[AA]).stepStyle, true)
							if (p)
							{
								playSpawnNewActor(loadActorByName(spawn), p.x, p.y)
								G_tic = null;			// Important, need to invalidate the collision detection cache.
							}
						} 
					}
				}
			}
		}

		private function checkForTouchDamageAtStartOfTween():void 
		{
	        G_tic = null
		    generateTicTable()
			// Calculate moves (watch out for obstructions)
			for (var AA:int = 0; AA < activeActors.length; AA++)
			{
				var actor:ActiveActor = activeActors[AA]
				var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actor.ACidx))
				var touchDamageToNpcOrItem:int = int(ap.actorXML.databag.allchar.touchDamageToNPCorItemNum)
				var touchDamageToPlayer:int = int(ap.actorXML.databag.allchar.touchDamageToPlayerNum)
				var touchDamageCase:int = int(ap.actorXML.databag.allchar.touchDamageCases)
				
				if (touchDamageCase != MgbActor.alTouchDamageCases_WhenOverlapped && 
						actor.alive == true && 
						(touchDamageToNpcOrItem != 0 || touchDamageToPlayer != 0))		// Actor is alive, and has some touch damage effect that goes beyond overlapped squares (that case is handled in the collision system, not here in this adjacency system)
				{
					// For this actor, build the list of cells we need to check for touch damage. This is affected by actor size, position, direction, and touch damage rules
					var cellList:Array = new Array()
					if (touchDamageCase == MgbActor.alTouchDamageCases_WhenAdjacent)
					{
						// need to add all 4 directions
						for (var k:int = 0 ; k < 4; k++)
							addCellsActorIsFacingToCellList(cellList, actor, k)
					}
					else
					{
						// Just add one direction
						addCellsActorIsFacingToCellList(cellList, actor, actor.stepStyle)
					}
					// Now look in each cell
					for (var i:int = 0; i < cellList.length; i++)
					{
						var cellToCheck:int = cellList[i]
						if (G_tic[cellToCheck] && G_tic[cellToCheck].length > 0)
						{
							// and look at every actor that is in that cell
						    for (var j:int = 0; j < G_tic[cellToCheck].length; j++)
							{
							    var AAInCell:int = G_tic[cellToCheck][j]
							    var ACidx:String = activeActors[AAInCell].ACidx
								var hitThing_ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
								var touchDamageToApply:int = (AAInCell == this.AA_player_idx) ? touchDamageToPlayer : touchDamageToNpcOrItem
								if (AAInCell != AA && 0 == hitThing_ap.actorXML.databag.item.pushToSlideNum)		// Can't do touch damage to self or sliding blocks
									applyDamageToActor(AAInCell, hitThing_ap, touchDamageToApply, int(ap.actorXML.databag.allchar.touchDamageAttackChance))
							}
						}
					}
				}
			}
		}
		
		// This routine checks for aliveness, damageability, invulnerability, player armor and also plays sounds. Doesn't automatically calculate % chance of attack - sincethat depends on factors
		private function applyDamageToActor(actorIdx:int, ap:MgbActor, damage:int, attackChancePct:int = 100, playDamageSound:Boolean = true):Boolean	// returns true if the actor did receive damage
		{
			if (damage && attackChancePct != 100 && attackChancePct != 0 )		// 0 == 100%.. older objects have this value as 0 since it was introduced later
				damage = ((100 * Math.random()) < attackChancePct) ? damage : 0
				
			if (damage)
			{
				if (actorIdx == AA_player_idx)
					damage = reduceDamageByPlayerArmor(damage)
				if (activeActors[actorIdx].alive == false ||
						(MgbActor.alGainPowerType_Invulnerable == activeActors[actorIdx].activePower && activeActors[actorIdx].activePowerUntilTweenCount >= G_tweenSinceMapStarted))
					damage = 0
				if (ap.actorXML.databag.itemOrNPC.destroyableYN != 1)
					damage = 0
			}
			if (damage)
			{
				activeActors[actorIdx].health -= damage
				if (playDamageSound)
					MgbActor.playCannedSound(ap.actorXML.databag.all.soundWhenHarmed)								// TODO: ap1.actorXML.databag.all.visualEffectWhenHarmedType  
			}
			return damage != 0
		}
		
		private function reduceDamageByPlayerArmor(baseDamage:int):int
		{
			var result:Number = (baseDamage * (100-inventory.equipmentArmorEffect)) / 100
			if (result < 1 && baseDamage >=1)
			{
				// we'll turn this into a % chance to get 1 damage.
				result = Math.random() < result ? 1 : 0
			}	
			return result > 0 ? result : 0			// Never return a -ve number
		}
		
	    private function onTickGameDo(evt:Event):void 
		{
			// Start with soem basic housekeeping for transitions, game pause & per-second actions 
			if (transitionInProgress)
			{
				transitionTick()
				return
			}
			if (pauseGame)
				return
				
			if (G_tweenSinceMapStarted % stage.frameRate == 0)
			{
				// These are actions we run once per second
				checkForGeneratedActorsThisSecond()
			}
				
			// Now for the real actions	
			if (0 == G_tweenCount)
			{
				// Tweencount of zero means start of turn
				
				askDeferredNpcQuestion()
				
				// This is the first tween this turn - decide what to do this turn. 
				// The remaining tweens for this turn will just animate what we decide now

				// Check for player collision with an event square. These only check against the player's top-left 32x32 pixel 'head'
				var plyr:ActiveActor = activeActors[AA_player_idx]
				var plyrCell:int = cell(plyr.x, plyr.y)
				var eventString:String = mapPiece.mapLayerActors[MgbMap.layerEvents][plyrCell]
				if (eventString)
				{
					var o:Object = CommandEngine.parse(eventString)
					if (o.command == "jump")
					{
						trace("event: "+eventString)
						transitionToNewMap(mapPiece.userName, mapPiece.projectName, o.mapname, o.x, o.y)
						return
					}
					else if (o.command == "music")
					{
						if (MgbActor.isSoundNonNull(o.source))
				    		playMusic(o.source)
						else 
							stopMusic()
					}
				}

		        G_tic = null		// Important, need to invalidate the collision detection cache. In theory we could only do this if at least one thing moved, but that's unlikely so not worth the grief...
		        
		        checkForTouchDamageAtStartOfTween()
		        
				// Calculate moves (watch out for obstructions)
				for (var AA:int = 0; AA < activeActors.length; AA++)
				{
					var actor:ActiveActor = activeActors[AA]
	        		var aa_p:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actor.ACidx))
	        		
					if (actor.alive == true && actor.moveSpeed > 0)
					{
						// Determine move intent
						var oldStepStyle:int = actor.stepStyle			// If it's ice, we need to remember
						var stepStyleOverride:int = -1					// -1 means no override
				        actor.fromx = actor.x
				        actor.fromy = actor.y
				        
				        // Some blocks on the BACKGROUND layer can affect direction - ice, conveyer belts, pushers... Let's look for these
				        var floorActor:MgbActor = null	// this will be the actor that is on the background layer

						// We need an x/y loop so we check each cell that the current actor is on
				        for (var pushX:int = 0; pushX < actor.cellSpanX; pushX++)
				        {
					        for (var pushY:int = 0; pushY < actor.cellSpanY; pushY++)
					        {
					        	var cellIndex:int = cell(actor.x + pushX, actor.y + pushY, true)
					        	if (cellIndex >=0)
					        	{
									var floorActorName:String = mapPiece.mapLayerActors[MgbMap.layerBackground][cellIndex]
									floorActor = floorActorName ? MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, floorActorName)) : null
									if (floorActor && floorActor.actorXML && 
											floorActor.actorXML.databag.all.actorType == MgbActor.alActorType_Item && 
											(int(floorActor.actorXML.databag.item.itemActivationType) == MgbActor.alItemActivationType_CausesDamage ||
											 int(floorActor.actorXML.databag.item.itemActivationType) == MgbActor.alItemActivationType_PushesActors ))
										break
									floorActor = null
					        	}
					        }
					    }
					    if (floorActor && int(floorActor.actorXML.databag.item.itemActivationType == MgbActor.alItemActivationType_PushesActors))
						{
							switch (int(floorActor.actorXML.databag.item.itemPushesActorType))
							{
								case MgbActor.alItemPushesActorType_up:
								case MgbActor.alItemPushesActorType_right:
								case MgbActor.alItemPushesActorType_down:
								case MgbActor.alItemPushesActorType_left:
									stepStyleOverride = int(floorActor.actorXML.databag.item.itemPushesActorType)
									break

								case MgbActor.alItemPushesActorType_onwards:
									if (!actor.wasStopped)
										stepStyleOverride = oldStepStyle
									break

								case MgbActor.alItemPushesActorType_backwards:
									// 0 <->2 , 1 <->3.. so basically
									if (oldStepStyle >= 0)
										stepStyleOverride = oldStepStyle ^ 2
									break

								case MgbActor.alItemPushesActorType_random:
									stepStyleOverride = Math.floor(Math.random() * 4)
									break
							}
						}
						if (floorActor && int(floorActor.actorXML.databag.item.itemActivationType) == MgbActor.alItemActivationType_CausesDamage)
							applyDamageToActor(AA, aa_p, int(floorActor.actorXML.databag.item.healOrHarmWhenUsedNum))

				        if (AA == AA_player_idx)
					        calculateNewPlayerPosition(stepStyleOverride)
				        else
					        calculateNewEnemyPosition(AA, stepStyleOverride)			// Note this can cause actor.alive -> 0
					    // Calculate pre-collisions (obstructions)
				        if (actor.alive == true && 
				        	(checkIfActorObstructed(AA, true) || actor.y < 0 || actor.x < 0 || (actor.x + actor.cellSpanX) > mapPiece.width || (actor.y + actor.cellSpanY) > mapPiece.height))
				        {
				        	// Not a valid new space; revert to staying in place
							var cellToCheck:int = cell(actor.x,actor.y)		// put this in a var to eliminate multiple lookups.
				        	actor.x = actor.fromx
				        	actor.y = actor.fromy
				        	actor.wasStopped = true
//					        	actor.stepStyle = -1		// These need to be free to move again. -1 means if they are on ice, they have stopped sliding and are free to choose their movement direction again
				        	actor.stepCount = 0				// Reset the step count; used to trigger a new movement choice.

					        if (AA == AA_player_idx)
					        {
					        	// Who did we just bump into? Did they want to say or do something?
				        		if (G_tic == null)
				        			generateTicTable()
								if (G_tic[cellToCheck] && G_tic[cellToCheck].length > 0)
								{
								    for (var i:int = 0; i < G_tic[cellToCheck].length; i++)
									{
									    var AAInCell:int = G_tic[cellToCheck][i]
									    var ACidx:String = activeActors[AAInCell].ACidx
										var hitThing_ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
										var activation:int = int(hitThing_ap.actorXML.databag.item.itemActivationType)
										
										if (activeActors[AAInCell].alive && AAInCell != AA)
										{
											// It's alive & not 'me'... 	
											if (activeActors[AAInCell].type == MgbActor.alActorType_NPC)
											{
												// Case 1: Player just collided with an NPC. This can spark a dialog
												askNpcQuestion(activeActors[AAInCell], hitThing_ap) 
											}
											else if (activeActors[AAInCell].type == MgbActor.alActorType_Item 
													 && (activation == MgbActor.alItemActivationType_BlocksPlayer || activation == MgbActor.alItemActivationType_BlocksPlayerAndNPC))
											{
												// Case 2: It's a wall, I'm a player so see if there's a key available...
												var key:String = hitThing_ap.actorXML.databag.item.keyForThisDoor
												if (key != null && key != "")
												{
													// yup, there's a key. Next question - does the player have it?
													 var keyItem:InventoryItem = inventory.get(key)
													 if (keyItem)
													 {
													 	var keyDestroyed:Boolean = (1 == int(hitThing_ap.actorXML.databag.item.keyForThisDoorConsumedYN))
													 	// Yup.. so let's do it!
													 	setGameStatusString2(keyDestroyed ? 
													 							("You use your "+key+" to pass") : 
													 							("Since you are carrying the "+key+" you are able to pass through"))
													 	if (keyDestroyed)
													 		inventory.remove(keyItem)
													 	activeActors[AAInCell].health = 0	/// This triggers all the usual spawn stuff
													 }
												}
											}
										}
									}
								}
					        }

				        	if (actor.isSliding)				// Sliding block or shot
				        	{
								if (1 == int(aa_p.actorXML.databag.item.squishNPCYN) || (actor.isAShot && (actor.shotDamageToNPC != 0 || actor.shotDamageToPlayer != 0)))
								{
					        		// Check Squish effect
					        		if (G_tic == null)
					        			generateTicTable()
									if (G_tic[cellToCheck] && G_tic[cellToCheck].length > 0)
									{
									    for (i = 0; i < G_tic[cellToCheck].length; i++)
									    {
										    AAInCell = G_tic[cellToCheck][i]
										    ACidx = activeActors[AAInCell].ACidx
											hitThing_ap = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
											var damage:int = 0
											if (activeActors[AAInCell].alive && AAInCell != AA && (activeActors[AAInCell].type == MgbActor.alActorType_NPC || activeActors[AAInCell].type == MgbActor.alActorType_Player))
											{
												if (actor.isAShot)
												{
													if (AAInCell == AA_player_idx)
													{
														if (!(activeActors[AAInCell].activePowerUntilTweenCount >= G_tweenSinceMapStarted && 
															MgbActor.alGainPowerType_Invulnerable == activeActors[AAInCell].activePower))
																damage = actor.shotDamageToPlayer 
													}
													else
														damage = actor.shotDamageToNPC
												}
												else
													damage = activeActors[AAInCell].health
											}
											if (damage)
												applyDamageToActor(AAInCell, hitThing_ap, damage)
									    }
									}
								}
								if (actor.alive)
									playStopItemSliding(actor)
				        	}
				        }
				        else
					        actor.wasStopped = false	// moved OK
				        // Convert intended move into per-tween amounts
				        actor.xMovePerTween = (actor.x - actor.fromx) * (MgbSystem.tileMinWidth / G_tweensPerTurn)
				        actor.yMovePerTween = (actor.y - actor.fromy) * (MgbSystem.tileMinHeight / G_tweensPerTurn)
				        
				        if (actor.turnsBeforeMeleeReady > 0)
							actor.turnsBeforeMeleeReady--	//
					}
			   	}
		        G_tic = null		// Important, need to invalidate the collision detection cache. In theory we could only do this if at least one thing moved, but that's unlikely so not worth the grief...
   		        scrollMapToSeePlayer()
		        G_tweenCount++
		        G_tweenSinceMapStarted++
		 	}
	        
	        // Now, for this tween, move each Actor a little bit
			for (AA = 0; AA < activeActors.length; AA++)
			{
				if (activeActors[AA].alive)
				{
					chooseActiveActorDisplayTile(AA)	// Switch bitmap if necessary
					// Move by tweened amount
					if (activeActors[AA].xMovePerTween || activeActors[AA].yMovePerTween)
					{
						var xo:int = activeActors[AA].xMovePerTween * G_tweenCount
						var yo:int = activeActors[AA].yMovePerTween * G_tweenCount
						activeActors[AA].renderX = activeActors[AA].fromx * MgbSystem.tileMinWidth+xo
						activeActors[AA].renderY = activeActors[AA].fromy * MgbSystem.tileMinHeight+yo
					}
				}
			}
			
	        // Now, for this tween, check for post-move collisions between *alive* actors- item/enemy/player touch events
			playProcessAACollisions()
			
			// Update scroll position (by tweened amount) if this is the player
			if (G_VSPdelta)
				Container(parent).verticalScrollPosition += G_VSPdelta;
			if (G_HSPdelta)
				Container(parent).horizontalScrollPosition += G_HSPdelta;

			// Housekeeping for end-of-turn
			// TODO: Kill & recycle dead enemies
			for (AA = 0; AA < activeActors.length; AA++)
			{
				if (activeActors[AA].alive)
				{
					var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA].ACidx))
					
					// limit any heals to not exceed Max health
					if (activeActors[AA].maxHealth != 0 && activeActors[AA].health > activeActors[AA].maxHealth)
						activeActors[AA].health = activeActors[AA].maxHealth
						
					// Next actions on Melee
					switch (activeActors[AA].meleeStep)
					{
						case ActiveActor.MELEESTEP_NOT_IN_MELEE:	// Not in Melee
							break		// do nothing
						case 7:		// Final Melee step
							activeActors[AA].meleeStep = ActiveActor.MELEESTEP_NOT_IN_MELEE		// End of Melee
							activeActors[AA].turnsBeforeMeleeReady = ap.actorXML.databag.allchar.meleeRepeatDelay
							if (AA == AA_player_idx && inventory.equipmentMeleeRepeatDelayModifier)
								activeActors[AA].turnsBeforeMeleeReady += int(inventory.equipmentMeleeRepeatDelayModifier)
							if (activeActors[AA].turnsBeforeMeleeReady < 0)
								activeActors[AA].turnsBeforeMeleeReady = 0
							break
						default:
							activeActors[AA].meleeStep++
							break
					}
					
					switch (activeActors[AA].type)
					{
						case MgbActor.alActorType_Player:
							if (activeActors[AA].health <= 0)
							{
								// TODO: player's ...actorXML.databag.all.visualEffectWhenKilledType
								G_gameOver = true;
							}
							else if (activeActors[AA].winLevel)
								G_gameOver = true;

							break
						case MgbActor.alActorType_NPC:
						case MgbActor.alActorType_Item:
							if (activeActors[AA].health <=0)		// We don't check ap.actorXML.databag.itemOrNPC.destroyableYN here; that should be done in the damage routine. This way we can handle death/usage the same way
							{
								// It dies... 
								activeActors[AA].health = 0;
								activeActors[AA].alive = false;
								activeActors[AA].dyingAnimationFrameCount = 1;			// TODO - need to distinguish usage from destruction
								// Player gets bounty
								activeActors[AA_player_idx].score += int(ap.actorXML.databag.itemOrNPC.scoreOrLosePointsWhenKilledByPlayerNum)
								// Get rid of the bitmap
								activeActors[AA].renderBD = null					// TODO, nice explosion/fade/usage animations
								
								switch (activeActors[AA].creationCause)
								{
									case ActiveActor.CREATION_BY_MAP:
										if (int(ap.actorXML.databag.itemOrNPC.respawnOption) == MgbActor.alRespawnOption_Never && activeActors[AA].respawnId)
										{
											// we need to know to persistently kill this piece based on it's original layer etc. 
											// We remember it's final coordinates since some respawn options need to know this
											respawnMemory[activeActors[AA].respawnId] = {x:activeActors[AA].x, y:activeActors[AA].y}
										}
										break
									case ActiveActor.CREATION_BY_SPAWN: 
										cancelSpawnedActorForAutoRespawn(mapPiece.name, activeActors[AA].respawnId)
										break
								}
								
								// There's a drop...
								var drop1Happened:Boolean = false
								var spawn:String = ap.actorXML.databag.itemOrNPC.dropsObjectWhenKilledName
								if (spawn && spawn !="")
								{
									var dropChancePct:int = ap.actorXML.databag.itemOrNPC.dropsObjectWhenKilledChance
									if (dropChancePct == 0 || ((100 * Math.random()) < dropChancePct))
									{			
										playSpawnNewActor(loadActorByName(spawn), activeActors[AA].x, activeActors[AA].y)
										G_tic = null;			// Important, need to invalidate the collision detection cache.
										drop1Happened = true
									} 
								}
								
								// There's a 2nd drop.. These may go in a direction away from the actor
								spawn = ap.actorXML.databag.itemOrNPC.dropsObjectWhenKilledName2
								if (spawn && spawn !="")
								{
									dropChancePct = ap.actorXML.databag.itemOrNPC.dropsObjectWhenKilledChance2
									if (dropChancePct == 0 || ((100 * Math.random()) < dropChancePct))
									{
										var p:Point = drop1Happened ? findAdjacentFreeCellForDrop(AA, ActiveActor(activeActors[AA]).stepStyle) : new Point(activeActors[AA].x, activeActors[AA].y)
										playSpawnNewActor(loadActorByName(spawn), p.x, p.y)
										G_tic = null;			// Important, need to invalidate the collision detection cache.
									} 
								}
							}
							break
					}
				}
			}
			
			checkForAppearingAndDisappearingActors()			// Actually could just do this if we life/death cases
			
	        G_tweenCount = (G_tweenCount + 1) % (G_tweensPerTurn + 1)
			G_tweenSinceMapStarted++
	        var ps:String = ""
	        if (activeActors[AA_player_idx].activePower && activeActors[AA_player_idx].activePowerUntilTweenCount >= G_tweenSinceMapStarted)
	        	ps = "  Active Power = "+MgbActor.alGainPower[activeActors[AA_player_idx].activePower]

			var now:Date = new Date()
			var secondsPlayed:int = (now.getTime() - G_gameStartedAtMS) / 1000
			var minutesPlayed:int = secondsPlayed / 60
			var hoursPlayed:int = minutesPlayed / 60
			var timeStr:String = ""
			if (hoursPlayed)
				timeStr += hoursPlayed+":"
			timeStr += (minutesPlayed % 60 < 10 ? "0" : "") + (minutesPlayed % 60) + "."
			timeStr += (secondsPlayed % 60 < 10 ? "0" : "") + (secondsPlayed % 60)

			var mhs:String = activeActors[AA_player_idx].maxHealth == 0 ? "" : ( "/" + activeActors[AA_player_idx].maxHealth)
	        setGameStatusString(//"Lives: "+activeActors[AA_player_idx].extraLives   +
	        					"Health "+activeActors[AA_player_idx].health  + mhs +
	        					"     Score "+activeActors[AA_player_idx].score+ ps +
	        					"     Time "+timeStr)
	        					
	        pleaseRedrawMapSoon()			// In theory we could save CPU by not calling this always, as soon as any actor is animated, there's no perf benefit - so not worth the added complexity
			if (G_gameOver)
			{
				var gee:GameEngineEvent = new GameEngineEvent(GameEngineEvent.COMPLETED, 
																initialMap.userName, initialMap.projectName, initialMap.name,
																true, secondsPlayed, activeActors[AA_player_idx].score)

				if (activeActors[this.AA_player_idx].winLevel)
				{
					Alert.show("Final Score: "+activeActors[AA_player_idx].score +
	        					", Time: "+timeStr, "You Win!")
			    }
				else
				{
					Alert.show("G A M E   O V E R\n", "They got you...")
					gee.completedVictory = false		// Change just one parameter...
				}
				dispatchEvent(gee)
				endGame()
			}
	    }
	    
	    private function checkForAppearingAndDisappearingActors():void
	    {
	    	// The 'conditions' parameters of an actor say that an actor can appear/disappear if certain conditions are met
	    	//
	    	// This should only be called 
	    	//     (a) at the initial load of a map (after the ActiveActors array has been populated
	    	//     (b) after an actor is destroyed or spawned
	    	
	    	// First, count how many of each actor are on screen ('alive')
	    	var ach:Array = new Array				// Actor Count Hash
			var aalen:int = activeActors.length
   			for (var AAi:int = 0; AAi < aalen; AAi++)
   			{
   				if (activeActors[AAi].alive)
   				{
   					var name:String = activeActors[AAi].ACidx
		   			ach[name] = ach[name] ? ach[name] + 1 : 1
   				}
   			}

			// Now, if any have 'conditions', apply them
			for (AAi = 0; AAi < aalen; AAi++)
			{
				var aa:ActiveActor = activeActors[AAi]
		    	var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, aa.ACidx))
	    		var conditionsActor:String = ap.actorXML.databag.itemOrNPC.conditionsActor ? ap.actorXML.databag.itemOrNPC.conditionsActor  : null
	    		var appearIf:int = ap.actorXML.databag.itemOrNPC.appearIf ? ap.actorXML.databag.itemOrNPC.appearIf : MgbActor.alAppearDisappear_NoCondition
	    		var appearCount:int = ap.actorXML.databag.itemOrNPC.appearCount ? ap.actorXML.databag.itemOrNPC.appearCount : 0
	    		if (appearIf != MgbActor.alAppearDisappear_NoCondition)
	    		{
			    	if (ap && ap.actorXML.databag.itemOrNPC.conditionsActor && conditionsActor != "")
			    	{
			    		var count:int = ach[conditionsActor] == null ? 0 : ach[conditionsActor]
			    		if (appearCount == count)
			    			activeActors[AAi].alive = (appearIf == MgbActor.alAppearDisappear_Appear) && activeActors[AAi].health > 0
			    		else
			    			activeActors[AAi].alive = !(appearIf == MgbActor.alAppearDisappear_Appear) && activeActors[AAi].health > 0
			    	}
			    }
			}
	    }


		private function chooseActiveActorDisplayTile(AA:int):void
		{
			// 1. Reset any render offsets
			activeActors[AA].renderOffsetCellsX = 0
			activeActors[AA].renderOffsetCellsY = 0
			activeActors[AA].renderOffsetCellsWidth = 0
			activeActors[AA].renderOffsetCellsHeight = 0

			// 2. Get the actorPiece
			var ap:MgbActor
			if (AA == AA_player_idx && inventory.equipmentNewActorGraphics)
				ap = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, inventory.equipmentNewActorGraphics))
			else
				ap = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA].ACidx))

			// 3. Find out which tile to use
			
			var animationTableIndex:int = getAnimationIndex(ap, 
														(activeActors[AA].xMovePerTween == 0 && activeActors[AA].yMovePerTween == 0) ? -1 : activeActors[AA].stepStyle,
														activeActors[AA].stepStyle,  
														G_tweenCount,
														activeActors[AA].meleeStep)
														
			if (activeActors[AA].inMelee())
			{
				if (animationTableIndex == -1)
				{
					// No interesting Melee animation so just revert to using direction
					animationTableIndex = getAnimationIndex(	ap, 
																(activeActors[AA].xMovePerTween == 0 && activeActors[AA].yMovePerTween == 0) ? -1 : activeActors[AA].stepStyle,
																activeActors[AA].stepStyle,  
																G_tweenCount)	// Note - Melee Step purposely omitted
				}
				else
				{
					// Tile *was* specified-  we have a special case where if it's a melee tile we offset the UI
					if (activeActors[AA].inMelee())
					{
						activeActors[AA].renderOffsetCellsX = -1
						activeActors[AA].renderOffsetCellsY = -1
						activeActors[AA].renderOffsetCellsWidth = 2
						activeActors[AA].renderOffsetCellsHeight = 2
					}
				}
			} 
			
			var newTileName:String = getAnimationTileFromIndex(ap, animationTableIndex)
			var effect:String = getAnimationEffectFromIndex(ap, animationTableIndex)

			// Load the tile if necessary
			if (newTileName != "")
			{
				var newTilePiece:MgbTile = MgbTile(tileCache.getPiece(mapPiece.userName, mapPiece.projectName, newTileName))

				if (newTilePiece && newTilePiece.loadPending == false && newTilePiece.bitmapData)
					activeActors[AA].renderBD = newTilePiece.bitmapDataVariant(effect)
			}
		}

    	private var G_tic:Array = null					// TIC == "Things In Cell". Note that we need the main move routine to reset this when x/ and fromx/y change
		private function generateTicTable():void		// FIXME - needs to sort into larger cells - maybe MgbSystem.tileMax{Width/Height}
		{
			G_tic = new Array
	    	// Pigeon sort them into cells
	    	var len:int = activeActors.length			// Taking this out of the 'for' statement speeds things up a little
		    for (var AA1:int = 0; AA1 < len; AA1++)
			{
				if (activeActors[AA1].alive)
				{
					ticAdd(activeActors[AA1].x, activeActors[AA1].y, AA1)
					if (activeActors[AA1].x != activeActors[AA1].fromx || activeActors[AA1].fromy != activeActors[AA1].y)
						ticAdd(activeActors[AA1].fromx, activeActors[AA1].fromy, AA1) 	// Item is on the move, so list it in both 'from' and 'to' cells
				}	
			}
		}

		private function ticAdd(x:int, y:int, AAidx:int):void			
		{
			var aa:ActiveActor = activeActors[AAidx]

			var mW:int = mapPiece.width
			var mH:int = mapPiece.height
			var cX:int = aa.cellSpanX
			var cY:int = aa.cellSpanY
			
			x += aa.renderOffsetCellsX
			y += aa.renderOffsetCellsY
			cX += aa.renderOffsetCellsWidth
			cY += aa.renderOffsetCellsHeight
			
			// Loop is to account for cellSpanX,Y
			for (var x1:int = 0 ; x1 < cX && ((x + x1) < mW); x1++)
			{
				for (var y1:int = 0 ; y1 < cY && ((y + y1) < mH); y1++)
				{
					if (x+x1 >=0 && y+y1 >=0)		// Check if cell is in bounds. Note that we don't need to check for the bottom/right edges since that bound is covered by the the loop guards.
					{
						var cell:int = x + x1 + ((y + y1) * mW)
						if (G_tic[cell] == null)
							G_tic[cell] = new Array()
						G_tic[cell][G_tic[cell].length] = AAidx					/// TODO - look for dupes?
					}
				}
			}
		}
	    
	    // Return value is a list of activeArray[] indexes that have ActorCollision items
	    // Note that the array would include collision (A,B) but not (B,A)
	    // Important #1:  The returned array is arranged so that if the collision involves 
	    //                a player, the order in the ActorCollision is (player, other)
	    // Important #2:  The activeActors[] array is arranged such that it has moving enities, then non-moving. 
	    // 				  ... since we don't check non-moving vs non-moving for collision, we rely on this as a perf optimization
	    // Important #3:  The returned array will only include entries for which activeActors[x].alive is true
		//
		// The algorithm here is a variant of qtrees; we use sparse arrays to pigeon sort by cell#, then look for collisions within
		// the cell. We have to actually check to_cell and from_cell because 2 items could be switching positions. Finally we strip
		// duplicates out of the hits[] array
		
	    private function playFindAACollisions():Array
	    {
			var hits:Array = new Array()
			if (null == G_tic)
				generateTicTable()					// Positions have changed enough that we have to update the tic table

			// Now, check the cells for collisions
			var i:int = 0, j:int = 0;
			var AA2:int = 0;
			for (var cell:int = 0 ; cell < G_tic.length; cell++)
			{
				if (G_tic[cell] && G_tic[cell].length > 1)
				{
				    for (i = 0; i < G_tic[cell].length; i++)
				    {
					    var AA1:int = G_tic[cell][i]
					    var a1:ActiveActor = activeActors[AA1]
						if (a1.alive)
						{
							// First build an approximate list using the activeActors table. We'll use the bitmap x/y so this maps to user experience
						    for (j = i; j < G_tic[cell].length; j++)
							{
							    AA2 = G_tic[cell][j]
							    var a2:ActiveActor = activeActors[AA2] 
								if (a2.alive && AA1 < AA2)
								{
									// Note - calculating now in PIXELS...
									var x1:int = a1.renderX + (a1.renderOffsetCellsX * MgbSystem.tileMinWidth)
									var y1:int = a1.renderY + (a1.renderOffsetCellsY * MgbSystem.tileMinHeight)
									var w1:int = (a1.renderBD.width - 1) + (a1.renderOffsetCellsWidth * MgbSystem.tileMinWidth)
									var h1:int = (a1.renderBD.height - 1) + (a1.renderOffsetCellsHeight * MgbSystem.tileMinHeight)

									var x2:int = a2.renderX + (a2.renderOffsetCellsX * MgbSystem.tileMinWidth)
									var w2:int = (a2.renderBD.width - 1) + (a2.renderOffsetCellsWidth * MgbSystem.tileMinWidth)
									if ((x1 >= x2 && x1 < x2+w2) || (x2 >= x1 && x2 < x1+w1))
									{
										var y2:int = a2.renderY + (a2.renderOffsetCellsY * MgbSystem.tileMinHeight)
										var h2:int = (a2.renderBD.height - 1) + (a2.renderOffsetCellsHeight * MgbSystem.tileMinHeight) 
										if ((y1 >= y2 && y1 < y2+h2) ||	(y2 >= y1 && y2 < y1+h1))
										{
											// OK, now let's look really closely..
											if (a1.renderBD.hitTest(new Point (x1, y1), 0xF0, a2.renderBD, new Point (x2, y2), 0xF0))
											{
												if (AA2 == AA_player_idx)
													hits.push(new ActorCollision(AA2, AA1))		// Player is always first item in a collision pair
												else
													hits.push(new ActorCollision(AA1, AA2))
											}
										}
									}
								}
							}
						}
					}
				}
			}
			
			// hits could have dupes in it; we have to check
			if (hits.length > 1)
			{
				hits.sort(sortOnChoice);
				var hits2:Array = new Array()
				hits2[0] = hits[0]
				for (i = 1; i < hits.length; i++)
				{
					if (hits[i].AA1 != hits2[hits2.length-1].AA1 || hits[i].AA2 != hits2[hits2.length-1].AA2)
						hits2.push(hits[i])
				}
				hits = hits2
			}
			return hits
	    }

		private function sortOnChoice(a:ActorCollision, b:ActorCollision):Number 
		{
			var fa:int = (a.AA1 * activeActors.length) + a.AA2
			var fb:int = (b.AA1 * activeActors.length) + b.AA2
		    if (fa > fb) 
		        return 1;
		    else if (fa < fb)
		        return -1;
			else
		        return 0;
		}

		private function playProcessAACollisions():void
		{
			var hits:Array = playFindAACollisions()
			
			for (var hidx:int = 0; hidx < hits.length; hidx++)
			{
				var aa1_idx:int = hits[hidx].AA1
				var aa1:ActiveActor = activeActors[aa1_idx]
				var ap1:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[hits[hidx].AA1].ACidx))
				
				var t1:int = aa1.type;
				var aa2_idx:int = hits[hidx].AA2
				var aa2:ActiveActor = activeActors[aa2_idx]
				var ap2:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[hits[hidx].AA2].ACidx))
				var t2:int = aa2.type;
				// Since there is only one player, the collision can only be player/item, or item/item. 
				if (MgbActor.alActorType_Player == t1)		// Note the guarantees offered by playFindAACollisions()... Player is *never* the 2nd tuple
				{
					// Handle Player vs item/NPC collision
					switch (t2)
					{
						case MgbActor.alActorType_Player:
							throw new Error("Program error: player/player collision - should not happen")
							break
						case MgbActor.alActorType_NPC:
							// 1. Damage to player (aa1) from enemy (aa2)
							if (aa2.inMelee())
								applyDamageToActor(aa1_idx, ap1, int(ap2.actorXML.databag.allchar.meleeDamageToPlayerNum))
							else
								applyDamageToActor(aa1_idx, ap1, int(ap2.actorXML.databag.allchar.touchDamageToPlayerNum), int(ap2.actorXML.databag.allchar.touchDamageAttackChance))
							// 2. Touch Damage to enemy (aa2) from player (aa1)
							if (aa1.inMelee())
								applyDamageToActor(aa2_idx, ap2,
											Math.max(0, int(ap1.actorXML.databag.allchar.meleeDamageToNPCorItemNum) + inventory.equipmentMeleeDamageBonus))	// Can't be -ve damage, so use max(0, ...) 
							else
								applyDamageToActor(aa2_idx, ap2, int(ap1.actorXML.databag.allchar.touchDamageToNPCorItemNum), int(ap1.actorXML.databag.allchar.touchDamageAttackChance))
							break
						case MgbActor.alActorType_Shot:
							// Shot damage to player from shot; destroy shot
							if (aa2.actorWhoFiredShot != AA_player_idx && aa2.shotDamageToPlayer > 0)
							{
								// Only worry about shots from non-players and that can hurt the player
								applyDamageToActor(aa1_idx, ap1, aa2.shotDamageToPlayer)
								playStopItemSliding(aa2)
							}
							break
						case MgbActor.alActorType_Item:
							// 1. Effect of item on player (or vice versa)
							var itemUtilised:Boolean = false		// True if the item had some effect - so we can trigger events
							var itemConsumed:Boolean = false		// True if the item has been consumed and must be removed from play
							var showUseText:Boolean = false			// True if we should show the useText
							var activation:int = int(ap2.actorXML.databag.item.itemActivationType)
							switch (activation)				// Note that this switch only covers some of the cases, since only some are touch-based.
							{
								case MgbActor.alItemActivationType_PlayerPicksUpUsesNow:
									useItemOnPlayer(hits[hidx].AA2)
									itemUtilised = true
									itemConsumed = true
									showUseText = true									
									break
								case MgbActor.alItemActivationType_PlayerUsesAndLeavesItem:
									useItemOnPlayer(hits[hidx].AA2)
									itemUtilised = true
									// TODO: Need to put in some kind of hysterisys to stop continuous usage of items that remain in place...???
									break
								case MgbActor.alItemActivationType_PlayerPicksUpUsesLater:
									inventory.add(new InventoryItem(MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[hits[hidx].AA2].ACidx))))
									itemConsumed = true
									showUseText = true									
									break
								case MgbActor.alItemActivationType_BlocksPlayer:
								case MgbActor.alItemActivationType_BlocksPlayerAndNPC:
									if (int(ap2.actorXML.databag.item.pushToSlideNum)> 0)
										playPushItemToStartSliding(hits[hidx].AA1, hits[hidx].AA2)
									break
							}
							// 2. Touch Damage from player to item (if it's not a sliding item)
							if (aa1.inMelee())
							{
								if (ap1.actorXML.databag.allchar.meleeDamageToNPCorItemNum && 0 == ap2.actorXML.databag.item.pushToSlideNum)
									applyDamageToActor(aa2_idx, ap2, 
										Math.max(0, ap1.actorXML.databag.allchar.meleeDamageToNPCorItemNum + inventory.equipmentMeleeDamageBonus)) // Can't do -ve damage...
							}
							else
							{
								if (ap1.actorXML.databag.allchar.touchDamageToNPCorItemNum && 0 == ap2.actorXML.databag.item.pushToSlideNum)
									applyDamageToActor(aa2_idx, ap2, ap1.actorXML.databag.allchar.touchDamageToNPCorItemNum, int(ap1.actorXML.databag.allchar.touchDamageAttackChance))
							}
							// 3. Usage notification & after-effects
							if (itemConsumed)
							{
								// Notes: 
								//	(a) NPC/Item death processing is done at end of turn, not in this loop since it would muck up the hits[] array
								//  (b) usage isn't the same as destruction.. even if an item can't be destroyed, it can be used (consumed)
								aa2.health = 0				// That's how we mark this state of transition, even for items
							}
							if (itemUtilised)
							{
								// TODO: actorXML.databag.item.visualEffectWhenUsedType
								// TODO: actorXML.databag.item.UseText
							}
							if (showUseText)
							{
								var ut:String = ap2.actorXML.databag.item.useText
								if (ut && ut.length > 0)
									setGameStatusString2(ut)
							}
							
							break
						default:
							throw new Error("Program error: Unknown actor type "+t2)
					}
				}
				else
				{
					// Item-or-NPC/Item-or-NPC collisions
					for (var iteration:int = 0; iteration < 2; iteration++)
					{
						// We'll do this twice - once for AA1's effects on AA2, then we'll flip AA1/AA2 and do it again
						if (iteration)			// 2nd time through, let's swap - note that these assignments are flipped on purpose
						{
							aa1_idx = hits[hidx].AA2			//yes, this is right! we're flipping
							aa1 = activeActors[aa1_idx]
							ap1 = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[hits[hidx].AA2].ACidx))
							t1 = aa1.type;			// Yes - since aa1 is set for this guy now
							aa2_idx = hits[hidx].AA1
							aa2 = activeActors[aa2_idx]			//yes, this is right! we're flipping
							ap2 = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[hits[hidx].AA1].ACidx))

							t2 = aa2.type;
						}
						switch (t1)
						{
							case MgbActor.alActorType_NPC:
								// 1. Touch Damage from #1 to #2
								applyDamageToActor(aa2_idx, ap2, int(ap1.actorXML.databag.allchar.touchDamageToNPCorItemNum), int(ap1.actorXML.databag.allchar.touchDamageAttackChance))
								break
							case MgbActor.alActorType_Item:
							case MgbActor.alActorType_Shot:
								if (aa1.isSliding)												// Aha, a Sliding block or shot... 
								{
									if (aa1.isAShot)
									{
										// Shot hits: Damage target & destroy shot
										// we say that shot damage to items is the same as shot damage to npcs
										if (aa1.shotDamageToNPC != 0)	// if it's not destroyable, we'll let the bullet through. Walls have been handled elsewhere...
										{
											applyDamageToActor(aa2_idx, ap2, aa1.shotDamageToNPC)
											playStopItemSliding(aa1)
										}
									}
									else
									{
										// Sliding block
										if (t2 == MgbActor.alActorType_NPC && 1 == int(ap1.actorXML.databag.item.squishNPCYN))
										{
											aa2.health = 0
											MgbActor.playCannedSound(ap2.actorXML.databag.all.soundWhenHarmed)
											// TODO: ap1.actorXML.databag.all.visualEffectWhenHarmedType  
										}
										else
										{
								        	aa1.x = aa1.fromx;
								        	aa1.y = aa1.fromy;
											playStopItemSliding(aa1)
											if (t2 == MgbActor.alActorType_NPC && 0 == int(ap1.actorXML.databag.item.squishNPCYN && aa2.x == aa1.x && aa2.y == aa1.y))
											{
												// The NPC moves from position A to B, and sliding block (non-lethal type) moves from B to A. 
												// We need to move the NPC back
												aa2.x = aa2.fromx
												aa2.y = aa2.fromy
												aa2.xMovePerTween = 0
												aa2.yMovePerTween = 0
												aa2.renderX = aa2.fromx * MgbSystem.tileMinWidth
												aa2.renderY = aa2.fromy * MgbSystem.tileMinHeight
											}
										}
									}
								}
								break
						}
					}
				}
			}
		}

		
		private function useItemOnPlayer(itemAA:int):void
		{
			var itemAP:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[itemAA].ACidx))
			useItemActorOnPlayer(itemAP)
		}

		private function useItemActorOnPlayer(itemAP:MgbActor):void  	// This just handles the effects on the player, not the resulting effects (visuals, messages, destruction etc) on the item
		{
			var increasesMaxHealth:int = int(itemAP.actorXML.databag.item.increasesMaxHealthNum)
			if (increasesMaxHealth && activeActors[AA_player_idx].maxHealth != 0)
			{
				activeActors[AA_player_idx].maxHealth += increasesMaxHealth
				var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA_player_idx].ACidx))
				MgbActor.playCannedSound(increasesMaxHealth > 0 ? ap.actorXML.databag.all.soundWhenHealed : ap.actorXML.databag.all.soundWhenHarmed )  
				// TODO: Player's actorXML.databag.all.visualEffectWhenHarmedType / actorXML.databag.all.visualEffectWhenHealedType
			}
			
			var heal:int = int(itemAP.actorXML.databag.item.healOrHarmWhenUsedNum)
			if (heal)
			{
				activeActors[AA_player_idx].health += heal
				ap = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, activeActors[AA_player_idx].ACidx))
				MgbActor.playCannedSound(heal > 0 ? ap.actorXML.databag.all.soundWhenHealed : ap.actorXML.databag.all.soundWhenHarmed)								// TODO: ap1.actorXML.databag.all.visualEffectWhenHarmedType  
				// TODO: Player's actorXML.databag.all.visualEffectWhenHarmedType / actorXML.databag.all.visualEffectWhenHealedType
			}
			if (1 == int(itemAP.actorXML.databag.item.gainExtraLifeYN))
			{
				activeActors[AA_player_idx].extraLives++;
				// TODO: actorXML.databag.all.visualEffectWhenHealedType
			}
			var points:int = int(itemAP.actorXML.databag.item.gainOrLosePointsNum)
			if (points)
			{
				activeActors[AA_player_idx].score += points
			}
			if (1 == int(itemAP.actorXML.databag.item.winLevelYN))
			{
				activeActors[AA_player_idx].winLevel = true;
			}
			var power:int = int(itemAP.actorXML.databag.item.gainPowerType)
			if (power)
			{
				// Note, this just replaces any previous power; there is no accumulation of concurrent powers...
				activeActors[AA_player_idx].activePower = power
				var powersecs:int = int(itemAP.actorXML.databag.item.gainPowerSecondsNum)
				if (0 == powersecs)
					activeActors[AA_player_idx].activePowerUntilTweenCount = int.MAX_VALUE
				else
					activeActors[AA_player_idx].activePowerUntilTweenCount = G_tweenSinceMapStarted + (stage.frameRate * powersecs)
			}
		}
	
		private function endGame():void
		{
			stopMusic()
			pauseGame = false
			hideNpcMessage()
			hideInventory()
	    	disablePlayerControls()
        	removeEventListener( "enterFrame", onTickGameDo )
	    	G_gameOver = true							// Actually one of the conditions that causes the game loop to call endGame, but let's be sure :)
	    	G_tic = null
			gameEngineMode = GameEngine.GE_EDIT
	    	playCleanupActiveLayer()
	    	playCleanupBackgroundLayer()
			mapPiece.loadPieceFromPiece(initialMap)		// Replace the initial map that was used to start the game
	    	initialMap = null							// No longer needed
			var c:Container = Container(parent)
			c.horizontalScrollPosition = 0
			c.verticalScrollPosition = 0
			view.alpha = 1.0							// Just-in case anything bad happened mid-transition.
			applyZoomLevel()							// also fixes size and redraws
	    	setGameStatusString("Game Over")
	    	clearGameStatusString2()
			activeActors = new Array()					// Delete references, save memory
			respawnMemory = new Array()					// Delete references, save memory
			cancelAllSpawnedActorsForAutoRespawn()
		}
		
		private function startMeleeIfAllowed(actor:ActiveActor, isPlayer:Boolean):Boolean	// return true if started ok
		{
			if (!actor.inMelee() && actor.turnsBeforeMeleeReady == 0)
			{	
				var ms:String = null
				actor.meleeStep = 0
				var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actor.ACidx))
				if (isPlayer)
					ms = inventory.equipmentMeleeSoundOverride
				MgbActor.playCannedSound(MgbActor.isSoundNonNull(ms) ? ms : ap.actorXML.databag.allchar.soundWhenMelee)				
				return true
			}		
			return false
		}

		private function calculateNewPlayerPosition(stepStyleOverride:int):void
		{
			var plyr:ActiveActor = activeActors[AA_player_idx]
			
			if (G_player_action_melee)
				startMeleeIfAllowed(plyr, true)
			
			if (!plyr.inMelee())
			{
				// These actions can only be happen if the player is *not* in the middle of melee. 
				// TODO: Should we queue up the keyboard input anyway?

				if (G_player_action_shoot && actorCanShoot(AA_player_idx))
				{
					actorCreateShot(AA_player_idx)
					G_player_action_shoot = false
				}
	
				if ((stepStyleOverride == 0 || (stepStyleOverride == -1 && G_player_action_up)) && plyr.y < mapPiece.height)
				{
					plyr.y--
					plyr.stepStyle = 0
				}	
				if ((stepStyleOverride == 2 || (stepStyleOverride == -1 && G_player_action_down)) && plyr.y >= 0)
				{
					plyr.y++
					plyr.stepStyle = 2
				}
				if ((stepStyleOverride == 3 || (stepStyleOverride == -1 && G_player_action_left)) && plyr.x >= 0)
				{
					plyr.x--
					plyr.stepStyle = 3
				}	
				if ((stepStyleOverride == 1 || (stepStyleOverride == -1 && G_player_action_right)) && plyr.x < mapPiece.width)
				{
					plyr.x++;
					plyr.stepStyle = 1
				}
			}
		}
		
		private function actorCanShoot(aa_idx:int):Boolean
		{
			var rateBonus:int = (aa_idx == AA_player_idx) ? inventory.equipmentShotRateBonus : 0

			return (activeActors[aa_idx].alive && 
						(rateBonus + activeActors[aa_idx].maxActiveShots) > activeActors[aa_idx].currentActiveShots) 
		}
		
		private function actorCreateShot(aa_idx:int, stepStyleOverride:Number = NaN):void
		{
			var actor:ActiveActor = activeActors[aa_idx]
			var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, actor.ACidx))
			var spawn:String = ap.actorXML.databag.allchar.shotActor

			if (aa_idx == AA_player_idx && inventory.equipmentShotActorOverride)
				spawn = inventory.equipmentShotActorOverride

			if (!spawn || spawn == "")
			{
				MgbLogger.getInstance().logGameBug("Shot not defined for actor '"+ap.name+"'")
				return
			}

			// Spawn the shot. We need to make sure we don't shoot ourself :)
			var aa_shot_idx:int = playSpawnNewActor(loadActorByName(spawn), 
									actor.x + (actor.cellSpanX > 2 ? 1 : 0), 
									actor.y + (actor.cellSpanY > 2 ? 1 : 0), true)
			if (-1 != aa_shot_idx)
			{
				var shot:ActiveActor = activeActors[aa_shot_idx]
	
				if (isNaN(stepStyleOverride))
					shot.stepStyle = actor.stepStyle
				else
					shot.stepStyle = stepStyleOverride
				shot.stepCount = 1      	
				shot.isSliding = true			// Shot is a type of sliding item
				shot.isAShot = true				// Obviously..
				shot.moveSpeed = 1				// Special case - see note in class definition
		       	actor.currentActiveShots++
				shot.actorWhoFiredShot = aa_idx
				shot.shotRange = int(ap.actorXML.databag.allchar.shotRangeNum)
       			if (aa_idx == AA_player_idx)
					shot.shotRange += inventory.equipmentShotRangeBonus
				
				// If the actor is moving the same way as the bullet, then the bullet needs to move one step ahead
				if ((actor.yMovePerTween || actor.xMovePerTween) && shot.stepStyle == actor.stepStyle)
			    {
			        calculateNewEnemyPosition(aa_shot_idx)			// Actor's moving.. need to keep ahead of the actor
			        if (checkIfActorObstructed(aa_shot_idx, true))
			      	{
			      		destroyShot(shot)
			        	return
			       }
			    }
		        if (shot.y < 0 || shot.x < 0 || shot.x > mapPiece.width -1 || shot.y > mapPiece.height -1)
		        {
		        	// Not a valid new space, so the shot is spent
		        	destroyShot(shot)
		        	return
		        }
		        // The space is available. Convert intended move into per-tween amounts and move
		        shot.shotDamageToNPC = ap.actorXML.databag.allchar.shotDamageToNPCorItemNum
		        
       			if (aa_idx == AA_player_idx)
					shot.shotDamageToNPC += inventory.equipmentShotDamageBonus
		        
		        shot.shotDamageToPlayer = ap.actorXML.databag.allchar.shotDamageToPlayerNum
//		        shot.xMovePerTween = (shot.x - shot.fromx) * (mapPiece.actorWidth / (G_tweensPerTurn - (G_tweenCount-1)));
//	    	    shot.yMovePerTween = (shot.y - shot.fromy) * (mapPiece.actorHeight / (G_tweensPerTurn - (G_tweenCount-1)));
	    	    G_tic = null;			// Important, need to invalidate the collision detection cache. TODO Potentially just update the cells we know have changed - i.e. aai.x,aai.y
				var shotSound:String = ap.actorXML.databag.allchar.soundWhenShooting
				if (aa_idx == AA_player_idx && inventory.equipmentShotSoundOverride)
					shotSound = inventory.equipmentShotSoundOverride
				MgbActor.playCannedSound(shotSound)
		    }
		}
		
		private function destroyShot(shot:ActiveActor):void
		{
			if (!shot.alive || !shot.isAShot)
				MgbLogger.getInstance().logBug("destroyShot called on an actor which is not a shot")
        	shot.alive = false
        	shot.dyingAnimationFrameCount = 0
        	shot.renderBD = null
        	if (shot.actorWhoFiredShot != -1)
				activeActors[shot.actorWhoFiredShot].currentActiveShots--		// FIXME: Small issue here: What if the actor had since died and been respawned - fix by new code when actor dies - set all it's shots to be unowned (shot.actorWhoFiredShot = -1)
		}
		
		
		// AAi is the index into activeActors[] for this enemy/item
		// stepStyleOverride is -1 for no override, or 0..3 for an override		// TODO
		private function calculateNewEnemyPosition(AAi:int, stepStyleOverride:int = -1):void
		{
			var enemyAA:ActiveActor = activeActors[AAi]
			var enemy:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, enemyAA.ACidx))
			
			if (enemyAA.isSliding)
			{
				if (enemyAA.isAShot && enemyAA.stepCount > enemyAA.shotRange)
					destroyShot(enemyAA)
				else if (!enemyAA.isAShot && enemyAA.stepCount > int(enemy.actorXML.databag.item.pushToSlideNum))
					playStopItemSliding(enemyAA)
				else
				{
					switch (enemyAA.stepStyle)
					{
						case 0: 	enemyAA.y--;	break;			// North
						case 1: 	enemyAA.x++;	break;			// East
						case 2: 	enemyAA.y++;	break;			// South 			
						case 3: 	enemyAA.x--;	break;			// West
					}
					enemyAA.stepCount++;
				}
			}
			else if (stepStyleOverride != -1)
			{
				enemyAA.stepStyle = stepStyleOverride
				switch (enemyAA.stepStyle)
				{
					case 0: 	enemyAA.y--;	break;			// North
					case 1: 	enemyAA.x++;	break;			// East
					case 2: 	enemyAA.y++;	break;			// South 			
					case 3: 	enemyAA.x--;	break;			// West
				}
				enemyAA.stepCount++;
			}
			else if (enemyAA.moveSpeed > 0 || (enemyAA.moveSpeed < 1 && Math.random() < enemyAA.moveSpeed))
			{
				var t:int = int(enemy.actorXML.databag.npc.movementType)
				var aggroRange:int = int(enemy.actorXML.databag.npc.aggroRange)
				var tilesFromPlayerSquared:int = Math.pow(enemyAA.x - activeActors[AA_player_idx].x, 2) + Math.pow(enemyAA.y - activeActors[AA_player_idx].y, 2) 
				
				if (aggroRange)
				{
					// This will become either alMovementType_Random or alMovementType_ToPlayer - depending on proximity. Range check using pythogras' theorem 
					if (tilesFromPlayerSquared < Math.pow(aggroRange, 2))
						t = MgbActor.alMovementType_ToPlayer
				}

				switch (t)
				{
					case MgbActor.alMovementType_None:
						break;
					case MgbActor.alMovementType_Random:
						if (0 == enemyAA.stepCount || Math.random() < 0.1)
							enemyAA.stepStyle = Math.floor(Math.random() * 4);								// Choose a direction
						switch (enemyAA.stepStyle)
						{
							case 0: 	enemyAA.y--;	break;			// North
							case 1: 	enemyAA.x++;	break;			// East
							case 2: 	enemyAA.y++;	break;			// South 			
							case 3: 	enemyAA.x--;	break;			// West
						}
						enemyAA.stepCount++;
						break;
					case MgbActor.alMovementType_ToPlayer:
						if (enemyAA.x < activeActors[AA_player_idx].x)
						{
							enemyAA.x++
							enemyAA.stepStyle = 1
						}
						else if (enemyAA.x > activeActors[AA_player_idx].x)
						{
							enemyAA.x--
							enemyAA.stepStyle = 3
						}
						else 
						{
							if (enemyAA.y < activeActors[AA_player_idx].y)
							{
								enemyAA.y++
								enemyAA.stepStyle = 2
							}	
							else if (enemyAA.y > activeActors[AA_player_idx].y)
							{
								enemyAA.y--
								enemyAA.stepStyle = 0
							}
						}
						break
					case MgbActor.alMovementType_FromPlayer:
						if (enemyAA.x < activeActors[AA_player_idx].x)
						{
							enemyAA.x--
							enemyAA.stepStyle = 1
						}
						else if (enemyAA.x > activeActors[AA_player_idx].x)
						{
							enemyAA.x++
							enemyAA.stepStyle = 3
						}
						else 
						{
							if (enemyAA.y < activeActors[AA_player_idx].y)
							{
								enemyAA.y--
								enemyAA.stepStyle = 2
							}
							else if (enemyAA.y > activeActors[AA_player_idx].y)
							{
								enemyAA.y++
								enemyAA.stepStyle = 0
							}
						}
						break
					default: 
						throw new Error("Unknown Actor MovementType in "+enemy.name);
				}
				
				if (tilesFromPlayerSquared < 36)		// 36 = 6^2 - hardcoded but reasonable :)
				{
					var meleeDamage1:int = int(enemy.actorXML.databag.allchar.meleeDamageToPlayerNum)
					var meleeDamage2:int = int(enemy.actorXML.databag.allchar.meleeDamageToNPCorItemNum)
					if (meleeDamage1 > 0 || meleeDamage2 > 0)
						startMeleeIfAllowed(enemyAA, false)
				}
				
				if (actorCanShoot(AAi))
				{
					t = int(enemy.actorXML.databag.npc.shotAccuracyType)
					var shotStepStyle:int
					if (t == MgbActor.alShotAccuracy_random || t == MgbActor.alShotAccuracy_poor)
						shotStepStyle = int(Math.random() * 4)
					else // alShotAccuracy_good or alShotAccuracy_great
					{
						if ((enemyAA.x - activeActors[AA_player_idx].x) < -1)
							shotStepStyle = 1
						else if ((enemyAA.x - activeActors[AA_player_idx].x) > 1)
							shotStepStyle = 3
						else 
						{
							if ((enemyAA.y - activeActors[AA_player_idx].y) < -1)
								shotStepStyle = 2
							else if ((enemyAA.y - activeActors[AA_player_idx].y) > 1)
								shotStepStyle = 0
						}
					}
					actorCreateShot(AAi, shotStepStyle)
				}
			}
			// TODO: Needs to be much smarter, also need to handle speed > 1			
		}
		
		// Each layer is handled specially as follows:
		// 1. layerBackground is just held in the mapPiece.mapLayerActors[layerBackground] array of cells
		// 2. layerActive is held in the activeActors array
		// 3. layerForeground isn't checked - by convention it's just for visual effect
		// Note that if the actor is the player and the obstruction is a pushable item, then we say not-obstructed.. 
		//		...the tweening moves will resolve what action should occur
		private function checkIfActorObstructed(AAidxToCheck:int, checkActives:Boolean = false):Boolean
		{
			var obstructed:Boolean = false
			var aa:ActiveActor = activeActors[AAidxToCheck]			// This is the actor that wants to move
			var aa_p:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, aa.ACidx))			// this is it's actor piece
			var cX:int = aa.cellSpanX + aa.x
			var cY:int = aa.cellSpanY + aa.y
			var mW:int = mapPiece.width
			var mH:int = mapPiece.height

			for (var x:int = aa.x; x < cX && x < mW && obstructed == false; x++)
			{
				for (var y:int = aa.y; y < cY && y < mH && obstructed == false; y++)
				{
					var cellToCheck:int = cell(x,y)		// put this in a var to eliminate multiple lookups.

					// 1. Check the background layer. These don't change so we can work out behavior by the generic actorCache[] properties
					if (backgroundBlockageMap.isEntityBlocked(x, y, (AA_player_idx == AAidxToCheck ? BlockageMap.ENTITY_PLAYER : BlockageMap.ENTITY_NPC)))
						obstructed = true 
/*****				var ACidx:String = mapPiece.mapLayerActors[MgbMap.layerBackground][cellToCheck]
					if (null != ACidx)
		 			{
						var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
						if (null != ap)
						{
							var itemAct:int = ap.actorXML.databag.item.itemActivationType
							if (AA_player_idx == AAidxToCheck)
							{
								// Does this thing obstruct a player?
								if (itemAct == MgbActor.alItemActivationType_BlocksPlayer || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
									obstructed = true
							}
							else
							{
								// Does this thing obstruct an enemy?
								if (itemAct == MgbActor.alItemActivationType_BlocksNPC || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
									obstructed = true
							}
						}
					}
****/
					// 2. Check the activeActors. To do this we take advantage of the G_tic table
					if (checkActives && !obstructed)
					{
						if (null == G_tic)
							generateTicTable()					// Positions have changed enough that we have to update the tic table
						if (G_tic[cellToCheck] && G_tic[cellToCheck].length > 0)
						{
						    for (var i:int = 0; i < G_tic[cellToCheck].length && !obstructed; i++)
						    {
							    var AAInCell:int = G_tic[cellToCheck][i]
							    var ACidx:String = activeActors[AAInCell].ACidx
								var ap:MgbActor = MgbActor(actorCache.getPieceIfCached(mapPiece.userName, mapPiece.projectName, ACidx))
								if (activeActors[AAInCell].alive && AAInCell != AAidxToCheck)
								{
									var itemAct:int = ap.actorXML.databag.item.itemActivationType
									if (AA_player_idx == AAidxToCheck)
									{
										// Does this thing obstruct a player? (Slidable blocks aren't obstructions...)
										if (	(itemAct == MgbActor.alItemActivationType_BlocksPlayer || 
												 itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
											 && (!(ap.actorXML.databag.all.actorType == MgbActor.alActorType_NPC && 
												   ap.actorXML.databag.itemOrNPC.destroyableYN == 1 &&
												   aa_p.actorXML.databag.allchar.touchDamageToNPCorItemNum > 0
											     ))
											 && (ap.actorXML.databag.all.actorType != MgbActor.alActorType_Item || 
											 	 0 == ap.actorXML.databag.item.pushToSlideNum)
											)
											obstructed = true
									}
									else
									{
										// Does this thing obstruct an enemy?
										if (int(aa_p.actorXML.databag.all.actorType) == MgbActor.alActorType_Shot &&
										   (int(ap.actorXML.databag.all.actorType) == MgbActor.alActorType_Player ||
										    int(ap.actorXML.databag.all.actorType) == MgbActor.alActorType_NPC))
										{
											// enemies & players don't block bullets :)  - they get handled in the collision code
										} else if (int(ap.actorXML.databag.all.actorType) == MgbActor.alActorType_Shot &&
										   (int(aa_p.actorXML.databag.all.actorType) == MgbActor.alActorType_Player ||
										    int(aa_p.actorXML.databag.all.actorType) == MgbActor.alActorType_NPC))
										{
											// again, enemies & players don't block bullets - just checking with the order switched
										} else if (AA_player_idx == AAInCell)
										{
											// NPC is trying to occupy the same space as the player... is this OK?
											if (int(aa_p.actorXML.databag.npc.canOccupyPlayerSpaceYN) == 1)
												obstructed = false
											else
												obstructed = true
										} else if (itemAct == MgbActor.alItemActivationType_BlocksNPC || itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC)
											obstructed = true
									}
								}
						    }
						}
					}
				}
			}
			
			return obstructed
		}

		// With no parameters (or -1,-1), this function just uses the default player position (activeActors[AA_player_idx].x, activeActors[AA_player_idx].y)
		public function scrollMapToSeePlayer(overrideX:int = -1, overrideY:int = -1):void
		{
			var margin:int = 5
			var sx:int = overrideX == -1 ? activeActors[AA_player_idx].x : overrideX
			var sy:int = overrideY == -1 ? activeActors[AA_player_idx].y : overrideY
			if (parent is Container)
			{
				G_HSPdelta = 0
				G_VSPdelta = 0
				var c:Container = Container(parent)
				var w:int = width - c.maxHorizontalScrollPosition
				var h:int = height- c.maxVerticalScrollPosition
				var maxHSP_toSeePlayer:int = (sx-margin) * MgbSystem.tileMinWidth					// Maximum Horizontal Scroll Position to see player
				var maxVSP_toSeePlayer:int = (sy-margin) * MgbSystem.tileMinWidth					// Maximum Vertical Scroll Position to see player
				if (c.horizontalScrollPosition > maxHSP_toSeePlayer)
					G_HSPdelta = ((maxHSP_toSeePlayer) - c.horizontalScrollPosition)/G_tweensPerTurn;	// Scroll left if needed
				if (c.verticalScrollPosition > maxVSP_toSeePlayer)
					G_VSPdelta = ((maxVSP_toSeePlayer) - c.verticalScrollPosition)/G_tweensPerTurn;	// Scroll up if needed

				var minHSP_toSeePlayer:int = ((sx+1+margin) * MgbSystem.tileMinWidth) - w;				// Minimum Horizontal Scroll Position to see player
				var minVSP_toSeePlayer:int = ((sy+1+margin) * MgbSystem.tileMinHeight) - h;			// Minimum Vertical Scroll Position to see player
				if (minHSP_toSeePlayer > 0 && c.horizontalScrollPosition < minHSP_toSeePlayer)				
					G_HSPdelta = ((minHSP_toSeePlayer) - c.horizontalScrollPosition) / G_tweensPerTurn;	// Scroll right if needed
				if (minVSP_toSeePlayer > 0 && c.verticalScrollPosition < minVSP_toSeePlayer)				
					G_VSPdelta = ((minVSP_toSeePlayer) - c.verticalScrollPosition) / G_tweensPerTurn;		// Scroll down if needed
			}
		}
		
		[Bindable] public var gameStatusString:String = "Please load a game";
		[Bindable] public var gameStatusString2:String = "";
		private var gameStatusString2Timer:Timer;
		
		public function setGameStatusString(str:String):String
		{
			gameStatusString  = str;
			return gameStatusString;
		}
		
		public function setGameStatusString2(str:String, secondsToShowFor:int = 7):String
		{
			gameStatusString2 = str;
			if (gameStatusString2Timer)
				gameStatusString2Timer.reset()
			else
			{
				gameStatusString2Timer = new Timer(secondsToShowFor * 1000, 1)
				gameStatusString2Timer.addEventListener(TimerEvent.TIMER_COMPLETE, clearGameStatusString2)
			}
			if (str && str.length > 0)
			{
				gameStatusString2Timer.delay = secondsToShowFor * 1000
				gameStatusString2Timer.start()
			}	
			return str;
		}
		
		private function clearGameStatusString2(e:Event = null):void
		{
			setGameStatusString2(null)
		}

	}
}


// Re-import since we're now outside the package
import com.mgb.data.*;
import flash.display.Bitmap;
import flash.display.BitmapData;
import flash.utils.ByteArray;
import mx.messaging.channels.StreamingAMFChannel;
import flash.events.TimerEvent;

class MapItem
{
	public var actorName:String;				// null or "" for empty
	public var actorPiece:MgbActor;
	public var tilePiece:MgbTile;				// Pointer to the current tilePiece - these will typically reside in tileCache
}


class ActorCollision
{
	public var AA1:int									// Index of Actor#1 involved in collision
	public var AA2:int									// Index of Actor#2 involved in collision
	public function ActorCollision(a1:int, a2:int)
	{
		AA1 = a1; AA2 = a2;
	}
}


class SavedGame
{
	import com.mgb.controls.Inventory
	
	private var ba:ByteArray
	private const hdrString:String = "MGB_SAVED_GAME_V001"
	
	
	// Player stats (health, score, lives, ...)
	// Inventory & Equipment
	// Current map & location
	// Respawn table
	// Current background music (and for fun, current position and number of remaining plays :)
	
	public function encodeGameState(	playerActor:ActiveActor, 
										inventory:Inventory,
										mapname:String,
										x:int, y:int,
										respawnMemory:Array,
										musicPlaying:String):void
	{
		ba = new ByteArray
		ba.writeUTF(hdrString)
		inventory.writeBytes(ba)
		/// UNFINISHED.. CALLUM DECIDEDED HE DIDN'T CARE... SIGH...
	}
}

class BlockageMap
{
	private var cells:Array
	private var width:int
	private var height:int
	
	static public const ENTITY_PLAYER:int = 0
	static public const ENTITY_NPC:int = 1
	
	public function reset(w:int, h:int):void
	{
		cells = new Array(w * h)
		width = w
		height = h
	}
	
	public function blockEntity(x:int, y:int, entityIndex:int, w:int = 1, h:int = 1):void
	{
		for (var i:int = 0; i < w; i++)
		{
			for (var j:int = 0; j < h; j++)
			{
				if (x+i < width && y+j < height)
				{
//					trace("block "+(x+i)+","+(y+j)+" to "+entityIndex)
					var c:int = cell(x+i, y+j)
					var v:int = cells[c]
					cells[c] = v | (1 << entityIndex)
				}
			}
		}
	}
	
	public function isEntityBlocked(x:int, y:int, entityIndex:int):Boolean
	{
		var c:int = cell(x, y)
		var v:int = cells[c]
		return (v & (1 << entityIndex)) != 0
	} 

	private function cell(x:int, y:int):int
	{
		if (x > width || y > height)
			trace("Incorrect size in BlockageMap")
		return y*width + x		// Arranged in rows
	}
}