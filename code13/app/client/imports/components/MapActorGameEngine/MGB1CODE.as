

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
