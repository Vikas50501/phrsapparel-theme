REELS ASSETS — drop your files here
====================================

This folder expects 6 reel videos and matching poster images:

  reel-1.mp4 + reel-1.jpg
  reel-2.mp4 + reel-2.jpg
  reel-3.mp4 + reel-3.jpg
  reel-4.mp4 + reel-4.jpg
  reel-5.mp4 + reel-5.jpg
  reel-6.mp4 + reel-6.jpg

RECOMMENDED SPECS
-----------------
Video:
  - Format: MP4 (H.264)
  - Aspect ratio: 9:16 (vertical) — same as Instagram Reels
  - Resolution: 720x1280 or 1080x1920
  - Duration: 5-15 seconds (loops)
  - File size: under 2 MB each (compress for web)
  - Audio: NOT needed (autoplay requires muted anyway)

Poster image (shown while video loads):
  - JPG, same 9:16 aspect ratio
  - Just a still frame from the video works

HOW TO GET YOUR INSTAGRAM REELS AS MP4
---------------------------------------
Option 1: Re-export from your phone
  - Open your reel in Instagram
  - Tap "..." -> "Save" (saves to camera roll as MP4)
  - Transfer to computer, drop here

Option 2: Re-upload via Meta Business Suite
  - You can download your own posted reels from there

Option 3: Compress for web
  - Use HandBrake (free) or ffmpeg:
    ffmpeg -i input.mp4 -vf "scale=720:1280" -c:v libx264 -crf 28 -preset slow -an reel-1.mp4
  - The -an flag strips audio (smaller file, autoplay works)

CHANGING THE NUMBER OF REELS
----------------------------
Open index.html, find <!-- Reel 1 --> through <!-- Reel 6 -->.
Copy or delete blocks to add/remove reels.

CHANGING TAGS & CAPTIONS
------------------------
Each reel card has:
  <span class="reel-card__tag">Before It Happens</span>   <- product tag
  <div class="reel-card__caption"><p>Caption text...</p></div>

Edit these to point reels to specific products or themes.

MAKING TAGS LINK TO PRODUCTS (advanced)
----------------------------------------
Currently the whole card links to your Instagram.
To make the product tag link to the shop page instead:

  Change the <a> wrapping each .reel-card to a <div>, then add:
  <a href="shop/before-it-happens.html" class="reel-card__shop-link">...</a>
  
  (Tell Claude if you want this — small change.)
